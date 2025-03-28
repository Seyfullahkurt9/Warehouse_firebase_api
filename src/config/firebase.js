const admin = require('firebase-admin');

// Initialize Firebase
let db;
try {
  // Check if environment variables are available
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID', 
    'FIREBASE_PRIVATE_KEY_ID', 
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Initialize with environment variables
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    })
  });
  
  // Get Firestore instance
  db = admin.firestore();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error.message);
  
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

module.exports = { admin, db };
