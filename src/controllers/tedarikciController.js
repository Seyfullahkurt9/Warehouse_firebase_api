const tedarikciService = require('../services/tedarikciService');
const { asyncHandler } = require('../middleware/errorHandler');

// 1.5 Tedarikçi bilgilerini ekleme
exports.tedarikciEkle = asyncHandler(async (req, res) => {
  try {
    const tedarikciData = req.body;
    const result = await tedarikciService.tedarikciEkle(tedarikciData);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Tedarikçi başarıyla eklendi',
      tedarikci_id: result.tedarikci_id
    });
  } catch (error) {
    console.error('Tedarikçi ekleme hatası:', error);
    return res.status(400).json({ 
      success: false, 
      error: error.message || 'Tedarikçi eklenirken bir hata oluştu' 
    });
  }
});

// Tedarikçi listesini getirme
exports.tedarikciListesiGetir = asyncHandler(async (req, res) => {
  try {
    const tedarikciler = await tedarikciService.tedarikciListesiGetir();
    
    return res.status(200).json({ 
      success: true, 
      data: tedarikciler
    });
  } catch (error) {
    console.error('Tedarikçi listesi getirme hatası:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Tedarikçi listesi getirilirken bir hata oluştu' 
    });
  }
});

// Tedarikçi bilgilerini getirme
exports.tedarikciBilgileriGetir = asyncHandler(async (req, res) => {
  try {
    const { tedarikci_id } = req.params;
    const tedarikci = await tedarikciService.tedarikciBilgileriGetir(tedarikci_id);
    
    return res.status(200).json({ 
      success: true, 
      data: tedarikci
    });
  } catch (error) {
    console.error('Tedarikçi bilgisi getirme hatası:', error);
    return res.status(404).json({ 
      success: false, 
      error: error.message || 'Tedarikçi bilgileri getirilirken bir hata oluştu' 
    });
  }
});
