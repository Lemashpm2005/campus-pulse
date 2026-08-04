const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');

function logUserIn(req, user) {
  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url,
    is_chief: !!user.is_chief
  };
}

function redirectByRole(user, res) {
  if (user.role === 'JOURNALIST') return res.redirect('/dashboard/writer');
  if (user.role === 'EDITOR') return res.redirect('/dashboard/editor');
  return res.redirect('/');
}

router.get('/login', (req, res) => {
  res.render('login', { error: null, user: req.session.user || null });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.render('login', { error: 'Invalid email or password.', user: null });
  }

  if (!user.approved) {
    return res.render('login', {
      error: 'Your account is still awaiting editor approval. Please check back soon.',
      user: null
    });
  }

  if (!user.active) {
    return res.render('login', {
      error: 'This account has been deactivated. Contact an editor if you believe this is a mistake.',
      user: null
    });
  }

  logUserIn(req, user);
  redirectByRole(user, res);
});

// Lecturer quick-demo buttons
router.post('/login/demo/:role', (req, res) => {
  const role = req.params.role === 'editor' ? 'EDITOR' : 'JOURNALIST';
  const email = role === 'EDITOR' ? 'demo-editor@campuspulse.test' : 'demo-journalist@campuspulse.test';
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    return res.render('login', { error: 'Demo account not found. Run "npm run init-db" first.', user: null });
  }

  logUserIn(req, user);
  redirectByRole(user, res);
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// ---------- Journalist self-registration ----------
router.get('/register', (req, res) => {
  res.render('register', { error: null, success: null, user: req.session.user || null });
});

router.post('/register', (req, res) => {
  const { name, email, password, confirm_password } = req.body;

  if (!name || !email || !password) {
    return res.render('register', { error: 'All fields are required.', success: null, user: null });
  }
  if (password !== confirm_password) {
    return res.render('register', { error: 'Passwords do not match.', success: null, user: null });
  }
  if (password.length < 6) {
    return res.render('register', { error: 'Password must be at least 6 characters.', success: null, user: null });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.render('register', { error: 'An account with that email already exists.', success: null, user: null });
  }

  const password_hash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (name, email, password_hash, role, avatar_url, bio, title, approved)
    VALUES (?, ?, ?, 'JOURNALIST', '/img/placeholder-avatar.svg', '', 'Journalist & Student Reporter', 0)
  `).run(name, email, password_hash);

  res.render('register', {
    error: null,
    success: 'Your account request has been submitted. An editor must approve it before you can log in.',
    user: null
  });
});

module.exports = router;
