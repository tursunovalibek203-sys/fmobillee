# 💰 YANGI KASSA TIZIMI - 2 VALYUTA ($ va So'm)

## 🎯 MAQSAD
Sizning talabingiz bo'yicha yangi kassa tizimi yaratildi:
- ✅ Asosiy balans $ da
- ✅ 2 ta input: Dollar va So'm
- ✅ Avtomatik konvertatsiya
- ✅ Kurs sozlamalarda
- ✅ Real-time hisoblash

---

## 📱 YANGI SAHIFA

**Fayl:** `public/cashier-dual-currency.html`

**URL:** `http://localhost:3000/cashier-dual-currency.html`

---

## 🎨 INTERFEYS XUSUSIYATLARI

### Balans Kartochkalari (3 ta):
1. **💵 Dollar Balansi** - Asosiy valyuta
2. **🇺🇿 So'm Balansi** - So'm miqdori + USD ekvivalenti
3. **💰 Jami Balans** - Umumiy USD ekvivalenti

### Kurs Ko'rsatkichi:
- **Joriy Kurs:** 1 USD = 12,500 UZS (sozlanadi)
- **Kursni O'zgartirish** tugmasi

### To'lov Bo'limi:
- **2 ta input:** Dollar va So'm
- **Avtomatik konvertatsiya:** Birini kiritganda ikkinchisi avtomatik hisoblanadi
- **Jami to'lov:** USD da ko'rsatiladi

---

## ⚙️ KURS SOZLAMALARI

### Kursni O'zgartirish:
1. **"⚙️ Sozlamalar"** tugmasini bosing
2. **USD/UZS Kursi** ni kiriting (masalan: 12500)
3. **"✅ Saqlash"** tugmasini bosing

### Kurs Saqlash:
- ✅ Server bazasida saqlanadi (MongoDB)
- ✅ LocalStorage da backup
- ✅ Barcha kassirlar uchun bir xil kurs
- ✅ Real-time yangilanish

---

## 💰 QANDAY ISHLAYDI?

### 1️⃣ Avtomatik Konvertatsiya

**Dollar kiritilganda:**
```
Dollar input: $100
So'm input: 1,250,000 so'm (avtomatik)
Jami to'lov: $100.00
```

**So'm kiritilganda:**
```
So'm input: 2,500,000 so'm
Dollar input: $200.00 (avtomatik)
Jami to'lov: $200.00
```

**Ikkalasi kiritilganda:**
```
Dollar input: $100
So'm input: 1,250,000 so'm
Jami to'lov: $200.00 (100 + 100)
```

### 2️⃣ Balans Yangilanishi

**Savdo qilinganda:**
- Dollar balansi: +$100
- So'm balansi: +1,250,000 so'm
- Jami balans: Avtomatik hisoblash

**Kirim topshirilganda:**
- Faqat USD da topshiriladi
- Balansdan kamayadi

---

## 🔧 BACKEND API

### Yangi Endpointlar:

#### Kursni Olish:
```
GET /api/exchange-rate
Response: { success: true, exchangeRate: 12500 }
```

#### Kursni Saqlash:
```
POST /api/exchange-rate
Body: { exchangeRate: 12500 }
Response: { success: true, exchangeRate: 12500 }
```

### MongoDB Schema Yangilanishi:
```javascript
const SettingsSchema = new mongoose.Schema({
  // ... boshqa maydonlar
  exchangeRate: { type: Number, default: 12500 } // YANGI!
});
```

---

## 📊 SAVDO JARAYONI

### Qadam 1: Mijoz Ma'lumotlari
```
Mijoz ID: 1001
Mijoz Ismi: Vali Toshmatov
```

### Qadam 2: Mahsulot Ma'lumotlari
```
Mahsulot: iPhone 15 Pro Max
Narx (USD): $1200
```

### Qadam 3: To'lov (2 ta variant)

**Variant A - Faqat Dollar:**
```
Dollar: $1200
So'm: 0 (yoki avtomatik 15,000,000)
Jami: $1200
```

**Variant B - Faqat So'm:**
```
Dollar: 0 (yoki avtomatik $1200)
So'm: 15,000,000
Jami: $1200
```

**Variant C - Aralash:**
```
Dollar: $600
So'm: 7,500,000 (= $600)
Jami: $1200
```

### Qadam 4: Savdo Qilish
- **"💰 Savdo Qilish"** tugmasini bosing
- ✅ MongoDB ga saqlanadi
- ✅ Excel ga yoziladi
- ✅ Balans yangilanadi

---

## 💸 KIRIM TOPSHIRISH

### Jarayon:
1. **Topshiriladigan Miqdor (USD)** ni kiriting
2. **Izoh** qo'shing (ixtiyoriy)
3. **"📤 Kirim Topshirish"** tugmasini bosing

### Natija:
- ✅ Balansdan kamayadi (USD da)
- ✅ MongoDB ga saqlanadi
- ✅ Excel ga yoziladi
- ✅ Admin ko'radi

---

## 📈 STATISTIKA

