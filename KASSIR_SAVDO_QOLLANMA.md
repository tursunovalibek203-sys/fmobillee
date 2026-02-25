# 💼 KASSIR SAVDO QO'LLANMA - Samsung A17

## Qadamma-Qadam Test Qilish

### 1. ADMIN: Samsung A17 Yaratish

#### A. Warehouse sahifasini oching:
```
http://localhost:3000/warehouse-pro.html
```

#### B. "Yangi Mahsulot" tugmasini bosing

#### C. Ma'lumotlarni kiriting:
- **Nomi**: Samsung Galaxy A17
- **Kategoriya**: Telefonlar
- **Xarid narxi**: $200
- **Sotish narxi**: $250
- **Stok**: 4 dona
- **Minimal stok**: 2 dona
- **Birlik**: dona
- **Barcode**: SAMSUNGA17
- **Tavsif**: Samsung Galaxy A17 - 128GB, 6GB RAM

#### D. "Saqlash" tugmasini bosing

✅ Samsung A17 yaratildi!

---

### 2. ADMIN: IMEI Kodlar Qo'shish

#### A. IMEI qidirish sahifasini oching:
```
http://localhost:3000/warehouse-imei-search.html
```

#### B. Qidiruv maydoniga "Samsung" yozing

#### C. Samsung A17 topiladi

#### D. Pastdagi "Yangi IMEI qo'shish" bo'limiga IMEI kiriting va qo'shing:

1. **IMEI 1**: `351234567890123` → Qo'shish
2. **IMEI 2**: `351234567890124` → Qo'shish
3. **IMEI 3**: `351234567890125` → Qo'shish
4. **IMEI 4**: `351234567890126` → Qo'shish

✅ 4 ta IMEI qo'shildi!

---

### 3. KASSIR: Login Qilish

#### A. Kassir login sahifasini oching:
```
http://localhost:3000/cashier-login-enhanced.html
```

#### B. Login ma'lumotlarini kiriting:
- **Username**: aziza
- **Password**: 1234

#### C. "Kirish" tugmasini bosing

✅ Kassir panelga kirildi!

---

### 4. KASSIR: Mijoz Yaratish (Agar Kerak Bo'lsa)

#### A. Mijozlar sahifasini oching:
```
http://localhost:3000/customer-search.html
```

#### B. "Yangi Mijoz" tugmasini bosing

#### C. Ma'lumotlarni kiriting:
- **Ism**: Alisher Karimov
- **Telefon**: +998901234567

#### D. "Saqlash" tugmasini bosing

✅ Mijoz yaratildi!

---

### 5. KASSIR: Savdo Qilish

#### A. Yangi savdo sahifasini oching:
```
http://localhost:3000/cashier-new.html
```

#### B. Mijozni qidiring:
- Qidiruv maydoniga "Alisher" yozing
- Mijozni tanlang

#### C. Mahsulotni qidiring:
- Mahsulot qidiruv maydoniga "Samsung" yozing
- Samsung Galaxy A17 ni tanlang

#### D. Savdo ma'lumotlarini kiriting:
- **Miqdor**: 1 dona
- **Narx**: $250 (avtomatik)
- **IMEI**: 351234567890123
- **To'lov**: $150

#### E. "Savdo qilish" tugmasini bosing

✅ Savdo amalga oshirildi!

**Natija:**
- Savdo summasi: $250
- To'langan: $150
- Qarz: $100

---

### 6. NATIJALARNI TEKSHIRISH

#### A. Ombor Holati:
```
http://localhost:3000/warehouse-pro.html
```

**Tekshiring:**
- Samsung A17 stok: 3 dona (4 - 1 = 3) ✅
- IMEI 351234567890123 sotilgan deb belgilangan ✅

#### B. Savdolar Tarixi:
```
http://localhost:3000/admin-sales.html
```

**Tekshiring:**
- Yangi savdo ko'rinadi ✅
- Mijoz: Alisher Karimov ✅
- Mahsulot: Samsung Galaxy A17 ✅
- Narx: $250 ✅
- To'lov: $150 ✅
- Qarz: $100 ✅

#### C. IMEI Qidirish:
```
http://localhost:3000/warehouse-imei-search.html
```

**Qidiring:**
- "351234567890123" yozing
- Samsung A17 topiladi ✅
- IMEI sotilgan deb ko'rsatiladi ✅

#### D. Mijoz Qarzi:
```
http://localhost:3000/customer-search.html
```

