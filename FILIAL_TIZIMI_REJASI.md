# 🏢 FILIAL TIZIMI - TO'LIQ REJA

## 📋 TIZIM TUZILMASI

### 1. FILIALLAR
- Har bir filial alohida
- Har bir filialda:
  - 🏭 Alohida ombor
  - 💼 Alohida kassirlar
  - 📊 Alohida statistika
  - 💰 Alohida balans

### 2. KASSIRLAR
- Har bir kassir bitta filialga tegishli
- Kassir faqat o'z filialida ishlaydi
- Adminga kirim topshiradi
- Real-time savdo ma'lumotlari

### 3. ADMIN PANELI
- Barcha filiallarni ko'radi
- Har bir filialning:
  - Savdolari
  - Kirim topshirish tarixi
  - Kassirlar ro'yxati
  - Ombor holati
- Real-time statistika

### 4. MA'LUMOTLAR SAQLASH
- ✅ MongoDB (real-time)
- ✅ Excel (backup va hisobotlar)
- ✅ Avtomatik sinxronizatsiya

---

## 🗄️ DATABASE STRUKTURA

### Collections:

**1. branches** (Filiallar)
```javascript
{
  branchId: Number,
  name: String,
  address: String,
  phone: String,
  manager: String,
  isActive: Boolean,
  totalSales: Number,
  totalRevenue: Number,
  createdAt: Date
}
```

**2. cashiers** (Kassirlar)
```javascript
{
  cashierId: Number,
  branchId: Number,
  name: String,
  username: String,
  password: String,
  phone: String,
  balanceUSD: Number,
  balanceUZS: Number,
  balanceRUB: Number,
  totalSales: Number,
  totalHandedOver: Number,
  isActive: Boolean,
  createdAt: Date
}
```

**3. cashier_sales** (Kassir savdolari)
```javascript
{
  saleId: Number,
  branchId: Number,
  cashierId: Number,
  cashierName: String,
  customerId: Number,
  customerName: String,
  product: String,
  priceUSD: Number,
  paymentAmount: Number,
  paymentCurrency: String, // USD, UZS, RUB
  paymentUSD: Number,
  exchangeRate: Number,
  date: String,
  time: String,
  createdAt: Date
}
```

**4. cashier_handovers** (Kirim topshirish)
```javascript
{
  handoverId: Number,
  branchId: Number,
  cashierId: Number,
  cashierName: String,
  amountUSD: Number,
  amountUZS: Number,
  amountRUB: Number,
  balanceBefore: Object,
  balanceAfter: Object,
  notes: String,
  date: String,
  time: String,
  createdAt: Date
}
```

**5. warehouse_products** (Ombor mahsulotlari)
```javascript
{
  productId: Number,
  branchId: Number,
  name: String,
  category: String,
  stock: Number,
  minStock: Number,
  buyPrice: Number,
  sellPrice: Number,
  unit: String,
  isActive: Boolean,
  createdAt: Date
}
```

---

## 📊 EXCEL INTEGRATSIYA

### Excel Fayllar:

**1. Filiallar_Hisobot.xlsx**
- Har bir filial uchun sheet
- Real-time yangilanish
- Savdolar tarixi
- Kirim topshirish

**2. Kassirlar_Hisobot.xlsx**
- Har bir kassir uchun sheet
- Kunlik savdolar
- Balans tarixi

**3. Ombor_Hisobot.xlsx**
- Har bir filial ombori
- Mahsulotlar ro'yxati
- Kirim-chiqim

### Excel API:
- `xlsx` package
- Avtomatik yangilanish
- Download funksiyasi
- Import/Export

---

## 🔄 REAL-TIME SINXRONIZATSIYA

### MongoDB → Excel:
1. Har bir savdo MongoDB ga yoziladi
2. Avtomatik Excel ga qo'shiladi
3. Backup yaratiladi

### Excel → MongoDB:
1. Excel dan import
2. Validatsiya
3. MongoDB ga yozish

---

## 👨‍💼 ADMIN FUNKSIYALARI

### 1. Filiallar Boshqaruvi
- ➕ Yangi filial qo'shish
- ✏️ Tahrirlash
- 🗑️ O'chirish
- 📊 Statistika

### 2. Kassirlar Boshqaruvi
- ➕ Yangi kassir qo'shish
- 🔐 Login ma'lumotlari
- 💰 Balansni ko'rish
- 📋 Savdolar tarixi

### 3. Kirim Qabul Qilish
- 💵 Kassirdan pul qabul qilish
- 📝 Tasdiq
- 📊 Tarix
- 🧾 Chek

