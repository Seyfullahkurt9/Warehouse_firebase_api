const express = require('express');
const router = express.Router();
const personelController = require('../controllers/personelController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Personel ekleme
router.post('/', personelController.personelEkle);

// Personel listesini getirme
router.get('/', authenticateToken, personelController.personelListesiGetir);

// Giriş yapma
router.post('/giris', personelController.girisYap);

// Son giriş bilgisi getirme
router.get('/:personel_id/son-giris', authenticateToken, personelController.sonGirisBilgisi);

// Rol yönetimi
router.post('/roller', authenticateToken, authorize(['yonetici']), personelController.rolEkle);
router.get('/roller', authenticateToken, personelController.rolListesiGetir);

module.exports = router;
