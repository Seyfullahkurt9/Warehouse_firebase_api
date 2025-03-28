const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const { db } = require('./config/firebase');
const dotenv = require('dotenv');
const { setupDatabase } = require('./utils/db-setup');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger/swagger.yaml'));

// Check Firebase connection
app.use((req, res, next) => {
  if (!db) {
    return res.status(500).json({ error: 'Firebase connection unavailable' });
  }
  next();
});

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Import routes
const firmaRoutes = require('./routes/firma');
const personelRoutes = require('./routes/personel');
const stokRoutes = require('./routes/stok');
const siparisRoutes = require('./routes/siparis');
const tedarikciRoutes = require('./routes/tedarikci');

// API routes
app.use('/api/firma', firmaRoutes);
app.use('/api/personel', personelRoutes);
app.use('/api/stok', stokRoutes);
app.use('/api/siparis', siparisRoutes);
app.use('/api/tedarikci', tedarikciRoutes);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Firebase API is running' });
});

// Setup database endpoint
app.post('/api/setup-database', async (req, res) => {
  try {
    await setupDatabase();
    res.status(200).json({ message: 'Database setup completed' });
  } catch (error) {
    console.error('Setup database error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset database endpoint (careful: this deletes all data)
app.post('/api/reset-database', async (req, res) => {
  try {
    // Add a confirmation check for safety
    const { confirmation } = req.body;
    if (confirmation !== 'RESET_DATABASE_CONFIRM') {
      return res.status(400).json({ 
        error: 'Database reset requires confirmation. Send a confirmation field with value "RESET_DATABASE_CONFIRM"' 
      });
    }
    
    const { resetAllCollections } = require('./utils/db-setup');
    await resetAllCollections();
    res.status(200).json({ message: 'Database reset completed successfully' });
  } catch (error) {
    console.error('Database reset error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Force init specific collection
app.post('/api/init-collection/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const { forceInitCollection } = require('./utils/db-setup');
    await forceInitCollection(collection);
    res.status(200).json({ message: `Collection '${collection}' initialized successfully` });
  } catch (error) {
    console.error('Collection initialization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Firebase API server running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
  
  // Set up database schema on startup if AUTO_SETUP_DB is true
  if (process.env.AUTO_SETUP_DB === 'true') {
    console.log('Auto-setting up database schema...');
    await setupDatabase();
  } else {
    console.log('Database auto-setup disabled. Use /api/setup-database endpoint to set up manually.');
  }
});

module.exports = app;
