# 🚀 Render.com ga Deploy Qilish Qo'llanmasi

## 📋 Talab qilinadigan narsalar

1. ✅ GitHub akkaunt
2. ✅ Render.com akkaunt (bepul)
3. ✅ MongoDB Atlas akkaunt (bepul)
4. ✅ Telegram Bot Token

---

## 1️⃣ MongoDB Atlas Sozlash

### 1. MongoDB Atlas ga kiring
- [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- **Sign Up** yoki **Log In**

### 2. Cluster yarating
- **Create a New Cluster** (FREE tier)
- **Cloud Provider**: AWS
- **Region**: Eng yaqin region tanlang
- **Cluster Name**: `dokon-cluster`
- **Create Cluster** tugmasini bosing

### 3. Database User yarating
- **Database Access** → **Add New Database User**
- **Username**: `dokon_user`
- **Password**: Kuchli parol yarating (saqlab qo'ying!)
- **Database User Privileges**: `Read and write to any database`
- **Add User**

### 4. Network Access sozlang
- **Network Access** → **Add IP Address**
- **Allow Access from Anywhere**: `0.0.0.0/0` (Render uchun kerak)
- **Confirm**

### 5. Connection String oling
- **Clusters** → **Connect** → **Connect your application**
- **Driver**: Node.js
- **Version**: 4.1 or later
- Connection string nusxalang:
```
mongodb+srv://dokon_user:<password>@dokon-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
- `<password>` ni o'z parolingiz bilan almashtiring!

---

## 2️⃣ Render.com ga Deploy Qilish

### 1. Render.com ga kiring
- [https://render.com](https://render.com)
- **Sign Up** (GitHub bilan)

### 2. GitHub Repository ulang
- **Dashboard** → **New** → **Web Service**
- **Connect GitHub** → Repository tanlang
- Yoki: **Public Git Repository** → GitHub repo URL kiriting

### 3. Service sozlamalari
```
Name: dokon-boshqaruvi
Environment: Node
Region: Singapore (yoki yaqin region)
Branch: main
Build Command: npm install
Start Command: node start.js
```

### 4. Environment Variables qo'shing
**Environment** bo'limida quyidagilarni qo'shing:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://dokon_user:PAROL@dokon-cluster.xxxxx.mongodb.net/dokon?retryWrites=true&w=majority
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PORT=10000
```

⚠️ **MUHIM**: 
- `MONGODB_URI` - MongoDB Atlas connection string
- `BOT_TOKEN` - Telegram bot token (@BotFather dan)
- `ADMIN_PASSWORD` - O'z parolingizni kiriting!

### 5. Deploy qiling
- **Create Web Service** tugmasini bosing
- Deploy jarayoni 2-5 daqiqa davom etadi
- ✅ Deploy tugagach, URL olasiz: `https://dokon-boshqaruvi.onrender.com`

---

## 3️⃣ Telegram Bot Webhook Sozlash

Deploy tugagach, bot webhook ni yangilash kerak:

### Brauzerda ochish:
```
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://dokon-boshqaruvi.onrender.com/webhook
```

`<BOT_TOKEN>` ni o'z bot tokeningiz bilan almashtiring!

### Javob:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

---

## 4️⃣ Saytni Ochish

1. **Login sahifa**: `https://dokon-boshqaruvi.onrender.com/login.html`
2. **Username**: `admin`
3. **Password**: `.env` da belgilagan parol

---

## 🔧 Muammolarni Hal Qilish

### Sayt ochilmayapti?
- Render Dashboard → **Logs** ni tekshiring
- Environment variables to'g'ri kiritilganini tekshiring

### Bot ishlamayapti?
- Webhook to'g'ri sozlanganini tekshiring
- BOT_TOKEN to'g'ri ekanini tekshiring
- Render Logs da xatolarni ko'ring

### MongoDB ulanmayapti?
- MONGODB_URI to'g'ri ekanini tekshiring
- MongoDB Atlas da IP whitelist `0.0.0.0/0` ekanini tekshiring
- Database user parol to'g'ri ekanini tekshiring

### 15 daqiqadan keyin sayt uxlayapti?
- Bu Render bepul plan xususiyati
- Birinchi so'rov 30 sekund kutadi
- Keyin tez ishlaydi
- **Yechim**: UptimeRobot.com dan 5 daqiqada bir ping yuborish

---

## 📊 Render Bepul Plan Cheklovlari

- ✅ 750 soat/oy (deyarli doimiy)
- ⚠️ 15 daqiqa faoliyatsizlikdan keyin uxlaydi
- ✅ 512 MB RAM
- ✅ 0.1 CPU
- ✅ HTTPS bepul
- ✅ Avtomatik deploy

---

## 🎯 Keyingi Qadamlar

1. ✅ Saytni ochib test qiling
2. ✅ Telegram botni test qiling
3. ✅ Mijoz qo'shib, savdo qiling
4. ✅ Excel fayllar yaratilishini tekshiring
5. ✅ Backup funksiyasini test qiling

---

## 💡 Maslahatlar

1. **Custom Domain**: Render da o'z domeningizni ulashingiz mumkin
2. **Auto-Deploy**: GitHub ga push qilsangiz avtomatik deploy bo'ladi
3. **Logs**: Render Dashboard da real-time logs ko'ring
4. **Monitoring**: Render Metrics da server holatini kuzating

---

## 🆘 Yordam

Muammo bo'lsa:
1. Render Logs ni tekshiring
2. MongoDB Atlas Metrics ni ko'ring
3. Telegram Bot API ni test qiling
4. Environment variables ni qayta tekshiring

---

**Omad! 🚀**
