const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Homepage
router.get('/', (req, res) => {
  const categorySlug = req.query.category;
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();

  let articles;
  if (categorySlug) {
    articles = db.prepare(`
      SELECT articles.*, users.name AS author_name, users.avatar_url AS author_avatar,
             categories.name AS category_name, categories.slug AS category_slug
      FROM articles
      JOIN users ON articles.author_id = users.id
      LEFT JOIN categories ON articles.category_id = categories.id
      WHERE articles.status = 'PUBLISHED' AND categories.slug = ?
      ORDER BY articles.published_at DESC
    `).all(categorySlug);
  } else {
    articles = db.prepare(`
      SELECT articles.*, users.name AS author_name, users.avatar_url AS author_avatar,
             categories.name AS category_name, categories.slug AS category_slug
      FROM articles
      JOIN users ON articles.author_id = users.id
      LEFT JOIN categories ON articles.category_id = categories.id
      WHERE articles.status = 'PUBLISHED'
      ORDER BY articles.published_at DESC
    `).all();
  }

  const hero = articles[0] || null;
  const rest = articles.slice(1);

  res.render('index', {
    hero,
    articles: rest,
    categories,
    activeCategory: categorySlug || null,
    user: req.session.user || null
  });
});

// Single article page
router.get('/news/:slug', (req, res) => {
  const article = db.prepare(`
    SELECT articles.*, users.name AS author_name, users.avatar_url AS author_avatar,
           users.title AS author_title, categories.name AS category_name, categories.slug AS category_slug
    FROM articles
    JOIN users ON articles.author_id = users.id
    LEFT JOIN categories ON articles.category_id = categories.id
    WHERE articles.slug = ? AND articles.status = 'PUBLISHED'
  `).get(req.params.slug);

  if (!article) {
    return res.status(404).render('404', { user: req.session.user || null });
  }

  let related = [];
  if (article.category_id) {
    related = db.prepare(`
      SELECT articles.*, users.name AS author_name, users.avatar_url AS author_avatar
      FROM articles
      JOIN users ON articles.author_id = users.id
      WHERE articles.status = 'PUBLISHED' AND articles.category_id = ? AND articles.id != ?
      ORDER BY articles.published_at DESC
      LIMIT 3
    `).all(article.category_id, article.id);
  }

  // If fewer than 3 related-by-category, fill the rest with other recent stories
  if (related.length < 3) {
    const excludeIds = [article.id, ...related.map(r => r.id)];
    const placeholders = excludeIds.map(() => '?').join(',');
    const fallback = db.prepare(`
      SELECT articles.*, users.name AS author_name, users.avatar_url AS author_avatar
      FROM articles
      JOIN users ON articles.author_id = users.id
      WHERE articles.status = 'PUBLISHED' AND articles.id NOT IN (${placeholders})
      ORDER BY articles.published_at DESC
      LIMIT ?
    `).all(...excludeIds, 3 - related.length);
    related = related.concat(fallback);
  }

  res.render('article', { article, related, user: req.session.user || null });
});

// Team page
router.get('/team', (req, res) => {
  const team = db.prepare(`
    SELECT name, email, title, bio, avatar_url
    FROM users
    WHERE email NOT LIKE '%@campuspulse.test' AND active = 1
    ORDER BY CASE role WHEN 'EDITOR' THEN 0 ELSE 1 END, name
  `).all();

  res.render('team', { team, user: req.session.user || null });
});

module.exports = router;
