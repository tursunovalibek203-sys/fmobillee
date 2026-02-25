# 📱 IMEI Tizimi - Har Bir Dona Mahsulot Uchun

## ✅ Muammo Hal Qilindi

### 1. **warehouse.html - Duplicate Script**
- ❌ **Muammo:** Script ikki marta yuklangan (248 va 278-qatorlarda)
- ✅ **Yechim:** Fayl to'liq qayta yozildi, faqat bitta script qoldirildi

### 2. **IMEI Tizimi - Har Bir Dona Uchun**
- ✅ Yangi sahifa yaratildi: `product-items.html`
- ✅ Har bir mahsulot donasi uchun alohida IMEI
- ✅ IMEI kodlarni boshqarish tizimi

## 🎯 Qanday Ishlaydi?

### Misol: iPhone 14 Pro Max

Agar sizda **10 ta iPhone 14 Pro Max** bo'lsa:

```
Mahsulot: iPhone 14 Pro Max 256GB
├── IMEI 1: 123456789012345 (Mavjud)
├── IMEI 2: 123456789012346 (Mavjud)
├── IMEI 3: 123456789012347 (Sotilgan)
├── IMEI 4: 123456789012348 (Mavjud)
├── IMEI 5: 123456789012349 (Band)
├── IMEI 6: 123456789012350 (Mavjud)
├── IMEI 7: 123456789012351 (Sotilgan)
├── IMEI 8: 123456789012352 (Mavjud)
├── IMEI 9: 123456789012353 (Mavjud)
└── IMEI 10: 123456789012354 (Mavjud)

Jami: 10 dona
Mavjud: 7 dona
Sotilgan: 2 dona
Band: 1 dona
```

## 📋 Yangi Sahifalar

### 1. warehouse.html (Yangilandi)
- ✅ Duplicate script olib tashlandi
- ✅ "IMEI Kodlarni Ko'rish" tugmasi qo'shildi
- ✅ Har bir mahsulot kartasida IMEI badge

### 2. product-items.html (Yangi)
**URL:** `/product-items.html?productId=123`

**Funksiyalar:**
- ✅ Mahsulotning barcha IMEI kodlarini ko'rish
- ✅ Yangi IMEI qo'shish
- ✅ IMEI bo'yicha qidirish
- ✅ Status bo'yicha filter (Mavjud, Sotilgan, Band)
- ✅ Har bir IMEI ni sotish
- ✅ IMEI ni o'chirish

**Statistika:**
- Jami donalar
- Mavjud donalar
- Sotilgan donalar
- Band qilingan donalar

## 🔧 Texnik Tafsilotlar

### Database Schema (ProductItem)

```javascript
{
  _id: ObjectId,
  productId: Number,           // Qaysi mahsulotga tegishli
  branchId: Number,            // Qaysi filialda
  imei: String (unique),       // IMEI kodi
  buyPrice: Number,            // Kelgan narxi
  sellPrice: Number,           // Sotish narxi
  status: String,              // available, sold, reserved
  soldDate: Date,              // Sotilgan sana
  soldTo: String,              // Kimga sotilgan
  notes: String,               // Qo'shimcha ma'lumot
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints

```
GET    /api/warehouse/product-items/:productId    - Mahsulotning barcha IMEI lari
POST   /api/warehouse/product-items               - Yangi IMEI qo'shish
DELETE /api/warehouse/product-items/:itemId       - IMEI ni o'chirish
POST   /api/warehouse/sell-item                   - IMEI ni sotish
GET    /api/warehouse/search-imei/:imei           - IMEI qidirish
```

## 📱 Foydalanish

### 1. Mahsulot Qo'shish (Ombor)

```
1. Ombor sahifasiga o'ting
2. "+" tugmasini bosing
3. Mahsulot ma'lumotlarini kiriting:
   - Nomi: iPhone 14 Pro Max 256GB
   - IMEI: 123456789012345
   - Kelgan narxi: $800
   - Sotish narxi: $1000
4. Saqlash
```

Bu birinchi dona qo'shiladi.

### 2. Qo'shimcha Donalar Qo'shish

```
1. Mahsulot kartasini bosing
2. "IMEI Kodlarni Ko'rish" tugmasini bosing
3. "+" tugmasini bosing
4. Yangi IMEI kiriting:
   - IMEI: 123456789012346
   - Kelgan narxi: $800
   - Sotish narxi: $1000
