const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Collection name
const COLLECTION = 'firma';

/**
 * Get all companies
 */
router.get('/', async (req, res) => {
  try {
    const firmaSnapshot = await db.collection(COLLECTION).get();
    
    const firmalar = [];
    firmaSnapshot.forEach(doc => {
      firmalar.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(firmalar);
  } catch (error) {
    console.error('Firmalar alınırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get company by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const firmaDoc = await db.collection(COLLECTION).doc(req.params.id).get();
    
    if (!firmaDoc.exists) {
      return res.status(404).json({ error: 'Firma bulunamadı' });
    }
    
    res.status(200).json({
      id: firmaDoc.id,
      ...firmaDoc.data()
    });
  } catch (error) {
    console.error('Firma alınırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create new company
 */
router.post('/', async (req, res) => {
  try {
    const { firmaAdi, vergiNo, adres, telefon, email, yetkiliKisi } = req.body;
    
    // Check required fields
    if (!firmaAdi || !vergiNo) {
      return res.status(400).json({ error: 'Firma adı ve vergi numarası zorunludur' });
    }
    
    // Check if vergiNo already exists
    const vergiNoCheck = await db.collection(COLLECTION)
      .where('vergiNo', '==', vergiNo)
      .get();
    
    if (!vergiNoCheck.empty) {
      return res.status(400).json({ error: 'Bu vergi numarası ile kayıtlı firma zaten mevcut' });
    }
    
    const newFirma = {
      firmaAdi,
      vergiNo,
      adres: adres || '',
      telefon: telefon || '',
      email: email || '',
      yetkiliKisi: yetkiliKisi || '',
      aktif: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const firmaRef = await db.collection(COLLECTION).add(newFirma);
    
    res.status(201).json({
      id: firmaRef.id,
      ...newFirma
    });
  } catch (error) {
    console.error('Firma oluşturulurken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update company
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firmaAdi, vergiNo, adres, telefon, email, yetkiliKisi, aktif } = req.body;
    
    // Check if firma exists
    const firmaDoc = await db.collection(COLLECTION).doc(id).get();
    
    if (!firmaDoc.exists) {
      return res.status(404).json({ error: 'Firma bulunamadı' });
    }
    
    // Check if vergiNo is changed and already exists
    if (vergiNo && vergiNo !== firmaDoc.data().vergiNo) {
      const vergiNoCheck = await db.collection(COLLECTION)
        .where('vergiNo', '==', vergiNo)
        .get();
      
      if (!vergiNoCheck.empty) {
        // Make sure it's not the same document
        const hasSameId = vergiNoCheck.docs.some(doc => doc.id === id);
        if (!hasSameId) {
          return res.status(400).json({ error: 'Bu vergi numarası ile kayıtlı başka bir firma zaten mevcut' });
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
    if (aktif !== undefined) updateData.aktif = aktif;
    
    await db.collection(COLLECTION).doc(id).update(updateData);
    
    const updatedDoc = await db.collection(COLLECTION).doc(id).get();
    
    res.status(200).json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    console.error('Firma güncellenirken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete company
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if firma exists
    const firmaDoc = await db.collection(COLLECTION).doc(id).get();
    
    if (!firmaDoc.exists) {
      return res.status(404).json({ error: 'Firma bulunamadı' });
    }
    
    await db.collection(COLLECTION).doc(id).delete();
    
    res.status(200).json({ 
      id,
      message: 'Firma başarıyla silindi' 
    });
  } catch (error) {
    console.error('Firma silinirken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Search companies
 */
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { limit = 10 } = req.query;
    
    // Convert limit to number
    const limitNum = parseInt(limit);
    
    // Get all companies (Firebase doesn't support text search directly)
    const firmaSnapshot = await db.collection(COLLECTION).limit(100).get();
    
    // Filter by name or tax number
    const firmalar = [];
    firmaSnapshot.forEach(doc => {
      const data = doc.data();
      // Simple case-insensitive search
      if (data.firmaAdi.toLowerCase().includes(term.toLowerCase()) || 
          data.vergiNo.includes(term)) {
        firmalar.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    // Apply limit
    const limitedResults = firmalar.slice(0, limitNum);
    
    res.status(200).json(limitedResults);
  } catch (error) {
    console.error('Firma araması yapılırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