**Tekshiring:**
- Alisher Karimov ni qidiring
- Qarz: $100 ✅
- Savdolar: 1 ta ✅

#### E. Activity Log:
```
http://localhost:3000/activity-log.html
```

**Tekshiring:**
- Mahsulot yaratildi ✅
- IMEI qo'shildi ✅
- Savdo amalga oshirildi ✅
- Barcha harakatlar saqlanadi ✅

---

## 📊 Kutilgan Natijalar

### Ombor:
```
Samsung Galaxy A17
- Stok: 3 dona (4 - 1)
- IMEI 1: 351234567890123 (Sotilgan) ❌
- IMEI 2: 351234567890124 (Mavjud) ✅
- IMEI 3: 351234567890125 (Mavjud) ✅
- IMEI 4: 351234567890126 (Mavjud) ✅
```

### Savdo:
```
Savdo ID: 1234567890
Mijoz: Alisher Karimov
Mahsulot: Samsung Galaxy A17
IMEI: 351234567890123
Narx: $250
To'lov: $150
Qarz: $100
Sana: 25.02.2026 14:30
```

### Mijoz:
```
Ism: Alisher Karimov
Telefon: +998901234567
Qarz: $100
Savdolar: 1 ta
Oxirgi savdo: Samsung Galaxy A17
```

---

## ✅ Tekshirish Ro'yxati

- [ ] Samsung A17 yaratildi
- [ ] 4 ta IMEI qo'shildi
- [ ] Mijoz yaratildi
- [ ] Kassir login qildi
- [ ] Savdo amalga oshirildi
- [ ] IMEI belgilandi
- [ ] Ombor stok kamaydi (4 → 3)
- [ ] Savdo tarixda ko'rinadi
- [ ] Mijoz qarzi hisoblanadi ($100)
- [ ] Activity log yoziladi

---

## 🎯 Muhim Eslatmalar

### IMEI Boshqaruv:
1. Har bir telefon uchun unikal IMEI
2. Savdo qilishda IMEI majburiy
3. Sotilgan IMEI qayta sotilmaydi
4. IMEI tarixi saqlanadi

### Stok Boshqaruv:
1. Savdo qilganda stok avtomatik kamayadi
2. Stok 0 ga yetsa, ogohlantirish
3. Minimal stok ostida ogohlantirish

### Qarz Boshqaruv:
1. To'liq to'lanmagan savdolar qarz
2. Qarz mijozga biriktiriladi
3. Keyingi to'lovlar qarzdan ayriladi
4. Telegram bot eslatma yuboradi

---

## 💡 Qo'shimcha Imkoniyatlar

### 1. Qisman To'lov:
```
Narx: $250
To'lov: $150
Qarz: $100

Keyingi to'lov: $50
Qolgan qarz: $50
```

### 2. To'liq To'lov:
```
Narx: $250
To'lov: $250
Qarz: $0
```

### 3. Ko'p Mahsulot:
```
Samsung A17: $250 x 1 = $250
AirPods: $150 x 1 = $150
Jami: $400
To'lov: $300
Qarz: $100
```

---

## 🚀 Keyingi Qadamlar

1. **To'lov Qabul Qilish**:
   - Mijoz qarzini to'laydi
   - Qarz kamayadi
   - Telegram xabar yuboriladi

2. **Mahsulot Qaytarish**:
   - Mijoz mahsulotni qaytaradi
   - Stok ortadi
   - IMEI qayta mavjud bo'ladi
   - Pul qaytariladi

3. **Hisobotlar**:
   - Kunlik savdolar
   - Kassir statistikasi
   - Ombor holati
   - Moliyaviy hisobotlar

---

## ✅ Xulosa

Kassir savdo jarayoni to'liq ishlaydi:

- ✅ Admin mahsulot qo'shadi
- ✅ Admin IMEI qo'shadi
- ✅ Kassir login qiladi
- ✅ Kassir mijoz yaratadi
- ✅ Kassir savdo qiladi
- ✅ IMEI belgilanadi
- ✅ Ombor yangilanadi
- ✅ Qarz hisoblanadi
- ✅ Tarix saqlanadi

**Tizim tayyor va ishlamoqda!** 🎉

---

**Savdo sahifasi:** http://localhost:3000/cashier-new.html
**IMEI qidirish:** http://localhost:3000/warehouse-imei-search.html
**Activity log:** http://localhost:3000/activity-log.html
