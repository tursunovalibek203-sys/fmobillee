# 📦 HAR BIR FILIAL UCHUN ALOHIDA OMBOR TIZIMI

**Sana:** 28 Fevral 2026  
**Maqsad:** Har bir filial o'z omboriga ega bo'lsin  
**Status:** 🚧 JARAYONDA

---

## 🎯 MAQSAD

Hozirda barcha filiallar bitta umumiy ombordan foydalanadi. Yangi tizimda:
- ✅ Har bir filial o'z omboriga ega
- ✅ Filiallar bir-birining mahsulotlarini ko'rmaydi
- ✅ Admin barcha filiallar omborini ko'radi
- ✅ Mahsulotlarni filiallar orasida ko'chirish mumkin

---

## 📊 HOZIRGI TIZIM

### Product Schema (eski):

```javascript
const ProductSchema = new mongoose.Schema({
  productId: Number,
  name: String,
  stock: Number,
  // ❌ branchId yo'q - barcha filiallar bitta ombor
});
```

### Muammo:

```
Filial 1 (Toshkent):
  - iPhone 15: 10 dona
  - Samsung S24: 5 dona

Filial 2 (Samarqand):
  - iPhone 15: 10 dona (bir xil mahsulot!)
  - Samsung S24: 5 dona (bir xil mahsulot!)

❌ Muammo: Ikki filial bir xil mahsulotni ko'radi
❌ Muammo: Stock aralashib ketadi
❌ Muammo: Filiallar bir-birining mahsulotini sotadi
```

---

## ✅ YANGI TIZIM

### Product Schema (yangi):

```javascript
const ProductSchema = new mongoose.Schema({
  productId: Number,
  branchId: { type: Number, default: 0 },  // ✅ Yangi maydon
  name: String,
  stock: Number,
});

// branchId = 0 → Umumiy ombor (admin)
// branchId = 123 → Filial 1 ombori
// branchId = 456 → Filial 2 ombori
```

### Yechim:

```
Umumiy Ombor (branchId = 0):
  - iPhone 15: 100 dona (admin ko'radi)
  - Samsung S24: 50 dona (admin ko'radi)

Filial 1 Ombori (branchId = 123):
  - iPhone 15: 10 dona (faqat Filial 1 ko'radi)
  - Samsung S24: 5 dona (faqat Filial 1 ko'radi)

Filial 2 Ombori (branchId = 456):
  - iPhone 15: 15 dona (faqat Filial 2 ko'radi)
  - Samsung S24: 8 dona (faqat Filial 2 ko'radi)

✅ Har bir filial faqat o'z mahsulotlarini ko'radi
✅ Stock aralashmaydi
✅ Admin barcha omborlarni ko'radi
```

---

## 🔧 O'ZGARISHLAR

### 1. Database Schema ✅

**File:** `models/schemas.js`

```javascript
// ✅ BAJARILDI
const ProductSchema = new mongoose.Schema({
  productId: { type: Number, required: true, unique: true },
  branchId: { type: Number, default: 0 },  // ✅ Qo'shildi
  name: { type: String, required: true },
  // ...
});
```

### 2. Server API Endpoints

**File:** `server.js`

#### 2.1 GET /api/products

**Oldin:**
```javascript
app.get('/api/products', async (req, res) => {
  const products = await Product.find({});  // ❌ Barcha mahsulotlar
  res.json({ success: true, products });
});
```

**Keyin:**
```javascript
app.get('/api/products', async (req, res) => {
  const { branchId } = req.query;
  
  let query = {};
  if (branchId) {
    // Filial uchun: faqat o'z mahsulotlari
    query.branchId = Number(branchId);
  } else {
    // Admin uchun: barcha mahsulotlar
    // query = {} (barcha)
  }
  
  const products = await Product.find(query);
  res.json({ success: true, products });
});
```

#### 2.2 POST /api/products

**Oldin:**
```javascript
app.post('/api/products', async (req, res) => {
  const product = await Product.create({
    productId: Date.now(),
    name: req.body.name,
    // ❌ branchId yo'q
  });
});
```

