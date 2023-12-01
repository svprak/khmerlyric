const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const flash = require('connect-flash');

const User = require('./models/user');

const dbUrl = process.env.DATABASEURL;
// Connect to local Server
mongoose.connect(dbUrl, { useNewUrlParser: true });

// // Connect to Altast server
//var usersRouter = require('./routes/users');

const app = express();

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
  require('express-session')({
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
