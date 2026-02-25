# 📊 Ombor Chiqim Tarixi - To'liq Qo'llanma

## ✅ Yangi Funksiya

Ombordagi mahsulotlar chiqishi tarixini ko'rish tizimi yaratildi!

### Nimani Ko'rsatadi?

- ✅ Qaysi mahsulot sotilgan
- ✅ Qancha narxda sotilgan
- ✅ Qayerga ketgan (qaysi filial)
- ✅ Kim sotgan (qaysi kassir)
- ✅ Kimga sotilgan (mijoz)
- ✅ Qachon sotilgan (sana va vaqt)
- ✅ IMEI kodi

## 📱 Sahifa

**URL:** `/warehouse-history.html`

**Kirish:** Ombor sahifasidan "📊 Chiqim Tarixi" tugmasi

## 🎯 Asosiy Funksiyalar

### 1. Statistika Kartalari

```
┌─────────────────────┐
│ Jami Chiqimlar: 150 │
│ Jami Summa: $45,000 │
│ Bugungi: 12         │
│ Bugungi Summa: $3,600│
└─────────────────────┘
```

### 2. Filterlar

**Sana bo'yicha:**
- Dan: 2025-01-01
- Gacha: 2025-02-12

**Filial bo'yicha:**
- Barcha filiallar
- Markaziy filial
- 2-filial
- ...

**Kassir bo'yicha:**
- Barcha kassirlar
- Alisher
- Bobur
- ...

**Qidiruv:**
- Mahsulot nomi
- IMEI kodi
- Mijoz ismi

### 3. Jadval

| № | Sana/Vaqt | Mahsulot | IMEI | Narxi | Qayerga | Kim sotdi | Mijoz |
|---|-----------|----------|------|-------|---------|-----------|-------|
| 1 | 12.02.2025 14:30 | iPhone 14 | 123...345 | $1,000 | Markaziy | Alisher | Sardor |
| 2 | 12.02.2025 13:15 | Samsung S23 | 456...789 | $800 | 2-filial | Bobur | - |

### 4. Pagination

- Har sahifada 50 ta yozuv
- Oldingi/Keyingi tugmalari
- Sahifa raqamlari

### 5. Excel Export

- Barcha ma'lumotlarni Excel ga export
- Fayl nomi: `Ombor_Chiqim_2025-01-01_2025-02-12.xlsx`

## 🔧 Texnik Tafsilotlar

### API Endpoint

```
GET /api/warehouse/movements
```

**Query Parameters:**
- `dateFrom` - Boshlanish sanasi (YYYY-MM-DD)
- `dateTo` - Tugash sanasi (YYYY-MM-DD)
- `branchId` - Filial ID (ixtiyoriy)
- `cashierId` - Kassir ID (ixtiyoriy)

**Response:**
```json
{
  "success": true,
  "movements": [
    {
      "_id": "...",
      "productId": 123,
      "productName": "iPhone 14 Pro Max",
      "imei": "123456789012345",
      "branchId": 1,
      "branchName": "Markaziy filial",
      "sellPrice": 1000,
      "soldDate": "2025-02-12T14:30:00Z",
      "soldBy": 5,
      "cashierName": "Alisher",
      "soldTo": "Sardor",
      "customerName": "Sardor"
    }
  ],
  "total": 150
}
```

### Database Query

```javascript
// ProductItem collection dan sotilganlarni olish
const movements = await ProductItem.find({
  status: 'sold',
  soldDate: {
    $gte: new Date('2025-01-01'),
    $lte: new Date('2025-02-12')
  },
  branchId: 1  // ixtiyoriy
}).sort({ soldDate: -1 });

// Har bir movement uchun qo'shimcha ma'lumotlar
for (const movement of movements) {
  // Mahsulot nomi
  const product = await WarehouseProduct.findOne({ 
    productId: movement.productId 
  });
  
  // Filial nomi
  const branch = await Branch.findOne({ 
    branchId: movement.branchId 
  });
  
  // Kassir nomi
  const cashier = await Cashier.findOne({ 
    cashierId: movement.soldBy 
  });
}
```

## 📊 Misol Ma'lumotlar

### Chiqim Yozuvi:

```javascript
{
  productName: "iPhone 14 Pro Max 256GB",
  imei: "123456789012345",
  sellPrice: 1000,
  branchName: "Markaziy filial",
  cashierName: "Alisher Karimov",
  customerName: "Sardor Rahimov",
  soldDate: "2025-02-12T14:30:00Z"
}
```

### Jadvalda Ko'rinishi:

```
1 | 12.02.2025 | iPhone 14 Pro Max | 123...345 | $1,000 | Markaziy | Alisher | Sardor
  | 14:30      | 256GB             |           |        |          |         |
```

## 🎨 Dizayn

