const { db, admin } = require('../config/firebase');
const { collections } = require('../models/schema');

// Function to check if collections exist and create them if they don't
async function initializeDatabase() {
  console.log('Checking database structure...');
  
  try {
    // If db is null, Firebase initialization failed
    if (!db) {
      console.warn('Skipping database initialization because Firebase is not initialized');
      return { success: false, reason: 'Firebase not initialized' };
    }
    
    for (const collectionName in collections) {
      const collectionRef = db.collection(collectionName);
      const snapshot = await collectionRef.limit(1).get();
      
      if (snapshot.empty) {
        console.log(`Collection '${collectionName}' does not exist. Creating...`);
        // Create sample document to establish collection
        await collectionRef.doc('structure').set({
          _description: `${collectionName} collection for warehouse management system`,
          _fields: collections[collectionName].fields,
          _system_doc: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Collection '${collectionName}' created successfully.`);
      } else {
        console.log(`Collection '${collectionName}' already exists.`);
        // Eğer koleksiyon zaten varsa yapılacak işlemler buraya yazılabilir
        // Örneğin: Veri doğrulama, güncelleme, kontrol işlemleri vb.
      }
    }
    console.log('Database structure verification completed.');
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { initializeDatabase };
