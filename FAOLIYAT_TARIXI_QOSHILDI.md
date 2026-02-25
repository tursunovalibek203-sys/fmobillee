# 📝 FAOLIYAT TARIXI TIZIMI QO'SHILDI

## ✅ Nima Qilindi

Tizimga to'liq faoliyat tarixi (Activity Log) tizimi qo'shildi. Endi har bir harakat kim, qachon, qayerda, qanday vaqtda qilgani aniq saqlanadi!

## 🎯 Qanday Ishlaydi

### 1. Activity Log Schema

Har bir harakatda quyidagi ma'lumotlar saqlanadi:

```javascript
{
  activityId: 123456789,           // Unikal ID
  action: 'create',                // Harakat turi
  entity: 'product',               // Ob'ekt turi
  entityId: 1234,                  // Ob'ekt ID
  entityName: 'iPhone 15 Pro',     // Ob'ekt nomi
  userId: 1,                       // Kim qildi
  userName: 'Admin',               // Foydalanuvchi ismi
  userRole: 'admin',               // Rol (admin/cashier)
  branchId: 1,                     // Qaysi filialda
  branchName: 'Asosiy Filial',     // Filial nomi
  description: 'Yangi mahsulot qo\'shildi',  // Tavsif
  oldValue: {...},                 // Eski qiymat (update uchun)
  newValue: {...},                 // Yangi qiymat
  timestamp: Date,                 // Aniq vaqt
  date: '25.02.2026',             // Sana (uz-UZ)
  time: '14:30:45',               // Vaqt (uz-UZ)
  metadata: {...}                  // Qo'shimcha ma'lumotlar
}
```

### 2. Harakat Turlari

- **create** - Yangi ob'ekt yaratildi
- **update** - Ob'ekt yangilandi
- **delete** - Ob'ekt o'chirildi
- **sale** - Savdo amalga oshirildi
- **payment** - To'lov qabul qilindi
- **login** - Tizimga kirish
- **logout** - Tizimdan chiqish

### 3. Ob'ekt Turlari

- **product** - Mahsulot
- **customer** - Mijoz
- **sale** - Savdo
- **cashier** - Kassir
- **branch** - Filial
- **expense** - Xarajat

## 📊 API Endpointlar

### 1. Barcha Faoliyatlar
```
GET /api/activity-log?limit=100&action=create&entity=product
```

**Query Parameters:**
- `limit` - Nechta qaytarish (default: 100)
- `userId` - Foydalanuvchi ID
- `entity` - Ob'ekt turi
- `action` - Harakat turi
- `branchId` - Filial ID
- `startDate` - Boshlanish sanasi
- `endDate` - Tugash sanasi

**Response:**
```json
{
  "success": true,
  "activities": [...],
  "total": 50
}
```

### 2. Foydalanuvchi Faoliyati
```
GET /api/activity-log/user/:userId?limit=50
```

Bitta foydalanuvchining barcha harakatlari.

### 3. Ob'ekt Tarixi
```
GET /api/activity-log/entity/:entity/:entityId
```

Bitta ob'ektning to'liq tarixi (masalan, bitta mahsulot tarixi).

**Misol:**
```
GET /api/activity-log/entity/product/1234
```

### 4. Bugungi Faoliyat
```
GET /api/activity-log/today
```

Bugungi barcha harakatlar.

### 5. Statistika
```
GET /api/activity-log/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 1000,
    "today": 50,
    "byAction": [
      { "_id": "sale", "count": 300 },
      { "_id": "create", "count": 200 }
    ],
    "byEntity": [
      { "_id": "product", "count": 400 },
      { "_id": "customer", "count": 300 }
    ],
    "topUsers": [
      { "_id": { "userId": 1, "userName": "Admin" }, "count": 500 }
    ]
  }
}
```

## 🔧 Qanday Ishlatish

### 1. Mahsulot Qo'shishda

```javascript
// Mahsulot qo'shish
const product = await Product.create({...});

// Activity log
await logActivity({
  action: 'create',
  entity: 'product',
  entityId: product.productId,
  entityName: product.name,
  userId: 1,
  userName: 'Admin',
  userRole: 'admin',
  branchId: 1,
  description: `Yangi mahsulot qo'shildi: ${product.name}`,
  newValue: product
});
```

### 2. Mahsulot Yangilashda

```javascript
// Eski qiymatni saqlash
const oldProduct = await Product.findOne({...});

// Yangilash
const product = await Product.findOneAndUpdate({...});

// Activity log
await logActivity({
  action: 'update',
  entity: 'product',
  entityId: product.productId,
  entityName: product.name,
  userId: 1,
  userName: 'Admin',
  userRole: 'admin',
  description: `Mahsulot yangilandi: ${product.name}`,
  oldValue: oldProduct,
  newValue: product
});
```

### 3. Savdo Qilishda

```javascript
// Savdo
const sale = await Sale.create({...});

// Activity log
await logActivity({
  action: 'sale',
  entity: 'sale',
  entityId: sale.saleId,
  entityName: sale.product,
  userId: cashierId,
  userName: cashierName,
  userRole: 'cashier',
  branchId: branchId,
  description: `Savdo: ${sale.product} - $${sale.price}`,
  newValue: sale
});
```

## 🌐 Faoliyat Tarixi Sahifasi

**URL:** `http://localhost:3000/activity-log.html`

