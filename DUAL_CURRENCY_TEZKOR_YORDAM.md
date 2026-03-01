# 💱 Dual Currency - Tezkor Yordam

## ⚡ TEZKOR QADAMLAR

### To'lov Qabul Qilish
```
1. Mijozni tanlang
2. So'm YOKI Dollar kiriting
3. "To'lov qabul qilish"
```

### Savdo Qo'shish
```
1. Mijozni tanlang
2. Mahsulot nomini kiriting
3. Narx (So'm YOKI Dollar)
4. To'langan (So'm YOKI Dollar)
5. "Savdo qo'shish"
```

---

## 🔢 VALYUTA KURSI

```
1 USD = 12,500 UZS
```

**Tez hisoblash:**
- 125,000 so'm = $10
- 1,250,000 so'm = $100
- 12,500,000 so'm = $1,000

---

## 💡 MASLAHATLAR

### ✅ QILING
- Faqat bitta inputga kiriting
- Avtomatik konvertatsiyani kuting
- Ikkalasini ham kiritishingiz mumkin

### ❌ QILMANG
- Qo'lda hisoblash
- Ikki inputga bir xil qiymat
- Konvertatsiyani o'zgartirish

---

## 🎯 MISOLLAR

### Oddiy To'lov
```
So'm: 250,000
→ Avtomatik: $20.00
→ Jami: $20.00
```

### Aralash To'lov
```
So'm: 1,250,000 → $100.00
Dollar: $50.00 → 625,000 so'm
→ Jami: $150.00
```

### Savdo
```
Narx: 5,000,000 so'm → $400.00
To'langan: $300.00 → 3,750,000 so'm
→ Qarz: $100.00
```

---

## 🔧 MUAMMOLAR

### Input ishlamayapti?
- Sahifani yangilang (F5)
- Brauzer cache ni tozalang
- Internetni tekshiring

### Konvertatsiya noto'g'ri?
- Valyuta kursini tekshiring
- Serverga ulanishni tekshiring
- Sahifani qayta yuklang

### Savdo saqlanmayapti?
- Internet ulanishini tekshiring
- MongoDB ulanishini tekshiring
- Console da xatolarni ko'ring

---

## 📞 YORDAM

### Qo'llanmalar
- `DUAL_CURRENCY_QOLLANMA.md` - To'liq qo'llanma
- `DUAL_CURRENCY_MISOLLAR.md` - Amaliy misollar
- `DUAL_CURRENCY_TAYYOR.md` - Texnik ma'lumot

### Test
```bash
node test-dual-currency.js
```

---

## 🚀 TEZKOR KLAVIATURA

### Inputlar
- `Tab` - Keyingi inputga o'tish
- `Enter` - Formani yuborish
- `Esc` - Bekor qilish

### Hisoblash
- So'm kiritilsa → Dollar avtomatik
- Dollar kiritilsa → So'm avtomatik
- Ikkalasi ham → Jami dollarda

---

## ✅ TEKSHIRISH RO'YXATI

### To'lov Qabul Qilishdan Oldin
- [ ] Mijoz to'g'ri tanlanganmi?
- [ ] Summa to'g'rimi?
- [ ] Konvertatsiya to'g'rimi?
- [ ] Jami to'g'rimi?

### Savdo Qo'shishdan Oldin
- [ ] Mijoz to'g'ri tanlanganmi?
- [ ] Mahsulot nomi kiritilganmi?
- [ ] Narx to'g'rimi?
- [ ] To'langan to'g'rimi?
- [ ] Qarz to'g'ri hisoblanganmi?

---

## 📊 TEZKOR HISOBLASH

### So'mdan Dollarga
```
125,000 ÷ 12,500 = $10
1,250,000 ÷ 12,500 = $100
12,500,000 ÷ 12,500 = $1,000
```

### Dollardan So'mga
```
$10 × 12,500 = 125,000
$100 × 12,500 = 1,250,000
$1,000 × 12,500 = 12,500,000
```

---

## 🎯 ENG KO'P BERILADIGAN SAVOLLAR

### Q: Ikki inputga ham kiritish kerakmi?
**A:** Yo'q, faqat bitta yetarli. Ikkinchisi avtomatik hisoblanadi.

### Q: Ikkalasini ham kiritish mumkinmi?
**A:** Ha, ikkalasi ham qo'shiladi va jami dollarda ko'rsatiladi.

### Q: Valyuta kursini o'zgartirish mumkinmi?
**A:** Ha, admin paneldan yoki server.js faylidan.

### Q: Balans qaysi valyutada saqlanadi?
**A:** Asosiy balans dollarda, lekin so'm ham alohida saqlanadi.

### Q: Chekda nima ko'rsatiladi?
**A:** Ikki valyuta ham, valyuta kursi va jami summa.

---

## 💾 SAQLASH

### Avtomatik Saqlash
- ✅ To'lov qabul qilinganda
- ✅ Savdo qo'shilganda
- ✅ Ma'lumot o'zgartirilganda

### Qo'lda Saqlash
- Kerak emas, hammasi avtomatik

---

## 🔐 XAVFSIZLIK

### Ma'lumotlar
- ✅ MongoDB da saqlanadi
- ✅ Shifrlangan ulanish
- ✅ Backup avtomatik

### Kirish
- ✅ Login talab qilinadi
- ✅ 24 soat sessiya
- ✅ Xavfsiz parol

---

**Tayyor!** 🚀

**Tezkor yordam:** Bu faylni doim ochiq tuting!
