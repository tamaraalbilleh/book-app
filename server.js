'use strict';
require('dotenv').config();
const express = require('express');
const server = express();
const PORT = process.env.PORT || 3000 ;
const superagent = require('superagent');
server.use(express.urlencoded({ extended: true }));
server.set ('view engine','ejs');
server.use('/public', express.static('public'));




server.get ('/hello', testHandler);
server.get ('/searches/new', newSearchHandler);

function testHandler (req,res){
  res.render ('pages/index');
}
function newSearchHandler (req,res) {
  res.render('pages/searches/new');
}


server.post ('/searches', searchesHandler);
// https://www.googleapis.com/books/v1/volumes?q=inauthor:cat
function searchesHandler (req,res){
  console.log (req.body);
  let searchType ='';
  if (req.body.title){
    searchType ='title';
  }else if (req.body.author){
    searchType = 'author';
  }
  let searchWord = req.body.search;
  let url = `https://www.googleapis.com/books/v1/volumes?q=in${searchType}:${searchWord}&maxResults=10`;
  superagent.get (url)
    .then (bookData=>{
      let data = bookData.body.items;
      let books = data.map(item => {
        return new Book (item);
      });
      res.render ( 'pages/searches/show', { search:books});
    })
    .catch (error=>{
      res.send(error);
    });
}


server.listen (PORT , ()=>{
  console.log (`listening on PORT : ${PORT}`);
});

function Book (bookData){
  if (!bookData.volumeInfo.imageLinks){
    this.img = 'https://i.imgur.com/J5LVHEL.jpg';
  }
  else {
    this.img= bookData.volumeInfo.imageLinks.thumbnail;
  }
  this.title = bookData.volumeInfo.title;
  this.author = bookData.volumeInfo.authors;
  this.description=bookData.volumeInfo.description;

}

// remember post

// error
server.get ('*',errorHandler);
function errorHandler (req,res){
  let errorObject = {
    status: 500,
    responseText : 'Sorry, something went wrong , ...'
  };
  res.status(500).send (errorObject);
}

