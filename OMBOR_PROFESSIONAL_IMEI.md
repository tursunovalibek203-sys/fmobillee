# 🏭 Professional Ombor - IMEI Tizimi

## Umumiy Ma'lumot

Professional ombor tizimi IMEI raqamlar bilan - har bir mahsulot uchun individual identifikatsiya.

## Asosiy Xususiyatlar

### ✅ IMEI Tizimi

**Nima uchun IMEI?**
- Har bir mahsulot uchun noyob identifikator
- Sotilgan/mavjud holati
- Qidirish va kuzatish
- Kafolat va servis
- O'g'irlik himoyasi

**IMEI Validatsiyasi:**
- 15 raqamli format
- Faqat raqamlar
- Dublikat tekshirish
- Real-time validatsiya
- Xato xabarlari

**IMEI Holatlari:**
- ✅ **Mavjud** - Omborda
- ❌ **Sotilgan** - Mijozga sotilgan
- 📅 Sotilgan sana

### 📊 Statistika

**5 ta Asosiy Metrika:**
1. **Jami Mahsulotlar** - Turli mahsulotlar soni
2. **Jami Qiymat** - Ombordagi pul qiymati
3. **Jami Dona** - Barcha mahsulotlar soni
4. **Jami IMEI** - Ro'yxatdan o'tgan IMEI
5. **Kam Qolgan** - 10 va undan kam

### 🔍 Qidirish va Filtrlash

**Qidirish:**
- Mahsulot nomi
- IMEI raqam
- Barcode

**Filtrlash:**
- Kategoriya (Telefon, Noutbuk, Planshet...)
- Holat (Omborda, Kam qolgan, Tugagan)

### 📱 Mahsulot Kartochkasi

**Ko'rsatiladigan Ma'lumotlar:**
- Mahsulot nomi
- Kategoriya
- Sotib olish narxi
- Sotish narxi
- Miqdor
- Foyda
- IMEI raqamlar ro'yxati
- Holat badge

**Ranglar:**
- ✅ Yashil - Omborda (>10)
- ⚠️ Sariq - Kam qolgan (1-10)
- ❌ Qizil - Tugagan (0)

### 🎨 Professional Dizayn

**Gradient Background:**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Kartochka Effektlari:**
- Hover: translateY(-6px)
- Top border animatsiya
- Box shadow gradient
- Smooth transitions

**Ranglar:**
- Primary: #667eea → #764ba2
- Success: #10b981
- Warning: #f59e0b
- Danger: #dc2626

## IMEI Qo'shish

### Jarayon

1. **Mahsulot Tanlash**
   - Mahsulot kartochkasida "IMEI" tugmasini bosing
   - Modal oyna ochiladi

2. **IMEI Kiritish**
   - 15 raqamli IMEI kiriting
   - Real-time validatsiya
   - Dublikat tekshirish

3. **Saqlash**
   - "IMEI Qo'shish" tugmasini bosing
   - Avtomatik yangilanish

### Validatsiya Qoidalari

```javascript
// 1. Faqat raqamlar
/^\d+$/.test(imei)

// 2. 15 raqam
imei.length === 15

// 3. Dublikat yo'q
!allIMEIs.some(i => i.imei === imei)
```

### Xato Xabarlari

```
❌ Faqat raqamlar kiritilishi kerak
❌ IMEI 15 raqamdan iborat bo'lishi kerak (12/15)
❌ Bu IMEI allaqachon mavjud!
✅ IMEI to'g'ri
```

## API Endpointlar

### IMEI Operatsiyalari

```javascript
// Barcha IMEI larni olish
GET /api/warehouse/imei/all

// Yangi IMEI qo'shish
POST /api/warehouse/imei
Body: {
  productId: 1,
  imei: "123456789012345"
}

// IMEI ni o'chirish
DELETE /api/warehouse/imei/:imei

// IMEI ni sotilgan deb belgilash
PUT /api/warehouse/imei/:imei/sold
Body: {
  soldDate: "12.02.2025",
  customerId: 1
}
```

### Mahsulot Operatsiyalari

```javascript
// Barcha mahsulotlar
GET /api/warehouse/products

// Yangi mahsulot
POST /api/warehouse/products
Body: {
  name: "iPhone 15 Pro Max",
  category: "Telefon",
  buyPrice: 1000.00,
  sellPrice: 1200.00,
  stock: 5,
  barcode: "1234567890",
  unit: "dona",
  description: "256GB, Titanium"
}

// Mahsulotni yangilash
PUT /api/warehouse/products/:id

// Mahsulotni o'chirish
DELETE /api/warehouse/products/:id
```

## Ma'lumotlar Strukturasi

### Mahsulot Obyekti

