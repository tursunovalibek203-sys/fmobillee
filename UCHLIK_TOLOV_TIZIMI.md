# 💰 Uchlik To'lov Tizimi - Dollar, So'm va Konvertatsiya

## 📋 Tizim Tavsifi

Yangi to'lov tizimi 3 ta input bilan ishlaydi:

1. **💵 Dollar to'lovi** - Mijoz dollar bilan to'lagan miqdor
2. **💰 So'm to'lovi** - Mijoz so'm bilan to'lagan miqdor (faqat kassadagi so'm miqdorini bilish uchun)
3. **🔄 So'mning dollar qiymati** - So'm to'lovining dollar ekvivalenti (hisob-kitob uchun)

## 🎯 Hisob-kitob Logikasi

### Savdo Misoli
```
Mahsulot narxi: $100

Mijoz to'lovi:
- Dollar: $50
- So'm: 500,000 so'm
- So'mning dollar qiymati: $50

Jami to'lov (hisob-kitob): $50 + $50 = $100 ✅
Kassadagi so'm: 500,000 so'm 💰
```

### Kassir Balansi
```javascript
// Dollar balansi (hisob-kitob uchun)
cashier.balance += paidUSD + uzsToUSD

// So'm balansi (faqat ma'lumot uchun)
cashier.balanceUZS += paidUZS
```

## 🗄️ Database O'zgarishlari

### CashierSale Schema
```javascript
const CashierSaleSchema = new mongoose.Schema({
  // ... boshqa maydonlar
  paidUSD: { type: Number, default: 0 },      // Dollar to'lovi
  paidUZS: { type: Number, default: 0 },      // So'm to'lovi
  uzsToUSD: { type: Number, default: 0 },     // So'mning dollar qiymati
  totalPaidUSD: { type: Number, default: 0 }, // Jami (dollar ekvivalenti)
  // ...
});
```

### Sale Schema
```javascript
const SaleSchema = new mongoose.Schema({
  // ... boshqa maydonlar
  paidUSD: { type: Number, default: 0 },
  paidUZS: { type: Number, default: 0 },
  uzsToUSD: { type: Number, default: 0 },
  totalPaidUSD: { type: Number, default: 0 },
  // ...
});
```

### Cashier Schema
```javascript
const CashierSchema = new mongoose.Schema({
  // ... boshqa maydonlar
  balance: { type: Number, default: 0 },      // Dollar balansi
  balanceUZS: { type: Number, default: 0 },   // So'm balansi
  // ...
});
```

## 💻 Frontend (cashier.html)

### To'lov Inputlari
```html
<div>
  <label>💵 Dollar to'lovi ($)</label>
  <input type="number" id="paidUSD" step="0.01">
</div>

<div>
  <label>💰 So'm to'lovi (UZS)</label>
  <input type="number" id="paidUZS" step="1000" oninput="calculateUZStoUSD()">
</div>

<div>
  <label>🔄 So'mning dollar qiymati ($)</label>
  <input type="number" id="uzsToUSD" step="0.01">
</div>

<div>
  <p>Jami to'lov (Dollar ekvivalenti):</p>
  <p id="totalPayment">$0.00</p>
</div>
```

### JavaScript Hisoblash
```javascript
function calculateUZStoUSD() {
  const paidUSD = parseFloat(document.getElementById('paidUSD').value) || 0;
  const uzsToUSD = parseFloat(document.getElementById('uzsToUSD').value) || 0;
  const total = paidUSD + uzsToUSD;
  
  document.getElementById('totalPayment').textContent = '$' + total.toFixed(2);
}
```

## 🔧 Backend API (server.js)

### POST /api/cashier-sales
```javascript
app.post('/api/cashier-sales', async (req, res) => {
  const { 
    paidUSD,      // Dollar to'lovi
    paidUZS,      // So'm to'lovi
    uzsToUSD,     // So'mning dollar qiymati
    totalPaidUSD  // Jami (paidUSD + uzsToUSD)
  } = req.body;
  
  // Kassir balansini yangilash
  cashier.balance += (paidUSD || 0) + (uzsToUSD || 0);
  cashier.balanceUZS += (paidUZS || 0);
  
  // ...
});
```

### GET /api/cashier-stats/:cashierId
```javascript
app.get('/api/cashier-stats/:cashierId', async (req, res) => {
  // Bugungi to'lovlar
  const todayTotalUSD = todaySales.reduce((sum, s) => sum + (s.totalPaidUSD || 0), 0);
  const todayTotalUZS = todaySales.reduce((sum, s) => sum + (s.paidUZS || 0), 0);
  
  res.json({
    stats: {
      balance: cashier.balance,           // Dollar balansi
      balanceUZS: cashier.balanceUZS,     // So'm balansi
      todayTotalUSD,
      todayTotalUZS,
      // ...
    }
  });
});
```

## 📊 Kassir Panelida Ko'rinish

### Kassadagi Pul
```
💵 Kassadagi pul
$1,234.56
💰 1,234,567 so'm
```

### Bugungi Savdo
```
💰 Bugungi savdo
$500.00 + 5,000,000 so'm
```

### Jami Savdo
```
📊 Jami savdo
$10,000.00 + 100,000,000 so'm
```

## 🎨 Interfeys Xususiyatlari

1. **Real-time hisoblash** - So'm kiritilganda avtomatik jami ko'rsatiladi
2. **Ikki valyuta ko'rsatish** - Dollar va so'm alohida
3. **Aniq balans** - Kassadagi dollar va so'm miqdori
4. **To'liq ma'lumot** - Har bir savdoda barcha to'lov turlari ko'rsatiladi

## 📝 Foydalanish Qo'llanmasi

### 1. Savdo Qo'shish

1. Mijozni tanlang
2. Mahsulot ma'lumotlarini kiriting
3. Mahsulot narxini kiriting (dollar)
4. To'lov ma'lumotlarini kiriting:
   - **Dollar to'lovi**: Mijoz dollar bilan to'lagan miqdor
   - **So'm to'lovi**: Mijoz so'm bilan to'lagan miqdor
   - **So'mning dollar qiymati**: So'm to'lovining dollar ekvivalenti
5. Jami to'lov avtomatik hisoblanadi
6. "Savdo qo'shish" tugmasini bosing

### 2. Misol

**Mahsulot:** iPhone 15 Pro  
**Narxi:** $1,000

**Mijoz to'lovi:**
- Dollar: $500
- So'm: 5,000,000 so'm
- So'mning dollar qiymati: $500

**Natija:**
- Jami to'lov: $1,000 ✅
- Kassadagi dollar: +$500
- Kassadagi so'm: +5,000,000 so'm
- Hisob-kitob: $500 + $500 = $1,000

## ⚠️ Muhim Eslatmalar

1. **Avtomatik konvertatsiya yo'q** - So'mning dollar qiymatini kassir qo'lda kiritadi
2. **Ikki balans** - Dollar va so'm alohida saqlanadi
3. **Hisob-kitob faqat dollar** - Barcha hisoblar dollar ekvivalentida
4. **So'm faqat ma'lumot** - Kassadagi so'm miqdorini bilish uchun

## 🔄 Eski Tizimdan Farqi

### Eski Tizim
```
- Faqat bitta valyuta tanlash
- Yoki dollar yoki so'm
- Aralash to'lov mumkin emas
```

### Yangi Tizim
```
✅ Bir vaqtda ikkala valyuta
✅ Aralash to'lov
✅ Aniq hisob-kitob
✅ Kassadagi so'm miqdorini bilish
```

## 🚀 Afzalliklar

1. **Moslashuvchanlik** - Mijoz istalgan kombinatsiyada to'lashi mumkin
2. **Aniqlik** - Har bir valyuta alohida hisoblanadi
3. **Shaffoflik** - Kassadagi dollar va so'm miqdori aniq
4. **Qulay** - Kassir uchun oson va tushunarli
5. **To'liq ma'lumot** - Admin barcha to'lov turlarini ko'radi

## 📞 Yordam

Agar savol bo'lsa:
1. Kassir panelida "?" tugmasini bosing
2. Yoki admin bilan bog'laning

---

**Yaratilgan sana:** 2025-02-11  
**Versiya:** 3.0  
**Status:** ✅ Tayyor
