# Depo/Stok Yönetim Sistemi - API Endpoints

Bu belge, Depo/Stok Yönetim Sistemi API'sine ait tüm endpoint'leri ve kullanım şekillerini açıklamaktadır.

## Temel Bilgiler

- API Base URL: `http://localhost:3000/api`
- Swagger Dokümantasyonu: `http://localhost:3000/api-docs` (sadece geliştirme modunda)
- Tüm istekler ve yanıtlar JSON formatındadır.
- Başarılı yanıtlarda `success: true`, hata durumlarında `success: false` döner.

## API Endpoints

### Status

#### API Durumunu Kontrol Et

```
GET /status
```

Örnek yanıt:
```json
{
  "status": "API is running",
  "firebase": "connected"
}
```

### Firma Yönetimi

#### Firma Ekleme

```
POST /firma
```

İstek gövdesi:
```json
{
  "firma_ad": "Örnek Şirket A.Ş.",
  "firma_vergi_no": "1234567890",
  "firma_telefon": "0212 123 45 67",
  "firma_adres": "İstanbul, Türkiye",
  "firma_eposta_adresi": "info@ornek.com",
  "firma_sahibi": "Ahmet Yılmaz"
}
```

Başarılı yanıt (201):
```json
{
  "success": true,
  "message": "Firma başarıyla eklendi",
  "firma_id": "jk5l432mn09876"
}
```

#### Firma Bilgilerini Getirme

```
GET /firma/{firma_id}
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "data": {
    "firma_id": "jk5l432mn09876",
    "firma_ad": "Örnek Şirket A.Ş.",
    "firma_vergi_no": "1234567890",
    "firma_telefon": "0212 123 45 67",
    "firma_adres": "İstanbul, Türkiye",
    "firma_eposta_adresi": "info@ornek.com",
    "firma_sahibi": "Ahmet Yılmaz",
    "olusturulma_tarihi": "2023-08-15T14:30:45.123Z"
  }
}
```

#### Firma Bilgilerini Güncelleme

```
PUT /firma/{firma_id}
```

İstek gövdesi:
```json
{
  "firma_telefon": "0212 987 65 43",
  "firma_adres": "Ankara, Türkiye"
}
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "message": "Firma bilgileri başarıyla güncellendi"
}
```

#### Firma Listesini Getirme

```
GET /firma
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "data": [
    {
      "firma_id": "jk5l432mn09876",
      "firma_ad": "Örnek Şirket A.Ş.",
      "firma_vergi_no": "1234567890",
      "firma_telefon": "0212 987 65 43"
    }
  ]
}
```

### Personel Yönetimi

#### Personel Ekleme

```
POST /personel
```

İstek gövdesi:
```json
{
  "personel_ad": "Mehmet",
  "personel_soyad": "Kaya",
  "personel_telefon_no": "0555 123 45 67",
  "personel_eposta_adresi": "mehmet@ornek.com",
  "personel_sifre": "Guvenli123!",
  "firma_firma_id": "jk5l432mn09876",
  "rol": "depo_sorumlusu"
}
```

Başarılı yanıt (201):
```json
{
  "success": true,
  "message": "Personel başarıyla eklendi",
  "personel_id": "qrs789tuv012345"
}
```

#### Personel Listesini Getirme

```
GET /personel
```

Filtre örnekleri:
```
GET /personel?firma_id=jk5l432mn09876
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "data": [
    {
      "personel_id": "qrs789tuv012345",
      "personel_ad": "Mehmet",
      "personel_soyad": "Kaya",
      "personel_telefon_no": "0555 123 45 67",
      "personel_eposta_adresi": "mehmet@ornek.com",
      "firma_firma_id": "jk5l432mn09876",
      "rol": "depo_sorumlusu",
      "olusturulma_tarihi": "2023-08-15T15:20:30.456Z",
      "son_giris": "2023-08-16T09:15:00.789Z"
    }
  ]
}
```

#### Kullanıcı Girişi

```
POST /personel/giris
```

İstek gövdesi:
```json
{
  "eposta": "mehmet@ornek.com",
  "sifre": "Guvenli123!"
}
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "message": "Giriş başarılı",
  "user": {
    "personel_id": "qrs789tuv012345",
    "personel_ad": "Mehmet",
    "personel_soyad": "Kaya",
    "personel_telefon_no": "0555 123 45 67",
    "personel_eposta_adresi": "mehmet@ornek.com",
    "firma_firma_id": "jk5l432mn09876",
    "rol": "depo_sorumlusu",
    "yetkiler": [
      "stok_goruntuleme",
      "stok_ekleme",
      "siparis_olusturma"
    ]
  }
}
```

#### Son Giriş Bilgilerini Görüntüleme

