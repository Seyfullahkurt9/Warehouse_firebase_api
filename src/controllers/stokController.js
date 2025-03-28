const stokService = require('../services/stokService');
const { asyncHandler } = require('../middleware/errorHandler');
const path = require('path');

// 1.9 Yeni ürün ekleme
exports.urunEkle = asyncHandler(async (req, res) => {
  try {
    const urunData = req.body;
    const result = await stokService.urunEkle(urunData);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Ürün başarıyla eklendi',
      urun_id: result.urun_id
    });
  } catch (error) {
    console.error('Ürün ekleme hatası:', error);
    return res.status(400).json({ 
      success: false, 
      error: error.message || 'Ürün eklenirken bir hata oluştu' 
    });
  }
});

// Ürün görseli yükleme
exports.urunGorseliYukle = asyncHandler(async (req, res) => {
  try {
    const { urun_id } = req.params;
    
    // Bu fonksiyon, bir dosya yükleme middleware'i kullanıldığını varsayar (örneğin multer)
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Yüklenecek dosya bulunamadı' });
    }
    
    // Gerçek uygulamada, dosyayı bir bulut depolama hizmetine yükleyip URL alabilirsiniz
    // Bu örnekte sadece yüklenen dosyanın yolunu kullanacağız
    const resim_url = `/uploads/${path.basename(req.file.path)}`;
    
    const result = await stokService.urunGorseliYukle(urun_id, resim_url);
    
    return res.status(200).json({
      success: true,
      message: 'Ürün görseli başarıyla yüklendi',
      resim_url: result.resim_url
    });
  } catch (error) {
    console.error('Ürün görseli yükleme hatası:', error);
    return res.status(error.message.includes('bulunamadı') ? 404 : 400).json({ 
      success: false, 
      error: error.message || 'Ürün görseli yüklenirken bir hata oluştu' 
    });
  }
});

// 1.8 Ürün çıkışı yapma
exports.urunCikisiYap = asyncHandler(async (req, res) => {
  try {
    const cikisData = req.body;
    const result = await stokService.urunCikisiYap(cikisData);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Ürün çıkışı başarıyla kaydedildi',
      stok_id: result.stok_id
    });
  } catch (error) {
    console.error('Ürün çıkışı hatası:', error);
    return res.status(400).json({ 
      success: false, 
      error: error.message || 'Ürün çıkışı yapılırken bir hata oluştu' 
    });
  }
});

// 1.10 Stok hareketlerini görüntüleme
exports.stokHareketleriGetir = asyncHandler(async (req, res) => {
  try {
    const filters = {
      urun_kodu: req.query.urun_kodu,
      baslangic_tarihi: req.query.baslangic_tarihi,
      bitis_tarihi: req.query.bitis_tarihi
    };
    
    const hareketler = await stokService.stokHareketleriGetir(filters);
    
    return res.status(200).json({ 
      success: true, 
      data: hareketler
    });
  } catch (error) {
    console.error('Stok hareketleri getirme hatası:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Stok hareketleri getirilirken bir hata oluştu' 
    });
  }
});

// 1.11 Cari stok durumunu görüntüleme
exports.cariStokDurumuGetir = asyncHandler(async (req, res) => {
  try {
    const stokDurumu = await stokService.cariStokDurumuGetir();
    
    return res.status(200).json({ 
      success: true, 
      data: stokDurumu
    });
  } catch (error) {
    console.error('Cari stok durumu getirme hatası:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Cari stok durumu getirilirken bir hata oluştu' 
    });
  }
});

// Ürün listesini getir
exports.urunListesiGetir = asyncHandler(async (req, res) => {
  try {
    const urunler = await stokService.urunListesiGetir();
    
    return res.status(200).json({ 
      success: true, 
      data: urunler
    });
  } catch (error) {
    console.error('Ürün listesi getirme hatası:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Ürün listesi getirilirken bir hata oluştu' 
    });
  }
});
