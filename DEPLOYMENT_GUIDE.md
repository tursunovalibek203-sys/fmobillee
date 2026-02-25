# 🚀 Deployment Qo'llanmasi

## 📋 Umumiy Ma'lumot

Bu qo'llanma tizimni production muhitga deploy qilish uchun to'liq yo'riqnoma.

---

## 🎯 Deployment Variantlari

### 1. Render.com (Tavsiya etiladi)
- ✅ Bepul plan mavjud
- ✅ Avtomatik deploy
- ✅ MongoDB Atlas bilan integratsiya
- ✅ SSL sertifikat
- ✅ Custom domain

### 2. Heroku
- ✅ Bepul plan (cheklangan)
- ✅ Oson sozlash
- ✅ Add-ons

### 3. VPS (DigitalOcean, AWS, etc.)
- ✅ To'liq nazorat
- ✅ Kengaytiriladigan
- ✅ Custom konfiguratsiya

---

## 🔧 Render.com Deployment

### 1. Tayyorgarlik

**GitHub Repository:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

**render.yaml tekshirish:**
```yaml
services:
  - type: web
    name: dokon-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: MONGODB_URI
        sync: false
      - key: ADMIN_USERNAME
        sync: false
      - key: ADMIN_PASSWORD
        sync: false
```

### 2. MongoDB Atlas Sozlash

**1. Account yarating:**
```
https://www.mongodb.com/cloud/atlas
```

**2. Cluster yarating:**
```
- Free tier tanlang (M0)
- Region: Closest to your users
- Cluster name: dokon-cluster
```

**3. Database User yarating:**
```
Username: dokon_user
Password: <secure_password>
Role: Read and write to any database
```

**4. Network Access:**
```
IP Address: 0.0.0.0/0 (Allow from anywhere)
```

**5. Connection String:**
```
mongodb+srv://dokon_user:<password>@dokon-cluster.xxxxx.mongodb.net/dokon?retryWrites=true&w=majority
```

### 3. Render.com Sozlash

**1. Account yarating:**
```
https://render.com
```

**2. New Web Service:**
```
- Connect GitHub repository
- Name: dokon-backend
- Environment: Node
- Build Command: npm install
- Start Command: npm start
```

**3. Environment Variables:**
```
NODE_ENV=production
PORT=3000
MONGODB_URI=<your-mongodb-atlas-uri>
WAREHOUSE_MONGODB_URI=<your-mongodb-atlas-uri>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<secure_password>
EXCHANGE_RATE=12500
```

**4. Deploy:**
```
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
```

### 4. Custom Domain (Ixtiyoriy)

**1. Domain sotib oling:**
```
Namecheap, GoDaddy, etc.
```

**2. Render.com da sozlang:**
```
Settings → Custom Domain → Add Custom Domain
```

**3. DNS sozlang:**
```
Type: CNAME
Name: www
Value: <your-app>.onrender.com
```

---

## 🔐 Xavfsizlik Sozlamalari

### 1. Environment Variables

**Muhim:**
```env
# Hech qachon GitHub ga push qilmang!
ADMIN_PASSWORD=<very_secure_password>
MONGODB_URI=<connection_string>
BOT_TOKEN=<telegram_bot_token>
JWT_SECRET=<random_secret_key>
```

### 2. .gitignore

```
node_modules/
.env
.env.local
backups/*.json
excel-files/*.xlsx
*.log
.DS_Store
```

### 3. Rate Limiting

**server.js da:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. Helmet.js

```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## 📊 Monitoring va Logging

### 1. Render.com Logs

```
Dashboard → Your Service → Logs
```

### 2. Custom Logging

**logger.js:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

module.exports = logger;
```

### 3. Error Tracking

**Sentry.io (Tavsiya):**
```bash
npm install @sentry/node
```

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV
});
```

---

## 🔄 Backup Strategiyasi

### 1. Avtomatik Backup

**scripts/auto-backup.js:**
```javascript
const cron = require('node-cron');

