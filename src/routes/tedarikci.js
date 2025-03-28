const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Collection name
const COLLECTION = 'tedarikci';

/**
 * Get all suppliers
 */
router.get('/', async (req, res) => {
  try {
    const tedarikciSnapshot = await db.collection(COLLECTION).get();
    
    const tedarikciler = [];
    tedarikciSnapshot.forEach(doc => {
      tedarikciler.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(tedarikciler);
  } catch (error) {
    console.error('Tedarikçiler alınırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get supplier by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const tedarikciDoc = await db.collection(COLLECTION).doc(req.params.id).get();
    
    if (!tedarikciDoc.exists) {
      return res.status(404).json({ error: 'Tedarikçi bulunamadı' });
    }
    
    res.status(200).json({
      id: tedarikciDoc.id,
      ...tedarikciDoc.data()
    });
  } catch (error) {
    console.error('Tedarikçi alınırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create new supplier
 */
router.post('/', async (req, res) => {
  try {
    const { 
      firmaAdi, vergiNo, adres, telefon, email, 
      yetkiliKisi, urunKategorileri, teslimatSuresi, notlar 
    } = req.body;
    
    // Check required fields
    if (!firmaAdi || !vergiNo) {
      return res.status(400).json({ error: 'Firma adı ve vergi numarası zorunludur' });
    }
    
    // Check if vergiNo already exists
    const vergiNoCheck = await db.collection(COLLECTION)
      .where('vergiNo', '==', vergiNo)
      .get();
    
    if (!vergiNoCheck.empty) {
      return res.status(400).json({ error: 'Bu vergi numarası ile kayıtlı tedarikçi zaten mevcut' });
    }
    
    const newTedarikci = {
      firmaAdi,
      vergiNo,
      adres: adres || '',
      telefon: telefon || '',
      email: email || '',
      yetkiliKisi: yetkiliKisi || '',
      urunKategorileri: urunKategorileri || [],
      teslimatSuresi: teslimatSuresi ? Number(teslimatSuresi) : null,
      notlar: notlar || '',
      sonSiparisTarihi: null,
      aktif: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const tedarikciRef = await db.collection(COLLECTION).add(newTedarikci);
    
    res.status(201).json({
      id: tedarikciRef.id,
      ...newTedarikci
    });
  } catch (error) {
    console.error('Tedarikçi oluşturulurken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update supplier
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      firmaAdi, vergiNo, adres, telefon, email, 
      yetkiliKisi, urunKategorileri, teslimatSuresi, 
      notlar, sonSiparisTarihi, aktif 
    } = req.body;
    
    // Check if tedarikci exists
    const tedarikciDoc = await db.collection(COLLECTION).doc(id).get();
    
    if (!tedarikciDoc.exists) {
      return res.status(404).json({ error: 'Tedarikçi bulunamadı' });
    }
    
    // Check if vergiNo is changed and already exists
    if (vergiNo && vergiNo !== tedarikciDoc.data().vergiNo) {
      const vergiNoCheck = await db.collection(COLLECTION)
        .where('vergiNo', '==', vergiNo)
        .get();
      
      if (!vergiNoCheck.empty) {
        // Make sure it's not the same document
        const hasSameId = vergiNoCheck.docs.some(doc => doc.id === id);
        if (!hasSameId) {
          return res.status(400).json({ error: 'Bu vergi numarası ile kayıtlı başka bir tedarikçi zaten mevcut' });
        }
      }
    }
    
    const updateData = {
      updatedAt: new Date()
    };
    
    // Only update fields that are provided
    if (firmaAdi !== undefined) updateData.firmaAdi = firmaAdi;
    if (vergiNo !== undefined) updateData.vergiNo = vergiNo;
    if (adres !== undefined) updateData.adres = adres;
    if (telefon !== undefined) updateData.telefon = telefon;
    if (email !== undefined) updateData.email = email;
    if (yetkiliKisi !== undefined) updateData.yetkiliKisi = yetkiliKisi;
    if (urunKategorileri !== undefined) updateData.urunKategorileri = urunKategorileri;
    if (teslimatSuresi !== undefined) updateData.teslimatSuresi = teslimatSuresi ? Number(teslimatSuresi) : null;
    if (notlar !== undefined) updateData.notlar = notlar;
    if (sonSiparisTarihi !== undefined) updateData.sonSiparisTarihi = sonSiparisTarihi ? new Date(sonSiparisTarihi) : null;
    if (aktif !== undefined) updateData.aktif = aktif;
    
    await db.collection(COLLECTION).doc(id).update(updateData);
    
    const updatedDoc = await db.collection(COLLECTION).doc(id).get();
    
    res.status(200).json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    console.error('Tedarikçi güncellenirken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete supplier
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if tedarikci exists
    const tedarikciDoc = await db.collection(COLLECTION).doc(id).get();
    
    if (!tedarikciDoc.exists) {
      return res.status(404).json({ error: 'Tedarikçi bulunamadı' });
    }
    
    await db.collection(COLLECTION).doc(id).delete();
    
    res.status(200).json({ 
      id,
      message: 'Tedarikçi başarıyla silindi' 
    });
  } catch (error) {
    console.error('Tedarikçi silinirken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Search suppliers
 */
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { limit = 10 } = req.query;
    
    // Convert limit to number
    const limitNum = parseInt(limit);
    
    // Get all suppliers (Firebase doesn't support text search directly)
    const tedarikciSnapshot = await db.collection(COLLECTION).limit(100).get();
    
    // Filter by company name or tax number
    const tedarikciler = [];
    tedarikciSnapshot.forEach(doc => {
      const data = doc.data();
      // Simple case-insensitive search
      if (data.firmaAdi.toLowerCase().includes(term.toLowerCase()) || 
          data.vergiNo.includes(term)) {
        tedarikciler.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    // Apply limit
    const limitedResults = tedarikciler.slice(0, limitNum);
    
    res.status(200).json(limitedResults);
  } catch (error) {
    console.error('Tedarikçi araması yapılırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
