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
router.get('/register', isLoggedIn, isAdmin, function (req, res, next) {
  res.render('signup.ejs');
});
// POST New User
router.post('/register', isLoggedIn, isAdmin, function (req, res, next) {
  var newUser = new User({
    username: req.body.username,
    email: req.body.email
  });
  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      //console.log(`In register ${err.message}`);
      req.flash('error', err.message);
      return res.render('signup.ejs');
    }
    req.logOut();
    passport.authenticate('local')(req, res, function () {
      req.flash('success', 'សួរស្តី' + user.username);
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
    req.flash('error', 'លោក​កំពុង​នៅ​ក្នុង​ប្រពន្ធ័​ហើយ​ពេល​នេះ');
    res.redirect('/');
  } else {
    res.render('login.ejs');
  }
});
// LOGGING IN (custom callback supports remember-me and redirect back)
router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      // authentication failed
      req.flash('error', info && info.message ? info.message : 'Login failed.');
      return res.redirect('/user/login');
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      // remember me checkbox
      if (req.body.remember) {
        // cookie-session stores session.cookie; set long expiration
        req.sessionOptions = req.sessionOptions || {};
        req.sessionOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }
      req.flash('success', `សួរស្តី ${user.username}`);
      // redirect to originally requested page or home
      const redirectTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      res.redirect(redirectTo);
    });
  })(req, res, next);
});

// LOG OUT
router.get('/logout', function (req, res) {
  req.logout(function (err) {
    if (!err) {
      req.flash('error', 'ចាក​ចេញ​បាន​សម្រេចហើយ!!!');
      res.redirect('/');
    } else {
      req.flash('error', 'មានបញ្ហាចេញមិនរួចទេ!!!');
    }
  });
});

module.exports = router;
