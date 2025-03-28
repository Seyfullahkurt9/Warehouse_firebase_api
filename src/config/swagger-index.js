const swaggerConfig = require('./swagger');
const personelPathsExtension = require('./swagger-part2');
const siparisAndStokPaths = require('./swagger-part3');
const reportsAndNotificationsPaths = require('./swagger-part4');

// Personel modülü path'lerini ekle
Object.keys(personelPathsExtension).forEach(path => {
  swaggerConfig.paths[path] = personelPathsExtension[path];
});

// Sipariş ve Stok modülü path'lerini ekle
Object.keys(siparisAndStokPaths).forEach(path => {
  swaggerConfig.paths[path] = siparisAndStokPaths[path];
});

// Raporlar ve Bildirimler modülü path'lerini ekle
Object.keys(reportsAndNotificationsPaths).forEach(path => {
  swaggerConfig.paths[path] = reportsAndNotificationsPaths[path];
});

module.exports = swaggerConfig;
