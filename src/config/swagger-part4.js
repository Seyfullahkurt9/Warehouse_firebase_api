// Bu dosya, swagger.js dosyasına eklenecek olan path tanımlarının devamını içerir.

// Rapor ve Bildirim Yönetimi
const reportsAndNotificationsPaths = {
  // Raporlar
  '/reports/stock-status': {
    get: {
      tags: ['Raporlar'],
      summary: 'Stok durum raporu getirir',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'format',
          in: 'query',
          required: false,
          schema: { 
            type: 'string',
            enum: ['json', 'pdf', 'excel']
          },
          description: 'Rapor formatı'
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
                  rapor_tarihi: { type: 'string', format: 'date-time' },
                  urun_sayisi: { type: 'integer' },
                  toplam_stok_degeri: { type: 'number' },
                  urunler: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        urun_kodu: { type: 'string' },
                        urun_adi: { type: 'string' },
                        mevcut_stok: { type: 'number' },
                        birim_deger: { type: 'number' },
                        toplam_deger: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/reports/order-status': {
    get: {
      tags: ['Raporlar'],
      summary: 'Sipariş durum raporu getirir',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'baslangic_tarih',
          in: 'query',
          required: false,
          schema: { type: 'string', format: 'date' }
        },
        {
          name: 'bitis_tarih',
          in: 'query',
          required: false,
          schema: { type: 'string', format: 'date' }
        },
        {
          name: 'format',
          in: 'query',
          required: false,
          schema: { 
            type: 'string',
            enum: ['json', 'pdf', 'excel']
          }
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
                  rapor_tarihi: { type: 'string', format: 'date-time' },
                  toplam_siparis: { type: 'integer' },
                  beklemede: { type: 'integer' },
                  onaylandi: { type: 'integer' },
                  teslim_edildi: { type: 'integer' },
                  iptal: { type: 'integer' },
                  siparisler: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Siparis' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/reports/supplier-performance': {
    get: {
      tags: ['Raporlar'],
      summary: 'Tedarikçi performans raporu getirir',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'tedarikci_id',
          in: 'query',
          required: false,
          schema: { type: 'integer' }
        },
        {
          name: 'baslangic_tarih',
          in: 'query',
          required: false,
          schema: { type: 'string', format: 'date' }
        },
        {
          name: 'bitis_tarih',
          in: 'query',
          required: false,
          schema: { type: 'string', format: 'date' }
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
                  tedarikci_bilgisi: { $ref: '#/components/schemas/Tedarikci' },
                  toplam_siparis: { type: 'integer' },
                  zamaninda_teslim_orani: { type: 'number' },
                  ortalama_teslimat_suresi: { type: 'number' },
                  tedarik_edilen_urunler: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        urun_kodu: { type: 'string' },
                        urun_adi: { type: 'string' },
                        toplam_miktar: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  // Bildirimler
  '/notifications': {
    get: {
      tags: ['Bildirimler'],
      summary: 'Bildirimleri getirir',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'is_read',
          in: 'query',
          required: false,
          schema: { type: 'boolean' }
        }
      ],
      responses: {
        '200': {
          description: 'Başarılı',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Bildirim' }
              }
            }
          }
        }
      }
    }
  },
  '/notifications/{notification_id}/read': {
    put: {
      tags: ['Bildirimler'],
      summary: 'Bildirimi okundu olarak işaretler',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'notification_id',
          in: 'path',
          required: true,
          schema: { type: 'integer' }
        }
      ],
      responses: {
        '200': {
          description: 'Bildirim başarıyla okundu olarak işaretlendi',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Bildirim' }
            }
          }
        },
        '404': {
          description: 'Bildirim bulunamadı'
        }
      }
    }
  },
  '/notifications/send/user': {
    post: {
      tags: ['Bildirimler'],
      summary: 'Kullanıcıya bildirim gönderir',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['user_id', 'title', 'message'],
              properties: {
                user_id: { type: 'integer' },
                title: { type: 'string' },
                message: { type: 'string' },
                type: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Bildirim başarıyla gönderildi',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Bildirim' }
            }
          }
        }
      }
    }
  },
  '/notifications/send/role': {
    post: {
      tags: ['Bildirimler'],
      summary: 'Rol bazlı bildirim gönderir',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['role_id', 'title', 'message'],
              properties: {
                role_id: { type: 'integer' },
                title: { type: 'string' },
                message: { type: 'string' },
                type: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Bildirim başarıyla gönderildi',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  sent_count: { type: 'integer' },
                  notifications: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Bildirim' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

module.exports = reportsAndNotificationsPaths;
