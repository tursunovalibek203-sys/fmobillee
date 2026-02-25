# 📖 QANDAY ISHLATISH - TO'LIQ QO'LLANMA

## 🚀 1. TIZIMNI ISHGA TUSHIRISH

### Serverni Ishga Tushirish
```bash
node server.js
```

Server ishga tushganda quyidagi xabarni ko'rasiz:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 DO'KON BOSHQARUV TIZIMI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server: http://localhost:3000
📊 Admin: http://localhost:3000/admin.html
💾 MongoDB: ✅ Ulangan
🤖 Telegram Bot: ✅ Faol
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Brauzerda Ochish
Admin Dashboard: **http://localhost:3000/admin-dashboard.html**

## 📋 2. FILIAL QO'SHISH

### Qadam 1: Filiallar Sahifasiga Kirish
1. Admin Dashboard ni oching
2. "🏢 Filiallar" kartochkasini bosing
3. Yoki to'g'ridan: http://localhost:3000/admin-branches.html

### Qadam 2: Filial Ma'lumotlarini Kiriting
```
Filial Nomi: Chilonzor Filiali
Manzil: Chilonzor 12-kvartal, 5-uy
Telefon: +998 90 123 45 67
Menejer: Alisher Valiyev
```

### Qadam 3: Saqlash
"Filial Qo'shish" tugmasini bosing

### Natija
✅ Filial MongoDB ga saqlandi
✅ Filial Excel ga yozildi (`Filiallar_Hisobot.xlsx`)
✅ Filial ro'yxatida ko'rinadi

## 👤 3. KASSIR QO'SHISH

### Qadam 1: Kassirlar Sahifasiga Kirish
1. Admin Dashboard ni oching
2. "👤 Kassirlar" kartochkasini bosing
3. Yoki to'g'ridan: http://localhost:3000/admin-cashiers.html

### Qadam 2: Kassir Ma'lumotlarini Kiriting
```
Filial: Chilonzor Filiali (dropdown dan tanlang)
Ism: Sardor Karimov
Login: sardor_kassir
Parol: 12345
Telefon: +998 91 234 56 78
```

### Qadam 3: Saqlash
"Kassir Qo'shish" tugmasini bosing

### Natija
✅ Kassir MongoDB ga saqlandi
✅ Kassir Excel ga yozildi (`Kassirlar_Hisobot.xlsx`)
✅ Kassir ro'yxatida ko'rinadi
✅ Kassir login qila oladi

## 💰 4. KASSIR SAVDO QILISH

### Qadam 1: Kassir Login Qilish
1. Kassir sahifasini oching: http://localhost:3000/cashier-multi-currency.html
2. Login va parolni kiriting
3. "Kirish" tugmasini bosing

### Qadam 2: Mahsulot va Mijoz Ma'lumotlarini Kiriting
```
Mijoz ID: 1001
Mijoz Ismi: Vali Toshmatov
Mahsulot: iPhone 15 Pro Max
Narx: $1200
```

### Qadam 3: Valyutani Tanlang
3 ta variant:
- **USD** - Dollar
- **UZS** - So'm (avtomatik konvertatsiya: 1 USD = 12,500 UZS)
- **RUB** - Rubl (avtomatik konvertatsiya: 1 USD = 90 RUB)

Misol:
```
Valyuta: UZS
To'lov: 15,000,000 so'm
Avtomatik hisob: $1200 (15,000,000 ÷ 12,500)
```

### Qadam 4: Savdo Qilish
"Savdo Qilish" tugmasini bosing

### Natija
✅ Savdo MongoDB ga saqlandi
✅ Savdo Excel ga yozildi (`Savdolar_Chilonzor_Filiali.xlsx`)
✅ Kassir balansi yangilandi:
   - Agar USD: balanceUSD += $1200
   - Agar UZS: balanceUZS += 15,000,000 so'm
   - Agar RUB: balanceRUB += 108,000 rubl
✅ Umumiy balans (USD ekvivalenti) yangilandi

## 💸 5. KIRIM TOPSHIRISH

