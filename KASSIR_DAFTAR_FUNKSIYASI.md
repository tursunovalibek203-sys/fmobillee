# 📖 Kassir Daftar Funksiyasi - To'liq Qo'llanma

## ✅ Yangi Funksiya

Kassirlar endi admin kabi mijozlar daftariga kirib savdo qo'shishi mumkin!

## 🎯 Nima Qo'shildi?

### 1. Mijozlar Daftari Sahifasi
**URL:** `/cashier-customers.html`

**Funksiyalar:**
- ✅ Barcha mijozlarni ko'rish
- ✅ Mijoz qidirish (ism, telefon, ID)
- ✅ Filter (Barchasi, Qarzdorlar, Qarzsizlar)
- ✅ Yangi mijoz qo'shish
- ✅ Mijoz daftariga kirish

**Statistika:**
- Jami mijozlar
- Qarzdorlar soni
- Jami qarz
- Bugungi savdolar

### 2. Mijoz Daftari Sahifasi
**URL:** `/cashier-customer-daftar.html?customerId=123`

**Funksiyalar:**
- ✅ Mijoz ma'lumotlari
- ✅ Qarz holati
- ✅ To'lov qabul qilish
- ✅ Yangi savdo qo'shish
- ✅ IMEI bo'yicha mahsulot qidirish
- ✅ Savdolar tarixi

## 📱 Qanday Ishlatish?

### 1. Kassir Panelidan Kirish

```
Kassir Panel → 📖 Daftar
```

### 2. Mijoz Tanlash

```
Mijozlar ro'yxatidan kerakli mijozni bosing
```

Yoki yangi mijoz qo'shing:
```
+ tugmasi → Mijoz ma'lumotlarini kiriting → Saqlash
```

### 3. Savdo Qo'shish

**A. IMEI bo'yicha qidirish:**
```
1. IMEI qidirish maydoniga kod kiriting
2. Mahsulot avtomatik topiladi
3. Narx avtomatik to'ldiriladi
4. Berilgan pulni kiriting
5. "Savdo qo'shish" tugmasini bosing
```

**B. Qo'lda kiritish:**
```
1. Mahsulot nomini kiriting
2. Narxni kiriting
3. Berilgan pulni kiriting
4. "Savdo qo'shish" tugmasini bosing
```

### 4. To'lov Qabul Qilish

```
1. To'lov miqdorini kiriting
2. "To'lov qabul qilish" tugmasini bosing
```

## 🔧 Texnik Tafsilotlar

### API Endpoints

**Mijozlar:**
```
GET  /api/customers                    - Barcha mijozlar
POST /api/customers                    - Yangi mijoz
GET  /api/customers/search/:customerId - Mijoz qidirish
```

**Savdolar:**
```
GET  /api/cashier-sales?customerId=123  - Mijoz savdolari
POST /api/cashier-sales                 - Yangi savdo
```

**IMEI:**
```
GET  /api/warehouse/search-imei/:imei   - IMEI qidirish
POST /api/warehouse/sell-item           - IMEI sotish
```

### Savdo Ma'lumotlari

```javascript
{
  saleId: 1707745200000,
  cashierId: 5,
  cashierName: "Alisher Karimov",
  branchId: 1,
  customerId: 123456,
  customerName: "Sardor Rahimov",
  product: "iPhone 14 Pro Max",
  price: 1000,
  paidUSD: 500,
  date: "12.02.2025",
  time: "14:30",
  type: "sale",  // yoki "payment"
  imei: "123456789012345"
}
```

### IMEI Sotish

Savdo qo'shilganda:
1. ✅ Savdo CashierSale ga saqlanadi
2. ✅ IMEI ProductItem da "sold" statusga o'zgaradi
3. ✅ Mahsulot stock -1 ga kamayadi
4. ✅ Kassir balance +paidUSD ga oshadi

## 🎨 Dizayn

