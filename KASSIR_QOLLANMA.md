# 👥 KASSIR TIZIMI - TO'LIQ QOLLANMA

## ✅ NIMA QO'SHILDI?

### 1. Kassir Tizimi
- 👥 Kassirlar boshqaruvi (admin panel)
- 🔐 Kassir login/parol
- 💰 Kassir balans va savdolar
- 📊 Kassir statistikasi
- 💵 Kirim berish tizimi

### 2. Sahifalar
- `/cashier-login.html` - Kassir kirish
- `/cashier.html` - Kassir ish sahifasi
- `/admin-cashiers.html` - Admin kassirlar boshqaruvi

### 3. API Endpointlari
```
GET  /api/cashiers                    - Barcha kassirlar
POST /api/cashiers                    - Yangi kassir qo'shish
POST /api/cashier-login               - Kassir kirish
GET  /api/cashier-sales/:id           - Kassir savdolari
POST /api/cashier-sales               - Kassir savdo qo'shish
POST /api/cashier-handover            - Kirim berish
GET  /api/cashier-handovers/:id       - Kassir kirimlari
GET  /api/all-cashier-sales           - Barcha kassirlar savdosi
GET  /api/all-handovers               - Barcha kirimlar
GET  /api/cashier-stats/:id           - Kassir statistikasi
PUT  /api/cashiers/:id                - Kassirni tahrirlash
DELETE /api/cashiers/:id              - Kassirni o'chirish
```

## 🚀 ISHGA TUSHIRISH

### 1. Serverni Ishga Tushirish

```bash
npm start
```

### 2. Admin Panelga Kirish

```
http://localhost:3000/admin.html
```

### 3. Kassir Qo'shish

1. Admin panelda "👥 Kassirlar" tugmasini bosing
2. "+" tugmasini bosing
3. Ma'lumotlarni kiriting:
   - Ism: Alisher
   - Login: alisher
   - Parol: 1234
   - Telefon: +998901234567
4. "Saqlash" tugmasini bosing

### 4. Kassir Kirish

```
http://localhost:3000/cashier-login.html
```

Login: alisher
Parol: 1234

## 📝 FOYDALANISH

### ADMIN UCHUN

#### 1. Kassir Qo'shish

1. Admin panel → Kassirlar
2. "+" tugmasi
3. Ism, login, parol kiriting
4. Saqlash

#### 2. Kassir Savdolarini Ko'rish

1. Kassirlar ro'yxatida kassir kartasini bosing
2. "👁️ Ko'rish" tugmasini bosing
3. Barcha savdolar va kirimlar ko'rinadi

#### 3. Kassir Tahrirlash

1. "✏️ Tahrirlash" tugmasini bosing
2. Ma'lumotlarni o'zgartiring
3. Saqlash

#### 4. Kassir O'chirish

1. "🗑️ O'chirish" tugmasini bosing
2. Tasdiqlang

### KASSIR UCHUN

#### 1. Kirish

1. `/cashier-login.html` ga kiring
2. Login va parolni kiriting
3. "Kirish" tugmasini bosing

#### 2. Mijozga Savdo Qilish

1. Mijozni tanlang
2. IMEI/Barcode kiriting (ombor integratsiyasi)
3. Mahsulot avtomatik topiladi
4. Berilgan pulni kiriting
5. "Savdo qo'shish" tugmasini bosing

**Avtomatik:**
- ✅ Savdo saqlanadi
- ✅ Kassir balansiga qo'shiladi
- ✅ Ombordan chiqariladi
- ✅ Asosiy savdolar jadvaliga qo'shiladi

#### 3. Kirim Berish

1. "💰 Kirim berish" tugmasini bosing
2. Miqdorni kiriting
3. Izoh yozing (ixtiyoriy)
4. "Kirim berish" tugmasini bosing

**Natija:**
- Kassir balansidan ayriladi
- Admin kirimlar tarixida ko'rinadi
- Kassir "Berilgan kirim" statistikasi yangilanadi

## 💡 ASOSIY XUSUSIYATLAR

### 1. Kassir Balansi

Har bir kassir uchun:
- 💰 Kassadagi pul (joriy balans)
- 📊 Jami savdo (barcha vaqt)
- ✅ Berilgan kirim (adminga berilgan)

### 2. Avtomatik Hisob-kitob

Savdo qo'shilganda:
```
Kassir balansi += Berilgan pul
Kassir jami savdo += Savdo narxi
```

Kirim berilganda:
```
Kassir balansi -= Kirim miqdori
Kassir berilgan kirim += Kirim miqdori
```

### 3. Statistika

**Admin uchun:**
- Jami kassirlar
- Jami balans (barcha kassirlar)
- Bugungi savdo (barcha kassirlar)
- Berilgan kirim (barcha kassirlar)

**Kassir uchun:**
- Kassadagi pul
- Bugungi savdo
- Jami savdo
- Berilgan kirim

