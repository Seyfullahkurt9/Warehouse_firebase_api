/**
 * Combined database models for Firebase collections
 */

// Firma (Company) model
const firmaModel = {
  collectionName: 'firma',
  fields: {
    firmaAdi: { 
      type: 'string', 
      required: true,
      description: 'Firmanın adı'
    },
    vergiNo: { 
      type: 'string', 
      required: true,
      description: 'Firmanın vergi numarası' 
    },
    adres: { 
      type: 'string',
      description: 'Firma adresi'
    },
    telefon: { 
      type: 'string',
      description: 'Firma telefon numarası' 
    },
    email: { 
      type: 'string',
      description: 'Firma e-posta adresi'
    },
    yetkiliKisi: { 
      type: 'string',
      description: 'Firma yetkilisinin adı'
    },
    aktif: {
      type: 'boolean',
      default: true,
      description: 'Firmanın aktif olup olmadığını gösterir'
    }
  },
  indexes: [
    { fields: ['vergiNo'], unique: true },
    { fields: ['firmaAdi'] }
  ]
};

// Personel (Employee) model
const personelModel = {
  collectionName: 'personel',
  fields: {
    ad: { 
      type: 'string', 
      required: true,
      description: 'Personelin adı'
    },
    soyad: { 
      type: 'string', 
      required: true,
      description: 'Personelin soyadı'
    },
    tcKimlik: { 
      type: 'string', 
      required: true,
      description: 'TC Kimlik numarası'
    },
    telefon: { 
      type: 'string',
      description: 'Telefon numarası'
    },
    email: { 
      type: 'string',
      description: 'E-posta adresi'
    },
    departman: { 
      type: 'string',
      description: 'Çalıştığı departman'
    },
    pozisyon: { 
      type: 'string',
      description: 'Görevi/pozisyonu'
    },
    maas: { 
      type: 'number',
      description: 'Maaş bilgisi'
    },
    iseBaslamaTarihi: { 
      type: 'date',
      description: 'İşe başlama tarihi'
    },
    aktif: {
      type: 'boolean',
      default: true,
      description: 'Personelin aktif olup olmadığını gösterir'
    },
    izinler: {
      type: 'array',
      description: 'Personelin izin kayıtları'
    },
    rolId: {
      type: 'reference',
      refCollection: 'roller',
      description: 'Personelin rol ID referansı'
    }
  },
  indexes: [
    { fields: ['tcKimlik'], unique: true },
    { fields: ['email'], unique: true },
    { fields: ['departman'] }
  ]
};

// Stok (Inventory) model
const stokModel = {
  collectionName: 'stok',
  fields: {
    urunKodu: { 
      type: 'string', 
      required: true,
      description: 'Ürün kodu'
    },
    urunAdi: { 
      type: 'string', 
      required: true,
      description: 'Ürün adı'
    },
    kategori: { 
      type: 'string',
      description: 'Ürün kategorisi'
    },
    birim: { 
      type: 'string',
      description: 'Ölçü birimi (adet, kg, lt vb.)'
    },
    birimFiyat: { 
      type: 'number', 
      required: true,
      description: 'Birim fiyatı'
    },
    stokMiktari: { 
      type: 'number', 
      required: true,
      description: 'Stok miktarı'
    },
    kritikStokSeviyesi: { 
      type: 'number',
      description: 'Kritik stok seviyesi (uyarı için)'
    },
    resimUrl: {
      type: 'string',
      description: 'Ürün resmi URL'
    },
    tedarikciId: {
      type: 'reference',
      refCollection: 'tedarikci',
      description: 'Tedarikçi referansı'
    },
    rafYeri: {
      type: 'string',
      description: 'Depodaki raf/konum bilgisi'
    },
    sonGuncellemeTarihi: {
      type: 'date',
      description: 'Son güncelleme tarihi'
    },
    aktif: {
      type: 'boolean',
      default: true,
      description: 'Ürünün aktif olup olmadığını gösterir'
    }
  },
  indexes: [
    { fields: ['urunKodu'], unique: true },
    { fields: ['kategori'] },
    { fields: ['tedarikciId'] }
  ]
};

