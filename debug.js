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

console.log('\nDebug complete. Check the log above for any missing items.');
