const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
//const session = require('express-session')
const session = require('cookie-session')
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

app.use(logger('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());

//Express-session Configuration//////
app.use(
  require('cookie-session')({
    secret: 'Ut justo sem, pharetra sit amet convallis id, aliquet a augue.',
    resave: false,
    saveUninitialized: false,
  })
);

//passport initialization
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// End passport//

//Passing Current User around to all routes //By doing it here so i don't
//have to put current user in every routes manually
app.use(function (req, res, next) {
  // console.log('app.use localuser');
  res.locals.isUser = req.user;
  // res.locals.isAdmin = req.user.role.admin;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.newbook = 'false';
  res.locals.page_title = 'សូម​សរសើរ​នាម​ទ្រង់';
  // console.log(res.locals.isUser);
  next();
});

app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json
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
  // console.log(err);
});

module.exports = app;