// Sipariş (Order) model
const siparisModel = {
  collectionName: 'siparis',
  fields: {
    siparisNo: { 
      type: 'string', 
      required: true,
      description: 'Sipariş numarası'
    },
    firmaId: { 
      type: 'reference', 
      required: true,
      refCollection: 'firma',
      description: 'Müşteri firma referansı'
    },
    siparisTarihi: { 
      type: 'date', 
      required: true,
      description: 'Sipariş tarihi'
    },
    teslimatTarihi: { 
      type: 'date',
      description: 'Teslimat tarihi'
    },
    durum: { 
      type: 'string', 
      required: true,
      enum: ['Beklemede', 'Hazırlanıyor', 'Kargoda', 'Teslim Edildi', 'İptal'],
      default: 'Beklemede',
      description: 'Sipariş durumu'
    },
    urunler: { 
      type: 'array', 
      required: true,
      description: 'Sipariş edilen ürünler',
      items: {
        urunId: { type: 'reference', refCollection: 'stok' },
        miktar: { type: 'number' },
        birimFiyat: { type: 'number' },
        toplam: { type: 'number' }
      }
    },
    toplamTutar: { 
      type: 'number', 
      required: true,
      description: 'Toplam sipariş tutarı'
    },
    odemeDurumu: {
      type: 'string',
      enum: ['Ödenmedi', 'Kısmi Ödendi', 'Ödendi'],
      default: 'Ödenmedi',
      description: 'Ödeme durumu'
    },
    odemeYontemi: {
      type: 'string',
      enum: ['Nakit', 'Kredi Kartı', 'Banka Havalesi', 'Çek'],
      description: 'Ödeme yöntemi'
    },
    faturaKesildi: {
      type: 'boolean',
      default: false,
      description: 'Fatura kesilip kesilmediği'
    },
    notlar: {
      type: 'string',
      description: 'Sipariş ile ilgili notlar'
    },
    kargoBilgisi: {
      kargoFirmasi: { type: 'string' },
      takipNumarasi: { type: 'string' },
      description: 'Kargo bilgileri'
    }
  },
  indexes: [
    { fields: ['siparisNo'], unique: true },
    { fields: ['firmaId'] },
    { fields: ['siparisTarihi'] },
    { fields: ['durum'] }
  ]
};

// Tedarikçi (Supplier) model
const tedarikciModel = {
  collectionName: 'tedarikci',
  fields: {
    firmaAdi: { 
      type: 'string', 
      required: true,
      description: 'Tedarikçi firma adı'
    },
    vergiNo: { 
      type: 'string', 
      required: true,
      description: 'Vergi numarası' 
    },
    adres: { 
      type: 'string',
      description: 'Firma adresi'
    },
    telefon: { 
      type: 'string',
      description: 'Telefon numarası' 
    },
    email: { 
      type: 'string',
      description: 'E-posta adresi'
    },
    yetkiliKisi: { 
      type: 'string',
      description: 'Yetkili kişi adı'
    },
    urunKategorileri: {
      type: 'array',
      description: 'Sağladığı ürün kategorileri'
    },
    teslimatSuresi: {
      type: 'number',
      description: 'Ortalama teslimat süresi (gün)'
    },
    sonSiparisTarihi: {
      type: 'date',
      description: 'Son sipariş tarihi'
    },
    notlar: {
      type: 'string',
      description: 'Tedarikçi hakkında notlar'
    },
    aktif: {
      type: 'boolean',
      default: true,
      description: 'Tedarikçinin aktif olup olmadığını gösterir'
    }
  },
  indexes: [
    { fields: ['vergiNo'], unique: true },
    { fields: ['firmaAdi'] },
    { fields: ['urunKategorileri'] }
  ]
};

// Roller (Roles) model
const rollerModel = {
  collectionName: 'roller',
  fields: {
    rolAdi: { 
      type: 'string', 
      required: true,
      description: 'Rol adı'
    },
    yetkiler: { 
      type: 'array', 
      required: true,
      description: 'Rol yetkileri',
      items: {
        type: 'string',
        enum: [
          'firma_okuma', 'firma_yazma', 'firma_silme',
          'personel_okuma', 'personel_yazma', 'personel_silme',
          'stok_okuma', 'stok_yazma', 'stok_silme',
          'siparis_okuma', 'siparis_yazma', 'siparis_silme',
          'tedarikci_okuma', 'tedarikci_yazma', 'tedarikci_silme',
          'rapor_okuma', 'rapor_yazma',
          'ayarlar_okuma', 'ayarlar_yazma'
        ]
      }
    },
    aciklama: { 
      type: 'string',
      description: 'Rol açıklaması'
    },
    seviye: {
      type: 'number',
      description: 'Rol seviyesi/önceliği'
    }
  },
  indexes: [
    { fields: ['rolAdi'], unique: true }
  ]
};

