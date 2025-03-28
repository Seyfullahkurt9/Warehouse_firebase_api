const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Collection name
const COLLECTION = 'stok';

/**
 * Get all inventory items
 */
router.get('/', async (req, res) => {
  try {
    const stokSnapshot = await db.collection(COLLECTION).get();
    
    const items = [];
    stokSnapshot.forEach(doc => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(items);
  } catch (error) {
    console.error('Stok verileri alınırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get inventory item by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const stokDoc = await db.collection(COLLECTION).doc(req.params.id).get();
    
    if (!stokDoc.exists) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    
    res.status(200).json({
      id: stokDoc.id,
      ...stokDoc.data()
    });
  } catch (error) {
    console.error('Ürün alınırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create new inventory item
 */
router.post('/', async (req, res) => {
  try {
    const { 
      urunKodu, urunAdi, kategori, birim, birimFiyat, stokMiktari,
      kritikStokSeviyesi, resimUrl, tedarikciId, rafYeri 
    } = req.body;
    
    // Check required fields
    if (!urunKodu || !urunAdi || birimFiyat === undefined || stokMiktari === undefined) {
      return res.status(400).json({ error: 'Ürün kodu, ürün adı, birim fiyat ve stok miktarı zorunludur' });
    }
    
    // Check if urunKodu already exists
    const urunKoduCheck = await db.collection(COLLECTION)
      .where('urunKodu', '==', urunKodu)
      .get();
    
    if (!urunKoduCheck.empty) {
      return res.status(400).json({ error: 'Bu ürün kodu ile kayıtlı ürün zaten mevcut' });
    }
    
    const newStok = {
      urunKodu,
      urunAdi,
      kategori: kategori || '',
      birim: birim || 'adet',
      birimFiyat: Number(birimFiyat),
      stokMiktari: Number(stokMiktari),
      kritikStokSeviyesi: kritikStokSeviyesi !== undefined ? Number(kritikStokSeviyesi) : 0,
      resimUrl: resimUrl || '',
      tedarikciId: tedarikciId || '',
      rafYeri: rafYeri || '',
      sonGuncellemeTarihi: new Date(),
      aktif: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const stokRef = await db.collection(COLLECTION).add(newStok);
    
    res.status(201).json({
      id: stokRef.id,
      ...newStok
    });
  } catch (error) {
    console.error('Ürün oluşturulurken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update inventory item
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      urunKodu, urunAdi, kategori, birim, birimFiyat, stokMiktari,
      kritikStokSeviyesi, resimUrl, tedarikciId, rafYeri, aktif 
    } = req.body;
    
    // Check if stok exists
    const stokDoc = await db.collection(COLLECTION).doc(id).get();
    
    if (!stokDoc.exists) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    
    // Check if urunKodu is changed and already exists
    if (urunKodu && urunKodu !== stokDoc.data().urunKodu) {
      const urunKoduCheck = await db.collection(COLLECTION)
        .where('urunKodu', '==', urunKodu)
        .get();
      
      if (!urunKoduCheck.empty) {
        // Make sure it's not the same document
        const hasSameId = urunKoduCheck.docs.some(doc => doc.id === id);
        if (!hasSameId) {
          return res.status(400).json({ error: 'Bu ürün kodu ile kayıtlı başka bir ürün zaten mevcut' });
        }
      }
    }
    
    const updateData = {
      updatedAt: new Date(),
      sonGuncellemeTarihi: new Date()
    };
    
    // Only update fields that are provided
    if (urunKodu !== undefined) updateData.urunKodu = urunKodu;
    if (urunAdi !== undefined) updateData.urunAdi = urunAdi;
    if (kategori !== undefined) updateData.kategori = kategori;
    if (birim !== undefined) updateData.birim = birim;
    if (birimFiyat !== undefined) updateData.birimFiyat = Number(birimFiyat);
    if (stokMiktari !== undefined) updateData.stokMiktari = Number(stokMiktari);
    if (kritikStokSeviyesi !== undefined) updateData.kritikStokSeviyesi = Number(kritikStokSeviyesi);
    if (resimUrl !== undefined) updateData.resimUrl = resimUrl;
    if (tedarikciId !== undefined) updateData.tedarikciId = tedarikciId;
    if (rafYeri !== undefined) updateData.rafYeri = rafYeri;
    if (aktif !== undefined) updateData.aktif = aktif;
    
    await db.collection(COLLECTION).doc(id).update(updateData);
    
    const updatedDoc = await db.collection(COLLECTION).doc(id).get();
    
    res.status(200).json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    console.error('Ürün güncellenirken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete inventory item
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if stok exists
    const stokDoc = await db.collection(COLLECTION).doc(id).get();
    
    if (!stokDoc.exists) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    
    await db.collection(COLLECTION).doc(id).delete();
    
    res.status(200).json({ 
      id,
      message: 'Ürün başarıyla silindi' 
    });
  } catch (error) {
    console.error('Ürün silinirken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Search inventory items
 */
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { limit = 10 } = req.query;
    
    // Convert limit to number
    const limitNum = parseInt(limit);
    
    // Get all inventory items (Firebase doesn't support text search directly)
    const stokSnapshot = await db.collection(COLLECTION).limit(100).get();
    
    // Filter by product code, name, or category
    const items = [];
    stokSnapshot.forEach(doc => {
      const data = doc.data();
      // Simple case-insensitive search
      if (data.urunKodu.toLowerCase().includes(term.toLowerCase()) || 
          data.urunAdi.toLowerCase().includes(term.toLowerCase()) || 
          (data.kategori && data.kategori.toLowerCase().includes(term.toLowerCase()))) {
        items.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    // Apply limit
    const limitedResults = items.slice(0, limitNum);
    
    res.status(200).json(limitedResults);
  } catch (error) {
    console.error('Ürün araması yapılırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
