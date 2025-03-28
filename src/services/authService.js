const { db, admin } = require('../config/firebase');
const { hashPassword, comparePassword, generateToken } = require('../utils/crypto');
const { isValidEmail } = require('../utils/validators');
const { sanitizeObject } = require('../utils/formatters');

/**
 * Authentication service
 */
class AuthService {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @return {Object} - User data and token
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error('E-posta ve şifre zorunludur');
    }
    
    if (!isValidEmail(email)) {
      throw new Error('Geçersiz e-posta formatı');
    }
    
    // Get user with the provided email
    const personelSnapshot = await db.collection('personel')
      .where('personel_eposta_adresi', '==', email)
      .get();
      
    if (personelSnapshot.empty) {
      throw new Error('Geçersiz e-posta veya şifre');
    }
    
    const personelDoc = personelSnapshot.docs[0];
    const personel = personelDoc.data();
    
    // Check password
    if (!comparePassword(password, personel.personel_sifre)) {
      throw new Error('Geçersiz e-posta veya şifre');
    }
    
    // Update last login time
    await db.collection('personel').doc(personel.personel_id).update({
      son_giris: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Get role permissions
    let yetkiler = [];
    if (personel.rol) {
      const rolDoc = await db.collection('roller')
        .where('rol_adi', '==', personel.rol)
        .limit(1)
        .get();
      
      if (!rolDoc.empty) {
        yetkiler = rolDoc.docs[0].data().yetkiler || [];
      }
    }
    
    // Generate token
    const token = generateToken({
      personel_id: personel.personel_id,
      role: personel.rol
    });
    
    // Remove sensitive data
    const userInfo = sanitizeObject(personel);
    
    return {
      user: {
        ...userInfo,
        yetkiler
      },
      token
    };
  }
  
  /**
   * Get user by ID
   * @param {string} personelId - User ID
   * @return {Object} - User data
   */
  async getUserById(personelId) {
    if (!personelId) {
      throw new Error('Personel ID gereklidir');
    }
    
    const personelDoc = await db.collection('personel').doc(personelId).get();
    
    if (!personelDoc.exists) {
      throw new Error('Personel bulunamadı');
    }
    
    // Remove sensitive data
    return sanitizeObject(personelDoc.data());
  }
  
  /**
   * Get user's last login info
   * @param {string} personelId - User ID
   * @return {Object} - Last login info
   */
  async getLastLoginInfo(personelId) {
    if (!personelId) {
      throw new Error('Personel ID gereklidir');
    }
    
    const personelDoc = await db.collection('personel').doc(personelId).get();
    
    if (!personelDoc.exists) {
      throw new Error('Personel bulunamadı');
    }
    
    const personel = personelDoc.data();
    
    return {
      personel_id: personel.personel_id,
      personel_ad: personel.personel_ad,
      personel_soyad: personel.personel_soyad,
      son_giris: personel.son_giris
    };
  }
}

module.exports = new AuthService();
