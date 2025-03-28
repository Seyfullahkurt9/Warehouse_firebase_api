const { db, admin } = require('../config/firebase');
const { hashPassword } = require('../utils/crypto');
const { validateRequiredFields, isValidEmail, isStrongPassword } = require('../utils/validators');
const { sanitizeObject } = require('../utils/formatters');

/**
 * Personnel service for staff management
 */
class PersonelService {
  /**
   * Add new personnel
   * @param {Object} personelData - Personnel data
   * @return {Object} - Created personnel data
   */
  async personelEkle(personelData) {
    // Validate required fields
    const requiredFields = ['personel_ad', 'personel_soyad', 'personel_eposta_adresi', 'personel_sifre', 'firma_firma_id'];
    const validation = validateRequiredFields(personelData, requiredFields);
    
    if (!validation.valid) {
      throw new Error(`${validation.missingFields.join(', ')} alanları zorunludur`);
    }

    // Validate email
    if (!isValidEmail(personelData.personel_eposta_adresi)) {
      throw new Error('Geçersiz e-posta formatı');
    }

    // Validate password strength
    if (!isStrongPassword(personelData.personel_sifre)) {
      throw new Error('Şifre en az 8 karakter uzunluğunda olmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir');
    }

    // Check if email is already registered
    const epostaKontrol = await db.collection('personel')
      .where('personel_eposta_adresi', '==', personelData.personel_eposta_adresi)
      .get();
    
    if (!epostaKontrol.empty) {
      throw new Error('Bu e-posta adresi ile kayıtlı personel bulunmaktadır');
    }

    // Check if company exists
    const firmaDoc = await db.collection('firma').doc(personelData.firma_firma_id).get();
    if (!firmaDoc.exists) {
      throw new Error('Belirtilen firma bulunamadı');
    }

    // Generate new personnel document
    const personelRef = db.collection('personel').doc();
    const personel_id = personelRef.id;

    const newPersonel = {
      personel_id,
      personel_ad: personelData.personel_ad,
      personel_soyad: personelData.personel_soyad,
      personel_telefon_no: personelData.personel_telefon_no || null,
      personel_eposta_adresi: personelData.personel_eposta_adresi,
      personel_sifre: hashPassword(personelData.personel_sifre),
      firma_firma_id: personelData.firma_firma_id,
      rol: personelData.rol || 'kullanici',
      olusturulma_tarihi: admin.firestore.FieldValue.serverTimestamp(),
      son_giris: null
    };

    // Save to database
    await personelRef.set(newPersonel);
    
    return { personel_id, ...sanitizeObject(newPersonel) };
  }

  /**
   * Get personnel list
   * @param {Object} filters - Filter options
   * @return {Array} - List of personnel
   */
  async personelListesiGetir(filters = {}) {
    let query = db.collection('personel').where('_system_doc', '!=', true);

    // Apply filters
    if (filters.firma_id) {
      query = query.where('firma_firma_id', '==', filters.firma_id);
    }

    const personelSnapshot = await query.get();
    
    const personeller = [];
    
    personelSnapshot.forEach(doc => {
      // Sanitize each personnel object (remove password)
      personeller.push(sanitizeObject(doc.data()));
    });
    
    return personeller;
  }

  /**
   * Get personnel's last login info
   * @param {string} personelId - Personnel ID
   * @return {Object} - Last login info
   */
  async sonGirisBilgisi(personelId) {
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

  /**
   * Add a new role
   * @param {Object} rolData - Role data
   * @return {Object} - Created role data
   */
  async rolEkle(rolData) {
    if (!rolData.rol_adi || !rolData.yetkiler || !Array.isArray(rolData.yetkiler)) {
      throw new Error('Rol adı ve yetkiler zorunludur');
    }

    // Check if role name is unique
    const rolKontrol = await db.collection('roller')
      .where('rol_adi', '==', rolData.rol_adi)
      .get();
    
    if (!rolKontrol.empty) {
      throw new Error('Bu rol adı zaten kullanılmaktadır');
    }

    // Generate new role document
    const rolRef = db.collection('roller').doc();
    const rol_id = rolRef.id;

    const newRol = {
      rol_id,
      rol_adi: rolData.rol_adi,
      yetkiler: rolData.yetkiler,
      olusturulma_tarihi: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save to database
    await rolRef.set(newRol);
    
    return { rol_id, ...rolData };
  }

  /**
   * Get list of roles
   * @return {Array} - List of roles
   */
  async rolListesiGetir() {
    const rolSnapshot = await db.collection('roller')
      .where('_system_doc', '!=', true)
      .orderBy('_system_doc', 'asc')
      .orderBy('rol_adi', 'asc')
      .get();
    
    const roller = [];
    
    rolSnapshot.forEach(doc => {
      roller.push(doc.data());
    });
    
    return roller;
  }
}

module.exports = new PersonelService();
