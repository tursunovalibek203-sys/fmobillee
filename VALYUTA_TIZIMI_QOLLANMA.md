# 💱 Valyuta va Index Tizimi - Dollar, So'm va MongoDB Indexlar

## ✅ Tuzatilgan Muammolar

### 1. SKU va Barcode Duplicate Key Xatosi
**Muammo:** 
- `E11000 duplicate key error collection: warehouse_db.products index: sku_1 dup key: { sku: null }`
- `E11000 duplicate key error collection: warehouse_db.products index: barcode_1 dup key: { barcode: null }`

**Yechim:**
- SKU va barcode maydonlariga `default: undefined` qo'shildi (null o'rniga)
- Partial filter expression indexlar yaratildi: faqat mavjud bo'lgan qiymatlar uchun
- `{ $exists: true, $type: 'string' }` filter ishlatildi

**Tuzatish scripti:**
```bash
node fix-sku-index.js
```

**Natija:**
```
✅ Eski sku_1 index o'chirildi
✅ Eski barcode_1 index o'chirildi
✅ Eski branchId_1_barcode_1 index o'chirildi
✅ Yangi SKU index yaratildi
✅ Yangi barcode compound index yaratildi
```

### 2. Valyuta Tizimi (Dollar va So'm)
**Yangi xususiyat:** Savdolarni ikki xil valyutada amalga oshirish va alohida ko'rsatish

## 📊 Valyuta Tizimi Xususiyatlari

### Kassir Panelida
1. **Valyuta tanlash:**
   - 💵 Dollar ($)
   - 💰 So'm (UZS)

2. **Savdo qo'shish:**
   - Mahsulot narxi va to'lov valyutasi tanlanadi
   - Har bir savdo o'z valyutasida saqlanadi

3. **Statistika:**
   - Bugungi savdo: Dollar va So'm alohida
   - Jami savdo: Dollar va So'm alohida
   - Agar ikkala valyutada ham savdo bo'lsa: `$1,234.56 + 12,345,678 so'm`

### Admin Dashboard
1. **Kassir statistikasi:**
   - Har bir kassir uchun Dollar va So'm alohida
   - Jami daromad valyuta bo'yicha ajratilgan

2. **Filial statistikasi:**
   - Har bir filial uchun Dollar va So'm alohida
   - Umumiy statistika valyuta bo'yicha

## 🗄️ Database O'zgarishlari

### Sale Schema
```javascript
const SaleSchema = new mongoose.Schema({
  // ... boshqa maydonlar
  currency: { type: String, default: 'USD', enum: ['USD', 'UZS'] },
  // ...
});
```

### CashierSale Schema
```javascript
const CashierSaleSchema = new mongoose.Schema({
  // ... boshqa maydonlar
  currency: { type: String, default: 'USD', enum: ['USD', 'UZS'] },
  // ...
});
```

### Product Schema (Warehouse)
```javascript
const ProductSchema = new mongoose.Schema({
  // ... boshqa maydonlar
  barcode: { type: String, sparse: true, default: undefined },
  sku: { type: String, sparse: true, default: undefined },
  // ...
});

// Yangi indexlar
ProductSchema.index(
  { branchId: 1, barcode: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { barcode: { $exists: true, $type: 'string' } }
  }
);

ProductSchema.index(
  { sku: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { sku: { $exists: true, $type: 'string' } }
  }
);
```

## 🔧 API O'zgarishlari

### POST /api/cashier-sales
**Yangi maydon:**
```json
{
  "currency": "USD" // yoki "UZS"
}
```

### GET /api/cashier-stats/:cashierId
**Yangi javob:**
```json
{
  "success": true,
  "stats": {
    "balance": 1000,
    "todayUSD": 500,
    "todayUZS": 5000000,
    "totalUSD": 10000,
    "totalUZS": 100000000
  }
}
```

## 💻 Frontend O'zgarishlari

### Kassir Panel (cashier.html)
```html
<div class="row">
  <label>
    <input type="radio" name="currency" value="USD" checked>
    💵 Dollar ($)
  </label>
  <label>
    <input type="radio" name="currency" value="UZS">
    💰 So'm (UZS)
  </label>
