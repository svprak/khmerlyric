var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Songbook = require('../models/songbook');
var Songlist = require('../models/songlists');

var isLoggedIn = require('../mw/isLoggedIn');
// var isAdmin = require('../mw/isAdmin');

// Get all available songs
router.get('/', async function(req, res, next) {
  let page = req.query.page || 1;
  let prev = req.query.prev || 1;
  let isEnd = false;
  page = parseInt(page);
  prev = parseInt(prev);
  const limit = 15;
  let pageStart = page;
  let lastPage = 3 + pageStart;

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
      if (songLists.length > 0) {
        res.render('songlist.ejs', {
          songlists: songLists,
          songBook: 'សរសើរ​ព្រះ​ទាំងអស់​គ្នា',
          pageStart: pageStart,
          lastPage: lastPage,
          count: prev,
          isEnd: isEnd,
          showmore: true
        });
      } else {
        page = prev;
        res.render('songlist.ejs', {
          // book_Id: book._id,
          songlists: songLists,
          songBook: 'សរសើរ​ព្រះ​ទាំងអស់​គ្នា',
          pageStart: pageStart,
          lastPage: lastPage,
          count: prev,
          isEnd: isEnd,
          showmore: true
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
});
/* Getting form to add new song */
router.get('/new', isLoggedIn, function(req, res, next) {
  // res.send('you have reach the it.');
  // console.log("Test to add new song to the selected book");
  Songbook.find()
    .select('_id bookName')
    .exec()
    .then(bookNames => {
      if (bookNames.length >= 0) {
        res.render('newsong.ejs', {
          title: 'Music Sheets',
          bookNames: bookNames
        });
      } else {
        res.render('newsong.ejs', {
          title: 'Music Sheets'
        });
      }
    });
});
// POST SONG to BOOK
router.post('/', isLoggedIn, async function(req, res, next) {
  const bookId = req.body.bookId;
  // this only to get the name of book => Need to find other way
  const book = await Songbook.findOne({ _id: bookId }).select('bookName _id');
  // console.log(book.bookName);
  //Add user who add book
  var user = {
    id: req.user._id,
    username: req.user.username
  };
  var newBook = {
    id: book._id,
    bookName: book.bookName
  };
  var newSong = new Songlist({
    songId: req.body.songNumber,
    songTitleKh: req.body.songTitleKh,
    songTitleEn: req.body.songTitleEn,
    songBy: req.body.songBy,
    songLyric: req.body.songLyric,
    songBook: book.bookName,
    singType: req.body.songType,
    book: newBook,
    user: user
  });
  newSong
    .save()
    .then(() => {
      // console.log(` Book Id: ${bookId} `);
      // console.log(typeof bookId);
      res.redirect('/song/new');
    })
    .catch(() => {
      res.render('newsong.ejs', {
        isUser: req.user
      });
    });
});

// View Song lyric
router.get('/:sid', async function(req, res, next) {
  const songs = await Songlist.aggregate([{ $sample: { size: 10 } }]);
  // .select('songTitleKh _id')
  // .limit(10);
  // console.log(songs);
  const song = Songlist.findOne({ _id: req.params.sid })
    .select('songTitleKh songLyric songBy book')
    .exec()
    .then(song => {
      if (song.length <= 0) {
        res.render('songLyric.ejs', { title: 'Song Title' });
      } else {
        res.render('songLyric.ejs', {
          title: song.songTitleKh,
          song: song,
          songTitles: songs
        });
      }
      // console.log(song);
    })
    .catch(err => {
      if (err) {
        console.log(err);
      }
    });
});
// EDIT Song
router.get('/:sid/edit', isLoggedIn, async function(req, res, next) {
  const song_id = req.params.sid;
  // Get all book
  var book = await Songbook.find().select('bookName _id');
  // console.log(book);
  //Get song to by it ID to edit
  Songlist.findOne({ _id: song_id })
    .exec()
    .then(song => {
      // console.log(song);
      if (song !== null) {
        res.render('songEdit.ejs', {
          song: song,
          bookNames: book
        });
      } else {
        res.redirect('/song');
      }
    })
    .catch(err => {
      console.log(`Something wrong in getting song to edit ${err}`);
    });
});
//Update Song option
// EDIT Song
router.put('/:sid', isLoggedIn, async function(req, res, next) {
  //This is may too much just to get book name but for now I don't know
  //a better to do it. so this will do for now.
  const book = await Songbook.findOne({ _id: req.body.bookId }).select(
    'bookName'
  );
  const song_id = req.params.sid;
  // Get all the update params
  const updatedSong = {
    songId: req.body.songId,
    songBook: book.bookName,
    songTitleKh: req.body.songTitleKh,
    songTitleEn: req.body.songTitleEn,
    songType: req.body.songType,
    songBy: req.body.songBy,
    songLyric: req.body.songLyric,
    book: req.body.bookId
  };

  //findByIdAndUpdate
  Songlist.findOneAndUpdate({ _id: song_id }, updatedSong)
    .then(updated => {
      // console.log(`update song ${updated}`);
      if (updated) {
        res.redirect('/song/' + song_id);
      } else {
        res.redirect('/song');
      }
    })
    .catch(err => {
      if (err) {
        console.log(err);
      }
    });
});

// DELETE SELECTED SONG
router.delete('/:sid', isLoggedIn, async (req, res, next) => {
  // res.send('Want to delete song?');
  // Delete Song by its Id
  Songlist.findByIdAndDelete({ _id: req.params.sid })
    .exec()
    .then(del => {
      if (del) {
        // console.log(`${del.songTitleKh} has been deleted`);
        res.redirect('/song');
      }
    })
    .catch(err => {
      console.log(`Can't delete: ${err}`);
    });
});
module.exports = router;
