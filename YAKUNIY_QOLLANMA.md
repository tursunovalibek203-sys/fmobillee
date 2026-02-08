# 🎉 Do'kon Boshqaruv Tizimi - Yakuniy Qo'llanma

## 🚀 Tizim To'liq Tayyor!

Sizning do'kon boshqaruv tizimingiz endi to'liq funksional va professional darajada ishlaydi.

## 🌟 Qo'shilgan Yangi Xususiyatlar

### 1. 📊 Local Excel Integratsiyasi
- ✅ **To'liq bepul** - hech qanday to'lov kerak emas
- ✅ **Offline ishlaydi** - internet ulanishi shart emas
- ✅ **Real-time** - barcha ma'lumotlar darhol Excel ga yoziladi
- ✅ **Avtomatik** - mijoz/savdo qo'shilganda avtomatik fayl yaratiladi

### 2. 🌐 Web Dashboard
- ✅ **Asosiy sahifa** - `http://localhost:3000`
- ✅ **Admin panel** - `http://localhost:3000/admin.html`
- ✅ **Real-time statistika** - jonli ma'lumotlar
- ✅ **Fayl boshqaruvi** - Excel fayllarni ko'rish va yuklab olish

### 3. 💾 Backup Tizimi
- ✅ **Avtomatik backup** - har yakshanba kuni 23:00 da
- ✅ **Qo'lda backup** - admin panel orqali
- ✅ **CSV export** - mijozlar va savdolar alohida
- ✅ **Eski fayllar tozalash** - 30 kundan eski fayllar avtomatik o'chiriladi

### 4. 📈 Hisobotlar Tizimi
- ✅ **Kunlik hisobot** - bugungi savdolar
- ✅ **Haftalik hisobot** - hafta davomidagi statistika
- ✅ **Mijoz hisoboti** - har bir mijoz uchun alohida
- ✅ **Umumiy statistika** - barcha ko'rsatkichlar

## 📁 Fayl Strukturasi

```
loyiha/
├── server.js                    # Asosiy server
├── excel-manager.js            # Excel boshqaruvi
├── backup-manager.js           # Backup tizimi
├── package.json                # Loyiha sozlamalari
├── .env                        # Muhit o'zgaruvchilari
├── public/
│   ├── index.html              # Asosiy web sahifa
│   └── admin.html              # Admin dashboard
├── excel-files/                # Excel fayllar
│   ├── Mijoz_*.xlsx           # Mijoz fayllari
│   └── Hafta_*.xlsx           # Haftalik fayllar
├── backups/                    # Backup fayllar
│   ├── Backup_*.xlsx          # To'liq backup
│   └── *.csv                  # CSV export
└── test-*.js                   # Test skriptlari
```

## 🔧 API Endpointlar

### Asosiy API
```bash
# Mijozlar
GET  /api/customers              # Barcha mijozlar
POST /api/customers              # Yangi mijoz
DELETE /api/customers/:id        # Mijozni o'chirish

# Savdolar
GET  /api/sales                  # Barcha savdolar
POST /api/sales                  # Yangi savdo
DELETE /api/sales/:id            # Savdoni o'chirish

# Sozlamalar
GET  /api/settings               # Sozlamalarni olish
POST /api/settings               # Sozlamalarni yangilash
```

### Excel API
```bash
GET  /api/excel-files            # Excel fayllar ro'yxati
GET  /api/excel-download/:file   # Excel faylni yuklab olish
GET  /api/excel-read/:file       # Excel fayl ma'lumotlari
```

### Backup API
```bash
POST /api/backup/create          # To'liq backup yaratish
GET  /api/backup/files           # Backup fayllar ro'yxati
GET  /api/backup/download/:file  # Backup faylni yuklab olish
POST /api/export/csv             # CSV export
```

### Hisobotlar API
```bash
GET  /api/stats                  # Umumiy statistika
GET  /api/daily-report           # Kunlik hisobot
GET  /api/weekly-report          # Haftalik hisobot
GET  /api/customer-report/:id    # Mijoz hisoboti
```

## 🕐 Avtomatik Jarayonlar

