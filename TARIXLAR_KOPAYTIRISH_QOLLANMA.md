# 📊 TARIXLARNI KO'PAYTIRISH QO'LLANMA

## 🎯 MAQSAD
Tizimda test ma'lumotlar yaratish va tarixlarni ko'paytirish.

---

## 📝 NIMA QILINADI?

### 1. Mahsulotlar (100 ta)
- Turli filiallar uchun
- Turli kategoriyalar (Telefon, Aksessuar, Quloqchin, Zaryadlovchi)
- Turli narxlar (100k - 1M)
- Oxirgi 90 kun ichida

### 2. Savdolar (500 ta)
- 5 ta kassir uchun
- 3 ta filial uchun
- Turli mahsulotlar
- Turli narxlar (200k - 2M)
- 80% to'liq to'lov, 20% qarzli
- Oxirgi 90 kun ichida

### 3. Kirim Berishlar (100 ta)
- 5 ta kassir uchun
- 3 ta filial uchun
- Turli summa (500k - 5M)
- Oxirgi 90 kun ichida

### 4. Faoliyat Tarixi (200 ta)
- Turli harakatlar
- Turli foydalanuvchilar
- Oxirgi 90 kun ichida

---

## 🚀 QANDAY ISHLATISH?

### Usul 1: MongoDB ulanishi bor bo'lsa

```bash
node generate-test-data.js
```

### Usul 2: Server orqali (tavsiya etiladi)

1. **Serverni ishga tushiring:**
```bash
node server.js
```

2. **API orqali ma'lumot qo'shing:**

**Mahsulot qo'shish:**
```javascript
POST http://localhost:3000/api/products
{
  "branchId": 1001,
  "name": "iPhone 15 Pro Max",
  "category": "Telefon",
  "buyPrice": 15000000,
  "sellPrice": 16000000,
  "stock": 10,
  "minStock": 5,
  "imei": "IMEI123456"
}
```

**Savdo qilish:**
```javascript
POST http://localhost:3000/api/cashier-sale
{
  "cashierId": 1,
  "branchId": 1001,
  "product": "iPhone 15 Pro Max",
  "price": 16000000,
  "paid": 16000000,
  "debt": 0,
  "currency": "UZS"
}
```

**Kirim berish:**
```javascript
POST http://localhost:3000/api/cashier-handover
{
  "cashierId": 1,
  "amount": 5000000,
  "notes": "Kunlik kirim"
}
```

### Usul 3: Frontend orqali

1. **Admin panel ga kiring:**
   - http://localhost:3000/admin-login.html
   - Username: admin / Password: admin123

2. **Warehouse Pro ga o'ting:**
   - http://localhost:3000/warehouse-pro.html
   - Mahsulotlar qo'shing

3. **Kassir panel ga kiring:**
   - http://localhost:3000/cashier-login.html
   - Filialni tanlang va login qiling

4. **Savdo qiling:**
   - http://localhost:3000/cashier-new.html
   - Mahsulot tanlang va savdo qiling

---

## 📊 KUTILAYOTGAN NATIJA

### Jami ma'lumotlar:
- ✅ 100 ta mahsulot
- ✅ 500 ta savdo
- ✅ 100 ta kirim berish
- ✅ 200 ta faoliyat tarixi

### Filial bo'yicha:
- **Umumiy (0):** ~25 ta mahsulot
- **Filial 1001:** ~25 ta mahsulot, ~167 ta savdo, ~33 ta kirim
- **Filial 1002:** ~25 ta mahsulot, ~167 ta savdo, ~33 ta kirim
- **Filial 1003:** ~25 ta mahsulot, ~166 ta savdo, ~34 ta kirim

### Kassir bo'yicha:
- **Kassir 1:** ~100 ta savdo, ~20 ta kirim
- **Kassir 2:** ~100 ta savdo, ~20 ta kirim
- **Kassir 3:** ~100 ta savdo, ~20 ta kirim
- **Kassir 4:** ~100 ta savdo, ~20 ta kirim
- **Kassir 5:** ~100 ta savdo, ~20 ta kirim

---

## 🔧 MUAMMOLAR VA YECHIMLAR

### 1. MongoDB ulanish xatosi
**Muammo:** `ECONNREFUSED` yoki `querySrv` xatosi

**Yechim:**
- Internet ulanishini tekshiring
- MongoDB Atlas IP Whitelist ga IP qo'shing (0.0.0.0/0)
- .env faylidagi MONGODB_URI ni tekshiring

### 2. Duplicate key error
**Muammo:** `E11000 duplicate key error`

**Yechim:**
- Bu normal, ba'zi ma'lumotlar allaqachon mavjud
- Script davom etadi va yangi ma'lumotlar qo'shadi

### 3. Validation error
**Muammo:** `Validation failed`

**Yechim:**
- BranchId majburiy ekanligini tekshiring
- Barcha required fieldlar to'ldirilganligini tekshiring

---

## 📈 TARIXLARNI TEKSHIRISH

### 1. Admin Dashboard
```
http://localhost:3000/admin-super-dashboard.html
```
- Jami savdolar
- Jami kirim berishlar
- Filial bo'yicha statistika

### 2. Warehouse History
```
http://localhost:3000/warehouse-history.html
```
- Mahsulotlar tarixi
- Stock o'zgarishlari

### 3. Activity Log
```
http://localhost:3000/activity-log.html
```
- Barcha faoliyatlar tarixi
- Filial va kassir bo'yicha filter

### 4. Kassir Transactions
```
http://localhost:3000/cashier-transactions.html
```
- Kassir savdolari
- Kirim berishlar

---

## 🎨 QOSHIMCHA IMKONIYATLAR

### 1. Sana oralig'ini o'zgartirish
`generate-test-data.js` faylida:
```javascript
// Oxirgi 90 kun o'rniga 180 kun
startDate.setDate(startDate.getDate() - 180);
```

### 2. Ma'lumotlar sonini o'zgartirish
```javascript
// Mahsulotlar: 100 → 200
for (let i = 0; i < 200; i++) { ... }

// Savdolar: 500 → 1000
for (let i = 0; i < 1000; i++) { ... }
```

### 3. Filiallar sonini o'zgartirish
```javascript
const branches = [0, 1001, 1002, 1003, 1004, 1005];
```

### 4. Kassirlar sonini o'zgartirish
```javascript
const cashiers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
```

---

## ✅ TEKSHIRISH

Test ma'lumotlar qo'shilganidan keyin:

1. **Admin Dashboard ga kiring**
2. **Statistikani tekshiring:**
   - Jami savdolar soni
   - Jami kirim berishlar
   - Filial bo'yicha ma'lumotlar
3. **Tarixlarni ko'ring:**
   - Warehouse History
   - Activity Log
   - Kassir Transactions

---

## 🎉 XULOSA

Test ma'lumotlar generatori tizimni to'liq test qilish uchun:
- ✅ 900 ta ma'lumot yaratadi
- ✅ Oxirgi 90 kun tarixini qamrab oladi
- ✅ Barcha filiallar va kassirlar uchun
- ✅ Real holatga yaqin ma'lumotlar

**TIZIM TARIXLAR BILAN TO'LIQ ISHLASHGA TAYYOR!** 🚀
