const { db } = require('../config/firebase');
const models = require('../models/models');

// Check if collection exists in Firebase
async function collectionExists(collectionName) {
  if (!db) {
    console.error('Firebase database not initialized');
    return false;
  }
  
  try {
    const snapshot = await db.collection(collectionName).limit(1).get();
    return true; // If no error, collection exists (even if empty)
  } catch (error) {
    if (error.code === 5) { // NOT_FOUND error code
      return false;
    }
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
        console.log(`✅ Collection '${modelName}' already exists in Firebase`);
      } else {
        console.log(`⚠️ Collection '${modelName}' does not exist in Firebase. Creating...`);
        
        // Create sample data to initialize the collection
        await createSampleData(modelName, model);
      }
    }
    
    console.log('✅ Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

module.exports = {
  setupDatabase,
  collectionExists,
  createSampleData
};
