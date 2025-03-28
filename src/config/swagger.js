const path = require('path');
const fs = require('fs');

/**
 * API TASARIM ŞEMASI
 * 
 * Bu dosya, API'nin yapısını açıklar ve Swagger UI'da gösterilmesi planlanan tüm rotaları içerir.
 * 
 * API BİLGİLERİ:
 * - Başlık: Depo/Stok Yönetim Sistemi API
 * - Sürüm: 1.0.0
 * - Açıklama: Depo ve stok yönetim işlemleri için API
 * - Sunucular: http://localhost:3000/api
 * 
 * MODÜL YAPISI:
 * 
 * 1. FİRMA YÖNETİMİ
 * - GET /api/firma - Tüm firmaları listeler
 * - GET /api/firma/:firma_id - Firma detayını getirir
 * - POST /api/firma - Yeni firma ekler
 * - PUT /api/firma/:firma_id - Firma bilgilerini günceller
 * 
 * 2. PERSONEL YÖNETİMİ
 * - GET /api/personel - Tüm personeli listeler
 * - GET /api/personel/:personel_id - Personel detayını getirir
 * - POST /api/personel - Yeni personel ekler
 * - POST /api/personel/giris - Giriş yapar
 * - GET /api/personel/:personel_id/son-giris - Son giriş bilgilerini getirir
 * - GET /api/personel/roller - Rolleri listeler
 * - POST /api/personel/roller - Yeni rol ekler
 * 
 * 3. TEDARİKÇİ YÖNETİMİ
 * - GET /api/tedarikci - Tüm tedarikçileri listeler
 * - GET /api/tedarikci/:tedarikci_id - Tedarikçi detayını getirir
 * - POST /api/tedarikci - Yeni tedarikçi ekler
 * 
 * 4. SİPARİŞ YÖNETİMİ
 * - GET /api/siparis - Siparişleri listeler
 * - GET /api/siparis/:siparis_id - Sipariş detayını getirir
 * - POST /api/siparis - Yeni sipariş oluşturur
 * - PUT /api/siparis/:siparis_id/durum - Sipariş durumunu günceller
 * - POST /api/siparis/:siparis_id/urun-girisi - Sipariş üzerinden ürün girişi yapar
 * 
 * 5. STOK YÖNETİMİ
 * - GET /api/stok/urunler - Ürünleri listeler
 * - POST /api/stok/urunler - Yeni ürün ekler
 * - POST /api/stok/urunler/:urun_id/gorsel - Ürün görseli yükler
 * - POST /api/stok/cikis - Ürün çıkışı yapar
 * - GET /api/stok/hareketler - Stok hareketlerini getirir
 * - GET /api/stok/durum - Cari stok durumunu getirir
 * 
 * 6. RAPORLAR
 * - GET /api/reports/stock-status - Stok durum raporu getirir
 * - GET /api/reports/order-status - Sipariş durum raporu getirir
 * - GET /api/reports/supplier-performance - Tedarikçi performans raporu getirir
 * 
 * 7. BİLDİRİMLER
 * - GET /api/notifications - Bildirimleri getirir
 * - PUT /api/notifications/:notification_id/read - Bildirimi okundu olarak işaretler
 * - POST /api/notifications/send/user - Kullanıcıya bildirim gönderir
 * - POST /api/notifications/send/role - Rol bazlı bildirim gönderir
 * 
 * VERİ MODELLERİ:
 * 
 * 1. Firma: {
 *    firma_id, firma_ad, firma_vergi_no, firma_telefon, firma_adres, firma_eposta_adresi, firma_sahibi
 * }
 * 
 * 2. Personel: {
 *    personel_id, personel_ad, personel_soyad, personel_telefon_no, personel_eposta_adresi, 
 *    personel_sifre, firma_firma_id, rol, son_giris
 * }
 * 
 * 3. Tedarikçi: {
 *    tedarikci_id, tedarikci_ad, tedarikci_telefon_no, tedarikci_adresi, tedarikci_eposta_adresi
 * }
 * 
 * 4. Sipariş: {
 *    siparis_id, siparis_tarihi, urun_kodu, urun_adi, urun_miktari, tedarikci_tedarikci_id,
 *    personel_personel_id, durum (beklemede/onaylandı/teslim edildi/iptal)
 * }
 * 
 * 5. Stok: {
 *    stok_id, stok_giris_tarihi, stok_cikis_tarihi, stok_miktari, siparis_siparis_id,
 *    urun_kodu, urun_adi, aciklama
 * }
 * 
 * 6. Ürün: {
 *    urun_id, urun_kodu, urun_adi, urun_barkod, depo_bilgisi, resim_url
 * }
 * 
 * 7. Rol: {
 *    rol_id, rol_adi, yetkiler[]
 * }
 * 
 * 8. Bildirim: {
 *    notification_id, user_id, title, message, type, is_read, created_at, read_at
 * }
 * 
 * GÜVENLİK:
 * - JWT token kullanılarak kimlik doğrulama yapılır
 * - Her endpoint için yetkilendirme kontrolleri mevcuttur
 */

