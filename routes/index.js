var express = require('express');
var router = express.Router();

var Songbook = require('../models/songbook');
var Songlist = require('../models/songlists');

/* GET home page. */
router.get('/', async function(req, res, next) {
  var songbooks = await Songbook.find();
  res.render('books.ejs', {
    songbooks: songbooks,
    bookCount: songbooks.length
  });
});

// Search for song by title
router.get('/search', (req, res, next) => {
  let searchKeyword = req.query.searchTerm || '';

  //Check if the searchKeyword is not number.
  if (!isNaN(searchKeyword)) {
    if (searchKeyword.length === 1) {
      searchKeyword = '00' + searchKeyword;
    }
    if (searchKeyword.length === 2) {
      searchKeyword = '0' + searchKeyword;
    }
  }

  //EscapeRegex first before search to prevent unwanted injection
  const regex = new RegExp(escapeRegex(searchKeyword), 'gi');

  Songlist.find({
    $or: [{ songTitleKh: regex }, { songTitleEn: regex }, { songId: regex }]
  })
    .select('_id songId songTitleKh songTitleEn songBy songBook book')
    .exec()
    .then(searchedSongs => {
      res.render('searchSongs.ejs', {
        searchedSongs: searchedSongs,
        searchTerm: searchedSongs.length > 0 ? `<${searchKeyword}>` : `"${searchKeyword}"`,
        isUser: req.user
      });
    })
    .catch(err => {
      console.log(`something wrong ${err}`);
    });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
module.exports = router;
