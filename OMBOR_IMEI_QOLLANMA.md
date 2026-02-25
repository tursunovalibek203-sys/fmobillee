# OMBOR TIZIMI - TO'LIQ QOLLANMA

## 🎯 OMBOR TIZIMI NIMA?

Ombor tizimi - bu do'koningizga kelgan mahsulotlarni boshqarish, ularni mijozlarga sotish va qoldiqlarni kuzatish uchun professional tizim.

## ✨ ASOSIY IMKONIYATLAR

### 1. 📦 Mahsulot Boshqaruvi
- Mahsulot qo'shish (nom, narx, IMEI/Barcode)
- Mahsulot tahrirlash
- Mahsulot qidirish (IMEI, Barcode, nom)
- Kategoriyalar bo'yicha filtrlash

### 2. 📊 Ombor Nazorati
- Omborga mahsulot kiritish
- Ombordan mahsulot chiqarish
- Qoldiqlarni kuzatish
- Kam qolgan mahsulotlar haqida ogohlantirish

### 3. 💰 Narx Boshqaruvi
- Kelgan narxi
- Sotish narxi
- Foyda hisoblash
- Qo'shimcha tariflar

### 4. 🔍 IMEI/Barcode Integratsiyasi
- Mijozga sotishda IMEI orqali mahsulot tanlash
- Avtomatik narx to'ldirish
- Avtomatik ombordan chiqarish

## 🚀 TIZIMNI ISHGA TUSHIRISH

### 1. Test Mahsulotlar Qo'shish

```bash
node test-warehouse-products.js
```

Bu 10 ta namuna mahsulot qo'shadi (iPhone, Samsung, MacBook va boshqalar).

### 2. Ombor Sahifasini Ochish

Asosiy sahifada "Ombor" tugmasini bosing yoki:
```
http://localhost:3000/warehouse.html
```

## 📝 QADAMMA-QADAM QOLLANMA

### 1️⃣ YANGI MAHSULOT QO'SHISH

1. Ombor sahifasida "+" tugmasini bosing
2. Quyidagi ma'lumotlarni kiriting:
   - **Mahsulot nomi** (majburiy): iPhone 14 Pro Max
   - **Kategoriya**: Telefonlar
   - **Kelgan narxi**: 10,000,000 so'm
   - **Sotish narxi** (majburiy): 12,000,000 so'm
   - **Miqdor**: 5 dona
   - **Minimal miqdor**: 2 dona
   - **O'lchov birligi**: dona
   - **Barcode/IMEI**: 123456789012
   - **Qo'shimcha ma'lumot**: Yangi, kafolat bilan

3. "Saqlash" tugmasini bosing

### 2️⃣ OMBORGA MAHSULOT KIRITISH

1. Mahsulot kartasini bosing
2. "📥 Omborga kiritish" tugmasini bosing
3. Miqdorni kiriting: 10 dona
4. Kelgan narxini kiriting: 10,000,000 so'm
5. Tasdiqlang

**Natija:**
- Ombor qoldig'i yangilanadi
- Harakat tarixi saqlanadi
- Statistika yangilanadi

### 3️⃣ MIJOZGA MAHSULOT SOTISH (IMEI ORQALI)

1. Mijoz daftariga kiring
2. "Yangi savdo" formasida IMEI inputga kiriting:
   ```
   123456789012
   ```
3. Mahsulot avtomatik topiladi va ko'rsatiladi
4. Mahsulotni tanlang
5. **Avtomatik to'ldiriladi:**
   - Mahsulot nomi
   - Narxi
6. **Siz faqat kiritasiz:**
   - Mijoz bergan pul miqdori

7. "Savdo qo'shish" tugmasini bosing

**Avtomatik jarayonlar:**
- ✅ Savdo saqlanadi
- ✅ Ombordan mahsulot chiqariladi
- ✅ Mijoz qarzi hisoblanadi
- ✅ Excel faylga yoziladi
- ✅ Telegram chek yuboriladi

### 4️⃣ MAHSULOT QIDIRISH

**IMEI/Barcode orqali:**
```
123456789012
```

**Nom orqali:**
```
iPhone 14
```

**Kategoriya orqali:**
```
Telefonlar
```

### 5️⃣ FILTRLASH

