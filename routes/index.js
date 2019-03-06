var express = require('express');
var router = express.Router();
// var mongoose = require('mongoose');
// var puppeteer = require('puppeteer');

var Songbook = require('../models/songbook');
var Songlist = require('../models/songlists');

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    var songBook = await Songbook.find();
    // console.log(`songbook ${songBook}`);
    if (songBook.length <= 0) {
      res.redirect('/book');
    } else {
      var songLists = await Songlist.find().sort({
        songId: 1
      });
      // console.log(songLists);
      if (songLists.length > 0) {
        // console.log(songBook);
        res.render('index.ejs', {
          // book_Id: book._id,
          songlists: songLists,
          songBook: 'សរសើរ​ព្រះ​ទាំងអស់​គ្នា'
        });
      } else {
        // console.log(songLists.length);
        res.render('index.ejs', {
          // book_Id: book._id,
          songlists: songLists,
          songBook: 'សរសើរ​ព្រះ​ទាំងអស់​គ្នា'
        });
      }
    }
  } catch (err) {
    throw err;
  }
});
// Search for song by title
router.get('/search', (req, res, next) => {
  var searchKeyword = req.query.searchTerm || '';
  // console.log('In Search ' + typeof searchKeyword);
  const regex = new RegExp(escapeRegex(searchKeyword), 'gi');

  Songlist.find({
    $or: [
      { songTitleKh: regex },
      { songTitleEn: regex },
      { songBook: regex },
      { songBy: regex },
      { songId: regex }
    ]
  })
    .select('_id songId songTitleKh songTitleEn songBy songBook book')
    .exec()
    .then(searchedSongs => {
      // console.log(searchedSongs);
      if (searchedSongs.length <= 0) {
        res.render('searchSongs.ejs', {
          searchedSongs: searchedSongs,
          searchTerm: `"${searchKeyword}"`,
          isUser: req.user
        });
      } else {
        res.render('searchSongs.ejs', {
          searchedSongs: searchedSongs,
          searchTerm: `<${searchKeyword}>`,
          isUser: req.user
        });
      }
    })
    .catch(err => {
      console.log(`something wrong ${err}`);
    });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;
