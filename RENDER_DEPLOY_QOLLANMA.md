# 🚀 RENDER.COM GA DEPLOY QILISH

## 📅 Sana: 25-Fevral-2026

---

## ✅ GitHub ga Push Qilindi!

Repository: https://github.com/tursunovalibek203-sys/fmobillee

---

## 🌐 RENDER.COM DA DEPLOY QILISH

### 1. Render.com ga Kiring
```
https://render.com
```
- GitHub bilan login qiling

### 2. New Web Service Yarating
1. Dashboard → "New" → "Web Service"
2. "Connect a repository" → GitHub ni tanlang
3. Repository ni tanlang: `tursunovalibek203-sys/fmobillee`
4. "Connect" tugmasini bosing

### 3. Service Sozlamalari

#### Basic Settings:
- **Name**: `fmobillee` (yoki o'zingiz xohlagan nom)
- **Region**: `Oregon (US West)` (yoki yaqin region)
- **Branch**: `main`
- **Root Directory**: (bo'sh qoldiring)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

#### Plan:
- **Free** (bepul) yoki **Starter** ($7/oy)

### 4. Environment Variables Qo'shing

"Advanced" → "Add Environment Variable" tugmasini bosing:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_atlas_uri_here
BOT_TOKEN=your_telegram_bot_token_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
```

#### MongoDB URI Olish:
1. MongoDB Atlas ga kiring: https://cloud.mongodb.com
2. Cluster → "Connect" → "Connect your application"
3. URI ni nusxalang
4. Parolni o'zgartiring: `mongodb+srv://username:PASSWORD@cluster.mongodb.net/dokon_db`

#### Telegram Bot Token Olish:
1. Telegram da @BotFather ga yozing
2. `/newbot` buyrug'ini yuboring
3. Bot nomini kiriting
4. Token ni nusxalang

### 5. Deploy Qiling

1. "Create Web Service" tugmasini bosing
2. Deploy jarayoni boshlanadi (3-5 daqiqa)
3. Logs ni kuzating

---

## 📊 DEPLOY JARAYONI

### Deploy Logs:
```
==> Cloning from https://github.com/tursunovalibek203-sys/fmobillee...
==> Checking out commit a125141...
==> Running build command 'npm install'...
==> Installing dependencies...
==> Build successful!
==> Starting service with 'node server.js'...
==> Your service is live 🎉
```

### Muvaffaqiyatli Deploy:
```
🚀 DO'KON BOSHQARUV TIZIMI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server: https://fmobillee.onrender.com
🔌 Port: 3000
🗄️  MongoDB: Connected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Server ishga tushdi!
```

---

## 🌐 ISHLATISH

### URL:
```
https://fmobillee.onrender.com
```
(Render sizga avtomatik URL beradi)

### Admin Panel:
```
https://fmobillee.onrender.com/admin-dashboard.html
Username: admin
Password: [.env dagi parol]
```

### Kassir Panel:
```
https://fmobillee.onrender.com/cashier-dashboard-pro.html
```

### API:
```
https://fmobillee.onrender.com/api/products
https://fmobillee.onrender.com/api/cashiers
https://fmobillee.onrender.com/health
```

---

## 🔧 SOZLAMALAR

### Custom Domain (Ixtiyoriy):
1. Render Dashboard → Service → "Settings"
2. "Custom Domain" → "Add Custom Domain"
3. Domain nomini kiriting: `fmobile.uz`
4. DNS sozlamalarini yangilang

### Auto-Deploy:
- GitHub ga har push qilganingizda avtomatik deploy bo'ladi
- Branch: `main`

### Health Check:
- Render avtomatik health check qiladi
- Endpoint: `/health`
- Interval: 30 soniya

---

## 📊 MONITORING

### Logs:
```
Render Dashboard → Service → "Logs"
```
- Real-time logs
- Error tracking
- Performance monitoring

### Metrics:
```
Render Dashboard → Service → "Metrics"
```
- CPU usage
- Memory usage
- Request count
- Response time

---

## 🔒 XAVFSIZLIK

### Environment Variables:
- ✅ `.env` fayli GitHub ga push qilinmadi
- ✅ Barcha sirli ma'lumotlar Render da
- ✅ HTTPS avtomatik

### MongoDB Atlas:
1. Network Access → "Add IP Address"
2. "Allow Access from Anywhere" (0.0.0.0/0)
3. Yoki Render IP manzilini qo'shing

---

## 🐛 MUAMMOLAR VA YECHIMLAR

### 1. Deploy Failed
**Muammo**: Build xato
**Yechim**: 
- Logs ni tekshiring
- `package.json` da `start` script borligini tekshiring
- Dependencies to'g'ri o'rnatilganini tekshiring

### 2. MongoDB Connection Error
**Muammo**: MongoDB ga ulanmayapti
**Yechim**:
- `MONGODB_URI` to'g'ri ekanligini tekshiring
- MongoDB Atlas da IP whitelist ni tekshiring
- Parol to'g'ri ekanligini tekshiring

### 3. Service Unavailable
**Muammo**: Server ishlamayapti
**Yechim**:
- Logs ni tekshiring
- Health check endpoint ishlayaptimi: `/health`
- Port to'g'ri sozlanganini tekshiring

### 4. Slow Response
**Muammo**: Server sekin ishlayapti
**Yechim**:
- Free plan sekin bo'lishi mumkin
- Starter plan ga o'ting ($7/oy)
- MongoDB Atlas region ni tekshiring

---

## 💰 NARXLAR

### Free Plan:
- ✅ 750 soat/oy (31 kun)
- ✅ 512 MB RAM
- ✅ 0.1 CPU
- ⚠️ 15 daqiqa inactivity dan keyin sleep
- ⚠️ Sekin cold start

### Starter Plan ($7/oy):
- ✅ Unlimited hours
- ✅ 512 MB RAM
- ✅ 0.5 CPU
- ✅ No sleep
- ✅ Tezroq

### Standard Plan ($25/oy):
- ✅ 2 GB RAM
- ✅ 1 CPU
- ✅ Priority support

---

## 📱 TELEGRAM BOT

### Bot Sozlash:
1. Telegram da @BotFather ga yozing
2. `/setcommands` buyrug'ini yuboring
3. Bot nomini tanlang
4. Quyidagi buyruqlarni kiriting:

```
start - Botni ishga tushirish
help - Yordam
balance - Balansni ko'rish
sales - Savdolar tarixi
products - Mahsulotlar
```

### Webhook Sozlash:
```
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://fmobillee.onrender.com/webhook
```

---

## 🎉 YAKUNIY NATIJA

✅ **GitHub ga push qilindi**
✅ **Render.com ga deploy qilish tayyor**
✅ **Barcha fayllar tayyor**
✅ **Dokumentatsiya tayyor**

### Keyingi Qadamlar:
1. Render.com ga kiring
2. Web Service yarating
3. Environment variables qo'shing
4. Deploy qiling
5. URL ni oching va test qiling

**Omad!** 🚀

---

**Yaratilgan:** 25-Fevral-2026  
**Status:** ✅ TAYYOR  
**Repository:** https://github.com/tursunovalibek203-sys/fmobillee

---

## 📞 YORDAM

Agar savollar bo'lsa:
1. Render Docs: https://render.com/docs
2. MongoDB Atlas Docs: https://docs.atlas.mongodb.com
3. GitHub Issues: https://github.com/tursunovalibek203-sys/fmobillee/issues

**Omad!** 🎉