// Har kuni soat 2:00 da
cron.schedule('0 2 * * *', async () => {
  await createBackup();
});
```

### 2. MongoDB Atlas Backup

```
Cluster → Backup → Enable Cloud Backup
Retention: 7 days
```

### 3. Manual Backup

```bash
npm run backup
```

---

## 🚀 Performance Optimization

### 1. Caching

**Redis (Ixtiyoriy):**
```bash
npm install redis
```

```javascript
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
```

### 2. Database Indexing

```javascript
// MongoDB indexes
db.customers.createIndex({ customerId: 1 });
db.products.createIndex({ productId: 1 });
db.sales.createIndex({ date: -1 });
```

### 3. Compression

```javascript
const compression = require('compression');
app.use(compression());
```

### 4. Static Files

```javascript
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

---

## 📱 SSL/HTTPS

### Render.com
```
Avtomatik SSL sertifikat (Let's Encrypt)
```

### Custom VPS
```bash
# Certbot
sudo apt-get install certbot
sudo certbot --nginx -d yourdomain.com
```

---

## 🧪 Testing Before Deploy

### 1. Local Testing

```bash
# Production mode da test
NODE_ENV=production npm start
```

### 2. Environment Variables Test

```bash
# .env faylini tekshiring
cat .env
```

### 3. Database Connection Test

```bash
npm run test-warehouse-connection
```

### 4. API Endpoints Test

```bash
# Postman yoki curl
curl http://localhost:3000/api/health
```

---

## 🔧 Troubleshooting

### 1. Deployment Failed

**Xato:** `npm install failed`
```
Solution:
- package.json ni tekshiring
- Node.js versiyasini tekshiring (>=18.0.0)
- Dependencies ni yangilang
```

**Xato:** `MongoDB connection failed`
```
Solution:
- MONGODB_URI ni tekshiring
- Network access ni tekshiring (0.0.0.0/0)
- Database user credentials ni tekshiring
```

### 2. Application Crashed

**Xato:** `Cannot find module`
```
Solution:
- npm install ni qayta ishga tushiring
- node_modules ni o'chiring va qayta o'rnating
```

**Xato:** `Port already in use`
```
Solution:
- PORT environment variable ni o'zgartiring
- Boshqa process ni to'xtating
```

### 3. Slow Performance

```
Solution:
- Database indexes qo'shing
- Caching qo'shing
- Query optimization
- CDN ishlatish
```

---

## 📊 Post-Deployment Checklist

### ✅ Tekshirish Ro'yxati

```
□ Application ishga tushdi
□ Database ulanish ishlayapti
□ Admin login ishlayapti
□ Kassir login ishlayapti
□ Savdo qo'shish ishlayapti
□ Ombor ishlayapti
□ Hisobotlar ishlayapti
□ Backup ishlayapti
□ SSL sertifikat faol
□ Custom domain ishlayapti (agar bor bo'lsa)
□ Monitoring sozlangan
□ Error tracking sozlangan
```

---

## 🔄 Yangilanishlar

### Git Workflow

```bash
# Development
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Merge to main
git checkout main
git merge feature/new-feature
git push origin main

# Render.com avtomatik deploy qiladi
```

### Manual Deploy

```bash
# Render.com dashboard
Manual Deploy → Deploy latest commit
```

---

## 📞 Yordam

### Muammolar

**Render.com:**
```
https://render.com/docs
support@render.com
```

**MongoDB Atlas:**
```
https://docs.atlas.mongodb.com
support@mongodb.com
```

**Loyiha:**
```
📧 support@dokonpro.uz
📱 @dokonpro_support
```

---

## 🎉 Muvaffaqiyatli Deploy!

Agar barcha qadamlar to'g'ri bajarilgan bo'lsa, sizning tizimingiz production da ishlayapti!

**URL:** `https://your-app.onrender.com`

**Test qiling:**
```
1. Admin login
2. Kassir login
3. Savdo qo'shish
4. Hisobotlarni ko'rish
5. Backup yaratish
```

---

**Versiya:** 1.0
**Sana:** 2026-02-14
**Status:** ✅ Production Ready

**Omad! 🚀**

