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
  ssl: {
    rejectUnauthorized : false
  }
});


server.get ('/',homeHandler);
server.get ('/hello', testHandler);
server.get ('/searches/new', newSearchHandler);
server.post ('/searches', searchesHandler);
server.get ('/books/:id', detailsHandler);
// server.get ('/books',backHandler);
server.post ('/books',selectHandler);

function testHandler (req,res){
  res.render ('pages/index');
}
function newSearchHandler (req,res) {
  res.render('pages/searches/new');
}
function homeHandler (req,res){
  let SQL = `SELECT * FROM books`;
  client.query(SQL).then(items=>{

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
      // console.log (books);
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

  if (!bookData.volumeInfo.title) {
    this.title = 'no title available';
  }else {
    this.title = bookData.volumeInfo.title ;
  }

  if (!bookData.volumeInfo.authors) {
    this.author = 'no author available';
  }else {
    this.author = bookData.volumeInfo.authors;
  }

  if (!bookData.volumeInfo.description) {
    this.description='no description available';
  }else {
    this.description=bookData.volumeInfo.description ;
  }

  if (!bookData.volumeInfo.description) {
    this.description='no description available';
  }else {
    this.description=bookData.volumeInfo.description ;
  }
  this.isbn = bookData.volumeInfo.industryIdentifiers[0].identifier || 'Not Available';

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

function detailsHandler (req, res){
  // console.log (req.params);
  let SQL = `SELECT * FROM books WHERE id=$1;`;
  let safe = req.params.id;
  client.query (SQL,[safe]).then (result=>{
    res.render ('pages/books/show',{item:result.rows[0] } );
  });
}
// function backHandler (req,res){
//   res.redirect('back');
// }

function selectHandler (req, res){
  console.log (req.body);
  let SQL = `INSERT INTO books (title, author, img, description,isbn,bookshelf) VALUES($1,$2,$3,$4,$5,$6) RETURNING *;`;
  let safeValues = [req.body.title,req.body.author,req.body.img,req.body.description,req.body.isbn,req.body.bookshelf];
  client.query (SQL,safeValues).then (result=>{
    console.log (result.rows);
    res.redirect(`/books/${result.rows[0].id}`);
  });
}
