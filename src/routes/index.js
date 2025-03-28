const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Status endpoint to check if API is running
router.get('/status', (req, res) => {
  const firebaseStatus = db ? 'connected' : 'disconnected';
  res.json({ 
    status: 'API is running', 
    firebase: firebaseStatus
  });
});

// Placeholder for future routes
// router.use('/firma', require('./firma'));
// router.use('/personel', require('./personel'));
// router.use('/tedarikci', require('./tedarikci'));
// router.use('/siparis', require('./siparis'));
// router.use('/stok', require('./stok'));

module.exports = router;
