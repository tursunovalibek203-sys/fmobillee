# 💼 Professional Kassir Tizimi - To'liq Qo'llanma

## 📋 Umumiy Ma'lumot

Professional kassir tizimi dual-currency (ikki valyuta) qo'llab-quvvatlash, to'liq hisobotlar va mijozlar daftari bilan jihozlangan.

---

## ✅ Asosiy Xususiyatlar

### 1. 💱 Dual Currency System (Ikki Valyuta)

#### To'lov Qabul Qilish
```
💵 Dollar Input
- Mijoz bergan dollar miqdori
- To'g'ridan-to'g'ri kiritiladi

💰 So'm Input  
- Mijoz bergan so'm miqdori
- Avtomatik dollarga konvertatsiya qilinadi

📊 Avtomatik Hisoblash
- So'm → Dollar (valyuta kursi bo'yicha)
- Jami to'lov USD da ko'rsatiladi
- Real-time yangilanish
```

#### Valyuta Kursi
```
💱 O'zgartirilishi mumkin
- Default: 1 USD = 12,500 UZS
- Kassir o'zi o'zgartirishi mumkin
- LocalStorage da saqlanadi
```

---

### 2. 📊 To'liq Hisobotlar

#### Bugungi Hisobot
```
💵 Bugungi Dollar
- Faqat dollar to'lovlar

💰 Bugungi So'm
- Faqat so'm to'lovlar
- Dollar ekvivalenti

📊 Bugungi Jami
- Umumiy to'lov (USD)
- Savdolar soni
```

#### Davr Hisobotlari
```
📅 Haftalik
- Oxirgi 7 kun
- Jami summa
- Savdolar soni

📅 Oylik
- Oxirgi 30 kun
- Jami summa
- Savdolar soni
```

#### Batafsil Savdolar
```
✅ Har bir savdo:
- Mijoz nomi
- Mahsulot
- Dollar to'lov
- So'm to'lov
- Jami summa
- Vaqt
```

---

### 3. 📖 Mijozlar Daftari

#### Asosiy Funksiyalar
```
🔍 Qidiruv
- Ism bo'yicha
- ID bo'yicha
- Telefon bo'yicha

👥 Mijozlar Ro'yxati
- Barcha mijozlar
- Qarz miqdori
- Qarz kunlari
- Telefon raqami
```

#### Mijoz Tafsilotlari
```
📊 Statistika:
- Jami xaridlar soni
- Jami to'lovlar soni
- Jami xarid summasi
- Jami to'lov summasi
- Qarz miqdori

📋 Savdo Tarixi:
- Barcha savdolar
- Barcha to'lovlar
- Sana va vaqt
- Summa tafsilotlari
```

---

### 4. 🏭 Ombor (Faqat Ko'rish)

#### Ko'rish Imkoniyatlari
```
✅ Mahsulotlar ro'yxati
✅ Narxlar
✅ Ombordagi miqdor
✅ Kategoriyalar
✅ Status (Kam/Yetarli)

❌ Tahrirlash mumkin emas
❌ Qo'shish mumkin emas
❌ O'chirish mumkin emas
```

#### Qidiruv
```
🔍 Mahsulot nomi
🔍 ID
🔍 Kategoriya
```

---

### 5. 💰 Balans Tracking

#### Kassadagi Balans
```
💵 Dollar Balans
- Faqat dollar to'lovlar

💰 So'm Balans
- Faqat so'm to'lovlar
- Dollar ekvivalenti

📊 Jami Balans
- Umumiy balans (USD)
```

---

## 🎯 Foydalanish Tartibi

### 1. Login
```
1. cashier-login.html ga kirish
2. Username va parol kiritish
3. Kassir panelga o'tish
```

### 2. Savdo Qilish
```
1. Mijozni tanlash (qidiruv orqali)
2. Mahsulot nomini kiritish
3. Narxni kiritish (USD)
4. To'lovni kiritish:
   - Dollar miqdori
   - So'm miqdori
   - Yoki ikkalasi
5. Savdoni saqlash
```

### 3. Hisobotlarni Ko'rish
```
1. "📊 Hisobotlar" tugmasini bosish
2. Bugungi statistikani ko'rish
3. Haftalik/Oylik hisobotlarni ko'rish
4. Batafsil savdolarni ko'rish
```

### 4. Mijozlar Daftari
```
1. "📖 Mijozlar Daftari" tugmasini bosish
2. Mijozni qidirish
3. Mijozga bosish
4. Tafsilotlarni ko'rish:
   - Statistika
   - Savdo tarixi
   - Qarz ma'lumotlari
```

