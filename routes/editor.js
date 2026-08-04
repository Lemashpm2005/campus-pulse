const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireRole, requireChiefEditor } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(requireRole('EDITOR'));

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-5);
}

// Queue + live list + pending registrations + team + editor's own articles
router.get('/', (req, res) => {
  const pending = db.prepare(`
    SELECT articles.*, users.name AS author_name, categories.name AS category_name
    FROM articles
    JOIN users ON articles.author_id = users.id
    LEFT JOIN categories ON articles.category_id = categories.id
    WHERE articles.status = 'PENDING_REVIEW'
    ORDER BY articles.updated_at ASC
  `).all();

  const published = db.prepare(`
    SELECT articles.*, users.name AS author_name, categories.name AS category_name
    FROM articles
    JOIN users ON articles.author_id = users.id
    LEFT JOIN categories ON articles.category_id = categories.id
    WHERE articles.status = 'PUBLISHED'
    ORDER BY articles.published_at DESC
  `).all();

  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();

  const pendingUsers = db.prepare(`
    SELECT id, name, email, role
    FROM users
    WHERE approved = 0
    ORDER BY id DESC
  `).all();

  // Journalists AND co-editors, so the chief can see/manage everyone;
  // co-editors see the same list but read-only (view handles that).
  const journalists = db.prepare(`
    SELECT id, name, email, active, role, is_chief
    FROM users
    WHERE approved = 1 AND email NOT LIKE '%@campuspulse.test' AND id != ?
    ORDER BY CASE role WHEN 'EDITOR' THEN 0 ELSE 1 END, name
  `).all(req.session.user.id);

  const myArticles = db.prepare(`
    SELECT articles.*, categories.name AS category_name
    FROM articles
    LEFT JOIN categories ON articles.category_id = categories.id
    WHERE author_id = ?
    ORDER BY articles.updated_at DESC
  `).all(req.session.user.id);

  res.render('dashboard-editor', {
    pending, published, categories, pendingUsers, journalists, myArticles,
    user: req.session.user,
    isChief: !!req.session.user.is_chief
  });
});

// Editor/co-editor writes a brand-new story
router.get('/new', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.render('story-form', {
    article: null,
    categories,
    user: req.session.user,
    formAction: '/dashboard/editor/new',
    isEditorCreate: true
  });
});

router.post('/new', upload.single('cover_image_file'), (req, res) => {
  const { title, category_id, content, cover_image_url, action } = req.body;
  const status = action === 'publish' ? 'PUBLISHED' : 'DRAFT';
  const imageUrl = req.file ? req.file.path : (cover_image_url || null);
  const snippet = content.replace(/\s+/g, ' ').trim().slice(0, 160);
  const published_at = status === 'PUBLISHED' ? new Date().toISOString() : null;

  db.prepare(`
    INSERT INTO articles (title, slug, content, snippet, cover_image_url, status, author_id, category_id, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, slugify(title), content, snippet, imageUrl, status, req.session.user.id, category_id || null, published_at);

  res.redirect('/dashboard/editor');
});

// Review/edit an article (any author) — editor/co-editor, also used for own drafts
router.get('/review/:id', (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).send('Story not found.');

  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  const isOwnUnpublishedDraft = article.author_id === req.session.user.id && article.status !== 'PUBLISHED';

  res.render('story-form', {
    article,
    categories,
    user: req.session.user,
    formAction: `/dashboard/editor/review/${article.id}`,
    isEditorReview: !isOwnUnpublishedDraft,
    isEditorCreate: isOwnUnpublishedDraft
  });
});

router.post('/review/:id', upload.single('cover_image_file'), (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).send('Story not found.');

  const { title, category_id, content, cover_image_url, action } = req.body;
  const imageUrl = req.file ? req.file.path : (cover_image_url || article.cover_image_url);
  const snippet = content.replace(/\s+/g, ' ').trim().slice(0, 160);

  let status = article.status;
  let published_at = article.published_at;
  if (article.author_id === req.session.user.id && article.status !== 'PUBLISHED' && action) {
    status = action === 'publish' ? 'PUBLISHED' : 'DRAFT';
    published_at = status === 'PUBLISHED' ? new Date().toISOString() : null;
  }

  db.prepare(`
    UPDATE articles
    SET title = ?, content = ?, snippet = ?, cover_image_url = ?, category_id = ?, status = ?, published_at = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(title, content, snippet, imageUrl, category_id || null, status, published_at, article.id);

  res.redirect('/dashboard/editor');
});

// Approve & publish — both editor and co-editor can do this
router.post('/publish/:id', (req, res) => {
  db.prepare(`
    UPDATE articles
    SET status = 'PUBLISHED', published_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `).run(req.params.id);
  res.redirect('/dashboard/editor');
});

// Reject back to draft, with feedback notes — both can do this
router.post('/reject/:id', (req, res) => {
  const { feedback_notes } = req.body;
  db.prepare(`
    UPDATE articles
    SET status = 'DRAFT', feedback_notes = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(feedback_notes || null, req.params.id);
  res.redirect('/dashboard/editor');
});

// Unpublish — both can do this
router.post('/unpublish/:id', (req, res) => {
  db.prepare(`
    UPDATE articles SET status = 'DRAFT', updated_at = datetime('now') WHERE id = ?
  `).run(req.params.id);
  res.redirect('/dashboard/editor');
});

// Delete — both can do this
router.post('/delete/:id', (req, res) => {
  db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  res.redirect('/dashboard/editor');
});

// Add a new category — both can do this
router.post('/categories', (req, res) => {
  const { name } = req.body;
  if (name && name.trim()) {
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
    try {
      db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)').run(name.trim(), slug);
    } catch (e) {
      // ignore duplicate category names
    }
  }
  res.redirect('/dashboard/editor');
});

// ---------- Chief-Editor-only actions below ----------

// Approve a pending journalist registration
router.post('/users/approve/:id', requireChiefEditor, (req, res) => {
  db.prepare('UPDATE users SET approved = 1 WHERE id = ?').run(req.params.id);
  res.redirect('/dashboard/editor');
});

// Reject (delete) a pending journalist registration
router.post('/users/reject/:id', requireChiefEditor, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ? AND approved = 0').run(req.params.id);
  res.redirect('/dashboard/editor');
});

// Deactivate a journalist OR co-editor (keeps their account + past stories, blocks future login)
router.post('/users/deactivate/:id', requireChiefEditor, (req, res) => {
  db.prepare("UPDATE users SET active = 0 WHERE id = ? AND is_chief = 0").run(req.params.id);
  res.redirect('/dashboard/editor');
});

// Reactivate a previously deactivated journalist or co-editor
router.post('/users/reactivate/:id', requireChiefEditor, (req, res) => {
  db.prepare("UPDATE users SET active = 1 WHERE id = ? AND is_chief = 0").run(req.params.id);
  res.redirect('/dashboard/editor');
});

module.exports = router;
