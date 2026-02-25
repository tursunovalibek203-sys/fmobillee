# 🏪 Professional Do'kon Boshqaruv Tizimi - To'liq Versiya

## 🎯 Umumiy Ma'lumot

Bu professional do'kon boshqaruv tizimi - Node.js, Express, MongoDB va zamonaviy web texnologiyalari bilan yaratilgan to'liq funksional tizim.

### ✨ Asosiy Xususiyatlar

- 💱 **Dual Currency System** - Dollar va So'm to'lovlari
- 👥 **Kassir Tizimi** - To'liq kassir boshqaruvi
- 📦 **Ombor Boshqaruvi** - IMEI tracking bilan
- 👤 **Mijozlar Daftari** - To'liq CRM tizimi
- 📊 **Advanced Analytics** - Real-time hisobotlar
- 🔐 **Xavfsizlik** - JWT, bcrypt, rate limiting
- 📱 **Mobile Responsive** - Barcha qurilmalarda ishlaydi
- 🎨 **Professional Dizayn** - Zamonaviy gradient UI

---

## 📋 Tizim Tarkibi

### 1. Admin Panel
```
✅ Dashboard (statistika, grafik)
✅ Mijozlar boshqaruvi (CRUD)
✅ Mahsulotlar boshqaruvi (CRUD)
✅ Ombor boshqaruvi (IMEI tracking)
✅ Kassirlar boshqaruvi
✅ Kassirlar kirimlari
✅ Filiallar boshqaruvi
✅ Hisobotlar va analytics
✅ Tizim sozlamalari
✅ Xavfsizlik sozlamalari
✅ Backup va export
```

### 2. Kassir Panel
```
✅ Dashboard (balans, statistika)
✅ Yangi savdo (Dual Currency)
✅ Mijozlar ro'yxati
✅ Mijoz daftari
✅ Ombor ko'rish (read-only)
✅ Hisobotlar (bugun/hafta/oy)
✅ Savdolar tarixi
✅ Kirim berish
```

### 3. Ombor Tizimi
```
✅ Mahsulotlar boshqaruvi
✅ IMEI tracking (har bir dona)
✅ Kirim/Chiqim tarixi
✅ Kategoriyalar
✅ Qidiruv va filtrlash
✅ Low stock alerts
✅ Barcode support
```

---

## 🚀 O'rnatish

### Talablar
```
Node.js >= 18.0.0
MongoDB >= 5.0
npm yoki yarn
```

### Qadamlar

1. **Repository ni clone qiling**
```bash
git clone <repository-url>
cd dokon-backend
```

2. **Dependencies o'rnating**
```bash
npm install
```

3. **Environment variables sozlang**
```bash
cp .env.example .env
```

`.env` faylini tahrirlang:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/dokon
WAREHOUSE_MONGODB_URI=mongodb://localhost:27017/warehouse

# Server
PORT=3000
NODE_ENV=production

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Telegram Bot (ixtiyoriy)
BOT_TOKEN=your_telegram_bot_token

# Valyuta kursi
EXCHANGE_RATE=12500
```

4. **Serverni ishga tushiring**
```bash
# Production mode
npm start

