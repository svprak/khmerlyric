var mongoose = require('mongoose');
// 1. Songbook Schema
const songlistSchema = mongoose.Schema({
  songId: String,
  songTitleKh: String,
  songTitleEn: String,
  songBy: String,
  songLyric: String,

  songType: String,
  book: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Songbook',
      require: true
    },
    bookName: String
  },
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  }
});
// Create and export Model
module.exports = mongoose.model('Songlist', songlistSchema);
