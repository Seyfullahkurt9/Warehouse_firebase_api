const { db, admin } = require('../config/firebase');
const { validateRequiredFields, isValidTaxNumber, isValidEmail } = require('../utils/validators');

/**
 * Firma service for company management operations
 */
class FirmaService {
  /**
   * Add a new company
   * @param {Object} firmaData - Company data
   * @return {Object} - Created company data
   */
  async firmaEkle(firmaData) {
    // Validate required fields
    const requiredFields = ['firma_ad', 'firma_vergi_no', 'firma_telefon'];
    const validation = validateRequiredFields(firmaData, requiredFields);
    
    if (!validation.valid) {
      throw new Error(`${validation.missingFields.join(', ')} alanları zorunludur`);
    }

    // Validate tax number format
    if (!isValidTaxNumber(firmaData.firma_vergi_no)) {
      throw new Error('Geçersiz vergi numarası formatı');
    }

    // Validate email if provided
    if (firmaData.firma_eposta_adresi && !isValidEmail(firmaData.firma_eposta_adresi)) {
      throw new Error('Geçersiz e-posta formatı');
    }

    // Check if tax number is already registered
    const vergiKontrol = await db.collection('firma')
      .where('firma_vergi_no', '==', firmaData.firma_vergi_no)
      .get();
    
    if (!vergiKontrol.empty) {
      throw new Error('Bu vergi numarası ile kayıtlı bir firma zaten mevcut');
    }

    // Generate new company document
    const firmaRef = db.collection('firma').doc();
    const firma_id = firmaRef.id;

    const newFirma = {
      firma_id,
      firma_ad: firmaData.firma_ad,
      firma_vergi_no: firmaData.firma_vergi_no,
      firma_telefon: firmaData.firma_telefon,
      firma_adres: firmaData.firma_adres || null,
      firma_eposta_adresi: firmaData.firma_eposta_adresi || null,
      firma_sahibi: firmaData.firma_sahibi || null,
      olusturulma_tarihi: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save to database
    await firmaRef.set(newFirma);
    
    return { firma_id, ...firmaData };
  }

  /**
   * Get company details by ID
   * @param {string} firmaId - Company ID
   * @return {Object} - Company data
   */
  async firmaBilgileriGetir(firmaId) {
    if (!firmaId) {
      throw new Error('Firma ID gereklidir');
    }
    
    const firmaDoc = await db.collection('firma').doc(firmaId).get();

    if (!firmaDoc.exists) {
      throw new Error('Firma bulunamadı');
    }

    return firmaDoc.data();
  }

  /**
   * Update company details
   * @param {string} firmaId - Company ID
   * @param {Object} firmaData - Company data to update
   * @return {Object} - Updated company data
   */
  async firmaGuncelle(firmaId, firmaData) {
    if (!firmaId) {
      throw new Error('Firma ID gereklidir');
    }
    
    // Check if company exists
    const firmaDoc = await db.collection('firma').doc(firmaId).get();
    if (!firmaDoc.exists) {
      throw new Error('Güncellenecek firma bulunamadı');
    }
    
    // Prepare update data
    const updateData = {};
    const allowedFields = ['firma_ad', 'firma_telefon', 'firma_adres', 'firma_eposta_adresi'];
    
    for (const field of allowedFields) {
      if (firmaData[field] !== undefined) {
        updateData[field] = firmaData[field];
      }
    }
    
    // Validate email if provided
    if (updateData.firma_eposta_adresi && !isValidEmail(updateData.firma_eposta_adresi)) {
      throw new Error('Geçersiz e-posta formatı');
    }
    
    // Add update timestamp
    updateData.guncelleme_tarihi = admin.firestore.FieldValue.serverTimestamp();
    
    // Update in database
    await db.collection('firma').doc(firmaId).update(updateData);
    
    // Fetch and return updated data
    const updatedDoc = await db.collection('firma').doc(firmaId).get();
    return updatedDoc.data();
  }

  /**
   * Get all companies
   * @return {Array} - List of companies
   */
  async firmaListesiGetir() {
    const firmaSnapshot = await db.collection('firma')
      .where('_system_doc', '!=', true)
      .orderBy('_system_doc', 'asc')
      .orderBy('firma_ad', 'asc')
      .get();
    
    const firmalar = [];
    
    firmaSnapshot.forEach(doc => {
      const firma = doc.data();
      // Return only essential data for listing
      firmalar.push({
        firma_id: firma.firma_id,
        firma_ad: firma.firma_ad,
        firma_vergi_no: firma.firma_vergi_no,
        firma_telefon: firma.firma_telefon
      });
    });
    
    return firmalar;
  }
}

module.exports = new FirmaService();
