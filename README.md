# Warehouse_firebase_api
warehouse için api projesi

# Project Setup Instructions

## Setting up the Service Account

To use this project, you need to set up your own Firebase/Google service account key:

1. Go to your Firebase console: https://console.firebase.google.com/
2. Select your project
3. Go to Project Settings > Service accounts
4. Click "Generate new private key"
5. Save the downloaded JSON file as `serviceAccountKey.json` in the root directory of the project

## Configuration

The project uses environment variables from the `.env` file which points to your service account key. The `.env` file is already configured with the default path:

```
GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
```

## Important Notes

- Never commit your `serviceAccountKey.json` file to version control
- A template file `serviceAccountKey.example.json` is provided to show the expected format
- If you change the location or name of your key file, update the path in the `.env` file accordingly

---

# Proje Kurulum Talimatları (Turkish)

## Servis Hesap Anahtarını Kurma

Bu projeyi kullanmak için kendi Firebase/Google servis hesap anahtarınızı kurmanız gerekmektedir:

1. Firebase konsolunuza gidin: https://console.firebase.google.com/
2. Projenizi seçin
3. Proje Ayarları > Servis hesapları bölümüne gidin
4. "Yeni özel anahtar oluştur" butonuna tıklayın
5. İndirilen JSON dosyasını projenin kök dizininde `serviceAccountKey.json` olarak kaydedin

## Yapılandırma

Proje, servis hesap anahtarınızı işaret eden `.env` dosyasındaki ortam değişkenlerini kullanır. `.env` dosyası varsayılan yol ile zaten yapılandırılmıştır:

```
GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
```

## Önemli Notlar

- `serviceAccountKey.json` dosyanızı asla sürüm kontrolüne (git) göndermeyin
- Beklenen formatı göstermek için bir şablon dosyası olan `serviceAccountKey.example.json` sağlanmıştır
- Anahtar dosyanızın konumunu veya adını değiştirirseniz, `.env` dosyasındaki yolu güncellemeyi unutmayın
