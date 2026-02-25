# ⚡ Tezkor Reja - 1 Hafta

## 🎯 MAQSAD
1 hafta ichida eng foydali 3 ta funksiyani qo'shish

---

## 📅 KUN 1-2: CHEGIRMA TIZIMI

### Schema (server.js):
```javascript
const DiscountSchema = new mongoose.Schema({
  discountId: Number,
  type: String, // 'percentage', 'fixed', 'promocode'
  name: String,
  value: Number, // foiz yoki summa
  code: String, // promokod
  minAmount: Number, // minimal xarid
  maxDiscount: Number, // maksimal chegirma
  startDate: Date,
  endDate: Date,
  usageLimit: Number, // necha marta ishlatish mumkin
  usedCount: Number,
  isActive: Boolean,
  applicableTo: String, // 'all', 'product', 'customer', 'category'
  targetIds: [Number], // mahsulot/mijoz IDlari
  createdAt: Date
});
```

### API Endpoints:
```javascript
GET  /api/discounts              // Barcha chegirmalar
POST /api/discounts              // Yangi chegirma
PUT  /api/discounts/:id          // Chegirma yangilash
DELETE /api/discounts/:id        // Chegirma o'chirish
POST /api/discounts/apply        // Chegirma qo'llash
GET  /api/discounts/validate/:code // Promokod tekshirish
```

### Admin Sahifa (admin-discounts.html):
- Chegirma qo'shish
- Promokod yaratish
- Faol chegirmalar ro'yxati
- Statistika

### Kassir Integratsiya:
- Savdo qilishda chegirma qo'llash
- Promokod kiritish
- Avtomatik hisoblash

---

## 📅 KUN 3-4: SMS BILDIRISHNOMALAR

### Schema:
```javascript
const NotificationSchema = new mongoose.Schema({
  notificationId: Number,
  type: String, // 'sms', 'telegram', 'email'
  recipient: String, // telefon/chat_id/email
  message: String,
  status: String, // 'pending', 'sent', 'failed'
  sentAt: Date,
  createdAt: Date
});

const NotificationRuleSchema = new mongoose.Schema({
  ruleId: Number,
  name: String,
  trigger: String, // 'low_stock', 'high_debt', 'daily_report'
  condition: Object, // shart
  template: String, // xabar shabloni
  recipients: [String], // kimga
  isActive: Boolean,
  createdAt: Date
});
```

### API Endpoints:
```javascript
POST /api/notifications/send     // SMS yuborish
GET  /api/notifications          // Yuborilgan xabarlar
POST /api/notifications/rules    // Qoida qo'shish
GET  /api/notifications/rules    // Qoidalar ro'yxati
```

### Bildirishnomalar:
1. **Kam qolgan mahsulot:**
   ```
   ⚠️ OGOHLANTIRISH
   
   Mahsulot: Telefon Samsung
   Qoldiq: 3 ta
   Minimal: 10 ta
   
   Yangi buyurtma bering!
   ```

2. **Katta qarz:**
   ```
   💰 QARZ OGOHLANTIRUVI
   
   Mijoz: Alisher Valiyev
   Qarz: $500
   Muddat: 30 kun
   
   Iltimos, tekshiring!
   ```

3. **Kunlik hisobot:**
   ```
   📊 KUNLIK HISOBOT
   
   Savdolar: 45 ta
   Daromad: $5,200
   Foyda: $1,800
   
   Yaxshi kun! 👍
   ```

### SMS Provider:
- Eskiz.uz API
- Playmobile API
- SMS.uz API

---

## 📅 KUN 5-7: QR KOD TIZIMI

### Schema:
```javascript
const QRCodeSchema = new mongoose.Schema({
  qrId: Number,
  type: String, // 'product', 'customer', 'payment'
  targetId: Number,
  code: String, // QR kod matni
  imageUrl: String, // QR rasm
  createdAt: Date,
  lastUsed: Date,
  usageCount: Number
});
```

