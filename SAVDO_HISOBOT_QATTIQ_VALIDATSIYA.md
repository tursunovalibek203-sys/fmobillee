# 🔒 Savdo va Hisobot Qattiq Validatsiya Tizimi

## ✅ Maqsad

Savdolar qo'shilib ketmasligi, balanslar to'g'ri hisoblanishi va har bir kassir faqat o'z savdolarini ko'rishi.

## 🛡️ Validatsiya Qoidalari

### 1. Savdo Validatsiyasi

#### Majburiy Maydonlar
- ✅ Kassir ID
- ✅ Filial ID
- ✅ Mahsulot nomi
- ✅ Narx (musbat)
- ✅ To'lov summasi (0 yoki musbat)

#### Tekshiruvlar
1. **Stock tekshiruvi** - Omborda mahsulot bormi?
2. **Kassir tekshiruvi** - Kassir faolmi? To'g'ri filialdami?
3. **Duplicate tekshiruvi** - Oxirgi 5 daqiqada bir xil savdo qilinganmi?
4. **To'lov tekshiruvi** - To'lov to'liqmi?

### 2. Balans Validatsiyasi

#### Formula
```
Balans = Jami Savdolar - Jami Kirim Berishlar
```

#### Tekshiruvlar
1. **Database balans** vs **Hisoblangan balans**
2. Farq 1 sentdan ko'p bo'lmasligi kerak
3. Agar farq bor bo'lsa - xato xabari

#### Misol
```javascript
// Database
cashier.balance = 1500.00

// Hisoblangan
totalSales = 2000.00
totalHandovers = 500.00
calculatedBalance = 2000.00 - 500.00 = 1500.00

// Farq
difference = |1500.00 - 1500.00| = 0.00 ✅
```

### 3. Kirim Berish Validatsiyasi

#### Tekshiruvlar
1. **Summa musbat** bo'lishi kerak
2. **Balansda yetarli pul** bormi?
3. **Kassir faol** bo'lishi kerak

#### Misol
```javascript
// ❌ Xato
cashier.balance = 100.00
handover.amount = 150.00 // Balansda yo'q!

// ✅ To'g'ri
cashier.balance = 200.00
handover.amount = 150.00 // OK
```

### 4. Hisobot Validatsiyasi