5. Saqlash
```

Har safar yangi IMEI qo'shganingizda:
- ✅ Mahsulot stock +1 ga oshadi
- ✅ Yangi dona "Mavjud" statusida bo'ladi

### 3. Mahsulot Sotish

```
1. IMEI kodlar sahifasida
2. Kerakli IMEI kartasini toping
3. "💰 Sotish" tugmasini bosing
4. Ma'lumotlarni kiriting:
   - Sotish narxi (o'zgartirish mumkin)
   - Mijoz ismi (ixtiyoriy)
   - Izoh
5. Sotish
```

Sotilgandan keyin:
- ✅ Status "Sotilgan" ga o'zgaradi
- ✅ Mahsulot stock -1 ga kamayadi
- ✅ Sotilgan sana saqlanadi

### 4. IMEI Qidirish

```
1. Qidiruv maydoniga IMEI kiriting
2. Avtomatik qidiradi
3. Topilgan IMEI ko'rsatiladi
```

### 5. Filter

```
- Barchasi: Barcha IMEI lar
- Mavjud: Faqat sotilmagan
- Sotilgan: Faqat sotilganlar
- Band: Faqat band qilinganlar
```

## 🎨 Dizayn

### Ranglar:
- **Mavjud:** Yashil (#d1fae5)
- **Sotilgan:** Qizil (#fee2e2)
- **Band:** Sariq (#fef3c7)

### Gradient:
- Product Items: Yashil gradient (#10b981 → #047857)

## 📊 Statistika

### Mahsulot Kartasida:
```
iPhone 14 Pro Max 256GB
Stock: 7 dona
IMEI: 10 ta
```

### IMEI Sahifasida:
```
Jami donalar: 10
Mavjud: 7
Sotilgan: 2
Band: 1
```

## 🔒 Xavfsizlik

### IMEI Unique:
- ✅ Har bir IMEI faqat bir marta qo'shilishi mumkin
- ✅ Duplicate IMEI xato beradi

### Status Tracking:
- ✅ Sotilgan IMEI ni qayta sotib bo'lmaydi
- ✅ O'chirilgan IMEI qaytarilmaydi

### Validation:
- ✅ IMEI formatini tekshirish
- ✅ Narxlar 0 dan katta bo'lishi kerak
- ✅ ProductId mavjudligini tekshirish

## 🚀 Afzalliklar

### 1. To'liq Kuzatuv
- Har bir dona mahsulotni alohida kuzatish
- IMEI bo'yicha qidirish
- Sotilgan sanani bilish

### 2. Aniq Stock
- Real-time stock yangilanishi
- Har bir dona hisoblanadi
- Xato yo'q

### 3. Mijoz Ma'lumotlari
- Kimga sotilgan
- Qachon sotilgan
- Qancha narxda

### 4. Hisobotlar
- Qaysi IMEI sotilgan
- Qaysi IMEI mavjud
- Foyda hisoblash (har bir dona uchun)

## 📈 Kelajak Rejalar

### Phase 1 (Hozir):
- ✅ IMEI qo'shish
- ✅ IMEI sotish
- ✅ IMEI qidirish
- ✅ Status tracking

### Phase 2 (Keyingi):
- 🔄 IMEI import (Excel/CSV)
- 🔄 IMEI export
- 🔄 Barcode scanning
- 🔄 QR code generatsiya

### Phase 3 (Kelajak):
- 🔄 IMEI tarixi
- 🔄 Kafolat tracking
- 🔄 Ta'mirlash tarixi
- 🔄 Qaytarish tizimi

## 🎯 Misol Workflow

### Yangi Telefon Keldi (10 ta):

```
1. Ombor → "+" → Mahsulot qo'shish
   - Nomi: Samsung Galaxy S23
   - IMEI: 111111111111111
   - Kelgan: $600
   - Sotish: $750

2. Mahsulot → IMEI Kodlar → "+" (9 marta)
   - IMEI: 111111111111112
   - IMEI: 111111111111113
   - ...
   - IMEI: 111111111111120

3. Natija:
   - Mahsulot: Samsung Galaxy S23
   - Stock: 10 dona
   - IMEI: 10 ta
```

### Telefon Sotish:

```
1. IMEI Kodlar sahifasiga o'ting
2. Mavjud IMEI ni tanlang
3. "💰 Sotish" → Ma'lumot kiriting
4. Sotish

Natija:
- Stock: 9 dona
- IMEI status: Sotilgan
- Sotilgan sana: 2025-02-12
```

## 📞 Yordam

Savollar bo'lsa:
- 📧 Email: support@dokon.uz
- 📱 Telegram: @dokon_support

---

**Versiya:** 3.2  
**Sana:** 2025-02-12  
**Status:** ✅ Tayyor