</div>
```

### JavaScript (cashier.js)
```javascript
function formatMoney(num, currency = 'USD') {
  if (currency === 'UZS') {
    return num.toLocaleString('uz-UZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }) + ' so\'m';
  } else {
    return '$' + num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
```

## 📝 Foydalanish

### 1. SKU va Barcode Xatolarini Tuzatish
```bash
# MongoDB ga ulanish va indexlarni tuzatish
node fix-sku-index.js
```

**Script nima qiladi:**
1. Eski `sku_1` indexni o'chiradi
2. Eski `barcode_1` indexni o'chiradi
3. Eski `branchId_1_barcode_1` indexni o'chiradi
4. Barcha null SKU larni undefined ga o'zgartiradi
5. Barcha null barcode larni undefined ga o'zgartiradi
6. Yangi partial filter indexlar yaratadi

### 2. Serverni Qayta Ishga Tushirish
```bash
npm start
```

### 3. Kassir Panelida Savdo Qo'shish
1. Mijozni tanlang
2. Mahsulot ma'lumotlarini kiriting
3. **Valyutani tanlang:** Dollar yoki So'm
4. Narx va to'lovni kiriting
5. "Savdo qo'shish" tugmasini bosing

### 4. Statistikani Ko'rish
- **Kassir panelida:** Bugungi va jami savdolar valyuta bo'yicha
- **Admin panelida:** Barcha kassirlar va filiallar uchun valyuta bo'yicha

## 🎯 Afzalliklar

1. **Ikki valyutada ishlash:** Dollar va So'm
2. **Aniq statistika:** Har bir valyuta alohida ko'rsatiladi
3. **Xatoliksiz:** SKU duplicate key muammosi hal qilindi
4. **Qulay interfeys:** Valyuta tanlash oson va tushunarli
5. **To'liq hisobot:** Admin har bir valyutada qancha savdo bo'lganini ko'radi

## ⚠️ Muhim Eslatmalar

1. **Valyuta konvertatsiyasi yo'q:** Tizim avtomatik konvertatsiya qilmaydi
2. **Alohida hisoblanadi:** Har bir valyuta o'z-o'zidan hisoblanadi
3. **Eski savdolar:** Eski savdolar default USD valyutasida
4. **Backup:** O'zgarishlardan oldin backup oling

## 🔄 Yangilanish Jarayoni

1. ✅ warehouse-database.js - SKU va barcode maydonlarini tuzatish
2. ✅ warehouse-database.js - Partial filter indexlar qo'shish
3. ✅ server.js - Sale va CashierSale schemalariga currency qo'shish
4. ✅ cashier.html - Valyuta tanlash qo'shish
5. ✅ cashier.js - formatMoney va savdo qo'shish yangilash
6. ✅ admin-cashiers.js - Statistika valyuta bo'yicha
7. ✅ fix-sku-index.js - SKU va barcode indexlarni tuzatish scripti

## 🎯 MongoDB Index Tafsilotlari

### Partial Filter Expression
MongoDB da `partialFilterExpression` faqat ma'lum shartga mos keladigan dokumentlar uchun index yaratadi.

**Bizning holatda:**
```javascript
partialFilterExpression: { sku: { $exists: true, $type: 'string' } }
```

Bu degani:
- Faqat `sku` maydoni mavjud bo'lgan dokumentlar indexlanadi
- Faqat `sku` string tipida bo'lgan dokumentlar indexlanadi
- `sku: null` yoki `sku: undefined` dokumentlar indexlanmaydi
- Shuning uchun bir nechta mahsulot barcode/sku siz bo'lishi mumkin

### Nima uchun sparse va partialFilterExpression birga ishlamaydi?
MongoDB 4.0+ versiyasida `sparse` va `partialFilterExpression` bir vaqtda ishlatib bo'lmaydi. `partialFilterExpression` yanada kuchli va moslashuvchan.

## 📞 Yordam

Agar muammo bo'lsa:
1. `node fix-sku-index.js` ni ishga tushiring
2. Serverni qayta ishga tushiring
3. Brauzer cache ni tozalang
4. Qayta login qiling

---

**Yaratilgan sana:** 2025-02-11
**Versiya:** 2.0
**Status:** ✅ Tayyor
