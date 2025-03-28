const express = require('express');
const router = express.Router();
const stokController = require('../controllers/stokController');
const { authenticateToken, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'urun-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// Routes that need authentication
router.use(authenticateToken);

// Yeni ürün ekleme
router.post('/urunler', authorize(['stok_ekleme']), stokController.urunEkle);

// Ürün görseli yükleme
router.post('/urunler/:urun_id/gorsel', upload.single('image'), authorize(['stok_ekleme']), stokController.urunGorseliYukle);

// Ürün listesini getirme
router.get('/urunler', stokController.urunListesiGetir);

// Ürün çıkışı yapma
router.post('/cikis', authorize(['stok_cikisi']), stokController.urunCikisiYap);

// Stok hareketlerini görüntüleme
router.get('/hareketler', stokController.stokHareketleriGetir);

// Cari stok durumunu görüntüleme
router.get('/durum', stokController.cariStokDurumuGetir);

module.exports = router;
