const User = require('../models/user.js');
var passport = require('passport');
// var mongoose = require('mongoose');
var express = require('express');
// var localStrategy = require('passport-local');
// var passportLocalMongoose = require('passport-local-mongoose');
var router = express.Router();

var isLoggedIn = require('../mw/isLoggedIn');
var isAdmin = require('../mw/isAdmin.js');
/* GET signup form  */
router.get('/register', isLoggedIn, isAdmin, function(req, res, next) {
  res.render('signup.ejs');
});
// POST New User
router.post('/register', isLoggedIn, isAdmin, function(req, res, next) {
  var newUser = new User({
    username: req.body.username,
    email: req.body.email
  });
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      console.log(`In register ${err.message}`);
      req.flash('error', err.message);
      return res.render('signup.ejs');
    }
    req.logOut();
    passport.authenticate('local')(req, res, function() {
      req.flash('success', 'Welcome to Music Sheet ' + user.username);
      // console.log(user);
      res.redirect('/book');
    });
    // res.redirect("/login");
  });
});
/* GET login form. */
router.get('/login', (req, res, next) => {
  // console.log(req.flash('error'));
  if (req.user) {
    req.flash('error', 'you are already logged in.');
    res.redirect('/');
  } else {
    res.render('login.ejs');
  }
});
// LOGING IN
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/user/login'
  }),
  function(req, res) {
    req.flash('success', `Hello `);
    res.redirect('/');
  }
);
// LOGIN OUT
router.get('/logout', function(req, res) {
  if (req.user) {
    // console.log(req.user);
    req.logout();
    req.flash('success', 'Logged out successfully!');
    res.redirect('/');
  } else {
    res.redirect('/');
  }
});
module.exports = router;
