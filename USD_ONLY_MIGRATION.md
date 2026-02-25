# 💵 FAQAT DOLLAR VALYUTASI - MIGRATSIYA

## O'zgarishlar

### ❌ Olib Tashlangan:
- So'm valyutasi (UZS)
- Valyuta kursi (exchangeRate)
- Ikki valyuta tizimi
- paidUZS maydoni
- balanceUZS maydoni
- Valyuta konvertatsiyasi

### ✅ Qoldirilgan:
- Faqat Dollar (USD)
- paid - to'lov summasi (USD)
- balance - balans (USD)
- price - narx (USD)

---

## Database Schema O'zgarishlari

### Eski Schema:
```javascript
{
  price: Number,
  paid: Number,        // Jami (USD)
  paidUSD: Number,     // Dollar
  paidUZS: Number,     // So'm ❌
  exchangeRate: Number // Kurs ❌
}
```

### Yangi Schema:
```javascript
{
  price: Number,       // Narx (USD)
  paid: Number         // To'lov (USD)
}
```

---

## API O'zgarishlari

### Eski Request:
```json
{
  "price": 1000,
  "paidUSD": 500,
  "paidUZS": 6350000,
  "exchangeRate": 12700
}
```

### Yangi Request:
```json
{
  "price": 1000,
  "paid": 500
}
```

---

## Frontend O'zgarishlari

### Olib Tashlangan Elementlar:
- So'm input maydoni
- Valyuta kursi input
- UZS balans ko'rsatkichi
- Valyuta konvertatsiya kalkulyatori

### Qoldirilgan:
- Faqat dollar input
- Dollar balans
- Dollar hisobotlar

---

## Migration Script

Eski ma'lumotlarni yangi formatga o'tkazish uchun:

```javascript
// Barcha savdolarni yangilash
db.sales.updateMany(
  {},
  {
    $unset: {
      paidUZS: "",
      exchangeRate: "",
      uzsToUSD: "",
      totalPaidUSD: ""
    }
  }
);

// Barcha kassirlarni yangilash
db.cashiers.updateMany(
  {},
  {
    $unset: {
      balanceUZS: ""
    }
  }
);
```

---

## Foydalanish

Endi barcha operatsiyalar faqat dollarda:

```javascript
// Savdo yaratish
{
  "saleId": 12345,
  "customerId": 100001,
  "product": "iPhone 15",
  "price": 1200,      // USD
  "paid": 500         // USD
}

// Kassir balansi
{
  "cashierId": 1,
  "balance": 1234.56  // USD
}
```

---

**Natija:** Tizim soddalashdi, faqat dollar valyutasi qoldi! 💵
