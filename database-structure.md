# Depo/Stok Yönetim Sistemi - Veritabanı Yapısı

Bu belge, Depo/Stok Yönetim Sistemi'nin Firebase Firestore veritabanı yapısını detaylandırmaktadır.

## Koleksiyonlar ve Alanlar

### firma
Şirket/firma bilgilerinin tutulduğu koleksiyon.

| Alan Adı | Tür | Açıklama |
|----------|-----|----------|
| firma_id | String | Firma benzersiz tanımlayıcısı |
| firma_ad | String | Firma adı |
| firma_vergi_no | String | Vergi numarası |
| firma_telefon | String | İletişim telefon numarası |
| firma_adres | String | Açık adres |
| firma_eposta_adresi | String | İletişim e-posta adresi |
| firma_sahibi | String | Firma sahibinin adı |
| olusturulma_tarihi | Timestamp | Kaydın oluşturulma tarihi |
| guncelleme_tarihi | Timestamp | Son güncelleme tarihi |

### personel
Firma çalışanlarının bilgilerinin tutulduğu koleksiyon.

| Alan Adı | Tür | Açıklama |
|----------|-----|----------|
| personel_id | String | Personel benzersiz tanımlayıcısı |
| personel_ad | String | Personel adı |
| personel_soyad | String | Personel soyadı |
| personel_telefon_no | String | Telefon numarası |
| personel_eposta_adresi | String | E-posta adresi (giriş için kullanılır) |
| personel_sifre | String | Şifrelenmiş parola (SHA-256) |
| firma_firma_id | String | Bağlı olduğu firmanın ID'si |
| rol | String | Personelin sistemdeki rolü |
| olusturulma_tarihi | Timestamp | Kaydın oluşturulma tarihi |
| son_giris | Timestamp | Son giriş yapılan tarih |

### roller
Sistem içindeki rollerin ve yetkilerin tanımlandığı koleksiyon.

| Alan Adı | Tür | Açıklama |
|----------|-----|----------|
| rol_id | String | Rol benzersiz tanımlayıcısı |
| rol_adi | String | Rolün adı (örn: yönetici, depocu) |
| yetkiler | Array<String> | Bu role tanımlı yetkiler listesi |
| olusturulma_tarihi | Timestamp | Kaydın oluşturulma tarihi |

### tedarikci
Ürün tedarik edilen firma bilgilerinin tutulduğu koleksiyon.

| Alan Adı | Tür | Açıklama |
|----------|-----|----------|
| tedarikci_id | String | Tedarikçi benzersiz tanımlayıcısı |
| tedarikci_ad | String | Tedarikçi firma adı |
| tedarikci_telefon_no | String | İletişim telefon numarası |
| tedarikci_adresi | String | Açık adres |
| tedarikci_eposta_adresi | String | İletişim e-posta adresi |
| olusturulma_tarihi | Timestamp | Kaydın oluşturulma tarihi |

### siparis
Ürün siparişlerinin tutulduğu koleksiyon.

| Alan Adı | Tür | Açıklama |
|----------|-----|----------|
| siparis_id | String | Sipariş benzersiz tanımlayıcısı |
| siparis_tarihi | Timestamp | Siparişin verildiği tarih |
| urun_kodu | String | Sipariş edilen ürünün kodu |
| urun_adi | String | Sipariş edilen ürünün adı |
| urun_miktari | Number | Sipariş miktarı |
| tedarikci_tedarikci_id | String | Tedarikçinin ID'si |
| personel_personel_id | String | Siparişi veren personelin ID'si |
| durum | String | Sipariş durumu (beklemede, onaylandı, teslim edildi, iptal) |
| guncelleme_tarihi | Timestamp | Son güncelleme tarihi |

### urunler
Sistemdeki ürünlerin kaydedildiği koleksiyon.

| Alan Adı | Tür | Açıklama |
|----------|-----|----------|
| urun_id | String | Ürün benzersiz tanımlayıcısı |
| urun_kodu | String | Ürün kodu |
| urun_adi | String | Ürün adı |
| urun_barkod | String | Barkod numarası (opsiyonel) |
| depo_bilgisi | String | Ürünün depo içindeki konumu (opsiyonel) |
| resim_url | String | Ürün görsel linki (opsiyonel) |
| olusturulma_tarihi | Timestamp | Kaydın oluşturulma tarihi |
| guncelleme_tarihi | Timestamp | Son güncelleme tarihi |

### stok
Stok hareketlerinin (giriş-çıkış) kaydedildiği koleksiyon.

| Alan Adı | Tür | Açıklama |
|----------|-----|----------|
| stok_id | String | Stok hareketi benzersiz tanımlayıcısı |
| stok_giris_tarihi | Timestamp | Ürün giriş tarihi (null ise çıkış kaydı) |
| stok_cikis_tarihi | Timestamp | Ürün çıkış tarihi (null ise giriş kaydı) |
| stok_miktari | Number | Giriş için pozitif, çıkış için negatif değer |
| siparis_siparis_id | String | Bağlı olduğu sipariş ID'si (opsiyonel) |
| urun_kodu | String | İlgili ürünün kodu |
| urun_adi | String | İlgili ürünün adı |
| aciklama | String | Stok hareketine dair açıklama (opsiyonel) |

## İlişkiler

```
firma (1) ---> personel (n)  : Bir firma birden çok personele sahip olabilir
personel (1) ---> siparis (n) : Bir personel birden çok sipariş verebilir
tedarikci (1) ---> siparis (n) : Bir tedarikçiden birden çok sipariş alınabilir
siparis (1) ---> stok (n)     : Bir sipariş birden çok stok giriş kaydı oluşturabilir
urunler (1) ---> stok (n)     : Bir ürünün birden çok stok hareketi olabilir
```

## Sistem ve İndeksleme Bilgileri

Her bir koleksiyonda `_system_doc` adında bir alan bulunur ve bu alan sistem tarafından oluşturulan belgeler için `true` değerini alır. Normal belgeler için bu alan tanımlı değildir. Bu sayede normal sorgularda system belgelerini hariç tutmak için `where('_system_doc', '!=', true)` koşulu kullanılır.

Performans için aşağıdaki bileşik indeksler kullanılmaktadır:

```
firma: [_system_doc, firma_ad]
personel: [firma_firma_id, personel_ad]
tedarikci: [_system_doc, tedarikci_ad]
siparis: [durum, siparis_tarihi]
siparis: [tedarikci_tedarikci_id, siparis_tarihi]
siparis: [personel_personel_id, siparis_tarihi]
stok: [urun_kodu, stok_giris_tarihi]
urunler: [_system_doc, urun_adi]
```
