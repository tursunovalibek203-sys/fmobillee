# 🧪 KASSIR TIZIMI TO'LIQ TEST QO'LLANMASI

## 📋 Test Rejasi

### 1. Avtomatik Test
### 2. Qo'lda Test
### 3. Ma'lumotlar Tekshiruvi
### 4. Tarix Tekshiruvi

---

## 🤖 1. AVTOMATIK TEST

### Test Faylini Ishga Tushirish:

```bash
node test-kassir-toliq-tizim.js
```

### Test Qamrovi:

✅ **Mahsulotlar API** (8 test)
- Barcha mahsulotlar
- Filial bo'yicha mahsulotlar
- Kam qolgan mahsulotlar
- Mahsulot tuzilishi
- BranchId mavjudligi

✅ **Mijozlar API** (6 test)
- Barcha mijozlar
- Filial bo'yicha mijozlar
- Mijoz tuzilishi
- Qarz ma'lumoti (NaN emas)

✅ **Savdolar API** (8 test)
- Barcha savdolar
- Bugungi savdolar
- Savdo tuzilishi
- Sana va vaqt

✅ **Kassirlar API** (4 test)
- Barcha kassirlar
- Kassir tuzilishi
- BranchId mavjudligi

✅ **Statistika API** (6 test)
- Umumiy statistika
- Qarz NaN emas
- Daromad NaN emas

✅ **Filiallar API** (2 test)
- Barcha filiallar
- Filial tuzilishi

✅ **Kirim Topshirish** (2 test)
- Barcha kirimlar
- Kirim tuzilishi

✅ **Tarix va Log** (2 test)
- Faoliyat tarixi
- Ombor tarixi

**Jami: 38+ test**

---

## 👨‍💻 2. QO'LDA TEST

### A. LOGIN TEST

#### 1. Kassir Login Sahifasi
```
URL: http://localhost:3000/cashier-login-enhanced.html
```

**Test Qadamlari:**
1. ✅ Sahifa ochiladi
2. ✅ Username va parol maydonlari ko'rinadi
3. ✅ Login tugmasi ishlaydi
4. ✅ Noto'g'ri parol xato beradi
5. ✅ To'g'ri login qilganda kassir panelga o'tadi

**Test Ma'lumotlari:**
```
Username: kassir1
Parol: 123456
```

**Tekshirish:**
- localStorage da `cashierData` saqlanadi
- `branchId` mavjud
- `cashierName` to'g'ri

---

### B. KASSIR PANEL TEST

#### 2. Asosiy Panel (cashier-new.html)
```
URL: http://localhost:3000/cashier-new.html
```

**Test Qadamlari:**

**2.1. Sidebar Test:**
1. ✅ Chap tomonda sidebar ko'rinadi
2. ✅ Kassir ismi va filial ko'rsatiladi
3. ✅ Barcha menyu elementlari mavjud
4. ✅ Mobilda ☰ tugmasi ishlaydi
5. ✅ Menyu elementlari bosilganda sahifa ochiladi

**2.2. Statistika Test:**
1. ✅ Bugungi savdolar ko'rsatiladi
2. ✅ Bugungi daromad ko'rsatiladi
3. ✅ Jami balans ko'rsatiladi
4. ✅ Kirim berilgan summa ko'rsatiladi
5. ✅ Raqamlar NaN emas

**2.3. Mahsulotlar Test:**
1. ✅ Mahsulotlar ro'yxati yuklanadi
2. ✅ Faqat o'z filiali mahsulotlari ko'rinadi
3. ✅ Mahsulot qidirish ishlaydi
4. ✅ Mahsulot tanlash ishlaydi
5. ✅ Narx va qoldiq to'g'ri ko'rsatiladi

**2.4. Mijoz Tanlash Test:**
1. ✅ Mijozlar dropdown ochiladi
2. ✅ Barcha mijozlar ro'yxati ko'rinadi
3. ✅ Mijoz tanlanganda ma'lumotlar to'ldiriladi
4. ✅ Mijoz ID bilan qidirish ishlaydi
5. ✅ Qarz summasi to'g'ri ko'rsatiladi

