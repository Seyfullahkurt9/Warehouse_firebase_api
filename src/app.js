require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const multer = require('multer'); // For file uploads
const setupSwagger = require('./config/swagger-setup');

// Import middleware
// const { errorHandler, errorLogger } = require('./middleware/errorHandler');
// const { requestLogger } = require('./middleware/logger');

// Create required directories if they don't exist
const dirs = ['config', 'controllers', 'models', 'routes', 'middleware', 'utils', 'services'].map(dir => path.join(__dirname, dir));
dirs.forEach(dir => {
  if (!fs.existsSync(dir)){
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Ensure public directory exists
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  console.log(`Creating public directory: ${publicDir}`);
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create uploads directory for file storage
const uploadsDir = path.join(publicDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// Initialize Express app
const app = express();

// Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

// Import middleware only after ensuring they exist
try {
  const { requestLogger } = require('./middleware/logger');
  const { errorHandler, errorLogger } = require('./middleware/errorHandler');
  
  // Add request logging if available
  app.use(requestLogger); 
  
  // Set up error handlers for later use
  app.locals.errorLogger = errorLogger;
  app.locals.errorHandler = errorHandler;
} catch (error) {
  console.error('Error loading middleware:', error.message);
  // Continue without the middleware that couldn't be loaded
}

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

// Make upload middleware available globally
app.locals.upload = upload;

// Load routes with error handling
try {
  const routes = require('./routes');
  if (typeof routes === 'function') {
    console.log('Routes loaded successfully');
    app.use('/api', routes);
  } else {
    console.error('Routes module did not return a valid Express router');
    // Fallback route
    app.get('/api/status', (req, res) => {
      res.json({ status: 'API running with errors', error: 'Routes not loaded properly' });
    });
  }
} catch (error) {
  console.error('Error loading routes:', error.message);
  // Fallback route
  app.get('/api/status', (req, res) => {
    res.json({ status: 'API running with errors', error: `Routes module error: ${error.message}` });
  });
}

// Add Swagger documentation if in development mode
if (process.env.NODE_ENV === 'development') {
  try {
    // İki farklı swagger tanımlama yöntemi var, birini seçin:
    
    // 1. Manuel tanımlanmış swagger
    const swaggerDefinition = require('./config/swagger');
    
    // VEYA
    
    // 2. Otomatik oluşturulan swagger (swagger-jsdoc ile)
    // const swaggerDefinition = require('./config/swagger-setup');
    
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
    console.log('API documentation available at /api-docs');
    
    // Redirect root to API docs
    app.get('/', (req, res) => {
      res.redirect('/api-docs');
    });
  } catch (error) {
    console.error('Error setting up Swagger:', error.message);
  }
}

// Apply error handling middleware at the end (only if they were loaded)
if (app.locals.errorLogger) {
  app.use(app.locals.errorLogger);
}
if (app.locals.errorHandler) {
  app.use(app.locals.errorHandler);
}

// Start the server and initialize database
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Development mode: ${process.env.NODE_ENV === 'development' ? 'ON' : 'OFF'}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`API documentation: http://localhost:${PORT}/api-docs`);
    console.log(`Static files: http://localhost:${PORT}`);
  }
  
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

setupSwagger(app);

module.exports = app;
