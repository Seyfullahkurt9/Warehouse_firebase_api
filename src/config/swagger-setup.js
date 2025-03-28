const swaggerUi = require('swagger-ui-express');
const swaggerConfig = require('./swagger-index');

/**
 * Swagger ayarlarını Express uygulamasına entegre eder
 * @param {Express.Application} app - Express uygulaması
 */
function setupSwagger(app) {
  // Swagger UI için dökümantasyon yolunu ayarla
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerConfig, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Depo/Stok Yönetim Sistemi API Dokümantasyonu',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        tagsSorter: 'alpha'
      }
    })
  );
  
  // Swagger JSON dosyasını sunmak için (başka araçlarla kullanılabilir)
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerConfig);
  });
  
  console.log('✅ Swagger dokümantasyon sistemi hazır: /api-docs');
}

module.exports = setupSwagger;
