const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ 
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  if (!isValid(username)) {
    return res.status(401).json({ error: 'Invalid username.' });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const token = jwt.sign({ username }, '123'); 
  res.status(200).json({ message: 'Login successful.', token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