### Qadam 1: Kassir Balansini Tekshirish
Kassir panelida balansni ko'ring:
```
Balans:
- USD: $500
- UZS: 2,500,000 so'm
- Umumiy: $700 (USD ekvivalenti)
```

### Qadam 2: Kirim Topshirish
1. "Kirim Topshirish" tugmasini bosing
2. Miqdorni kiriting (USD da): $600
3. Izoh qo'shing (ixtiyoriy): "Kunlik kirim"
4. "Topshirish" tugmasini bosing

### Qadam 3: Tasdiqlash
Kassir balansi kamayadi:
```
Oldingi balans: $700
Topshirildi: $600
Yangi balans: $100
```

### Natija
✅ Kirim MongoDB ga saqlandi
✅ Kirim Excel ga yozildi (`Kirim_Topshirish_Hisobot.xlsx`)
✅ Kassir balansi yangilandi
✅ Admin kirimni ko'radi

## 📊 6. ADMIN NAZORAT

### Filiallarni Ko'rish
1. Admin Dashboard → Filiallar
2. Barcha filiallar ro'yxati
3. Har bir filial uchun:
   - ID, nom, manzil, telefon, menejer
   - Faol/Faolsiz holati
   - Jami savdolar
   - Faollashtirish/Faolsizlantirish

### Kassirlarni Ko'rish
1. Admin Dashboard → Kassirlar
2. Barcha kassirlar ro'yxati
3. Filial bo'yicha filter
4. Har bir kassir uchun:
   - ID, ism, login, telefon
   - Qaysi filialga tegishli
   - Balans (USD, UZS, RUB)
   - Jami savdolar
   - Kirimlar sahifasiga o'tish

### Kirimlarni Ko'rish
1. Admin Dashboard → Kirimlar
2. Barcha kirimlar ro'yxati
3. Kassir bo'yicha filter
4. Har bir kirim uchun:
   - Kirim ID
   - Kassir nomi
   - Miqdor
   - Oldingi va keyingi balans
   - Sana va vaqt
   - Izoh

### Statistikani Ko'rish
Admin Dashboard da:
- Jami filiallar / Faol filiallar
- Jami kassirlar / Faol kassirlar
- Jami kirimlar / Bugungi kirimlar
- Jami mahsulotlar / Kam qolganlar
- Jami savdolar / Bugungi savdolar
- Jami mijozlar / Qarzda

## 📁 7. EXCEL FAYLLAR

### Excel Fayllar Joylashuvi
Barcha Excel fayllar `excel-files/` papkasida:

```
excel-files/
├── Filiallar_Hisobot.xlsx
├── Kassirlar_Hisobot.xlsx
├── Savdolar_Chilonzor_Filiali.xlsx
├── Savdolar_Asosiy_Filial.xlsx
├── Kirim_Topshirish_Hisobot.xlsx
├── Ombor_Chilonzor_Filiali.xlsx
└── Ombor_Asosiy_Filial.xlsx
```

### Excel Fayllarni Ochish
1. `excel-files/` papkasiga o'ting
2. Kerakli faylni oching
3. Barcha ma'lumotlar real-time yangilanadi

### Excel Fayl Tuzilishi

#### Filiallar_Hisobot.xlsx
| Filial ID | Nom | Manzil | Telefon | Menejer | Faol | Jami Savdolar | Sana |
|-----------|-----|--------|---------|---------|------|---------------|------|

#### Kassirlar_Hisobot.xlsx
| Kassir ID | Filial | Ism | Login | Telefon | Balans | Jami Savdolar | Sana |
|-----------|--------|-----|-------|---------|--------|---------------|------|

#### Savdolar_[Filial].xlsx
| Savdo ID | Sana | Vaqt | Filial | Kassir | Mijoz | Mahsulot | Narx | To'landi | Valyuta |
|----------|------|------|--------|--------|-------|----------|------|----------|---------|

