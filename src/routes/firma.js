const express = require('express');
const router = express.Router();
const firmaController = require('../controllers/firmaController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Apply authentication middleware to protected routes
router.get('/:firma_id', authenticateToken, firmaController.firmaBilgileriGetir);
router.put('/:firma_id', authenticateToken, authorize(['firma_yonetimi']), firmaController.firmaGuncelle);

// These routes might not need authentication in some cases
router.post('/', firmaController.firmaEkle);
router.get('/', firmaController.firmaListesiGetir);

module.exports = router;
