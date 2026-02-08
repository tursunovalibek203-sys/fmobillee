# Google Sheets API Sozlash Qo'llanmasi

## 1. Google Cloud Console da Loyiha Yaratish

1. [Google Cloud Console](https://console.cloud.google.com/) ga kiring
2. Yangi loyiha yarating yoki mavjud loyihani tanlang
3. Loyiha nomini kiriting (masalan: "dokon-sheets-api")

## 2. Google Sheets API ni Yoqish

1. Google Cloud Console da **"APIs & Services"** > **"Library"** ga o'ting
2. **"Google Sheets API"** ni qidiring
3. **"ENABLE"** tugmasini bosing

## 3. Service Account Yaratish

1. **"APIs & Services"** > **"Credentials"** ga o'ting
2. **"+ CREATE CREDENTIALS"** > **"Service account"** ni tanlang
3. Service account ma'lumotlarini kiriting:
   - **Service account name**: `dokon-sheets-service`
   - **Service account ID**: avtomatik to'ldiriladi
   - **Description**: `Do'kon uchun Google Sheets API`
4. **"CREATE AND CONTINUE"** tugmasini bosing
5. **Role** qismida **"Editor"** ni tanlang
6. **"CONTINUE"** > **"DONE"** tugmasini bosing

## 4. Service Account Key Yaratish

1. Yaratilgan Service Account ga kiring
2. **"Keys"** tab ga o'ting
3. **"ADD KEY"** > **"Create new key"** ni tanlang
4. **"JSON"** formatini tanlang
5. **"CREATE"** tugmasini bosing
6. JSON fayl yuklab olinadi - uni xavfsiz joyda saqlang

## 5. Google Sheets Fayl Yaratish

1. [Google Sheets](https://sheets.google.com/) ga o'ting
2. Yangi fayl yarating
3. Fayl nomini o'zgartiring (masalan: "Do'kon Ma'lumotlari")
4. URL dan Spreadsheet ID ni nusxalang:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

## 6. Ruxsat Berish

1. Google Sheets faylini oching
2. **"Share"** tugmasini bosing
3. Service Account email manzilini qo'shing (JSON fayldan `client_email`)
4. **"Editor"** ruxsatini bering
5. **"Send"** tugmasini bosing

## 7. .env Faylini Yangilash

JSON fayldan quyidagi ma'lumotlarni `.env` fayliga qo'shing:

```env
# Google Sheets API
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@your_project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

### Muhim Eslatmalar:

- `GOOGLE_SPREADSHEET_ID`: Google Sheets URL dan olingan ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: JSON fayldagi `client_email`
- `GOOGLE_PRIVATE_KEY`: JSON fayldagi `private_key` (qo'shtirnoq ichida)

## 8. Paketlarni O'rnatish

```bash
npm install google-spreadsheet moment
```

## 9. Serverni Ishga Tushirish

```bash
npm start
```

## Xatoliklarni Hal Qilish

### "Error: No key or keyFile set"
- `.env` faylida `GOOGLE_PRIVATE_KEY` to'g'ri kiritilganligini tekshiring
- Private key qo'shtirnoq ichida bo'lishi kerak

### "Error: The caller does not have permission"
- Service Account ga Google Sheets faylida "Editor" ruxsati berilganligini tekshiring
- Service Account email manzili to'g'riligini tekshiring

### "Error: Unable to parse range"
- Spreadsheet ID to'g'riligini tekshiring
- Google Sheets fayli mavjudligini tekshiring

## Test Qilish

Server ishga tushgandan keyin:
1. Yangi mijoz qo'shing - avtomatik varoq yaratilishi kerak
2. Savdo qo'shing - ma'lumot Google Sheets ga qo'shilishi kerak
3. Haftalik varoq avtomatik yaratilishini kuting (dushanba kuni 00:01)