```javascript
{
  productId: 1,
  name: "iPhone 15 Pro Max",
  category: "Telefon",
  buyPrice: 1000.00,
  sellPrice: 1200.00,
  stock: 5,
  barcode: "1234567890",
  unit: "dona",
  description: "256GB, Titanium",
  createdAt: "2025-02-12T10:00:00Z",
  updatedAt: "2025-02-12T10:00:00Z"
}
```

### IMEI Obyekti

```javascript
{
  imeiId: 1,
  productId: 1,
  imei: "123456789012345",
  status: "available", // available | sold
  soldDate: null,
  customerId: null,
  createdAt: "2025-02-12T10:00:00Z"
}
```

## Foydalanish

### Mahsulot Qo'shish

1. "+" tugmasini bosing
2. Ma'lumotlarni kiriting:
   - Nomi *
   - Kategoriya *
   - Sotib olish narxi *
   - Sotish narxi *
   - Miqdor *
   - Barcode (ixtiyoriy)
   - O'lchov birligi
   - Tavsif
3. "Saqlash" tugmasini bosing

### IMEI Qo'shish

1. Mahsulot kartochkasida "IMEI" tugmasini bosing
2. 15 raqamli IMEI kiriting
3. Validatsiya kutiladi
4. "IMEI Qo'shish" tugmasini bosing
5. Yangi IMEI ro'yxatda paydo bo'ladi

### IMEI O'chirish

1. IMEI modal oynasini oching
2. O'chiriladigan IMEI yonidagi "🗑️ O'chirish" tugmasini bosing
3. Tasdiqlang
4. IMEI o'chiriladi

**Eslatma:** Faqat "Mavjud" holatidagi IMEI larni o'chirish mumkin!

### Qidirish

1. Qidiruv maydoniga kiriting:
   - Mahsulot nomi
   - IMEI raqam
   - Barcode
2. Natijalar avtomatik filtrlandi

### Filtrlash

1. Kategoriya tanlang
2. Holat tanlang
3. Natijalar avtomatik yangilanadi

## Misol: To'liq Jarayon

### 1. Yangi Telefon Qo'shish

```
Mahsulot:
- Nomi: iPhone 15 Pro Max
- Kategoriya: Telefon
- Sotib olish: $1,000.00
- Sotish: $1,200.00
- Miqdor: 5
- Barcode: IP15PM256TI
- Tavsif: 256GB, Titanium

Saqlash → ✅ Mahsulot qo'shildi!
```

### 2. IMEI Qo'shish

```
IMEI Modal:
- Mahsulot: iPhone 15 Pro Max
- Jami IMEI: 0 ta

Yangi IMEI: 123456789012345
Validatsiya: ✅ IMEI to'g'ri

IMEI Qo'shish → ✅ IMEI qo'shildi!

Yana qo'shish:
- 123456789012346 ✅
- 123456789012347 ✅
- 123456789012348 ✅
- 123456789012349 ✅

Jami: 5 ta IMEI
```

### 3. Savdo Qilish

```
Kassir panelida:
- IMEI qidirish: 123456789012345
- Mahsulot topildi: iPhone 15 Pro Max
- Narx: $1,200.00
- Mijoz: Ali Valiyev

Savdo qo'shish → ✅

IMEI holati:
- 123456789012345: ❌ Sotilgan (12.02.2025)
- Mijoz: Ali Valiyev
```

## Afzalliklar

### ✅ Biznes Uchun
- Aniq inventarizatsiya
- O'g'irlik himoyasi
- Kafolat kuzatuvi
- Servis tarixi
- Statistika va hisobotlar

### ✅ Mijoz Uchun
- Mahsulot identifikatsiyasi
- Kafolat tekshirish
- Servis xizmati
- Qayta sotish qiymati

### ✅ Texnik
- Real-time validatsiya
- Dublikat himoyasi
- Fast search
- Scalable architecture
- API-first design

## Xavfsizlik

### Validatsiya
- Input sanitization
- SQL injection himoyasi
- XSS prevention
- CSRF tokens

### Ruxsatlar
- Admin only
- Role-based access
- Audit log
- Activity tracking

## Performance

### Optimizatsiya
- Indexed search
- Lazy loading
- Virtual scrolling
- Debounced search (300ms)

### Caching
- LocalStorage
- Session storage
- API response cache
- Image optimization

## Kelajak Rejalar

### 🔄 Qo'shimcha Xususiyatlar
- [ ] Barcode scanner
- [ ] QR code generator
- [ ] Bulk IMEI import (Excel)
- [ ] IMEI history
- [ ] Warranty tracking
- [ ] Service records

### 📊 Analytics
- [ ] IMEI statistics
- [ ] Theft reports
- [ ] Warranty expiry alerts
- [ ] Service due dates

### 🔗 Integration
- [ ] IMEI database API
- [ ] Manufacturer verification
- [ ] Insurance integration
- [ ] Police report system

---

**Versiya**: 1.0 Professional
**Sana**: 2025-02-12
**Muallif**: Kiro AI Assistant