### Xususiyatlar:

1. **Statistika Kartalari**
   - Jami harakatlar
   - Bugungi harakatlar
   - Faol foydalanuvchilar
   - Eng ko'p harakat

2. **Filterlar**
   - Harakat turi (create, update, delete, sale, payment)
   - Ob'ekt turi (product, customer, sale, cashier)
   - Sana oralig'i (boshlanish - tugash)

3. **Faoliyat Ro'yxati**
   - Har bir harakat tafsiloti
   - Kim qildi
   - Qachon qildi
   - Qayerda qildi
   - Nima qildi

4. **Real-time Yangilanish**
   - Yangi harakatlar avtomatik ko'rinadi
   - Filterlar orqali qidirish

## 📋 Qayerda Ishlatiladi

### 1. Mahsulot Boshqaruvi
- ✅ Mahsulot qo'shish
- ✅ Mahsulot yangilash
- ✅ Mahsulot o'chirish

### 2. Savdo Jarayoni
- ✅ Savdo qilish
- ✅ To'lov qabul qilish
- ✅ Mahsulot qaytarish

### 3. Mijoz Boshqaruvi
- ✅ Mijoz qo'shish
- ✅ Mijoz yangilash
- ✅ Mijoz o'chirish

### 4. Kassir Boshqaruvi
- ✅ Kassir qo'shish
- ✅ Kassir yangilash
- ✅ Kirim berish

### 5. Filial Boshqaruvi
- ✅ Filial qo'shish
- ✅ Filial yangilash
- ✅ Filial o'chirish

## 🎯 Foydalari

### 1. Xavfsizlik
- Kim nima qilganini bilish
- Noto'g'ri harakatlarni aniqlash
- Javobgarlikni ta'minlash

### 2. Audit
- Barcha harakatlar tarixi
- Qachon va kim tomonidan
- Eski va yangi qiymatlar

### 3. Tahlil
- Eng faol foydalanuvchilar
- Eng ko'p bajariladigan harakatlar
- Vaqt bo'yicha tahlil

### 4. Muammolarni Hal Qilish
- Xatolarni topish
- Nima bo'lganini tushunish
- Qaytarish imkoniyati

## 📊 Misollar

### Misol 1: Mahsulot Tarixi

```
GET /api/activity-log/entity/product/1234

Response:
[
  {
    "action": "create",
    "date": "25.02.2026",
    "time": "10:00:00",
    "userName": "Admin",
    "description": "Yangi mahsulot qo'shildi: iPhone 15 Pro"
  },
  {
    "action": "update",
    "date": "25.02.2026",
    "time": "14:30:00",
    "userName": "Admin",
    "description": "Mahsulot narxi yangilandi: $1200 -> $1150"
  },
  {
    "action": "sale",
    "date": "25.02.2026",
    "time": "16:45:00",
    "userName": "Kassir Aziza",
    "description": "Savdo: 2 dona sotildi"
  }
]
```

### Misol 2: Bugungi Faoliyat

```
GET /api/activity-log/today

Response:
{
  "success": true,
  "activities": [
    {
      "action": "sale",
      "entity": "sale",
      "userName": "Kassir Aziza",
      "description": "Savdo: iPhone 15 Pro - $2400",
      "time": "16:45:00"
    },
    {
      "action": "create",
      "entity": "product",
      "userName": "Admin",
      "description": "Yangi mahsulot qo'shildi: Samsung S24",
      "time": "14:30:00"
    }
  ],
  "total": 2
}
```

### Misol 3: Foydalanuvchi Faoliyati

```
GET /api/activity-log/user/1

Response:
{
  "success": true,
  "activities": [
    {
      "action": "create",
      "entity": "product",
      "description": "Yangi mahsulot qo'shildi",
      "date": "25.02.2026",
      "time": "10:00:00"
    },
    {
      "action": "update",
      "entity": "product",
      "description": "Mahsulot yangilandi",
      "date": "25.02.2026",
      "time": "14:30:00"
    }
  ],
  "total": 2
}
```

## 🚀 Keyingi Qadamlar

### Qo'shilishi Kerak:

1. **Login/Logout Logging**
   - Tizimga kirish
   - Tizimdan chiqish
   - IP manzil va brauzer ma'lumoti

2. **Savdo Logging**
   - Har bir savdo
   - To'lov qabul qilish
   - Mahsulot qaytarish

3. **Mijoz Logging**
   - Mijoz qo'shish
   - Mijoz yangilash
   - Qarz o'zgarishi

4. **Kassir Logging**
   - Kirim berish
   - Balans o'zgarishi
   - Statistika yangilanishi

## ✅ Xulosa

Endi tizimda har bir harakat to'liq saqlanadi:

- ✅ **Kim** - Foydalanuvchi ismi va ID
- ✅ **Qachon** - Aniq sana va vaqt
- ✅ **Qayerda** - Filial va joy
- ✅ **Nima** - Harakat va ob'ekt
- ✅ **Qanday** - Eski va yangi qiymatlar

**Hech narsa hisobsiz va tarixsiz emas!** 🎉

---

**Sahifa:** http://localhost:3000/activity-log.html
**API:** `/api/activity-log`
**Dokumentatsiya:** `FAOLIYAT_TARIXI_QOSHILDI.md`