### Bugungi Natijalar:
- **Savdolar** - Bugungi savdolar soni
- **Daromad** - Bugungi jami daromad (USD)
- **Kirimlar** - Bugungi kirimlar soni
- **Topshirilgan** - Bugungi topshirilgan summa (USD)

### Real-time Yangilanish:
- Har 30 sekundda avtomatik yangilanadi
- Balans, statistika, kurs

---

## 🎯 AFZALLIKLARI

### Foydalanuvchi Uchun:
- ✅ **Oddiy interfeys** - Faqat 2 ta input
- ✅ **Avtomatik hisoblash** - Konvertatsiya avtomatik
- ✅ **Aniq ko'rsatish** - Jami to'lov aniq ko'rinadi
- ✅ **Tez ishlash** - Bir klik bilan savdo

### Admin Uchun:
- ✅ **Kurs nazorati** - Kursni istalgan vaqtda o'zgartirish
- ✅ **Markazlashgan** - Barcha kassirlar uchun bir xil kurs
- ✅ **Hisobot** - Barcha to'lovlar USD da
- ✅ **Excel integratsiya** - Avtomatik yozish

### Texnik:
- ✅ **Server-based** - Kurs serverda saqlanadi
- ✅ **Fallback** - LocalStorage backup
- ✅ **Real-time** - Darhol yangilanish
- ✅ **Responsive** - Mobil qurilmalarda ishlaydi

---

## 🔄 ESKI TIZIM BILAN TAQQOSLASH

| Xususiyat | Eski (3 Valyuta) | Yangi (2 Valyuta) |
|-----------|------------------|-------------------|
| Valyutalar | USD, UZS, RUB | USD, UZS |
| Input soni | 1 ta (dropdown) | 2 ta (parallel) |
| Konvertatsiya | Manual tanlash | Avtomatik |
| Kurs sozlash | Hardcode | Sozlamalarda |
| Balans | 3 ta alohida | 2 ta + jami |
| Foydalanish | Murakkab | Oddiy |

---

## 🚀 QANDAY ISHLATISH

### 1. Serverni Ishga Tushiring:
```bash
node server.js
```

### 2. Yangi Kassani Oching:
```
http://localhost:3000/cashier-dual-currency.html
```

### 3. Login Qiling:
```
Login: [kassir_login]
Parol: [kassir_parol]
```

### 4. Kursni Sozlang (Agar Kerak):
```
Sozlamalar → USD/UZS Kursi → 12500 → Saqlash
```

### 5. Savdo Qiling:
```
Mijoz: Vali Toshmatov
Mahsulot: iPhone 15
Narx: $1000
To'lov: $500 + 6,250,000 so'm
Savdo Qilish
```

---

## 💡 MASLAHATLAR

### Kassir Uchun:
1. ✅ **Kursni tekshiring** - Har kuni kursni ko'ring
2. ✅ **Ikkalasini kiriting** - Dollar va so'm ni birga kiriting
3. ✅ **Jami to'lovni tekshiring** - Narx bilan solishtiring
4. ✅ **Balansni kuzating** - Muntazam tekshiring

### Admin Uchun:
1. ✅ **Kursni yangilang** - Bozor kursiga moslang
2. ✅ **Kassirlarni o'rgating** - Yangi tizimni tushuntiring
3. ✅ **Hisobotni tekshiring** - Barcha to'lovlar USD da
4. ✅ **Excel ni nazorat qiling** - Avtomatik yozilishini tekshiring

---

## 🆘 MUAMMOLARNI YECHISH

### Avtomatik Konvertatsiya Ishlamayapti
**Sabab:** JavaScript xatosi
**Yechim:** Sahifani yangilang (F5)

### Kurs Saqlanmayapti
**Sabab:** Server bilan aloqa yo'q
**Yechim:** Serverni tekshiring

### Balans Yangilanmayapti
**Sabab:** API xatosi
**Yechim:** Login qilib qayta kirish

### Jami To'lov Noto'g'ri
**Sabab:** Kurs noto'g'ri
**Yechim:** Kursni to'g'ri sozlang

---

## 🎉 XULOSA

Yangi kassa tizimi sizning barcha talablaringizni qondiradi:

✅ **Asosiy balans $ da** - Barcha hisoblar USD da
✅ **2 ta input** - Dollar va So'm parallel
✅ **Avtomatik konvertatsiya** - Real-time hisoblash
✅ **Kurs sozlamalarda** - Admin tomonidan boshqariladi
✅ **Oddiy interfeys** - Foydalanish oson
✅ **Professional ko'rinish** - Chiroyli dizayn
✅ **Server integratsiya** - Barcha ma'lumotlar saqlanadi

**Yangi kassa tayyor! Ishlatishni boshlang!** 🚀

---

## 🔗 FOYDALI HAVOLALAR

- **Yangi Kassa:** http://localhost:3000/cashier-dual-currency.html
- **Eski Kassa:** http://localhost:3000/cashier-multi-currency.html
- **Admin Panel:** http://localhost:3000/admin-dashboard.html
- **Kassir Hisobot:** http://localhost:3000/cashier-report.html

---

**Omad! Yangi kassa tizimidan foydalaning!** 😊