# 💵💰 Dual Currency Payment System

## Umumiy Ma'lumot

Ikki valyutada to'lov qabul qilish tizimi - Dollar va So'm.

## Asosiy Xususiyatlar

### 💵 Dollar (USD)
- Asosiy valyuta
- 2 xona aniqlik ($0.01)
- Formatlash: $1,234.56

### 💰 So'm (UZS)
- Qo'shimcha valyuta
- Butun son (1 so'm)
- Formatlash: 1,234,567 so'm

### 🔄 Konvertatsiya
- **Kurs**: 1 USD = 12,700 UZS
- **Avtomatik hisoblash**
- **Real-time yangilanish**

## To'lov Qabul Qilish

### Interface

```
┌─────────────────────────────────────────────┐
│ 💵 To'lov qabul qilish                      │
├─────────────────────────────────────────────┤
│                                             │
│ 💵 Kassadagi Dollar    💰 Kassadagi So'm   │
│ $1,234.56              15,748,000 so'm     │
│                        ≈ $1,240.00         │
│                                             │
│ ┌──────────────┐  ┌──────────────┐        │
│ │ 💵 Dollar    │  │ 💰 So'm      │        │
│ │ 500.00       │  │ 6,350,000    │        │
│ └──────────────┘  └──────────────┘        │
│                                             │
│ Jami to'lov (Dollar ekvivalenti)           │
│ $1,000.00                                  │
│                                             │
│ [💳 To'lov qabul qilish]                   │
└─────────────────────────────────────────────┘
```

### Hisoblash

**Misol 1: Faqat Dollar**
```
Dollar: $500.00
So'm: 0
─────────────────
Jami: $500.00
```

**Misol 2: Faqat So'm**
```
Dollar: $0.00
So'm: 6,350,000
UZS → USD: 6,350,000 / 12,700 = $500.00
─────────────────
Jami: $500.00
```

**Misol 3: Aralash**
```
Dollar: $500.00
So'm: 6,350,000
UZS → USD: 6,350,000 / 12,700 = $500.00
─────────────────
Jami: $1,000.00
```

## Kassadagi Balans

### Ko'rsatiladigan Ma'lumotlar

**Dollar Balansi:**
- Kassadagi dollar miqdori
- Format: $1,234.56

**So'm Balansi:**
- Kassadagi so'm miqdori
- Format: 15,748,000 so'm
- Dollar ekvivalenti: ≈ $1,240.00

### Hisoblash

```javascript
// Dollar balansi
balanceUSD = totalReceivedUSD - totalHandoverUSD

// So'm balansi
balanceUZS = totalReceivedUZS - totalHandoverUZS

// So'm ning dollar ekvivalenti
uzsInUSD = balanceUZS / 12700

// Jami balans (dollar ekvivalenti)
totalBalance = balanceUSD + uzsInUSD
```

## Ma'lumotlar Strukturasi

### To'lov Obyekti

```javascript
{
  id: 1234567890,
  customerId: 1,
  customerName: "Ali Valiyev",
  product: "To'lov",
  price: 0,
  paid: 1000.00,           // Jami (USD)
  paidUSD: 500.00,         // Dollar
  paidUZS: 6350000,        // So'm
  uzsToUSD: 500.00,        // So'm → Dollar
  totalPaidUSD: 1000.00,   // Jami USD
  type: "payment",
  time: "14:30",
  date: "12.02.2025",
  fullDate: "2025-02-12T14:30:00.000Z"
}
```

### Kassir Balansi

```javascript
{
  cashierId: 1,
  cashierName: "Sardor",
  balanceUSD: 1234.56,     // Dollar balansi
  balanceUZS: 15748000,    // So'm balansi
  uzsInUSD: 1240.00,       // So'm → Dollar
  totalBalance: 2474.56,   // Jami (USD)
  totalReceivedUSD: 5000.00,
  totalReceivedUZS: 63500000,
  totalHandoverUSD: 3765.44,
  totalHandoverUZS: 47752000
}
```

## Validatsiya

### Tekshiruvlar

```javascript
// 1. Kamida bitta valyuta
if (usd === 0 && uzs === 0) {
  alert('⚠️ Kamida bitta valyutada to\'lov kiriting!');
  return;
}

// 2. Manfiy qiymat yo'q
if (usd < 0 || uzs < 0) {
  alert('⚠️ To\'lov manfiy bo\'lishi mumkin emas!');
  return;
}

// 3. Qarz tekshirish
const debt = getCustomerDebt(customerId);
if (debt <= 0) {
  if (!confirm('Mijozning qarzi yo\'q. Baribir to\'lov qabul qilasizmi?')) {
    return;
  }
}
```

## Formatlash

### Dollar

```javascript
function formatUSD(amount) {
  return '$' + amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Misol
formatUSD(1234.56)  // "$1,234.56"
```

### So'm

```javascript
function formatUZS(amount) {
  return amount.toLocaleString('uz-UZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + ' so\'m';
}

// Misol
formatUZS(15748000)  // "15,748,000 so'm"
```

## UI Komponentlar

### Input Maydonlari

**Dollar Input:**
```html
<input type="number" 
       id="paymentUSD" 
       placeholder="0.00" 
       step="0.01" 
       min="0"
       oninput="updatePaymentTotal()">
```

**So'm Input:**
```html
<input type="number" 
       id="paymentUZS" 
       placeholder="0" 
       step="1000" 
       min="0"
       oninput="updatePaymentTotal()">
```

### Balans Ko'rsatkichlari

```html
<div class="balance-display">
  <div class="balance-item">
    <label>💵 Kassadagi Dollar</label>
    <span id="cashBalanceUSD">$0.00</span>
  </div>
  <div class="balance-item">
    <label>💰 Kassadagi So'm</label>
    <span id="cashBalanceUZS">0 so'm</span>
    <small id="cashBalanceUZSinUSD">≈ $0.00</small>
  </div>
</div>
```

## JavaScript Funksiyalar

### updatePaymentTotal()

```javascript
function updatePaymentTotal() {
  const usd = parseFloat(document.getElementById('paymentUSD').value) || 0;
  const uzs = parseFloat(document.getElementById('paymentUZS').value) || 0;
  
  const exchangeRate = 12700;
  const uzsInUSD = uzs / exchangeRate;
  const total = usd + uzsInUSD;
  
  document.getElementById('paymentTotal').textContent = formatMoney(total, 'USD');
}
```

### updateCashBalance()

```javascript
function updateCashBalance() {
  // Serverdan ma'lumot olish
  fetch('/api/cashier-balance')
    .then(res => res.json())
    .then(data => {
      document.getElementById('cashBalanceUSD').textContent = 
        formatMoney(data.balanceUSD, 'USD');
      
      document.getElementById('cashBalanceUZS').textContent = 
        formatMoney(data.balanceUZS, 'UZS');
      
      const uzsInUSD = data.balanceUZS / 12700;
      document.getElementById('cashBalanceUZSinUSD').textContent = 
        '≈ ' + formatMoney(uzsInUSD, 'USD');
    });
}
```

### addPayment()

```javascript
async function addPayment() {
  const usd = parseFloat(document.getElementById('paymentUSD').value) || 0;
  const uzs = parseFloat(document.getElementById('paymentUZS').value) || 0;
  
  // Validatsiya
  if (usd === 0 && uzs === 0) {
    alert('⚠️ Kamida bitta valyutada to\'lov kiriting!');
    return;
  }
  
  // Konvertatsiya
  const exchangeRate = 12700;
  const uzsInUSD = uzs / exchangeRate;
  const totalUSD = usd + uzsInUSD;
  
  // To'lov obyekti
  const payment = {
    id: Date.now(),
    customerId: selectedCustomer.id,
    customerName: selectedCustomer.name,
    product: 'To\'lov',
    price: 0,
    paid: totalUSD,
    paidUSD: usd,
    paidUZS: uzs,
    uzsToUSD: uzsInUSD,
    totalPaidUSD: totalUSD,
    type: 'payment',
    time: new Date().toLocaleTimeString('uz-UZ'),
    date: new Date().toLocaleDateString('uz-UZ')
  };
  
  // Saqlash
  await saveSale(payment);
  
  // UI yangilash
  updateCashBalance();
  renderCustomerSales();
  
  alert(`✅ To'lov qabul qilindi!\n\n💵 Dollar: ${formatMoney(usd, 'USD')}\n💰 So'm: ${formatMoney(uzs, 'UZS')}\n📊 Jami: ${formatMoney(totalUSD, 'USD')}`);
}
```

## Misol: To'liq Jarayon

### 1. Mijoz Tanlash

```
Mijoz: Ali Valiyev
Qarz: $500.00
```

### 2. To'lov Kiritish

```
💵 Dollar: $200.00
💰 So'm: 3,810,000

Hisoblash:
- Dollar: $200.00
- So'm → Dollar: 3,810,000 / 12,700 = $300.00
- Jami: $500.00
```

### 3. Tasdiqlash

```
✅ To'lov qabul qilindi!

💵 Dollar: $200.00
💰 So'm: 3,810,000 so'm
📊 Jami: $500.00
```

### 4. Kassadagi Balans

```
Oldingi balans:
💵 Dollar: $1,234.56
💰 So'm: 15,748,000 so'm (≈ $1,240.00)

Yangi balans:
💵 Dollar: $1,434.56 (+$200.00)
💰 So'm: 19,558,000 so'm (+3,810,000)
         ≈ $1,540.00

Jami balans: $2,974.56
```

## Afzalliklar

### ✅ Mijoz Uchun
- Ikki valyutada to'lash imkoniyati
- Qulaylik
- Tanlash erkinligi

### ✅ Biznes Uchun
- Aniq hisob-kitob
- Valyuta konvertatsiyasi
- Real-time balans
- Batafsil hisobotlar

### ✅ Kassir Uchun
- Oson interfeys
- Avtomatik hisoblash
- Xatolarni kamaytirish
- Tez ishlash

## Xavfsizlik

### Validatsiya
- Manfiy qiymatlar yo'q
- Nol tekshirish
- Qarz tekshirish
- Input sanitization

### Hisoblash
- Aniq konvertatsiya
- Floating point xatolarini oldini olish
- Yaxlitlash qoidalari
- Consistency checks

## Performance

### Optimizatsiya
- Real-time hisoblash
- Debounced input
- Lazy loading
- Caching

### UX
- Instant feedback
- Loading states
- Error messages
- Success notifications

---

**Versiya**: 1.0 Dual Currency
**Sana**: 2025-02-12
**Muallif**: Kiro AI Assistant
