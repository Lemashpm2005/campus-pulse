const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireLogin } = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

router.use(requireLogin);

router.get('/', (req, res) => {
  const me = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.user.id);
  res.render('profile', { me, success: null, error: null, user: req.session.user });
});

router.post('/', async (req, res) => {
  const { title, bio, avatar_data } = req.body;
  const me = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.user.id);

  let avatarUrl = me.avatar_url;

  if (avatar_data && avatar_data.startsWith('data:image/')) {
    try {
      const result = await cloudinary.uploader.upload(avatar_data, {
        folder: 'campus-pulse/avatars',
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
      });
      avatarUrl = result.secure_url;
    } catch (err) {
      console.error('Cloudinary avatar upload failed:', err.message);
      return res.render('profile', {
        me,
        success: null,
        error: 'Photo upload failed. Your bio changes were not saved either — please try again.',
        user: req.session.user
      });
    }
  }

  db.prepare(`
    UPDATE users SET title = ?, bio = ?, avatar_url = ? WHERE id = ?
  `).run(title || me.title, bio || '', avatarUrl, req.session.user.id);

  // Keep the session's avatar in sync so the header picks it up immediately
  req.session.user.avatar_url = avatarUrl;

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.user.id);
  res.render('profile', { me: updated, success: 'Profile updated.', error: null, user: req.session.user });
});

module.exports = router;
