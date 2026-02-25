# 🏪 DO'KON BOSHQARUV TIZIMI - TO'LIQ QOLLANMA

## 📋 UMUMIY MA'LUMOT

Professional do'kon boshqaruv tizimi - Admin va Kassir uchun to'liq funksional, zamonaviy dizayn va dual currency qo'llab-quvvatlash bilan.

**Versiya:** 4.0 Complete  
**Sana:** 2026-02-14  
**Status:** ✅ Production Ready

---

## 🎯 ASOSIY XUSUSIYATLAR

### ✅ Admin Funksiyalari
1. **Dashboard** - Real-time statistika va ko'rsatkichlar
2. **Mijozlar** - To'liq CRUD operatsiyalari
3. **Mahsulotlar** - Ombor boshqaruvi
4. **Savdolar** - Savdo va to'lovlar tarixi
5. **Kassirlar** - Kassirlar boshqaruvi va KPI
6. **Kirimlar** - Kassirlar kirimlarini kuzatish
7. **Filiallar** - Filiallar boshqaruvi
8. **Hisobotlar** - Batafsil tahlil va hisobotlar
9. **Analytics** - Advanced tahlil va grafik
10. **Sozlamalar** - Tizim sozlamalari
11. **Xavfsizlik** - Security va backup

### ✅ Kassir Funksiyalari
1. **Dashboard** - Kassir statistikasi
2. **Yangi Savdo** - Dual currency bilan savdo
3. **Mijozlar** - Mijozlar ro'yxati va daftar
4. **Ombor** - Mahsulotlarni ko'rish (read-only)
5. **Hisobotlar** - Shaxsiy hisobotlar
6. **Tarix** - Savdolar tarixi
7. **Kirim Berish** - Adminga pul topshirish

### ✅ Dual Currency System
- 💵 Dollar to'lovlar
- 💰 So'm to'lovlar
- 💱 Avtomatik konvertatsiya
- ⚙️ Valyuta kursi sozlamalari
- 📊 Ikki valyutada hisobotlar

---

## 📁 LOYIHA STRUKTURASI

```
dokon-backend/
├── public/                          # Frontend files
│   ├── admin.html                   # Admin dashboard
│   ├── admin-dashboard-pro.html     # Pro dashboard
│   ├── admin-cashiers.html          # Kassirlar boshqaruvi
│   ├── admin-handovers.html         # ✨ Kassirlar kirimlari
│   ├── admin-settings.html          # ✨ Tizim sozlamalari
│   ├── admin-branches.html          # Filiallar
│   ├── admin-reports.html           # Hisobotlar
│   ├── admin-analytics.html         # Analytics
│   ├── admin-security.html          # Xavfsizlik
│   │
│   ├── cashier-login.html           # Kassir kirish
│   ├── cashier-dashboard.html       # ✨ Kassir dashboard
│   ├── cashier-sale.html            # ✨ Yangi savdo
│   ├── cashier-customers.html       # ✨ Mijozlar ro'yxati
│   ├── cashier-customer-daftar.html # Mijoz daftari
│   ├── cashier-warehouse.html       # ✨ Ombor ko'rish
│   ├── cashier-reports.html         # ✨ Hisobotlar
│   ├── cashier-history.html         # ✨ Tarix
│   │
│   ├── warehouse-*.html             # Ombor sahifalari
│   ├── login.html                   # Admin kirish
│   └── *.js                         # JavaScript files
│
├── services/                        # Business logic
│   ├── dual-database.service.js
│   ├── data-integrity.service.js
│   ├── transaction.service.js
│   ├── telegram.service.js
│   └── sale.service.js
│
├── routes/                          # API routes
│   ├── product.routes.js
│   ├── customer.routes.js
│   ├── reports.routes.js
│   └── legacy.routes.js
│
├── controllers/                     # Controllers
│   ├── product.controller.js
│   └── customer.controller.js
│
├── middleware/                      # Middleware
│   └── security.middleware.js
│
├── utils/                          # Utilities
│   └── validators.js
│
├── config/                         # Configuration
│   └── security.config.js
│
├── models/                         # Database models
│   └── schemas.js
│
├── scripts/                        # Scripts
│   └── auto-backup.js
│
├── backups/                        # Backup files
├── excel-files/                    # Excel exports
│
├── server.js                       # Main server
├── server-pro.js                   # Pro server
├── server-secure.js                # Secure server
├── server-enterprise.js            # Enterprise server
├── database.js                     # Database schemas
├── warehouse-database.js           # Warehouse DB
├── customers-database.js           # Customers DB
├── telegram-bot.js                 # Telegram bot
├── package.json                    # Dependencies
└── .env                           # Environment variables
```

