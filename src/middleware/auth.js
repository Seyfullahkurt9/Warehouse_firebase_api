const { db } = require('../config/firebase');
const { verifyToken } = require('../utils/crypto');

/**
 * Authentication middleware to verify user tokens
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Yetkilendirme hatası: Token sağlanmadı' 
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        error: 'Yetkilendirme hatası: Geçersiz token' 
      });
    }
    
    // Get user from database
    const personelDoc = await db.collection('personel').doc(decoded.personel_id).get();
    if (!personelDoc.exists) {
      return res.status(401).json({ 
        success: false, 
        error: 'Yetkilendirme hatası: Kullanıcı bulunamadı' 
      });
    }
    
    // Add user to request object
    req.user = personelDoc.data();
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Yetkilendirme işlemi sırasında bir hata oluştu' 
    });
  }
};

/**
 * Authorization middleware to check user roles and permissions
 * @param {Array} requiredRoles - Array of roles that can access the route
 */
const authorize = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Yetkilendirme hatası: Kullanıcı bilgisi bulunamadı' 
        });
      }
      
      // If no roles are required, continue
      if (requiredRoles.length === 0) {
        return next();
      }
      
      const userRole = req.user.rol;
      
      // Check if user role is in required roles
      if (requiredRoles.includes(userRole)) {
        return next();
      }
      
      // Get role permissions
      const rolDoc = await db.collection('roller')
        .where('rol_adi', '==', userRole)
        .limit(1)
        .get();
      
      if (rolDoc.empty) {
        return res.status(403).json({ 
          success: false, 
          error: 'Yetkilendirme hatası: Rol bulunamadı' 
        });
      }
      
      const yetkiler = rolDoc.docs[0].data().yetkiler || [];
      
      // If user has 'tam_yetki', allow access
      if (yetkiler.includes('tam_yetki')) {
        return next();
      }
      
      // Check if user has any of the required permissions
      const hasPermission = requiredRoles.some(role => yetkiler.includes(role));
      
      if (!hasPermission) {
        return res.status(403).json({ 
          success: false, 
          error: 'Yetkilendirme hatası: Bu işlem için yetkiniz bulunmamaktadır' 
        });
      }
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Yetki kontrolü sırasında bir hata oluştu' 
      });
    }
  };
};

/**
 * Legacy middleware for role-based authorization (compatible with existing code)
 */
const yetkiKontrol = (gerekliYetkiler) => {
  return async (req, res, next) => {
    try {
      // Get personel_id from headers for backward compatibility
      const personel_id = req.headers['x-personel-id'];
      
      if (!personel_id) {
        return res.status(401).json({ 
          success: false, 
          error: 'Yetkilendirme başarısız: Kullanıcı bilgisi bulunamadı' 
        });
      }
      
      // Personel bilgilerini getir
      const personelDoc = await db.collection('personel').doc(personel_id).get();
      
      if (!personelDoc.exists) {
        return res.status(401).json({ 
          success: false, 
          error: 'Yetkilendirme başarısız: Personel bulunamadı' 
        });
      }
      
      const personel = personelDoc.data();
      
      // Kullanıcının rolünü kontrol et
      const rolDoc = await db.collection('roller')
        .where('rol_adi', '==', personel.rol)
        .limit(1)
        .get();
      
      if (rolDoc.empty) {
        return res.status(403).json({ 
          success: false, 
          error: 'Yetkilendirme başarısız: Rol bulunamadı' 
        });
      }
      
      const rol = rolDoc.docs[0].data();
      const yetkiler = rol.yetkiler || [];
      
      // Gerekli yetkiler kontrolü
      const yetkiVar = gerekliYetkiler.every(yetki => yetkiler.includes(yetki));
      
      if (!yetkiVar) {
        return res.status(403).json({ 
          success: false, 
          error: 'Yetkilendirme başarısız: Yetersiz yetki' 
        });
      }
      
      // Kullanıcı bilgilerini request'e ekle
      req.personel = personel;
      
      next();
    } catch (error) {
      console.error('Yetki kontrolü hatası:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Yetki kontrolü yapılırken bir hata oluştu' 
      });
    }
  };
};

module.exports = { authenticateToken, authorize, yetkiKontrol };
