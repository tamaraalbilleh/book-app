'use strict';
require('dotenv').config();
const express = require('express');
const server = express();
const PORT = process.env.PORT || 3000 ;
const superagent = require('superagent');
const pg = require('pg');
server.use(express.urlencoded({ extended: true }));
server.set ('view engine','ejs');
server.use('/public', express.static('public'));
const client = new pg.Client( {
  connectionString: process.env.DATABASE_URL,
  // ssl: {
  //   rejectUnauthorized : false
  // }
});


server.get ('/',homeHandler);
server.get ('/hello', testHandler);
server.get ('/searches/new', newSearchHandler);
server.post ('/searches', searchesHandler);
server.post ('/books/:id', detailsHandler);
function testHandler (req,res){
  res.render ('pages/index');
}
function newSearchHandler (req,res) {
  res.render('pages/searches/new');
}
function homeHandler (req,res){
  let SQL = `SELECT * FROM books`;
  client.query(SQL).then(items=>{
    // console.log(result.rows)
    console.log( items.rows);
    res.render ('pages/index', {result:items.rows,count:items.rowsCount} );
  });
}

// https://www.googleapis.com/books/v1/volumes?q=inauthor:cat
function searchesHandler (req,res){
  // console.log (req.body);
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
      console.log (books);
      res.render ( 'pages/searches/show', { search:books});
    })
    .catch (error=>{
      res.send(error);
    });
}

client.connect (()=>{
  server.listen (PORT , ()=>{
    console.log (`listening on PORT : ${PORT}`);
  });
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
  this.description=bookData.volumeInfo.description || 'no description available';
  this.isbn = bookData.volumeInfo.industryIdentifiers[0].identifier;
  if (! bookData.volumeInfo.description ){
    this.bookshelf = 'Not available';
  }else {
    this.bookshelf = bookData.volumeInfo.categories;
  }
  
}


// error
server.get ('*',errorHandler);
function errorHandler (req,res){
  let errorArray = ['status: 500',' Sorry, something went wrong , ...'];
  res.status(500).render ( 'pages/error',{errorMessage:errorArray});
}

// test 
function detailsHandler (req, res){
  console.log (req.params)
}