```
GET /personel/{personel_id}/son-giris
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "data": {
    "personel_id": "qrs789tuv012345",
    "personel_ad": "Mehmet",
    "personel_soyad": "Kaya",
    "son_giris": "2023-08-16T09:15:00.789Z"
  }
}
```

#### Rol Ekleme

```
POST /personel/roller
```

İstek header'ı:
```
x-personel-id: [yönetici personelin ID'si]
```

İstek gövdesi:
```json
{
  "rol_adi": "depo_sorumlusu",
  "yetkiler": [
    "stok_goruntuleme", 
    "stok_ekleme", 
    "siparis_olusturma"
  ]
}
```

Başarılı yanıt (201):
```json
{
  "success": true,
  "message": "Rol başarıyla eklendi",
  "rol_id": "def456ghi789012"
}
```

#### Rol Listesini Getirme

```
GET /personel/roller
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "data": [
    {
      "rol_id": "abc123def456789",
      "rol_adi": "yonetici",
      "yetkiler": ["tam_yetki"]
    },
    {
      "rol_id": "def456ghi789012",
      "rol_adi": "depo_sorumlusu",
      "yetkiler": ["stok_goruntuleme", "stok_ekleme", "siparis_olusturma"]
    }
  ]
}
```

### Tedarikçi Yönetimi

#### Tedarikçi Ekleme

```
POST /tedarikci
```

İstek gövdesi:
```json
{
  "tedarikci_ad": "ABC Tedarik Ltd.",
  "tedarikci_telefon_no": "0212 345 67 89",
  "tedarikci_adresi": "İzmir, Türkiye",
  "tedarikci_eposta_adresi": "info@abctedarik.com"
}
```

Başarılı yanıt (201):
```json
{
  "success": true,
  "message": "Tedarikçi başarıyla eklendi",
  "tedarikci_id": "uvw345xyz678901"
}
```

#### Tedarikçi Bilgilerini Getirme

```
GET /tedarikci/{tedarikci_id}
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "data": {
    "tedarikci_id": "uvw345xyz678901",
    "tedarikci_ad": "ABC Tedarik Ltd.",
    "tedarikci_telefon_no": "0212 345 67 89",
    "tedarikci_adresi": "İzmir, Türkiye",
    "tedarikci_eposta_adresi": "info@abctedarik.com",
    "olusturulma_tarihi": "2023-08-15T16:45:20.789Z"
  }
}
```

#### Tedarikçi Listesini Getirme

```
GET /tedarikci
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "data": [
    {
      "tedarikci_id": "uvw345xyz678901",
      "tedarikci_ad": "ABC Tedarik Ltd.",
      "tedarikci_telefon_no": "0212 345 67 89",
      "tedarikci_adresi": "İzmir, Türkiye",
      "tedarikci_eposta_adresi": "info@abctedarik.com"
    }
  ]
}
```

### Sipariş Yönetimi

#### Sipariş Oluşturma

```
POST /siparis
```

İstek gövdesi:
```json
{
  "urun_kodu": "P12345",
  "urun_adi": "Çelik Vida 10mm",
  "urun_miktari": 500,
  "tedarikci_tedarikci_id": "uvw345xyz678901",
  "personel_personel_id": "qrs789tuv012345"
}
```

Başarılı yanıt (201):
```json
{
  "success": true,
  "message": "Sipariş başarıyla oluşturuldu",
  "siparis_id": "hij567klm890123"
}
```

#### Sipariş Bilgilerini Getirme

```
GET /siparis/{siparis_id}
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "data": {
    "siparis_id": "hij567klm890123",
    "siparis_tarihi": "2023-08-16T10:30:45.123Z",
    "urun_kodu": "P12345",
    "urun_adi": "Çelik Vida 10mm",
    "urun_miktari": 500,
    "tedarikci_tedarikci_id": "uvw345xyz678901",
    "personel_personel_id": "qrs789tuv012345",
    "durum": "beklemede"
  }
}
```

#### Sipariş Listesini Getirme

```
GET /siparis
```

Filtre örnekleri:
```
GET /siparis?tedarikci_id=uvw345xyz678901
GET /siparis?personel_id=qrs789tuv012345
GET /siparis?durum=beklemede
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "data": [
    {
      "siparis_id": "hij567klm890123",
      "siparis_tarihi": "2023-08-16T10:30:45.123Z",
      "urun_kodu": "P12345",
      "urun_adi": "Çelik Vida 10mm",
      "urun_miktari": 500,
      "tedarikci_tedarikci_id": "uvw345xyz678901",
      "personel_personel_id": "qrs789tuv012345",
      "durum": "beklemede"
    }
  ]
}
```

#### Sipariş Durumunu Güncelleme

```
PUT /siparis/{siparis_id}/durum
```

