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
// LOGING IN
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/user/login'
  }),
  function (req, res) {
    req.flash('success', `សួរស្តីី`);
    res.redirect('/');
  }
);

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

// ---- password reset for own account ----
// show change-password form
router.get('/reset', isLoggedIn, function (req, res) {
  res.render('resetPassword.ejs');
});

// handle change-password submission
router.post('/reset', isLoggedIn, function (req, res) {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) {
    req.flash('error', 'New passwords do not match');
    return res.redirect('/user/reset');
  }
  // passport-local-mongoose provides changePassword on user instances
  req.user.changePassword(oldPassword, newPassword, function (err) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/user/reset');
    }
    req.flash('success', 'Password changed successfully.');
    res.redirect('/');
  });
});

// ---- admin-only list and reset for other users ----
// show all registered users (administrators only)
router.get('/list', isLoggedIn, isAdmin, async function (req, res) {
  try {
    const users = await User.find({});
    res.render('userList.ejs', { users });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/');
  }
});

// render reset form by id
router.get('/reset/:id', isLoggedIn, isAdmin, async function (req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/user/list');
    }
    res.render('resetPasswordAdmin.ejs', { user });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/user/list');
  }
});

// process admin reset
router.post('/reset/:id', isLoggedIn, isAdmin, async function (req, res) {
  const { newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) {
    req.flash('error', 'Passwords do not match');
    return res.redirect('back');
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('back');
    }
    user.setPassword(newPassword, async function (err) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      await user.save();
      req.flash('success', 'Password reset for ' + user.username);
      res.redirect('/');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('back');
  }
});

module.exports = router;
