const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(requireRole('JOURNALIST'));

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-5);
}

// List my articles
router.get('/', (req, res) => {
  const articles = db.prepare(`
    SELECT articles.*, categories.name AS category_name
    FROM articles
    LEFT JOIN categories ON articles.category_id = categories.id
    WHERE author_id = ?
    ORDER BY articles.updated_at DESC
  `).all(req.session.user.id);

  res.render('dashboard-writer', { articles, user: req.session.user });
});

// New story form
router.get('/new', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.render('story-form', {
    article: null,
    categories,
    user: req.session.user,
    formAction: '/dashboard/writer/new'
  });
});

router.post('/new', upload.single('cover_image_file'), (req, res) => {
  const { title, category_id, content, cover_image_url, action } = req.body;
  const status = action === 'submit' ? 'PENDING_REVIEW' : 'DRAFT';

  const imageUrl = req.file ? req.file.path : (cover_image_url || null);
  const snippet = content.replace(/\s+/g, ' ').trim().slice(0, 160);

  db.prepare(`
    INSERT INTO articles (title, slug, content, snippet, cover_image_url, status, author_id, category_id, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
  `).run(title, slugify(title), content, snippet, imageUrl, status, req.session.user.id, category_id || null);

  res.redirect('/dashboard/writer');
});

// Edit story (only own, only if not already published)
router.get('/edit/:id', (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ? AND author_id = ?')
    .get(req.params.id, req.session.user.id);

  if (!article) return res.status(404).send('Story not found.');

  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.render('story-form', {
    article,
    categories,
    user: req.session.user,
    formAction: `/dashboard/writer/edit/${article.id}`
  });
});

router.post('/edit/:id', upload.single('cover_image_file'), (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ? AND author_id = ?')
    .get(req.params.id, req.session.user.id);

  if (!article) return res.status(404).send('Story not found.');

  const { title, category_id, content, cover_image_url, action } = req.body;
  const status = action === 'submit' ? 'PENDING_REVIEW' : 'DRAFT';
  const imageUrl = req.file ? req.file.path : (cover_image_url || article.cover_image_url);
  const snippet = content.replace(/\s+/g, ' ').trim().slice(0, 160);

  db.prepare(`
    UPDATE articles
    SET title = ?, content = ?, snippet = ?, cover_image_url = ?, status = ?, category_id = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(title, content, snippet, imageUrl, status, category_id || null, article.id);

  res.redirect('/dashboard/writer');
});

module.exports = router;