// Basit bir swagger yapılandırması - daha sonra genişletilebilir
const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Depo/Stok Yönetim Sistemi API',
    version: '1.0.0',
    description: 'Bu API, depo ve stok yönetim işlemleri için gerekli endpointleri sağlar'
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Geliştirme sunucusu'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string'
          },
          error: {
            type: 'string'
          }
        }
      },
      Firma: {
        type: 'object',
        properties: {
          firma_id: { type: 'integer' },
          firma_ad: { type: 'string' },
          firma_vergi_no: { type: 'string' },
          firma_telefon: { type: 'string' },
          firma_adres: { type: 'string' },
          firma_eposta_adresi: { type: 'string' },
          firma_sahibi: { type: 'string' }
        }
      },
      Personel: {
        type: 'object',
        properties: {
          personel_id: { type: 'integer' },
          personel_ad: { type: 'string' },
          personel_soyad: { type: 'string' },
          personel_telefon_no: { type: 'string' },
          personel_eposta_adresi: { type: 'string' },
          personel_sifre: { type: 'string' },
          firma_firma_id: { type: 'integer' },
          rol: { type: 'string' },
          son_giris: { type: 'string', format: 'date-time' }
        }
      },
      Tedarikci: {
        type: 'object',
        properties: {
          tedarikci_id: { type: 'integer' },
          tedarikci_ad: { type: 'string' },
          tedarikci_telefon_no: { type: 'string' },
          tedarikci_adresi: { type: 'string' },
          tedarikci_eposta_adresi: { type: 'string' }
        }
      },
      Siparis: {
        type: 'object',
        properties: {
          siparis_id: { type: 'integer' },
          siparis_tarihi: { type: 'string', format: 'date-time' },
          urun_kodu: { type: 'string' },
          urun_adi: { type: 'string' },
          urun_miktari: { type: 'number' },
          tedarikci_tedarikci_id: { type: 'integer' },
          personel_personel_id: { type: 'integer' },
          durum: { 
            type: 'string', 
            enum: ['beklemede', 'onaylandı', 'teslim edildi', 'iptal'] 
          }
        }
      },
      Stok: {
        type: 'object',
        properties: {
          stok_id: { type: 'integer' },
          stok_giris_tarihi: { type: 'string', format: 'date-time' },
          stok_cikis_tarihi: { type: 'string', format: 'date-time' },
          stok_miktari: { type: 'number' },
          siparis_siparis_id: { type: 'integer' },
          urun_kodu: { type: 'string' },
          urun_adi: { type: 'string' },
          aciklama: { type: 'string' }
        }
      },
      Urun: {
        type: 'object',
        properties: {
          urun_id: { type: 'integer' },
          urun_kodu: { type: 'string' },
          urun_adi: { type: 'string' },
          urun_barkod: { type: 'string' },
          depo_bilgisi: { type: 'string' },
          resim_url: { type: 'string' }
        }
      },
      Rol: {
        type: 'object',
        properties: {
          rol_id: { type: 'integer' },
          rol_adi: { type: 'string' },
          yetkiler: { 
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      Bildirim: {
        type: 'object',
        properties: {
          notification_id: { type: 'integer' },
          user_id: { type: 'integer' },
          title: { type: 'string' },
          message: { type: 'string' },
          type: { type: 'string' },
          is_read: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          read_at: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  paths: {
    // Firma Yönetimi
    '/firma': {
      get: {
        tags: ['Firma Yönetimi'],
        summary: 'Tüm firmaları listeler',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Başarılı',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Firma' }
                }
              }
            }
          },
          '401': {
            description: 'Yetkisiz erişim',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Firma Yönetimi'],
        summary: 'Yeni firma ekler',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firma_ad', 'firma_vergi_no'],
                properties: {
                  firma_ad: { type: 'string' },
                  firma_vergi_no: { type: 'string' },
                  firma_telefon: { type: 'string' },
                  firma_adres: { type: 'string' },
                  firma_eposta_adresi: { type: 'string' },
                  firma_sahibi: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Firma başarıyla oluşturuldu',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Firma' }
              }
            }
          },
          '400': {
            description: 'Geçersiz veri',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/firma/{firma_id}': {
      get: {
        tags: ['Firma Yönetimi'],
        summary: 'Firma detayını getirir',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'firma_id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Firma ID'
          }
        ],
        responses: {
          '200': {
            description: 'Başarılı',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Firma' }
              }
            }
          },
          '404': {
            description: 'Firma bulunamadı',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Firma Yönetimi'],
        summary: 'Firma bilgilerini günceller',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'firma_id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Firma ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firma_ad: { type: 'string' },
                  firma_vergi_no: { type: 'string' },
                  firma_telefon: { type: 'string' },
                  firma_adres: { type: 'string' },
                  firma_eposta_adresi: { type: 'string' },
                  firma_sahibi: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Firma başarıyla güncellendi',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Firma' }
              }
            }
          },
          '404': {
            description: 'Firma bulunamadı',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    }
  }
};

