const { db, admin } = require('../config/firebase');
const { validateRequiredFields, isPositiveNumber } = require('../utils/validators');

/**
 * Order service for order management
 */
class SiparisService {
  /**
   * Create a new order
   * @param {Object} siparisData - Order data
   * @return {Object} - Created order data
   */
  async siparisOlustur(siparisData) {
    // Validate required fields
    const requiredFields = ['urun_kodu', 'urun_adi', 'urun_miktari', 'tedarikci_tedarikci_id', 'personel_personel_id'];
    const validation = validateRequiredFields(siparisData, requiredFields);
    
    if (!validation.valid) {
      throw new Error(`${validation.missingFields.join(', ')} alanları zorunludur`);
    }

    // Validate quantity
    if (!isPositiveNumber(siparisData.urun_miktari)) {
      throw new Error('Ürün miktarı pozitif bir sayı olmalıdır');
    }

    // Check if supplier exists
    const tedarikciDoc = await db.collection('tedarikci').doc(siparisData.tedarikci_tedarikci_id).get();
    if (!tedarikciDoc.exists) {
      throw new Error('Belirtilen tedarikçi bulunamadı');
    }

    // Check if personnel exists
    const personelDoc = await db.collection('personel').doc(siparisData.personel_personel_id).get();
    if (!personelDoc.exists) {
      throw new Error('Belirtilen personel bulunamadı');
    }

    // Generate new order document
    const siparisRef = db.collection('siparis').doc();
    const siparis_id = siparisRef.id;

    const newSiparis = {
      siparis_id,
      siparis_tarihi: admin.firestore.FieldValue.serverTimestamp(),
      urun_kodu: siparisData.urun_kodu,
      urun_adi: siparisData.urun_adi,
      urun_miktari: siparisData.urun_miktari,
      tedarikci_tedarikci_id: siparisData.tedarikci_tedarikci_id,
      personel_personel_id: siparisData.personel_personel_id,
      durum: 'beklemede'
    };

    // Save to database
    await siparisRef.set(newSiparis);
    
    return { siparis_id, ...siparisData, durum: 'beklemede' };
  }

  /**
   * Get order details by ID
   * @param {string} siparisId - Order ID
   * @return {Object} - Order data
   */
  async siparisBilgileriGetir(siparisId) {
    if (!siparisId) {
      throw new Error('Sipariş ID gereklidir');
    }
    
    const siparisDoc = await db.collection('siparis').doc(siparisId).get();

    if (!siparisDoc.exists) {
      throw new Error('Sipariş bulunamadı');
    }

    return siparisDoc.data();
  }

  /**
   * Get orders with optional filters
   * @param {Object} filters - Filter options
   * @return {Array} - List of orders
   */
  async siparisListesiGetir(filters = {}) {
    let query = db.collection('siparis').where('_system_doc', '!=', true);
    
    // Apply filters
    if (filters.tedarikci_id) {
      query = query.where('tedarikci_tedarikci_id', '==', filters.tedarikci_id);
    }
    
    if (filters.personel_id) {
      query = query.where('personel_personel_id', '==', filters.personel_id);
    }
    
    if (filters.durum) {
      query = query.where('durum', '==', filters.durum);
    }
    
    const siparisSnapshot = await query
      .orderBy('_system_doc', 'asc')
      .orderBy('siparis_tarihi', 'desc')
      .get();
    
    const siparisler = [];
    
    siparisSnapshot.forEach(doc => {
      siparisler.push(doc.data());
    });
    
    return siparisler;
  }

  /**
   * Update order status
   * @param {string} siparisId - Order ID
   * @param {string} durum - New status
   * @return {Object} - Updated order data
   */
  async siparisDurumuGuncelle(siparisId, durum) {
    if (!siparisId) {
      throw new Error('Sipariş ID gereklidir');
    }
    
    if (!durum || !['beklemede', 'onaylandı', 'teslim edildi', 'iptal'].includes(durum)) {
      throw new Error('Geçerli bir durum belirtmeniz gerekmektedir (beklemede, onaylandı, teslim edildi, iptal)');
    }

    const siparisDoc = await db.collection('siparis').doc(siparisId).get();
    if (!siparisDoc.exists) {
      throw new Error('Sipariş bulunamadı');
    }

    // Update order status
    await db.collection('siparis').doc(siparisId).update({
      durum: durum,
      guncelleme_tarihi: admin.firestore.FieldValue.serverTimestamp()
    });

    // Get updated order
    const updatedDoc = await db.collection('siparis').doc(siparisId).get();
    return updatedDoc.data();
  }

  /**
   * Process product entry from order
   * @param {string} siparisId - Order ID
   * @param {number} stokMiktari - Stock quantity
   * @return {Object} - Created stock entry data
   */
  async urunGirisiYap(siparisId, stokMiktari) {
    if (!siparisId) {
      throw new Error('Sipariş ID gereklidir');
    }
    
    if (!stokMiktari || isNaN(stokMiktari) || stokMiktari <= 0) {
      throw new Error('Geçerli bir stok miktarı belirtmelisiniz');
    }

    // Get order data
    const siparisDoc = await db.collection('siparis').doc(siparisId).get();
    if (!siparisDoc.exists) {
      throw new Error('Sipariş bulunamadı');
    }

    const siparisData = siparisDoc.data();

    // Create new stock entry
    const stokRef = db.collection('stok').doc();
    const stok_id = stokRef.id;
    
    const stokData = {
      stok_id,
      stok_giris_tarihi: admin.firestore.FieldValue.serverTimestamp(),
      stok_cikis_tarihi: null,
      stok_miktari: stokMiktari,
      siparis_siparis_id: siparisId,
      urun_kodu: siparisData.urun_kodu,
      urun_adi: siparisData.urun_adi
    };

    // Save stock entry
    await stokRef.set(stokData);
    
    // Update order status
    await db.collection('siparis').doc(siparisId).update({
      durum: 'teslim edildi',
      guncelleme_tarihi: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { stok_id, ...stokData };
  }
}

module.exports = new SiparisService();
