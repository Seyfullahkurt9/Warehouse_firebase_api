const express = require('express');
const router = express.Router();
const siparisController = require('../controllers/siparisController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// Sipariş oluşturma
router.post('/', authorize(['siparis_olusturma']), siparisController.siparisOlustur);

// Sipariş bilgilerini getirme
router.get('/:siparis_id', siparisController.siparisBilgileriGetir);

// Sipariş listesini getirme
router.get('/', siparisController.siparisListesiGetir);

// Sipariş durumunu güncelleme
router.put('/:siparis_id/durum', authorize(['siparis_guncelleme']), siparisController.siparisDurumuGuncelle);

// Ürün girişi (sipariş üzerinden)
router.post('/:siparis_id/urun-girisi', authorize(['stok_ekleme']), siparisController.urunGirisiYap);

module.exports = router;