### 5. Ombor Ko'rish
```
1. "🏭 Ombor" tugmasini bosish
2. Mahsulotlar ro'yxatini ko'rish
3. Qidiruv orqali topish
4. Narx va miqdorni ko'rish
```

---

## 🔧 Texnik Tafsilotlar

### Database Schema

#### CashierSchema
```javascript
{
  cashierId: Number,
  branchId: Number,
  name: String,
  username: String,
  password: String,
  balanceUSD: Number,      // Dollar balans
  balanceUZS: Number,      // So'm balans
  balance: Number,         // Jami (USD)
  totalSales: Number,
  totalSalesAmount: Number,
  totalHandedOver: Number,
  totalHandovers: Number
}
```

#### CashierSaleSchema
```javascript
{
  saleId: Number,
  branchId: Number,
  cashierId: Number,
  customerId: Number,
  product: String,
  price: Number,           // Narx (USD)
  paid: Number,            // Jami to'lov (USD)
  paidUSD: Number,         // Dollar to'lov
  paidUZS: Number,         // So'm to'lov
  exchangeRate: Number,    // Valyuta kursi
  date: String,
  time: String
}
```

---

## 📱 API Endpoints

### Kassir APIs
```
POST   /api/cashier-login          # Login
GET    /api/cashiers/:id           # Kassir ma'lumotlari
POST   /api/cashier-sales          # Savdo qo'shish
GET    /api/cashier-sales          # Savdolar ro'yxati
POST   /api/cashier-handover       # Kirim berish
```

### Mijozlar APIs
```
GET    /api/customers              # Barcha mijozlar
GET    /api/customers/search/:id   # Mijoz qidirish
```

### Mahsulotlar APIs
```
GET    /api/products               # Barcha mahsulotlar
GET    /api/products/search/:query # Mahsulot qidirish
```

---

## 🎨 UI/UX Xususiyatlari

### Dizayn
```
✅ Modern gradient dizayn
✅ Professional color scheme
✅ Smooth animations
✅ Responsive layout
✅ Mobile-friendly
```

### Interaktivlik
```
✅ Real-time hisoblash
✅ Instant search
✅ Modal windows
✅ Notifications
✅ Hover effects
```

---

## 🔒 Xavfsizlik

### Ruxsatlar
```
✅ Faqat o'z savdolarini ko'radi
✅ Ombor: faqat ko'rish
✅ Mahsulot: tahrirlash yo'q
✅ Narx: o'zgartirish yo'q
```

### Autentifikatsiya
```
✅ Login required
✅ Session management
✅ Logout funksiyasi
```

---

## 📊 Hisobotlar Tafsiloti

### Bugungi Hisobot
```javascript
{
  todayUSD: 0,           // Bugungi dollar
  todayUZS: 0,           // Bugungi so'm
  todayTotal: 0,         // Jami (USD)
  todaySales: []         // Savdolar ro'yxati
}
```

### Davr Hisoboti
```javascript
{
  weeklyTotal: 0,        // Haftalik jami
  weeklySales: [],       // Haftalik savdolar
  monthlyTotal: 0,       // Oylik jami
  monthlySales: []       // Oylik savdolar
}
```

---

## 🚀 Yangilanishlar

### Version 2.0.0
```
✅ Dual currency system
✅ To'liq hisobotlar
✅ Mijozlar daftari
✅ Ombor ko'rish
✅ Professional UI
✅ Real-time updates
✅ Search functionality
✅ Modal windows
```

---

## 📞 Yordam

### Muammolar
```
1. Login muammosi
   - Username/parol tekshiring
   - Admin bilan bog'laning

2. Savdo saqlanmayapti
   - Internet ulanishini tekshiring
   - Barcha maydonlarni to'ldiring

3. Hisobotlar ko'rinmayapti
   - Sahifani yangilang
   - Cache ni tozalang
```

### Qo'llab-quvvatlash
```
📧 Email: support@dokonpro.uz
📱 Telegram: @dokonpro_support
🌐 Website: https://dokonpro.uz
```

---

## 🎯 Best Practices

### Kassir uchun
```
1. Har kuni login qiling
2. Savdolarni darhol kiriting
3. To'lovni to'g'ri kiriting
4. Valyuta kursini yangilang
5. Hisobotlarni tekshiring
6. Mijozlar daftarini ishlating
```

### Xavfsizlik
```
1. Parolni saqlab qo'ying
2. Logout qilishni unutmang
3. Kompyuterni qulflab qo'ying
4. Ma'lumotlarni tekshiring
```

---

Made with ❤️ by Professional Developers
