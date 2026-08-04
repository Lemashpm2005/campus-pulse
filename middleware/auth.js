function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    if (req.session.user.role !== role) {
      return res.status(403).send('Forbidden: you do not have access to this page.');
    }
    next();
  };
}

function requireChiefEditor(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  if (req.session.user.role !== 'EDITOR' || !req.session.user.is_chief) {
    return res.status(403).send('Forbidden: only the Chief Editor can do this.');
  }
  next();
}

module.exports = { requireLogin, requireRole, requireChiefEditor };
