var express = require('express');
var app = express();
var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');
var ejs = require('ejs');
// Connect to local Server

const Songlist = require('./models/songlists');

mongoose
  .connect('mongodb://localhost/musicsheets', { useNewUrlParser: true })
  .then(
    function() {
      console.log('DB is connected successfully');
    },
    function(err) {
      console.log('Something wrong cannot make the connection to DB');
    }
  );

app.get('/sample', async (req, res, next) => {
  const randomSong = await Songlist.aggregate([{ $sample: { size: 1 } }]);
  console.log(randomSong.length);
  res.json(randomSong);
});

app.listen(3000);

//Rendering EJS template File

const compile = async function(templateName, data) {
  const filePath = path.join('templates', `${templateName}.ejs`);
  const html = await fs.readFile(filePath, 'utf-8');
  return ejs.compile(html)(data);
};
