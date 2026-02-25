# 📱 HAR BIR DONA UCHUN IMEI TIZIMI

## Konsepsiya

Agar 10 ta iPhone qo'shsangiz, har biriga alohida IMEI kiritasiz:

```
iPhone 15 Pro - 10 dona
├── Dona 1: IMEI 123456789012345
├── Dona 2: IMEI 123456789012346
├── Dona 3: IMEI 123456789012347
├── ...
└── Dona 10: IMEI 123456789012355
```

## Database Schema

```javascript
// Mahsulot (umumiy ma'lumot)
Product {
  productId: 1001,
  name: "iPhone 15 Pro",
  category: "Telefon",
  buyPrice: 1000,
  sellPrice: 1200,
  totalStock: 10  // Jami dona
}

// Har bir dona (alohida IMEI bilan)
ProductItem {
  itemId: "ITEM-001",
  productId: 1001,
  productName: "iPhone 15 Pro",
  imei: "123456789012345",
  serialNumber: "SN123456",
  status: "available", // available, sold, reserved
  buyPrice: 1000,
  sellPrice: 1200,
  supplier: "Apple Store",
  purchaseDate: "2026-02-13",
  soldDate: null,
  soldTo: null,
  notes: "Yangi, karobkada"
}
```

## Qo'shish Jarayoni

### 1. Mahsulot qo'shish:
```
Mahsulot: iPhone 15 Pro
Miqdor: 10 dona
```

### 2. Har bir dona uchun IMEI:
```
Dona 1: IMEI kiritish
Dona 2: IMEI kiritish
...
Dona 10: IMEI kiritish
```

## Foydalanish

### Omborda:
- Mahsulot qo'shganda har bir dona uchun IMEI kiritiladi
- Har bir IMEI alohida tracking qilinadi
- IMEI orqali qidirish mumkin

### Savdoda:
- Mahsulot sotilganda qaysi IMEI sotilganini belgilash
- IMEI status "sold" ga o'zgaradi
- Kimga sotilgani yoziladi

### Hisobotda:
- Qaysi IMEI mavjud
- Qaysi IMEI sotilgan
- Qaysi IMEI qaytarilgan