---

## 🚀 O'RNATISH VA ISHGA TUSHIRISH

### 1. Talablar
```
Node.js >= 18.0.0
MongoDB >= 5.0
npm yoki yarn
```

### 2. O'rnatish
```bash
# Repository ni clone qiling
git clone <repository-url>
cd dokon-backend

# Dependencies o'rnating
npm install

# Environment variables sozlang
cp .env.example .env
```

### 3. .env Faylini Sozlash
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/dokon
MONGODB_WAREHOUSE_URI=mongodb://localhost:27017/warehouse

# Server
PORT=3000
NODE_ENV=production

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Telegram Bot
BOT_TOKEN=your_telegram_bot_token

# Valyuta
EXCHANGE_RATE=12500
BASE_CURRENCY=USD
```

### 4. Serverni Ishga Tushirish
```bash
# Development
npm run dev

# Production
npm start

# Pro version
npm run start:pro

# Secure version
npm run start:secure

# Enterprise version
npm run start:enterprise
```

---

## 👥 FOYDALANUVCHILAR

### Admin
```
URL: http://localhost:3000/login.html
Username: admin
Password: (sizning parolingiz)
```

**Ruxsatlar:**
- ✅ Barcha funksiyalarga kirish
- ✅ Barcha ma'lumotlarni ko'rish
- ✅ Barcha operatsiyalarni bajarish
- ✅ Tizim sozlamalari
- ✅ Kassirlar boshqaruvi

### Kassir
```
URL: http://localhost:3000/cashier-login.html
Username: (kassir username)
Password: (kassir password)
```

**Ruxsatlar:**
- ✅ O'z savdolarini ko'rish
- ✅ Yangi savdo qo'shish
- ✅ Mijozlar bilan ishlash
- ✅ Ombor ko'rish (read-only)
- ✅ Hisobotlar
- ❌ Mahsulot qo'shish/tahrirlash
- ❌ Boshqa kassir ma'lumotlari

---

## 💱 DUAL CURRENCY TIZIMI

### Valyuta Kursi Sozlash

**Admin orqali:**
```
1. Admin panel → ⚙️ Sozlamalar
2. Valyuta Sozlamalari
3. Valyuta kursi: 12500
4. Saqlash
```

**LocalStorage orqali:**
```javascript
localStorage.setItem('exchangeRate', '12500');
```

### Savdo Qo'shish (Dual Currency)

**Dollar to'lov:**
```javascript
{
  paidUSD: 500,
  paidUZS: 0,
  exchangeRate: 12500,
  totalUSD: 500
}
```

**So'm to'lov:**
```javascript
{
  paidUSD: 0,
  paidUZS: 6250000,
  exchangeRate: 12500,
  totalUSD: 500  // 6250000 / 12500
}
```

**Aralash to'lov:**
```javascript
{
  paidUSD: 300,
  paidUZS: 2500000,
  exchangeRate: 12500,
  totalUSD: 500  // 300 + (2500000 / 12500)
}
```

---

## 📊 API ENDPOINTS

### Authentication
```
POST /api/admin-login              # Admin login
POST /api/cashier-login            # Kassir login
```

### Customers
```
GET    /api/customers              # Barcha mijozlar
POST   /api/customers              # Yangi mijoz
GET    /api/customers/search/:id   # Mijoz qidirish
PUT    /api/customers/:id          # Mijozni yangilash
DELETE /api/customers/:id          # Mijozni o'chirish
```

### Products (Warehouse)
```
GET    /api/warehouse/products     # Barcha mahsulotlar
POST   /api/warehouse/products     # Yangi mahsulot
GET    /api/warehouse/search       # Mahsulot qidirish
POST   /api/warehouse/stock-in     # Kirim
POST   /api/warehouse/stock-out    # Chiqim
```

### Sales
```
GET    /api/sales                  # Barcha savdolar
POST   /api/sales                  # Yangi savdo
GET    /api/cashier-sales/:id      # Kassir savdolari
POST   /api/cashier-sales          # Kassir savdosi
```

### Cashiers
```
GET    /api/cashiers               # Barcha kassirlar
POST   /api/cashiers               # Yangi kassir
GET    /api/cashier-stats/:id      # Kassir statistikasi
PUT    /api/cashiers/:id           # Kassirni yangilash
DELETE /api/cashiers/:id           # Kassirni o'chirish
```

### Handovers (Kirimlar)
```
GET    /api/all-handovers          # Barcha kirimlar
GET    /api/cashier-handovers/:id  # Kassir kirimlari
POST   /api/cashier-handover       # Yangi kirim
```

### Reports
```
GET    /api/stats                  # Umumiy statistika
GET    /api/daily-report           # Kunlik hisobot
GET    /api/weekly-report          # Haftalik hisobot
GET    /api/monthly-report         # Oylik hisobot
```

---

## 🎨 DIZAYN TIZIMI

### Ranglar

**Admin:**
```css
Primary: #3b82f6 (Ko'k)
Secondary: #2563eb
Success: #10b981
Warning: #f59e0b
Danger: #dc2626
```

**Kassir:**
```css
Dashboard: #10b981 (Yashil)
Sale: #8b5cf6 (Binafsha)
Customers: #10b981 (Yashil)
Warehouse: #f59e0b (Sariq)
Reports: #6366f1 (Ko'k)
History: #ec4899 (Pushti)
```

### Komponentlar
```
✅ Glassmorphism cards
✅ Gradient backgrounds
✅ Smooth animations
✅ Hover effects
✅ Responsive grid
✅ Mobile-friendly
```

---

## 🔒 XAVFSIZLIK

### Authentication
```
✅ JWT tokens
✅ Password hashing (bcrypt)
✅ Session management
✅ Timeout sozlamalari
```

### Authorization
```
✅ Role-based access (Admin/Kassir)
✅ Route protection
✅ API validation
✅ Input sanitization
```

### Data Protection
```
✅ Avtomatik backup
✅ Data encryption
✅ Secure localStorage
✅ HTTPS support
```

---

## 📱 MOBILE RESPONSIVE

Barcha sahifalar mobil qurilmalarda to'liq ishlaydi:

```
✅ Responsive grid layout
✅ Touch-friendly buttons
✅ Adaptive font sizes
✅ Mobile navigation
✅ Swipe gestures
✅ Optimized images
✅ Fast loading
```

**Qo'llab-quvvatlanadigan qurilmalar:**
- 📱 Mobil (320px+)
- 📱 Planshet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

---

## 🧪 TESTING

### Manual Testing
```bash
# Test backup
npm run test-backup

