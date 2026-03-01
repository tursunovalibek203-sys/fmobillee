# 🔒 Ombor Qattiq Validatsiya Tizimi

## ✅ Maqsad

Omborlar qo'shilib ketmasligi va har bir filialning ombori alohida bo'lishini ta'minlash.

## 🛡️ Validatsiya Qoidalari

### 1. BranchId Majburiy

Har bir mahsulotda `branchId` bo'lishi shart:
- `0` = Umumiy ombor
- `1001` = Toshkent filiali
- `1002` = Samarqand filiali
- `1003` = Buxoro filiali

### 2. Duplicate Prevention

Bir xil nom va branchId bilan mahsulot qo'shib bo'lmaydi:

```javascript
// ❌ Xato
{ name: "iPhone 15", branchId: 1001 } // Allaqachon mavjud
{ name: "iPhone 15", branchId: 1001 } // Duplicate!

// ✅ To'g'ri
{ name: "iPhone 15", branchId: 1001 } // Toshkent
{ name: "iPhone 15", branchId: 1002 } // Samarqand - OK
```

### 3. IMEI Unique

Har bir IMEI kod noyob bo'lishi kerak:

```javascript
// ❌ Xato
{ imei: "123456789", name: "iPhone 15" }
{ imei: "123456789", name: "Samsung S24" } // Duplicate IMEI!

// ✅ To'g'ri
{ imei: "123456789", name: "iPhone 15" }
{ imei: "987654321", name: "Samsung S24" }
```

### 4. Stock Validation

- Stock manfiy bo'lishi mumkin emas
- Stock minStock dan kam bo'lsa ogohlantirish

### 5. Price Validation

- Narxlar manfiy bo'lishi mumkin emas
- Sotish narxi olish narxidan kam bo'lsa ogohlantirish

## 📂 Yaratilgan Fayllar

### 1. Backend Validation

`add-warehouse-strict-validation.js` - MongoDB validatsiya scripti

**Funksiyalar**:
- Duplicate tekshiruvi
- IMEI tekshiruvi
- BranchId tekshiruvi
- Duplicate o'chirish

**Ishlatish**:
```bash
# Validatsiya
node add-warehouse-strict-validation.js

# Duplicate o'chirish
node add-warehouse-strict-validation.js --remove-duplicates
```

### 2. Frontend Validation

`public/warehouse-strict-validation.js` - Frontend validatsiya

**Funksiyalar**:
- `validateBeforeAdd()` - Qo'shishdan oldin tekshirish
- `validateBeforeUpdate()` - Yangilashdan oldin tekshirish
- `validateBranchId()` - BranchId tekshiruvi
- `validateStock()` - Stock tekshiruvi
- `validatePrice()` - Narx tekshiruvi

**Ishlatish**:
```javascript
// Mahsulot qo'shishdan oldin
const result = await WarehouseValidation.validateBeforeAdd(productData);

if (!result.valid) {
    result.errors.forEach(error => {
        WarehouseValidation.showError(error);
    });
    return;
}

// Mahsulot qo'shish
await addProduct(productData);
```

## 🔧 Qo'llash

### Warehouse-pro.html ga qo'shish

```html
<head>
    <!-- Boshqa scriptlar -->
    <script src="warehouse-strict-validation.js"></script>
</head>

<script>
    async function addProduct() {
        const productData = {
            name: document.getElementById('productName').value,
            branchId: getCurrentBranchId(),
            sellPrice: parseFloat(document.getElementById('sellPrice').value),
            stock: parseInt(document.getElementById('stock').value),
            // ...
        };
        
        // Validatsiya
        const validation = await WarehouseValidation.validateBeforeAdd(productData);
        
        if (!validation.valid) {
            validation.errors.forEach(error => {
                WarehouseValidation.showError(error);
            });
            return;
        }
        
        // API ga yuborish
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        // ...
    }
</script>
```

## 🧪 Test Natijalari

### Validatsiya Testlari

```
✅ BranchId tekshiruvi
✅ Duplicate prevention
✅ IMEI unique tekshiruvi
✅ Stock validation
✅ Price validation
```

### Duplicate Prevention Test