// Personel Yönetimi path'leri
swaggerConfig.paths['/personel'] = {
  get: {
    tags: ['Personel Yönetimi'],
    summary: 'Tüm personeli listeler',
    security: [{ bearerAuth: [] }],
    responses: {
      '200': {
        description: 'Başarılı',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/Personel' }
            }
          }
        }
      }
    }
  },
  post: {
    tags: ['Personel Yönetimi'],
    summary: 'Yeni personel ekler',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['personel_ad', 'personel_soyad', 'personel_eposta_adresi', 'personel_sifre'],
            properties: {
              personel_ad: { type: 'string' },
              personel_soyad: { type: 'string' },
              personel_telefon_no: { type: 'string' },
              personel_eposta_adresi: { type: 'string' },
              personel_sifre: { type: 'string' },
              firma_firma_id: { type: 'integer' },
              rol: { type: 'string' }
            }
          }
        }
      }
    },
    responses: {
      '201': {
        description: 'Personel başarıyla oluşturuldu',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Personel' }
          }
        }
      }
    }
  }
};

swaggerConfig.paths['/personel/{personel_id}'] = {
  get: {
    tags: ['Personel Yönetimi'],
    summary: 'Personel detayını getirir',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'personel_id',
        in: 'path',
        required: true,
        schema: { type: 'integer' }
      }
    ],
    responses: {
      '200': {
        description: 'Başarılı',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Personel' }
          }
        }
      },
      '404': {
        description: 'Personel bulunamadı'
      }
    }
  }
};

// Daha fazla path ve detayları eklenecektir...

module.exports = swaggerConfig;
