var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Songbook = require('../models/songbook');
var Songlist = require('../models/songlists');

var isLoggedIn = require('../mw/isLoggedIn');

// Get all available songs
router.get('/', async function (req, res, next) {
  let page = req.query.page || 1;
  let prev = req.query.prev || 1;
  let isEnd = false;
  page = parseInt(page);
  prev = parseInt(prev);
  const limit = 25;
  let pageStart = page;

  try {
    var songBook = await Songbook.find();
    if (songBook.length <= 0) {
      res.redirect('/');
    } else {
      var songLists = await Songlist.find()
        .skip(page > 0 ? (page - 1) * limit : 0)
        .limit(limit);

      if (songLists.length < limit) {
        isEnd = true;
      } else {
        if (pageStart == prev) {
          prev = pageStart;
        } else {
          prev = pageStart + 1;
        }
      }
      res.render('songlister.ejs', {
        songlists: songLists,
        pageStart: pageStart,
        count: prev,
        isEnd: isEnd,
        showmore: true
      });
    }
  } catch (err) {
    req.flash('error', 'Something wrong cannot find any songs!');
    res.redirect('/');
  }
});
/* Getting form to add new song */
router.get('/new', isLoggedIn, function (req, res, next) {
  Songbook.find()
    .select('_id bookName')
    .exec()
    .then(bookNames => {
      res.render('newsong.ejs', {
        title: 'Music Sheets',
        bookNames: bookNames,
        newbook: 'true'
      });
    });
});
// POST-Insert New SONG to the selected songbook
router.post('/', isLoggedIn, async function (req, res, next) {
  //Need to choose book
  const bookId = req.body.bookId;
  if (bookId == 'default') {
    req.flash('error', 'សូម​ជ្រើស​រើស​សៀវ​ភៅ​ជា​មុន​សិន!');
    res.redirect('/song/new');
  } else {
    // this only to get the name of book => Need to find other way
    const book = await Songbook.findOne({ _id: bookId }).select('bookName _id');
    //Add user who add book
    var user = {
      id: req.user._id,
      username: req.user.username
    };
    // If songbook is changed otherwise it will just update with old data
    var newBook = {
      _id: book._id,
      bookName: book.bookName
    };
    var newSong = new Songlist({
      songId: req.body.songNumber,
      songTitleKh: req.body.songTitleKh,
      songTitleEn: req.body.songTitleEn,
      songBy: req.body.songBy,
      songLyric: req.body.songLyric,
      songType: req.body.songType,
      book: newBook,
      user: user
    });
    newSong
      .save()
      .then(() => {
        req.flash(
          'success',
          `បទលេខ ${newSong.songId} - ${newSong.songTitleKh
          } បញ្ជូល​បានដោយ​ជោគ​ជ័យ`
        );
        //Redirect back to add new song page
        res.redirect('/song/new');
      })
      .catch((err) => {
        req.flash(
          'error',
          `Something wrong: បទលេខ ${newSong.songId} - ${newSong.songTitleKh
          } មិនអាច​បញ្ជូល​បានទេ`
        );
        res.render('newsong.ejs', {
          isUser: req.user
        });
      });
  }
});

// View Song lyric
router.get('/:sid', async function (req, res, next) {
  //Randomly Select 10 song from all song in DB for quick access to those songs
  const songs = await Songlist.aggregate([{ $sample: { size: 10 } }]);
  Songlist.findOne({ _id: req.params.sid })
    .select('songTitleKh songLyric songBy book')
    .exec()
    .then(song => {
      if (!song) {
        req.flash('error', `មាន​បញ្ជា​រក​បទ​នេះ​មិន​ឃើញ​ទេ`);
        res.render('songLyric.ejs');
      } else {
        res.render('songLyric.ejs', {
          song: song,
          songTitles: songs, //To show on other song box
          page_title: song.songTitleKh
        });
      }
    })
    .catch(err => {
      if (err) {
        req.flash('error', `មាន​បញ្ជា​រក​បទ​នេះ​មិន​ឃើញ​ទេ`);
      }
    });
});
// EDIT Song
router.get('/:sid/edit', isLoggedIn, async function (req, res, next) {
  const song_id = req.params.sid;
  // Get all book to fill book selection options
  var books = await Songbook.find().select('bookName _id');
  //Get song by its ID to fill the edit form
  Songlist.findOne({ _id: song_id })
    .exec()
    .then(song => {
      if (song !== null) {
        res.render('songEdit.ejs', {
          song: song,
          books: books,
          newbook: 'true'
        });
      } else {
        req.flash('error', `មាន​បញ្ជា​រក​បទ​នេះ​មិន​ឃើញ​ទេ`);
        res.redirect('/song');
      }
    })
    .catch(err => {
      req.flash('error', `មាន​បញ្ជា​រក​បទ​នេះ​មិន​ឃើញ​ទេ ${err}`);
      res.redirect('/song');
    });
});
//Update Song
router.put('/:sid', isLoggedIn, async function (req, res, next) {
  const book = await Songbook.findOne({
    _id: new mongoose.Types.ObjectId(req.body.bookId)
  }).select('_id bookName');

  const song_id = req.params.sid;
  // Get all the update params
  const updatedSong = {
    songId: req.body.songId,
    songTitleKh: req.body.songTitleKh,
    songTitleEn: req.body.songTitleEn,
    songType: req.body.songType,
    songBy: req.body.songBy,
    songLyric: req.body.songLyric,
    book: book
  };

  //findByIdAndUpdate
  Songlist.findOneAndUpdate({ _id: song_id }, updatedSong)
    .then(updated => {
      if (updated) {
        req.flash('success', `កែ​បទចម្រៀង​បាន​ដោយ​ជោគ​ជ័យ`);
        res.redirect('/song/' + song_id);
      } else {
        req.flash('error', `មាន​បញ្ជា​កែ​បទចម្រៀងមិន​បាន`);
        res.redirect('/song');
      }
    })
    .catch(err => {
      if (err) {
        req.flash('error', `មាន​បញ្ជា​កែ​បទចម្រៀងមិន​បាន ${err}`);
        res.redirect('/song');
      }
    });
});

// DELETE SELECTED SONG
router.delete('/:sid', isLoggedIn, async (req, res, next) => {
  Songlist.findByIdAndDelete({ _id: req.params.sid })
    .exec()
    .then(del => {
      if (del) {
        req.flash('success', `លប់​បទចម្រៀងបាន​ដោយ​ជោគ​ជ័យ`);
        res.redirect('/song');
      }
    })
    .catch(err => {
      req.flash('error', `មិន​អាចលប់​បទចម្រៀងបាន​ទេ សុំទោស! ${err}`);
      res.redirect('/song');
    });
});

module.exports = router;
