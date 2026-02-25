# 🔧 Mijozlar Chiqmayotgan Muammoni Hal Qilish

## 📋 Muammo
Mijozlar sahifada ko'rinmayapti yoki yuklanmayapti.

---

## 🔍 Muammoni Aniqlash

### 1. **Server Ishga Tushganligini Tekshirish**

```bash
node server.js
```

Agar server ishga tushsa, quyidagi xabarlar ko'rinishi kerak:
```
✅ MongoDB ulandi
📊 Excel tizimi ishga tushirilmoqda...
✅ Excel tizimi tayyor!
Server ishga tushdi: http://localhost:3000
```

### 2. **MongoDB Ulanishini Tekshirish**

`.env` faylida MongoDB URI to'g'ri kiritilganligini tekshiring:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dokon_db
```

### 3. **API Test Sahifasini Ochish**

Browserda quyidagi URLni oching:
```
http://localhost:3000/test-api.html
```

Bu sahifada:
- ✅ "Test /api/customers" tugmasini bosing
- Natijani ko'ring

---

## 🛠️ Tuzatishlar

### Tuzatish 1: Script Path Muammosi

**Muammo:** `script.js` fayli yuklanmayapti

**Yechim:** `index.html` faylida script pathni tekshiring:

```html
<!-- ❌ Noto'g'ri -->
<script src="script.js" defer></script>

<!-- ✅ To'g'ri -->
<script src="/script.js"></script>
```

### Tuzatish 2: API URL Muammosi

**Muammo:** API URL noto'g'ri

**Yechim:** Browser console da tekshiring:

```javascript
console.log('API URL:', window.location.origin + '/api');
```

Natija:
```
API URL: http://localhost:3000/api
```

### Tuzatish 3: CORS Muammosi

**Muammo:** CORS xatosi

**Yechim:** `server.js` faylida CORS sozlamalari to'g'ri:

```javascript
const cors = require('cors');
app.use(cors());
```

### Tuzatish 4: MongoDB Ma'lumotlar Yo'q

**Muammo:** MongoDB da mijozlar yo'q

**Yechim:** Test mijoz qo'shing:

1. Sahifada "Yangi mijoz" tugmasini bosing
2. Mijoz ma'lumotlarini kiriting
3. Saqlang

Yoki MongoDB Compass orqali qo'shing:
```json
{
  "customerId": 100001,
  "name": "Test Mijoz",
  "phone": "+998901234567",
  "chatId": null,
  "totalDebt": 0,
  "firstDebtDate": null
}
```

### Tuzatish 5: Cache Muammosi

**Muammo:** Eski cache ko'rsatilmoqda

**Yechim:** Browser cache ni tozalang:

1. Browser console ni oching (F12)
2. Quyidagi kodni kiriting:
```javascript
localStorage.clear();
location.reload();
```

---

## 🔍 Debug Qilish

### Browser Console da Tekshirish

1. Browser console ni oching (F12)
2. Quyidagi xabarlarni qidiring:

```
🔄 Mijozlar yuklanmoqda...
📍 API URL: http://localhost:3000/api
📍 Full URL: http://localhost:3000/api/customers
📡 Serverga so'rov yuborilmoqda...
📡 Response status: 200
📡 Response OK: true
📦 Kelgan ma'lumotlar: [...]
✅ X ta mijoz yuklandi
```

### Xato Xabarlari

#### Xato 1: "Failed to fetch"
```
❌ Xato: Failed to fetch
```

**Sabab:** Server ishlamayapti

**Yechim:** Serverni ishga tushiring:
```bash
node server.js
```

#### Xato 2: "404 Not Found"
```
❌ Server xatosi: 404
```

**Sabab:** API endpoint noto'g'ri

**Yechim:** URL ni tekshiring:
```javascript
// To'g'ri URL
http://localhost:3000/api/customers
```

#### Xato 3: "500 Internal Server Error"
```
❌ Server xatosi: 500
```

**Sabab:** MongoDB ulanish xatosi

**Yechim:** 
1. `.env` faylida MongoDB URI ni tekshiring
2. MongoDB Cluster ishga tushganligini tekshiring
3. Server loglarini ko'ring

#### Xato 4: "Network Error"
```
❌ Network Error
```

**Sabab:** Internet aloqasi yo'q yoki firewall bloklagan

**Yechim:**
1. Internet aloqasini tekshiring
2. Firewall sozlamalarini tekshiring
3. Antivirus dasturini vaqtincha o'chiring

---

## ✅ To'liq Tekshirish Ro'yxati

### 1. Server
- [ ] Server ishga tushgan
- [ ] Port 3000 band emas
- [ ] MongoDB ulangan
- [ ] Console da xato yo'q

### 2. MongoDB
- [ ] `.env` faylida URI to'g'ri
- [ ] MongoDB Cluster ishga tushgan
- [ ] Database nomi to'g'ri (`dokon_db`)
- [ ] Kamida 1 ta mijoz mavjud

### 3. Frontend
- [ ] `index.html` ochiladi
- [ ] `script.js` yuklanadi
- [ ] Console da xato yo'q
- [ ] API so'rovlar yuboriladi

### 4. API
- [ ] `/api/customers` ishlaydi
- [ ] `/api/sales` ishlaydi
- [ ] `/api/settings` ishlaydi
- [ ] CORS sozlamalari to'g'ri

---

## 🚀 Tezkor Yechim

Agar hali ham ishlamasa, quyidagi ketma-ketlikni bajaring:

### 1. Serverni To'xtatish
```bash
Ctrl + C
```

### 2. Cache ni Tozalash
Browser console:
```javascript
localStorage.clear();
```

### 3. Serverni Qayta Ishga Tushirish
```bash
node server.js
```

### 4. Sahifani Yangilash
```
Ctrl + F5 (hard refresh)
```

### 5. Test Sahifasini Ochish
```
http://localhost:3000/test-api.html
```

### 6. Asosiy Sahifani Ochish
```
http://localhost:3000
```

---

## 📞 Qo'shimcha Yordam

### MongoDB Ulanish Testi

Terminal da:
```bash
node test-warehouse-connection.js
```

Natija:
```
✅ MongoDB ulandi
✅ Warehouse DB ulandi
```

### Port Tekshirish

Agar port 3000 band bo'lsa:

Windows:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Loglarni Ko'rish

Server console da barcha loglar ko'rinadi:
```
🔄 Mijozlar yuklanmoqda...
✅ Mijoz qo'shildi
📤 Telegram xabar yuborildi
```

---

## 🎯 Natija

Agar barcha qadamlar to'g'ri bajarilsa:
- ✅ Server ishga tushadi
- ✅ MongoDB ulanadi
- ✅ Mijozlar yuklanadi
- ✅ Sahifada mijozlar ko'rinadi

---

**Yaratilgan:** 2026-02-08
**Versiya:** 1.0
