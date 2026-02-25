# MongoDB Tezkor Yechim

## Hozirgi holat: ✅ Server ishlayapti

Sizning serveringiz hozir JSON fayllar bilan to'liq ishlayapti. MongoDB kerak bo'lsa:

## 1-usul: Yangi MongoDB Atlas hisobi (5 daqiqa)

### Qadamlar:
1. **https://www.mongodb.com/atlas** saytini oching
2. **"Start Free"** tugmasini bosing
3. **Email** va **parol** kiriting
4. **"Build a Database"** → **"M0 FREE"** ni tanlang
5. **"Create Cluster"** tugmasini bosing
6. **Database Access** → **"Add New Database User"**:
   - Username: `dokon_admin`
   - Password: `dokon2026`
7. **Network Access** → **"Add IP Address"** → **"Allow Access from Anywhere"**
8. **Database** → **"Connect"** → **"Connect your application"**
9. Connection string'ni nusxalang

### .env faylini yangilash:
```env
MONGODB_URI=mongodb+srv://dokon_admin:dokon2026@cluster0.xxxxx.mongodb.net/dokon_db?retryWrites=true&w=majority
```

**MUHIM**: `xxxxx` qismini o'zingizning haqiqiy klaster manzili bilan almashtiring!

## 2-usul: MongoDB o'rnatmasdan ishlash

Hozirgi holatda qolish - JSON fayllar bilan ishlash. Bu kichik do'konlar uchun yetarli.

## 3-usul: Lokal MongoDB o'rnatish

### Windows uchun:
1. **https://www.mongodb.com/try/download/community** saytiga o'ting
2. **Windows x64** versiyasini yuklab oling
3. **MSI** faylni ishga tushiring
4. **"Complete"** setup'ni tanlang
5. **"Install MongoDB as a Service"** ni belgilang
6. O'rnatish tugagach, serverni qayta ishga tushiring

## Tekshirish

MongoDB ulangandan keyin quyidagi xabarni ko'rasiz:
```
✅ MongoDB Atlas ulandi: cluster0-xxxxx.mongodb.net
📊 Database: dokon_db
```

## Xulosa

Hozircha sizning tizimingiz to'liq ishlayapti. MongoDB faqat katta ma'lumotlar hajmi uchun kerak. JSON fayllar yetarli bo'lsa, hech narsa qilmasangiz ham bo'ladi.

**Server manzili**: http://localhost:3000
**Admin panel**: http://localhost:3000/admin.html