require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

// Create required directories if they don't exist
const dirs = ['config', 'controllers', 'models', 'routes'].map(dir => path.join(__dirname, dir));
dirs.forEach(dir => {
  if (!fs.existsSync(dir)){
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize Express app
const app = express();
app.use(express.json());

// Load Firebase config - with error handling
let firebaseConfig;
try {
  firebaseConfig = require('./config/firebase');
  console.log('Firebase config loaded');
} catch (error) {
  console.error('Error loading Firebase config:', error.message);
  console.log('Continuing without Firebase...');
}

// Load controllers with error handling
let databaseController;
try {
  databaseController = require('./controllers/databaseController');
  console.log('Database controller loaded');
} catch (error) {
  console.error('Error loading database controller:', error.message);
  databaseController = { 
    initializeDatabase: () => Promise.resolve({ success: false, error: 'Controller not loaded' })
  };
}

// Load routes with error handling
let routes;
try {
  routes = require('./routes');
  console.log('Routes loaded');
  app.use('/api', routes);
} catch (error) {
  console.error('Error loading routes:', error.message);
  // Fallback route
  app.get('/api/status', (req, res) => {
    res.json({ status: 'API running with errors', error: 'Routes not loaded properly' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start the server and initialize database
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  if (databaseController && databaseController.initializeDatabase) {
    const result = await databaseController.initializeDatabase();
    console.log('Database initialization result:', result);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Keep the process alive but log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the process alive but log the error
});

module.exports = app;
