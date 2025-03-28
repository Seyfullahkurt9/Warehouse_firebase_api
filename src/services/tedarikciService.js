const { db, admin } = require('../config/firebase');
const { validateRequiredFields, isValidEmail } = require('../utils/validators');

/**
 * Supplier service for supplier management
 */
class TedarikciService {
  /**
   * Add a new supplier
   * @param {Object} tedarikciData - Supplier data
   * @return {Object} - Created supplier data
   */
  async tedarikciEkle(tedarikciData) {
    // Validate required fields
    const requiredFields = ['tedarikci_ad', 'tedarikci_telefon_no'];
    const validation = validateRequiredFields(tedarikciData, requiredFields);
    
    if (!validation.valid) {
      throw new Error(`${validation.missingFields.join(', ')} alanları zorunludur`);
    }

    // Validate email if provided
    if (tedarikciData.tedarikci_eposta_adresi && !isValidEmail(tedarikciData.tedarikci_eposta_adresi)) {
      throw new Error('Geçersiz e-posta formatı');
    }

    // Generate new supplier document
    const tedarikciRef = db.collection('tedarikci').doc();
    const tedarikci_id = tedarikciRef.id;

    const newTedarikci = {
      tedarikci_id,
      tedarikci_ad: tedarikciData.tedarikci_ad,
      tedarikci_telefon_no: tedarikciData.tedarikci_telefon_no,
      tedarikci_adresi: tedarikciData.tedarikci_adresi || null,
      tedarikci_eposta_adresi: tedarikciData.tedarikci_eposta_adresi || null,
      olusturulma_tarihi: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save to database
    await tedarikciRef.set(newTedarikci);
    
    return { tedarikci_id, ...tedarikciData };
  }

  /**
   * Get supplier details by ID
   * @param {string} tedarikciId - Supplier ID
   * @return {Object} - Supplier data
   */
  async tedarikciBilgileriGetir(tedarikciId) {
    if (!tedarikciId) {
      throw new Error('Tedarikçi ID gereklidir');
    }
    
    const tedarikciDoc = await db.collection('tedarikci').doc(tedarikciId).get();

    if (!tedarikciDoc.exists) {
      throw new Error('Tedarikçi bulunamadı');
    }

    return tedarikciDoc.data();
  }

  /**
   * Get all suppliers
   * @return {Array} - List of suppliers
   */
  async tedarikciListesiGetir() {
    const tedarikciSnapshot = await db.collection('tedarikci')
      .where('_system_doc', '!=', true)
      .orderBy('_system_doc', 'asc')
      .orderBy('tedarikci_ad', 'asc')
      .get();
    
    const tedarikciler = [];
    
    tedarikciSnapshot.forEach(doc => {
      tedarikciler.push(doc.data());
    });
    
    return tedarikciler;
  }
}

module.exports = new TedarikciService();
