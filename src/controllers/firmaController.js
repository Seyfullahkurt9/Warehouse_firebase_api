const firmaService = require('../services/firmaService');
const { asyncHandler } = require('../middleware/errorHandler');

// 1.1 Firma bilgilerini ekleme
exports.firmaEkle = asyncHandler(async (req, res) => {
  try {
    const firmaData = req.body;
    const result = await firmaService.firmaEkle(firmaData);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Firma başarıyla eklendi',
      firma_id: result.firma_id
    });
  } catch (error) {
    console.error('Firma ekleme hatası:', error);
    return res.status(400).json({ 
      success: false, 
      error: error.message || 'Firma eklenirken bir hata oluştu' 
    });
  }
});

// 1.1 Firma bilgilerini getirme
exports.firmaBilgileriGetir = asyncHandler(async (req, res) => {
  try {
    const { firma_id } = req.params;
    const firma = await firmaService.firmaBilgileriGetir(firma_id);
    
    return res.status(200).json({ 
      success: true, 
      data: firma
    });
  } catch (error) {
    console.error('Firma bilgisi getirme hatası:', error);
    return res.status(404).json({ 
      success: false, 
      error: error.message || 'Firma bilgileri getirilirken bir hata oluştu' 
    });
  }
});

// 1.1 Firma bilgilerini güncelleme
exports.firmaGuncelle = asyncHandler(async (req, res) => {
  try {
    const { firma_id } = req.params;
    const firmaData = req.body;
    
    await firmaService.firmaGuncelle(firma_id, firmaData);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Firma bilgileri başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Firma güncelleme hatası:', error);
    return res.status(error.message.includes('bulunamadı') ? 404 : 400).json({ 
      success: false, 
      error: error.message || 'Firma bilgileri güncellenirken bir hata oluştu' 
    });
  }
});

// 1.1 Firma listesini getirme
exports.firmaListesiGetir = asyncHandler(async (req, res) => {
  try {
    const firmalar = await firmaService.firmaListesiGetir();
    
    return res.status(200).json({ 
      success: true, 
      data: firmalar
    });
  } catch (error) {
    console.error('Firma listesi getirme hatası:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Firma listesi getirilirken bir hata oluştu' 
    });
  }
});
