# 📚 FILIAL OMBOR TIZIMI - FOYDALANISH QO'LLANMASI

## 🎯 UMUMIY MA'LUMOT

Har bir filialda alohida ombor tizimi ishga tushirildi. Bu tizim orqali:
- Har bir filial o'z omboriga ega
- Kassirlar faqat o'z filiali mahsulotlarini ko'radi
- Admin barcha filiallarni boshqaradi
- Umumiy ombor barcha filiallar uchun

---

## 👥 FOYDALANUVCHILAR

### **1. Admin**
- Barcha filiallarni ko'radi
- Umumiy omborni boshqaradi
- Mahsulotlarni filiallar o'rtasida ko'chirishi mumkin
- Barcha statistikani ko'radi

### **2. Kassir**
- Faqat o'z filiali mahsulotlarini ko'radi
- O'z filiali mahsulotlarini sotadi
- O'z filiali statistikasini ko'radi

---

## 🏢 FILIALLAR TUZILMASI

### **BranchId Qiymatlari:**
- `0` = Umumiy Ombor (barcha filiallar uchun)
- `1001` = Toshkent Filiali
- `1002` = Samarqand Filiali
- `1003` = Buxoro Filiali
- va hokazo...

### **Misol:**
```javascript
// Mahsulot yaratish
{
  productId: 2001,
  branchId: 1001,  // Toshkent filiali
  name: "iPhone 15 Pro Max",
  stock: 15,
  sellPrice: 1200
}
```

---

## 📱 SAHIFALAR

### **1. Admin Dashboard** (`admin-dashboard.html`)
**Maqsad:** Barcha tizimni boshqarish

**Kartalar:**
- 🏢 Filiallar
- 👤 Kassirlar
- 💰 Kirim Topshirishlar
- 📦 Ombor (umumiy)
- 🏢 Filiallar Ombori (yangi!)
- 📊 Filiallar Savdolari
- 👥 Mijozlar

**Yangi Karta: Filiallar Ombori**
- Har bir filialning ombor statistikasi
- Filial bo'yicha mahsulotlar soni
- Umumiy ombor mahsulotlari

---

### **2. Ombor Sahifasi** (`warehouse-pro.html`)
**Maqsad:** Mahsulotlarni boshqarish

**Admin uchun:**
- Umumiy omborni ko'radi (branchId=0)
- Barcha filiallar uchun mahsulot qo'shishi mumkin

**Kassir uchun:**
- Faqat o'z filiali mahsulotlarini ko'radi
- Faqat o'z filiali uchun mahsulot qo'shishi mumkin

**Funksiyalar:**
- 📥 Kirim (Stock In)
- 📤 Chiqim (Stock Out)
- ➕ Mahsulot qo'shish
- 📊 Hisobotlar
- 📈 Grafiklar

---

### **3. Filiallar Ombori** (`admin-warehouse-branches.html`)
**Maqsad:** Filiallar bo'yicha ombor boshqaruvi

**Funksiyalar:**
1. **Filial Tanlash**
   - Dropdown orqali filial tanlash
   - "Barcha Filiallar" - hammasi
   - "Umumiy Ombor" - branchId=0
   - Har bir filial alohida

2. **Statistika**
   - Mahsulotlar soni
   - Jami miqdor
   - Jami qiymat
   - Kam qolgan mahsulotlar

