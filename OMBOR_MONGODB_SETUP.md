# 🗄️ OMBOR MONGODB SOZLASH

## ✅ MONGODB ULANISHI QO'SHILDI

Ombor uchun alohida MongoDB database sozlandi:

### 📍 Ulanish Ma'lumotlari

**URI:**
```
mongodb+srv://munavvarqoriburonova_db_user:hLNNNrPN9rHuVlM7@cluster0.ddevzng.mongodb.net/warehouse_db
```

**Database nomi:** `warehouse_db`

**Collections:**
- `categories` - Mahsulot kategoriyalari
- `products` - Mahsulotlar
- `suppliers` - Yetkazib beruvchilar
- `stockmovements` - Ombor harakatlari (kirim-chiqim)
- `inventorychecks` - Inventarizatsiya
- `warehousesettings` - Ombor sozlamalari

## 🚀 SOZLASH

### 1. .env Faylida

`.env` fayliga qo'shildi:

```env
# Asosiy database (mijozlar, savdolar, kassirlar)
MONGODB_URI=mongodb+srv://tilavovazizbek37_db_user:JAew6wsMp8cfffzd@cluster0.1t3sy1v.mongodb.net/dokon_db

# Ombor database (alohida)
WAREHOUSE_MONGODB_URI=mongodb+srv://munavvarqoriburonova_db_user:hLNNNrPN9rHuVlM7@cluster0.ddevzng.mongodb.net/warehouse_db
```

### 2. Ulanishni Test Qilish

```bash
npm run test-warehouse-connection
```

**Kutilgan natija:**
```
✅ Ombor MongoDB muvaffaqiyatli ulandi!
📊 Database: warehouse_db
🌐 Host: cluster0.ddevzng.mongodb.net
```

### 3. Test Mahsulotlar Qo'shish

```bash
npm run test-warehouse-products
```

**Natija:**
- 10 ta test mahsulot qo'shiladi
- Kategoriyalar avtomatik yaratiladi
- Ombor sozlamalari yaratiladi

## 📊 DATABASE TUZILISHI

### 1. Categories (Kategoriyalar)

```javascript
{
  categoryId: 1001,
  name: "Telefonlar",
  description: "Smartfonlar va mobil telefonlar",
  icon: "📱",
  color: "#3b82f6",
  isActive: true
}
```

### 2. Products (Mahsulotlar)

```javascript
{
  productId: 1001,
  name: "iPhone 14 Pro Max 256GB",
  categoryName: "Telefonlar",
  buyPrice: 10000000,
  sellPrice: 12000000,
  stock: 5,
  minStock: 2,
  unit: "dona",
  barcode: "123456789012",
  description: "Yangi, kafolat bilan",
  isActive: true
}
```

### 3. StockMovements (Ombor Harakatlari)

```javascript
{
  movementId: 1001,
  productId: 1001,
  productName: "iPhone 14 Pro Max",
  type: "in", // yoki "out"
  quantity: 10,
  price: 10000000,
  stockBefore: 5,
  stockAfter: 15,
  date: "08.02.2026",
  time: "14:30",
  userId: "admin",
  userName: "Admin"
}
```

## 🔧 TEXNIK TAFSILOTLAR

### Ulanish Konfiguratsiyasi

```javascript
const warehouseConnection = mongoose.createConnection(
  process.env.WAREHOUSE_MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'warehouse_db'
  }
);
```

### Xususiyatlar

1. **Alohida ulanish** - Asosiy database bilan aralashmaslik uchun
2. **Avtomatik reconnect** - Ulanish uzilsa avtomatik qayta ulanadi
3. **Error handling** - Xatolarni to'g'ri boshqarish
4. **Connection pooling** - Samaradorlik uchun

## ⚠️ MUHIM ESLATMALAR

### 1. Xavfsizlik

- ✅ Parol `.env` faylida saqlanadi
- ✅ `.env` fayli `.gitignore` da
- ✅ Production da environment variables ishlatiladi

### 2. Backup

```bash
# MongoDB backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/warehouse_db" --out=./backup
```

### 3. Monitoring

MongoDB Atlas dashboard da:
- Ulanishlar soni
- Query performance
- Storage hajmi
- Network traffic

## 🎯 FOYDALANISH

### Serverni Ishga Tushirish

```bash
npm start
```

**Konsolda ko'rinadi:**
```
✅ MongoDB ulandi
✅ Ombor MongoDB ulandi
🏭 Ombor ma'lumotlar bazasi ishga tushirilmoqda...
✅ Ombor sozlamalari yaratildi
✅ Default kategoriyalar yaratildi
✅ Ombor ma'lumotlar bazasi tayyor!
```

### Ombor Sahifasini Ochish

```
http://localhost:3000/warehouse.html
```

### Test Mahsulotlar

```bash
npm run test-warehouse-products
```

**Qo'shiladigan mahsulotlar:**
1. iPhone 14 Pro Max 256GB
2. Samsung Galaxy S23 Ultra
3. MacBook Pro M2 14"
4. AirPods Pro 2
5. Apple Watch Series 8
6. iPad Air M1
7. Sony WH-1000XM5
8. Samsung 55" QLED TV
9. Xiaomi Mi Band 7
10. Logitech MX Master 3

## 📈 STATISTIKA

### Ombor Dashboard

- 📦 Jami mahsulotlar
- ✅ Omborda bor
- ⚠️ Kam qolgan
- 💰 Ombor qiymati

### Hisobotlar

- Kirim-chiqim tarixi
- Mahsulot harakati
- Inventarizatsiya
- Foyda hisoblash

## 🔍 QIDIRUV

### IMEI/Barcode orqali

```javascript
// API endpoint
GET /api/warehouse/search?q=123456789012

// Natija
{
  success: true,
  products: [
    {
      productId: 1001,
      name: "iPhone 14 Pro Max",
      barcode: "123456789012",
      sellPrice: 12000000,
      stock: 5
    }
  ]
}
```

## 🛠️ XATOLIKLARNI BARTARAF QILISH

### "Ombor MongoDB ulanmadi"

**Sabab:** URI noto'g'ri yoki internet yo'q

**Yechim:**
1. `.env` faylida `WAREHOUSE_MONGODB_URI` ni tekshiring
2. Internet aloqasini tekshiring
3. MongoDB Atlas da IP whitelist ni tekshiring

### "Database yaratilmadi"

**Sabab:** Ruxsat yo'q

**Yechim:**
1. MongoDB Atlas da user ruxsatlarini tekshiring
2. Database yaratish ruxsati bor ekanligini tekshiring

### "Collections bo'sh"

**Sabab:** Test mahsulotlar qo'shilmagan

**Yechim:**
```bash
npm run test-warehouse-products
```

## 📞 YORDAM

Muammo bo'lsa:
1. `npm run test-warehouse-connection` - Ulanishni test qiling
2. MongoDB Atlas dashboard ni tekshiring
3. Server loglarini ko'ring

---

## ✅ TAYYOR!

Ombor MongoDB database to'liq sozlandi va ishlashga tayyor!

**Muvaffaqiyatlar! 🎉**