### 4. Xavfsizlik

- Har bir kassir o'z login/paroli bilan kiradi
- Kassir faqat o'z savdolarini ko'radi
- Admin barcha kassirlar savdosini ko'radi
- Parollar database da saqlanadi (production da hash qilish kerak)

## 🎯 STSENARIYLAR

### Stsenariy 1: Yangi Kassir Qo'shish

```
Admin:
1. Admin panel → Kassirlar
2. + tugmasi
3. Ism: Alisher, Login: alisher, Parol: 1234
4. Saqlash

Kassir:
1. /cashier-login.html
2. Login: alisher, Parol: 1234
3. Kirish
```

### Stsenariy 2: Kassir Savdo Qiladi

```
Kassir:
1. Mijoz: Aziz
2. IMEI: 123456789012
3. Mahsulot: iPhone 14 Pro (avtomatik)
4. Narx: 12,000,000 so'm (avtomatik)
5. Berilgan: 7,000,000 so'm
6. Savdo qo'shish

Natija:
- Kassir balansi: +7,000,000 so'm
- Ombor: -1 dona
- Mijoz qarzi: 5,000,000 so'm
```

### Stsenariy 3: Kassir Kirim Beradi

```
Kassir:
1. Kirim berish tugmasi
2. Miqdor: 10,000,000 so'm
3. Izoh: "Bugungi savdo"
4. Kirim berish

Natija:
- Kassir balansi: -10,000,000 so'm
- Admin kirimlar tarixida ko'rinadi
- Kassir "Berilgan kirim": +10,000,000 so'm
```

### Stsenariy 4: Admin Kassir Savdolarini Ko'radi

```
Admin:
1. Admin panel → Kassirlar
2. Alisher kartasini bosish
3. "Ko'rish" tugmasi

Ko'rinadi:
- Asosiy ma'lumotlar (ID, login, telefon)
- Moliyaviy ma'lumotlar (balans, jami savdo, berilgan)
- Savdolar ro'yxati (10 ta oxirgi)
- Kirimlar ro'yxati (10 ta oxirgi)
```

## 📊 DATABASE SCHEMA

### Cashier

```javascript
{
  cashierId: Number,
  name: String,
  username: String,
  password: String,
  phone: String,
  role: 'cashier',
  isActive: Boolean,
  balance: Number,
  totalSales: Number,
  totalHandedOver: Number,
  createdAt: Date,
  lastLogin: Date
}
```

### CashierSale

```javascript
{
  saleId: Number,
  cashierId: Number,
  cashierName: String,
  customerId: Number,
  customerName: String,
  product: String,
  price: Number,
  paid: Number,
  type: 'sale',
  date: String,
  time: String,
  createdAt: Date
}
```

### CashierHandover

```javascript
{
  handoverId: Number,
  cashierId: Number,
  cashierName: String,
  amount: Number,
  balanceBefore: Number,
  balanceAfter: Number,
  notes: String,
  date: String,
  time: String,
  createdAt: Date
}
```

## ⚠️ MUHIM ESLATMALAR

1. **Parol xavfsizligi** - Production da parollarni hash qiling (bcrypt)
2. **Session boshqaruvi** - JWT token ishlatish tavsiya etiladi
3. **Ruxsatlar** - Kassir faqat o'z ma'lumotlarini ko'rishi kerak
4. **Backup** - Kassir ma'lumotlarini muntazam backup oling
5. **Audit log** - Barcha harakatlarni loglang

## 🔧 KELAJAKDA QO'SHISH MUMKIN

1. **Smena tizimi** - Kassir smenasini ochish/yopish
2. **Kassa hisoboti** - Smena oxirida avtomatik hisobot
3. **Ruxsatlar tizimi** - Har xil ruxsatlar (ko'rish, tahrirlash, o'chirish)
4. **Kassir KPI** - Kassir samaradorligi statistikasi
5. **Telegram integratsiya** - Kassir kirim berganda admin ga xabar
6. **Barcode scanner** - Mahsulot qidirish uchun
7. **Chek printer** - Savdo chekini chop etish

## 📱 MOBIL VERSIYA

Barcha sahifalar mobil qurilmalarda to'liq ishlaydi:
- Responsive dizayn
- Touch-friendly
- Tez yuklash

## 🔐 XAVFSIZLIK

- Login/parol autentifikatsiya
- Session boshqaruvi (localStorage)
- 24 soatdan keyin avtomatik chiqish
- Barcha harakatlar loglanadi

## 📞 YORDAM

Muammo bo'lsa:
1. Konsolni tekshiring (F12)
2. Server loglarini ko'ring
3. MongoDB ulanishini tekshiring

---

## ✅ TAYYOR!

Kassir tizimi to'liq ishga tushirildi va foydalanishga tayyor!

**Muvaffaqiyatlar! 🎉**
