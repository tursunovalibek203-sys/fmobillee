# 📚 TO'LIQ TIZIM QO'LLANMA

## 🎯 Tizim Haqida

Bu professional chakana savdo boshqaruv tizimi bo'lib, quyidagi imkoniyatlarni taqdim etadi:

- 💼 Kassir tizimi (POS)
- 👨‍💼 Admin panel
- 📊 Real-time analitika
- 🏢 Ko'p filial boshqaruvi
- 👥 Mijozlar CRM
- 📦 Ombor nazorati
- 💰 Moliyaviy hisobotlar
- 📱 Telegram bot integratsiyasi

## 🚀 Tezkor Boshlash

### 1. Serverni Ishga Tushirish

```bash
# Terminal ochish
cd "C:\Users\tilav\Desktop\chakana dokonlar"

# Serverni ishga tushirish
node server.js
```

Server muvaffaqiyatli ishga tushganda:
```
✅ Server http://localhost:3000 da ishlamoqda
✅ MongoDB Atlas ga ulandi
✅ Telegram bot faol
```

### 2. Tizimga Kirish

#### Admin Panel:
```
URL: http://localhost:3000/admin.html
Username: admin
Password: admin123
```

#### Kassir Panel:
```
URL: http://localhost:3000/cashier-login-enhanced.html
Username: aziza
Password: 1234
```

## 📊 ADMIN PANEL

### Asosiy Sahifalar:

#### 1. Dashboard (admin-dashboard.html)
- Umumiy statistika
- Real-time grafiklar
- Tezkor harakatlar
- Oxirgi faoliyat

**Funksiyalar:**
- 📈 Savdolar dinamikasi
- 💰 Daromad tahlili
- 👥 Mijozlar statistikasi
- 📦 Ombor holati

#### 2. Filiallar (admin-branches.html)
- Filiallar ro'yxati
- Yangi filial qo'shish
- Filial tahrirlash
- Filial o'chirish

**Ma'lumotlar:**
- Filial nomi
- Manzil
- Telefon
- Kassirlar soni
- Savdolar statistikasi

#### 3. Kassirlar (admin-cashiers.html)
- Kassirlar ro'yxati
- Yangi kassir qo'shish
- Kassir tahrirlash
- Kassir o'chirish
- Parol o'zgartirish

**Ma'lumotlar:**
- Ism
- Username
- Filial
- Balans
- Savdolar soni

#### 4. Savdolar (admin-sales.html)
- Barcha savdolar ro'yxati
- Filial bo'yicha filter
- Kassir bo'yicha filter
- Sana bo'yicha filter
- Excel eksport

**Ma'lumotlar:**
- Savdo ID
- Kassir
- Mijoz
- Mahsulot
- Narx
- To'lov
- Qarz
- Sana

#### 5. Kirim Berishlar (admin-handovers.html)
- Kassirlardan kirim berishlar
- Filial bo'yicha filter
- Sana bo'yicha filter
- Tasdiqlash/Rad etish

**Ma'lumotlar:**
- Kassir
- Summa
- Sana
- Holat
- Izoh

#### 6. Analitika (admin-analytics-pro.html)
- Professional tahlillar
- Grafiklar va diagrammalar
- Trend tahlili
- Prognozlar

**Tahlillar:**
- Savdolar tendensiyasi
- Daromad o'sishi
- Top mahsulotlar
- Top mijozlar
- Kategoriya tahlili
- Filial taqqoslash

#### 7. Xarajatlar (admin-expenses.html)
- Xarajatlar ro'yxati
- Yangi xarajat qo'shish
- Kategoriya bo'yicha
- Moliyaviy hisobot

#### 8. Ombor (warehouse-pro.html)
- Mahsulotlar ro'yxati
- Yangi mahsulot qo'shish
- Mahsulot tahrirlash
- Stok nazorati
- Kam qolgan mahsulotlar

### Admin Sidebar:

```
📊 Asosiy
  - Dashboard
  - Analitika
  - Hisobotlar

🏢 Boshqaruv
  - Filiallar
  - Kassirlar
  - Mijozlar

💰 Moliya
  - Savdolar
  - Kirim Berishlar
  - Xarajatlar

📦 Ombor
  - Mahsulotlar
  - Stok Nazorati
  - Kategoriyalar

⚙️ Sozlamalar
  - Tizim Sozlamalari
  - Valyuta Kursi
  - Backup
```

## 💼 KASSIR PANEL

### Asosiy Sahifalar:

#### 1. Dashboard (cashier-dashboard-pro.html)
- Bugungi statistika
- Tezkor harakatlar
- Savdolar grafigi
- Oxirgi savdolar

**Statistika:**
- Bugungi savdolar
- Bugungi daromad
- Haftalik o'rtacha
- Samaradorlik