#### Kirim_Topshirish_Hisobot.xlsx
| Kirim ID | Sana | Vaqt | Filial | Kassir | Miqdor | Oldingi Balans | Keyingi Balans | Izoh |
|----------|------|------|--------|--------|--------|----------------|----------------|------|

## 🔄 8. KUNDALIK ISH JARAYONI

### Ertalab (Kassir)
1. Kassir login qiladi
2. Balansni tekshiradi
3. Savdo qilishni boshlaydi

### Kun Davomida (Kassir)
1. Mijozlar keladi
2. Mahsulot va mijoz ma'lumotlarini kiritadi
3. Valyutani tanlaydi (USD/UZS/RUB)
4. Savdo qiladi
5. Balans to'planadi

### Kechqurun (Kassir)
1. Balansni tekshiradi
2. Kirim topshirish tugmasini bosadi
3. Miqdorni kiritadi
4. Adminga topshiradi
5. Balans kamayadi

### Har Kuni (Admin)
1. Admin Dashboard ni ochadi
2. Barcha filiallar statistikasini ko'radi
3. Kassirlar balansini tekshiradi
4. Kirimlarni ko'radi
5. Excel fayllarni yuklab oladi
6. Tahlil qiladi

## 💡 9. MASLAHATLAR

### Kassir Uchun
- ✅ Har doim to'g'ri valyutani tanlang
- ✅ Mijoz ma'lumotlarini to'g'ri kiriting
- ✅ Balansni muntazam tekshiring
- ✅ Kunlik kirim topshiring
- ✅ Parolni xavfsiz saqlang

### Admin Uchun
- ✅ Har kuni statistikani tekshiring
- ✅ Kassirlar balansini nazorat qiling
- ✅ Excel fayllarni muntazam yuklab oling
- ✅ Filiallar faoliyatini taqqoslang
- ✅ Kam qolgan mahsulotlarni kuzating

### Xavfsizlik
- ✅ Parollarni xavfsiz saqlang
- ✅ Kassirlarni faolsizlantiring (agar kerak bo'lsa)
- ✅ Filiallarni faolsizlantiring (agar kerak bo'lsa)
- ✅ Kirimlarni muntazam tekshiring
- ✅ Excel fayllarni backup qiling

## 🆘 10. MUAMMOLARNI YECHISH

### Server Ishlamayapti
```bash
# Serverni qayta ishga tushiring
node server.js
```

### MongoDB Ulanmayapti
- ✅ Tizim avtomatik JSON fallback ga o'tadi
- ✅ Ma'lumotlar JSON fayllarida saqlanadi
- ✅ Barcha funksiyalar ishlaydi

### Excel Fayl Ochilmayapti
- ✅ `excel-files/` papkasini tekshiring
- ✅ Fayl nomini to'g'ri yozing
- ✅ Excel dasturini qayta oching

### Kassir Login Qila Olmayapti
- ✅ Login va parolni tekshiring
- ✅ Kassir faol ekanligini tekshiring
- ✅ Serverni qayta ishga tushiring

### Savdo Qo'shilmayapti
- ✅ Barcha maydonlarni to'ldiring
- ✅ Valyutani tanlang
- ✅ Internetni tekshiring
- ✅ Serverni qayta ishga tushiring

## 📞 11. YORDAM

### Texnik Yordam
Agar muammo yuzaga kelsa:
1. Serverni qayta ishga tushiring
2. Brauzer cache ni tozalang
3. Internetni tekshiring
4. Excel fayllarni tekshiring

### Qo'shimcha Funksiyalar
Agar qo'shimcha funksiya kerak bo'lsa:
1. Talabni yozing
2. Qaysi sahifaga kerakligini ayting
3. Qanday ishlashi kerakligini tushuntiring

---

## 🎉 XULOSA

Endi siz to'liq professional do'kon boshqaruv tizimidan foydalanishni bilasiz!

✅ Filial qo'shish
✅ Kassir qo'shish
✅ Savdo qilish (3 valyuta)
✅ Kirim topshirish
✅ Admin nazorat
✅ Excel hisobotlar

**Omad! Tizim to'liq tayyor!** 🚀
