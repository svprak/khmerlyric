module.exports = function(req, res, next) {
  if (req.isAuthenticated()) {
    // console.log(`isAdmin: ${req.user.role.admin}`);
    return next();
  }
  req.flash('error', 'Please Login!!!');
  res.redirect('/login');
};