**2.5. Savdo Qilish Test:**
1. ✅ Mijoz tanlanadi
2. ✅ Mahsulot tanlanadi
3. ✅ Miqdor kiritiladi
4. ✅ Savat ga qo'shiladi
5. ✅ Jami summa hisoblanadi
6. ✅ To'lov kiritiladi
7. ✅ Savdo yakunlanadi
8. ✅ Xabar ko'rsatiladi

---

### C. SAVDO TARIXI TEST

#### 3. Savdo Tarixi (cashier-history-enhanced.html)
```
URL: http://localhost:3000/cashier-history-enhanced.html
```

**Test Qadamlari:**
1. ✅ Barcha savdolar ko'rsatiladi
2. ✅ Sana bo'yicha filtr ishlaydi
3. ✅ Mijoz bo'yicha filtr ishlaydi
4. ✅ Savdo tafsilotlari ko'rsatiladi
5. ✅ Qarz va to'lov to'g'ri
6. ✅ Chek chop etish ishlaydi

---

### D. KIRIM BERISH TEST

#### 4. Kirim Topshirish
```
Sidebar → 💵 Kirim Berish
```

**Test Qadamlari:**
1. ✅ Kirim berish oynasi ochiladi
2. ✅ Joriy balans ko'rsatiladi
3. ✅ Summa kiritiladi
4. ✅ Izoh qo'shiladi
5. ✅ Kirim topshiriladi
6. ✅ Balans yangilanadi
7. ✅ Tarixda saqlanadi

---

### E. HISOBOTLAR TEST

#### 5. Kunlik Hisobot (cashier-report.html)
```
URL: http://localhost:3000/cashier-report.html
```

**Test Qadamlari:**
1. ✅ Bugungi savdolar ko'rsatiladi
2. ✅ Jami daromad to'g'ri
3. ✅ Jami qarz to'g'ri
4. ✅ Mijozlar soni to'g'ri
5. ✅ Excel yuklab olish ishlaydi
6. ✅ Chop etish ishlaydi

---

## 📊 3. MA'LUMOTLAR TEKSHIRUVI

### A. MongoDB Ma'lumotlar

#### Mahsulotlar Collection:
```javascript
// Tekshirish
db.warehouseproducts.find().limit(5)

// Kerakli maydonlar:
- productId ✅
- branchId ✅
- name ✅
- sellPrice ✅
- stock ✅
- isActive ✅
```

#### Mijozlar Collection:
```javascript
// Tekshirish
db.customers.find().limit(5)

// Kerakli maydonlar:
- customerId ✅
- name ✅
- phone ✅
- branchId ✅
- totalDebt ✅ (NaN emas)
```

#### Savdolar Collection:
```javascript
// Tekshirish
db.sales.find().sort({createdAt: -1}).limit(5)

// Kerakli maydonlar:
- saleId ✅
- cashierId ✅
- customerId ✅
- product ✅
- price ✅
- paid ✅
- date ✅
- time ✅
```

---

### B. LocalStorage Ma'lumotlar

#### Browser Console da tekshirish:
```javascript
// Kassir ma'lumotlari
console.log(JSON.parse(localStorage.getItem('cashierData')));

// Kerakli maydonlar:
{
  cashierId: 1,
  name: "Kassir Ismi",
  branchId: 1001,
  branchName: "Filial Nomi",
  username: "kassir1",
  role: "cashier",
  loginTime: "2026-02-28T..."
}
```

---

## 📋 4. TARIX TEKSHIRUVI

### A. Savdo Tarixi

**Tekshirish:**
1. ✅ Yangi savdo qiling
2. ✅ Savdo tarixiga o'ting
3. ✅ Yangi savdo ro'yxatda ko'rinadi
4. ✅ Barcha ma'lumotlar to'g'ri
5. ✅ Sana va vaqt to'g'ri

### B. Kirim Tarixi

