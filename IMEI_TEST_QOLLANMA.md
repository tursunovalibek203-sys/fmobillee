# 🧪 IMEI TEST QO'LLANMA

## Samsung A17 ga 4 ta IMEI Qo'shish va Qidirish

### 1. Brauzerda Test Qilish (Eng Oson)

#### A. IMEI Qidirish Sahifasini Ochish

```
http://localhost:3000/warehouse-imei-search.html
```

#### B. Mahsulot Yaratish (Agar Yo'q Bo'lsa)

1. Yangi tab ochib warehouse-pro.html ga kiring:
   ```
   http://localhost:3000/warehouse-pro.html
   ```

2. "Yangi Mahsulot" tugmasini bosing

3. Ma'lumotlarni kiriting:
   - **Nomi**: Samsung Galaxy A17
   - **Kategoriya**: Telefonlar
   - **Xarid narxi**: $200
   - **Sotish narxi**: $250
   - **Stok**: 4 dona
   - **Barcode**: SAMSUNGA17

4. "Saqlash" tugmasini bosing

#### C. IMEI Qo'shish

1. IMEI qidirish sahifasiga qayting:
   ```
   http://localhost:3000/warehouse-imei-search.html
   ```

2. Qidiruv maydoniga "Samsung" yozing

3. Samsung A17 topiladi

4. Pastdagi "Yangi IMEI qo'shish" bo'limiga IMEI kiriting:
   ```
   351234567890123
   ```

5. "Qo'shish" tugmasini bosing

6. Yana 3 ta IMEI qo'shing:
   ```
   351234567890124
   351234567890125
   351234567890126
   ```

#### D. IMEI Qidirish

Qidiruv maydoniga quyidagilardan birini kiriting:

1. **To'liq IMEI**:
   ```
   351234567890123
   ```
   Natija: ✅ Samsung A17 topiladi, IMEI sariq rangda

2. **Qisman IMEI (boshlanishi)**:
   ```
   351234
   ```
   Natija: ✅ Samsung A17 topiladi

3. **Qisman IMEI (oxiri)**:
   ```
   0123
   ```
   Natija: ✅ Samsung A17 topiladi

4. **Mahsulot nomi**:
   ```
   Samsung
   ```
   Natija: ✅ Samsung A17 topiladi

5. **Barcode**:
   ```
   SAMSUNG
   ```
   Natija: ✅ Samsung A17 topiladi

---

### 2. API Orqali Test (Qo'lda)

#### A. Mahsulot Yaratish

**Postman yoki curl:**

```bash
POST http://localhost:3000/api/products
Content-Type: application/json

{
  "name": "Samsung Galaxy A17",
  "category": "Telefonlar",
  "buyPrice": 200,
  "sellPrice": 250,
  "stock": 4,
  "barcode": "SAMSUNGA17",
  "imeis": [
    "351234567890123",
    "351234567890124",
    "351234567890125",
    "351234567890126"
  ]
}
```

#### B. Mahsulotlarni Olish

```bash
GET http://localhost:3000/api/products
```

Response'da `imeis` array ko'rinishi kerak.

#### C. IMEI Qo'shish (Mavjud Mahsulotga)

```bash
POST http://localhost:3000/api/products
Content-Type: application/json

{
  "productId": 1234,
  "name": "Samsung Galaxy A17",
  "category": "Telefonlar",
  "buyPrice": 200,
  "sellPrice": 250,
  "stock": 4,
  "barcode": "SAMSUNGA17",
  "imeis": [
    "351234567890123",
    "351234567890124",
    "351234567890125",
    "351234567890126",
    "351234567890127"
  ]
}
```

---

### 3. Avtomatik Test (Node.js)

```bash
node test-imei-simple.js
```

Bu test:
1. Samsung A17 yaratadi
2. 4 ta IMEI qo'shadi
3. Mahsulotni qayta oladi
4. IMEI'larni ko'rsatadi

---

### 4. Muammolarni Hal Qilish

#### Muammo 1: IMEI saqlanmayapti

**Yechim:**
1. Server.js'da Product schema'ni tekshiring
2. `imeis: [String]` mavjudligini tasdiqlang
3. Serverni qayta ishga tushiring:
   ```bash
   node server.js
   ```

#### Muammo 2: IMEI qidirilmayapti

**Yechim:**
1. Browser console'ni oching (F12)
2. Xatolarni ko'ring
3. `allProducts` array'da `imeis` borligini tekshiring

#### Muammo 3: IMEI qo'shilmayapti

**Yechim:**
1. Network tab'ni oching (F12)
2. Request body'ni ko'ring
3. `imeis` array yuborilayotganini tekshiring

---

### 5. Kutilgan Natija

#### Brauzerda:

```
┌─────────────────────────────────────────┐
│  Samsung Galaxy A17         ID: 1234    │
│                                         │
│  Kategoriya: Telefonlar                 │
│  Sotish Narxi: $250                     │
│  Stok: 4 dona                           │
│  Barcode: SAMSUNGA17                    │
│                                         │
│  📱 IMEI Kodlar              4 ta       │
│  ┌─────────────────┐ ┌─────────────┐   │
│  │ 351234567890123 │ │ 3512345...  │   │
│  └─────────────────┘ └─────────────┘   │
│  ┌─────────────────┐ ┌─────────────┐   │
│  │ 351234567890125 │ │ 3512345...  │   │
│  └─────────────────┘ └─────────────┘   │
│                                         │
│  Yangi IMEI qo'shish:                   │
│  [15 raqamli IMEI]  [➕ Qo'shish]      │
└─────────────────────────────────────────┘
```

#### Qidiruv Natijasi:

Qidiruv: "351234"

```
✅ 1 ta mahsulot topildi

Samsung Galaxy A17
- 4 ta IMEI
- Topilgan IMEI'lar sariq rangda highlight
```

---

### 6. Tekshirish Ro'yxati

- [ ] Server ishlamoqda (`node server.js`)
- [ ] Mahsulot yaratildi
- [ ] 4 ta IMEI qo'shildi
- [ ] IMEI qidirish sahifasi ochiladi
- [ ] IMEI bo'yicha qidirish ishlaydi
- [ ] Mahsulot nomi bo'yicha qidirish ishlaydi
- [ ] Barcode bo'yicha qidirish ishlaydi
- [ ] Topilgan IMEI highlight qilinadi
- [ ] Yangi IMEI qo'shish ishlaydi

---

### 7. Yordam

Agar muammo bo'lsa:

1. **Server loglarini tekshiring**:
   ```
   Terminal'da server.js ishlab turgan joyni ko'ring
   ```

2. **Browser console'ni tekshiring**:
   ```
   F12 → Console → Xatolarni o'qing
   ```

3. **MongoDB'ni tekshiring**:
   ```
   Mahsulot saqlanganini tasdiqlang
   ```

4. **API'ni test qiling**:
   ```
   http://localhost:3000/api/products
   ```

---

## ✅ Xulosa

IMEI qidirish tizimi tayyor va ishlaydi!

Test qilish uchun:
1. Brauzerda `warehouse-imei-search.html` oching
2. Samsung A17 yarating
3. 4 ta IMEI qo'shing
4. Qidiring va natijani ko'ring

**Omad!** 🚀