### Cron Jobs
```javascript
// Har dushanba 00:01 - Yangi haftalik Excel fayl
'1 0 * * 1' → createWeeklyExcel()

// Har yakshanba 23:00 - Haftalik backup
'0 23 * * 0' → createWeeklyBackup()

// Har kuni 09:00 - Qarz eslatmalari
'0 9 * * *' → sendDebtReminders()
```

## 🧪 Test Qilish

```bash
# Excel tizimi
npm run test-excel

# Backup tizimi
npm run test-backup

# Google Sheets (agar kerak bo'lsa)
npm run test-sheets
```

## 🌐 Web Interfeys

### Asosiy Sahifa (`http://localhost:3000`)
- 📊 Excel fayllar ro'yxati
- 📈 Asosiy statistika
- 🔄 Real-time yangilanish
- 📥 Fayllarni yuklab olish

### Admin Dashboard (`http://localhost:3000/admin.html`)
- 💾 Backup boshqaruvi
- 📊 Batafsil statistika
- 📈 Hisobotlar
- 🔧 Tizim boshqaruvi

## 📱 Telegram Bot Xususiyatlari

- `/start` - Chat ID olish
- `/balans` - Qarz holatini ko'rish
- Avtomatik chek yuborish
- Qarz eslatmalari (3, 5, 7 kun)
- Bloklanish (10 kundan keyin)

## 🔐 Xavfsizlik

- ✅ Ma'lumotlar lokal saqlanadi
- ✅ Backup fayllar shifrlangan
- ✅ API endpointlar himoyalangan
- ✅ Telegram bot xavfsiz

## 📊 Statistika Ko'rsatkichlari

- **Jami mijozlar** - ro'yxatga olingan mijozlar soni
- **Jami savdolar** - barcha savdo operatsiyalari
- **Jami qarz** - barcha mijozlarning umumiy qarzi
- **Bugungi savdolar** - bugun amalga oshirilgan savdolar
- **Excel fayllar** - yaratilgan fayllar soni
- **Backup hajmi** - saqlangan ma'lumotlar hajmi

## 🎯 Foydalanish Yo'riqnomasi

### 1. Serverni Ishga Tushirish
```bash
npm start
```

### 2. Web Sahifani Ochish
- Asosiy: `http://localhost:3000`
- Admin: `http://localhost:3000/admin.html`

### 3. Mijoz Qo'shish
```javascript
POST /api/customers
{
  "customerId": 1,
  "name": "Ahmadjon Karimov",
  "phone": "+998901234567",
  "chatId": "123456789"
}
```

### 4. Savdo Qo'shish
```javascript
POST /api/sales
{
  "saleId": 1,
  "customerId": 1,
  "customerName": "Ahmadjon Karimov",
  "product": "Telefon",
  "price": 500000,
  "paid": 300000,
  "date": "29.01.2026",
  "time": "14:30",
  "type": "sale"
}
```

### 5. Excel Fayllarni Ko'rish
- Web sahifada fayllar ro'yxatini ko'ring
- Yuklab olish tugmasini bosing
- Excel dasturida oching

### 6. Backup Yaratish
- Admin panelga o'ting
- "To'liq Backup Yaratish" tugmasini bosing
- Fayl avtomatik yuklab olinadi

## 🔄 Yangilanishlar

Tizim avtomatik ravishda:
- ✅ Har 30 soniyada web sahifani yangilaydi
- ✅ Real-time ma'lumotlarni ko'rsatadi
- ✅ Server holatini tekshiradi
- ✅ Yangi fayllarni aniqlaydi

## 🎉 Xulosa

Sizning do'kon boshqaruv tizimingiz endi professional darajada:

1. **To'liq bepul** - hech qanday tashqi servis kerak emas
2. **Offline ishlaydi** - internet ulanishi shart emas
3. **Avtomatik** - barcha jarayonlar avtomatlashtirilgan
4. **Xavfsiz** - ma'lumotlar lokal saqlanadi
5. **Oson** - web interfeys orqali boshqarish
6. **Professional** - backup va hisobotlar tizimi

**Tizim to'liq tayyor va ishlatishga yaroqli!** 🚀