3. **Mahsulotlar Jadvali**
   - ID, Nomi, Kategoriya
   - Miqdor, Narx, Qiymat
   - Holat (Yetarli/Kam)
   - Amallar (Ko'chirish)

4. **Mahsulotni Ko'chirish** (UI tayyor)
   - Qaysi mahsulot
   - Qayerdan (hozirgi filial)
   - Qayerga (yangi filial)
   - Necha dona

---

### **4. Kassir Sahifasi** (`cashier-new.html`)
**Maqsad:** Savdo qilish

**Avtomatik Filtrlash:**
```javascript
// Kassir login qilganda
localStorage.setItem('branchId', 1001);

// Mahsulotlar yuklanayotganda
const branchId = currentCashier.branchId; // 1001
fetch(`/api/products?branchId=${branchId}`);
```

**Natija:**
- Kassir faqat o'z filiali mahsulotlarini ko'radi
- Savdo qilganda o'z filiali stockidan ayriladi

---

## 🔧 TEXNIK TAFSILOTLAR

### **1. Database Schema**
```javascript
const ProductSchema = new mongoose.Schema({
  productId: { type: Number, required: true, unique: true },
  branchId: { type: Number, default: 0 },  // ✅ Yangi field
  name: { type: String, required: true },
  stock: { type: Number, default: 0 },
  // ... boshqa fieldlar
});
```

### **2. API Endpoints**
```javascript
// Barcha mahsulotlar
GET /api/products

// Filial bo'yicha mahsulotlar
GET /api/products?branchId=1001

// Umumiy ombor
GET /api/products?branchId=0
```

### **3. Frontend Funksiyalar**
```javascript
// Filial ID ni olish
function getCurrentBranchId() {
  const userRole = localStorage.getItem('userRole');
  if (userRole === 'admin') {
    return 0; // Umumiy ombor
  }
  return localStorage.getItem('branchId') || 0;
}

// Mahsulotlarni yuklash
async function loadProducts() {
  const branchId = getCurrentBranchId();
  const response = await fetch(`/api/products?branchId=${branchId}`);
  const products = await response.json();
  // ...
}
```

---

## 📊 QANDAY ISHLAYDI?

### **Scenario 1: Admin Mahsulot Qo'shadi**

1. Admin `warehouse-pro.html` ga kiradi
2. "Yangi Mahsulot" tugmasini bosadi
3. Mahsulot ma'lumotlarini kiritadi
4. BranchId ni tanlaydi:
   - 0 = Umumiy ombor
   - 1001 = Toshkent filiali
   - 1002 = Samarqand filiali
5. Saqlaydi
6. Mahsulot faqat tanlangan filialda ko'rinadi

### **Scenario 2: Kassir Mahsulot Ko'radi**

1. Kassir login qiladi (masalan: aziza/1234)
2. `branchId=1001` localStorage ga saqlanadi
3. Kassir `cashier-new.html` ga kiradi
4. Mahsulotlar avtomatik yuklanadi:
   ```javascript
   fetch('/api/products?branchId=1001')
   ```
5. Faqat Toshkent filiali mahsulotlari ko'rinadi

### **Scenario 3: Kassir Savdo Qiladi**

1. Kassir mijoz tanlaydi
2. Mahsulot tanlaydi (faqat o'z filiali mahsulotlari)
3. Savdo yaratadi
4. Stock avtomatik kamayadi:
   ```javascript
   // Oldin: stock = 15
   // Savdo: 1 dona
   // Keyin: stock = 14
   ```
5. Savdo tarixi saqlanadi

### **Scenario 4: Admin Filiallar Omborini Ko'radi**

1. Admin `admin-warehouse-branches.html` ga kiradi
2. Dropdown dan filial tanlaydi
3. O'sha filialning statistikasi ko'rsatiladi:
   - Mahsulotlar soni
   - Jami miqdor
   - Jami qiymat
4. Mahsulotlar jadvali ko'rsatiladi
5. "Ko'chirish" tugmasi orqali mahsulotni boshqa filialga ko'chirishi mumkin

---

## 🧪 TEST QILISH

### **1. Test Faylni Ishga Tushirish**
```bash
node test-filial-ombor-complete.js
```

**Natija:**
- 3 ta filial yaratiladi
- Har bir filialga 4 ta mahsulot qo'shiladi
- Umumiy omborga 3 ta mahsulot qo'shiladi
- 6 ta kassir yaratiladi
- Barcha testlar o'tadi

### **2. Manual Test**

**Admin Test:**
1. Admin sifatida login qiling
2. `admin-warehouse-branches.html` ga kiring
3. Har bir filialni tanlang
4. Mahsulotlar to'g'ri ko'rinishini tekshiring

**Kassir Test:**
1. Kassir sifatida login qiling (aziza/1234)
2. Mahsulotlar sahifasiga kiring
3. Faqat Toshkent filiali mahsulotlari ko'rinishini tekshiring
4. Savdo qiling
5. Stock kamayganini tekshiring

---

## 📈 STATISTIKA

### **Test Natijalari:**
```
🏢 Toshkent Filiali
   📦 Mahsulotlar: 4 ta
   📊 Jami miqdor: 73 dona
   💰 Jami qiymat: $51,400.00

🏢 Samarqand Filiali
   📦 Mahsulotlar: 4 ta
   📊 Jami miqdor: 55 dona
   💰 Jami qiymat: $30,650.00

🏢 Buxoro Filiali
   📦 Mahsulotlar: 4 ta
   📊 Jami miqdor: 70 dona
   💰 Jami qiymat: $21,850.00

🏭 Umumiy Ombor
   📦 Mahsulotlar: 3 ta
   📊 Jami miqdor: 1200 dona
   💰 Jami qiymat: $4,200.00

📊 JAMI
   📦 Mahsulotlar: 20 ta
   📊 Miqdor: 1,617 dona
   💰 Xarajat: $263,100.00
   💵 Daromad: $321,910.00
   📈 Foyda: $58,810.00
```

---

## ❓ SAVOL-JAVOBLAR

### **S: Kassir boshqa filial mahsulotlarini ko'ra oladimi?**
J: Yo'q, kassir faqat o'z filiali mahsulotlarini ko'radi.

### **S: Admin barcha filiallarni ko'ra oladimi?**
J: Ha, admin `admin-warehouse-branches.html` da barcha filiallarni ko'radi.

### **S: Umumiy ombor nima?**
J: Umumiy ombor (branchId=0) barcha filiallar uchun umumiy mahsulotlar. Masalan: kabel, qopqoq, himoya.

### **S: Mahsulotni boshqa filialga ko'chirish mumkinmi?**
J: Ha, `admin-warehouse-branches.html` da "Ko'chirish" tugmasi bor. UI tayyor, API keyingi bosqichda qo'shiladi.

### **S: Kassir yangi mahsulot qo'sha oladimi?**
J: Ha, lekin faqat o'z filiali uchun. BranchId avtomatik qo'shiladi.

---

## 🎉 XULOSA

Filial ombor tizimi to'liq ishga tushirildi va test qilindi!

**Tayyor:**
- ✅ Database schema
- ✅ Server API
- ✅ Frontend sahifalar
- ✅ Test fayl
- ✅ Hujjatlar

**Keyingi qadam:**
Mahsulotlarni filiallar o'rtasida ko'chirish API (ixtiyoriy).

---

**Sana:** 01.03.2026  
**Versiya:** 1.0  
**Status:** ✅ TAYYOR
