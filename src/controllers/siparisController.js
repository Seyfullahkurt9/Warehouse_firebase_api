const { db, admin } = require('../config/firebase');
const siparisService = require('../services/siparisService');
const { asyncHandler } = require('../middleware/errorHandler');

// 1.6 Yeni sipariş oluşturma
exports.siparisOlustur = asyncHandler(async (req, res) => {
  try {
    const siparisData = req.body;
    const result = await siparisService.siparisOlustur(siparisData);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Sipariş başarıyla oluşturuldu',
      siparis_id: result.siparis_id
    });
  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    return res.status(400).json({ 
      success: false, 
      error: error.message || 'Sipariş oluşturulurken bir hata oluştu' 
    });
  }
});

// Sipariş bilgilerini getirme
exports.siparisBilgileriGetir = asyncHandler(async (req, res) => {
  try {
    const { siparis_id } = req.params;
    const siparis = await siparisService.siparisBilgileriGetir(siparis_id);
    
    return res.status(200).json({ 
      success: true, 
      data: siparis
    });
  } catch (error) {
    console.error('Sipariş bilgisi getirme hatası:', error);
    return res.status(404).json({ 
      success: false, 
      error: error.message || 'Sipariş bilgileri getirilirken bir hata oluştu' 
    });
  }
});

// Siparişleri listeleme
exports.siparisListesiGetir = asyncHandler(async (req, res) => {
  try {
    const filters = {
      tedarikci_id: req.query.tedarikci_id,
      personel_id: req.query.personel_id,
      durum: req.query.durum
    };
    
    const siparisler = await siparisService.siparisListesiGetir(filters);
    
    return res.status(200).json({ 
      success: true, 
      data: siparisler
    });
  } catch (error) {
    console.error('Sipariş listesi getirme hatası:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Sipariş listesi getirilirken bir hata oluştu' 
    });
  }
});

// Sipariş durumunu güncelleme
exports.siparisDurumuGuncelle = asyncHandler(async (req, res) => {
  try {
    const { siparis_id } = req.params;
    const { durum } = req.body;
    
    await siparisService.siparisDurumuGuncelle(siparis_id, durum);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Sipariş durumu başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Sipariş durumu güncelleme hatası:', error);
    return res.status(error.message.includes('bulunamadı') ? 404 : 400).json({ 
      success: false, 
      error: error.message || 'Sipariş durumu güncellenirken bir hata oluştu' 
    });
  }
});

// 1.7 Yeni ürün girişi (sipariş üzerinden)
exports.urunGirisiYap = asyncHandler(async (req, res) => {
  try {
    const { siparis_id } = req.params;
    const { stok_miktari } = req.body;
    
    const result = await siparisService.urunGirisiYap(siparis_id, stok_miktari);
    
    return res.status(201).json({
      success: true,
      message: 'Ürün girişi başarıyla yapıldı',
      stok_id: result.stok_id
    });
  } catch (error) {
    console.error('Ürün girişi hatası:', error);
    return res.status(error.message.includes('bulunamadı') ? 404 : 400).json({ 
      success: false, 
      error: error.message || 'Ürün girişi yapılırken bir hata oluştu' 
    });
  }
});