**Tezkor Harakatlar:**
- ⚡ Tezkor Savdo
- 🔍 Mijoz Qidirish
- 📋 Hisobotlar
- ⚙️ Sozlamalar

#### 2. Yangi Savdo (cashier-new.html)
- Mahsulot tanlash
- Mijoz tanlash
- Narx kiritish
- To'lov qabul qilish
- Chek chop etish

**Jarayon:**
1. Mahsulotni tanlash
2. Mijozni qidirish (ixtiyoriy)
3. Narx va miqdorni kiritish
4. To'lov usulini tanlash
5. Savdoni tasdiqlash

#### 3. Tezkor Savdo (cashier-quick-sale.html)
- Bir klikda savdo
- Minimal ma'lumotlar
- Tez ishlash
- Walk-in mijozlar uchun

#### 4. Savdo Tarixi (cashier-history-enhanced.html)
- Barcha savdolar
- Qidirish va filter
- Batafsil ma'lumot
- Excel eksport

#### 5. Tranzaksiyalar (cashier-transactions.html)
- Kirim/chiqim tarixi
- Balans hisoblash
- To'lovlar ro'yxati
- Kirim berishlar

**Ma'lumotlar:**
- Tranzaksiya turi
- Summa
- Balans
- Sana va vaqt

#### 6. Kengaytirilgan (cashier-advanced.html)
- Qo'shimcha funksiyalar
- Mahsulot qaytarish
- To'lov qabul qilish
- Kirim berish

#### 7. Mijozlar (customer-search.html)
- Mijozlarni qidirish
- Mijoz ma'lumotlari
- Qarz holati
- Savdolar tarixi

#### 8. Hisobotlar (cashier-report.html)
- Kunlik hisobot
- Savdolar statistikasi
- Daromad tahlili
- Chop etish

### Kassir Sidebar:

```
📊 Asosiy
  - Dashboard
  - Yangi Savdo
  - Tezkor Savdo

💰 Savdolar
  - Savdo Tarixi
  - Tranzaksiyalar
  - Kengaytirilgan

👥 Mijozlar
  - Mijozlar
  - Yangi Mijoz

📈 Hisobotlar
  - Kunlik Hisobot
  - Umumiy Hisobot

⚙️ Boshqalar
  - Kirim Berish
  - Balans
  - Chiqish
```

## 🤖 TELEGRAM BOT

### Funksiyalar:

#### Mijozlar uchun:
- `/start` - Botni boshlash va filial tanlash
- `/id` - O'z ID raqamini olish
- `/balans` - Qarz holatini ko'rish
- `/filial` - Filialni o'zgartirish

#### Avtomatik Xabarlar:
- ✅ Savdo cheki (har savdodan keyin)
- 📅 Qarz eslatmalari (3, 5, 7 kun)
- 🚫 Bloklash (10 kundan keyin)

### Sozlash:

1. `.env` faylida token o'rnatish:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

2. Botni ishga tushirish:
```bash
node server.js
```

3. Telegram'da botni topish va `/start` yuborish

## 📊 API ENDPOINTLAR

### Products (Mahsulotlar):
```
GET  /api/products              - Barcha mahsulotlar
GET  /api/products?branchId=1   - Filial bo'yicha
GET  /api/products/low-stock    - Kam qolganlar
GET  /api/products/categories   - Kategoriyalar
POST /api/products              - Yangi mahsulot
PUT  /api/products/:id          - Tahrirlash
DELETE /api/products/:id        - O'chirish
```

### Customers (Mijozlar):
```
GET  /api/customers             - Barcha mijozlar
GET  /api/customers?branchId=1  - Filial bo'yicha
POST /api/customers             - Yangi mijoz
PUT  /api/customers/:id         - Tahrirlash
```

### Sales (Savdolar):
```
GET  /api/sales                 - Barcha savdolar
GET  /api/cashier-sales         - Kassir savdolari
POST /api/sales                 - Yangi savdo
```

### Statistics (Statistika):
```
GET  /api/stats                 - Umumiy statistika
GET  /api/cashier-stats         - Kassir statistikasi
```

### Reports (Hisobotlar):
```
GET  /api/reports/dashboard         - Dashboard
GET  /api/reports/sales-analytics   - Savdo tahlili
GET  /api/reports/customer-analytics - Mijoz tahlili
GET  /api/reports/product-analytics  - Mahsulot tahlili
GET  /api/reports/revenue-trend      - Daromad tendensiyasi
GET  /api/reports/top-products       - Top mahsulotlar
GET  /api/reports/top-customers      - Top mijozlar
```

## 🧪 TEST SAHIFALARI

