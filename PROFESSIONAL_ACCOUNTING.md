# 💰 Professional Hisob-Kitob Tizimi

## Umumiy Ma'lumot

Super aniq va professional hisob-kitoblar tizimi kassir va admin uchun.

## Asosiy Xususiyatlar

### ✅ Aniq Hisoblash
- **Decimal Precision**: 2 xona aniqlik ($0.01)
- **Yaxlitlash**: Math.round() bilan aniq yaxlitlash
- **Valyuta Konvertatsiyasi**: UZS ↔ USD aniq konvertatsiya
- **Xatoliklarni Oldini Olish**: NaN va undefined tekshirish

### 💵 Valyuta Qo'llab-quvvatlash
- **USD**: Dollar ($) - 2 xona aniqlik
- **UZS**: So'm - butun son
- **Konvertatsiya**: 1 USD = 12,700 UZS
- **Ikki Valyutada To'lov**: USD + UZS bir vaqtda

### 📊 Savdo Hisoblash

```javascript
calculateSale({
  customerId: 1,
  customerName: "Ali",
  product: "iPhone 15",
  price: 1000.00,
  paidUSD: 500.00,
  paidUZS: 6350000
})

// Natija:
{
  price: 1000.00,
  paidUSD: 500.00,
  paidUZS: 6350000,
  uzsToUSD: 500.00,      // 6,350,000 / 12,700
  totalPaidUSD: 1000.00, // 500 + 500
  debt: 0.00,
  paymentPercent: 100.00,
  isPaid: true
}
```

### 💳 To'lov Hisoblash

```javascript
calculatePayment({
  customerId: 1,
  customerName: "Ali",
  amountUSD: 100.00,
  amountUZS: 1270000
})

// Natija:
{
  amountUSD: 100.00,
  amountUZS: 1270000,
  uzsToUSD: 100.00,
  totalAmountUSD: 200.00
}
```

### 👤 Mijoz Hisobi

```javascript
calculateCustomerBalance(sales, payments)

// Natija:
{
  totalSales: 5000.00,
  totalPaid: 4500.00,
  debt: 500.00,
  paymentPercent: 90.00,
  salesCount: 10,
  paymentsCount: 5,
  hasDebt: true,
  isPaidFull: false
}
```

### 👨‍💼 Kassir Hisobi

```javascript
calculateCashierBalance(sales, handovers)

// Natija:
{
  totalSalesAmount: 10000.00,
  totalPaidUSD: 8000.00,
  totalPaidUZS: 25400000,
  totalUZStoUSD: 2000.00,
  totalPaidInUSD: 10000.00,
  totalHandovers: 9000.00,
  balanceUSD: -1000.00,  // 8000 - 9000
  balanceUZS: 25400000,
  totalBalance: 1000.00,  // -1000 + 2000
  salesCount: 50,
  handoversCount: 10
}
```

## Statistika

### 📅 Kunlik Statistika

```javascript
calculateDailyStats(sales, "12.02.2025")

// Natija:
{
  date: "12.02.2025",
  salesCount: 15,
  totalAmount: 5000.00,
  totalPaid: 4500.00,
  totalDebt: 500.00,
  avgCheck: 333.33,
  paymentPercent: 90.00
}
```

### 📆 Oylik Statistika

```javascript
calculateMonthlyStats(sales, 2, 2025)

// Natija:
{
  month: 2,
  year: 2025,
  salesCount: 450,
  totalAmount: 150000.00,
  totalPaid: 135000.00,
  totalDebt: 15000.00,
  avgCheck: 333.33,
  avgDailySales: 5357.14,  // 150000 / 28 kun
  paymentPercent: 90.00
}
```

## Validatsiya

### ✅ Savdo Validatsiyasi

```javascript
validateSale({
  customerId: 1,
  product: "iPhone",
  price: 1000,
  paidUSD: 500,
  paidUZS: 0
})

// Natija:
{
  isValid: true,
  errors: []
}
```

### ❌ Xato Holatlari

```javascript
validateSale({
  customerId: null,
  product: "",
  price: -100,
  paidUSD: 0,
  paidUZS: 0
})

// Natija:
{
  isValid: false,
  errors: [
    "Mijoz tanlanmagan",
    "Mahsulot nomi kiritilmagan",
    "Narx noto'g'ri",
    "Kamida bitta valyutada to'lov kiritilishi kerak"
  ]
}
```

## Hisobot

### 📊 Batafsil Hisobot

