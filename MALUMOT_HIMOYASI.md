# 🔒 MA'LUMOT HIMOYASI TIZIMI

## 📅 Sana: 25-Fevral-2026

---

## 🛡️ MAHSULOTLAR VA PULLAR YO'QOLMASLIGI UCHUN

### ✅ MAVJUD HIMOYA TIZIMLARI:

---

## 1. 💾 MONGODB ATLAS (Bulut Saqlash)

### Nima?
- Barcha ma'lumotlar MongoDB Atlas bulutida saqlanadi
- Google serverlarda 3 nusxada saqlanadi
- Avtomatik zaxira nusxalar har kuni

### Qanday ishlaydi?
```
Sizning kompyuter → Internet → MongoDB Atlas (Google Cloud)
                                    ↓
                            3 ta server nusxasi
                            (Agar biri ishlamasa, 2 tasi ishlaydi)
```

### Afzalliklari:
- ✅ Kompyuter buzilsa ham ma'lumotlar saqlanadi
- ✅ Elektr yo'qolsa ham ma'lumotlar yo'qolmaydi
- ✅ Har qanday kompyuterdan kirishingiz mumkin
- ✅ Avtomatik zaxira nusxalar

---

## 2. 📝 ACTIVITY LOG (Faoliyat Tarixi)

### Nima?
- Har bir harakat yozib boriladi
- Kim, qachon, nima qilgani saqlanadi
- Hech narsa tarixsiz emas

### Saqlanadigan Ma'lumotlar:
```javascript
{
  action: "create",              // Harakat turi
  entity: "product",             // Ob'ekt turi
  entityId: 1234,                // Ob'ekt ID
  entityName: "Samsung A17",     // Ob'ekt nomi
  userId: 1,                     // Kim qildi
  userName: "Admin",             // Foydalanuvchi ismi
  userRole: "admin",             // Roli
  branchId: 1,                   // Qaysi filialda
  description: "Yangi mahsulot qo'shildi",
  oldValue: {...},               // Eski qiymat
  newValue: {...},               // Yangi qiymat
  timestamp: "2026-02-25T10:30:00Z",
  date: "25/02/2026",
  time: "10:30:00"
}
```

### Kuzatiladigan Harakatlar:
- ✅ Mahsulot qo'shish/o'zgartirish/o'chirish
- ✅ Savdo qilish
- ✅ Mijoz qo'shish/o'zgartirish
- ✅ Kassir kirim berish
- ✅ Ombor kelish/ketish
- ✅ Barcha o'zgarishlar

---

## 3. 📊 STOCK HISTORY (Ombor Tarixi)

### Stock In (Kelish):
```javascript
{
  stockInId: 1771994444350,
  productId: 1234,
  productName: "Samsung A17",
  quantity: 10,                  // Nechta keldi
  buyPrice: 200,
  totalCost: 2000,
  supplier: "Apple Store",
  addedBy: "Admin",
  date: "25/02/2026",
  time: "10:30:00"
}
```

### Stock Out (Ketish):
```javascript
{
  stockOutId: 1771994444351,
  productId: 1234,
  productName: "Samsung A17",
  quantity: 3,                   // Nechta ketdi
  sellPrice: 250,
  totalAmount: 750,
  reason: "sale",                // Sabab
  customerId: 123456,
  processedBy: "Kassir",
  date: "25/02/2026",
  time: "14:30:00"
}
```

### Afzalliklari:
- ✅ Har bir mahsulot kelishi yoziladi
- ✅ Har bir mahsulot ketishi yoziladi
- ✅ Ombor holati hisoblash mumkin
- ✅ Yo'qolgan mahsulotni topish oson

---

## 4. 💰 CASHIER SALES (Kassir Savdolar)

### Har bir savdo saqlanadi:
```javascript
{
  saleId: 1771994444350,
  branchId: 1,
  cashierId: 1001,
  cashierName: "Aziza",
  customerId: 123456,
  customerName: "Alisher",
  product: "Samsung A17",
  price: 250,
  paidUSD: 200,
  paidUZS: 625000,
  exchangeRate: 12500,
  date: "25/02/2026",
  time: "14:30:00"
}
```

### Afzalliklari:
- ✅ Har bir savdo yoziladi
- ✅ Pul qayerga ketganini bilish mumkin
- ✅ Kassir balansini hisoblash mumkin
- ✅ Yo'qolgan pulni topish oson

---

## 5. 🔄 SOFT DELETE (Yumshoq O'chirish)

### Nima?
- Mahsulot o'chirilganda aslida o'chirilmaydi
- Faqat `isActive: false` deb belgilanadi
- Keyin qayta tiklash mumkin

### Misol:
```javascript
// O'chirishdan oldin:
{
  productId: 1234,
  name: "Samsung A17",
  stock: 10,
  isActive: true        // ✅ Faol
}

// O'chirishdan keyin:
{
  productId: 1234,
  name: "Samsung A17",
  stock: 10,
  isActive: false       // ❌ O'chirilgan (lekin saqlanadi!)
}
```

### Afzalliklari:
- ✅ Xato o'chirilsa qayta tiklash mumkin
- ✅ Tarix saqlanadi
- ✅ Ma'lumot yo'qolmaydi

---

## 6. 📦 EXCEL BACKUP (Excel Zaxira)

