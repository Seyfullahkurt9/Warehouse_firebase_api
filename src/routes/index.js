const express = require('express');
const router = express.Router();
const path = require('path');

// Status endpoint to check if API is running
router.get('/status', (req, res) => {
  let firebaseStatus = 'disconnected';
  try {
    const { db } = require('../config/firebase');
    firebaseStatus = db ? 'connected' : 'disconnected';
  } catch (error) {
    console.error('Firebase error in status check:', error.message);
  }
  
  res.json({ 
    status: 'API is running', 
    firebase: firebaseStatus
  });
});

// Load and use route modules safely
function safeUseRoute(routePath, routeName) {
  try {
    const route = require(routePath);
    if (typeof route === 'function') {
      router.use(`/${routeName}`, route);
      console.log(`✅ Route '${routeName}' loaded`);
    } else {
      console.error(`❌ Route '${routeName}' is not a valid Express router`);
    }
  } catch (error) {
    console.error(`❌ Error loading route '${routeName}':`, error.message);
  }
}

// API Routes - load each one safely
safeUseRoute('./firma', 'firma');
safeUseRoute('./personel', 'personel');
safeUseRoute('./tedarikci', 'tedarikci');
safeUseRoute('./siparis', 'siparis');
safeUseRoute('./stok', 'stok');
safeUseRoute('./report', 'reports');
safeUseRoute('./notification', 'notifications');

// Test arabirimi (sadece development modundayken aktif)
if (process.env.NODE_ENV !== 'production') {
  router.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/test.html'));
  });
}

module.exports = router;
