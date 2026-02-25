# 🚀 TEZKOR QO'LLANMA - Kassir Savdo Qilish

## 📱 SAMSUNG A17 NI IMEI BILAN SOTISH

---

## 1️⃣ SERVERNI ISHGA TUSHIRISH

```bash
node server.js
```

**Kutilayotgan natija:**
```
🌐 Server: http://localhost:3000
💾 MongoDB: ✅ Ulangan
🤖 Telegram Bot: ✅ Faol
```

---

## 2️⃣ ADMIN - MAHSULOT QO'SHISH

### Brauzerda:
```
http://localhost:3000/admin-simple.html
```

### Yoki Test Script:
```bash
node test-kassir-savdo-imei.js
```

**Bu script avtomatik:**
1. Samsung A17 yaratadi
2. 4 ta IMEI qo'shadi
3. Mijoz yaratadi
4. Savdo qiladi
5. Natijalarni ko'rsatadi

---

## 3️⃣ KASSIR - SAVDO QILISH

### Login:
```
URL: http://localhost:3000/cashier-login-enhanced.html
Username: aziza
Password: 1234
```

### Savdo:
```
URL: http://localhost:3000/cashier-new.html
```

**Qadamlar:**
1. Mijoz: `Alisher Karimov`
2. Mahsulot: `Samsung Galaxy A17`
3. IMEI: `351234567890123`
4. Miqdor: `1`
5. To'lov: `$150`
6. "Savdo qilish" tugmasini bosing

---

## 4️⃣ IMEI QIDIRISH

```
URL: http://localhost:3000/warehouse-imei-search.html
```

**Qidirish:**
- To'liq IMEI: `351234567890123`
- Qisman: `0123`
- Mahsulot: `Samsung A17`
- Barcode: `SAMSUNGA17`

---

## 5️⃣ NATIJALARNI TEKSHIRISH

### Ombor:
```
http://localhost:3000/warehouse-pro.html
```

### Savdolar:
```
http://localhost:3000/admin-sales.html
```

### Activity Log:
```
http://localhost:3000/activity-log.html
```

---

## 🧪 TESTLAR

### To'liq Test:
```bash
node test-kassir-savdo-imei.js
```

### IMEI Tekshirish:
```bash
node test-imei-simple-check.js
```

---

## ✅ KUTILAYOTGAN NATIJALAR

### Test Natijasi:
```
✅ Samsung A17 yaratildi (ID: 2197)
✅ 4 ta IMEI qo'shildi
✅ Mijoz yaratildi (ID: 248663)
✅ Savdo amalga oshirildi
✅ IMEI belgilandi: 351234567890123
✅ Qarz hisoblanadi: $100
```

### IMEI Tekshirish:
```
Jami: 18 ta mahsulot
IMEI bor: 1 ta

Samsung Galaxy A17 (ID: 2197)
  IMEI soni: 4 ta
    1. 351234567890123
    2. 351234567890124
    3. 351234567890125
    4. 351234567890126

✅ IMEI QIDIRISH ISHLAYDI!
```

---

## 🎯 BARCHA LINKLAR

### Admin:
- http://localhost:3000/admin-simple.html
- http://localhost:3000/warehouse-imei-search.html
- http://localhost:3000/activity-log.html

### Kassir:
- http://localhost:3000/cashier-login-enhanced.html
- http://localhost:3000/cashier-new.html

### Hisobotlar:
- http://localhost:3000/admin-sales.html
- http://localhost:3000/warehouse-pro.html

---

## 📞 YORDAM

### Muammo: Server ishlamayapti
```bash
node server.js
```

### Muammo: MongoDB ulanmayapti
- Internet ulanishini tekshiring
- `.env` faylda MongoDB URI ni tekshiring

### Muammo: IMEI saqlanmayapti
- Server yangilangan versiyasini ishlatayotganingizni tekshiring
- `server.js` da IMEI validatsiyasi borligini tekshiring

---

## ✅ TAYYOR!

**Endi kassir bulib savdo qilishingiz mumkin!** 🎉

Barcha funksiyalar ishlaydi:
- ✅ IMEI qo'shish
- ✅ IMEI qidirish
- ✅ Savdo qilish
- ✅ Qarz hisoblash
- ✅ Tarix saqlash