### Mijozlar Daftari:
- **Gradient:** Yashil (#10b981 → #047857)
- **Kartalar:** Oq, hover effekt
- **Qarz:** Qizil rang
- **Qarzsiz:** Yashil belgi

### Mijoz Daftari:
- **Gradient:** Binafsha (#8b5cf6 → #6d28d9)
- **Qarz karta:** Qizil (qarz bor) / Yashil (qarzsiz)
- **IMEI qidiruv:** Binafsha border
- **Yozuvlar:** Savdo (ko'k) / To'lov (yashil)

## 📊 Misol Workflow

### Yangi Mijoz va Savdo:

```
1. Kassir Panel → 📖 Daftar

2. + tugmasi → Yangi mijoz
   - Ism: Sardor Rahimov
   - Telefon: +998901234567
   - Saqlash

3. Sardor kartasini bosish

4. IMEI qidirish: 123456789012345
   - iPhone 14 Pro Max topildi
   - Narx: $1,000

5. Berilgan pul: $500
   - Qarz: $500

6. Savdo qo'shish

Natija:
- Savdo qo'shildi
- IMEI sotilgan
- Kassir balansiga $500 qo'shildi
- Mijoz qarzi $500
```

### To'lov Qabul Qilish:

```
1. Mijoz daftariga kirish

2. To'lov miqdori: $300

3. To'lov qabul qilish

Natija:
- To'lov qo'shildi
- Kassir balansiga $300 qo'shildi
- Mijoz qarzi $200 ga kamaydi
```

## 🔒 Xavfsizlik

### Ruxsatlar:
- ✅ Faqat login qilgan kassirlar
- ✅ Kassir faqat o'z filiali mahsulotlarini sotadi
- ✅ Session timeout (24 soat)

### Validatsiya:
- ✅ Narx 0 dan katta bo'lishi kerak
- ✅ To'lov manfiy bo'lishi mumkin emas
- ✅ IMEI mavjudligini tekshirish
- ✅ Mijoz mavjudligini tekshirish

### Activity Log:
- ✅ Har bir savdo loglanadi
- ✅ Kassir ID saqlanadi
- ✅ Vaqt belgisi
- ✅ IP address (kelajakda)

## 📈 Statistika

### Kassir Panelida:
```
Bugungi savdo: $3,500
Bugungi savdolar: 12 ta
Kassadagi pul: $2,800
```

### Mijozlar Daftarida:
```
Jami mijozlar: 150
Qarzdorlar: 45
Jami qarz: $15,000
Bugungi savdolar: 12
```

### Mijoz Daftarida:
```
Jami: $5,000
To'langan: $3,500
Qarz: $1,500
Yozuvlar: 25 ta
```

## 🎯 Admin vs Kassir

### Bir xil funksiyalar:
- ✅ Mijozlar ro'yxati
- ✅ Mijoz qo'shish
- ✅ Savdo qo'shish
- ✅ To'lov qabul qilish
- ✅ IMEI qidirish
- ✅ Tarix ko'rish

### Farqlar:
- ❌ Kassir mijozni o'chira olmaydi
- ❌ Kassir savdoni o'chira olmaydi
- ❌ Kassir faqat o'z filiali mahsulotlarini ko'radi
- ✅ Admin barcha filiallarni ko'radi
- ✅ Admin barcha kassirlarni ko'radi

## 🚀 Afzalliklar

### Kassir uchun:
- ✅ Tez savdo qo'shish
- ✅ IMEI avtomatik qidirish
- ✅ Mijoz tarixi ko'rish
- ✅ To'lov qabul qilish
- ✅ Qarz kuzatish

### Admin uchun:
- ✅ Kassir faoliyatini kuzatish
- ✅ Har bir savdo loglanadi
- ✅ Kassir balansini bilish
- ✅ Filial statistikasi

### Mijoz uchun:
- ✅ Tez xizmat
- ✅ Aniq hisob
- ✅ Telegram eslatma (agar chatId bo'lsa)

## 📱 Mobile Responsive

Barcha sahifalar mobile uchun optimallashtirilgan:
- ✅ Responsive grid
- ✅ Touch-friendly buttons
- ✅ Adaptive font sizes
- ✅ Swipe gestures

## 🔄 Real-time Yangilanish

- ✅ Savdo qo'shilganda statistika yangilanadi
- ✅ To'lov qabul qilinganda qarz yangilanadi
- ✅ IMEI sotilganda stock yangilanadi
- ✅ Kassir balansi real-time

## 📞 Yordam

Savollar bo'lsa:
- 📧 Email: support@dokon.uz
- 📱 Telegram: @dokon_support

---

**Versiya:** 3.4  
**Sana:** 2025-02-12  
**Status:** ✅ Tayyor
