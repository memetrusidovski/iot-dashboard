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

// -----------START: Module Exports-----------
module.exports = router;
// -----------END: Module Exports-----------