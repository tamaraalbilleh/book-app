DROP TABLE IF EXISTS books;
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR (255),
    author VARCHAR (255),
    img VARCHAR (255),
    description TEXT,
    isbn VARCHAR(255),
    bookshelf VARCHAR (255)
);

INSERT INTO books (title, author, img, description,isbn,bookshelf) 
VALUES('A Cat in the Wings','Lydia Adamson','http://books.google.com/books/content?id=wfHFAg_3oY8C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api','Available Digitally for the First Time Murder takes a bow at the ballet','9781101578896','not available');

INSERT INTO books (title, author, img, description,isbn,bookshelf) 
VALUES('Dune','Frank Herbert','http://books.google.com/books/content?id=B1hSG45JCX4C&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api','Follows the adventures of Paul Atreides, the son of a betrayed duke given up for dead on a treacherous desert planet and adopted by its fierce, nomadic people, who help him unravel his most unexpected destiny.','9781101578896','fantacy');
