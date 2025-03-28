# Depo/Stok Yönetim Sistemi API

---

## Projenin Kullanımı (Türkçe)

### Gereksinimler
- Node.js (>=14.x)
- NPM

### Kurulum Adımları
1. Proje dizinine gidin:
   ```
   ```
2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```
3. Proje kök dizininde bir `.env` dosyası oluşturun ve aşağıdaki ortam değişkenlerini ayarlayın:
   - `GOOGLE_APPLICATION_CREDENTIALS`: Firebase servis hesap anahtar dosyanızın yolu (örneğin: `./serviceAccountKey.json`)
   - `PORT`: Sunucu portu (varsayılan: 3000)
   - `NODE_ENV`: `development` veya `production`

### Firebase Servis Hesabı Kurulumu
1. Firebase konsolunuza gidin: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Projenizi seçin.
3. Proje ayarları > Servis hesapları sekmesine gidin.
4. "Yeni özel anahtar oluştur" seçeneğini tıklayın.
5. İndirilen JSON dosyasını proje kök dizininde `serviceAccountKey.json` olarak kaydedin.
6. `.env` dosyanızda, anahtar dosyasının yolunu belirtin:
   ```
   GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
   ```

### Çalıştırma
- Geliştirme modunda çalıştırmak için:
  ```
  npm run dev
  ```
- Üretim modunda çalıştırmak için:
  ```
  npm start
  ```

### API Dokümantasyonu ve Kullanımı
- Geliştirme modunda Swagger API dokümantasyonu aşağıdaki adreste mevcuttur:
  [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- Temel endpointler:
  - `/api/status`: API ve Firebase bağlantısını kontrol eder.
  - `/api/firma`: Firma ekleme, güncelleme, listeleme işlemlerini yönetir.
  - `/api/personel`: Personel ekleme, listeleme, giriş ve son giriş bilgilerini yönetir.
  - `/api/tedarikci`: Tedarikçi ekleme, listeleme ve bilgileri getirme.
  - `/api/siparis`: Sipariş oluşturma, listeleme, durum güncelleme ve ürün girişi işlemleri.
  - `/api/stok`: Ürün ekleme, çıkışı, stok hareketleri ve cari stok durumunu yönetir.

---

## Project Usage (English)

### Requirements
- Node.js (>=14.x)
- NPM

### Installation Steps
1. Navigate to the project directory:
   ```
   ```
2. Install the dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the project root and set the following environment variables:
   - `GOOGLE_APPLICATION_CREDENTIALS`: Path to your Firebase service account key file (e.g., `./serviceAccountKey.json`)
   - `PORT`: Server port (default: 3000)
   - `NODE_ENV`: either `development` or `production`

### Setting Up Firebase Service Account
1. Go to your Firebase console: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Select your project.
3. Navigate to Project Settings > Service Accounts.
4. Click "Generate New Private Key."
5. Save the downloaded JSON file as `serviceAccountKey.json` in the project root.
6. In your `.env` file, specify the path to your key:
   ```
   GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
   ```

### Running the Project
- To run in development mode:
  ```
  npm run dev
  ```
- To run in production mode:
  ```
  npm start
  ```

### API Documentation and Usage
- In development mode, API documentation via Swagger is available at:
  [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- Main endpoints:
  - `/api/status`: Checks API and Firebase connection.
  - `/api/firma`: Manages company data (creation, update, listing).
  - `/api/personel`: Manages personnel (addition, listing, login, last login info).
  - `/api/tedarikci`: Manages supplier (addition, listing, detail retrieval).
  - `/api/siparis`: Handles order creation, listing, status update, and product entry.
  - `/api/stok`: Manages product addition, removal, stock movements, and current stock status.
