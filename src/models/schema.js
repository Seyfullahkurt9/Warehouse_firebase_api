// Database Schema Definitions
const collections = {
  firma: {
    fields: [
      'firma_id', 
      'firma_ad', 
      'firma_vergi_no', 
      'firma_telefon', 
      'firma_adres', 
      'firma_eposta_adresi'
    ]
  },
  personel: {
    fields: [
      'personel_id', 
      'personel_ad', 
      'personel_soyad', 
      'personel_telefon_no', 
      'personel_eposta_adresi', 
      'personel_sifre', 
      'firma_firma_id',
      'rol' // Rol bilgisi ekledik
    ]
  },
  roller: {
    fields: [
      'rol_id',
      'rol_adi',
      'yetkiler' // Array olarak yetkileri tutacak
    ]
  },
  tedarikci: {
    fields: [
      'tedarikci_id', 
      'tedarikci_ad', 
      'tedarikci_telefon_no', 
      'tedarikci_adresi', 
      'tedarikci_eposta_adresi'
    ]
  },
  siparis: {
    fields: [
      'siparis_id', 
      'siparis_tarihi', 
      'urun_kodu', 
      'urun_adi', 
      'urun_miktari', 
      'tedarikci_tedarikci_id', 
      'personel_personel_id',
      'durum'
    ]
  },
  stok: {
    fields: [
      'stok_id', 
      'stok_giris_tarihi', 
      'stok_cikis_tarihi', 
      'stok_miktari', 
      'siparis_siparis_id',
      'urun_kodu',
      'urun_adi',
      'aciklama'
    ]
  }
};

module.exports = { collections };