### API Endpoints:
```javascript
POST /api/qr/generate            // QR yaratish
GET  /api/qr/scan/:code          // QR skanerlash
GET  /api/qr/:type/:id           // QR olish
```

### Funksiyalar:

#### 1. Mahsulot QR:
```javascript
// QR yaratish
POST /api/qr/generate
{
  "type": "product",
  "targetId": 12345
}

// QR skanerlash
GET /api/qr/scan/PROD_12345
Response: {
  "type": "product",
  "product": {
    "name": "Telefon",
    "price": 200,
    "stock": 15
  }
}
```

#### 2. Mijoz QR:
```javascript
// Mijoz QR
GET /api/qr/scan/CUST_123456
Response: {
  "type": "customer",
  "customer": {
    "name": "Alisher",
    "phone": "998901234567",
    "debt": 50
  }
}
```

#### 3. To'lov QR:
```javascript
// To'lov QR (Click/Payme)
GET /api/qr/scan/PAY_789
Response: {
  "type": "payment",
  "amount": 200,
  "paymentUrl": "https://click.uz/pay/..."
}
```

### Admin Sahifa (admin-qr.html):
- QR yaratish
- QR yuklab olish
- QR statistika
- QR chop etish

### Kassir Integratsiya:
- QR skanerlash
- Tezkor qidirish
- Tezkor to'lov

### QR Library:
- qrcode.js (JavaScript)
- node-qrcode (Node.js)

---

## 📦 KERAKLI PAKETLAR

```bash
# SMS uchun
npm install axios

# QR uchun
npm install qrcode

# Bildirishnomalar uchun
npm install node-cron

# Chegirma hisoblash uchun
# (mavjud paketlar yetarli)
```

---

## 🗂️ FAYL STRUKTURASI

```
public/
├── admin-discounts.html      # Chegirmalar
├── admin-notifications.html  # Bildirishnomalar
├── admin-qr.html            # QR kodlar
├── cashier-discount.html    # Kassir chegirma
└── qr-scanner.html          # QR skanerlash

server.js                     # Yangi API'lar
```

---

## ✅ TEKSHIRISH RO'YXATI

### Kun 1-2: Chegirma
- [ ] Schema yaratish
- [ ] API endpoints
- [ ] Admin sahifa
- [ ] Kassir integratsiya
- [ ] Test qilish

### Kun 3-4: SMS
- [ ] Schema yaratish
- [ ] SMS provider integratsiya
- [ ] API endpoints
- [ ] Qoidalar tizimi
- [ ] Test qilish

### Kun 5-7: QR
- [ ] Schema yaratish
- [ ] QR yaratish funksiyasi
- [ ] QR skanerlash
- [ ] Admin sahifa
- [ ] Kassir integratsiya
- [ ] Test qilish

---

## 💰 XARAJATLAR

### SMS:
- Eskiz.uz: ~50 so'm/SMS
- 1000 SMS/oy: ~$4
- Yillik: ~$50

### QR:
- Bepul (open source library)

### Chegirma:
- Bepul (o'z kodimiz)

**Jami:** ~$50/yil (faqat SMS)

---

## 📈 KUTILAYOTGAN NATIJA

### Chegirma:
- Savdo: +30%
- Yangi mijozlar: +40%
- Mijoz qaytishi: +25%

### SMS:
- Muammolarni tez hal qilish: +60%
- Vaqt tejash: +40%
- Nazorat: +50%

### QR:
- Tezlik: +70%
- Xatolar: -80%
- Professional ko'rinish: +100%

---

## 🚀 KEYINGI HAFTA

Agar bu 3 ta funksiya muvaffaqiyatli bo'lsa:

### Hafta 2:
- Click/Payme integratsiya
- Professional Analytics
- KPI Dashboard

### Hafta 3-4:
- CRM asoslari
- Mobil ilova boshlanishi

---

**Boshlash:** Hozir!  
**Tugash:** 1 hafta  
**Natija:** 3 ta yangi funksiya  
**Xarajat:** ~$50/yil  
**Foyda:** +30-70% yaxshilanish  

**Omad! 💪**
