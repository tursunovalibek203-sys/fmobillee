# 🚀 Google Sheets API - Qadma-qaddam Qo'llanma

## 1-QADAM: Google Cloud Console ga Kirish

1. **Brauzeringizda ochish:** [console.cloud.google.com](https://console.cloud.google.com)
2. **Google hisobingiz bilan kirish** (Gmail yoki Google Workspace)

## 2-QADAM: Yangi Loyiha Yaratish

1. **Loyiha tanlash tugmasini bosing** (sahifaning yuqori qismida)
2. **"NEW PROJECT"** tugmasini bosing
3. **Loyiha ma'lumotlarini kiriting:**
   - **Project name:** `dokon-sheets-api` (yoki istalgan nom)
   - **Organization:** Bo'sh qoldiring (agar shaxsiy foydalanuvchi bo'lsangiz)
4. **"CREATE"** tugmasini bosing
5. **Loyiha yaratilishini kuting** (bir necha soniya)

## 3-QADAM: Google Sheets API ni Yoqish

1. **Chap menyudan "APIs & Services" > "Library"** ga o'ting
2. **Qidiruv maydoniga "Google Sheets API"** yozing
3. **"Google Sheets API"** ni tanlang
4. **"ENABLE"** tugmasini bosing
5. **API yoqilishini kuting**

## 4-QADAM: Service Account Yaratish

1. **"APIs & Services" > "Credentials"** ga o'ting
2. **"+ CREATE CREDENTIALS"** tugmasini bosing
3. **"Service account"** ni tanlang
4. **Service Account ma'lumotlarini kiriting:**
   - **Service account name:** `dokon-sheets-service`
   - **Service account ID:** (avtomatik to'ldiriladi)
   - **Description:** `Do'kon uchun Google Sheets API`
5. **"CREATE AND CONTINUE"** tugmasini bosing

## 5-QADAM: Ruxsatlar Berish

1. **"Select a role"** qismida **"Basic" > "Editor"** ni tanlang
2. **"CONTINUE"** tugmasini bosing
3. **"DONE"** tugmasini bosing

## 6-QADAM: Service Account Key Yaratish

1. **Yaratilgan Service Account nomini bosing**
2. **"Keys" tab ga o'ting**
3. **"ADD KEY" > "Create new key"** ni tanlang
4. **"JSON"** formatini tanlang
5. **"CREATE"** tugmasini bosing
6. **JSON fayl avtomatik yuklab olinadi** - uni xavfsiz joyda saqlang!

## 7-QADAM: Google Sheets Fayl Yaratish

1. **Yangi tab ochib [sheets.google.com](https://sheets.google.com) ga o'ting**
2. **"Blank" (Bo'sh) fayl yarating**
3. **Fayl nomini o'zgartiring:** "Do'kon Ma'lumotlari" (yoki istalgan nom)
4. **URL dan Spreadsheet ID ni nusxalang:**
   ```
   https://docs.google.com/spreadsheets/d/1ABC123DEF456GHI789JKL/edit
                                    ↑
                              Bu qism Spreadsheet ID
   ```

## 8-QADAM: Ruxsat Berish (Muhim!)
1. **Google Sheets faylida "Share" tugmasini bosing**
2. **Yuklab olingan JSON faylni oching**
3. **JSON fayldan "client_email" ni topib nusxalang** (masalan: `dokon-sheets-service@your-project.iam.gserviceaccount.com`)
4. **Bu email manzilini "Add people and groups" maydoniga kiriting**
5. **"Editor" ruxsatini tanlang**
6. **"Send" tugmasini bosing**

## 9-QADAM: .env Faylini To'ldirish

1. **Loyiha papkasida .env faylini oching**
2. **JSON fayldan quyidagi ma'lumotlarni nusxalab .env ga kiriting:**

```env
# Google Sheets API
GOOGLE_SPREADSHEET_ID=1ABC123DEF456GHI789JKL
GOOGLE_SERVICE_ACCOUNT_EMAIL=dokon-sheets-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### ⚠️ Muhim Eslatmalar:

- **GOOGLE_SPREADSHEET_ID:** Google Sheets URL dan olingan ID
- **GOOGLE_SERVICE_ACCOUNT_EMAIL:** JSON fayldagi `client_email`
- **GOOGLE_PRIVATE_KEY:** JSON fayldagi `private_key` (to'liq, qo'shtirnoq ichida)

## 10-QADAM: Test Qilish

1. **Terminal ochib quyidagi buyruqni bajaring:**
```bash
npm run test-sheets
```

2. **Agar muvaffaqiyatli bo'lsa, quyidagi xabarni ko'rasiz:**
```
✅ Google Sheets ulandi!
📊 Spreadsheet nomi: Do'kon Ma'lumotlari
✅ Test varoq yaratildi
✅ Test ma'lumot qo'shildi
✅ Test varoq o'chirildi
🎉 Google Sheets API muvaffaqiyatli test qilindi!
```

## 11-QADAM: Serverni Ishga Tushirish

```bash
npm start
```

## 🔧 Xatoliklarni Hal Qilish

### ❌ "No key or keyFile set"
**Yechim:** `.env` faylida `GOOGLE_PRIVATE_KEY` to'g'ri kiritilganligini tekshiring. Private key qo'shtirnoq ichida bo'lishi va `\n` belgilarini o'z ichiga olishi kerak.

### ❌ "The caller does not have permission"
**Yechim:** 
1. Service Account email manzili Google Sheets faylida "Editor" ruxsati bilan qo'shilganligini tekshiring
2. Email manzili to'g'riligini tekshiring

### ❌ "Unable to parse range"
**Yechim:** `GOOGLE_SPREADSHEET_ID` to'g'riligini tekshiring. Bu ID Google Sheets URL dan olinishi kerak.

### ❌ "doc.useServiceAccountAuth is not a function"
**Yechim:** `google-spreadsheet` paketining versiyasi eski. Quyidagi buyruq bilan yangilang:
```bash
npm install google-spreadsheet@latest
```

## 📱 Qo'shimcha Ma'lumot

- **JSON faylni xavfsiz saqlang** - bu sizning API kalitingiz
- **JSON faylni hech kimga bermang**
- **GitHub ga yuklashdan oldin .env faylini .gitignore ga qo'shing**
- **Service Account faqat kerakli ruxsatlarga ega bo'lishi kerak**

## 🎯 Keyingi Qadamlar

Agar hammasi muvaffaqiyatli bo'lsa:
1. ✅ Server ishga tushadi
2. ✅ MongoDB ulanadi  
3. ✅ Google Sheets ulanadi
4. ✅ Yangi mijoz qo'shganda avtomatik varoq yaratiladi
5. ✅ Savdo qo'shganda Google Sheets ga ma'lumot yuboriladi
6. ✅ Har dushanba kuni yangi haftalik varoq yaratiladi