**Tekshirish:**
1. ✅ Kirim bering
2. ✅ Admin panelga o'ting
3. ✅ Kirimlar ro'yxatida ko'rinadi
4. ✅ Summa to'g'ri
5. ✅ Kassir ismi to'g'ri

### C. Faoliyat Tarixi

**Tekshirish:**
```
URL: http://localhost:3000/activity-log.html
```

1. ✅ Barcha harakatlar yozilgan
2. ✅ Savdolar ko'rinadi
3. ✅ Kirimlar ko'rinadi
4. ✅ Mahsulot qo'shish ko'rinadi
5. ✅ Sana va vaqt to'g'ri

---

## ✅ TEST NATIJALARI JADVALI

| # | Test Nomi | Status | Izoh |
|---|-----------|--------|------|
| 1 | Login | ⏳ | Test qiling |
| 2 | Sidebar | ⏳ | Test qiling |
| 3 | Statistika | ⏳ | Test qiling |
| 4 | Mahsulotlar | ⏳ | Test qiling |
| 5 | Mijoz Tanlash | ⏳ | Test qiling |
| 6 | Savdo Qilish | ⏳ | Test qiling |
| 7 | Savdo Tarixi | ⏳ | Test qiling |
| 8 | Kirim Berish | ⏳ | Test qiling |
| 9 | Hisobotlar | ⏳ | Test qiling |
| 10 | Ma'lumotlar | ⏳ | Test qiling |

**Status:**
- ⏳ Kutilmoqda
- ✅ O'tdi
- ❌ Xato
- ⚠️ Ogohlantirish

---

## 🔍 MUAMMOLARNI TOPISH

### Agar mahsulotlar ko'rinmasa:

1. **API ni tekshiring:**
```bash
curl http://localhost:3000/api/products?branchId=1001
```

2. **Browser Console:**
```javascript
fetch('/api/products?branchId=1001')
  .then(r => r.json())
  .then(d => console.log(d))
```

3. **Test sahifasini oching:**
```
http://localhost:3000/test-ombor-api.html
```

### Agar mijozlar ko'rinmasa:

1. **API ni tekshiring:**
```bash
curl http://localhost:3000/api/customers?branchId=1001
```

2. **LocalStorage ni tekshiring:**
```javascript
console.log(localStorage.getItem('cashierData'))
```

### Agar qarz NaN bo'lsa:

1. **Serverni qayta ishga tushiring**
2. **Cache ni tozalang:** Ctrl + Shift + Delete
3. **Hard refresh:** Ctrl + F5

---

## 📝 TEST HISOBOTI NAMUNASI

```
🧪 KASSIR TIZIMI TEST HISOBOTI
Sana: 2026-02-28
Tester: [Ism]

✅ O'tgan testlar: 35/38
❌ Xato testlar: 3/38
📈 Foiz: 92.1%

XATOLAR:
1. Mahsulot qidirish sekin ishlayapti
2. Sidebar mobilda ba'zan yopilmayapti
3. Kirim berish xabar ko'rsatmayapti

TAVSIYALAR:
1. Qidirish tezligini oshirish
2. Sidebar animatsiyasini tuzatish
3. Xabar ko'rsatish qo'shish
```

---

## 🎯 YAKUNIY TEKSHIRUV RO'YXATI

- [ ] Avtomatik test 100% o'tdi
- [ ] Login ishlayapti
- [ ] Sidebar ko'rinadi
- [ ] Mahsulotlar yuklanadi
- [ ] Mijozlar dropdown ishlaydi
- [ ] Savdo qilish ishlayapti
- [ ] Savdo tarixda saqlanadi
- [ ] Kirim berish ishlayapti
- [ ] Hisobotlar to'g'ri
- [ ] Ma'lumotlar MongoDB da
- [ ] Qarz NaN emas
- [ ] Mobile responsive
- [ ] Barcha sahifalar ishlaydi

---

**Sana:** 2026-02-28
**Versiya:** 1.0
**Status:** Test Tayyor