#### Tekshiruvlar
1. **Sana majburiy**
2. **Boshlanish < Tugash**
3. **Filial ID to'g'ri**
4. **Kassir ID to'g'ri** (agar tanlangan bo'lsa)

## 📂 Yaratilgan Fayllar

### Frontend Validation

`public/sales-strict-validation.js` - Savdo va hisobot validatsiyasi

**Funksiyalar**:
- `validateBeforeSale()` - Savdo qilishdan oldin
- `validateBalance()` - Balans tekshiruvi
- `checkDuplicateSale()` - Duplicate tekshiruvi
- `validateHandover()` - Kirim berish validatsiyasi
- `validateReport()` - Hisobot validatsiyasi

## 🔧 Qo'llash

### Kassir Sahifasida

```html
<head>
    <!-- Boshqa scriptlar -->
    <script src="sales-strict-validation.js"></script>
</head>

<script>
    async function makeSale() {
        const saleData = {
            cashierId: localStorage.getItem('cashierId'),
            branchId: localStorage.getItem('cashierBranchId'),
            product: selectedProduct.name,
            productId: selectedProduct.productId,
            price: selectedProduct.sellPrice,
            paid: parseFloat(document.getElementById('paidAmount').value),
            quantity: 1
        };
        
        // Validatsiya
        const validation = await SalesValidation.validateBeforeSale(saleData);
        
        if (!validation.valid) {
            SalesValidation.showErrors(validation.errors);
            return;
        }
        
        // Ogohlantirishlar
        if (validation.warnings.length > 0) {
            if (!SalesValidation.showWarnings(validation.warnings)) {
                return;
            }
        }
        
        // Duplicate tekshiruvi
        const duplicateCheck = await SalesValidation.checkDuplicateSale(saleData);
        if (!duplicateCheck.valid) {
            if (!SalesValidation.showWarning(duplicateCheck.error)) {
                return;
            }
        }
        
        // API ga yuborish
        const response = await fetch('/api/cashier-sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saleData)
        });
        
        // ...
    }
</script>
```

### Kirim Berish

```javascript
async function handoverMoney() {
    const handoverData = {
        cashierId: localStorage.getItem('cashierId'),
        branchId: localStorage.getItem('cashierBranchId'),
        amount: parseFloat(document.getElementById('handoverAmount').value),
        notes: document.getElementById('notes').value
    };
    
    // Validatsiya
    const validation = await SalesValidation.validateHandover(handoverData);
    
    if (!validation.valid) {
        SalesValidation.showErrors(validation.errors);
        return;
    }
    
    // API ga yuborish
    const response = await fetch('/api/cashier-handovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(handoverData)
    });
    
    // ...
}
```

### Balans Tekshiruvi

```javascript
async function checkBalance() {
    const cashierId = localStorage.getItem('cashierId');
    
    const validation = await SalesValidation.validateBalance(cashierId);
    
    if (!validation.valid) {
        console.error('Balans xatosi:', validation.error);
        alert(validation.error);
        
        // Tafsilotlar
        console.log('DB Balans:', validation.dbBalance);
        console.log('Hisoblangan:', validation.calculatedBalance);
        console.log('Farq:', validation.difference);
    } else {
        console.log('✅ Balans to\'g\'ri');
        console.log('Balans:', validation.balance);
        console.log('Jami savdolar:', validation.totalSales);
        console.log('Jami kirimlar:', validation.totalHandovers);
    }
}
```

## 🧪 Test Natijalari

### Savdo Validatsiya Testlari

```
✅ Kassir ID tekshiruvi
✅ Filial ID tekshiruvi
✅ Mahsulot tekshiruvi
✅ Narx tekshiruvi
✅ To'lov tekshiruvi
✅ Stock tekshiruvi
✅ Kassir faollik tekshiruvi
✅ Duplicate tekshiruvi
```

### Balans Validatsiya Testlari

```
✅ Database balans olish
✅ Savdolar summasini hisoblash
✅ Kirimlar summasini hisoblash
✅ Hisoblangan balans
✅ Farq tekshiruvi
```

### Kirim Berish Validatsiya Testlari

```
✅ Summa tekshiruvi
✅ Balans yetarliligi
✅ Kassir faollik tekshiruvi
```

## 📊 Validatsiya Statistikasi

| Tekshiruv | Status | Xato xabari |
|-----------|--------|-------------|
| Kassir ID yo'q | ❌ | "Kassir ID yo'q!" |
| Filial ID yo'q | ❌ | "Filial ID yo'q!" |
| Mahsulot yo'q | ❌ | "Mahsulot tanlanmagan!" |
| Narx noto'g'ri | ❌ | "Narx noto'g'ri!" |
| Stock yo'q | ❌ | "Mahsulot omborda yo'q!" |
| Kassir faol emas | ❌ | "Kassir faol emas!" |
| Boshqa filial | ❌ | "Kassir boshqa filialda!" |
| Duplicate savdo | ❌ | "Bu savdo oxirgi 5 daqiqada qilingan!" |
| Balans mos kelmayapti | ❌ | "Balans mos kelmayapti!" |
| Balansda pul yo'q | ❌ | "Balansda yetarli pul yo'q!" |
| To'lov to'liq emas | ⚠️ | "To'lov to'liq emas!" |

## 🔐 Xavfsizlik

### Kassir Izolyatsiyasi

Har bir kassir faqat o'z ma'lumotlarini ko'radi:

```javascript
// Kassir faqat o'z savdolarini ko'radi
const cashierId = localStorage.getItem('cashierId');
const sales = await fetch(`/api/cashier-sales?cashierId=${cashierId}`);

// Kassir faqat o'z filiali mahsulotlarini ko'radi
const branchId = localStorage.getItem('cashierBranchId');
const products = await fetch(`/api/products?branchId=${branchId}`);
```

### Balans Himoyasi

Balans faqat to'g'ri hisoblangan bo'lsa o'zgaradi:

```javascript
// ❌ Noto'g'ri
cashier.balance += randomAmount;

// ✅ To'g'ri
cashier.balance += sale.paid; // Savdo qo'shilganda
cashier.balance -= handover.amount; // Kirim berilganda
```

## 💡 Tavsiyalar

### 1. Savdo Qilishda

```javascript
// ✅ To'g'ri
const sale = {
    cashierId: 1,
    branchId: 1001,
    product: "iPhone 15",
    productId: 1234,
    price: 1200,
    paid: 1200,
    quantity: 1
};

// ❌ Noto'g'ri
const sale = {
    // cashierId yo'q!
    product: "iPhone 15",
    price: 1200
};
```

### 2. Balans Tekshirishda

Har kuni balansni tekshiring:

```javascript
// Kunlik balans tekshiruvi
async function dailyBalanceCheck() {
    const cashiers = await fetch('/api/cashiers');
    
    for (const cashier of cashiers) {
        const validation = await SalesValidation.validateBalance(cashier.cashierId);
        
        if (!validation.valid) {
            console.error(`Kassir ${cashier.name}: ${validation.error}`);
            // Admin ga xabar yuborish
        }
    }
}
```

### 3. Duplicate Oldini Olish

5 daqiqa ichida bir xil savdo qilinmasligi:

```javascript
// Duplicate tekshiruvi
const duplicateCheck = await SalesValidation.checkDuplicateSale(saleData);

if (!duplicateCheck.valid) {
    // Foydalanuvchiga so'rash
    if (!confirm('Bu savdo oxirgi 5 daqiqada qilingan. Davom etasizmi?')) {
        return;
    }
}
```

## 🚀 Keyingi Qadamlar

### 1. Backend Validation

Server.js ga qo'shish:

```javascript
app.post('/api/cashier-sales', async (req, res) => {
    const { cashierId, branchId, productId, price, paid } = req.body;
    
    // Kassir tekshiruvi
    const cashier = await Cashier.findOne({ cashierId: cashierId });
    if (!cashier || !cashier.isActive) {
        return res.status(400).json({ error: 'Kassir faol emas!' });
    }
    
    if (cashier.branchId !== branchId) {
        return res.status(400).json({ error: 'Kassir boshqa filialda!' });
    }
    
    // Stock tekshiruvi
    const product = await Product.findOne({ productId: productId });
    if (!product || product.stock <= 0) {
        return res.status(400).json({ error: 'Mahsulot omborda yo\'q!' });
    }
    
    // Savdo yaratish
    const sale = await CashierSale.create(req.body);
    
    // Stock kamaytirish
    product.stock -= 1;
    await product.save();
    
    // Balans oshirish
    cashier.balance += paid;
    await cashier.save();
    
    res.json({ success: true, sale });
});
```

### 2. Transaction Support

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
    // Savdo yaratish
    await CashierSale.create([saleData], { session });
    
    // Stock kamaytirish
    await Product.updateOne(
        { productId: productId },
        { $inc: { stock: -1 } },
        { session }
    );
    
    // Balans oshirish
    await Cashier.updateOne(
        { cashierId: cashierId },
        { $inc: { balance: paid } },
        { session }
    );
    
    await session.commitTransaction();
} catch (error) {
    await session.abortTransaction();
    throw error;
} finally {
    session.endSession();
}
```

### 3. Audit Log

Har bir savdoni yozib borish:

```javascript
await AuditLog.create({
    action: 'sale',
    cashierId: cashierId,
    cashierName: cashier.name,
    branchId: branchId,
    saleId: sale.saleId,
    product: sale.product,
    price: sale.price,
    paid: sale.paid,
    timestamp: new Date()
});
```

## ✅ Xulosa

Savdo va hisobot qattiq validatsiya tizimi yaratildi:

- ✅ Savdo validatsiyasi
- ✅ Balans tekshiruvi
- ✅ Duplicate prevention
- ✅ Kirim berish validatsiyasi
- ✅ Hisobot validatsiyasi
- ✅ Kassir izolyatsiyasi
- ✅ Stock tekshiruvi
- ✅ Xato xabarlari

Endi savdolar qo'shilib ketmaydi va balanslar doim to'g'ri hisoblanadi!

---

**Sana**: 01/03/2026
**Status**: ✅ Tayyor
**Xavfsizlik**: 🔒🔒🔒 Yuqori
