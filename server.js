const path = require('path');
const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
require('dotenv').config();

const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const writerRoutes = require('./routes/writer');
const profileRoutes = require('./routes/profile');
const editorRoutes = require('./routes/editor');
const { requireLogin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new FileStore({ path: path.join(__dirname, 'sessions'), logFn: function(){} }),
  secret: process.env.SESSION_SECRET || 'campus-pulse-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8 hours
}));

// Make current user available to all views without passing it manually every time
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use('/', publicRoutes);
app.use('/', authRoutes);
app.use('/dashboard/writer', requireLogin, writerRoutes);
app.use('/profile', profileRoutes);
app.use('/dashboard/editor', requireLogin, editorRoutes);

app.use((req, res) => {
  res.status(404).render('404', { user: req.session.user || null });
});

app.listen(PORT, () => {
  console.log(`Campus Pulse running at http://localhost:${PORT}`);
});