```javascript
generateDetailedReport(sales, payments, handovers)

// Natija:
{
  generatedAt: "2025-02-12T10:30:00.000Z",
  daily: {
    date: "12.02.2025",
    salesCount: 15,
    totalAmount: 5000.00,
    totalPaid: 4500.00,
    totalDebt: 500.00,
    avgCheck: 333.33,
    paymentPercent: 90.00
  },
  monthly: {
    month: 2,
    year: 2025,
    salesCount: 450,
    totalAmount: 150000.00,
    totalPaid: 135000.00,
    totalDebt: 15000.00,
    avgCheck: 333.33,
    avgDailySales: 5357.14,
    paymentPercent: 90.00
  },
  total: {
    salesCount: 1500,
    paymentsCount: 300,
    handoversCount: 50,
    totalSalesAmount: 500000.00,
    totalPaid: 450000.00,
    totalPayments: 30000.00,
    totalHandovers: 400000.00,
    totalDebt: 20000.00
  }
}
```

## Formatlash

### 💵 Pul Formatlash

```javascript
formatMoney(1234.56, 'USD')  // "$1,234.56"
formatMoney(1234567, 'UZS')  // "1,234,567 so'm"
```

### 🔄 Konvertatsiya

```javascript
convertUZStoUSD(12700000)  // 1000.00
convertUSDtoUZS(1000)      // 12700000
```

### ⚖️ Yaxlitlash

```javascript
roundMoney(1234.567)  // 1234.57
roundMoney(1234.564)  // 1234.56
```

## Foydalanish

### HTML ga Qo'shish

```html
<script src="accounting-professional.js"></script>
```

### JavaScript da Ishlatish

```javascript
// Global instance
const accounting = new ProfessionalAccounting();

// Savdo hisoblash
const sale = accounting.calculateSale({
  customerId: 1,
  customerName: "Ali",
  product: "iPhone 15",
  price: 1000,
  paidUSD: 500,
  paidUZS: 6350000
});

// Pul formatlash
const formatted = accounting.formatMoney(sale.totalPaidUSD, 'USD');
console.log(formatted); // "$1,000.00"
```

## Xavfsizlik

### ✅ Tekshiruvlar
- NaN tekshirish
- undefined tekshirish
- Manfiy qiymatlar tekshirish
- Bo'sh qiymatlar tekshirish
- Nol bo'lishdan himoya

### 🔒 Aniqlik
- Floating point xatolarini oldini olish
- Aniq yaxlitlash
- Decimal precision
- Valyuta standartlari

## Afzalliklar

### ✅ Kassir Uchun
- Aniq hisob-kitoblar
- Ikki valyutada to'lov
- Avtomatik konvertatsiya
- Xatolarni oldini olish
- Tez va oson

### ✅ Admin Uchun
- Batafsil statistika
- Kunlik/oylik hisobotlar
- KPI metrikalar
- Kassirlar taqqoslash
- Export qilish

## Misol: To'liq Savdo

```javascript
// 1. Savdo yaratish
const saleData = {
  customerId: 1,
  customerName: "Ali Valiyev",
  product: "iPhone 15 Pro Max",
  price: 1200.00,
  paidUSD: 600.00,
  paidUZS: 7620000,  // 600 USD
  cashierId: 1,
  cashierName: "Sardor",
  branchId: 1,
  branchName: "Toshkent"
};

// 2. Validatsiya
const validation = accounting.validateSale(saleData);
if (!validation.isValid) {
  console.error("Xatolar:", validation.errors);
  return;
}

// 3. Hisoblash
const sale = accounting.calculateSale(saleData);

// 4. Natija
console.log("Narx:", accounting.formatMoney(sale.price, 'USD'));
console.log("To'langan USD:", accounting.formatMoney(sale.paidUSD, 'USD'));
console.log("To'langan UZS:", accounting.formatMoney(sale.paidUZS, 'UZS'));
console.log("UZS → USD:", accounting.formatMoney(sale.uzsToUSD, 'USD'));
console.log("Jami to'langan:", accounting.formatMoney(sale.totalPaidUSD, 'USD'));
console.log("Qarz:", accounting.formatMoney(sale.debt, 'USD'));
console.log("To'lov %:", sale.paymentPercent + "%");
console.log("To'langan:", sale.isPaid ? "✅ Ha" : "❌ Yo'q");

// Natija:
// Narx: $1,200.00
// To'langan USD: $600.00
// To'langan UZS: 7,620,000 so'm
// UZS → USD: $600.00
// Jami to'langan: $1,200.00
// Qarz: $0.00
// To'lov %: 100%
// To'langan: ✅ Ha
```

## Texnik Detalllar

### Precision
- **USD**: 2 decimal places (0.01)
- **UZS**: 0 decimal places (1)
- **Yaxlitlash**: Math.round()
- **Formatlash**: Intl.NumberFormat

### Performance
- O(1) hisoblashlar
- Minimal memory usage
- Fast calculations
- Optimized loops

### Compatibility
- ES6+
- Modern browsers
- Node.js support
- Module export

---

**Versiya**: 1.0 Professional
**Sana**: 2025-02-12
**Muallif**: Kiro AI Assistant