# Test warehouse
npm run test-warehouse

# Test enterprise
npm run test-enterprise
```

### API Testing
```
Test sahifasi: /test-api.html
```

---

## 📦 DEPLOYMENT

### Render.com
```yaml
# render.yaml mavjud
1. GitHub bilan bog'lang
2. Environment variables sozlang
3. Deploy qiling
```

### Manual Deployment
```bash
# Build
npm install --production

# Start
NODE_ENV=production npm start
```

### Environment Variables
```
MONGODB_URI=your_mongodb_uri
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password
BOT_TOKEN=telegram_bot_token
```

---

## 🔧 SOZLAMALAR

### Valyuta Kursi
```
Admin → Sozlamalar → Valyuta kursi
Default: 12500 UZS = 1 USD
```

### Backup
```
Admin → Sozlamalar → Avtomatik backup
Vaqt: 02:00 (tun)
```

### Session Timeout
```
Admin → Sozlamalar → Session timeout
Default: 24 soat
```

### Bildirishnomalar
```
Admin → Sozlamalar → Bildirishnomalar
- Telegram: ON/OFF
- Kam qolgan mahsulotlar: ON/OFF
- Katta qarzlar: ON/OFF
```

---

## 📊 HISOBOTLAR

### Admin Hisobotlari
```
1. Kunlik hisobot
2. Haftalik hisobot
3. Oylik hisobot
4. Kassirlar KPI
5. Filiallar taqqoslash
6. Mahsulotlar statistikasi
7. Mijozlar tahlili
```

### Kassir Hisobotlari
```
1. Bugungi savdolar
2. Haftalik savdolar
3. Oylik savdolar
4. Shaxsiy statistika
5. Kirimlar tarixi
```

---

## 🚀 YANGI FUNKSIYALAR

### Version 4.0 (Joriy)
```
✅ Dual Currency System
✅ Kassirlar Kirimlari
✅ Advanced Dashboard
✅ Settings Panel
✅ Kassir to'liq tizimi
✅ Professional dizayn
✅ Mobile responsive
```

### Version 5.0 (Rejada)
```
🔄 Real-time grafik
🔄 Export PDF/Excel
🔄 Email bildirishnomalar
🔄 SMS gateway
🔄 Barcode scanner
🔄 Chek printer
🔄 Offline mode
```

---

## 📞 YORDAM VA QO'LLAB-QUVVATLASH

### Muammolar

**Login muammosi:**
```
1. Username/parol tekshiring
2. Session timeout tekshiring
3. Browser cache tozalang
```

**Ma'lumotlar yuklanmayapti:**
```
1. Internet ulanishini tekshiring
2. MongoDB ulanishini tekshiring
3. Server loglarini ko'ring
```

**Valyuta kursi ishlamayapti:**
```
1. LocalStorage ni tekshiring
2. Sozlamalarni qayta saqlang
3. Sahifani yangilang
```

### Qo'llab-quvvatlash
```
📧 Email: support@dokonpro.uz
📱 Telegram: @dokonpro_support
🌐 Website: https://dokonpro.uz
📚 Documentation: /docs
```

---

## 🎓 O'QITISH MATERIALLARI

### Qo'llanmalar
```
1. KASSIR_COMPLETE_SYSTEM.md - Kassir tizimi
2. ADMIN_COMPLETE_FEATURES.md - Admin funksiyalari
3. WAREHOUSE_PROFESSIONAL_FEATURES.md - Ombor
4. DUAL_CURRENCY_PAYMENT.md - Dual currency
5. COMPLETE_SYSTEM_GUIDE.md - To'liq qo'llanma
```

### Video Darslar (Rejada)
```
🎥 Admin panel
🎥 Kassir tizimi
🎥 Ombor boshqaruvi
🎥 Hisobotlar
🎥 Sozlamalar
```

---

## 🏆 BEST PRACTICES

### Kod Standartlari
```
✅ ES6+ syntax
✅ Async/await
✅ Error handling
✅ Input validation
✅ Code comments
✅ Modular architecture
```

### Xavfsizlik
```
✅ Password hashing
✅ JWT tokens
✅ Input sanitization
✅ Rate limiting
✅ HTTPS
✅ Regular backups
```

### Performance
```
✅ Database indexing
✅ Query optimization
✅ Caching
✅ Lazy loading
✅ Code splitting
✅ Minification
```

---

## 📈 STATISTIKA

### Loyiha Statistikasi
```
📁 Jami fayllar: 150+
📄 HTML sahifalar: 30+
📜 JavaScript fayllar: 25+
📚 Qo'llanmalar: 20+
⚙️ API endpoints: 50+
🎨 CSS fayllar: 5+
```

### Kod Statistikasi
```
📝 Jami qatorlar: 15,000+
🔧 Functions: 200+
📊 Components: 50+
🧪 Tests: 10+
```

---

## 🎉 XULOSA

Professional do'kon boshqaruv tizimi to'liq tayyor va ishlatishga tayyor!

**Asosiy Afzalliklar:**
- ✅ To'liq funksional
- ✅ Zamonaviy dizayn
- ✅ Dual currency
- ✅ Mobile responsive
- ✅ Xavfsiz
- ✅ Tez va samarali
- ✅ Oson foydalanish
- ✅ Professional

**Muvaffaqiyatlar! 🚀**

---

**Yaratuvchi:** Professional Developers Team  
**Versiya:** 4.0 Complete  
**Sana:** 2026-02-14  
**Litsenziya:** MIT  
**Status:** ✅ Production Ready