# Development mode
npm run dev
```

5. **Brauzerda oching**
```
http://localhost:3000
```

---

## 📁 Loyiha Strukturasi

```
dokon-backend/
├── public/                      # Frontend files
│   ├── admin*.html             # Admin sahifalari
│   ├── cashier*.html           # Kassir sahifalari
│   ├── warehouse*.html         # Ombor sahifalari
│   ├── *.js                    # Client-side JavaScript
│   └── *.css                   # Stylesheets
├── routes/                     # Express routes
├── controllers/                # Business logic
├── services/                   # Service layer
├── middleware/                 # Express middleware
├── models/                     # Database schemas
├── utils/                      # Utility functions
├── config/                     # Configuration
├── scripts/                    # Utility scripts
├── backups/                    # Database backups
├── excel-files/                # Excel exports
├── server.js                   # Main server
├── database.js                 # Database connection
├── warehouse-database.js       # Warehouse DB
└── package.json                # Dependencies
```

---

## 🔧 Konfiguratsiya

### 1. Valyuta Sozlamalari

Admin panel → Sozlamalar → Valyuta:
```
Valyuta kursi: 12500 (1 USD = 12500 UZS)
Asosiy valyuta: USD
Dual Currency: Yoqilgan
```

### 2. Kassir Qo'shish

Admin panel → Kassirlar → + Yangi:
```
Ism: Alisher Karimov
Login: alisher
Parol: secure_password
Telefon: +998901234567
Filial: Filial 1
```

### 3. Ombor Sozlash

Admin panel → Ombor → Sozlamalar:
```
Minimal miqdor: 5
Low stock alerts: Yoqilgan
IMEI tracking: Yoqilgan
```

---

## 💡 Foydalanish

### Admin Uchun

**1. Login**
```
URL: http://localhost:3000/login.html
Username: admin
Password: your_password
```

**2. Dashboard**
- Umumiy statistika
- Bugungi savdolar
- Kassirlar holati
- Ombor holati

**3. Mijoz Qo'shish**
```
Mijozlar → + Yangi → Ma'lumotlarni kiriting → Saqlash
```

**4. Mahsulot Qo'shish**
```
Ombor → + Yangi → Ma'lumotlarni kiriting → Saqlash
```

**5. Kassir Kirimlarini Ko'rish**
```
Kirimlar → Sana tanlash → Kassir tanlash → Ko'rish
```

### Kassir Uchun

**1. Login**
```
URL: http://localhost:3000/cashier-login.html
Username: kassir_username
Password: kassir_password
```

**2. Yangi Savdo**
```
Dashboard → Yangi Savdo
1. Mijozni tanlash
2. IMEI kiritish (mahsulot avtomatik topiladi)
3. To'lovni kiritish (USD/UZS)
4. Savdoni saqlash
```

**3. Kirim Berish**
```
Dashboard → Kirim berish
1. Miqdorni kiriting
2. Izoh yozing (ixtiyoriy)
3. Tasdiqlang
```

**4. Hisobotlar**
```
Hisobotlar → Davr tanlash (Bugun/Hafta/Oy) → Ko'rish
```

---

## 🔐 Xavfsizlik

### Autentifikatsiya
```
✅ JWT tokens
✅ Password hashing (bcrypt)
✅ Session management
✅ Rate limiting
✅ CORS protection
```

### Ruxsatlar
```
Admin:
✅ Barcha funksiyalar
✅ Barcha ma'lumotlar
✅ Tizim sozlamalari

