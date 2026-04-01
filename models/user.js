var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
// 1. Songbook Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255
  },
  role: {
    admin: {
      type: Boolean,
      default: false
    },
    operator: {
      type: Boolean,
      default: true
    }
  }
});

//So we can use some of passport local mongoose features
userSchema.plugin(passportLocalMongoose);
// Create and export Model
module.exports = mongoose.model('User', userSchema);
