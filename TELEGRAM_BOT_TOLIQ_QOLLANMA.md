# 🤖 TELEGRAM BOT TO'LIQ QOLLANMA

**Sana:** 2026-02-27  
**Versiya:** 2.0

---

## 📋 MUNDARIJA

1. [Avtomatik Eslatmalar](#avtomatik-eslatmalar)
2. [Chek Yuborish](#chek-yuborish)
3. [Savollarga Javob Berish](#savollarga-javob-berish)
4. [Sozlamalar](#sozlamalar)
5. [Qanday Ishlatish](#qanday-ishlatish)

---

## ⏰ AVTOMATIK ESLATMALAR

### Qarz Eslatmalari

Bot avtomatik ravishda qarzli mijozlarga eslatma yuboradi:

| Kun | Eslatma | Holat |
|-----|---------|-------|
| 3 kun | Birinchi eslatma | ⚠️ Ogohlantirish |
| 5 kun | Ikkinchi eslatma | ⚠️ Ogohlantirish |
| 7 kun | Uchinchi eslatma | 🔴 Jiddiy |
| 10 kun | Bloklash ogohlantirishi | 🚫 Oxirgi ogohlantirish |
| 10+ kun | Mijoz bloklangan | 🚫 Bloklangan |

### Eslatma Mazmuni

```
⚠️ QARZ ESLATMASI

👤 Mijoz: Aziz Tilavov
🆔 ID: 123456

📊 Jami qarz: $1,500.00
📆 Qarz kunlari: 5 kun

📋 Qarz tafsilotlari:
1. iPhone 15 Pro - $700.00 (25.02.2026)
2. Samsung Galaxy S24 - $800.00 (23.02.2026)

💰 Iltimos, qarzni tezroq to'lang!

📞 Yordam: +998901234567
```

### Bloklash Eslatmasi

```
🚫 SIZ BLOKLANGANSIZ!

👤 Mijoz: Aziz Tilavov
🆔 ID: 123456

📊 Jami qarz: $2,500.00
📆 Qarz kunlari: 12 kun

📋 Qarz tafsilotlari:
1. iPhone 15 Pro - $1,200.00 (15.02.2026)
2. MacBook Pro - $1,300.00 (18.02.2026)

🚫 Qarzni to'laguncha yangi mahsulot ololmaysiz!

Iltimos, TEZROQ to'lang!

📞 Yordam: +998901234567
```

### Eslatma Sozlamalari

```javascript
{
  reminderDays: 7,        // Eslatma kunlari
  blockDays: 10,          // Bloklash kunlari
  reminder3days: true,    // 3 kunlik eslatma
  reminder5days: true,    // 5 kunlik eslatma
  reminder7days: true,    // 7 kunlik eslatma
  reminderTime: '09:00'   // Eslatma vaqti
}
```

---

## 🧾 CHEK YUBORISH

### Savdo Cheki

Har savdodan keyin mijozga avtomatik chek yuboriladi:

```
🧾 SAVDO CHEKI

📅 Sana: 27.02.2026
🕐 Vaqt: 14:30:00

👤 Mijoz: Aziz Tilavov
🆔 ID: 123456

━━━━━━━━━━━━━━━━━━━━

📦 Mahsulot: iPhone 15 Pro
💰 Narxi: $1,200.00
💵 To'landi: $500.00

━━━━━━━━━━━━━━━━━━━━

⚠️ Bu savdo qarzi: $700.00
📊 Jami qarz: $1,500.00

😊 Rahmat! Yana kutamiz!
```

### To'lov Cheki

```
💵 TO'LOV CHEKI

📅 Sana: 27.02.2026
🕐 Vaqt: 15:00:00

👤 Mijoz: Aziz Tilavov
🆔 ID: 123456

━━━━━━━━━━━━━━━━━━━━

💰 To'lov: $500.00

━━━━━━━━━━━━━━━━━━━━

📊 Qolgan qarz: $1,000.00

😊 Rahmat!
```

### To'liq To'langan Chek

```
🧾 SAVDO CHEKI

📅 Sana: 27.02.2026
🕐 Vaqt: 14:30:00

👤 Mijoz: Aziz Tilavov
🆔 ID: 123456

━━━━━━━━━━━━━━━━━━━━

📦 Mahsulot: iPhone 15 Pro
💰 Narxi: $1,200.00
💵 To'landi: $1,200.00

━━━━━━━━━━━━━━━━━━━━

✅ To'liq to'landi

😊 Rahmat! Yana kutamiz!
```

### Chek Yuborish Jarayoni

```
1. Kassir savdo qiladi
   ↓
2. Savdo MongoDB ga saqlanadi
   ↓
3. Mijozning chatId topiladi
   ↓
4. Chek formati tayyorlanadi
   ↓
5. Telegram API ga so'rov yuboriladi
   ↓
6. Mijoz chekni oladi
```

---

## 💬 SAVOLLARGA JAVOB BERISH

### Mavjud Buyruqlar

| Buyruq | Tavsif | Javob |
|--------|--------|-------|
| `/start` | Ro'yxatdan o'tish | Mijoz ID va xush kelibsiz |
| `/id` | ID ni ko'rish | Mijoz ID va filial |
| `/balans` | Qarzni ko'rish | Qarz tafsilotlari |
| `/savdolar` | Savdolar tarixi | Oxirgi 10 ta savdo |
| `/filial` | Filialni o'zgartirish | Filiallar ro'yxati |

### /start Buyrug'i

**Yangi mijoz:**

```
👋 Assalomu alaykum Aziz!

🆔 Sizning mijoz ID raqamingiz:
123456

📝 Bu ID ni do'konga ayting - yangi daftar ochishda kerak bo'ladi.

💡 Buyruqlar:
/balans - Qarzni ko'rish
/id - ID ni qayta ko'rish
/filial - Filialni o'zgartirish

📞 Yordam: Agar muammo bo'lsa, do'kon egasiga murojaat qiling.
```

**Mavjud mijoz:**

```
👋 Xush kelibsiz Aziz!

🆔 Sizning mijoz ID raqamingiz:
123456

📝 Bu ID ni do'konga ayting - yangi daftar ochishda kerak bo'ladi.

💡 Buyruqlar:
/balans - Qarzni ko'rish
/id - ID ni qayta ko'rish
/filial - Filialni o'zgartirish

📞 Yordam: Agar muammo bo'lsa, do'kon egasiga murojaat qiling.
```

### /id Buyrug'i

```
🆔 Sizning mijoz ID raqamingiz:

123456

🏢 Filial: Asosiy filial

📝 Bu ID ni do'konga ayting - yangi daftar ochishda kerak bo'ladi.
```

### /balans Buyrug'i

**Qarz bor:**

```
💰 Sizning balansingiz

🆔 Mijoz ID: 123456
📊 Jami qarz: $1,500.00
📆 Qarz kunlari: 5 kun

📋 Qarz tafsilotlari:
1. iPhone 15 Pro - $700.00 (25.02.2026)
2. Samsung Galaxy S24 - $800.00 (23.02.2026)
```

**Qarz yo'q:**

```
✅ Sizning qarzingiz yo'q!

😊 Rahmat!
```

**Bloklangan:**

```
🚫 SIZ BLOKLANGANSIZ!

🆔 Mijoz ID: 123456
📊 Jami qarz: $2,500.00
📆 Qarz kunlari: 12 kun

📋 Qarz tafsilotlari:
1. iPhone 15 Pro - $1,200.00 (15.02.2026)
2. MacBook Pro - $1,300.00 (18.02.2026)

🚫 Qarzni to'laguncha yangi mahsulot ololmaysiz!

Iltimos, tezroq to'lang!
```

### /savdolar Buyrug'i

**Savdolar tarixi (qarz bor):**

```
📋 SAVDOLAR TARIXI

👤 Mijoz: Aziz Tilavov
🆔 ID: 123456

━━━━━━━━━━━━━━━━━━━━

1. iPhone 15 Pro
   💰 Narx: $1,200.00
   💵 To'landi: $500.00
   📊 Qarz: $700.00
   ⚠️ Qarz
   📅 25.02.2026 14:30

2. Samsung Galaxy S24
   💰 Narx: $900.00
   💵 To'landi: $900.00
   ✅ To'liq
   📅 23.02.2026 10:15

3. MacBook Pro
   💰 Narx: $2,500.00
   💵 To'landi: $1,000.00
   📊 Qarz: $1,500.00
   ⚠️ Qarz
   📅 20.02.2026 16:45

━━━━━━━━━━━━━━━━━━━━

📊 JAMI:
💰 Umumiy summa: $4,600.00
💵 To'langan: $2,400.00
⚠️ Qarz: $2,200.00

💡 Oxirgi 10 ta savdo ko'rsatildi
```

**Savdolar yo'q:**

```
📋 Sizning savdolaringiz yo'q

😊 Birinchi xaridingizni qiling!
```

**To'liq to'langan:**

```
📋 SAVDOLAR TARIXI

👤 Mijoz: Aziz Tilavov
🆔 ID: 123456

━━━━━━━━━━━━━━━━━━━━

1. iPhone 15 Pro
   💰 Narx: $1,200.00
   💵 To'landi: $1,200.00
   ✅ To'liq
   📅 25.02.2026 14:30

━━━━━━━━━━━━━━━━━━━━

📊 JAMI:
💰 Umumiy summa: $1,200.00
💵 To'langan: $1,200.00
✅ Qarz yo'q
```

### /filial Buyrug'i

```
🏢 Filialni tanlang:

Filial raqamini yuboring:

1. Asosiy filial ✅
   📍 Toshkent, Chilonzor

2. Ikkinchi filial
   📍 Toshkent, Yunusobod

💡 Masalan: 1 yoki 2 deb yuboring
```

### Noma'lum Buyruq

```
❓ Noma'lum buyruq: "salom"

💡 Mavjud buyruqlar:
/start - Boshlash
/id - ID ko'rish  
/balans - Qarz ko'rish
/savdolar - Savdolar tarixi
/filial - Filialni o'zgartirish

📞 Yordam kerak bo'lsa, do'kon egasiga murojaat qiling.
```

---

## ⚙️ SOZLAMALAR

### Bot Sozlamalari

**.env faylida:**

```env
BOT_TOKEN=8606346204:AAHXKuTfA6FkRZzxipBTAXA_6lopoygPonQ
```

### Eslatma Sozlamalari

**MongoDB Settings collection:**

```javascript
{
  reminderDays: 7,        // Eslatma kunlari
  reminderTime: '09:00',  // Eslatma vaqti
  blockDays: 10,          // Bloklash kunlari
  reminder3days: true,    // 3 kunlik eslatma
  reminder5days: true,    // 5 kunlik eslatma
  reminder7days: true     // 7 kunlik eslatma
}
```

### Bot Ishlash Jarayoni

```
1. Bot ishga tushadi (server.js da)
   ↓
2. Telegram API ga ulanadi
   ↓
3. Xabarlarni kutadi (long polling)
   ↓
4. Xabar kelganda qayta ishlaydi
   ↓
5. MongoDB dan ma'lumot oladi
   ↓
6. Javob yuboradi
   ↓
7. Qayta xabar kutadi
```

---

## 📖 QANDAY ISHLATISH

### 1. Bot Yaratish

1. Telegram da `@BotFather` ni toping
2. `/newbot` buyrug'ini yuboring
3. Bot nomini kiriting
4. Bot username kiriting
5. Bot tokenini oling

### 2. Bot Sozlash

**.env fayliga qo'shing:**

```env
BOT_TOKEN=YOUR_BOT_TOKEN_HERE
```

### 3. Server Ishga Tushirish

```bash
node server.js
```

**Natija:**

```
✅ Telegram bot ulandi: YourBotUsername
📡 Xabarlar kutilmoqda...
```

### 4. Mijoz Ro'yxatdan O'tish

1. Telegram da botni toping: `@YourBotUsername`
2. `/start` buyrug'ini yuboring
3. Filialni tanlang (agar kerak bo'lsa)
4. Mijoz ID ni oling

### 5. Do'konda Ishlatish

1. Mijoz ID ni kassirga ayting
2. Kassir savdo qiladi
3. Chek Telegram ga keladi

### 6. Qarzni Ko'rish

1. `/balans` buyrug'ini yuboring
2. Qarz tafsilotlarini ko'ring

### 7. Eslatmalar

- Qarz bo'lsa avtomatik eslatma keladi
- 3, 5, 7 kunlarda
- 10 kundan keyin bloklash

---

## 🔍 TEXNIK TAFSILOTLAR

### Telegram API

**Xabar yuborish:**

```javascript
async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  });
  
  return await response.json();
}
```

**Xabarlarni olish:**

```javascript
async function getUpdates(offset = 0) {
  const url = `${API_URL}/getUpdates?offset=${offset}&timeout=25`;
  const response = await fetch(url);
  const data = await response.json();
  return data.ok ? data.result : [];
}
```

### Chek Generatsiya

```javascript
function generateReceipt(sale, customer, totalDebt) {
  const debt = sale.price - sale.paid;
  
  let receipt = `🧾 <b>SAVDO CHEKI</b>\n\n`;
  receipt += `📅 Sana: ${sale.date}\n`;
  receipt += `🕐 Vaqt: ${sale.time}\n\n`;
  receipt += `👤 Mijoz: ${customer.name}\n`;
  receipt += `🆔 ID: <code>${customer.customerId}</code>\n\n`;
  receipt += `━━━━━━━━━━━━━━━━━━━━\n`;
  receipt += `📦 Mahsulot: ${sale.product}\n`;
  receipt += `💰 Narxi: $${sale.price.toFixed(2)}\n`;
  receipt += `💵 To'landi: $${sale.paid.toFixed(2)}\n`;
  receipt += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  if (debt > 0) {
    receipt += `⚠️ Bu savdo qarzi: <b>$${debt.toFixed(2)}</b>\n`;
  } else {
    receipt += `✅ To'liq to'landi\n`;
  }
  
  if (totalDebt > 0) {
    receipt += `📊 Jami qarz: <b>$${totalDebt.toFixed(2)}</b>\n`;
  }
  
  receipt += `\n😊 Rahmat! Yana kutamiz!`;
  
  return receipt;
}
```

### Mijoz ID Generatsiya

```javascript
function generateCustomerId() {
  return Math.floor(100000 + Math.random() * 900000);
}
```

---

## ✅ XUSUSIYATLAR

### 1. Avtomatik Eslatmalar
- ✅ 3, 5, 7 kunlik qarz eslatmalari
- ✅ 10 kundan keyin bloklash
- ✅ Qarz tafsilotlari bilan
- ✅ Har kuni avtomatik tekshirish

### 2. Chek Yuborish
- ✅ Har savdodan keyin avtomatik
- ✅ To'liq ma'lumotlar bilan
- ✅ Mijozning Telegram ga
- ✅ HTML formatda chiroyli

### 3. Savollarga Javob
- ✅ /start - Ro'yxatdan o'tish
- ✅ /id - ID ko'rish
- ✅ /balans - Qarz ko'rish
- ✅ /savdolar - Savdolar tarixi
- ✅ /filial - Filial tanlash
- ✅ Noma'lum buyruqlarga yordam

### 4. Mijoz Boshqaruvi
- ✅ Avtomatik ro'yxatdan o'tish
- ✅ Filial tanlash
- ✅ Mijoz ID generatsiya
- ✅ ChatId saqlash

### 5. Xavfsizlik
- ✅ Faqat ro'yxatdan o'tgan mijozlar
- ✅ ChatId orqali identifikatsiya
- ✅ Bloklangan mijozlar uchun ogohlantirish

---

## 🚀 YAKUNIY XULOSA

**Telegram bot to'liq ishlaydi va quyidagi funksiyalarni bajaradi:**

1. ⏰ Avtomatik qarz eslatmalari (3, 5, 7, 10 kun)
2. 🧾 Har savdodan keyin chek yuborish
3. 💬 Mijozlar savollariga javob berish
4. 📋 Savdolar tarixini ko'rsatish
5. 🏢 Filial tanlash imkoniyati
6. 🚫 Qarzli mijozlarni bloklash

**Bot 24/7 ishlaydi va mijozlar bilan avtomatik muloqot qiladi!**