Kassir:
✅ O'z savdolari
✅ Mijozlar boshqaruvi
✅ Ombor ko'rish (read-only)
❌ Mahsulot qo'shish/tahrirlash
❌ Kassirlar boshqaruvi
❌ Tizim sozlamalari
```

---

## 📊 API Endpoints

### Admin APIs
```
POST   /api/admin-login              # Admin login
GET    /api/stats                    # Statistika
GET    /api/all-handovers            # Barcha kirimlar
GET    /api/settings                 # Sozlamalar
PUT    /api/settings                 # Sozlamalarni yangilash
```

### Kassir APIs
```
POST   /api/cashier-login            # Kassir login
GET    /api/cashiers                 # Barcha kassirlar
POST   /api/cashiers                 # Yangi kassir
GET    /api/cashier-stats/:id        # Kassir statistikasi
POST   /api/cashier-sales            # Yangi savdo
POST   /api/cashier-handover         # Kirim berish
```

### Mijozlar APIs
```
GET    /api/customers                # Barcha mijozlar
POST   /api/customers                # Yangi mijoz
GET    /api/customers/search/:id     # Mijoz qidirish
PUT    /api/customers/:id            # Mijozni yangilash
DELETE /api/customers/:id            # Mijozni o'chirish
```

### Ombor APIs
```
GET    /api/warehouse/products       # Barcha mahsulotlar
POST   /api/warehouse/products       # Yangi mahsulot
GET    /api/warehouse/search         # Mahsulot qidirish
POST   /api/warehouse/stock-in       # Kirim
POST   /api/warehouse/stock-out      # Chiqim
GET    /api/warehouse/movements      # Harakatlar tarixi
```

---

## 🎨 Dizayn Tizimi

### Ranglar
```
Admin: Ko'k gradient (#3b82f6 → #1e3a8a)
Kassir: Yashil gradient (#10b981 → #064e3b)
Ombor: Sariq gradient (#f59e0b → #b45309)
Xavfsizlik: Qizil gradient (#dc2626 → #991b1b)
```

### Komponentlar
```
✅ Glassmorphism cards
✅ Gradient buttons
✅ Smooth animations
✅ Hover effects
✅ Loading states
✅ Error messages
✅ Success notifications
```

---

## 📱 Mobile Support

Barcha sahifalar mobil qurilmalarda to'liq ishlaydi:
```
✅ Responsive grid layout
✅ Touch-friendly buttons
✅ Adaptive font sizes
✅ Mobile navigation
✅ Swipe gestures
✅ Optimized images
```

---

## 🔄 Backup va Export

### Avtomatik Backup
```
Sozlamalar → Tizim → Avtomatik backup: Yoqilgan
Backup vaqti: 02:00 (tunda)
```

### Manual Backup
```bash
npm run backup
```

### Excel Export
```
Admin panel → Hisobotlar → Export → Excel
```

---

## 🚀 Deployment

### Render.com

1. **GitHub bilan bog'lang**
2. **render.yaml ni tekshiring**
3. **Environment variables sozlang**
4. **Deploy qiling**

### Manual Deployment

```bash
# Build
npm run build

# Start
NODE_ENV=production npm start
```

---

## 🧪 Testing

```bash
# Barcha testlar
npm test

# Warehouse test
npm run test-warehouse

# Backup test
npm run test-backup
```

---

## 📞 Qo'llab-quvvatlash

### Muammolar

**Login muammosi:**
```
1. Username/parol tekshiring
2. Database ulanishini tekshiring
3. Console loglarni ko'ring
```

**Savdo saqlanmayapti:**
```
1. Internet ulanishini tekshiring
2. Barcha maydonlarni to'ldiring
3. Omborda mahsulot borligini tekshiring
```

**Valyuta kursi ishlamayapti:**
```
1. Sozlamalarni tekshiring
2. LocalStorage ni tozalang
3. Sahifani yangilang
```

### Yordam

```
📧 Email: support@dokonpro.uz
📱 Telegram: @dokonpro_support
🌐 Website: https://dokonpro.uz
```

---

## 🎯 Xususiyatlar Ro'yxati

### ✅ Tayyor Funksiyalar

**Admin:**
- Dashboard va statistika
- Mijozlar boshqaruvi
- Mahsulotlar boshqaruvi
- Ombor boshqaruvi (IMEI)
- Kassirlar boshqaruvi
- Kassirlar kirimlari
- Filiallar boshqaruvi
- Hisobotlar va analytics
- Tizim sozlamalari
- Dual Currency System
- Backup va export

**Kassir:**
- Dashboard
- Yangi savdo (Dual Currency)
- Mijozlar boshqaruvi
- Mijoz daftari
- Ombor ko'rish
- Hisobotlar
- Savdolar tarixi
- Kirim berish

**Ombor:**
- Mahsulotlar CRUD
- IMEI tracking
- Kirim/Chiqim
- Kategoriyalar
- Qidiruv va filtrlash
- Low stock alerts

---

## 🔮 Kelajak Rejalar

### Version 2.0
```
🔄 Real-time grafik
🔄 Export PDF
🔄 Email bildirishnomalar
🔄 SMS gateway
🔄 Barcode scanner
🔄 Chek printer
```

### Version 3.0
```
🔄 Mobile app (React Native)
🔄 AI analytics
🔄 Prognoz qilish
🔄 Avtomatik buyurtma
🔄 Multi-warehouse
🔄 API integratsiya
```

---

## 📄 Litsenziya

MIT License

---

## 👨‍💻 Muallif

Professional Developers Team

---

## 🙏 Minnatdorchilik

- Node.js jamoasi
- MongoDB jamoasi
- Express.js jamoasi
- Barcha open-source contributorlar

---

## 📊 Statistika

```
Jami fayllar: 150+
Kod qatorlari: 15,000+
Funksiyalar: 50+
API endpoints: 40+
Sahifalar: 30+
```

---

**Versiya:** 4.0 Complete
**Sana:** 2026-02-14
**Status:** ✅ Production Ready

**Muvaffaqiyatlar! 🚀**

