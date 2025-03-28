const { db, admin } = require('../config/firebase');
const { validateRequiredFields, isPositiveNumber } = require('../utils/validators');

/**
 * Stock service for product and stock management
 */
class StokService {
  /**
   * Add a new product
   * @param {Object} urunData - Product data
   * @return {Object} - Created product data
   */
  async urunEkle(urunData) {
    // Validate required fields
    const requiredFields = ['urun_kodu', 'urun_adi'];
    const validation = validateRequiredFields(urunData, requiredFields);
    
    if (!validation.valid) {
      throw new Error(`${validation.missingFields.join(', ')} alanları zorunludur`);
    }

    // Check if product code is unique
    const kodKontrol = await db.collection('urunler')
      .where('urun_kodu', '==', urunData.urun_kodu)
      .get();
    
    if (!kodKontrol.empty) {
      throw new Error('Bu ürün kodu ile kayıtlı bir ürün zaten mevcut');
    }

    // Generate new product document
    const urunRef = db.collection('urunler').doc();
    const urun_id = urunRef.id;

    const newUrun = {
      urun_id,
      urun_kodu: urunData.urun_kodu,
      urun_adi: urunData.urun_adi,
      urun_barkod: urunData.urun_barkod || null,
      depo_bilgisi: urunData.depo_bilgisi || null,
      resim_url: urunData.resim_url || null,
      olusturulma_tarihi: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save to database
    await urunRef.set(newUrun);
    
    // Add initial stock if provided
    if (urunData.baslangic_stok_miktari && isPositiveNumber(urunData.baslangic_stok_miktari)) {
      const stokRef = db.collection('stok').doc();
      const stokData = {
        stok_id: stokRef.id,
        stok_giris_tarihi: admin.firestore.FieldValue.serverTimestamp(),
        stok_cikis_tarihi: null,
        stok_miktari: parseFloat(urunData.baslangic_stok_miktari),
        siparis_siparis_id: null,
        urun_kodu: urunData.urun_kodu,
        urun_adi: urunData.urun_adi,
        aciklama: 'Başlangıç stoğu'
      };
      
      await stokRef.set(stokData);
    }
    
    return { urun_id, ...newUrun };
  }

  /**
   * Update product image
   * @param {string} urunId - Product ID
   * @param {string} resimUrl - Image URL
   * @return {Object} - Updated product data
   */
  async urunGorseliYukle(urunId, resimUrl) {
    if (!urunId) {
      throw new Error('Ürün ID gereklidir');
    }
    
    if (!resimUrl) {
      throw new Error('Resim URL gereklidir');
    }
    
    // Check if product exists
    const urunDoc = await db.collection('urunler').doc(urunId).get();
    if (!urunDoc.exists) {
      throw new Error('Ürün bulunamadı');
    }
    
    // Update product image
    await db.collection('urunler').doc(urunId).update({
      resim_url: resimUrl,
      guncelleme_tarihi: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Get updated product
    const updatedDoc = await db.collection('urunler').doc(urunId).get();
    return updatedDoc.data();
  }

  /**
   * Process product outgoing
   * @param {Object} cikisData - Outgoing data
   * @return {Object} - Created stock outgoing data
   */
  async urunCikisiYap(cikisData) {
    // Validate required fields
    const requiredFields = ['urun_kodu', 'cikis_miktari'];
    const validation = validateRequiredFields(cikisData, requiredFields);
    
    if (!validation.valid) {
      throw new Error(`${validation.missingFields.join(', ')} alanları zorunludur`);
    }

    if (!isPositiveNumber(cikisData.cikis_miktari)) {
      throw new Error('Geçerli bir çıkış miktarı belirtmelisiniz');
    }

    // Check if there's enough stock
    const stokSnapshot = await db.collection('stok')
      .where('urun_kodu', '==', cikisData.urun_kodu)
      .where('stok_cikis_tarihi', '==', null)
      .get();
    
    if (stokSnapshot.empty) {
      throw new Error('Bu ürün için stoğa giriş kaydı bulunamadı');
    }

    let toplamStok = 0;
    stokSnapshot.forEach(doc => {
      toplamStok += Number(doc.data().stok_miktari);
    });

    if (toplamStok < cikisData.cikis_miktari) {
      throw new Error(`Yeterli stok yok. Mevcut stok: ${toplamStok}`);
    }

    // Get product name
    const urunSnapshot = await db.collection('urunler')
      .where('urun_kodu', '==', cikisData.urun_kodu)
      .limit(1)
      .get();
      
    let urun_adi = "";
    if (!urunSnapshot.empty) {
      urun_adi = urunSnapshot.docs[0].data().urun_adi;
    }

    // Create stock outgoing record
    const stokRef = db.collection('stok').doc();
    const stok_id = stokRef.id;
    
    const stokData = {
      stok_id,
      stok_giris_tarihi: null,
      stok_cikis_tarihi: admin.firestore.FieldValue.serverTimestamp(),
      stok_miktari: -parseFloat(cikisData.cikis_miktari),
      urun_kodu: cikisData.urun_kodu,
      urun_adi,
      aciklama: cikisData.aciklama || 'Stok çıkışı'
    };

    // Save to database
    await stokRef.set(stokData);
    
    return { stok_id, ...stokData };
  }

  /**
   * Get stock movements with optional filters
   * @param {Object} filters - Filter options
   * @return {Array} - List of stock movements
   */
  async stokHareketleriGetir(filters = {}) {
    let query = db.collection('stok').where('_system_doc', '!=', true);
    
    // Apply product code filter
    if (filters.urun_kodu) {
      query = query.where('urun_kodu', '==', filters.urun_kodu);
    }
    
    // Get all movements first (date filtering will be done in JS)
    const stokSnapshot = await query.get();
    
    if (stokSnapshot.empty) {
      return [];
    }
    
    const hareketler = [];
    
    stokSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Date filtering
      if (filters.baslangic_tarihi || filters.bitis_tarihi) {
        const tarih = data.stok_giris_tarihi || data.stok_cikis_tarihi;
        
        if (tarih) {
          const hareketTarihi = tarih.toDate();
          
          if (filters.baslangic_tarihi && filters.bitis_tarihi) {
            if (hareketTarihi >= new Date(filters.baslangic_tarihi) && 
                hareketTarihi <= new Date(filters.bitis_tarihi)) {
              hareketler.push(data);
            }
          } else if (filters.baslangic_tarihi) {
            if (hareketTarihi >= new Date(filters.baslangic_tarihi)) {
              hareketler.push(data);
            }
          } else if (filters.bitis_tarihi) {
            if (hareketTarihi <= new Date(filters.bitis_tarihi)) {
              hareketler.push(data);
            }
          }
        }
      } else {
        // No date filter, add all movements
        hareketler.push(data);
      }
    });
    
    return hareketler;
  }

  /**
   * Get current stock status
   * @return {Array} - Current stock status for all products
   */
  async cariStokDurumuGetir() {
    // Get all products
    const urunSnapshot = await db.collection('urunler')
      .where('_system_doc', '!=', true)
      .get();
    
    if (urunSnapshot.empty) {
      return [];
    }
    
    const urunler = {};
    urunSnapshot.forEach(doc => {
      const urunData = doc.data();
      urunler[urunData.urun_kodu] = {
        urun_id: urunData.urun_id,
        urun_kodu: urunData.urun_kodu,
        urun_adi: urunData.urun_adi,
        depo_bilgisi: urunData.depo_bilgisi,
        stok_miktari: 0
      };
    });
    
    // Get stock movements
    const stokSnapshot = await db.collection('stok')
      .where('_system_doc', '!=', true)
      .get();
    
    stokSnapshot.forEach(doc => {
      const stokData = doc.data();
      const { urun_kodu, stok_miktari } = stokData;
      
      if (urunler[urun_kodu]) {
        urunler[urun_kodu].stok_miktari += Number(stok_miktari);
      }
    });
    
    // Convert object to array
    return Object.values(urunler);
  }

  /**
   * Get all products
   * @return {Array} - List of products
   */
  async urunListesiGetir() {
    const urunSnapshot = await db.collection('urunler')
      .where('_system_doc', '!=', true)
      .orderBy('_system_doc', 'asc')
      .orderBy('urun_adi', 'asc')
      .get();
    
    if (urunSnapshot.empty) {
      return [];
    }
    
    const urunler = [];
    urunSnapshot.forEach(doc => {
      urunler.push(doc.data());
    });
    
    return urunler;
  }
}

module.exports = new StokService();
