# ⚡ TEZKOR YORDAM - QISQA QO'LLANMA

## 🚀 SERVERNI ISHGA TUSHIRISH
```bash
node server.js
```

## 🔗 ASOSIY SAHIFALAR

| Sahifa | URL | Vazifasi |
|--------|-----|----------|
| 🎯 Admin Dashboard | http://localhost:3000/admin-dashboard.html | Asosiy boshqaruv |
| 🏢 Filiallar | http://localhost:3000/admin-branches.html | Filiallar boshqaruvi |
| 👤 Kassirlar | http://localhost:3000/admin-cashiers.html | Kassirlar boshqaruvi |
| 💰 Kirimlar | http://localhost:3000/admin-handovers.html | Kirim topshirishlar |
| 📦 Ombor | http://localhost:3000/warehouse-pro.html | Ombor boshqaruvi |
| 👥 Mijozlar | http://localhost:3000/index.html | Mijozlar boshqaruvi |
| 📊 Tahlil | http://localhost:3000/analytics.html | Hisobotlar |
| 💵 Kassir Panel | http://localhost:3000/cashier-multi-currency.html | Kassir uchun |

## ⚡ TEZKOR HARAKATLAR

### Filial Qo'shish
1. Admin Dashboard → Filiallar
2. Nom, manzil, telefon, menejer kiriting
3. "Filial Qo'shish" tugmasini bosing

### Kassir Qo'shish
1. Admin Dashboard → Kassirlar
2. Filialni tanlang
3. Ism, login, parol kiriting
4. "Kassir Qo'shish" tugmasini bosing

### Savdo Qilish
1. Kassir login qiladi
2. Mijoz va mahsulot ma'lumotlarini kiritadi
3. Valyutani tanlaydi (USD/UZS/RUB)
4. "Savdo Qilish" tugmasini bosing

### Kirim Topshirish
1. Kassir panelida "Kirim Topshirish" tugmasini bosing
2. Miqdorni kiriting
3. "Topshirish" tugmasini bosing

## 💰 VALYUTA KURSLARI

| Valyuta | Kurs |
|---------|------|
| 1 USD | 12,500 UZS |
| 1 USD | 90 RUB |

## 📁 EXCEL FAYLLAR

Joylashuv: `excel-files/`

| Fayl | Ma'lumot |
|------|----------|
| Filiallar_Hisobot.xlsx | Barcha filiallar |
| Kassirlar_Hisobot.xlsx | Barcha kassirlar |
| Savdolar_[Filial].xlsx | Filial savdolari |
| Kirim_Topshirish_Hisobot.xlsx | Barcha kirimlar |
| Ombor_[Filial].xlsx | Filial ombori |

## 🔐 LOGIN MA'LUMOTLARI

### Admin
- URL: http://localhost:3000/admin-dashboard.html
- Login: admin
- Parol: admin123

### Kassir
- URL: http://localhost:3000/cashier-multi-currency.html
- Login: (kassir qo'shganda yaratiladi)
- Parol: (kassir qo'shganda yaratiladi)

## 📊 STATISTIKA

### Admin Dashboard da Ko'rish Mumkin:
- ✅ Jami filiallar / Faol filiallar
- ✅ Jami kassirlar / Faol kassirlar
- ✅ Jami kirimlar / Bugungi kirimlar
- ✅ Jami mahsulotlar / Kam qolganlar
- ✅ Jami savdolar / Bugungi savdolar
- ✅ Jami mijozlar / Qarzda

## 🆘 MUAMMOLARNI YECHISH

### Server Ishlamayapti
```bash
node server.js
```

### MongoDB Ulanmayapti
- Tizim avtomatik JSON fallback ga o'tadi
- Barcha funksiyalar ishlaydi

### Kassir Login Qila Olmayapti
- Login va parolni tekshiring
- Kassir faol ekanligini tekshiring

### Savdo Qo'shilmayapti
- Barcha maydonlarni to'ldiring
- Valyutani tanlang
- Serverni qayta ishga tushiring

## 💡 MASLAHATLAR

### Kassir Uchun
- ✅ To'g'ri valyutani tanlang
- ✅ Mijoz ma'lumotlarini to'g'ri kiriting
- ✅ Kunlik kirim topshiring

### Admin Uchun
- ✅ Har kuni statistikani tekshiring
- ✅ Kassirlar balansini nazorat qiling
- ✅ Excel fayllarni yuklab oling

## 🎯 ASOSIY FUNKSIYALAR

| Funksiya | Tavsif |
|----------|--------|
| Multi-Filial | Har bir filial alohida |
| 3 Valyuta | USD, UZS, RUB |
| Real-time Excel | Avtomatik yozish |
| Kassir Tizimi | Login va balans |
| Kirim Topshirish | Adminga pul topshirish |
| Statistika | Real-time hisobotlar |

## 📞 YORDAM

Agar muammo yuzaga kelsa:
1. Serverni qayta ishga tushiring
2. Brauzer cache ni tozalang
3. Internetni tekshiring
4. Excel fayllarni tekshiring

---

**Omad! Tizim to'liq tayyor!** 🚀

**Tezkor Yordam Telefon:** +998 XX XXX XX XX
**Email:** support@example.com
