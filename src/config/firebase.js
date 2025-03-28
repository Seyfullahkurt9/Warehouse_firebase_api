const admin = require('firebase-admin');
require('dotenv').config(); // .env dosyasını yüklemek için

// Initialize Firebase
let db;

try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
  
  db = admin.firestore();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error.message);
  console.error('Error details:', error);
  
  // Fallback to service account file if available
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      db = admin.firestore();
      console.log('Firebase initialized with service account file');
    } catch (fallbackError) {
      console.error('Fallback Firebase initialization failed:', fallbackError.message);
      console.error('Application will continue without Firebase. Some features may not work.');
      db = null;
    }
  } else {
    console.error('No Firebase credentials available. Application will continue without Firebase.');
    db = null;
  }
}

// Export Firebase services
const firestore = admin.firestore;
const auth = admin.auth();
const storage = admin.storage();

module.exports = {
  admin,
  db,
  firestore,
  auth,
  storage
};
