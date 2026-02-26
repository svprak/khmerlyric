module.exports = function (req, res, next) {
  if (req.isAuthenticated() && req.url != '/user/login') {
    // console.log(`isAdmin: ${req.user.role.admin}`);
    return next();
  }
  req.flash('error', 'សូម​ចូល​ក្នុង​ប្រពន្ធ័ជា​មុន​សិន!!!');
  res.redirect('/user/login');
};
