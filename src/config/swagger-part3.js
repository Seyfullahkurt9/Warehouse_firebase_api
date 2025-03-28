// Bu dosya, swagger.js dosyasına eklenecek olan path tanımlarının devamını içerir.

// Sipariş Yönetimi
const siparisAndStokPaths = {
  '/siparis': {
    get: {
      tags: ['Sipariş Yönetimi'],
      summary: 'Siparişleri listeler',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'durum',
          in: 'query',
          required: false,
          schema: { 
            type: 'string',
            enum: ['beklemede', 'onaylandı', 'teslim edildi', 'iptal']
          }
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
                type: 'array',
                items: { $ref: '#/components/schemas/Siparis' }
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['Sipariş Yönetimi'],
      summary: 'Yeni sipariş oluşturur',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['urun_kodu', 'urun_adi', 'urun_miktari', 'tedarikci_tedarikci_id'],
              properties: {
                urun_kodu: { type: 'string' },
                urun_adi: { type: 'string' },
                urun_miktari: { type: 'number' },
                tedarikci_tedarikci_id: { type: 'integer' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Sipariş başarıyla oluşturuldu',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Siparis' }
            }
          }
        }
      }
    }
  },
  '/siparis/{siparis_id}': {
    get: {
      tags: ['Sipariş Yönetimi'],
      summary: 'Sipariş detayını getirir',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'siparis_id',
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
              schema: { $ref: '#/components/schemas/Siparis' }
            }
          }
        },
        '404': {
          description: 'Sipariş bulunamadı'
        }
      }
    }
  },
  '/siparis/{siparis_id}/durum': {
    put: {
      tags: ['Sipariş Yönetimi'],
      summary: 'Sipariş durumunu günceller',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'siparis_id',
          in: 'path',
          required: true,
          schema: { type: 'integer' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['durum'],
              properties: {
                durum: { 
                  type: 'string',
                  enum: ['beklemede', 'onaylandı', 'teslim edildi', 'iptal']
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Sipariş durumu başarıyla güncellendi',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Siparis' }
            }
          }
        },
        '404': {
          description: 'Sipariş bulunamadı'
        }
      }
    }
  },
  '/siparis/{siparis_id}/urun-girisi': {
    post: {
      tags: ['Sipariş Yönetimi'],
      summary: 'Sipariş üzerinden ürün girişi yapar',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'siparis_id',
          in: 'path',
          required: true,
          schema: { type: 'integer' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['stok_miktari'],
              properties: {
                stok_miktari: { type: 'number' },
                aciklama: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Ürün girişi başarıyla yapıldı',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Stok' }
            }
          }
        },
        '404': {
          description: 'Sipariş bulunamadı'
        }
      }
    }
  },

  // Stok Yönetimi
  '/stok/urunler': {
    get: {
      tags: ['Stok Yönetimi'],
      summary: 'Ürünleri listeler',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'urun_kodu',
          in: 'query',
          required: false,
          schema: { type: 'string' }
        },
        {
          name: 'urun_adi',
          in: 'query',
          required: false,
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'Başarılı',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Urun' }
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['Stok Yönetimi'],
      summary: 'Yeni ürün ekler',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['urun_kodu', 'urun_adi'],
              properties: {
                urun_kodu: { type: 'string' },
                urun_adi: { type: 'string' },
                urun_barkod: { type: 'string' },
                depo_bilgisi: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Ürün başarıyla oluşturuldu',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Urun' }
            }
          }
        }
      }
    }
  },
  '/stok/urunler/{urun_id}/gorsel': {
    post: {
      tags: ['Stok Yönetimi'],
      summary: 'Ürün görseli yükler',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'urun_id',
          in: 'path',
          required: true,
          schema: { type: 'integer' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                gorsel: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Görsel başarıyla yüklendi',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  resim_url: { type: 'string' }
                }
              }
            }
          }
        },
        '404': {
          description: 'Ürün bulunamadı'
        }
      }
    }
  },
  '/stok/cikis': {
    post: {
      tags: ['Stok Yönetimi'],
      summary: 'Ürün çıkışı yapar',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['urun_kodu', 'stok_miktari'],
              properties: {
                urun_kodu: { type: 'string' },
                stok_miktari: { type: 'number' },
                aciklama: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Ürün çıkışı başarıyla yapıldı',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Stok' }
            }
          }
        }
      }
    }
  },
  '/stok/hareketler': {
    get: {
      tags: ['Stok Yönetimi'],
      summary: 'Stok hareketlerini getirir',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'urun_kodu',
          in: 'query',
          required: false,
          schema: { type: 'string' }
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
                type: 'array',
                items: { $ref: '#/components/schemas/Stok' }
              }
            }
          }
        }
      }
    }
  },
  '/stok/durum': {
    get: {
      tags: ['Stok Yönetimi'],
      summary: 'Cari stok durumunu getirir',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Başarılı',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    urun_kodu: { type: 'string' },
                    urun_adi: { type: 'string' },
                    toplam_giris: { type: 'number' },
                    toplam_cikis: { type: 'number' },
                    mevcut_stok: { type: 'number' }
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

module.exports = siparisAndStokPaths;
