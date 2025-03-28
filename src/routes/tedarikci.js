const express = require('express');
const router = express.Router();
const tedarikciController = require('../controllers/tedarikciController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Tedarikçi ekleme
router.post('/', authenticateToken, authorize(['tedarikci_yonetimi']), tedarikciController.tedarikciEkle);

// Tedarikçi listesini getirme
router.get('/', tedarikciController.tedarikciListesiGetir);

// Tedarikçi bilgilerini getirme
router.get('/:tedarikci_id', tedarikciController.tedarikciBilgileriGetir);

module.exports = router;
