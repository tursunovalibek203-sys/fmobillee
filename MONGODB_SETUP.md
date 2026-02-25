# MongoDB O'rnatish Yo'riqnomasi

## HOZIRGI HOLAT: ✅ Server JSON fayllar bilan ishlayapti

Sizning serveringiz hozir JSON fayllar bilan ishlayapti va to'liq funksional. MongoDB kerak bo'lsa quyidagi usullardan birini tanlang:

## 1-usul: MongoDB Atlas (Bepul, Tavsiya etiladi)

### Qadamlar:
1. **https://www.mongodb.com/atlas** saytiga o'ting
2. **"Start Free"** tugmasini bosing
3. **Google** yoki **email** bilan ro'yxatdan o'ting
4. **"Build a Database"** tugmasini bosing
5. **"M0 Cluster Tier"** (bepul) ni tanlang
6. **Provider**: AWS, **Region**: yaqin joylashgan mintaqa
7. **Cluster Name**: o'zingiz xohlagan nom
8. **"Create Cluster"** tugmasini bosing

### Foydalanuvchi yaratish:
1. **Database Access** bo'limiga o'ting
2. **"Add New Database User"** tugmasini bosing
3. **Username** va **Password** kiriting (eslab qoling!)
4. **"Built-in Role"**: "Read and write to any database"
5. **"Add User"** tugmasini bosing

### IP manzil qo'shish:
1. **Network Access** bo'limiga o'ting
2. **"Add IP Address"** tugmasini bosing
3. **"Allow Access from Anywhere"** (0.0.0.0/0) ni tanlang
4. **"Confirm"** tugmasini bosing

### Connection String olish:
1. **Database** bo'limiga o'ting
2. **"Connect"** tugmasini bosing
3. **"Connect your application"** ni tanlang
4. **Connection string** ni nusxalang

### .env faylini yangilash:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dokon_db?retryWrites=true&w=majority
```

## 2-usul: MongoDB Community Server (Lokal)

### Windows uchun:
1. https://www.mongodb.com/try/download/community saytiga o'ting
2. Windows versiyasini yuklab oling
3. MSI faylni ishga tushiring va o'rnating
4. MongoDB Compass ham o'rnatiladi (GUI)

### O'rnatishdan keyin:
```bash
# MongoDB xizmatini ishga tushirish
net start MongoDB

# Yoki qo'lda ishga tushirish
mongod --dbpath "C:\data\db"
```

## 3-usul: Docker (Eng oson, agar Docker o'rnatilgan bo'lsa)

```bash
# MongoDB konteynerini ishga tushirish
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Tekshirish

Server ishga tushgandan keyin quyidagi xabarni ko'rishingiz kerak:
```
✅ MongoDB ulandi: localhost:27017
```

## MUHIM ESLATMA

Hozircha sizning tizimingiz JSON fayllar bilan to'liq ishlayapti. MongoDB faqat katta ma'lumotlar hajmi va tezroq qidiruv uchun kerak. Kichik do'konlar uchun JSON fayllari yetarli.