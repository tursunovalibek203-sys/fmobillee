# 📊 Admin Dashboard - Kengaytirilgan Versiya

## Umumiy Ma'lumot

Admin dashboard kengaytirildi - filiallar bo'yicha savdolar, mahsulotlar statistikasi va batafsil hisobotlar qo'shildi.

## Yangi Xususiyatlar

### 📈 Kengaytirilgan Statistika

**8 ta Asosiy Metrika:**
1. **Jami Mijozlar** - Barcha mijozlar soni
2. **Jami Savdolar** - Umumiy savdolar soni
3. **Jami Qarz** - Barcha qarzlar yig'indisi
4. **Bugungi Savdolar** - Bugun amalga oshirilgan savdolar
5. **Filiallar** - Faol filiallar soni
6. **Kassirlar** - Ro'yxatdan o'tgan kassirlar
7. **Mahsulotlar** - Ombordagi mahsulotlar
8. **Bugungi Daromad** - Bugun to'langan pul

### 🏢 Filiallar bo'yicha Savdolar

**Ko'rsatiladigan Ma'lumotlar:**
- Filial nomi
- Bugungi savdolar soni
- Jami summa
- To'langan summa
- O'rtacha chek
- Reyting (🥇🥈🥉)

**Xususiyatlar:**
- Eng ko'p savdo qilgan filialdan boshlab saralash
- Gradient background (yashil)
- Vizual reyting ko'rsatkichlari
- Responsive grid layout

**Misol:**
```
🥇 Toshkent Filiali
   $15,234.50
   45 ta savdo
   
   Jami summa: $16,000.00
   O'rtacha chek: $355.56
```

### 🔥 Eng Ko'p Sotiladigan Mahsulotlar

**Top 10 Mahsulotlar:**
- Mahsulot nomi
- Sotilgan soni
- Jami summa
- O'rtacha narx

**Saralash:**
- Eng ko'p sotilgan mahsulotdan boshlab
- Vizual raqamlash (1, 2, 3...)
- Ko'k border

**Misol:**
```
1  📦 iPhone 15 Pro Max
   12 ta sotildi
   $14,400.00
   O'rtacha: $1,200.00
```

### 👥 Kassirlar Reytingi

**Ko'rsatiladigan Ma'lumotlar:**
- Kassir ismi
- Savdolar soni
- Jami summa
- To'langan summa
- O'rtacha chek
- Reyting (🥇🥈🥉)

**Xususiyatlar:**
- Eng ko'p daromad keltirgan kassirdan boshlab
- Vizual reyting
- Batafsil statistika

**Misol:**
```
🥇 Sardor Aliyev
   $8,500.00
   25 ta savdo • O'rtacha: $340.00
   Jami: $9,000.00
```

### 📋 Bugungi Barcha Savdolar

**Jadval Ustunlari:**
1. Vaqt
2. Filial
3. Kassir
4. Mijoz
5. Mahsulot
6. Narx
7. To'langan
8. Qarz

**Filtrlash:**
- Filial bo'yicha
- Kassir bo'yicha
- Mahsulot qidirish

**Jami Qator:**
- Jami narx
- Jami to'langan
- Jami qarz

**Misol:**
```
| Vaqt  | Filial   | Kassir | Mijoz | Mahsulot | Narx      | To'langan | Qarz     |
|-------|----------|--------|-------|----------|-----------|-----------|----------|
| 10:30 | Toshkent | Sardor | Ali   | iPhone   | $1,200.00 | $1,000.00 | $200.00  |
| 11:45 | Samarqand| Aziza  | Vali  | Samsung  | $800.00   | $800.00   | -        |
|-------|----------|--------|-------|----------|-----------|-----------|----------|
| JAMI:                                          | $2,000.00 | $1,800.00 | $200.00  |
```

## Texnik Detalllar

### API Endpointlar

```javascript
// Statistika
GET /api/stats

// Filiallar
GET /api/branches

// Kassirlar
GET /api/cashiers

// Mahsulotlar
GET /api/warehouse/products

// Barcha savdolar
GET /api/all-cashier-sales
```

### Ma'lumotlar Strukturasi

**Savdo Obyekti:**
```javascript
{
  saleId: 1234567890,
  date: "12.02.2025",
  time: "10:30",
  branchId: 1,
  branchName: "Toshkent",
  cashierId: 1,
  cashierName: "Sardor",
  customerId: 1,
  customerName: "Ali",
  product: "iPhone 15",
  price: 1200.00,
  paidUSD: 1000.00,
  paidUZS: 2540000,
  uzsToUSD: 200.00,
  totalPaidUSD: 1200.00,
  debt: 0.00
}
```

### Hisoblashlar

**Filial Statistikasi:**
```javascript
{
  name: "Toshkent",
  sales: [...],
  totalAmount: 15000.00,
  totalPaid: 14500.00,
  count: 45,
  avgCheck: 333.33
}
```

**Mahsulot Statistikasi:**
```javascript
{
  name: "iPhone 15",
  count: 12,
  totalAmount: 14400.00,
  totalPaid: 14000.00,
  avgPrice: 1200.00
}
```

**Kassir Statistikasi:**
```javascript
{
  name: "Sardor",
  count: 25,
  totalAmount: 9000.00,
  totalPaid: 8500.00,
  avgCheck: 360.00
}
```

