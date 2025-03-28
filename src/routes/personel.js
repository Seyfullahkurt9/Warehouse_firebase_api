const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Collection name
const COLLECTION = 'personel';

/**
 * Get all personnel
 */
router.get('/', async (req, res) => {
  try {
    const personelSnapshot = await db.collection(COLLECTION).get();
    
    const personel = [];
    personelSnapshot.forEach(doc => {
      personel.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(personel);
  } catch (error) {
    console.error('Personel alınırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get personnel by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const personelDoc = await db.collection(COLLECTION).doc(req.params.id).get();
    
    if (!personelDoc.exists) {
      return res.status(404).json({ error: 'Personel bulunamadı' });
    }
    
    res.status(200).json({
      id: personelDoc.id,
      ...personelDoc.data()
    });
  } catch (error) {
    console.error('Personel alınırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create new personnel
 */
router.post('/', async (req, res) => {
  try {
    const { ad, soyad, tcKimlik, telefon, email, departman, pozisyon, maas, iseBaslamaTarihi, rolId } = req.body;
    
    // Check required fields
    if (!ad || !soyad || !tcKimlik) {
      return res.status(400).json({ error: 'Ad, soyad ve TC Kimlik numarası zorunludur' });
    }
    
    // Check if tcKimlik already exists
    const tcKimlikCheck = await db.collection(COLLECTION)
      .where('tcKimlik', '==', tcKimlik)
      .get();
    
    if (!tcKimlikCheck.empty) {
      return res.status(400).json({ error: 'Bu TC Kimlik numarası ile kayıtlı personel zaten mevcut' });
    }
    
    // Check if email already exists (if provided)
    if (email) {
      const emailCheck = await db.collection(COLLECTION)
        .where('email', '==', email)
        .get();
      
      if (!emailCheck.empty) {
        return res.status(400).json({ error: 'Bu e-posta adresi ile kayıtlı personel zaten mevcut' });
      }
    }
    
    const newPersonel = {
      ad,
      soyad,
      tcKimlik,
      telefon: telefon || '',
      email: email || '',
      departman: departman || '',
      pozisyon: pozisyon || '',
      maas: maas || 0,
      iseBaslamaTarihi: iseBaslamaTarihi ? new Date(iseBaslamaTarihi) : new Date(),
      rolId: rolId || null,
      aktif: true,
      izinler: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const personelRef = await db.collection(COLLECTION).add(newPersonel);
    
    res.status(201).json({
      id: personelRef.id,
      ...newPersonel
    });
  } catch (error) {
    console.error('Personel oluşturulurken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update personnel
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ad, soyad, tcKimlik, telefon, email, departman, pozisyon, maas, iseBaslamaTarihi, rolId, aktif, izinler } = req.body;
    
    // Check if personnel exists
    const personelDoc = await db.collection(COLLECTION).doc(id).get();
    
    if (!personelDoc.exists) {
      return res.status(404).json({ error: 'Personel bulunamadı' });
    }
    
    // Check if tcKimlik is changed and already exists
    if (tcKimlik && tcKimlik !== personelDoc.data().tcKimlik) {
      const tcKimlikCheck = await db.collection(COLLECTION)
        .where('tcKimlik', '==', tcKimlik)
        .get();
      
      if (!tcKimlikCheck.empty) {
        // Make sure it's not the same document
        const hasSameId = tcKimlikCheck.docs.some(doc => doc.id === id);
        if (!hasSameId) {
          return res.status(400).json({ error: 'Bu TC Kimlik numarası ile kayıtlı başka bir personel zaten mevcut' });
        }
      }
    }
    
    // Check if email is changed and already exists
    if (email && email !== personelDoc.data().email) {
      const emailCheck = await db.collection(COLLECTION)
        .where('email', '==', email)
        .get();
      
      if (!emailCheck.empty) {
        // Make sure it's not the same document
        const hasSameId = emailCheck.docs.some(doc => doc.id === id);
        if (!hasSameId) {
          return res.status(400).json({ error: 'Bu e-posta adresi ile kayıtlı başka bir personel zaten mevcut' });
        }
      }
    }
    
    const updateData = {
      updatedAt: new Date()
    };
    
    // Only update fields that are provided
    if (ad !== undefined) updateData.ad = ad;
    if (soyad !== undefined) updateData.soyad = soyad;
    if (tcKimlik !== undefined) updateData.tcKimlik = tcKimlik;
    if (telefon !== undefined) updateData.telefon = telefon;
    if (email !== undefined) updateData.email = email;
    if (departman !== undefined) updateData.departman = departman;
    if (pozisyon !== undefined) updateData.pozisyon = pozisyon;
    if (maas !== undefined) updateData.maas = maas;
    if (iseBaslamaTarihi !== undefined) updateData.iseBaslamaTarihi = new Date(iseBaslamaTarihi);
    if (rolId !== undefined) updateData.rolId = rolId;
    if (aktif !== undefined) updateData.aktif = aktif;
    if (izinler !== undefined) updateData.izinler = izinler;
    
    await db.collection(COLLECTION).doc(id).update(updateData);
    
    const updatedDoc = await db.collection(COLLECTION).doc(id).get();
    
    res.status(200).json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    console.error('Personel güncellenirken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete personnel
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if personnel exists
    const personelDoc = await db.collection(COLLECTION).doc(id).get();
    
    if (!personelDoc.exists) {
      return res.status(404).json({ error: 'Personel bulunamadı' });
    }
    
    await db.collection(COLLECTION).doc(id).delete();
    
    res.status(200).json({ 
      id,
      message: 'Personel başarıyla silindi' 
    });
  } catch (error) {
    console.error('Personel silinirken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Search personnel
 */
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { limit = 10 } = req.query;
    
    // Convert limit to number
    const limitNum = parseInt(limit);
    
    // Get all personnel (Firebase doesn't support text search directly)
    const personelSnapshot = await db.collection(COLLECTION).limit(100).get();
    
    // Filter by name, surname, or ID number
    const personel = [];
    personelSnapshot.forEach(doc => {
      const data = doc.data();
      // Simple case-insensitive search
      if (data.ad.toLowerCase().includes(term.toLowerCase()) || 
          data.soyad.toLowerCase().includes(term.toLowerCase()) || 
          data.tcKimlik.includes(term)) {
        personel.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    // Apply limit
    const limitedResults = personel.slice(0, limitNum);
    
    res.status(200).json(limitedResults);
  } catch (error) {
    console.error('Personel araması yapılırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
