# 🚀 DO'KON BOSHQARUV TIZIMI - TO'LIQ QO'LLANMA

## 📋 MUNDARIJA

1. [Tizim Haqida](#tizim-haqida)
2. [Yaratilgan Funksiyalar](#yaratilgan-funksiyalar)
3. [Foydalanuvchi Rollari](#foydalanuvchi-rollari)
4. [Qanday Ishlatish](#qanday-ishlatish)
5. [Texnik Ma'lumotlar](#texnik-malumotlar)
6. [Muammolarni Hal Qilish](#muammolarni-hal-qilish)

---

## 🎯 TIZIM HAQIDA

**Do'kon Boshqaruv Tizimi** - bu zamonaviy, professional darajadagi biznes boshqaruv platformasi.

### Asosiy Imkoniyatlar:
- 💼 **Kassir Tizimi** - Professional kassa boshqaruvi
- 👨‍💼 **Admin Panel** - To'liq biznes nazorati
- 🏢 **Filiallar** - Ko'p filial boshqaruvi
- 📦 **Ombor** - Inventar nazorati
- 👥 **Mijozlar** - CRM tizimi
- 📊 **Hisobotlar** - Batafsil analytics
- 💰 **Moliya** - Moliyaviy boshqaruv
- 🔔 **Bildirishnomalar** - Real-time alerts

---

## ✨ YARATILGAN FUNKSIYALAR

### 1. 💼 KASSIR TIZIMI

#### A. Kassir Enhanced Panel
**Fayl:** `public/cashier-enhanced.html`

**Imkoniyatlar:**
- ✅ 2 valyuta tizimi (USD/UZS)
- ✅ Real-time statistika
- ✅ Mijoz qidirish va taklif
- ✅ Tezkor savdo qo'shish
- ✅ Bugungi hisobotlar
- ✅ So'nggi savdolar ro'yxati

**Kirish:**
```
URL: http://localhost:3000/cashier-enhanced.html
Login: cashier-login-enhanced.html orqali
```

#### B. Kassir Dashboard Pro
**Fayl:** `public/cashier-dashboard-pro.html`

**Imkoniyatlar:**
- ✅ Real-time grafiklar (Chart.js)
- ✅ Ishlash ko'rsatkichlari
- ✅ Faoliyat lentasi
- ✅ Top mahsulotlar
- ✅ Samaradorlik tahlili
- ✅ Interactive charts

**Kirish:**
```
URL: http://localhost:3000/cashier-dashboard-pro.html
```

#### C. Tezkor Harakatlar
**Fayl:** `public/cashier-quick-actions.html`

**Imkoniyatlar:**
- ✅ Tezkor savdo formasi
- ✅ Ichki kalkulyator
- ✅ So'nggi mijozlar
- ✅ Tezkor to'lov
- ✅ Barcode scanner
- ✅ Bugungi statistika

**Kirish:**
```
URL: http://localhost:3000/cashier-quick-actions.html
```

#### D. Tarix Paneli
**Fayl:** `public/cashier-history-enhanced.html`

**Imkoniyatlar:**
- ✅ Kuchli filtrlar
- ✅ Sana oralig'i tanlash
- ✅ Export (Excel, CSV, PDF)
- ✅ Chop etish
- ✅ Pagination
- ✅ Real-time qidirish

**Kirish:**
```
URL: http://localhost:3000/cashier-history-enhanced.html
```

### 2. 👨‍💼 ADMIN PANEL

#### A. Admin Ultimate Dashboard
**Fayl:** `public/admin-ultimate.html`

**Imkoniyatlar:**
- ✅ Modern sidebar navigation
- ✅ Real-time statistics
- ✅ Interactive charts
- ✅ Activity feed
- ✅ Quick actions
- ✅ Global search
- ✅ Responsive design

**Kirish:**
```
URL: http://localhost:3000/admin-ultimate.html
Login: admin / admin12345
```

#### B. Notification Center
**Fayl:** `public/admin-notifications.html`

**Imkoniyatlar:**
- ✅ Real-time notifications
- ✅ Priority levels
- ✅ Filter by type
- ✅ Mark as read/unread
- ✅ Statistics dashboard
- ✅ Quick actions

**Kirish:**
```
URL: http://localhost:3000/admin-notifications.html
```

### 3. 📊 MAVJUD FUNKSIYALAR

#### Filiallar
- `admin-branches.html` - Filiallar ro'yxati
- `admin-branch-details.html` - Filial tafsilotlari
- `admin-branches-sales.html` - Filial savdolari

#### Kassirlar
- `admin-cashiers.html` - Kassirlar ro'yxati
- `admin-cashier-details.html` - Kassir tafsilotlari
- `admin-handovers.html` - Kirim berishlar

#### Ombor
- `warehouse-pro.html` - Professional ombor
- `warehouse-items.html` - Mahsulotlar
- `warehouse-select.html` - Ombor tanlash

#### Hisobotlar
- `admin-reports.html` - Umumiy hisobotlar
- `admin-analytics.html` - Analytics
- `admin-expenses.html` - Xarajatlar

#### Sozlamalar
- `admin-settings.html` - Tizim sozlamalari
- `admin-security.html` - Xavfsizlik
- `admin-simple.html` - Oddiy panel

---

## 👥 FOYDALANUVCHI ROLLARI

### 1. 🔐 Super Admin
**Huquqlar:**
- ✅ Barcha funksiyalarga to'liq kirish
- ✅ Foydalanuvchilarni boshqarish
- ✅ Tizim sozlamalari
- ✅ Xavfsizlik sozlamalari
- ✅ Barcha hisobotlar

**Login:**
```
Username: admin
Password: admin12345
```

### 2. 👨‍💼 Branch Manager
**Huquqlar:**
- ✅ O'z filiali ma'lumotlari
- ✅ Kassirlarni boshqarish
- ✅ Ombor boshqaruvi
- ✅ Filial hisobotlari
- ❌ Tizim sozlamalari

### 3. 💼 Kassir
**Huquqlar:**
- ✅ Savdo qo'shish
- ✅ To'lov qabul qilish
- ✅ Mijozlarni ko'rish
- ✅ O'z hisobotlari
- ❌ Boshqa kassirlar ma'lumotlari

**Login:**
```
Kassir ID: 1001, 1002, 1003...
Username: kassir1, kassir2...
Password: kassir123
```

### 4. 📦 Ombor Xodimi
**Huquqlar:**
- ✅ Mahsulot qo'shish/o'zgartirish
- ✅ Inventarizatsiya
- ✅ Yetkazib beruvchilar
- ✅ Ombor hisobotlari
- ❌ Moliyaviy ma'lumotlar

### 5. 👀 Viewer (Ko'ruvchi)
**Huquqlar:**
- ✅ Hisobotlarni ko'rish
- ✅ Statistikani ko'rish
- ❌ O'zgartirish
- ❌ Qo'shish/O'chirish

---

## 📖 QANDAY ISHLATISH

### 1. TIZIMNI ISHGA TUSHIRISH

```bash
# 1. Dependencies o'rnatish
npm install

# 2. .env faylini sozlash
# MongoDB URI, Bot Token, va boshqalar

# 3. Serverni ishga tushirish
npm start

# 4. Brauzerda ochish
http://localhost:3000
```

### 2. KASSIR SIFATIDA ISHLASH

#### A. Login Qilish
```
1. Brauzerda oching: http://localhost:3000/cashier-login-enhanced.html
2. Kassir ID kiriting: 1001
3. Username: kassir1
4. Password: kassir123
5. Filial tanlang (ixtiyoriy)
6. "Kirish" tugmasini bosing
```

#### B. Savdo Qo'shish
```
1. Kassir Enhanced panelga o'ting
2. Mijoz nomini kiriting (avtomatik taklif)
3. Mahsulot nomini kiriting
4. Narx va to'lov miqdorini kiriting
5. "Savdo qo'shish" tugmasini bosing
```

#### C. Tarix Ko'rish
```
1. "Batafsil tarix" tugmasini bosing
2. Sana oralig'ini tanlang
3. Filtrlardan foydalaning
4. Export yoki chop eting
```

#### D. Dashboard Ko'rish
```
1. Kassir Dashboard Pro ga o'ting
2. Real-time grafiklarni ko'ring
3. Ishlash ko'rsatkichlarini tahlil qiling
4. Top mahsulotlarni ko'ring
```

### 3. ADMIN SIFATIDA ISHLASH

#### A. Login Qilish
```
1. Brauzerda oching: http://localhost:3000/login.html
2. Username: admin
3. Password: admin12345
4. "Kirish" tugmasini bosing
```

#### B. Dashboard Ishlatish
```
1. Admin Ultimate ga o'ting
2. Sidebar orqali bo'limlarni tanlang
3. Real-time statistikani ko'ring
4. Grafiklar bilan ishlang
5. Tezkor harakatlardan foydalaning
```

#### C. Bildirishnomalarni Ko'rish
```
1. Top bar da 🔔 tugmasini bosing
2. Yoki: http://localhost:3000/admin-notifications.html
3. Bildirishnomalarni filtrlang
4. O'qilgan deb belgilang
5. Tezkor harakatlardan foydalaning
```

#### D. Filiallarni Boshqarish
```
1. Sidebar da "Filiallar" ni tanlang
2. Yangi filial qo'shing
3. Filial tafsilotlarini ko'ring
4. Filial savdolarini tahlil qiling
```

#### E. Kassirlarni Boshqarish
```
1. Sidebar da "Kassirlar" ni tanlang
2. Yangi kassir qo'shing
3. Kassir huquqlarini sozlang
4. Kassir hisobotlarini ko'ring
```

### 4. HISOBOTLAR BILAN ISHLASH

#### A. Kunlik Hisobot
```
1. Admin Reports ga o'ting
2. "Kunlik hisobot" ni tanlang
3. Sanani tanlang
4. Export qiling (Excel/PDF)
```

#### B. Filial Hisoboti
```
1. Admin Branches ga o'ting
2. Filialni tanlang
3. "Hisobot" tugmasini bosing
4. Sana oralig'ini tanlang
```

#### C. Kassir Hisoboti
```
1. Admin Cashiers ga o'ting
2. Kassirni tanlang
3. "Tafsilotlar" tugmasini bosing
4. Hisobotni ko'ring
```

---

## 🔧 TEXNIK MA'LUMOTLAR

### Tizim Arxitekturasi

```
Frontend:
├── HTML5 + CSS3
├── Vanilla JavaScript
├── Chart.js 3.x
├── Responsive Design
└── PWA Support

Backend:
├── Node.js + Express
├── MongoDB Atlas
├── Mongoose ODM
├── RESTful API
└── JWT Authentication

Integrations:
├── Telegram Bot API
├── Excel.js
├── PDF Generation
└── Email Service
```

### Fayl Tuzilishi

```
project/
├── public/
│   ├── admin-ultimate.html          # Admin dashboard
│   ├── admin-notifications.html     # Notification center
│   ├── cashier-enhanced.html        # Kassir panel
│   ├── cashier-dashboard-pro.html   # Kassir dashboard
│   ├── cashier-quick-actions.html   # Tezkor harakatlar
│   ├── cashier-history-enhanced.html # Tarix
│   ├── admin-branches.html          # Filiallar
│   ├── admin-cashiers.html          # Kassirlar
│   ├── warehouse-pro.html           # Ombor
│   └── ... (boshqa fayllar)
├── server.js                        # Main server
├── database.js                      # Database config
├── excel-realtime-manager.js        # Excel manager
├── .env                             # Environment variables
└── package.json                     # Dependencies
```

### API Endpoints

```javascript
// Admin APIs
GET  /api/admin/total-revenue
GET  /api/admin/total-sales
GET  /api/admin/total-debt
GET  /api/admin/recent-activity
GET  /api/admin/notifications

// Kassir APIs
GET  /api/cashier/:cashierId
GET  /api/cashier-sales/:cashierId
POST /api/cashier-sale
GET  /api/cashier-recent-sales/:cashierId
GET  /api/cashier-top-products/:cashierId

// Customer APIs
GET  /api/customers
POST /api/customers
GET  /api/customers/search?q=...

// Product APIs
GET  /api/products
POST /api/products
GET  /api/products/search/:query

// Branch APIs
GET  /api/branches
POST /api/branches
GET  /api/branch/:branchId
```

### Database Schema

```javascript
// Cashier Schema
{
  cashierId: Number,
  branchId: Number,
  name: String,
  username: String,
  password: String,
  balance: Number,
  totalSales: Number,
  isActive: Boolean
}

// CashierSale Schema
{
  saleId: Number,
  cashierId: Number,
  branchId: Number,
  customerName: String,
  product: String,
  price: Number,
  paid: Number,
  currency: String,
  date: String,
  time: String
}

// Customer Schema
{
  customerId: Number,
  name: String,
  phone: String,
  totalDebt: Number,
  firstDebtDate: Date
}

// Branch Schema
{
  branchId: Number,
  name: String,
  address: String,
  manager: String,
  totalSales: Number,
  totalRevenue: Number
}
```

---

## 🐛 MUAMMOLARNI HAL QILISH

### 1. MongoDB Ulanish Xatosi

**Muammo:** MongoDB ga ulanib bo'lmayapti

**Yechim:**
```bash
# 1. .env faylini tekshiring
MONGODB_URI=mongodb+srv://...

# 2. Internet ulanishini tekshiring
ping google.com

# 3. MongoDB Atlas IP whitelist ni tekshiring
# Atlas dashboard -> Network Access -> Add IP Address

# 4. Lokal MongoDB ishlatish
MONGODB_LOCAL=mongodb://127.0.0.1:27017/dokon_db
```

### 2. Kassir Login Qila Olmayapti

**Muammo:** Login sahifasida xato

**Yechim:**
```javascript
// 1. Kassir ma'lumotlarini tekshiring
// MongoDB da cashiers collection ni ko'ring

// 2. Demo login ishlatib ko'ring
Kassir ID: 1001
Username: kassir1
Password: kassir123

// 3. Browser console ni tekshiring
// F12 -> Console -> Xatolarni ko'ring
```

### 3. Grafiklar Ko'rinmayapti

**Muammo:** Dashboard da grafiklar yuklanmayapti

**Yechim:**
```html
<!-- 1. Chart.js yuklanganini tekshiring -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- 2. Browser console ni tekshiring -->
<!-- Chart.js xatolari bormi? -->

<!-- 3. Internet ulanishini tekshiring -->
<!-- CDN dan yuklanishi kerak -->
```

### 4. Savdo Qo'shilmayapti

**Muammo:** Savdo qo'shish tugmasi ishlamayapti

**Yechim:**
```javascript
// 1. Barcha maydonlar to'ldirilganini tekshiring
// Mijoz, Mahsulot, Narx - majburiy

// 2. Browser console ni tekshiring
// API xatolari bormi?

// 3. Server loglarini ko'ring
// npm start da xatolar bormi?

// 4. MongoDB ulanishini tekshiring
// Ma'lumotlar saqlanayaptimi?
```

### 5. Excel Export Ishlamayapti

**Muammo:** Excel fayl yuklab olinmayapti

**Yechim:**
```javascript
// 1. Browser popup blocker ni o'chiring
// Settings -> Privacy -> Popups

// 2. API endpoint ni tekshiring
POST /api/export/cashier-sales-excel

// 3. Ma'lumotlar mavjudligini tekshiring
// Avval savdolar bo'lishi kerak

// 4. Browser console ni tekshiring
// Download xatolari bormi?
```

---

## 📞 YORDAM VA QO'LLAB-QUVVATLASH

### Tizim Haqida Savollar

**Savol:** Qanday qilib yangi kassir qo'shaman?
**Javob:** Admin Panel -> Kassirlar -> "Yangi Kassir" tugmasi

**Savol:** Filial qanday qo'shiladi?
**Javob:** Admin Panel -> Filiallar -> "Yangi Filial" tugmasi

**Savol:** Hisobotlarni qanday export qilaman?
**Javob:** Hisobotlar sahifasida "Export" tugmasi -> Excel/CSV/PDF

**Savol:** Valyuta kursini qanday o'zgartiraman?
**Javob:** Admin Panel -> Sozlamalar -> Valyuta Kursi

### Texnik Yordam

**Email:** support@dokon.uz
**Telegram:** @dokon_support
**Telefon:** +998 XX XXX XX XX

---

## 🎉 XULOSA

Tizim to'liq professional darajada va quyidagi imkoniyatlarga ega:

✅ **Kassir Tizimi** - 4 ta professional panel
✅ **Admin Panel** - Ultimate dashboard va notifications
✅ **Real-time Data** - Jonli ma'lumotlar
✅ **Interactive Charts** - Interaktiv grafiklar
✅ **Export Functions** - Excel, CSV, PDF
✅ **Responsive Design** - Barcha qurilmalar
✅ **Multi-currency** - USD va UZS
✅ **Multi-branch** - Ko'p filial
✅ **User Roles** - Turli huquqlar
✅ **Security** - Xavfsizlik tizimi

Biznesingizni professional darajada boshqaring! 🚀