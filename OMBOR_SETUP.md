# Ombor Boshqaruvi - PostgreSQL + Prisma Setup

## 1. PostgreSQL Database Setup (Render.com)

### Render.com da PostgreSQL yaratish:
1. Render.com dashboard ga kiring
2. "New +" → "PostgreSQL" tanlang
3. Database nomi: `mijoz-ombor-db`
4. Region: Frankfurt (yoki yaqin)
5. Plan: Free tier
6. "Create Database" bosing

### Connection String olish:
- Dashboard → Database → "Internal Database URL" ni nusxalang
- Format: `postgresql://user:password@host:port/database`

## 2. Loyihaga Prisma o'rnatish

```bash
npm install @prisma/client
npm install -D prisma
```

## 3. Prisma ni sozlash

```bash
npx prisma init
```

## 4. Database Schema (Ombor uchun)

`prisma/schema.prisma` faylida:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Mahsulotlar
model Product {
  id          Int       @id @default(autoincrement())
  code        String    @unique
  name        String
  category    String
  unit        String    // dona, kg, litr
  minStock    Float     @default(0)
  price       Float
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  stocks      Stock[]
  movements   StockMovement[]
}

// Ombor qoldiqlari
model Stock {
  id          Int       @id @default(autoincrement())
  productId   Int
  quantity    Float
  warehouse   String    @default("Asosiy ombor")
  lastUpdated DateTime  @default(now())
  
  product     Product   @relation(fields: [productId], references: [id])
  
  @@unique([productId, warehouse])
}

// Mahsulot harakati (kirim/chiqim)
model StockMovement {
  id          Int       @id @default(autoincrement())
  productId   Int
  type        String    // "IN" (kirim) yoki "OUT" (chiqim)
  quantity    Float
  warehouse   String    @default("Asosiy ombor")
  reference   String?   // Hujjat raqami
  notes       String?
  createdBy   String
  createdAt   DateTime  @default(now())
  
  product     Product   @relation(fields: [productId], references: [id])
}

// Yetkazib beruvchilar
model Supplier {
  id          Int       @id @default(autoincrement())
  name        String
  phone       String?
  address     String?
  inn         String?   @unique
  createdAt   DateTime  @default(now())
  
  purchases   Purchase[]
}

// Xaridlar
model Purchase {
  id          Int       @id @default(autoincrement())
  supplierId  Int
  totalAmount Float
  status      String    @default("pending") // pending, completed, cancelled
  notes       String?
  createdBy   String
  createdAt   DateTime  @default(now())
  
  supplier    Supplier  @relation(fields: [supplierId], references: [id])
  items       PurchaseItem[]
}

model PurchaseItem {
  id          Int       @id @default(autoincrement())
  purchaseId  Int
  productId   Int
  quantity    Float
  price       Float
  
  purchase    Purchase  @relation(fields: [purchaseId], references: [id])
}
```

## 5. .env fayliga qo'shish

```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

## 6. Database yaratish

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 7. Ombor API Endpoints (server.js ga qo'shish)

### Mahsulotlar:
- `GET /api/products` - Barcha mahsulotlar
- `POST /api/products` - Yangi mahsulot
- `PUT /api/products/:id` - Mahsulotni yangilash
- `DELETE /api/products/:id` - Mahsulotni o'chirish

### Ombor qoldiqlari:
- `GET /api/stock` - Ombor qoldiqlari
- `GET /api/stock/low` - Kam qolgan mahsulotlar
- `POST /api/stock/movement` - Kirim/Chiqim

### Xaridlar:
- `GET /api/purchases` - Xaridlar ro'yxati
- `POST /api/purchases` - Yangi xarid
- `GET /api/suppliers` - Yetkazib beruvchilar

## 8. 1C dan import qilish

### Excel orqali:
1. 1C dan Excel export qiling
2. `excel-manager.js` ni kengaytiring
3. Prisma orqali database ga import qiling

### CSV orqali:
1. 1C dan CSV export
2. Node.js CSV parser ishlatib import qiling

## 9. Afzalliklari

✅ Professional database
✅ Tranzaksiyalar va data integrity
✅ Tez qidiruv va filtrlash
✅ Backup va restore oson
✅ Render.com bilan bepul
✅ Prisma ORM - oson va xavfsiz
✅ TypeScript support
✅ Auto-complete va type safety

## 10. Keyingi qadamlar

1. PostgreSQL database yarating
2. Prisma o'rnating va sozlang
3. Schema yarating va migrate qiling
4. API endpoints yozing
5. Frontend qism qo'shing
6. 1C dan import funksiyasi
7. Hisobotlar va statistika