**Keyin:**
```javascript
app.post('/api/products', async (req, res) => {
  const product = await Product.create({
    productId: Date.now(),
    branchId: req.body.branchId || 0,  // ✅ branchId qo'shildi
    name: req.body.name,
  });
});
```

### 3. Frontend - Warehouse

**File:** `public/warehouse-pro.html`

#### 3.1 Mahsulotlarni yuklash

**Oldin:**
```javascript
async function loadProducts() {
  const res = await fetch('/api/products');  // ❌ Barcha mahsulotlar
  products = await res.json();
}
```

**Keyin:**
```javascript
async function loadProducts() {
  const branchId = getCurrentBranchId();  // ✅ Joriy filial ID
  const res = await fetch(`/api/products?branchId=${branchId}`);
  products = await res.json();
}

function getCurrentBranchId() {
  // Agar kassir bo'lsa, uning filial ID sini qaytarish
  const cashier = JSON.parse(localStorage.getItem('currentCashier'));
  return cashier ? cashier.branchId : 0;  // 0 = admin (barcha)
}
```

#### 3.2 Mahsulot qo'shish

**Oldin:**
```javascript
async function addProduct() {
  await fetch('/api/products', {
    method: 'POST',
    body: JSON.stringify({
      name: productName,
      // ❌ branchId yo'q
    })
  });
}
```

**Keyin:**
```javascript
async function addProduct() {
  const branchId = getCurrentBranchId();
  await fetch('/api/products', {
    method: 'POST',
    body: JSON.stringify({
      name: productName,
      branchId: branchId,  // ✅ branchId qo'shildi
    })
  });
}
```

### 4. Frontend - Cashier

**File:** `public/cashier-new.html`

Kassir faqat o'z filiali mahsulotlarini ko'radi:

```javascript
async function loadProducts() {
  const cashier = JSON.parse(localStorage.getItem('currentCashier'));
  const branchId = cashier.branchId;
  
  const res = await fetch(`/api/products?branchId=${branchId}`);
  products = await res.json();
}
```

### 5. Frontend - Admin

**File:** `public/admin-dashboard.html`

Admin barcha filiallar mahsulotlarini ko'radi:

```javascript
async function loadAllProducts() {
  // branchId yo'q = barcha mahsulotlar
  const res = await fetch('/api/products');
  products = await res.json();
  
  // Filiallarga bo'lib ko'rsatish
  const byBranch = {};
  products.forEach(p => {
    const bid = p.branchId || 0;
    if (!byBranch[bid]) byBranch[bid] = [];
    byBranch[bid].push(p);
  });
  
  displayProductsByBranch(byBranch);
}
```

---

## 📋 BAJARISH TARTIBI

### ✅ Bosqich 1: Database Schema (BAJARILDI)

- [x] Product schema ga `branchId` qo'shish
- [x] Default qiymat: 0 (umumiy ombor)

### 🚧 Bosqich 2: Server API (KEYINGI)

- [ ] GET /api/products - branchId filter qo'shish
- [ ] POST /api/products - branchId saqlash
- [ ] PUT /api/products/:id - branchId yangilash
- [ ] GET /api/products/transfer - filiallar orasida ko'chirish

### 🚧 Bosqich 3: Frontend - Warehouse

- [ ] getCurrentBranchId() funksiyasi
- [ ] loadProducts() - branchId bilan
- [ ] addProduct() - branchId bilan
- [ ] Filial tanlash dropdown

### 🚧 Bosqich 4: Frontend - Cashier

