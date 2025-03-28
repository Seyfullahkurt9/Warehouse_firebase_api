const { db } = require('../config/firebase');
const models = require('../models/models');

// Check if collection exists AND has documents in Firebase
async function collectionExists(collectionName) {
  if (!db) {
    console.error('Firebase database not initialized');
    return false;
  }
  
  try {
    // Get a snapshot of the collection with a limit of 1 document
    const snapshot = await db.collection(collectionName).limit(1).get();
    
    // A collection "exists" only if it has at least one document
    return !snapshot.empty;
  } catch (error) {
    console.error(`Error checking collection ${collectionName}:`, error);
    return false;
  }
}

// Create sample data in a collection
async function createSampleData(collectionName, model) {
  if (!db) return;
  
  try {
    // Create a sample document based on the model
    const sampleData = {};
    
    Object.keys(model.fields).forEach(field => {
      const fieldDef = model.fields[field];
      
      // Generate appropriate sample data based on field type
      switch(fieldDef.type) {
        case 'string':
          if (fieldDef.enum && fieldDef.enum.length > 0) {
            sampleData[field] = fieldDef.enum[0];
          } else {
            sampleData[field] = `Sample ${field}`;
          }
          break;
        case 'number':
          sampleData[field] = fieldDef.default || 1;
          break;
        case 'date':
          sampleData[field] = fieldDef.default === 'now' ? new Date() : new Date();
          break;
        case 'boolean':
          sampleData[field] = fieldDef.default !== undefined ? fieldDef.default : true;
          break;
        case 'array':
          if (field === 'yetkiler' && collectionName === 'roller') {
            sampleData[field] = ['firma_okuma', 'stok_okuma', 'siparis_okuma'];
          } else {
            sampleData[field] = [];
          }
          break;
        case 'reference':
          // For references, we'll just put a placeholder - these would need to be updated later
          if (fieldDef.refCollection === 'roller' && collectionName === 'kullanici') {
            sampleData[field] = 'admin_role_id';
          } else if (fieldDef.refCollection === 'firma' && collectionName === 'siparis') {
            sampleData[field] = 'sample_firma_id';
          } else {
            sampleData[field] = `sample_${fieldDef.refCollection}_id`;
          }
          break;
        default:
          if (fieldDef.default !== undefined) {
            sampleData[field] = fieldDef.default;
          } else {
            sampleData[field] = null;
          }
      }
    });
    
    // Handle nested objects (like kargoBilgisi in siparis model)
    Object.keys(model.fields).forEach(field => {
      const fieldDef = model.fields[field];
      if (typeof fieldDef === 'object' && fieldDef !== null && !Array.isArray(fieldDef) && 
          fieldDef.type === undefined && Object.keys(fieldDef).length > 0) {
        sampleData[field] = {};
        Object.keys(fieldDef).forEach(subField => {
          if (subField !== 'description') {
            sampleData[field][subField] = `Sample ${subField}`;
          }
        });
      }
    });
    
    // Add system fields
    sampleData.createdAt = new Date();
    sampleData.updatedAt = new Date();
    sampleData.isSampleData = true;
    
    // Add the sample document
    await db.collection(collectionName).add(sampleData);
    console.log(`Created sample document in ${collectionName} collection`);
  } catch (error) {
    console.error(`Error creating sample data in ${collectionName}:`, error);
  }
}

// Setup the database with required collections and schemas
async function setupDatabase() {
  if (!db) {
    console.error('Firebase database not initialized. Cannot set up database schema.');
    return;
  }
  
  try {
    console.log('Starting database setup...');
    
    // Process each model defined in our combined models file
    for (const [modelName, model] of Object.entries(models)) {
      const exists = await collectionExists(modelName);
      
      if (exists) {
        console.log(`✅ Collection '${modelName}' already exists in Firebase and has documents`);
      } else {
        console.log(`⚠️ Collection '${modelName}' is empty or does not exist. Creating sample data...`);
        
        // Create sample data to initialize the collection
        await createSampleData(modelName, model);
      }
    }
    
    console.log('✅ Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Force the creation of a collection with sample data, even if it exists
async function forceInitCollection(collectionName) {
  if (!db) {
    console.error('Firebase database not initialized');
    return;
  }
  
  try {
    const model = models[collectionName];
    if (!model) {
      console.error(`Model for collection '${collectionName}' not found`);
      return;
    }
    
    console.log(`Initializing collection '${collectionName}' with sample data...`);
    await createSampleData(collectionName, model);
    console.log(`✅ Collection '${collectionName}' initialized successfully`);
  } catch (error) {
    console.error(`Error initializing collection '${collectionName}':`, error);
  }
}

// Reset all collections by deleting all documents and re-creating sample data
async function resetAllCollections() {
  if (!db) {
    console.error('Firebase database not initialized');
    return;
  }
  
  try {
    console.log('Starting database reset...');
    
    for (const [modelName, model] of Object.entries(models)) {
      console.log(`Resetting collection '${modelName}'...`);
      
      // Get all documents in the collection
      const snapshot = await db.collection(modelName).get();
      
      // Delete all documents in batches of 500 (Firestore batch limit)
      const batchSize = 500;
      const batches = [];
      let batch = db.batch();
      let operationCount = 0;
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
        operationCount++;
        
        if (operationCount >= batchSize) {
          batches.push(batch.commit());
          batch = db.batch();
          operationCount = 0;
        }
      });
      
      // Commit any remaining operations
      if (operationCount > 0) {
        batches.push(batch.commit());
      }
      
      // Wait for all batches to complete
      if (batches.length > 0) {
        await Promise.all(batches);
        console.log(`Deleted all documents in '${modelName}'`);
      } else {
        console.log(`No documents to delete in '${modelName}'`);
      }
      
      // Create sample data
      await createSampleData(modelName, model);
      console.log(`✅ Collection '${modelName}' reset successfully`);
    }
    
    console.log('✅ Database reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

module.exports = {
  setupDatabase,
  collectionExists,
  createSampleData,
  forceInitCollection,
  resetAllCollections
};
