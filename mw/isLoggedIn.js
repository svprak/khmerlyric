module.exports = function(req, res, next) {
  if (req.isAuthenticated() && req.url != '/user/login') {
    // console.log(`isAdmin: ${req.user.role.admin}`);
    return next();
  }
  req.flash('error', 'Please Login!!!');
  res.redirect('/user/login');
};
