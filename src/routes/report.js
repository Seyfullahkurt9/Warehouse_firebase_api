const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Apply authentication to all report routes
router.use(authenticateToken);

// Stock status report
router.get('/stock-status', authorize(['stok_goruntuleme', 'rapor_goruntuleme']), reportController.getStockStatusReport);

// Order status report
router.get('/order-status', authorize(['siparis_goruntuleme', 'rapor_goruntuleme']), reportController.getOrderStatusReport);

// Supplier performance report
router.get('/supplier-performance', authorize(['rapor_goruntuleme']), reportController.getSupplierReport);

module.exports = router;