### Ranglar:
- **Gradient:** To'q sariq (#f59e0b → #b45309)
- **Jadval header:** To'q sariq gradient
- **Hover:** Och sariq (#fef3c7)

### Elementlar:
- **Destination badge:** Ko'k (#dbeafe)
- **Price:** Yashil (#059669)
- **IMEI:** Monospace font, kulrang

## 📱 Foydalanish

### 1. Sahifaga Kirish

```
Ombor → 📊 Chiqim Tarixi
```

### 2. Sana Tanlash

```
Dan: 2025-01-01
Gacha: 2025-02-12
```

Avtomatik oxirgi 30 kun ko'rsatiladi.

### 3. Filter Qo'llash

```
Filial: Markaziy filial
Kassir: Alisher
```

### 4. Qidirish

```
Qidiruv: iPhone 14
```

Mahsulot nomi, IMEI yoki mijoz ismi bo'yicha qidiradi.

### 5. Excel Export

```
📊 Excel tugmasini bosing
```

Fayl yuklab olinadi: `Ombor_Chiqim_2025-01-01_2025-02-12.xlsx`

## 📈 Statistika Hisoblash

### Jami Chiqimlar:
```javascript
const totalMovements = movements.length;
```

### Jami Summa:
```javascript
const totalAmount = movements.reduce((sum, m) => 
  sum + m.sellPrice, 0
);
```

### Bugungi Chiqimlar:
```javascript
const today = new Date().toISOString().split('T')[0];
const todayMovements = movements.filter(m => 
  m.soldDate.startsWith(today)
).length;
```

### Bugungi Summa:
```javascript
const todayAmount = movements
  .filter(m => m.soldDate.startsWith(today))
  .reduce((sum, m) => sum + m.sellPrice, 0);
```

## 🔍 Qidiruv Algoritmi

```javascript
function searchHistory() {
  const query = searchInput.value.toLowerCase();
  
  filteredHistory = allHistory.filter(item => 
    item.productName?.toLowerCase().includes(query) ||
    item.imei?.toLowerCase().includes(query) ||
    item.customerName?.toLowerCase().includes(query)
  );
}
```

## 📄 Pagination

```javascript
const itemsPerPage = 50;
const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const pageItems = filteredHistory.slice(startIndex, endIndex);
```

## 📊 Excel Export

```javascript
function exportToExcel() {
  const data = filteredHistory.map((item, index) => ({
    '№': index + 1,
    'Sana': new Date(item.soldDate).toLocaleDateString('uz-UZ'),
    'Vaqt': new Date(item.soldDate).toLocaleTimeString('uz-UZ'),
    'Mahsulot': item.productName,
    'IMEI': item.imei,
    'Narxi': item.sellPrice,
    'Filial': item.branchName,
    'Kassir': item.cashierName,
    'Mijoz': item.customerName
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Chiqim Tarixi');
  
  XLSX.writeFile(wb, fileName);
}
```

## 🎯 Foydalanish Holatlari

### 1. Kunlik Hisobot

```
Dan: 2025-02-12
Gacha: 2025-02-12
```

Bugungi barcha chiqimlarni ko'rish.

### 2. Kassir Hisoboti

```
Kassir: Alisher
Dan: 2025-02-01
Gacha: 2025-02-12
```

Alisher sotgan barcha mahsulotlar.

### 3. Filial Hisoboti

```
Filial: Markaziy
Dan: 2025-02-01
Gacha: 2025-02-12
```

Markaziy filialdan chiqgan mahsulotlar.

### 4. Mahsulot Qidirish

```
Qidiruv: iPhone 14
```

Barcha iPhone 14 sotuvlari.

### 5. IMEI Qidirish

```
Qidiruv: 123456789012345
```

Aniq IMEI bo'yicha qidirish.

## 🔒 Xavfsizlik

### Ruxsatlar:
- ✅ Faqat admin ko'rishi mumkin
- ✅ Kassir faqat o'z sotuvlarini ko'radi (kelajakda)

### Ma'lumotlar:
- ✅ Faqat sotilgan mahsulotlar
- ✅ O'chirilgan yozuvlar ko'rinmaydi

## 📈 Kelajak Rejalar

### Phase 1 (Hozir):
- ✅ Chiqim tarixi ko'rish
- ✅ Filter va qidiruv
- ✅ Excel export
- ✅ Pagination

### Phase 2 (Keyingi):
- 🔄 PDF export
- 🔄 Grafik ko'rinish
- 🔄 Email yuborish
- 🔄 Avtomatik hisobotlar

### Phase 3 (Kelajak):
- 🔄 Real-time yangilanish
- 🔄 Push notifications
- 🔄 Advanced analytics
- 🔄 Predictive insights

## 📞 Yordam

Savollar bo'lsa:
- 📧 Email: support@dokon.uz
- 📱 Telegram: @dokon_support

---

**Versiya:** 3.3  
**Sana:** 2025-02-12  
**Status:** ✅ Tayyor
