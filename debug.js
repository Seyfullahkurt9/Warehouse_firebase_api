const fs = require('fs');
const path = require('path');

// Check if important dependencies are installed
try {
  require('express');
  console.log('✅ express installed');
} catch (error) {
  console.log('❌ express not installed:', error.message);
}

try {
  require('jsonwebtoken');
  console.log('✅ jsonwebtoken installed');
} catch (error) {
  console.log('❌ jsonwebtoken not installed:', error.message);
}

try {
  require('multer');
  console.log('✅ multer installed');
} catch (error) {
  console.log('❌ multer not installed:', error.message);
}

// Check if important files exist
const requiredFiles = [
  './src/app.js',
  './src/config/firebase.js',
  './src/middleware/auth.js',
  './src/utils/crypto.js',
  './src/routes/index.js',
  './src/routes/firma.js',
  './src/routes/personel.js',
  './src/routes/stok.js',
  './src/routes/siparis.js',
  './src/routes/tedarikci.js',
  './src/routes/report.js',
  './src/routes/notification.js',
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} is missing`);
  }
});

// Check and validate JSON files
const jsonFiles = [
  './src/config/swagger-paths.json'
];

jsonFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`Validating ${file}...`);
    try {
      const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
      JSON.parse(content);
      console.log(`✅ ${file} is valid JSON`);
    } catch (error) {
      console.error(`❌ ${file} has invalid JSON:`, error.message);
      
      // Try to pinpoint the issue location
      const contentLines = content.split('\n');
      if (error.message.includes('position')) {
        const position = parseInt(error.message.match(/position (\d+)/)[1]);
        let lineNumber = 0;
        let charCount = 0;
        
        for (let i = 0; i < contentLines.length; i++) {
          charCount += contentLines[i].length + 1; // +1 for newline
          if (charCount >= position) {
            lineNumber = i + 1;
            break;
          }
        }
        
        console.log(`Error appears near line ${lineNumber}`);
        
        // Show context (3 lines before and after)
        const start = Math.max(0, lineNumber - 4);
        const end = Math.min(contentLines.length, lineNumber + 3);
        console.log('Context:');
        for (let i = start; i < end; i++) {
          console.log(`${i+1}: ${contentLines[i]}${i+1 === lineNumber ? ' << ERROR LIKELY HERE' : ''}`);
        }
      }
    }
  } else {
    console.log(`⚠️ ${file} does not exist`);
  }
});

// Check if .env variables are set
try {
  require('dotenv').config();
  console.log('Environment variables:');
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('- PORT:', process.env.PORT || 'not set');
  console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'set' : 'not set');
  console.log('- GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS || 'not set');
} catch (error) {
  console.log('❌ Error loading .env:', error.message);
}

require('dotenv').config();

console.log('=== Firebase Configuration Debug ===');

// Check if key environment variables are present
const keysToCheck = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
];

for (const key of keysToCheck) {
  console.log(`${key} exists: ${Boolean(process.env[key])}`);
}

// Check private key format
if (process.env.FIREBASE_PRIVATE_KEY) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  console.log('\nPrivate Key Analysis:');
  console.log('- Length:', privateKey.length);
  console.log('- Contains "BEGIN PRIVATE KEY":', privateKey.includes('BEGIN PRIVATE KEY'));
  console.log('- Contains "END PRIVATE KEY":', privateKey.includes('END PRIVATE KEY'));
  console.log('- Contains "\\n":', privateKey.includes('\\n'));
  console.log('- First 20 chars:', privateKey.substring(0, 20) + '...');
  console.log('- Last 20 chars:', '...' + privateKey.substring(privateKey.length - 20));
}

// Check if using service account file as fallback
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log('\nUsing service account file:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

console.log('\nTo fix the private key format in your .env file:');
console.log('1. Make sure the key is properly enclosed in quotes');
console.log('2. Verify that all newlines are represented as \\n');
console.log('3. The format should be: FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
console.log('4. Alternatively, use a service account JSON file and set GOOGLE_APPLICATION_CREDENTIALS=path/to/file.json');

console.log('\nDebug complete. Check the log above for any missing items.');
