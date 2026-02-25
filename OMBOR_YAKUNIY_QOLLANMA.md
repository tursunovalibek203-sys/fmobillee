# 🏭 OMBOR TIZIMI - YAKUNIY QOLLANMA

## ✅ NIMA QO'SHILDI?

### 1. Ombor Sahifasi (`/warehouse.html`)
- 📦 Mahsulotlar ro'yxati
- ➕ Yangi mahsulot qo'shish
- ✏️ Mahsulot tahrirlash
- 🔍 Qidirish va filtrlash
- 📊 Statistika

### 2. IMEI/Barcode Integratsiyasi
- Mijoz daftarida IMEI orqali qidirish
- Avtomatik mahsulot tanlash
- Avtomatik narx to'ldirish
- Avtomatik ombordan chiqarish

### 3. Ombor API Endpointlari
```
GET  /api/warehouse/products        - Barcha mahsulotlar
GET  /api/warehouse/search?q=...    - Qidirish
GET  /api/warehouse/product/:id     - Bitta mahsulot
POST /api/warehouse/products        - Yangi mahsulot
POST /api/warehouse/stock-in        - Omborga kiritish
POST /api/warehouse/stock-out       - Ombordan chiqarish
GET  /api/warehouse/low-stock       - Kam qolgan mahsulotlar
GET  /api/warehouse/stats           - Statistika
```

## 🚀 ISHGA TUSHIRISH

### 1. Test Mahsulotlar Qo'shish

```bash
npm run test-warehouse-products
```

Yoki:

```bash
node test-warehouse-products.js
```

Bu quyidagi mahsulotlarni qo'shadi:
- iPhone 14 Pro Max 256GB
- Samsung Galaxy S23 Ultra
- MacBook Pro M2 14"
- AirPods Pro 2
- Apple Watch Series 8
- iPad Air M1
- Sony WH-1000XM5
- Samsung 55" QLED TV
- Xiaomi Mi Band 7
- Logitech MX Master 3

### 2. Serverni Ishga Tushirish

```bash
npm start
```

### 3. Ombor Sahifasini Ochish

```
http://localhost:3000/warehouse.html
```

## 📝 FOYDALANISH

### Asosiy Sahifadan

1. "Ombor" tugmasini bosing (tepada, tez harakatlar bo'limida)
2. Ombor sahifasi ochiladi

### Mijozga Sotish

1. Mijoz daftariga kiring
2. "Yangi savdo" formasida IMEI inputga kiriting
3. Mahsulot topiladi va ko'rsatiladi
4. Mahsulotni tanlang
5. Faqat "Berilgan pul" ni kiriting
6. "Savdo qo'shish" tugmasini bosing

**Avtomatik:**
- ✅ Mahsulot nomi to'ldiriladi
- ✅ Narx to'ldiriladi
- ✅ Ombordan chiqariladi
- ✅ Savdo saqlanadi
- ✅ Excel ga yoziladi
- ✅ Telegram chek yuboriladi

## 🎯 ASOSIY FUNKSIYALAR

### 1. Mahsulot Qo'shish
- Nom, kategoriya, narxlar
- IMEI/Barcode
- Qoldiq va minimal miqdor
- Qo'shimcha ma'lumot

### 2. Omborga Kiritish
- Mahsulot tanlash
- Miqdor va narx
- Avtomatik qoldiq yangilanishi

### 3. Ombordan Chiqarish
- Mahsulot tanlash
- Miqdor
- Avtomatik qoldiq yangilanishi

### 4. Qidirish
- IMEI/Barcode
- Mahsulot nomi
- Kategoriya

### 5. Filtrlash
- Barchasi
- Omborda bor
- Kam qolgan
- Tugagan

## 💡 XUSUSIYATLAR

### Avtomatik Ogohlantirish

Mahsulot kam qolganda:
```
⚠️ Diqqat! Mahsulot kam qolgan!
Ombor: 2 dona
Minimal: 5 dona
```

### Foyda Hisoblash

```
Kelgan: 10,000,000 so'm
Sotish: 12,000,000 so'm
Foyda: 2,000,000 so'm (20%)
```

### Statistika

- 📦 Jami mahsulotlar
- ✅ Omborda bor
- ⚠️ Kam qolgan
- 💰 Ombor qiymati

## 🔧 TEXNIK TAFSILOTLAR

### Database Schema

```javascript
Product {
  productId: Number,
  name: String,
  categoryName: String,
  buyPrice: Number,
  sellPrice: Number,
  stock: Number,
  minStock: Number,
  unit: String,
  barcode: String,
  description: String,
  isActive: Boolean
}
```

### Stock Movement

```javascript
StockMovement {
  movementId: Number,
  productId: Number,
  type: 'in' | 'out',
  quantity: Number,
  price: Number,
  stockBefore: Number,
  stockAfter: Number,
  date: String,
  time: String
}
```

## 📊 API MISOLLARI

### Mahsulot Qidirish

```javascript
fetch('/api/warehouse/search?q=iPhone')
  .then(res => res.json())
  .then(data => console.log(data.products));
```

### Ombordan Chiqarish

```javascript
fetch('/api/warehouse/stock-out', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 1001,
    quantity: 1,
    reason: 'Savdo',
    userId: 'admin',
    userName: 'Admin'
  })
});
```

## ⚠️ MUHIM ESLATMALAR

1. **MongoDB ulanishi** - Ombor alohida database ishlatadi
2. **IMEI noyob** - Har bir mahsulotga noyob IMEI/Barcode bering
3. **Minimal qoldiq** - Doim belgilang
4. **Backup** - Muntazam backup oling

## 🎓 MISOL STSENARIY

### 1. Yangi Mahsulot Keldi

```
Mahsulot: iPhone 15 Pro
IMEI: 111222333444
Kelgan: 11,000,000 so'm
Sotish: 13,500,000 so'm
Miqdor: 10 dona
```

### 2. Mijoz Sotib Oldi

```
Mijoz: Alisher
IMEI: 111222333444
Berilgan: 7,000,000 so'm
```

**Natija:**
- Savdo: 13,500,000 so'm
- To'langan: 7,000,000 so'm
- Qarz: 6,500,000 so'm
- Ombor: 9 dona

### 3. Yangi Partiya Keldi

```
Mahsulot: iPhone 15 Pro
Miqdor: +5 dona
Kelgan: 11,000,000 so'm
```

**Natija:**
- Ombor: 14 dona (9 + 5)

## 📱 MOBIL VERSIYA

Ombor tizimi mobil qurilmalarda ham ishlaydi:
- Responsive dizayn
- Touch-friendly
- Tez yuklash

## 🔐 XAVFSIZLIK

- Login talab qilinadi
- Barcha harakatlar loglanadi
- Ma'lumotlar MongoDB da saqlanadi

## 📞 YORDAM

Muammo bo'lsa:
1. Konsolni tekshiring (F12)
2. Server loglarini ko'ring
3. MongoDB ulanishini tekshiring

---

## ✅ TAYYOR!

Ombor tizimi to'liq ishga tushirildi va mijozlarga mahsulot sotish uchun tayyor!

**Muvaffaqiyatlar! 🎉**
