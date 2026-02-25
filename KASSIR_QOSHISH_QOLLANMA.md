# 📝 KASSIR QO'SHISH - TO'LIQ QO'LLANMA

## 🎯 MAQSAD
Yangi kassir qo'shish va unga login berish

---

## 📋 BOSQICHLAR

### BOSQICH 1: Filial Yaratish (Agar Yo'q Bo'lsa)

#### 1.1 Filiallar Sahifasiga Kiring
```
http://localhost:3000/admin-branches.html
```

#### 1.2 Filial Ma'lumotlarini Kiriting
```
Filial Nomi: Asosiy Filial
Manzil: Toshkent, Chilonzor 12-kvartal
Telefon: +998 71 123 45 67
Menejer: Sardor Karimov
```

#### 1.3 "Filial Qo'shish" Tugmasini Bosing
✅ Filial yaratildi!

---

### BOSQICH 2: Kassir Qo'shish

#### 2.1 Kassirlar Sahifasiga Kiring
```
http://localhost:3000/admin-cashiers.html
```

#### 2.2 Kassir Ma'lumotlarini Kiriting

**Test Kassir 1:**
```
Filial: Asosiy Filial
Ism: Alisher Valiyev
Login: alisher
Parol: 12345
Telefon: +998 90 123 45 67
```

**Test Kassir 2:**
```
Filial: Asosiy Filial
Ism: Dilshod Toshmatov
Login: dilshod
Parol: 12345
Telefon: +998 91 234 56 78
```

**Test Kassir 3:**
```
Filial: Asosiy Filial
Ism: Nodira Rahimova
Login: nodira
Parol: 12345
Telefon: +998 93 345 67 89
```

#### 2.3 "Kassir Qo'shish" Tugmasini Bosing
✅ Kassir yaratildi!

---

### BOSQICH 3: Kassir Login Qilish

#### 3.1 Kassir Panelga Kiring
```
http://localhost:3000/cashier-multi-currency.html
```

#### 3.2 Login Ma'lumotlarini Kiriting
```
Login: alisher
Parol: 12345
```

#### 3.3 "Kirish" Tugmasini Bosing
✅ Kassir tizimga kirdi!

---

## 🎯 KASSIR IMKONIYATLARI

Kassir tizimga kirgandan keyin:

### 1. Savdo Qilish
- Mijoz va mahsulot ma'lumotlarini kiritish
- 3 xil valyutada to'lov qabul qilish (USD, UZS, RUB)
- Avtomatik balans yangilanishi

### 2. Kirim Topshirish
- To'plangan pulni adminga topshirish
- Balansni kamaytirish
- Kirim tarixini saqlash

### 3. Hisobot Ko'rish
- Bugungi savdolarni ko'rish
- Bugungi kirimlarni ko'rish
- Balansni tekshirish
- Hisobotni chop etish

---

## 📊 KASSIR STATISTIKASI

Admin quyidagilarni ko'radi:

### Kassirlar Ro'yxatida:
- Kassir ID
- Ism
- Login
- Telefon
- Filial
- Balans (USD)
- Jami Savdolar
- Faol/Faolsiz holati

### Kassir Batafsil Sahifasida:
- To'liq statistika
- Balans tafsiloti (USD, UZS, RUB)
- Savdolar tarixi
- Kirimlar tarixi
- Kunlik savdolar grafigi

---

## 🔐 XAVFSIZLIK

### Parol Xavfsizligi:
- Hozirda parollar oddiy saqlanadi
- Production da bcrypt bilan hash qilish kerak
- Parolni o'zgartirish funksiyasi qo'shish kerak

### Login Tizimi:
- Username va parol bilan kirish
- LocalStorage da session saqlash
- Logout funksiyasi

---

## 💡 MASLAHATLAR

### Kassir Uchun:
1. ✅ Parolni xavfsiz saqlang
2. ✅ Har kuni kirim topshiring
3. ✅ Balansni muntazam tekshiring
4. ✅ Savdolarni to'g'ri kiriting
5. ✅ Hisobotni kunlik ko'ring

### Admin Uchun:
1. ✅ Kassir parollarini murakkab qiling
2. ✅ Kassirlar balansini nazorat qiling
3. ✅ Kirimlarni muntazam tekshiring
4. ✅ Faolsiz kassirlarni o'chiring
5. ✅ Excel hisobotlarni yuklab oling

---

## 🆘 MUAMMOLARNI YECHISH

### Kassir Qo'shilmayapti
**Sabab:** Filial tanlanmagan
**Yechim:** Avval filial yarating

### Kassir Login Qila Olmayapti
**Sabab:** Login yoki parol noto'g'ri
**Yechim:** Login va parolni tekshiring

### Balans Yangilanmayapti
**Sabab:** Server ishlamayapti
**Yechim:** Serverni qayta ishga tushiring

---

## 📞 YORDAM

Agar muammo yuzaga kelsa:
1. Serverni qayta ishga tushiring: `node server.js`
2. Brauzer cache ni tozalang
3. Internetni tekshiring
4. MongoDB ulanishini tekshiring

---

## 🎉 XULOSA

Endi siz quyidagilarni bilasiz:

✅ Filial qanday yaratish
✅ Kassir qanday qo'shish
✅ Kassir qanday login qilish
✅ Kassir qanday savdo qilish
✅ Kassir qanday kirim topshirish
✅ Kassir qanday hisobot ko'rish

**Omad! Kassirlarni qo'shing va ishlatishni boshlang!** 🚀

---

## 🔗 FOYDALI HAVOLALAR

- Admin Dashboard: http://localhost:3000/admin-dashboard.html
- Filiallar: http://localhost:3000/admin-branches.html
- Kassirlar: http://localhost:3000/admin-cashiers.html
- Kassir Panel: http://localhost:3000/cashier-multi-currency.html
- Kassir Hisobot: http://localhost:3000/cashier-report.html
