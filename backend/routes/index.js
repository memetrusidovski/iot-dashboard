// routes/index.js - Main Application Routes
// Provides web pages and basic API endpoints

const express = require('express');
const router = express.Router();

// -----------START: Home Page-----------
/**
 * GET /
 * Serve the main landing page with EJS template
 * 
 * @route GET /
 * @returns {HTML} Rendered EJS template for home page
 */
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Welcome to IOT-Magic.com!',
    message: 'Your IoT solution provider',
    features: ['Smart Home', 'Industrial IoT', 'Data Analytics'],
    currentTime: new Date().toLocaleString()
  });
});
// -----------END: Home Page-----------

// -----------START: Hello API-----------
/**
 * GET /api/hello
 * Simple API endpoint returning a greeting
 * 
 * @route GET /api/hello
 * @returns {Object} JSON greeting message
 */
router.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});
// -----------END: Hello API-----------

// -----------START: Users List-----------
/**
 * GET /users
 * Return list of all users in JSON format
 * 
 * @route GET /users
 * @returns {Object} JSON object with users array and count
 */
router.get('/users', (req, res) => {
  const users = [
    { id: 1, name: 'Alice', email: 'alice@iot-magic.com' },
    { id: 2, name: 'Bob', email: 'bob@iot-magic.com' },
    { id: 3, name: 'Steve', email: 'steve@iot-magic.com' }
  ];

  res.json({
    title: 'Users List',
    users: users,
    userCount: users.length
  });
});
// -----------END: Users List-----------

// -----------START: User Profile-----------
/**
 * GET /users/:id
 * Display profile page for a specific user
 * 
 * @route GET /users/:id
 * @param {string} id - User identifier from URL
 * @returns {HTML} Rendered EJS template for user profile
 * 
 * @note In production, this would fetch real user data from database
 */
router.get('/users/:id', (req, res) => {
  // Mock user data - in production, fetch from database
  const user = {
    id: req.params.id,
    name: `User ${req.params.id}`,
    email: `user${req.params.id}@iot-magic.com`,
    joinDate: new Date().toLocaleDateString()
  };
  
  res.render('user-profile', {
    title: `User ${req.params.id} Profile`,
    user: user
  });
});
// -----------END: User Profile-----------

// -----------START: Create User Form-----------
/**
 * GET /users/create
 * Display form for creating a new user
 * 
 * @route GET /users/create
 * @returns {HTML} Rendered EJS template for user creation form
 */
router.get('/users/create', (req, res) => {
  res.render('create-user', {
    title: 'Create New User'
  });
});
// -----------END: Create User Form-----------

// -----------START: Module Exports-----------
module.exports = router;
// -----------END: Module Exports-----------