## Filtrlash Funksiyasi

### Filial bo'yicha
```javascript
filterSales() {
  const branchId = document.getElementById('filterBranch').value;
  let filtered = allSales.filter(s => s.branchId == branchId);
  renderSalesTable(filtered);
}
```

### Kassir bo'yicha
```javascript
const cashierId = document.getElementById('filterCashier').value;
let filtered = allSales.filter(s => s.cashierId == cashierId);
```

### Mahsulot qidirish
```javascript
const searchText = document.getElementById('searchProduct').value.toLowerCase();
let filtered = allSales.filter(s => 
  s.product.toLowerCase().includes(searchText) ||
  s.customerName.toLowerCase().includes(searchText)
);
```

## Dizayn Xususiyatlari

### Ranglar

**Reyting Ranglari:**
- 🥇 1-o'rin: `#f59e0b` (Oltin)
- 🥈 2-o'rin: `#9ca3af` (Kumush)
- 🥉 3-o'rin: `#cd7f32` (Bronza)
- Boshqalar: `#6b7280` (Kulrang)

**Gradient Backgrounds:**
- Filiallar: `linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)` (Yashil)
- Jadval header: `linear-gradient(135deg, #3b82f6, #2563eb)` (Ko'k)
- Jadval footer: `linear-gradient(135deg, #1e3a8a, #1e40af)` (To'q ko'k)

### Animatsiyalar

**Hover Effektlari:**
```css
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(37, 99, 235, 0.22);
}
```

**Transition:**
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

## Responsive Dizayn

### Desktop (>768px)
- Grid: 4 ustun
- To'liq jadval
- Barcha ustunlar ko'rinadi

### Tablet (768px)
- Grid: 2 ustun
- Jadval scroll
- Asosiy ustunlar

### Mobile (<480px)
- Grid: 1 ustun
- Vertikal scroll
- Minimal ma'lumot

## Performance

### Optimizatsiya
- Lazy loading
- Virtual scrolling (katta jadvallar uchun)
- Debounce qidiruv (300ms)
- Memoization

### Caching
- LocalStorage
- Session storage
- API response cache

## Xavfsizlik

### Tekshiruvlar
- Login validatsiyasi
- Session timeout (24 soat)
- CSRF protection
- XSS prevention

### Ruxsatlar
- Faqat admin kirishi
- Role-based access
- Audit log

## Foydalanish

### Sahifani Ochish
```
http://localhost:3000/admin.html
```

### Filtrlash
1. Filial tanlash
2. Kassir tanlash
3. Mahsulot qidirish
4. Natijalar avtomatik yangilanadi

### Export
- Excel export
- PDF export (kelajakda)
- CSV export (kelajakda)

## Misol: To'liq Dashboard

```
📊 Admin Dashboard

┌─────────────────────────────────────────────────────┐
│ Statistika                                          │
├─────────────────────────────────────────────────────┤
│ Mijozlar: 150  Savdolar: 450  Qarz: $5,234.50     │
│ Bugun: 45      Filiallar: 3   Kassirlar: 8        │
│ Mahsulotlar: 120  Daromad: $15,234.50             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🏢 Filiallar bo'yicha bugungi savdolar             │
├─────────────────────────────────────────────────────┤
│ 🥇 Toshkent    $8,500.00  (25 ta)                  │
│ 🥈 Samarqand   $4,234.50  (15 ta)                  │
│ 🥉 Buxoro      $2,500.00  (5 ta)                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🔥 Eng ko'p sotiladigan mahsulotlar                │
├─────────────────────────────────────────────────────┤
│ 1. iPhone 15 Pro Max  (12 ta)  $14,400.00         │
│ 2. Samsung S24 Ultra  (8 ta)   $6,400.00          │
│ 3. MacBook Pro M3     (5 ta)   $10,000.00         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 👥 Kassirlar reytingi                              │
├─────────────────────────────────────────────────────┤
│ 🥇 Sardor  $8,500.00  (25 ta)                      │
│ 🥈 Aziza   $4,234.50  (15 ta)                      │
│ 🥉 Bobur   $2,500.00  (5 ta)                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 📋 Bugungi barcha savdolar                         │
├─────────────────────────────────────────────────────┤
│ [Filial ▼] [Kassir ▼] [🔍 Qidirish...]           │
│                                                     │
│ Jadval: 45 ta savdo                                │
│ Jami: $15,234.50                                   │
└─────────────────────────────────────────────────────┘
```

## Kelajak Rejalar

### Qo'shimcha Xususiyatlar
- [ ] Real-time yangilanish (WebSocket)
- [ ] Grafik va diagrammalar (Chart.js)
- [ ] Export PDF
- [ ] Email hisobotlar
- [ ] Push notifications
- [ ] Dark mode
- [ ] Multi-language

### Takomillashtirish
- [ ] Virtual scrolling
- [ ] Infinite scroll
- [ ] Advanced filters
- [ ] Custom date range
- [ ] Comparison mode
- [ ] Forecast analytics

---

**Versiya**: 2.0 Kengaytirilgan
**Sana**: 2025-02-12
**Muallif**: Kiro AI Assistant
