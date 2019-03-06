module.exports = function(req, res, next) {
  if (req.isAuthenticated() && req.user.role.admin == true) {
    return next();
  }
  req.flash(
    'error',
    'You are not authorized for that operation, contact your administrator for more information.'
  );
  res.redirect('back');
};
