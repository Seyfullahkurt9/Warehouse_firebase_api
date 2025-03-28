const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Collection name
const COLLECTION = 'siparis';

/**
 * Get all orders
 */
router.get('/', async (req, res) => {
  try {
    const siparisSnapshot = await db.collection(COLLECTION).get();
    
    const siparisler = [];
    siparisSnapshot.forEach(doc => {
      siparisler.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(siparisler);
  } catch (error) {
    console.error('Siparişler alınırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get order by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const siparisDoc = await db.collection(COLLECTION).doc(req.params.id).get();
    
    if (!siparisDoc.exists) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    
    res.status(200).json({
      id: siparisDoc.id,
      ...siparisDoc.data()
    });
  } catch (error) {
    console.error('Sipariş alınırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create new order
 */
router.post('/', async (req, res) => {
  try {
    const { 
      siparisNo, firmaId, siparisTarihi, teslimatTarihi, durum, 
      urunler, toplamTutar, odemeDurumu, odemeYontemi, 
      faturaKesildi, notlar, kargoBilgisi 
    } = req.body;
    
    // Check required fields
    if (!siparisNo || !firmaId || !siparisTarihi || !urunler || !toplamTutar) {
      return res.status(400).json({ 
        error: 'Sipariş no, firma ID, sipariş tarihi, ürünler ve toplam tutar zorunludur' 
      });
    }
    
    // Check if siparisNo already exists
    const siparisNoCheck = await db.collection(COLLECTION)
      .where('siparisNo', '==', siparisNo)
      .get();
    
    if (!siparisNoCheck.empty) {
      return res.status(400).json({ error: 'Bu sipariş numarası ile kayıtlı sipariş zaten mevcut' });
    }
    
    // Check if firma exists
    const firmaDoc = await db.collection('firma').doc(firmaId).get();
    
    if (!firmaDoc.exists) {
      return res.status(400).json({ error: 'Belirtilen firma bulunamadı' });
    }
    
    const newSiparis = {
      siparisNo,
      firmaId,
      siparisTarihi: new Date(siparisTarihi),
      teslimatTarihi: teslimatTarihi ? new Date(teslimatTarihi) : null,
      durum: durum || 'Beklemede',
      urunler: urunler || [],
      toplamTutar: Number(toplamTutar),
      odemeDurumu: odemeDurumu || 'Ödenmedi',
      odemeYontemi: odemeYontemi || '',
      faturaKesildi: faturaKesildi || false,
      notlar: notlar || '',
      kargoBilgisi: kargoBilgisi || { 
        kargoFirmasi: '', 
        takipNumarasi: '' 
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const siparisRef = await db.collection(COLLECTION).add(newSiparis);
    
    res.status(201).json({
      id: siparisRef.id,
      ...newSiparis
    });
  } catch (error) {
    console.error('Sipariş oluşturulurken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update order
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      siparisNo, firmaId, siparisTarihi, teslimatTarihi, durum, 
      urunler, toplamTutar, odemeDurumu, odemeYontemi, 
      faturaKesildi, notlar, kargoBilgisi 
    } = req.body;
    
    // Check if siparis exists
    const siparisDoc = await db.collection(COLLECTION).doc(id).get();
    
    if (!siparisDoc.exists) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    
    // Check if siparisNo is changed and already exists
    if (siparisNo && siparisNo !== siparisDoc.data().siparisNo) {
      const siparisNoCheck = await db.collection(COLLECTION)
        .where('siparisNo', '==', siparisNo)
        .get();
      
      if (!siparisNoCheck.empty) {
        // Make sure it's not the same document
        const hasSameId = siparisNoCheck.docs.some(doc => doc.id === id);
        if (!hasSameId) {
          return res.status(400).json({ error: 'Bu sipariş numarası ile kayıtlı başka bir sipariş zaten mevcut' });
        }
      }
    }
    
    // Check if firma exists if firmaId is changed
    if (firmaId && firmaId !== siparisDoc.data().firmaId) {
      const firmaDoc = await db.collection('firma').doc(firmaId).get();
      
      if (!firmaDoc.exists) {
        return res.status(400).json({ error: 'Belirtilen firma bulunamadı' });
      }
    }
    
    const updateData = {
      updatedAt: new Date()
    };
    
    // Only update fields that are provided
    if (siparisNo !== undefined) updateData.siparisNo = siparisNo;
    if (firmaId !== undefined) updateData.firmaId = firmaId;
    if (siparisTarihi !== undefined) updateData.siparisTarihi = new Date(siparisTarihi);
    if (teslimatTarihi !== undefined) updateData.teslimatTarihi = teslimatTarihi ? new Date(teslimatTarihi) : null;
    if (durum !== undefined) updateData.durum = durum;
    if (urunler !== undefined) updateData.urunler = urunler;
    if (toplamTutar !== undefined) updateData.toplamTutar = Number(toplamTutar);
    if (odemeDurumu !== undefined) updateData.odemeDurumu = odemeDurumu;
    if (odemeYontemi !== undefined) updateData.odemeYontemi = odemeYontemi;
    if (faturaKesildi !== undefined) updateData.faturaKesildi = faturaKesildi;
    if (notlar !== undefined) updateData.notlar = notlar;
    if (kargoBilgisi !== undefined) updateData.kargoBilgisi = kargoBilgisi;
    
    await db.collection(COLLECTION).doc(id).update(updateData);
    
    const updatedDoc = await db.collection(COLLECTION).doc(id).get();
    
    res.status(200).json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    console.error('Sipariş güncellenirken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete order
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if siparis exists
    const siparisDoc = await db.collection(COLLECTION).doc(id).get();
    
    if (!siparisDoc.exists) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    
    await db.collection(COLLECTION).doc(id).delete();
    
    res.status(200).json({ 
      id,
      message: 'Sipariş başarıyla silindi' 
    });
  } catch (error) {
    console.error('Sipariş silinirken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Search orders
 */
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { limit = 10 } = req.query;
    
    // Convert limit to number
    const limitNum = parseInt(limit);
    
    // Get all orders (Firebase doesn't support text search directly)
    const siparisSnapshot = await db.collection(COLLECTION).limit(100).get();
    
    // Filter by order number or status
    const siparisler = [];
    siparisSnapshot.forEach(doc => {
      const data = doc.data();
      // Simple case-insensitive search
      if (data.siparisNo.toLowerCase().includes(term.toLowerCase()) || 
          (data.durum && data.durum.toLowerCase().includes(term.toLowerCase()))) {
        siparisler.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    // Apply limit
    const limitedResults = siparisler.slice(0, limitNum);
    
    res.status(200).json(limitedResults);
  } catch (error) {
    console.error('Sipariş araması yapılırken hata:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
