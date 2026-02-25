# 🔧 ADMIN TO'LIQ FUNKSIYALAR - QOLLANMA

## 🎯 Yangi Qo'shilgan Funksiyalar

### 1. 💰 Kassirlar Kirimlari (`admin-handovers.html`)

**Funksiyalar:**
- ✅ Barcha kassirlar kirimlarini ko'rish
- ✅ Sana bo'yicha filtrlash
- ✅ Kassir bo'yicha filtrlash
- ✅ Qidiruv (kassir, izoh)
- ✅ Jami statistika
- ✅ Bugungi kirimlar
- ✅ Faol kassirlar soni
- ✅ Pagination

**Ko'rsatkichlar:**
```
📊 Jami kirimlar soni
💵 Jami summa
📅 Bugungi kirimlar
👥 Faol kassirlar
```

**Jadval:**
```
# | Kassir | Summa | Oldingi Balans | Keyingi Balans | Izoh | Sana/Vaqt
```

**Filtrlash:**
- Sana oralig'i (from/to)
- Kassir tanlash
- Qidiruv (ism, ID, izoh)

---

### 2. ⚙️ Tizim Sozlamalari (`admin-settings.html`)

#### A. Valyuta Sozlamalari 💱
```
✅ Valyuta kursi (1 USD = ? UZS)
✅ Asosiy valyuta (USD/UZS)
✅ Dual Currency (on/off)
```

#### B. Tizim Sozlamalari 🔧
```
✅ Avtomatik backup (on/off)
✅ Backup vaqti (soat)
✅ Session timeout (soat)
```

#### C. Bildirishnomalar 🔔
```
✅ Telegram bildirishnomalar (on/off)
✅ Kam qolgan mahsulotlar (on/off)
✅ Minimal miqdor
✅ Katta qarzlar (on/off)
✅ Katta qarz miqdori
```

#### D. Ko'rinish Sozlamalari 🎨
```
✅ Til (O'zbekcha/Русский/English)
✅ Sana formati (DD.MM.YYYY/MM/DD/YYYY/YYYY-MM-DD)
✅ Sahifadagi elementlar (10/20/50/100)
```

---

### 3. 💱 Dual Currency System

**Barcha sahifalarda:**
- ✅ Dollar to'lovlar
- ✅ So'm to'lovlar
- ✅ Avtomatik konvertatsiya
- ✅ Valyuta kursi sozlamalari
- ✅ Ikki valyutada hisobotlar

**Savdo qo'shishda:**
```javascript
{
  paidUSD: 500,        // Dollar to'lov
  paidUZS: 6250000,    // So'm to'lov
  exchangeRate: 12500, // Kurs
  totalUSD: 1000       // Jami (USD)
}
```

**Hisobotlarda:**
```
💵 Dollar to'lovlar: $5,000
💰 So'm to'lovlar: 62,500,000 so'm ($5,000)
📊 Jami: $10,000
```

---

### 4. 📊 Advanced Dashboard

**Yangi Ko'rsatkichlar:**
- ✅ Kassirlar KPI
- ✅ Filiallar taqqoslash
- ✅ Real-time statistika
- ✅ Trend tahlili
- ✅ Eng yaxshi kassir
- ✅ Eng ko'p sotiladigan mahsulot
- ✅ Bugungi/Haftalik/Oylik taqqoslash

**Grafik va Diagrammalar:**
- Savdo trendi (line chart)
- Kassirlar reytingi (bar chart)
- Filiallar taqqoslash (pie chart)
- Mahsulotlar statistikasi (bar chart)

---

## 📁 YARATILGAN FAYLLAR

### HTML Sahifalar:
1. ✅ `admin-handovers.html` - Kassirlar kirimlari
2. ✅ `admin-settings.html` - Tizim sozlamalari

### JavaScript Fayllar:
1. ✅ `admin-handovers.js` - Kirimlar logikasi
2. ✅ `admin-settings.js` - Sozlamalar logikasi

### Yangilangan Fayllar:
1. ✅ `admin.html` - Yangi tugmalar qo'shildi

---

## 🔧 API ENDPOINTS

### Kirimlar
```
GET  /api/all-handovers              # Barcha kirimlar
GET  /api/cashier-handovers/:id      # Kassir kirimlari
POST /api/cashier-handover           # Yangi kirim
```

### Sozlamalar
```
GET  /api/settings                   # Barcha sozlamalar
PUT  /api/settings                   # Sozlamalarni yangilash
GET  /api/settings/exchange-rate     # Valyuta kursi
PUT  /api/settings/exchange-rate     # Kursni yangilash
```

---

## 💡 FOYDALANISH

### 1. Kassirlar Kirimlarini Ko'rish

```
1. Admin panel → 💰 Kirimlar
2. Sana oralig'ini tanlang
3. Kassirni tanlang (ixtiyoriy)
4. Qidiruv (ixtiyoriy)
5. Natijalarni ko'ring
```

**Ko'rinadi:**
- Har bir kirimning tafsilotlari
- Oldingi va keyingi balans
- Izohlar
- Sana va vaqt

### 2. Sozlamalarni O'zgartirish

```
1. Admin panel → ⚙️ Sozlamalar
2. Kerakli bo'limni toping
3. Qiymatni o'zgartiring
4. "Saqlash" tugmasini bosing
```

**Yoki:**
```
Barcha sozlamalarni o'zgartiring
"Barcha Sozlamalarni Saqlash" tugmasini bosing
```

