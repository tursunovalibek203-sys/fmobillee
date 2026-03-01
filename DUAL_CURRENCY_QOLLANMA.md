# 💱 Dual Currency Tizimi - To'liq Qo'llanma

## 🎯 Asosiy Xususiyatlar

1. **Asosiy Valyuta** - Dollar ($)
2. **Balans** - Faqat dollarda hisoblanadi
3. **To'lov** - 2 ta input (So'm va Dollar)
4. **Avtomatik Konvertatsiya** - Real-time hisoblash
5. **Chek** - Barcha ma'lumotlar bilan

## 💰 Valyuta Kursi

**Joriy kurs:** 1 USD = 12,500 UZS

Kurs serverdan avtomatik yuklanadi va barcha hisoblashlarda ishlatiladi.

## 📊 To'lov Qabul Qilish

### 2 ta Input
1. **💸 So'm** - So'mda to'lov
2. **💵 Dollar** - Dollarda to'lov

### Avtomatik Hisoblash
- So'm kiritilsa → Dollarga o'tkaziladi
- Dollar kiritilsa → So'mga o'tkaziladi
- Jami to'lov dollarda ko'rsatiladi

### Misol
```
💸 So'm: 125,000
= $10.00

💵 Dollar: $5.00
= 62,500 so'm

📊 Jami To'lov: $15.00
```

## 🛒 Savdo Qo'shish

### Narx - 2 ta Input
1. **💸 Narx (So'm)** - So'mda narx
2. **💵 Narx (Dollar)** - Dollarda narx

### To'langan - 2 ta Input
1. **💸 To'langan (So'm)** - So'mda to'lov
2. **💵 To'langan (Dollar)** - Dollarda to'lov

### Avtomatik Hisoblash
- Bitta inputga kiritilsa, ikkinchisi avtomatik hisoblanadi
- Har ikkala inputga ham kiritsangiz, ikkalasi ham qo'shiladi

### Misol 1: Faqat So'm
```
Mahsulot: iPhone 13
💸 Narx (So'm): 5,000,000
= $400.00 (avtomatik)

💸 To'langan (So'm): 3,000,000
= $240.00 (avtomatik)

Qarz: $160.00
```

### Misol 2: Faqat Dollar
```
Mahsulot: Samsung A52
💵 Narx (Dollar): $300.00
= 3,750,000 so'm (avtomatik)

💵 To'langan (Dollar): $200.00
= 2,500,000 so'm (avtomatik)

Qarz: $100.00
```

### Misol 3: Aralash
```
Mahsulot: AirPods Pro
💸 Narx (So'm): 1,250,000 ($100)
💵 Narx (Dollar): $50.00

Jami Narx: $150.00

💸 To'langan (So'm): 625,000 ($50)
💵 To'langan (Dollar): $75.00

Jami To'langan: $125.00
Qarz: $25.00
```

## 📈 Balans Tizimi

### Kassadagi Balans
```
💵 Kassadagi Dollar: $500.00
💰 So'm (Dollar qiymati): $200.00
   (2,500,000 so'm)

📊 Jami Balans: $700.00
```

### Balans Hisoblash
- Barcha to'lovlar dollarga o'tkaziladi
- Balans faqat dollarda saqlanadi
- So'm to'lovlar avtomatik dollarga aylantiriladi

## 🧾 Chek Tizimi

### Chekda Ko'rsatiladigan Ma'lumotlar

```
================================
        SAVDO CHEKI
================================

Mijoz: Anvar Aliyev
Sana: 27.02.2026
Vaqt: 14:30

--------------------------------
Mahsulot: iPhone 13 Pro Max
--------------------------------

💵 Narx (Dollar): $450.00
💸 Narx (So'm): 5,625,000

💵 To'langan (Dollar): $300.00
💸 To'langan (So'm): 2,000,000
   ($160.00)

📊 Jami To'langan: $460.00

⚠️ Qarz: $0.00 (To'liq to'landi!)

--------------------------------
Valyuta kursi: 1 USD = 12,500 UZS
================================
```

## 🔄 Konvertatsiya Formulalari

### So'mdan Dollarga
```javascript
USD = UZS / 12500
```

### Dollardan So'mga
```javascript
UZS = USD * 12500
```

