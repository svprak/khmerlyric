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
      //console.log(`In register ${err.message}`);
      req.flash('error', err.message);
      return res.render('signup.ejs');
    }
    req.logOut();
    passport.authenticate('local')(req, res, function() {
      req.flash('success', 'សួរស្តី' + user.username);
      // console.log(user);
      res.redirect('/book');
    });
    // res.redirect("/login");
  });
});

/* reset username start 0*/
// WARNING: Delete this route after you use it!
router.get('/emergency-reset', async (req, res) => {
    try {
        // 1. Find the user by their username
        const user = await User.findOne({ username: 'svpuser' });

        if (!user) {
            return res.send("User not found. Check the username in your DB.");
        }

        // 2. Use the Passport-Local-Mongoose helper to set the password
        // This automatically handles the salt and hash for you!
        await user.setPassword('jst#1mont');

        // 3. Save the user back to the database
        await user.save();

        res.send("Success! Password for " + user.username + " is now: jst#1mont. NOW DELETE THIS ROUTE FROM YOUR CODE.");
    } catch (err) {
        res.send("Error: " + err.message);
    }
});
/* reset username end */
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
  function(req, res) {
    req.flash('success', `សួរស្តីី`);
    res.redirect('/');
  }
);

// LOG OUT
router.get('/logout', function(req, res) {
  req.logout(function(err){
    if(!err){
      req.flash('error', 'ចាក​ចេញ​បាន​សម្រេចហើយ!!!');
      res.redirect('/');  
    }else {
      req.flash('error', 'មានបញ្ហាចេញមិនរួចទេ!!!');
    }
  });
});

module.exports = router;