// Kullanıcı (User) model
const kullaniciModel = {
  collectionName: 'kullanici',
  fields: {
    email: { 
      type: 'string', 
      required: true,
      description: 'E-posta adresi (kullanıcı adı)'
    },
    sifre: { 
      type: 'string', 
      required: true,
      description: 'Şifre (hash edilmiş)'
    },
    ad: { 
      type: 'string', 
      required: true,
      description: 'Ad'
    },
    soyad: { 
      type: 'string', 
      required: true,
      description: 'Soyad'
    },
    personelId: {
      type: 'reference',
      refCollection: 'personel',
      description: 'İlişkili personel ID'
    },
    rolId: {
      type: 'reference',
      refCollection: 'roller',
      description: 'Kullanıcı rol ID'
    },
    sonGirisTarihi: {
      type: 'date',
      description: 'Son giriş tarihi'
    },
    aktif: {
      type: 'boolean',
      default: true,
      description: 'Kullanıcının aktif olup olmadığını gösterir'
    },
    olusturmaTarihi: {
      type: 'date',
      description: 'Hesap oluşturma tarihi'
    }
  },
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['personelId'] }
  ]
};

// Bildirim (Notification) model
const bildirimModel = {
  collectionName: 'bildirim',
  fields: {
    baslik: { 
      type: 'string', 
      required: true,
      description: 'Bildirim başlığı'
    },
    mesaj: { 
      type: 'string', 
      required: true,
      description: 'Bildirim mesajı'
    },
    tip: { 
      type: 'string',
      enum: ['Bilgi', 'Uyarı', 'Hata', 'Başarı'],
      default: 'Bilgi',
      description: 'Bildirim tipi'
    },
    aliciId: { 
      type: 'reference',
      refCollection: 'kullanici',
      description: 'Alıcı kullanıcı ID'
    },
    tarih: { 
      type: 'date',
      default: 'now',
      description: 'Bildirim tarihi'
    },
    okundu: {
      type: 'boolean',
      default: false,
      description: 'Okunma durumu'
    },
    ilgiliKayitId: {
      type: 'string',
      description: 'Bildirimle ilgili kayıt ID (sipariş, stok vb.)'
    },
    ilgiliKayitTipi: {
      type: 'string',
      description: 'Bildirimle ilgili kayıt tipi (sipariş, stok vb.)'
    }
  },
  indexes: [
    { fields: ['aliciId'] },
    { fields: ['tarih'] },
    { fields: ['okundu'] }
  ]
};

// Muhasebe (Accounting) model
const muhasebeModel = {
  collectionName: 'muhasebe',
  fields: {
    islemTipi: { 
      type: 'string', 
      required: true,
      enum: ['Gelir', 'Gider'],
      description: 'İşlem tipi'
    },
    tutar: { 
      type: 'number', 
      required: true,
      description: 'İşlem tutarı'
    },
    tarih: { 
      type: 'date', 
      required: true,
      description: 'İşlem tarihi'
    },
    aciklama: { 
      type: 'string',
      description: 'İşlem açıklaması'
    },
    kategori: { 
      type: 'string',
      description: 'İşlem kategorisi'
    },
    belgeNo: { 
      type: 'string',
      description: 'Belge numarası (fatura vb.)'
    },
    kdvOrani: {
      type: 'number',
      default: 18,
      description: 'KDV oranı'
    },
    ilgiliSiparisId: {
      type: 'reference',
      refCollection: 'siparis',
      description: 'İlgili sipariş referansı'
    },
    ilgiliFirmaId: {
      type: 'reference',
      refCollection: 'firma',
      description: 'İlgili firma referansı'
    }
  },
  indexes: [
    { fields: ['tarih'] },
    { fields: ['islemTipi'] },
    { fields: ['kategori'] },
    { fields: ['ilgiliSiparisId'] },
    { fields: ['ilgiliFirmaId'] }
  ]
};

// All models combined
const models = {
  firma: firmaModel,
  personel: personelModel,
  stok: stokModel,
  siparis: siparisModel,
  tedarikci: tedarikciModel,
  roller: rollerModel,
  kullanici: kullaniciModel,
  bildirim: bildirimModel,
  muhasebe: muhasebeModel
};

module.exports = models;