### Misol
```
125,000 so'm = 125,000 / 12,500 = $10.00
$10.00 = 10 * 12,500 = 125,000 so'm
```

## 📱 Interfeys

### To'lov Qabul Qilish
1. Mijozni tanlang
2. So'm yoki Dollar kiriting (yoki ikkalasini)
3. Avtomatik konvertatsiya ko'rinadi
4. "To'lov qabul qilish" tugmasini bosing
5. Chek chiqadi

### Savdo Qo'shish
1. Mijozni tanlang
2. Mahsulot nomini kiriting
3. Narxni kiriting (So'm yoki Dollar)
4. To'lovni kiriting (So'm yoki Dollar)
5. "Savdo qo'shish" tugmasini bosing
6. Chek chiqadi

## ⚙️ Texnik Ma'lumotlar

### O'zgartirilgan Fayllar
1. ✅ `public/index.html` - HTML struktura
2. ✅ `public/script.js` - JavaScript funksiyalar

### Yangi Funksiyalar
1. `loadExchangeRate()` - Valyuta kursini yuklash
2. `uzsToUsd(uzs)` - So'mdan dollarga
3. `usdToUzs(usd)` - Dollardan so'mga
4. `calculateFromUZS()` - So'mdan hisoblash
5. `calculateFromUSD()` - Dollardan hisoblash
6. `updateTotalPayment()` - Jami to'lovni yangilash
7. `calculatePriceFromUZS()` - Narx (So'm)
8. `calculatePriceFromUSD()` - Narx (Dollar)
9. `calculatePaidFromUZS()` - To'langan (So'm)
10. `calculatePaidFromUSD()` - To'langan (Dollar)

### Yangi O'zgaruvchilar
```javascript
let exchangeRate = 12500; // 1 USD = 12500 UZS
```

## 🎨 Dizayn

### Ranglar
- 💵 Dollar - Yashil (#10b981)
- 💸 So'm - Ko'k (#3b82f6)
- 📊 Jami - Yashil (#10b981)

### Animatsiyalar
- Input o'zgarganda - Smooth transition
- Konvertatsiya - Real-time
- Chek - Fade in

## 🚀 Qanday Ishlatish

### 1. To'lov Qabul Qilish
```
1. Mijozni tanlang
2. So'm inputiga: 125000
   → Avtomatik: $10.00
3. Dollar inputiga: 5
   → Avtomatik: 62,500 so'm
4. Jami: $15.00
5. "To'lov qabul qilish"
```

### 2. Savdo Qo'shish
```
1. Mijozni tanlang
2. Mahsulot: iPhone 13
3. Narx (So'm): 5000000
   → Avtomatik: $400.00
4. To'langan (Dollar): 300
   → Avtomatik: 3,750,000 so'm
5. "Savdo qo'shish"
```

## 📊 Hisobotlar

### Balans Hisoboti
- Jami balans dollarda
- So'm balansi dollarda ko'rsatiladi
- Real-time yangilanadi

### Savdo Hisoboti
- Barcha savdolar dollarda
- So'm to'lovlar konvertatsiya qilingan
- Chekda ikkalasi ham ko'rsatiladi

## ⚠️ Muhim Eslatmalar

1. **Asosiy valyuta** - Har doim Dollar
2. **Balans** - Faqat dollarda
3. **Konvertatsiya** - Avtomatik
4. **Chek** - Ikkalasi ham ko'rsatiladi
5. **Kurs** - Serverdan yuklanadi

## 🔧 Sozlamalar

### Valyuta Kursini O'zgartirish
Server.js faylida:
```javascript
// Exchange rate endpoint
app.get('/api/exchange-rate', (req, res) => {
  res.json({
    success: true,
    exchangeRate: 12500 // Bu yerda o'zgartiring
  });
});
```

## 🎉 Xulosa

Dual Currency tizimi tayyor!

**Afzalliklar:**
- ✅ 2 ta valyuta
- ✅ Avtomatik konvertatsiya
- ✅ Real-time hisoblash
- ✅ To'liq chek
- ✅ Balans dollarda

**Foydalanish:**
1. So'm yoki Dollar kiriting
2. Avtomatik hisoblanadi
3. Chek chiqadi
4. Balans yangilanadi

---

**Tayyor!** 🚀
