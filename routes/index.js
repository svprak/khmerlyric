var express = require('express');
var router = express.Router();
// var mongoose = require('mongoose');
// var puppeteer = require('puppeteer');

var Songbook = require('../models/songbook');
var Songlist = require('../models/songlists');

/* GET home page. */
router.get('/', async function(req, res, next) {
  let page = req.query.page || 1;
  let prev = req.query.prev || 1;
  let isEnd = false;
  page = parseInt(page);
  prev = parseInt(prev);
  const limit = 25;
  let pageStart = page;
  let lastPage = 3 + pageStart;

  try {
    var songBook = await Songbook.find();
    if (songBook.length <= 0) {
      req.flash('error', 'No songbook');
      res.render('404.ejs');
    } else {
      var songLists = await Songlist.find()
        .sort({ songTitleKh: 1 })
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
        res.render('index.ejs', {
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
    req.flash('error', err.message);
    console.log(err);
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
      { songId: regex },
      { songLyric: regex }
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