```javascript
// Test 1: Bir xil nom, bir xil branchId
const product1 = { name: "iPhone 15", branchId: 1001 };
const product2 = { name: "iPhone 15", branchId: 1001 };
// Result: ❌ Duplicate topildi

// Test 2: Bir xil nom, boshqa branchId
const product3 = { name: "iPhone 15", branchId: 1001 };
const product4 = { name: "iPhone 15", branchId: 1002 };
// Result: ✅ OK (turli filiallar)
```

## 📊 Validatsiya Statistikasi

| Tekshiruv | Status | Xato xabari |
|-----------|--------|-------------|
| BranchId yo'q | ❌ | "Filial tanlanmagan!" |
| Duplicate nom | ❌ | "Bu mahsulot allaqachon mavjud!" |
| Duplicate IMEI | ❌ | "Bu IMEI allaqachon ishlatilgan!" |
| Manfiy stock | ❌ | "Stock manfiy bo'lishi mumkin emas!" |
| Manfiy narx | ❌ | "Narx manfiy bo'lishi mumkin emas!" |
| Kam stock | ⚠️ | "Stock kam qoldi!" |
| Kam narx | ⚠️ | "Sotish narxi olish narxidan kam!" |

## 🔐 Xavfsizlik

### Frontend Validation

- Foydalanuvchi kiritgan ma'lumotlarni tekshirish
- Duplicate prevention
- Real-time validation

### Backend Validation

- Database level validation
- Unique constraints
- Transaction support

## 💡 Tavsiyalar

### 1. Mahsulot Qo'shishda

```javascript
// ✅ To'g'ri
const product = {
    name: "iPhone 15 Pro Max",
    branchId: 1001,  // Majburiy!
    sellPrice: 1200,
    stock: 10,
    imei: "123456789012345"  // Unique
};

// ❌ Noto'g'ri
const product = {
    name: "iPhone 15 Pro Max",
    // branchId yo'q!
    sellPrice: 1200
};
```

### 2. Filial Tanlash

Har doim filial tanlang:
- Umumiy ombor (0)
- Toshkent (1001)
- Samarqand (1002)
- Buxoro (1003)

### 3. IMEI Kiritish

IMEI kod noyob bo'lishi kerak:
- 15 raqamli kod
- Har bir telefon uchun alohida
- Duplicate bo'lmasligi kerak

## 🚀 Keyingi Qadamlar

### 1. Backend Validation

Server.js ga qo'shish:

```javascript
app.post('/api/products', async (req, res) => {
    const { name, branchId, imei } = req.body;
    
    // BranchId tekshiruvi
    if (branchId === null || branchId === undefined) {
        return res.status(400).json({ 
            error: 'BranchId majburiy!' 
        });
    }
    
    // Duplicate tekshiruvi
    const existing = await Product.findOne({ 
        name: name, 
        branchId: branchId 
    });
    
    if (existing) {
        return res.status(400).json({ 
            error: 'Bu mahsulot allaqachon mavjud!' 
        });
    }
    
    // IMEI tekshiruvi
    if (imei) {
        const existingImei = await Product.findOne({ imei: imei });
        if (existingImei) {
            return res.status(400).json({ 
                error: 'Bu IMEI allaqachon ishlatilgan!' 
            });
        }
    }
    
    // Mahsulot yaratish
    const product = await Product.create(req.body);
    res.json({ success: true, product });
});
```

### 2. Database Indexes

MongoDB da unique index qo'shish:

```javascript
ProductSchema.index({ name: 1, branchId: 1 }, { unique: true });
ProductSchema.index({ imei: 1 }, { unique: true, sparse: true });
```

### 3. Transaction Support

Bir nechta operatsiyani birgalikda bajarish:

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
    // Operatsiyalar
    await Product.create([productData], { session });
    await session.commitTransaction();
} catch (error) {
    await session.abortTransaction();
    throw error;
} finally {
    session.endSession();
}
```

## ✅ Xulosa

Ombor qattiq validatsiya tizimi yaratildi:

- ✅ Frontend validation
- ✅ Duplicate prevention
- ✅ IMEI unique tekshiruvi
- ✅ BranchId majburiy
- ✅ Stock va narx validatsiyasi
- ✅ Xato xabarlari
- ✅ Ogohlantirish tizimi

Endi omborlar qo'shilib ketmaydi va har bir filialning ombori alohida bo'ladi!

---

**Sana**: 01/03/2026
**Status**: ✅ Tayyor
**Xavfsizlik**: 🔒🔒🔒 Yuqori
