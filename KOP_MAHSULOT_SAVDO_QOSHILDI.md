# 🛒 Bitta Savdoda Ko'p Mahsulot - Tayyor!

## ✅ Yangi Funksiya

Endi kassir bitta savdoda bir nechta mahsulot sotishi mumkin!

### 🎯 Qanday Ishlaydi

1. **Mahsulot Qo'shish:**
   - Mahsulot tanlang
   - Miqdorni kiriting
   - "➕ Savatga Qo'shish" tugmasini bosing
   - Mahsulot savatga qo'shiladi

2. **Savat Ko'rish:**
   - Barcha qo'shilgan mahsulotlar ko'rinadi
   - Har bir mahsulot uchun:
     - Nomi
     - Miqdori
     - Narxi
     - Jami summa
   - Umumiy summa ko'rsatiladi

3. **Mahsulot O'chirish:**
   - Har bir mahsulot yonida "🗑️" tugmasi
   - Bosing va savatdan o'chiriladi

4. **Savdoni Yakunlash:**
   - Mijoz ID kiriting (ixtiyoriy)
   - To'lov summasini kiriting
   - "✅ Savdoni Yakunlash" tugmasini bosing
   - Barcha mahsulotlar bitta savdo sifatida saqlanadi

## 📋 Misol

### Savdo 1:
```
Mijoz: Jasur Abdullayev
Mahsulotlar:
  1. iPhone 15 Pro x1 = $1200
  2. AirPods Pro x2 = $500
  3. USB-C Kabel x5 = $50
━━━━━━━━━━━━━━━━━━━━
Jami: $1750
To'landi: $1750
```

## 🎨 Interfeys

### Savat Kartasi:
```
┌─────────────────────────────┐
│ 🛒 SAVAT (3 mahsulot)       │
├─────────────────────────────┤
│ iPhone 15 Pro               │
│ 1 x $1200 = $1200      [🗑️] │
├─────────────────────────────┤
│ AirPods Pro                 │
│ 2 x $250 = $500        [🗑️] │
├─────────────────────────────┤
│ USB-C Kabel                 │
│ 5 x $10 = $50          [🗑️] │
├─────────────────────────────┤
│ JAMI: $1750                 │
└─────────────────────────────┘
```

## 💾 Ma'lumotlar Bazasi

Har bir mahsulot alohida savdo sifatida saqlanadi, lekin bir xil `saleId` bilan:

```javascript
{
  saleId: 1234567890,
  items: [
    { product: "iPhone 15 Pro", quantity: 1, price: 1200 },
    { product: "AirPods Pro", quantity: 2, price: 500 },
    { product: "USB-C Kabel", quantity: 5, price: 50 }
  ],
  totalAmount: 1750,
  paid: 1750
}
```

## 🚀 Foydalanish

1. **Sahifani Oching:**
   ```
   http://localhost:3000/cashier-multi-sale.html
   ```

2. **Mahsulot Qo'shing:**
   - Mahsulot tanlang
   - Miqdorni kiriting
   - "Savatga Qo'shish" bosing

3. **Savdoni Yakunlang:**
   - Mijoz ID kiriting
   - To'lov kiriting
   - "Savdoni Yakunlash" bosing

## ✨ Afzalliklar

1. **Tezlik:** Bir nechta mahsulotni bir vaqtda sotish
2. **Qulaylik:** Savat tizimi bilan oson boshqarish
3. **Aniqlik:** Jami summa avtomatik hisoblanadi
4. **Moslashuvchanlik:** Istalgan vaqtda mahsulot qo'shish/o'chirish

## 🔧 Texnik Tafsilotlar

- **Frontend:** JavaScript (Savat boshqaruvi)
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Real-time:** Avtomatik hisoblash

## 📱 Sahifalar

- **Ko'p Mahsulot Savdo:** `/cashier-multi-sale.html`
- **Oddiy Savdo:** `/cashier-advanced.html`
- **Savdo Tarixi:** `/cashier-transactions.html`

---

**Versiya:** 3.1  
**Sana:** 26.02.2026  
**Status:** ✅ Tayyor
