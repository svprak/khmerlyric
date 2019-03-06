var mongoose = require('mongoose');

// 1. Songbook Schema
const songbookSchema = mongoose.Schema({
  bookName: {
    type: String,
    required: true
  },
  numberOfSong: Number,
  bookBy: String,
  bookDescription: String,
  bookCoverImg: String,
  bookYear: String,
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  }
});
// 2. Create and Export Model
module.exports = mongoose.model('Songbook', songbookSchema);