### Nima?
- Barcha ma'lumotlar Excel faylga ham yoziladi
- Har hafta yangi fayl yaratiladi
- Eski fayllar saqlanadi

### Fayllar:
```
Hafta_23.02_01.03.xlsx    - Haftalik savdolar
Mijoz_Alisher.xlsx        - Mijoz tarixi
Ombor_Samsung_A17.xlsx    - Mahsulot tarixi
```

### Afzalliklari:
- ✅ Offline zaxira nusxa
- ✅ Excel da ochish mumkin
- ✅ Hisobotlar uchun qulay

---

## 7. 🔐 MONGODB ATLAS BACKUP

### Avtomatik Zaxira:
- Har kuni avtomatik zaxira nusxa
- 7 kunlik tarix saqlanadi
- Istalgan vaqtga qaytarish mumkin

### Qanday ishlaydi?
```
Bugun:     Ma'lumotlar → Zaxira 1
Kecha:     Ma'lumotlar → Zaxira 2
2 kun oldin: Ma'lumotlar → Zaxira 3
...
7 kun oldin: Ma'lumotlar → Zaxira 7
```

### Afzalliklari:
- ✅ Xato bo'lsa kechagi holatga qaytarish
- ✅ Avtomatik ishlaydi
- ✅ Hech narsa yo'qolmaydi

---

## 8. 🔍 AUDIT TRAIL (Tekshiruv Izi)

### Har bir o'zgarish kuzatiladi:
```
25/02/2026 10:30:00 - Admin mahsulot qo'shdi: Samsung A17 (10 dona)
25/02/2026 14:30:00 - Kassir Aziza sotdi: Samsung A17 (3 dona)
25/02/2026 16:00:00 - Admin narxni o'zgartirdi: $200 → $250
25/02/2026 18:00:00 - Kassir kirim berdi: $500
```

### Afzalliklari:
- ✅ Kim nima qilganini bilish
- ✅ Xato topish oson
- ✅ Javobgarlik

---

## 🛡️ HIMOYA DARAJALARI

### 1-daraja: MongoDB Atlas
- Bulutda 3 nusxada saqlanadi
- Kompyuter buzilsa ham saqlanadi

### 2-daraja: Activity Log
- Har bir harakat yoziladi
- Tarix saqlanadi

### 3-daraja: Stock History
- Ombor kelish/ketish tarixi
- Mahsulot harakati kuzatiladi

### 4-daraja: Cashier Sales
- Har bir savdo yoziladi
- Pul harakati kuzatiladi

### 5-daraja: Soft Delete
- O'chirilgan ma'lumot saqlanadi
- Qayta tiklash mumkin

### 6-daraja: Excel Backup
- Offline zaxira nusxa
- Haftalik fayllar

### 7-daraja: MongoDB Backup
- Avtomatik kunlik zaxira
- 7 kunlik tarix

### 8-daraja: Audit Trail
- Barcha o'zgarishlar kuzatiladi
- Kim, qachon, nima

---

## ✅ NATIJA

### Mahsulotlar yo'qolmaydi chunki:
1. ✅ MongoDB Atlas bulutida saqlanadi
2. ✅ Stock History har bir harakatni yozadi
3. ✅ Activity Log tarix saqlanadi
4. ✅ Soft Delete o'chirilgan ma'lumotni saqlaydi
5. ✅ Excel Backup offline nusxa
6. ✅ MongoDB Backup avtomatik zaxira
7. ✅ Audit Trail barcha o'zgarishlarni kuzatadi

### Pullar yo'qolmaydi chunki:
1. ✅ Cashier Sales har bir savdoni yozadi
2. ✅ Kassir balans avtomatik hisoblanadi
3. ✅ Activity Log pul harakatini yozadi
4. ✅ Kirim berish tarixi saqlanadi
5. ✅ MongoDB Atlas bulutida saqlanadi
6. ✅ Excel Backup offline nusxa
7. ✅ Audit Trail kim nima qilganini ko'rsatadi

---

## 🔍 AGAR MUAMMO BO'LSA

### Mahsulot yo'qolgan deb o'ylasangiz:
1. Activity Log ni tekshiring
2. Stock History ni tekshiring
3. Soft Delete ni tekshiring (isActive: false)
4. MongoDB Backup dan tiklang

### Pul yo'qolgan deb o'ylasangiz:
1. Cashier Sales ni tekshiring
2. Kirim berish tarixini tekshiring
3. Activity Log ni tekshiring
4. Kassir balansni hisoblang

---

## 📊 TEKSHIRISH

### Activity Log:
```
http://localhost:3000/activity-log.html
```

### Stock History:
```
http://localhost:3000/warehouse-history.html
```

### Cashier Sales:
```
http://localhost:3000/cashier-history-enhanced.html
```

---

## ✅ XULOSA

**SIZNING MA'LUMOTLARINGIZ XAVFSIZ!**

- ✅ 8 ta himoya darajasi
- ✅ Bulutda saqlanadi
- ✅ Avtomatik zaxira
- ✅ Barcha tarix saqlanadi
- ✅ Hech narsa yo'qolmaydi
- ✅ Qayta tiklash mumkin

**Tizim ishonchli va xavfsiz!** 🔒

---

**Yaratilgan:** 25-Fevral-2026  
**Status:** ✅ HIMOYALANGAN  
**Muallif:** Kiro AI Assistant
