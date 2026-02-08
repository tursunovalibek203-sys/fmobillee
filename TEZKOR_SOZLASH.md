# ⚡ Google Sheets - Tezkor Sozlash

## 🎯 Asosiy Qadamlar (5 daqiqa)

### 1. Google Cloud Console
- [console.cloud.google.com](https://console.cloud.google.com) ga kiring
- Yangi loyiha yarating: `dokon-sheets-api`

### 2. API Yoqish
- **APIs & Services > Library** ga o'ting
- **"Google Sheets API"** ni qidiring va yoqing

### 3. Service Account
- **APIs & Services > Credentials** ga o'ting
- **CREATE CREDENTIALS > Service account**
- Nom: `dokon-sheets-service`
- Role: **Editor**

### 4. Key Yaratish
- Service Account ga kiring
- **Keys > ADD KEY > Create new key**
- **JSON** formatini tanlang
- Fayl yuklab olinadi

### 5. Google Sheets Fayl
- [sheets.google.com](https://sheets.google.com) da yangi fayl yarating
- Nom: "Do'kon Ma'lumotlari"
- **Share** tugmasini bosing
- JSON fayldagi `client_email` ni qo'shing
- **Editor** ruxsati bering

### 6. .env Faylini To'ldirish

```env
# Google Sheets API (JSON fayldan olish)
GOOGLE_SPREADSHEET_ID=1ABC123DEF456GHI789JKL
GOOGLE_SERVICE_ACCOUNT_EMAIL=dokon-sheets-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### 7. Test Qilish

```bash
npm run test-sheets
```

**Muvaffaqiyatli natija:**
```
✅ Google Sheets ulandi!
📊 Spreadsheet nomi: Do'kon Ma'lumotlari
🎉 Google Sheets API muvaffaqiyatli test qilindi!
```

### 8. Serverni Ishga Tushirish

```bash
npm start
```

## 🔧 Tez-tez Uchraydigan Xatolar

| Xato | Yechim |
|------|--------|
| `No key or keyFile set` | `.env` da `GOOGLE_PRIVATE_KEY` to'g'ri kiritilganligini tekshiring |
| `The caller does not have permission` | Service Account email ga Google Sheets da "Editor" ruxsati bering |
| `Unable to parse range` | `GOOGLE_SPREADSHEET_ID` to'g'riligini tekshiring |

## 📋 Kerakli Ma'lumotlar

JSON fayldan `.env` ga ko'chirish kerak:

- **project_id** → loyiha nomi
- **client_email** → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- **private_key** → `GOOGLE_PRIVATE_KEY` (qo'shtirnoq ichida)
- Google Sheets URL dan ID → `GOOGLE_SPREADSHEET_ID`

## ✅ Tayyor!

Agar test muvaffaqiyatli bo'lsa, tizim ishlay boshlaydi:
- Yangi mijoz → avtomatik varoq yaratiladi
- Savdo/to'lov → Google Sheets ga qo'shiladi  
- Har dushanba → yangi haftalik varoq yaratiladi