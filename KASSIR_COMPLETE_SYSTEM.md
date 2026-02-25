# 💼 KASSIR TO'LIQ TIZIMI - QOLLANMA

## 🎯 Umumiy Ma'lumot

Kassir tizimi - bu admin panelga o'xshash, lekin kassirlar uchun maxsus yaratilgan to'liq boshqaruv tizimi. Kassir barcha funksiyalardan foydalanishi mumkin, faqat omborda mahsulot qo'sha olmaydi (faqat ko'rish).

---

## 📋 SAHIFALAR RO'YXATI

### 1. **cashier-login.html** 🔐
- Kassir kirish sahifasi
- Username va parol
- Session boshqaruvi

### 2. **cashier-dashboard.html** 🏠
- Asosiy dashboard (admin.html kabi)
- Balans ko'rsatkichlari
- Statistika
- Tezkor harakatlar

### 3. **cashier-sale.html** 🛍️
- Yangi savdo qo'shish
- Mijoz tanlash
- Mahsulot qidirish (IMEI/Barcode)
- Dual currency (Dollar + So'm)
- Real-time hisoblash

### 4. **cashier-customers.html** 👥
- Mijozlar ro'yxati
- Qidiruv va filtrlash
- Yangi mijoz qo'shish
- Mijoz daftariga o'tish

### 5. **cashier-customer-daftar.html** 📖
- Mijoz daftari
- Savdo qo'shish
- To'lov qabul qilish
- Savdolar tarixi

### 6. **cashier-warehouse.html** 📦
- Ombor ko'rish (Read-Only)
- Mahsulotlar ro'yxati
- Qidiruv va filtrlash
- Narxlar va miqdorlar
- ❌ Tahrirlash yo'q

### 7. **cashier-reports.html** 📊
- Hisobotlar
- Bugun/Hafta/Oy/Barchasi
- Dollar va So'm to'lovlar
- Grafik va statistika

### 8. **cashier-history.html** 📋
- Savdolar tarixi
- Filtrlash (sana, tur)
- Pagination
- Export (kelajakda)

---

## ✨ ASOSIY XUSUSIYATLAR

### 1. 💱 Dual Currency System
```
✅ Dollar to'lov
✅ So'm to'lov
✅ Ikkalasi birgalikda
✅ Valyuta kursi sozlamalari
✅ Avtomatik konvertatsiya
```

### 2. 🔍 Advanced Search
```
✅ IMEI bo'yicha qidirish
✅ Barcode qidirish
✅ Mahsulot nomi
✅ Real-time natijalar
✅ Avtomatik to'ldirish
```

### 3. 📊 Real-time Statistics
```
✅ Kassadagi balans (USD + UZS)
✅ Bugungi savdo
✅ Jami savdo
✅ Berilgan kirim
✅ Avtomatik yangilanish
```

### 4. 👥 Mijozlar Boshqaruvi
```
✅ Mijozlar ro'yxati
✅ Yangi mijoz qo'shish
✅ Qidiruv (ism, telefon, ID)
✅ Filtrlash (qarzli/qarzsiz)
✅ Mijoz daftari
```

### 5. 📦 Ombor Ko'rish
```
✅ Barcha mahsulotlar
✅ Narxlar
✅ Miqdorlar
✅ Kategoriyalar
✅ Qidiruv va filtrlash
❌ Qo'shish/Tahrirlash yo'q
```

### 6. 💰 Kirim Berish
```
✅ Adminga pul topshirish
✅ Balansdan avtomatik ayriladi
✅ Tarix saqlanadi
✅ Izoh qo'shish
```

### 7. 📈 Hisobotlar
```
✅ Davr bo'yicha (bugun/hafta/oy)
✅ Dollar va So'm alohida
✅ Jami summa
✅ O'rtacha chek
✅ Eng katta savdo
✅ Mijozlar soni
```

---

## 🚀 FOYDALANISH

### 1. Login
```
URL: /cashier-login.html
Username: kassir_username
Password: kassir_password
```

### 2. Dashboard
```
URL: /cashier-dashboard.html

Ko'rinadi:
- Kassadagi balans (USD + UZS)
- Bugungi statistika
- Tezkor harakatlar
- Navigatsiya
```

### 3. Yangi Savdo
```
URL: /cashier-sale.html

Qadamlar:
1. Mijozni tanlash
2. Mahsulotni qidirish (IMEI/Barcode)
3. To'lovni kiritish (USD/UZS/Ikkalasi)
4. Savdoni saqlash

Natija:
- Savdo saqlanadi
- Ombordan chiqariladi
- Kassir balansiga qo'shiladi
- Mijoz qarziga yoziladi
```

### 4. Mijozlar
```
URL: /cashier-customers.html

Funksiyalar:
- Barcha mijozlarni ko'rish
- Qidiruv (ism, telefon, ID)
- Filtrlash (qarzli/qarzsiz)
- Yangi mijoz qo'shish
- Mijoz daftariga o'tish
```

### 5. Ombor
```
URL: /cashier-warehouse.html

Funksiyalar:
- Mahsulotlar ro'yxati
- Qidiruv va filtrlash
- Narxlar va miqdorlar
- Kategoriyalar
- Holat (mavjud/kam/tugagan)

Cheklovlar:
❌ Mahsulot qo'sha olmaydi
❌ Tahrirlash mumkin emas
❌ O'chirish mumkin emas
```

### 6. Hisobotlar
```
URL: /cashier-reports.html

Davrlar:
- Bugun
- Hafta (7 kun)
- Oy (30 kun)
- Barchasi

Ko'rsatkichlar:
- Dollar to'lovlar
- So'm to'lovlar
- Jami summa (USD)
- Savdolar soni
- O'rtacha chek
- Eng katta savdo
- Mijozlar soni
- Berilgan kirim
```

### 7. Tarix
```
URL: /cashier-history.html

Filtrlash:
- Sana oralig'i
- Tur (savdo/to'lov)
- Qidiruv (mijoz/mahsulot)

Ko'rinadi:
- Barcha savdolar
- Barcha to'lovlar
- Jami summa
- O'rtacha chek
```

---

## 🎨 DIZAYN

### Ranglar
```
Dashboard: Yashil gradient (#10b981 → #064e3b)
Savdo: Binafsha gradient (#8b5cf6 → #6d28d9)
Mijozlar: Yashil gradient (#10b981 → #047857)
Ombor: Sariq gradient (#f59e0b → #b45309)
Hisobotlar: Ko'k gradient (#6366f1 → #4338ca)
Tarix: Pushti gradient (#ec4899 → #be185d)
```

### Elementlar
```
✅ Glassmorphism effektlar
✅ Smooth animatsiyalar
✅ Hover effektlar
✅ Responsive dizayn
✅ Mobile-friendly
✅ Professional ko'rinish
```

---

## 🔒 XAVFSIZLIK

### Ruxsatlar
```
✅ Login required
✅ Session management
✅ Faqat o'z savdolarini ko'radi
✅ Ombor: faqat ko'rish
✅ Mahsulot: tahrirlash yo'q
```

### Cheklovlar
```
❌ Mahsulot qo'sha olmaydi
❌ Mahsulot tahrirlay olmaydi
❌ Mahsulot o'chira olmaydi
❌ Boshqa kassir savdolarini ko'ra olmaydi
❌ Admin funksiyalariga kirish yo'q
```

---

## 📊 DATABASE

### CashierSale Schema
```javascript
{
  saleId: Number,
  cashierId: Number,
  cashierName: String,
  branchId: Number,
  customerId: Number,
  customerName: String,
  product: String,
  price: Number,           // USD
  paidUSD: Number,         // Dollar to'lov
  paidUZS: Number,         // So'm to'lov
  exchangeRate: Number,    // Valyuta kursi
  type: String,            // 'sale' yoki 'payment'
  date: String,
  time: String,
  createdAt: Date
}
```

### CashierHandover Schema
```javascript
{
  handoverId: Number,
  cashierId: Number,
  cashierName: String,
  amount: Number,          // USD
  balanceBefore: Number,
  balanceAfter: Number,
  notes: String,
  date: String,
  time: String,
  createdAt: Date
}
```

---

## 🔧 API ENDPOINTS

### Kassir APIs
```
POST   /api/cashier-login              # Login
GET    /api/cashier-stats/:id          # Statistika
GET    /api/cashier-sales/:id          # Savdolar
POST   /api/cashier-sales              # Yangi savdo
POST   /api/cashier-handover           # Kirim berish
GET    /api/cashier-handovers/:id      # Kirimlar tarixi
```

### Mijozlar APIs
```
GET    /api/customers                  # Barcha mijozlar
POST   /api/customers                  # Yangi mijoz
GET    /api/customers/search/:id       # Mijoz qidirish
```

### Ombor APIs (Read-Only)
```
GET    /api/warehouse/products         # Barcha mahsulotlar
GET    /api/warehouse/search           # Mahsulot qidirish
GET    /api/warehouse/categories       # Kategoriyalar
POST   /api/warehouse/stock-out        # Chiqim (savdo)
```

---

## 💡 WORKFLOW MISOLLARI

### Misol 1: Yangi Savdo
```
1. Kassir login qiladi
2. Dashboard → Yangi Savdo
3. Mijozni tanlaydi (qidiruv orqali)
4. IMEI kiritadi: 123456789012345
5. Mahsulot avtomatik topiladi: iPhone 14 Pro
6. Narx: $1,000
7. To'lov kiritadi:
   - Dollar: $500
   - So'm: 6,250,000 (= $500)
8. Jami to'lov: $1,000
9. Qarz: $0
10. Savdoni saqlaydi

Natija:
✅ Savdo saqlanadi
✅ Ombordan -1 dona
✅ Kassir balansi: +$1,000
✅ Mijoz qarzi: $0
```

### Misol 2: Qarzli Savdo
```
1. Mijoz: Sardor
2. Mahsulot: Samsung S23 ($800)
3. To'lov: $300 (dollar)
4. Qarz: $500

Natija:
✅ Savdo saqlanadi
✅ Kassir balansi: +$300
✅ Mijoz qarzi: +$500
```

### Misol 3: Kirim Berish
```
1. Dashboard → Kirim berish
2. Kassadagi pul: $5,000
3. Berilayotgan: $3,000
4. Izoh: "Bugungi savdo"
5. Tasdiqlash

Natija:
✅ Kassir balansi: -$3,000 = $2,000
✅ Admin kirimlar tarixida ko'rinadi
✅ Kassir "Berilgan kirim": +$3,000
```

---

## 📱 MOBILE RESPONSIVE

Barcha sahifalar mobil qurilmalarda to'liq ishlaydi:
```
✅ Responsive grid
✅ Touch-friendly buttons
✅ Adaptive font sizes
✅ Mobile navigation
✅ Swipe gestures
✅ Optimized images
```

---

## 🎯 ADMIN VS KASSIR

### O'xshashliklar
```
✅ Dashboard
✅ Mijozlar boshqaruvi
✅ Savdo qo'shish
✅ To'lov qabul qilish
✅ Hisobotlar
✅ Tarix
```

### Farqlar
```
Admin:
✅ Barcha kassirlarni ko'radi
✅ Barcha filiallarni ko'radi
✅ Mahsulot qo'shadi/tahrirlaydi
✅ Kassirlar boshqaruvi
✅ Tizim sozlamalari
✅ Backup va export

Kassir:
✅ Faqat o'z savdolarini ko'radi
✅ Faqat o'z filialini ko'radi
❌ Mahsulot qo'sha/tahrirlash yo'q
❌ Kassirlar boshqaruvi yo'q
❌ Tizim sozlamalari yo'q
✅ Ombor: faqat ko'rish
```

---

## 🚀 KELAJAK REJALAR

### Version 2.0
```
🔄 Smena tizimi
🔄 Barcode scanner
🔄 Chek printer
🔄 Offline mode
🔄 Push notifications
🔄 Telegram integratsiya
```

### Version 3.0
```
🔄 Mobile app
🔄 Biometric login
🔄 Voice commands
🔄 AI recommendations
🔄 Advanced analytics
```

---

## ✅ TAYYOR FUNKSIYALAR

### ✅ Yaratilgan Sahifalar
1. cashier-dashboard.html + .js
2. cashier-sale.html + .js
3. cashier-customers.html + .js
4. cashier-customer-daftar.html (mavjud)
5. cashier-warehouse.html + .js
6. cashier-reports.html + .js
7. cashier-history.html + .js
8. cashier-login.html (yangilandi)

### ✅ Funksiyalar
- Dual Currency (USD + UZS)
- Real-time search
- IMEI/Barcode qidirish
- Avtomatik hisoblash
- Kirim berish
- Hisobotlar
- Tarix
- Responsive dizayn
- Professional UI/UX

---

## 📞 YORDAM

### Muammolar
```
1. Login muammosi
   → Username/parol tekshiring
   → Admin bilan bog'laning

2. Savdo saqlanmayapti
   → Internet ulanishini tekshiring
   → Barcha maydonlarni to'ldiring
   → Omborni tekshiring

3. Mahsulot topilmayapti
   → IMEI/Barcode to'g'riligini tekshiring
   → Omborda mavjudligini tekshiring
```

### Qo'llab-quvvatlash
```
📧 Email: support@dokonpro.uz
📱 Telegram: @dokonpro_support
🌐 Website: https://dokonpro.uz
```

---

## 🎉 XULOSA

Kassir tizimi to'liq tayyor va ishga tushirishga tayyor!

**Yaratilgan:**
- 8 ta HTML sahifa
- 7 ta JavaScript fayl
- To'liq funksional tizim
- Professional dizayn
- Mobile responsive
- Dual currency
- Real-time updates

**Muvaffaqiyatlar! 🚀**

---

**Versiya:** 3.0 Complete
**Sana:** 2026-02-14
**Status:** ✅ Tayyor va Ishga Tushirildi