- **Barchasi**: Barcha mahsulotlar
- **Omborda bor**: Qoldig'i > minimal
- **Kam qolgan**: Qoldig'i ≤ minimal
- **Tugagan**: Qoldig'i = 0

## 💡 MUHIM XUSUSIYATLAR

### Avtomatik Ogohlantirish

Mahsulot kam qolganda:
```
⚠️ Diqqat! Mahsulot kam qolgan!

Mahsulot: iPhone 14 Pro Max
Ombor: 2 dona
Minimal: 2 dona
```

### Foyda Hisoblash

Har bir mahsulot uchun avtomatik:
```
Kelgan narxi: 10,000,000 so'm
Sotish narxi: 12,000,000 so'm
Foyda: 2,000,000 so'm (20%)
```

### Ombor Statistikasi

- 📦 Jami mahsulotlar
- ✅ Omborda bor
- ⚠️ Kam qolgan
- 💰 Ombor qiymati

## 🔧 SOZLAMALAR

### Minimal Qoldiq

Har bir mahsulot uchun minimal qoldiq belgilang:
```
Minimal: 5 dona
```

Qoldiq bu miqdordan kam bo'lganda ogohlantirish ko'rsatiladi.

### O'lchov Birliklari

- dona
- kg
- litr
- metr
- quti

## 📊 HISOBOTLAR

### Mahsulot Tafsilotlari

Har bir mahsulot uchun:
- Asosiy ma'lumotlar (ID, kategoriya, barcode)
- Narxlar (kelgan, sotish, foyda)
- Ombor holati (hozirgi, minimal, maksimal)
- Qo'shimcha ma'lumot

### Ombor Harakatlari

Barcha kirim-chiqimlar saqlanadi:
- Sana va vaqt
- Harakat turi (kirim/chiqim)
- Miqdor
- Narx
- Kim amalga oshirdi

## ⚠️ XATOLIKLARNI BARTARAF QILISH

### "Mahsulot topilmadi"

**Sabab:** IMEI/Barcode noto'g'ri yoki mahsulot omborga qo'shilmagan

**Yechim:**
1. IMEI/Barcode ni tekshiring
2. Ombor sahifasida mahsulot borligini tekshiring
3. Mahsulot faol ekanligini tekshiring

### "Omborda yetarli mahsulot yo'q"

**Sabab:** Mahsulot qoldig'i yetarli emas

**Yechim:**
1. Ombor qoldig'ini tekshiring
2. Yangi partiya kiriting
3. Yoki boshqa mahsulot tanlang

### "Ombordan chiqarishda xatolik"

**Sabab:** Server bilan aloqa yo'q yoki ma'lumotlar bazasi xatosi

**Yechim:**
1. Internet aloqasini tekshiring
2. Serverni qayta ishga tushiring
3. MongoDB ulanishini tekshiring

## 🎓 MASLAHATLAR

### 1. IMEI/Barcode Tizimi

Har bir mahsulotga noyob IMEI/Barcode bering:
```
iPhone 14 Pro Max #1: 123456789012
iPhone 14 Pro Max #2: 123456789013
```

### 2. Kategoriyalar

Mahsulotlarni kategoriyalarga ajrating:
- Telefonlar
- Noutbuklar
- Planshetlar
- Aksessuarlar
- Televizorlar

### 3. Minimal Qoldiq

Har doim minimal qoldiq belgilang:
- Tez sotiluvchi: 10-20 dona
- O'rtacha: 5-10 dona
- Sekin sotiluvchi: 2-5 dona

### 4. Narxlar

Kelgan narxini doim kiriting:
- Foyda hisoblash uchun
- Statistika uchun
- Hisobotlar uchun

## 📱 MOBIL VERSIYA

Ombor tizimi mobil qurilmalarda ham to'liq ishlaydi:
- Responsive dizayn
- Touch-friendly
- Tez yuklash

## 🔐 XAVFSIZLIK

- Faqat login qilgan foydalanuvchilar kirishi mumkin
- Barcha harakatlar saqlanadi
- Ma'lumotlar MongoDB da xavfsiz saqlanadi

## 📞 YORDAM

Muammo yuzaga kelsa:
1. Konsolni tekshiring (F12)
2. Server loglarini ko'ring
3. MongoDB ulanishini tekshiring

---

**Muvaffaqiyatlar! 🎉**
