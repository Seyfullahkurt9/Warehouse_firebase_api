// Bu dosya, swagger.js dosyasına eklenecek olan path tanımlarının devamını içerir.

// Personel Modülü - Devam
const personelPathsExtension = {
  '/personel/giris': {
    post: {
      tags: ['Personel Yönetimi'],
      summary: 'Giriş yapar',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['eposta', 'sifre'],
              properties: {
                eposta: { type: 'string' },
                sifre: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Başarılı giriş',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                  personel: { $ref: '#/components/schemas/Personel' }
                }
              }
            }
          }
        },
        '401': {
          description: 'Kimlik doğrulama başarısız',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/personel/{personel_id}/son-giris': {
    get: {
      tags: ['Personel Yönetimi'],
      summary: 'Son giriş bilgilerini getirir',
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
              schema: {
                type: 'object',
                properties: {
                  son_giris: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/personel/roller': {
    get: {
      tags: ['Personel Yönetimi'],
      summary: 'Rolleri listeler',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Başarılı',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Rol' }
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['Personel Yönetimi'],
      summary: 'Yeni rol ekler',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['rol_adi', 'yetkiler'],
              properties: {
                rol_adi: { type: 'string' },
                yetkiler: { 
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Rol başarıyla oluşturuldu',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Rol' }
            }
          }
        }
      }
    }
  },

  // Tedarikçi Yönetimi
  '/tedarikci': {
    get: {
      tags: ['Tedarikçi Yönetimi'],
      summary: 'Tüm tedarikçileri listeler',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Başarılı',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Tedarikci' }
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['Tedarikçi Yönetimi'],
      summary: 'Yeni tedarikçi ekler',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['tedarikci_ad'],
              properties: {
                tedarikci_ad: { type: 'string' },
                tedarikci_telefon_no: { type: 'string' },
                tedarikci_adresi: { type: 'string' },
                tedarikci_eposta_adresi: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Tedarikçi başarıyla oluşturuldu',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Tedarikci' }
            }
          }
        }
      }
    }
  },
  '/tedarikci/{tedarikci_id}': {
    get: {
      tags: ['Tedarikçi Yönetimi'],
      summary: 'Tedarikçi detayını getirir',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'tedarikci_id',
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
              schema: { $ref: '#/components/schemas/Tedarikci' }
            }
          }
        },
        '404': {
          description: 'Tedarikçi bulunamadı'
        }
      }
    }
  }
};

module.exports = personelPathsExtension;
