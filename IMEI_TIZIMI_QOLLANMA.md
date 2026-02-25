# 📱 IMEI Tizimi - To'liq Qo'llanma

## 📋 Umumiy Ma'lumot

IMEI tizimi orqali har bir mahsulot nusxasini alohida kuzatish mumkin. Masalan, 10 ta telefon bo'lsa, har birining o'z IMEI kodi bo'ladi.

## 🎯 Asosiy Xususiyatlar

### 1. IMEI Boshqaruvi
- ✅ Har bir mahsulot nusxasi uchun alohida IMEI
- ✅ IMEI orqali qidirish
- ✅ Mahsulot holati (mavjud, sotilgan, shikastlangan)
- ✅ Kafolat muddati
- ✅ Serial number

### 2. Filial Tanlash
- ✅ Ombor kirish sahifasida filial tanlash
- ✅ Har bir filialning statistikasi
- ✅ Filial bo'yicha mahsulotlar
- ✅ Filial bo'yicha IMEI kodlar

## 🚀 Qanday Ishlaydi?

### Misol: 7 ta telefon qo'shish

1. **Mahsulot yaratish**
   - Mahsulot nomi: iPhone 14 Pro
   - Narx: $1000
   - Kategoriya: Telefonlar

2. **IMEI kodlar qo'shish** (7 marta)
   - IMEI 1: 123456789012345
   - IMEI 2: 123456789012346
   - IMEI 3: 123456789012347
   - ... va hokazo

3. **Natija**
   - Mahsulot: iPhone 14 Pro (Stock: 7)
   - 7 ta alohida IMEI kodi
   - Har biri sotilishi mumkin

## 📊 Database Struktura

### ProductItem (IMEI) Schema

```javascript
{
  itemId: 1001,
  productId: 2001,
  branchId: 1001,
  productName: "iPhone 14 Pro",
  imei: "123456789012345",
  serialNumber: "SN123456",
  status: "available", // available, sold, reserved, damaged, returned
  buyPrice: 900,
  sellPrice: 1000,
  soldDate: null,
  soldTo: null,
  soldBy: null,
  warranty: "12 oy",
  condition: "new", // new, used, refurbished
  notes: "Qora rang, 256GB"
}
```

## 🔄 Ish Jarayoni

### 1. Mahsulot Qo'shish

```
Admin → Ombor → Mahsulot qo'shish
↓
Mahsulot yaratildi (Stock: 0)
↓
IMEI qo'shish (har safar Stock +1)
```

### 2. IMEI Qo'shish

```
Mahsulot tanlash
↓
IMEI kiriting: 123456789012345
↓
Qo'shimcha ma'lumotlar:
- Serial Number
- Kafolat
- Holat (yangi/ishlatilgan)
- Izoh
↓
Saqlash (Stock avtomatik +1)
```

### 3. Sotish

```
Kassir → Mahsulot tanlash
↓
IMEI skanerlash yoki kiriting
↓
Mijoz tanlash
↓
Sotish
↓
IMEI status: sold
Stock avtomatik -1
```

## 📱 API Endpointlar

### IMEI Qo'shish
```javascript
POST /api/warehouse/product-items
Body: {
  productId: 2001,
  branchId: 1001,
  imei: "123456789012345",
  serialNumber: "SN123456",
  buyPrice: 900,
  sellPrice: 1000,
  warranty: "12 oy",
  condition: "new",
  notes: "Qora rang"
}
```

### Mahsulot IMEI larini Olish
```javascript
GET /api/warehouse/product-items/:productId
Query: ?status=available
```

### IMEI Qidirish
```javascript
GET /api/warehouse/search-imei/:imei
```

### IMEI Sotish
```javascript
POST /api/warehouse/sell-item
Body: {
  imei: "123456789012345",
  soldTo: "Alisher",
  soldBy: "Kassir1",
  saleId: 5001
}
```

### Filial IMEI lari
```javascript
GET /api/warehouse/branch-items/:branchId
Query: ?status=available
```

## 🎨 Sahifalar

### 1. Filial Tanlash
- URL: `/warehouse-select.html`
- Barcha filiallar ro'yxati
- Har bir filial statistikasi
- Filial tanlash

### 2. Ombor (Filial bo'yicha)
- URL: `/warehouse.html?branchId=1001`
- Faqat tanlangan filial mahsulotlari
- IMEI qo'shish/ko'rish
- Mahsulot boshqaruvi

### 3. Kassir (Sotish)
- URL: `/cashier.html`
- Faqat o'z filiali mahsulotlari
- IMEI skanerlash
- Sotish

## 🔐 Ruxsatlar

### Admin
- ✅ Barcha filiallarni ko'rish
- ✅ IMEI qo'shish/o'chirish
- ✅ Mahsulot boshqaruvi
- ✅ Hisobotlar

### Kassir
- ✅ Faqat o'z filiali mahsulotlari
- ✅ IMEI qidirish
- ✅ Sotish
- ❌ IMEI qo'shish/o'chirish

## 💡 Foydali Maslahatlar

### 1. IMEI Formati
- 15 raqamli kod
- Masalan: 123456789012345
- Har bir IMEI unique bo'lishi kerak

### 2. Stock Boshqaruvi
- IMEI qo'shilganda: Stock +1
- IMEI sotilganda: Stock -1
- IMEI o'chirilganda: Stock -1 (agar available bo'lsa)

### 3. Status Turlari
- `available` - Sotishga tayyor
- `sold` - Sotilgan
- `reserved` - Band qilingan
- `damaged` - Shikastlangan
- `returned` - Qaytarilgan

### 4. Condition Turlari
- `new` - Yangi
- `used` - Ishlatilgan
- `refurbished` - Ta'mirlangan

## 🆘 Muammolarni Hal Qilish

### IMEI qo'shilmayapti
1. IMEI unique ekanligini tekshiring
2. Mahsulot mavjudligini tekshiring
3. Filial to'g'ri tanlanganini tekshiring

### Stock noto'g'ri
1. IMEI larni sanang
2. Available status dagi IMEI lar = Stock
3. Agar farq bo'lsa, IMEI larni qayta tekshiring

### Kassir sotolmayapti
1. Kassir to'g'ri filialga biriktirilganini tekshiring
2. IMEI available status da ekanligini tekshiring
3. Mahsulot o'sha filialda ekanligini tekshiring

## 📞 Qo'shimcha

### Migration
Eski mahsulotlarga IMEI qo'shish uchun:
```bash
node migrate-add-imei.js
```

### Test
IMEI tizimini test qilish:
```bash
node test-imei-system.js
```

---

**Eslatma:** IMEI tizimi telefon, planshet va boshqa elektronika uchun juda foydali. Har bir mahsulotni alohida kuzatish imkonini beradi.
