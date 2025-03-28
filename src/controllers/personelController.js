const personelService = require('../services/personelService');
const authService = require('../services/authservice');
const { asyncHandler } = require('../middleware/errorHandler');

// 1.3 Yeni personel ekleme
exports.personelEkle = asyncHandler(async (req, res) => {
  try {
    const personelData = req.body;
    const result = await personelService.personelEkle(personelData);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Personel başarıyla eklendi',
      personel_id: result.personel_id
    });
  } catch (error) {
    console.error('Personel ekleme hatası:', error);
    return res.status(400).json({ 
      success: false, 
      error: error.message || 'Personel eklenirken bir hata oluştu' 
    });
  }
});

// 1.3 Personel listesini getirme
exports.personelListesiGetir = asyncHandler(async (req, res) => {
  try {
    const filters = {
      firma_id: req.query.firma_id
    };
    
    const personeller = await personelService.personelListesiGetir(filters);
    
    return res.status(200).json({ 
      success: true, 
      data: personeller
    });
  } catch (error) {
    console.error('Personel listesi getirme hatası:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Personel listesi getirilirken bir hata oluştu' 
    });
  }
});

// 1.4 Kullanıcı girişi
exports.girisYap = asyncHandler(async (req, res) => {
  try {
    const { eposta, sifre } = req.body;
    
    const loginResult = await authService.login(eposta, sifre);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Giriş başarılı',
      user: loginResult.user,
      token: loginResult.token
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    return res.status(401).json({ 
      success: false, 
      error: error.message || 'Giriş yapılırken bir hata oluştu' 
    });
  }
});

// 1.2 Son giriş bilgilerini görüntüleme
exports.sonGirisBilgisi = asyncHandler(async (req, res) => {
  try {
    const { personel_id } = req.params;
    
    const sonGiris = await authService.getLastLoginInfo(personel_id);
    
    return res.status(200).json({ 
      success: true, 
      data: sonGiris
    });
  } catch (error) {
    console.error('Son giriş bilgisi getirme hatası:', error);
    return res.status(404).json({ 
      success: false, 
      error: error.message || 'Son giriş bilgisi getirilirken bir hata oluştu' 
    });
  }
});

// Rol yönetimi işlemleri
exports.rolEkle = asyncHandler(async (req, res) => {
  try {
    const rolData = req.body;
    const result = await personelService.rolEkle(rolData);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Rol başarıyla eklendi',
      rol_id: result.rol_id
    });
  } catch (error) {
    console.error('Rol ekleme hatası:', error);
    return res.status(400).json({ 
      success: false, 
      error: error.message || 'Rol eklenirken bir hata oluştu' 
    });
  }
});

// Rolleri listeleme
exports.rolListesiGetir = asyncHandler(async (req, res) => {
  try {
    const roller = await personelService.rolListesiGetir();
    
    return res.status(200).json({ 
      success: true, 
      data: roller
    });
  } catch (error) {
    console.error('Rol listesi getirme hatası:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Rol listesi getirilirken bir hata oluştu' 
    });
  }
});

// Export the middleware reference for use in routes
exports.yetkiKontrol = require('../middleware/auth').yetkiKontrol;