### 3. Valyuta Kursini O'zgartirish

```
1. Sozlamalar → Valyuta Sozlamalari
2. Valyuta kursi: 12500 → 12600
3. Saqlash
```

**Natija:**
- Barcha hisob-kitoblar yangi kurs bilan
- Kassir va admin sahifalarida yangilanadi
- Hisobotlarda yangi kurs ishlatiladi

### 4. Dual Currency Yoqish/O'chirish

```
1. Sozlamalar → Valyuta Sozlamalari
2. Dual Currency toggle ni bosing
3. Avtomatik saqlanadi
```

**Yoqilganda:**
- Dollar va So'm to'lovlar
- Ikki valyutada hisobotlar
- Avtomatik konvertatsiya

**O'chirilganda:**
- Faqat asosiy valyuta
- Oddiy hisob-kitob

---

## 📊 STATISTIKA VA HISOBOTLAR

### Kassirlar Kirimlari Statistikasi

```javascript
{
  totalHandovers: 150,      // Jami kirimlar
  totalAmount: 50000,       // Jami summa (USD)
  todayAmount: 5000,        // Bugungi kirimlar
  activeCashiers: 5,        // Faol kassirlar
  avgHandover: 333.33,      // O'rtacha kirim
  maxHandover: 10000,       // Eng katta kirim
  minHandover: 100          // Eng kichik kirim
}
```

### Valyuta Statistikasi

```javascript
{
  totalUSD: 25000,          // Jami dollar
  totalUZS: 312500000,      // Jami so'm
  totalUSDfromUZS: 25000,   // So'mdan USD
  grandTotal: 50000,        // Umumiy jami (USD)
  exchangeRate: 12500       // Joriy kurs
}
```

---

## 🎨 DIZAYN

### Ranglar

**Kirimlar sahifasi:**
```
Background: Yashil gradient (#059669 → #065f46)
Cards: Oq + glassmorphism
Buttons: Yashil gradient
```

**Sozlamalar sahifasi:**
```
Background: Binafsha gradient (#7c3aed → #5b21b6)
Cards: Oq + shadow
Toggles: Binafsha (#7c3aed)
Save button: Yashil gradient
```

### Elementlar
```
✅ Glassmorphism effektlar
✅ Smooth animatsiyalar
✅ Toggle switches
✅ Gradient buttons
✅ Responsive layout
✅ Mobile-friendly
```

---

## 🔐 XAVFSIZLIK

### Ruxsatlar
```
✅ Faqat admin kirishi mumkin
✅ Session boshqaruvi
✅ Timeout sozlamalari
✅ Secure localStorage
```

### Validatsiya
```
✅ Valyuta kursi > 0
✅ Session timeout >= 1
✅ Minimal miqdor >= 1
✅ Katta qarz >= 0
```

---

## 📱 MOBILE RESPONSIVE

Barcha sahifalar mobil qurilmalarda to'liq ishlaydi:
```
✅ Responsive grid
✅ Touch-friendly toggles
✅ Adaptive font sizes
✅ Mobile navigation
✅ Optimized tables
```

---

## 🚀 KELAJAK REJALAR

### Version 2.0
```
🔄 Real-time grafik
🔄 Export PDF/Excel
🔄 Email bildirishnomalar
🔄 SMS gateway
🔄 Advanced analytics
```

### Version 3.0
```
🔄 AI tahlil
🔄 Prognoz qilish
🔄 Avtomatik buyurtma
🔄 Multi-warehouse
🔄 API integratsiya
```

---

## ✅ TAYYOR FUNKSIYALAR

### Admin Uchun:
1. ✅ Dual Currency System
2. ✅ Kassirlar Kirimlari
3. ✅ Advanced Dashboard
4. ✅ Settings Panel
5. ✅ Valyuta kursi sozlamalari
6. ✅ Bildirishnomalar sozlamalari
7. ✅ Ko'rinish sozlamalari
8. ✅ Tizim sozlamalari

### Kassir Uchun:
1. ✅ Dashboard
2. ✅ Yangi savdo (Dual Currency)
3. ✅ Mijozlar boshqaruvi
4. ✅ Ombor ko'rish
5. ✅ Hisobotlar
6. ✅ Tarix
7. ✅ Kirim berish
8. ✅ Professional dizayn

---

## 📞 YORDAM

### Muammolar

**Valyuta kursi saqlanmayapti:**
```
1. LocalStorage ni tekshiring
2. Browser cache ni tozalang
3. Sahifani yangilang
```

**Kirimlar ko'rinmayapti:**
```
1. Sana oralig'ini tekshiring
2. Kassir filtrini tekshiring
3. API ni tekshiring
```

**Sozlamalar ishlamayapti:**
```
1. LocalStorage ni tekshiring
2. JavaScript console ni tekshiring
3. Sahifani yangilang
```

---

## 🎉 XULOSA

Admin uchun barcha asosiy funksiyalar tayyor!

**Yaratildi:**
- 2 ta HTML sahifa
- 2 ta JavaScript fayl
- Dual Currency System
- Settings Panel
- Kassirlar Kirimlari
- Advanced Dashboard

**Muvaffaqiyatlar! 🚀**

---

**Versiya:** 4.0 Complete
**Sana:** 2026-02-14
**Status:** ✅ Tayyor va Ishga Tushirildi

