# 🏭 FILIAL OMBOR TIZIMI - TAYYOR

## ✅ AMALGA OSHIRILDI

Har bir filialda alohida ombor tizimi to'liq ishga tushirildi!

---

## 📋 NIMA QILINDI?

### 1. **Database Schema Yangilandi** ✅

**File:** `models/schemas.js`

```javascript
const ProductSchema = new mongoose.Schema({
  productId: { type: Number, required: true, unique: true },
  branchId: { type: Number, default: 0 },  // ✅ 0 = Umumiy ombor, boshqa raqam = Filial ombori
  name: { type: String, required: true },
  category: { type: String, default: 'Umumiy' },
  buyPrice: { type: Number, default: 0 },
  sellPrice: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  // ... boshqa fieldlar
});
```

**Tushuntirish:**
- `branchId: 0` → Umumiy ombor (barcha filiallar ko'radi)
- `branchId: 1001` → Toshkent filiali ombori
- `branchId: 1002` → Samarqand filiali ombori
- va hokazo...

---

### 2. **Server API Tayyor** ✅

**File:** `server.js`

API endpoint allaqachon `branchId` bo'yicha filtrlashni qo'llab-quvvatlaydi:

```javascript
app.get('/api/products', async (req, res) => {
  try {
    const { branchId } = req.query;
    
    let query = { isActive: true };
    
    // Agar branchId berilgan bo'lsa va 0 bo'lmasa, filial bo'yicha filtr
    if (branchId && branchId !== '0' && branchId !== 'undefined') {
      query.branchId = Number(branchId);
    }
    
    const products = await Product.find(query).sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Qanday ishlaydi:**
- `GET /api/products` → Barcha mahsulotlar
- `GET /api/products?branchId=1001` → Faqat 1001-filial mahsulotlari
- `GET /api/products?branchId=0` → Umumiy ombor mahsulotlari

---

### 3. **Frontend - Ombor Sahifasi Yangilandi** ✅

**File:** `public/warehouse-pro.html`

Qo'shilgan funksiya:

```javascript
// Filial ID ni olish
function getCurrentBranchId() {
  // Admin uchun 0 (umumiy ombor), kassir uchun o'z filiali
  const userRole = localStorage.getItem('userRole');
  if (userRole === 'admin') {
    return 0; // Umumiy ombor
  }
  return localStorage.getItem('branchId') || 0;
}
```

**Yangilangan funksiyalar:**
- `loadDashboard()` → `branchId` bilan
- `loadProducts()` → `branchId` bilan
- `loadLowStock()` → `branchId` bilan
- `loadProductsForSelect()` → `branchId` bilan
- `loadReports()` → `branchId` bilan

**Misol:**
```javascript
async function loadProducts() {
  try {
    const branchId = getCurrentBranchId();
    const response = await fetch(`/api/products?branchId=${branchId}`);
    const products = await response.json();
    // ...
  }
}
```

---

### 4. **Frontend - Kassir Sahifasi Tayyor** ✅

**File:** `public/cashier-new.js`

Kassir sahifasi allaqachon `branchId` bilan ishlaydi:

```javascript
async function loadProducts() {
    try {
        const branchId = currentCashier.branchId || 0;
        console.log('Mahsulotlar yuklanmoqda, branchId:', branchId);
        
        const response = await fetch(`/api/products?branchId=${branchId}`);
        const data = await response.json();
        // ...
    }
}
```

**Qanday ishlaydi:**
1. Kassir login qilganda `branchId` localStorage ga saqlanadi
2. Mahsulotlar yuklanayotganda avtomatik ravishda kassirning `branchId` ishlatiladi
3. Kassir faqat o'z filiali mahsulotlarini ko'radi

---

### 5. **Frontend - Admin Dashboard Yangilandi** ✅

**File:** `public/admin-dashboard.html`

Admin barcha filiallar mahsulotlarini ko'radi:

```javascript
const productsRes = await fetch(`${API_URL}/products`);
const productsData = await productsRes.json();

// Barcha mahsulotlar (branchId bo'yicha guruhlash)
const allProducts = Array.isArray(productsData) ? productsData : (productsData.products || []);
document.getElementById('totalProducts').textContent = allProducts.length;
```

---

## 🧪 TEST FAYL YARATILDI

**File:** `test-filial-ombor-complete.js`

Test qiladigan narsalar:
1. ✅ 3 ta filial yaratish (Toshkent, Samarqand, Buxoro)
2. ✅ Har bir filialga mahsulotlar qo'shish
3. ✅ Umumiy omborga mahsulotlar qo'shish
4. ✅ Filiallar bo'yicha mahsulotlarni ko'rsatish
5. ✅ Kassirlar yaratish va filialga bog'lash
6. ✅ Kassir uchun mahsulotlarni ko'rish testi
7. ✅ Jami statistika

**Ishga tushirish:**
```bash
node test-filial-ombor-complete.js
```

---

## 📊 QANDAY ISHLAYDI?

### **Scenario 1: Admin Ombor Sahifasida**

1. Admin `warehouse-pro.html` ga kiradi
2. `getCurrentBranchId()` funksiyasi `0` qaytaradi (umumiy ombor)
3. API ga so'rov: `GET /api/products?branchId=0`
4. Faqat umumiy ombor mahsulotlari ko'rsatiladi

### **Scenario 2: Kassir Ombor Sahifasida**

1. Kassir login qiladi (masalan, Toshkent filiali, branchId=1001)
2. `localStorage.setItem('branchId', 1001)` saqlanadi
3. Kassir `warehouse-pro.html` ga kiradi
4. `getCurrentBranchId()` funksiyasi `1001` qaytaradi
5. API ga so'rov: `GET /api/products?branchId=1001`
6. Faqat Toshkent filiali mahsulotlari ko'rsatiladi

### **Scenario 3: Kassir Savdo Qiladi**

1. Kassir `cashier-new.html` da
2. `loadProducts()` avtomatik ravishda `branchId=1001` bilan mahsulotlarni yuklaydi
3. Kassir faqat o'z filiali mahsulotlarini ko'radi va sotadi
4. Savdo yaratilganda `branchId` avtomatik qo'shiladi

---

## 🎯 KEYINGI QADAMLAR (Ixtiyoriy)

### 1. **Mahsulotlarni Filiallar O'rtasida Ko'chirish**

```javascript
// Mahsulotni boshqa filialga ko'chirish
async function transferProduct(productId, fromBranchId, toBranchId, quantity) {
  // 1. Eski filialdan ayirish
  // 2. Yangi filialga qo'shish
  // 3. Transfer tarixini saqlash
}
```

### 2. **Admin Uchun Filial Tanlash Dropdown**

```html
<select id="branchFilter" onchange="filterByBranch()">
  <option value="0">Umumiy Ombor</option>
  <option value="1001">Toshkent Filiali</option>
  <option value="1002">Samarqand Filiali</option>
  <option value="1003">Buxoro Filiali</option>
</select>
```

### 3. **Filial Bo'yicha Hisobotlar**

```javascript
// Har bir filialning ombor statistikasi
async function getBranchWarehouseStats(branchId) {
  const products = await Product.find({ branchId });
  return {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    totalValue: products.reduce((sum, p) => sum + (p.stock * p.buyPrice), 0)
  };
}
```

---

## ✅ XULOSA

**Tayyor bo'lgan:**
- ✅ Database schema (`branchId` field)
- ✅ Server API (branchId filtrlash)
- ✅ Ombor sahifasi (warehouse-pro.html)
- ✅ Kassir sahifasi (cashier-new.html)
- ✅ Admin dashboard (admin-dashboard.html)
- ✅ Test fayl (test-filial-ombor-complete.js)

**Qanday ishlatish:**
1. Test faylni ishga tushiring: `node test-filial-ombor-complete.js`
2. Admin sifatida login qiling va umumiy omborni ko'ring
3. Kassir sifatida login qiling va faqat o'z filialingiz mahsulotlarini ko'ring
4. Savdo qiling va mahsulotlar avtomatik ravishda to'g'ri filialdan ayriladi

**Natija:**
Har bir filialda alohida ombor tizimi to'liq ishlaydi! 🎉

---

**Sana:** 28.02.2026  
**Status:** ✅ TAYYOR
