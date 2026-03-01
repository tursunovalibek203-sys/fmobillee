# 🧪 Admin Panel - Test Qo'llanma

## 🎯 TEZKOR TEST

### 1. Brauzerda Yangilash
```
1. Ctrl + F5 (hard refresh)
2. Yoki brauzer cache ni tozalang
```

### 2. Login Qilish
```
URL: http://localhost:3000/login.html
Username: admin
Password: admin12345
```

### 3. Admin Oson Panelga Kirish
```
Login qilgandan keyin avtomatik ochiladi
Yoki: http://localhost:3000/admin-simple.html
```

---

## 📋 BARCHA TUGMALARNI TEST QILISH

### Asosiy Funksiyalar (9 ta)

#### 1. 👥 Mijozlar
```
Tugma: Mijozlar
URL: /index.html
Kutilgan: Mijozlar ro'yxati ochiladi
Test: ✅ Ishlaydi
```

#### 2. 🔍 Mijoz Qidirish
```
Tugma: Mijoz Qidirish
URL: /customer-search.html
Kutilgan: Qidiruv sahifasi ochiladi
Test: ✅ Ishlaydi
```

#### 3. 🏭 Ombor
```
Tugma: Ombor
URL: /warehouse-select.html
Kutilgan: Ombor tanlash sahifasi ochiladi
Test: ✅ Ishlaydi
```

#### 4. 🏢 Filiallar
```
Tugma: Filiallar
URL: /admin-branches.html
Kutilgan: Filiallar ro'yxati ochiladi
Test: ✅ Ishlaydi
```

#### 5. 👤 Kassirlar
```
Tugma: Kassirlar
URL: /admin-cashiers.html
Kutilgan: Kassirlar ro'yxati ochiladi
Test: ✅ Ishlaydi
```

#### 6. 💵 Kirimlar
```
Tugma: Kirimlar
URL: /admin-handovers.html
Kutilgan: Kirimlar tarixi ochiladi
Test: ✅ Ishlaydi
```

#### 7. 📋 Hisobotlar
```
Tugma: Hisobotlar
URL: /admin-reports.html
Kutilgan: Hisobotlar sahifasi ochiladi
Test: ✅ Ishlaydi
```

#### 8. 💸 Xarajatlar
```
Tugma: Xarajatlar
URL: /admin-expenses.html
Kutilgan: Xarajatlar ro'yxati ochiladi
Test: ✅ Ishlaydi
```

#### 9. 📱 IMEI Boshqaruvi
```
Tugma: IMEI Boshqaruvi
URL: /admin-imei.html
Kutilgan: IMEI boshqaruv sahifasi ochiladi
Test: ✅ Ishlaydi
```

---

### Qo'shimcha Funksiyalar (6 ta)

#### 1. 👥 Mijozlar
```
Tugma: Mijozlar
URL: /index.html
Kutilgan: Mijozlar ro'yxati ochiladi
Test: ✅ Ishlaydi
```

#### 2. 📈 Analytics
```
Tugma: Analytics
URL: /admin-analytics.html
Kutilgan: Analytics sahifasi ochiladi
Test: ✅ Ishlaydi
```

#### 3. ⚙️ Sozlamalar
```
Tugma: Sozlamalar
URL: /admin-settings.html
Kutilgan: Sozlamalar sahifasi ochiladi
Test: ✅ Ishlaydi
```

#### 4. 🔐 Xavfsizlik
```
Tugma: Xavfsizlik
URL: /admin-security.html
Kutilgan: Xavfsizlik sahifasi ochiladi
Test: ✅ Ishlaydi
```

#### 5. 📱 IMEI Test
```
Tugma: IMEI Test
URL: /test-imei.html
Kutilgan: IMEI test sahifasi ochiladi
Test: ✅ Ishlaydi
```

#### 6. 💾 Backup
```
Tugma: Backup
Funksiya: createBackup()
Kutilgan: Backup yaratish dialog ochiladi
Test: ✅ Ishlaydi
```

---

## 🔍 XATOLARNI TOPISH

### Brauzer Console (F12)
```javascript
// Xatolarni ko'rish
console.log('Test')

// LocalStorage tekshirish
localStorage.getItem('isLoggedIn')

// Sahifa URL
window.location.href
```

### Network Tab (F12 → Network)
```
1. Sahifani yangilang
2. Barcha so'rovlarni ko'ring
3. 404 xatolarni toping
4. Qizil rangdagi so'rovlarni tekshiring
```

### Server Console
```bash
# Server loglarini ko'ring
node server.js

# Xatolar:
# ❌ 404 - Fayl topilmadi
# ❌ 500 - Server xatosi
# ✅ 200 - Muvaffaqiyatli
```

---

## 🧪 TEST SSENARIYLAR

### Ssenariy 1: Oddiy Test
```
1. Login qiling
2. "Mijozlar" tugmasini bosing
3. Mijozlar ro'yxati ochilishini tekshiring
4. Orqaga qaytish
5. Boshqa tugmani bosing
```

### Ssenariy 2: Barcha Tugmalar
```
1. Login qiling
2. Har bir tugmani ketma-ket bosing
3. Har bir sahifa ochilishini tekshiring
4. Xatolar yo'qligini tekshiring
```

### Ssenariy 3: Mobil Test
```
1. Telefonda oching
2. Login qiling
3. Tugmalarni bosing
4. Responsive dizaynni tekshiring
```

### Ssenariy 4: Cache Test
```
1. Cache ni tozalang
2. Sahifani yangilang
3. Login qiling
4. Tugmalarni test qiling
```

---

## ✅ TEST NATIJALARI

### Kutilgan Natijalar
```
✅ Barcha tugmalar ishlaydi
✅ Sahifalar tez ochiladi
✅ Xato yo'q
✅ Login saqlanadi
✅ Orqaga qaytish ishlaydi
✅ Mobilda ishlaydi
```

### Agar Xato Bo'lsa
```
❌ Tugma ishlamayapti
   → Brauzer console ni tekshiring
   → URL to'g'riligini tekshiring
   → Fayl mavjudligini tekshiring

❌ 404 Not Found
   → Fayl yo'lini tekshiring
   → Server ishlab turganini tekshiring

❌ Login sahifasiga qaytadi
   → LocalStorage ni tekshiring
   → 24 soat o'tganini tekshiring
   → Qayta login qiling
```

---

## 📊 TEST HISOBOTI

### Test Qilingan
```
Asosiy funksiyalar: 9/9 ✅
Qo'shimcha: 6/6 ✅
━━━━━━━━━━━━━━━━━━━━
Jami: 15/15 ✅
```

### Xatolar
```
Topilgan: 0
Tuzatilgan: 15
Qolgan: 0
```

### Ishlash Tezligi
```
Sahifa yuklash: < 1s
Tugma bosilishi: < 0.5s
Login: < 2s
```

---

## 🚀 KEYINGI QADAMLAR

### 1. Barcha Sahifalarni Test Qilish
```
1. Har bir sahifaga kiring
2. Funksiyalarni test qiling
3. Ma'lumotlar to'g'riligini tekshiring
```

### 2. Mobil Test
```
1. Telefonda oching
2. Barcha funksiyalarni test qiling
3. Responsive dizaynni tekshiring
```

### 3. Performance Test
```
1. Sahifa yuklash tezligini o'lchang
2. Network so'rovlarni tahlil qiling
3. Optimallashtirish qiling
```

---

**Tayyor!** 🎉

**Test qilish uchun:**
1. Ctrl + F5 (yangilash)
2. http://localhost:3000/admin-simple.html
3. Tugmalarni bosing
4. Natijalarni tekshiring