### 4. Hisobotlar
- 📈 Filial bo'yicha
- 👤 Kassir bo'yicha
- 📅 Sana bo'yicha
- 💱 Valyuta bo'yicha

---

## 💼 KASSIR FUNKSIYALARI

### 1. Savdo Qilish
- 3 valyutada to'lov
- Avtomatik hisoblash
- Real-time yangilanish

### 2. Balans Ko'rish
- USD, UZS, RUB
- Jami balans
- Tarix

### 3. Kirim Topshirish
- Adminga pul topshirish
- Valyuta tanlash
- Tasdiq kutish

### 4. Hisobotlar
- Kunlik savdolar
- Oylik statistika
- Excel export

---

## 🚀 TEXNIK IMPLEMENTATSIYA

### Backend (server.js):
```javascript
// Filial API
app.get('/api/branches')
app.post('/api/branches')
app.put('/api/branches/:id')
app.delete('/api/branches/:id')

// Kassir API
app.get('/api/cashiers')
app.post('/api/cashiers')
app.get('/api/cashiers/:id')
app.put('/api/cashiers/:id')

// Savdo API
app.post('/api/cashier-sales')
app.get('/api/cashier-sales')
app.get('/api/cashier-sales/branch/:branchId')
app.get('/api/cashier-sales/cashier/:cashierId')

// Kirim topshirish API
app.post('/api/cashier-handovers')
app.get('/api/cashier-handovers')
app.put('/api/cashier-handovers/:id/approve')

// Excel API
app.get('/api/excel/export/branch/:branchId')
app.get('/api/excel/export/cashier/:cashierId')
app.post('/api/excel/import')
```

### Frontend:
1. **admin-branches.html** - Filiallar boshqaruvi
2. **admin-cashiers.html** - Kassirlar boshqaruvi
3. **admin-handovers.html** - Kirim qabul qilish
4. **cashier-login.html** - Kassir kirish
5. **cashier-dashboard.html** - Kassir paneli
6. **cashier-handover.html** - Kirim topshirish

---

## 📱 INTERFEYS

### Admin Dashboard:
```
┌─────────────────────────────────────┐
│  🏢 FILIALLAR BOSHQARUVI            │
├─────────────────────────────────────┤
│  Filial 1: Toshkent                 │
│  💰 Balans: $5,000                  │
│  👥 Kassirlar: 3                    │
│  📊 Bugungi savdo: $1,200           │
├─────────────────────────────────────┤
│  Filial 2: Samarqand                │
│  💰 Balans: $3,500                  │
│  👥 Kassirlar: 2                    │
│  📊 Bugungi savdo: $800             │
└─────────────────────────────────────┘
```

### Kassir Dashboard:
```
┌─────────────────────────────────────┐
│  💼 KASSIR PANELI                   │
│  Filial: Toshkent                   │
├─────────────────────────────────────┤
│  💵 Dollar: $250.00                 │
│  🇺🇿 So'm: 2,500,000                │
│  🇷🇺 Rubl: 15,000                   │
├─────────────────────────────────────┤
│  📊 Bugungi savdolar: 15            │
│  💰 Bugungi daromad: $450           │
└─────────────────────────────────────┘
```

---

## ✅ IMPLEMENTATSIYA QADAMLARI

### Qadam 1: Database Schema ✅
- MongoDB collections
- Indexes
- Validatsiya

### Qadam 2: Backend API ⏳
- CRUD operations
- Real-time updates
- Excel integration

### Qadam 3: Admin Panel ⏳
- Filiallar boshqaruvi
- Kassirlar boshqaruvi
- Kirim qabul qilish

### Qadam 4: Kassir Panel ⏳
- Login tizimi
- Savdo qilish
- Kirim topshirish

### Qadam 5: Excel Integration ⏳
- Export funksiyasi
- Import funksiyasi
- Avtomatik backup

### Qadam 6: Testing ⏳
- Unit tests
- Integration tests
- User acceptance testing

---

## 🎯 NATIJA

**Yaratiladi:**
- ✅ Ko'p filial tizimi
- ✅ Har bir filial alohida ombor
- ✅ Har bir filial alohida kassirlar
- ✅ Real-time MongoDB
- ✅ Excel backup
- ✅ Admin to'liq nazorat
- ✅ Kassir oson ishlash

**Vaqt:** 2-3 soat
**Murakkablik:** O'rta-Yuqori
**Texnologiyalar:** Node.js, MongoDB, Excel API, Real-time

---

**Boshlaylikmi? 🚀**
