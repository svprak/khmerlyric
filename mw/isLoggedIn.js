module.exports = function (req, res, next) {
  if (req.isAuthenticated() && req.url != '/user/login') {
    // console.log(`isAdmin: ${req.user.role.admin}`);
    return next();
  }
  // remember where user was trying to go, so we can redirect after login
  req.session.returnTo = req.originalUrl;
  req.flash('error', 'សូម​ចូល​ក្នុង​ប្រពន្ធ័ជា​មុន​សិន!!!');
  res.redirect('/user/login');
};