İstek gövdesi:
```json
{
  "durum": "onaylandı"
}
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "message": "Sipariş durumu başarıyla güncellendi"
}
```

#### Ürün Girişi Yapma (Sipariş üzerinden)

```
POST /siparis/{siparis_id}/urun-girisi
```

İstek gövdesi:
```json
{
  "stok_miktari": 500
}
```

Başarılı yanıt (201):
```json
{
  "success": true,
  "message": "Ürün girişi başarıyla yapıldı",
  "stok_id": "nop678qrs901234"
}
```

### Stok Yönetimi

#### Yeni Ürün Ekleme

```
POST /stok/urunler
```

İstek gövdesi:
```json
{
  "urun_kodu": "P67890",
  "urun_adi": "Metal Somun 8mm",
  "urun_barkod": "8901234567890",
  "depo_bilgisi": "Raf B-12",
  "baslangic_stok_miktari": 1000,
  "resim_url": "https://example.com/images/metal-somun.jpg"
}
```

Başarılı yanıt (201):
```json
{
  "success": true,
  "message": "Ürün başarıyla eklendi",
  "urun_id": "stu901vwx234567"
}
```

#### Ürün Görseli Yükleme

```
POST /stok/urunler/{urun_id}/gorsel
Content-Type: multipart/form-data
```

Form-data:
```
file: [dosya içeriği]
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "message": "Ürün görseli başarıyla yüklendi",
  "resim_url": "/uploads/urun-gorselleri/metal-somun-12345.jpg"
}
```

#### Ürün Listesini Getirme

```
GET /stok/urunler
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "data": [
    {
      "urun_id": "stu901vwx234567",
      "urun_kodu": "P67890",
      "urun_adi": "Metal Somun 8mm",
      "urun_barkod": "8901234567890",
      "depo_bilgisi": "Raf B-12",
      "resim_url": "https://example.com/images/metal-somun.jpg",
      "olusturulma_tarihi": "2023-08-16T14:20:30.456Z"
    }
  ]
}
```

#### Ürün Çıkışı Yapma

```
POST /stok/cikis
```

İstek gövdesi:
```json
{
  "urun_kodu": "P67890",
  "cikis_miktari": 200,
  "aciklama": "Üretim için kullanıldı"
}
```

Başarılı yanıt (201):
```json
{
  "success": true,
  "message": "Ürün çıkışı başarıyla kaydedildi",
  "stok_id": "yza012bcd345678"
}
```

#### Stok Hareketlerini Görüntüleme

```
GET /stok/hareketler
```

Filtre örnekleri:
```
GET /stok/hareketler?urun_kodu=P67890
GET /stok/hareketler?baslangic_tarihi=2023-08-01T00:00:00.000Z&bitis_tarihi=2023-08-31T23:59:59.999Z
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "data": [
    {
      "stok_id": "nop678qrs901234",
      "stok_giris_tarihi": "2023-08-16T11:15:30.789Z",
      "stok_cikis_tarihi": null,
      "stok_miktari": 500,
      "siparis_siparis_id": "hij567klm890123",
      "urun_kodu": "P12345",
      "urun_adi": "Çelik Vida 10mm"
    },
    {
      "stok_id": "yza012bcd345678",
      "stok_giris_tarihi": null,
      "stok_cikis_tarihi": "2023-08-16T15:45:10.123Z",
      "stok_miktari": -200,
      "urun_kodu": "P67890",
      "urun_adi": "Metal Somun 8mm",
      "aciklama": "Üretim için kullanıldı"
    }
  ]
}
```

#### Cari Stok Durumunu Görüntüleme

```
GET /stok/durum
```

Başarılı yanıt (200):
```json
{
  "success": true,
  "data": [
    {
      "urun_id": "rst345uvw678901",
      "urun_kodu": "P12345",
      "urun_adi": "Çelik Vida 10mm",
      "depo_bilgisi": "Raf A-5",
      "stok_miktari": 500
    },
    {
      "urun_id": "stu901vwx234567",
      "urun_kodu": "P67890",
      "urun_adi": "Metal Somun 8mm",
      "depo_bilgisi": "Raf B-12",
      "stok_miktari": 800
    }
  ]
}
```

## Hata Yanıtları

Tüm API endpointleri hata durumunda aşağıdaki formatta yanıt döndürür:

```json
{
  "success": false,
  "error": "Hata açıklaması"
}
```

### Genel Hata Kodları

- **400 Bad Request**: İstek parametreleri eksik veya hatalı
- **401 Unauthorized**: Kimlik doğrulama başarısız
- **403 Forbidden**: Yetkisiz erişim
- **404 Not Found**: İstenen kaynak bulunamadı
- **500 Internal Server Error**: Sunucu hatası
