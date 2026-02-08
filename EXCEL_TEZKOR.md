# ⚡ Local Excel - Tezkor Yo'riqnoma

## 🎯 Nima Qilindi?

✅ **Google Sheets o'rniga Local Excel** integratsiyasi qo'shildi
✅ **To'liq bepul** - hech qanday to'lov yoki registratsiya kerak emas
✅ **Offline ishlaydi** - internet ulanishi shart emas
✅ **Xavfsiz** - barcha ma'lumotlar sizning kompyuteringizda

## 📁 Qanday Ishlaydi?

### 1. Mijoz Qo'shilganda
```
Yangi mijoz → Avtomatik Excel fayl yaratiladi
Masalan: Mijoz_Ahmadjon_Karimov.xlsx
```

### 2. Savdo/To'lov Qo'shilganda
```
Savdo ma'lumoti → 2 ta joyga qo'shiladi:
1. Mijoz fayliga (shaxsiy hisobot)
2. Haftalik faylga (umumiy hisobot)
```

### 3. Har Dushanba Kuni
```
Avtomatik yangi haftalik fayl yaratiladi
Masalan: Hafta_27.01_02.02.xlsx
```

## 🚀 Ishga Tushirish

```bash
# 1. Serverni ishga tushirish
npm start

# 2. Test qilish (ixtiyoriy)
npm run test-excel
```

## 📊 Excel Fayllar

Barcha fayllar `excel-files/` papkasida:
```
excel-files/
├── Mijoz_Ahmadjon_Karimov.xlsx
├── Mijoz_Fatima_Nazarova.xlsx
├── Hafta_26.01_01.02.xlsx
└── Hafta_03.02_09.02.xlsx
```

## 💻 Excel da Ko'rish

1. **Papkani oching:** `excel-files/`
2. **Faylni ikki marta bosing** - Excel da ochiladi
3. **Ma'lumotlarni ko'ring** - jadval ko'rinishida
4. **Filtr qo'ying** - Excel ning standart funksiyalari

## 📋 Excel Tarkibi

### Mijoz Fayllari:
| Mahsulot nomi | Narxi | Berilgan pul | Balans | Sana | Turi |
|---------------|-------|--------------|--------|------|------|
| Telefon | 500000 | 300000 | 200000 | 27.01.2025 14:30 | Savdo |

### Haftalik Fayllar:
| Mijoz | Mahsulot nomi | Narxi | Berilgan pul | Balans | Sana | Turi |
|-------|---------------|-------|--------------|--------|------|------|
| Ahmadjon | Telefon | 500000 | 300000 | 200000 | 27.01.2025 14:30 | Savdo |

## 🔧 API Endpointlar

```bash
# Excel fayllar ro'yxati
GET http://localhost:3000/api/excel-files

# Excel faylni yuklab olish
GET http://localhost:3000/api/excel-download/Mijoz_Ahmadjon_Karimov.xlsx

# Excel fayl ma'lumotlarini JSON da olish
GET http://localhost:3000/api/excel-read/Mijoz_Ahmadjon_Karimov.xlsx
```

## ✅ Tayyor!

Server ishga tushdi va Excel tizimi faol. Endi:

1. **Mijoz qo'shing** - avtomatik Excel fayl yaratiladi
2. **Savdo qiling** - ma'lumot Excel ga qo'shiladi
3. **Excel faylni oching** - barcha ma'lumotlarni ko'ring

## 🎯 Afzalliklar

- ✅ **Bepul** - hech qanday to'lov yo'q
- ✅ **Tezkor** - darhol ishlaydi
- ✅ **Xavfsiz** - ma'lumotlar lokal
- ✅ **Oson** - Excel bilan tanish
- ✅ **Backup** - fayllarni nusxalash oson
- ✅ **Offline** - internet kerak emas

Endi tizim to'liq tayyor va ishlamoqda! 🎉