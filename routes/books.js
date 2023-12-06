var fs = require('fs');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var isLoggedIn = require('../mw/isLoggedIn.js');
var isAdmin = require('../mw/isAdmin.js');
var mongoose = require('mongoose');
// ==========MULTER CONFIG ===========
// Setup storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  },
});
// Setup Filter
const fileFilter = function (req, file, cb) {
  if (file.mimetype === 'image/jpg' || 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
//Now time to upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});
// ==========MULTER CONFIG ===========

var Songbook = require('../models/songbook');
var Songlist = require('../models/songlists');

/* GET home page. */
router.get('/', async function (req, res, next) {
  var songbooks = await Songbook.find();

  if (songbooks.length <= 0) {
    res.render('books.ejs', {
      songbooks: songbooks,
      bookCount: songbooks.length,
    });
  } else {
    res.render('books.ejs', {
      songbooks: songbooks,
      bookCount: songbooks.length,
    });
  }
});
// Get NEW BOOK FORM
router.get('/new', isLoggedIn, function (req, res, next) {
  res.render('newbook', { newbook: 'true' });
});
// POST NEW BOOK
router.post(
  '/',
  isLoggedIn,
  upload.single('bookCoverImg'),
  function (req, res, next) {
    //Add user who add book to songBook document
    var user = {
      id: req.user._id,
      username: req.user.username,
    };

    var songbook = new Songbook({
      bookName: req.body.bookName,
      numberOfSong: req.body.numberOfSong,
      bookDescription: req.body.bookDescription,
      bookBy: req.body.bookBy,
      bookCoverImg: req.file.path,
      bookYear: req.body.bookYear,
      user: user,
    });

    // Save Book
    songbook
      .save()
      .then(() => {
        req.flash(
          'success',
          `បញ្ជូល​សៀវភៅ ${songbook.bookName} បានដោយ​ជោគ​ជ័យ!`
        );
        res.redirect('/book');
      })
      .catch((err) => {
        if (err) {
          req.flash('error', `មិន​អាច​បញ្ជូលសៀវភៅ${songbook.bookName}​បាន​ទេ!`);
          res.render('newbook.ejs');
        }
      });
  }
);
// Get book to update
router.get('/:bid/edit', isLoggedIn, isAdmin, function (req, res, next) {
  //Get Book Data to put to update form
  const bookId = req.params.bid;
  Songbook.findOne({ _id: bookId })
    .exec()
    .then((book) => {
      if (book !== null) {
        res.render('bookEdit.ejs', { book: book, newbook: 'true' });
      } else {
        res.redirect('/book');
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

//Get all Songs from a book
router.get('/:bid/song', async function (req, res, next) {
  //Convert book ID ot ObjectId first otherwise it won't work
  const bookId = mongoose.Types.ObjectId(req.params.bid);
  const page_title = await Songbook.findOne({ _id: bookId });
  //Find all songs from a specific book using book.id that is embedded in song documents then
  //order found songs by song Id by setting songId:1
  var songLists = await Songlist.find({ 'book._id': bookId }).sort({
    songId: 1,
  });
  // console.log(`Song list--> ${songLists.length}`);
  if (songLists.length <= 0) {
    res.render('songlister.ejs', {
      songlists: songLists,
      // isUser: req.user,
      page_title: page_title.bookName,
      showmore: false, //For Pagination option
    });
  } else {
    res.render('songlister.ejs', {
      songlists: songLists,
      page_title: page_title.bookName,
      // isUser: req.user,
      showmore: false, //For Pagination option
    });
  }
});

// // UPDATE Song BOOk
router.put('/:bid', isLoggedIn, function (req, res, next) {
  // get data from form to update
  //User who make the update to book
  var user = {
    id: req.user._id,
    username: req.user.username,
  };
  var updateSongbook = {
    bookName: req.body.bookName,
    numberOfSong: req.body.numberOfSong,
    bookDescription: req.body.bookDescription,
    bookBy: req.body.bookBy,
    bookYear: req.body.bookYear,
    user: user,
  };
  // console.log(updateSongbook);
  //findByIdAndUpdate
  Songbook.findByIdAndUpdate(req.params.bid, updateSongbook)
    .then((updated) => {
      if (updated) {
        res.redirect('/book');
      } else {
        res.redirect('/book/' + req.params.bid);
      }
    })
    .catch((err) => {
      if (err) {
        console.log(err);
      }
    });
});
// DELETE Song Book
router.delete('/:bid', isLoggedIn, isAdmin, function (req, res, next) {
  const bookIdToDelete = req.params.bid;
  // Find one book that match the ID to delete
  Songbook.findOneAndDelete({ _id: bookIdToDelete })
    .exec()
    .then((deletedBook) => {
      //If no book to be deleted.
      if (deletedBook === undefined) {
        req.flash('error', 'No books were deleted');
        res.render('back');
      } else {
        //Remove book Cover for Uploads folder
        fs.unlink(deletedBook.bookCoverImg, (err) => {
          if (err) {
            console.log('Cover file does not exist');
          }
        });
        //Find and Remove all songs that are associated with that book
        Songlist.deleteMany({
          'book._id': bookIdToDelete,
        })
          .exec()
          .then((results) => {
            if (results.deletedCount > 0) {
              req.flash(
                'success',
                `សៀវភៅ ${deletedBook.bookName} is deleted and ${results.deletedCount} songs is deleted along with the book.`
              );
              res.redirect('back');
            } else {
              req.flash(
                'success',
                `សៀវភៅ ${deletedBook.bookName} is deleted and there is ${results.deletedCount} song to delete.`
              );
              res.redirect('/book');
            }
          })
          .catch((err) => {
            if (err) {
              console.log(err);
              res.redirect('/book');
            }
          });
      }
    })
    .catch((err) => {
      if (err) {
        req.flash('error', 'Oop! Something wrong');
        res.redirect('back');
      }
    });
});

module.exports = router;