- [ ] Faqat o'z filiali mahsulotlarini ko'rish
- [ ] Savdo qilganda stock kamaytirish (o'z filialida)

### 🚧 Bosqich 5: Frontend - Admin

- [ ] Barcha filiallar mahsulotlarini ko'rish
- [ ] Filiallarga bo'lib ko'rsatish
- [ ] Mahsulotlarni filiallar orasida ko'chirish

### 🚧 Bosqich 6: Migration

- [ ] Mavjud mahsulotlarga branchId = 0 qo'yish
- [ ] Test qilish

---

## 🎨 UI O'ZGARISHLARI

### Warehouse Page

**Yangi elementlar:**

```html
<!-- Filial tanlash (admin uchun) -->
<select id="branchFilter">
  <option value="0">Umumiy Ombor</option>
  <option value="123">Filial 1 - Toshkent</option>
  <option value="456">Filial 2 - Samarqand</option>
</select>

<!-- Mahsulot qo'shishda filial tanlash -->
<select id="productBranch">
  <option value="0">Umumiy Ombor</option>
  <option value="123">Filial 1</option>
  <option value="456">Filial 2</option>
</select>
```

### Admin Dashboard

**Yangi bo'lim:**

```html
<div class="warehouse-by-branch">
  <h3>📦 Umumiy Ombor</h3>
  <p>Jami: 150 dona mahsulot</p>
  
  <h3>📦 Filial 1 - Toshkent</h3>
  <p>Jami: 50 dona mahsulot</p>
  
  <h3>📦 Filial 2 - Samarqand</h3>
  <p>Jami: 30 dona mahsulot</p>
</div>
```

---

## 🔄 MAHSULOTLARNI KO'CHIRISH

### Yangi Funksiya: Transfer

```javascript
// Admin mahsulotni bir filialdan boshqasiga ko'chirishi mumkin
async function transferProduct(productId, fromBranch, toBranch, quantity) {
  // 1. fromBranch dan quantity ni kamaytirish
  await updateStock(productId, fromBranch, -quantity);
  
  // 2. toBranch ga quantity ni qo'shish
  await updateStock(productId, toBranch, +quantity);
  
  // 3. Transfer tarixini saqlash
  await saveTransferHistory({
    productId,
    fromBranch,
    toBranch,
    quantity,
    date: new Date()
  });
}
```

---

## ⚠️ MUHIM ESLATMALAR

### 1. Mavjud Ma'lumotlar

Hozirgi barcha mahsulotlar `branchId = 0` (umumiy ombor) ga tegishli bo'ladi.

### 2. Migration Script

Agar kerak bo'lsa, mahsulotlarni filiallarga bo'lish uchun migration script yozish mumkin:

```javascript
// Barcha mahsulotlarni Filial 1 ga o'tkazish
await Product.updateMany(
  { branchId: 0 },
  { $set: { branchId: 123 } }
);
```

### 3. Backward Compatibility

Eski kod ishlashda davom etishi uchun:
- `branchId` default = 0
- Agar `branchId` yo'q bo'lsa, barcha mahsulotlarni qaytarish

---

## 📊 KUTILAYOTGAN NATIJA

### Oldin:

```
Warehouse:
  - iPhone 15: 100 dona (barcha filiallar ko'radi)
  - Samsung S24: 50 dona (barcha filiallar ko'radi)

❌ Filial 1 sotdi: iPhone 15 (1 dona)
❌ Filial 2 ham ko'radi: iPhone 15 (99 dona)
❌ Stock aralashadi
```

### Keyin:

```
Umumiy Ombor (Admin):
  - iPhone 15: 100 dona
  - Samsung S24: 50 dona

Filial 1 Ombori:
  - iPhone 15: 10 dona
  - Samsung S24: 5 dona

Filial 2 Ombori:
  - iPhone 15: 15 dona
  - Samsung S24: 8 dona

✅ Filial 1 sotdi: iPhone 15 (1 dona)
✅ Filial 1 ombori: iPhone 15 (9 dona)
✅ Filial 2 ombori: iPhone 15 (15 dona) - o'zgarmadi
✅ Stock aralashmaydi
```

---

## 🚀 KEYINGI QADAMLAR

1. ✅ Schema yangilandi
2. ⏳ Server API ni yangilash
3. ⏳ Frontend ni yangilash
4. ⏳ Test qilish
5. ⏳ Migration (agar kerak bo'lsa)

**Davom ettirishni xohlaysizmi?**