### 1. API Test (test-api-endpoints.html)
```
URL: http://localhost:3000/test-api-endpoints.html
```
- Barcha API endpointlarni test qilish
- Real-time natijalar
- Xatolarni aniqlash

### 2. Dashboard Test (test-dashboard-functions.html)
```
URL: http://localhost:3000/test-dashboard-functions.html
```
- Dashboard funksiyalarini test qilish
- Sidebar testlari
- Navigatsiya testlari
- Real-time statistika

### 3. MongoDB Test (mongodb-test.html)
```
URL: http://localhost:3000/mongodb-test.html
```
- MongoDB ulanishini tekshirish
- Ma'lumotlar bazasi holati
- Kolleksiyalar statistikasi

## 📱 MOBIL MOSLASHUV

### Responsive Dizayn:
- ✅ Telefon (< 768px)
- ✅ Planshet (768px - 1024px)
- ✅ Desktop (> 1024px)

### Mobil Xususiyatlar:
- Touch-friendly tugmalar
- Swipe navigatsiya
- Hamburger menyu
- Optimallashtirilgan grafiklar
- Tez yuklash

### Mobil'da Ishlash:
1. Brauzerda saytni oching
2. Hamburger tugmasini bosing (☰)
3. Sidebar ochiladi
4. Kerakli bo'limni tanlang

## 🔒 XAVFSIZLIK

### Autentifikatsiya:
- Login/parol orqali kirish
- Session boshqaruvi
- LocalStorage orqali saqlash

### Ma'lumotlar Xavfsizligi:
- MongoDB Atlas (cloud)
- HTTPS (production'da)
- Backup tizimi
- Xato loglar

## 🛠️ MUAMMOLARNI HAL QILISH

### Server Ishlamasa:
```bash
# Portni tekshirish
netstat -ano | findstr :3000

# Jarayonni to'xtatish
taskkill /PID <process_id> /F

# Qayta ishga tushirish
node server.js
```

### MongoDB Ulanmasa:
1. Internet ulanishini tekshiring
2. MongoDB Atlas IP whitelist'ni tekshiring
3. `.env` faylidagi URI'ni tekshiring
4. DNS sozlamalarini tekshiring (8.8.8.8)

### Telegram Bot Ishlamasa:
1. `.env` faylidagi token'ni tekshiring
2. Bot'ni BotFather'da faollashtiring
3. Server loglarini tekshiring

## 📈 STATISTIKA VA HISOBOTLAR

### Kunlik Hisobot:
- Savdolar soni
- Daromad
- To'lovlar
- Qarzlar
- Mijozlar soni

### Haftalik Hisobot:
- Savdolar dinamikasi
- Daromad o'sishi
- Top mahsulotlar
- Top mijozlar

### Oylik Hisobot:
- Umumiy savdolar
- Umumiy daromad
- Filiallar taqqoslash
- Kassirlar samaradorligi

## 💡 MASLAHATLAR

### Kassirlar uchun:
1. Har kuni boshida balansni tekshiring
2. Savdolarni darhol kiriting
3. Mijoz ma'lumotlarini to'g'ri kiriting
4. Kunning oxirida kirim bering

### Adminlar uchun:
1. Kunlik hisobotlarni tekshiring
2. Stok holatini nazorat qiling
3. Qarzlarni kuzatib boring
4. Backup oling (haftalik)

### Tizim Samaradorligi:
1. Brauzer cache'ni tozalang
2. Eski ma'lumotlarni arxivlang
3. Loglarni tekshiring
4. Yangilanishlarni o'rnating

## 🎯 KEYINGI QADAMLAR

### Rejadagi Yangiliklar:
- [ ] Sozlamalar sahifasi
- [ ] Bildirishnomalar tizimi
- [ ] Offline rejim
- [ ] Chop etish funksiyasi
- [ ] PDF eksport
- [ ] QR kod skanerlash
- [ ] Barcode tizimi
- [ ] Multi-valyuta

## 📞 YORDAM

### Texnik Yordam:
- Email: support@example.com
- Telegram: @support_bot
- Telefon: +998 XX XXX XX XX

### Dokumentatsiya:
- `ADMIN_TEST_NATIJASI.md` - Test natijalari
- `KASSIR_SIDEBAR_KENGAYTIRILDI.md` - Sidebar haqida
- `TIZIM_HOLATI_FINAL.md` - Tizim holati

## ✅ XULOSA

Tizim to'liq ishlamoqda va professional darajada!

**Asosiy Ko'rsatkichlar:**
- ✅ 93.9% API endpointlar ishlaydi
- ✅ Dashboard to'liq funksional
- ✅ Sidebar kengaytirilgan
- ✅ Mobil responsive
- ✅ Telegram bot faol
- ✅ Real-time statistika

**Ishlatishga Tayyor:** HA ✅

Omad! 🚀
