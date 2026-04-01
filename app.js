const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const flash = require('connect-flash');
const User = require('./models/user');


//Connect to MongoDB server
const dbUrl = process.env.DATABASEURL;

if (!dbUrl) {
  console.error('ERROR: DATABASEURL environment variable is not set.');
  console.error('Please provide a valid MongoDB connection string in the DATABASEURL secret.');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((err) => {
    console.error('ERROR: Failed to connect to MongoDB');
    console.error('Error details:', err.message);
    console.error('\nPlease check:');
    console.error('1. Is your MongoDB cluster running and accessible?');
    console.error('2. Is the DATABASEURL connection string correct?');
    console.error('3. Have you whitelisted the Replit IP address in MongoDB Atlas?');
    console.error('\nCurrent DATABASEURL host:', dbUrl.match(/@([^/]+)/)?.[1] || 'unknown');
    process.exit(1);
  });

const app = express();

// Connect to local Server

// Bring in Router
var usersRouter = require('./routes/users');
var indexRouter = require('./routes/index');
var bookRouter = require('./routes/books');
var songRouter = require('./routes/songs');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(require('helmet')());
app.use(logger('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());

//Express-session Configuration//////
const sessionSecret = process.env.SESSION_SECRET || 'Ut justo sem, pharetra sit amet convallis id, aliquet a augue.';
if (!process.env.SESSION_SECRET) {
  console.warn('WARNING: SESSION_SECRET not set. Using default (insecure for production).');
  console.warn('Please add a SESSION_SECRET to your Replit secrets for better security.');
}
app.use(
  require('cookie-session')({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

//passport initialization
app.use(passport.initialize());
app.use(passport.session());

// customize local strategy to accept username or email (case-insensitive)
const authenticate = User.authenticate();
passport.use(new LocalStrategy({ usernameField: 'username' }, function (username, password, done) {
  // look up by username or email
  const search = {
    $or: [
      { username: new RegExp('^' + username + '$', 'i') },
      { email: new RegExp('^' + username + '$', 'i') }
    ]
  };
  User.findOne(search, function (err, user) {
    if (err) { return done(err); }
    if (!user) {
      // no such account
      return done(null, false, { message: 'Incorrect username or email.' });
    }
    // delegate to passport-local-mongoose's authenticate function
    authenticate(user.username, password, function (err, authenticatedUser, options) {
      if (err) { return done(err); }
      if (!authenticatedUser) {
        // wrong password
        return done(null, false, { message: options && options.message ? options.message : 'Incorrect password.' });
      }
      return done(null, authenticatedUser);
    });
  });
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// End passport//

//Passing Current User around to all routes //By doing it here so i don't
//have to put current user in every routes manually
app.use(function (req, res, next) {
  res.locals.isUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.newbook = 'false';
  res.locals.page_title = 'សូម​សរសើរ​នាម​ទ្រង់';
  next();
});

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

//Making Uploads folder available publicly
app.use('/uploads', express.static('uploads'));

// Router
app.use('/', indexRouter);
app.use('/book', bookRouter);
app.use('/song', songRouter);
app.use('/user', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
