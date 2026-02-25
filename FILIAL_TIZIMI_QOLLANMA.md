# 🏢 Filial Tizimi - To'liq Qo'llanma

## 📋 Umumiy Ma'lumot

Filial tizimi orqali bir nechta do'kon filiallarini boshqarish mumkin. Har bir filialning o'z ombori va sotuvchilari bo'ladi.

## 🎯 Asosiy Xususiyatlar

### 1. Admin Imkoniyatlari
- ✅ Filiallar yaratish va boshqarish
- ✅ Har bir filialga mahsulot qo'shish
- ✅ Filial statistikasini ko'rish
- ✅ Sotuvchilarni filiallarga biriktirish
- ✅ Barcha filiallar bo'yicha hisobotlar

### 2. Sotuvchi Imkoniyatlari
- ✅ Faqat o'z filialining mahsulotlarini ko'rish
- ✅ O'z filialidan mahsulot sotish
- ✅ Kassani adminga topshirish
- ✅ Kunlik savdolar hisoboti

## 🚀 Boshlash

### 1. Filial Yaratish (Admin)

1. Admin panelga kiring: `/admin.html`
2. "🏢 Filiallar" tugmasini bosing
3. "➕ Yangi Filial" tugmasini bosing
4. Filial ma'lumotlarini kiriting:
   - Filial nomi (majburiy)
   - Manzil
   - Telefon
   - Menejer ismi
5. "Saqlash" tugmasini bosing

### 2. Filialga Mahsulot Qo'shish

1. Filiallar sahifasida kerakli filialni tanlang
2. Ombor sahifasiga o'tadi
3. "➕ Yangi Mahsulot" tugmasini bosing
4. Mahsulot ma'lumotlarini kiriting:
   - Mahsulot nomi
   - Kategoriya
   - Sotib olish narxi
   - Sotish narxi
   - Miqdor
   - Barcode (ixtiyoriy)
5. "Saqlash" tugmasini bosing

### 3. Sotuvchini Filialga Biriktirish

1. Admin paneldan "👥 Kassirlar" bo'limiga o'ting
2. "➕ Yangi Kassir" tugmasini bosing
3. Kassir ma'lumotlarini kiriting:
   - Ism
   - Username
   - Parol
   - **Filial tanlash** (muhim!)
   - Telefon
4. "Saqlash" tugmasini bosing

### 4. Sotuvchi Sifatida Ishlash

1. Kassir login sahifasiga kiring: `/cashier-login.html`
2. Username va parolni kiriting
3. Kassir paneliga o'tasiz
4. "🏭 Ombor" tugmasini bosing
5. Faqat o'z filialingizning mahsulotlari ko'rinadi
6. Mahsulotni tanlab sotish mumkin

## 📊 API Endpointlar

### Filiallar

```javascript
// Barcha filiallar
GET /api/branches

// Yangi filial yaratish
POST /api/branches
Body: { name, address, phone, manager }

// Filialni yangilash
PUT /api/branches/:branchId
Body: { name, address, phone, manager, isActive }

// Filial statistikasi
GET /api/branches/:branchId/stats
```

### Mahsulotlar (Filial bo'yicha)

```javascript
// Filial mahsulotlari
GET /api/warehouse/products?branchId=1001

// Mahsulot qo'shish
POST /api/warehouse/products
Body: { branchId, name, sellPrice, ... }
```

## 🔐 Ruxsatlar

### Admin
- ✅ Barcha filiallarni ko'rish va boshqarish
- ✅ Barcha mahsulotlarni ko'rish va tahrirlash
- ✅ Sotuvchilarni boshqarish
- ✅ Hisobotlarni ko'rish

### Sotuvchi (Kassir)
- ✅ Faqat o'z filialining mahsulotlarini ko'rish
- ❌ Mahsulot qo'shish/o'chirish (faqat ko'rish)
- ✅ Savdo qilish
- ✅ Kassani topshirish

## 📱 Sahifalar

### Admin Sahifalari
- `/admin.html` - Asosiy admin panel
- `/admin-branches.html` - Filiallar boshqaruvi
- `/admin-cashiers.html` - Sotuvchilar boshqaruvi
- `/warehouse.html?branchId=X` - Filial ombori

### Sotuvchi Sahifalari
- `/cashier-login.html` - Kirish sahifasi
- `/cashier.html` - Kassir paneli
- `/warehouse-view.html` - Ombor ko'rish (faqat o'qish)

## 🎨 Filial Statistikasi

Har bir filial uchun quyidagi statistika ko'rsatiladi:
- 📦 Jami mahsulotlar soni
- 💰 Ombor qiymati
- 📊 Savdolar soni
- 👥 Sotuvchilar soni

## ⚙️ Sozlash

### 1. Database Schema

Mahsulotlarga `branchId` maydoni qo'shildi:
```javascript
{
  productId: Number,
  branchId: Number, // Qaysi filialga tegishli
  name: String,
  stock: Number,
  ...
}
```

### 2. Kassir Schema

Kassirlarga `branchId` maydoni qo'shildi:
```javascript
{
  cashierId: Number,
  branchId: Number, // Qaysi filialda ishlaydi
  name: String,
  username: String,
  ...
}
```

## 🔄 Ish Jarayoni

### Kundalik Ish

1. **Ertalab**
   - Sotuvchi login qiladi
   - O'z filialining mahsulotlarini ko'radi
   - Savdo qilishni boshlaydi

2. **Kun davomida**
   - Mijozlarga mahsulot sotadi
   - Har bir savdo avtomatik qayd qilinadi
   - Ombor qoldig'i avtomatik yangilanadi

3. **Kechqurun**
   - Kassani adminga topshiradi
   - Kunlik hisobotni ko'radi
   - Logout qiladi

### Admin Nazorati

1. **Har kuni**
   - Barcha filiallar statistikasini ko'radi
   - Kam qolgan mahsulotlarni tekshiradi
   - Sotuvchilar hisobotini ko'radi

2. **Haftalik**
   - Har bir filial samaradorligini tahlil qiladi
   - Yangi mahsulotlar qo'shadi
   - Narxlarni yangilaydi

## 🆘 Muammolarni Hal Qilish

### Mahsulotlar ko'rinmayapti
1. Kassir to'g'ri filialga biriktirilganini tekshiring
2. Filialda mahsulotlar mavjudligini tekshiring
3. Browser console ni oching (F12) va xatolarni ko'ring

### Savdo qilish imkoni yo'q
1. Kassir login qilganini tekshiring
2. Mahsulot omborda mavjudligini tekshiring
3. Mijoz tanlangan bo'lishi kerak

### Statistika yangilanmayapti
1. Sahifani yangilang (F5)
2. Server ishlab turganini tekshiring
3. MongoDB ulanishini tekshiring

## 📞 Yordam

Qo'shimcha savol yoki muammolar bo'lsa:
- Server loglarini tekshiring: `node server.js`
- Browser console ni tekshiring (F12)
- Database ulanishini tekshiring

## ✅ Keyingi Qadamlar

1. ✅ Filial tizimi sozlandi
2. ✅ Mahsulotlar filial bo'yicha ajratildi
3. ✅ Sotuvchilar filiallarga biriktirildi
4. ⏳ Kassani topshirish funksiyasi (mavjud)
5. ⏳ Filial bo'yicha hisobotlar (qo'shimcha)

---

**Eslatma:** Barcha o'zgarishlar database ga avtomatik saqlanadi. Backup tizimi har hafta avtomatik ishga tushadi.
