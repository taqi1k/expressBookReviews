const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post('/register', (req, res) => {
  // Extract username and password from the request body
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  // Check if the username already exists
  if (users.some(user => user.username === username)) {
    return res.status(409).json({ error: 'Username already exists. Please choose a different username.' });
  }

  // If everything is valid, add the new user to the users array
  const newUser = { username, password };
  users.push(newUser);

  // Respond with a success message
  res.status(201).json({ message: 'User registered successfully.'});
});





// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,4));
});

// Function to fetch books from an external API
const fetchBooksFromApi = async () => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return response.data;
  } catch (error) {
    console.error('Error fetching books from API:', error);
    throw new Error('Error fetching books from API');
  }
};

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    // Using async-await to fetch books from the API
    const data = await fetchBooksFromApi();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching book list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];

  // Iterate through all books to find those with the specified author
  for (const isbn in books) {
    if (books.hasOwnProperty(isbn) && books[isbn].author === author) {
      matchingBooks.push({
        isbn: isbn,
        details: books[isbn],
      });
    }
  }

  // Check if any books were found
  if (matchingBooks.length > 0) {
    res.send(JSON.stringify(matchingBooks, null, 4));
  } else {
    res.status(404).send("No books found for the specified author");
  }
});

public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    // Using async-await to fetch books from the API
    const data = await fetchBooksFromApi();

    // Filter books based on the specified author
    const matchingBooks = Object.entries(data).reduce((acc, [isbn, details]) => {
      if (details.author === author) {
        acc.push({
          isbn: isbn,
          details: details,
        });
      }
      return acc;
    }, []);

    // Check if any books were found
    if (matchingBooks.length > 0) {
      res.status(200).json(matchingBooks);
    } else {
      res.status(404).json({ error: "No books found for the specified author" });
    }
  } catch (error) {
    console.error('Error fetching book details by author:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];

  // Iterate through all books to find those with the specified title
  for (const isbn in books) {
    if (books.hasOwnProperty(isbn) && books[isbn].title === title) {
      matchingBooks.push({
        isbn: isbn,
        details: books[isbn],
      });
    }
  }

  // Check if any books were found
  if (matchingBooks.length > 0) {
    res.send(JSON.stringify(matchingBooks, null, 4));
  } else {
    res.status(404).send("No books found for the specified title");
  }
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Check if the ISBN exists in the books database
  if (books.hasOwnProperty(isbn)) {
    const bookReviews = books[isbn].reviews;

    // Check if the book has any reviews
    if (Object.keys(bookReviews).length > 0) {
      res.send(JSON.stringify(bookReviews, null, 4));
    } else {
      res.status(404).send("No reviews found for the specified book");
    }
  } else {
    res.status(404).send("Book not found");
  }
});


module.exports.general = public_users;
