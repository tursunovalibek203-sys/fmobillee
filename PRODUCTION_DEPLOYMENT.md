# 🚀 PRODUCTION DEPLOYMENT GUIDE

## 100% Xavfsiz va Ishonchli Tizim

Bu qo'llanma sizning tizimingizni production muhitida 100% xavfsiz va ishonchli qilib ishga tushirish uchun.

---

## 📋 TEZKOR BOSHLASH

### 1. Secure Server ni Ishga Tushirish

```bash
# Development muhitida test qilish
npm run dev:secure

# Production muhitida ishga tushirish
npm run start:secure
```

### 2. PM2 bilan Production Deploy

```bash
# PM2 ni o'rnatish (agar o'rnatilmagan bo'lsa)
npm install -g pm2

# Barcha servislarni ishga tushirish
pm2 start ecosystem.config.js

# Statusni ko'rish
pm2 status

# Loglarni ko'rish
pm2 logs

# Server restart
pm2 restart dokon-server

# Server stop
pm2 stop dokon-server
```

---

## 🔒 XAVFSIZLIK SOZLAMALARI

### 1. Environment Variables (.env)

**MUHIM:** Production muhitida quyidagi o'zgaruvchilarni o'zgartiring!

```env
# Server
PORT=3000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb://localhost:27017/dokon

# Admin (ALBATTA o'zgartiring!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=juda-kuchli-parol-12345!@#

# Telegram
BOT_TOKEN=your-telegram-bot-token

# Security Keys (ALBATTA yangi generatsiya qiling!)
JWT_SECRET=minimum-32-character-super-secret-jwt-key-here
SESSION_SECRET=minimum-32-character-super-secret-session-key
ENCRYPTION_KEY=64-character-hex-encryption-key-for-data-encryption

# Backup
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2. Xavfsiz Kalitlar Generatsiya Qilish

```bash
# JWT Secret generatsiya
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Session Secret generatsiya
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key generatsiya
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 💾 BACKUP TIZIMI

### Avtomatik Backup

Tizim avtomatik ravishda har kuni soat 2:00 da to'liq backup yaratadi.

```bash
# Backup scheduler ni ishga tushirish
npm run backup:schedule

# Yoki PM2 bilan
pm2 start ecosystem.config.js
```

### Manual Backup

```bash
# Hozir backup yaratish
npm run backup

# Yoki API orqali
curl -X POST http://localhost:3000/api/backup/create
```

### Backup Fayllar

- Joylashuv: `./backups/`
- Format: `backup-YYYY-MM-DDTHH-mm-ss.json.gz`
- Siqilgan: Gzip (level 9)
- Saqlash muddati: 30 kun

### Backuplarni Ko'rish

```bash
# API orqali
curl http://localhost:3000/api/backup/list
```

---

## 📊 MONITORING VA HEALTH CHECKS

### Health Check Endpoints

```bash
# Asosiy health check
curl http://localhost:3000/health

# Batafsil hisobot
curl http://localhost:3000/health/detailed

# System metrics
curl http://localhost:3000/health/metrics

# Database status
curl http://localhost:3000/health/database

# System status
curl http://localhost:3000/health/system
```

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# CPU va Memory
pm2 list

# Detailed info
pm2 show dokon-server
```

---

## 🛡️ XAVFSIZLIK XUSUSIYATLARI

### ✅ Faol Xavfsizlik

1. **JWT Authentication** - Token asosida autentifikatsiya
2. **Brute Force Protection** - 5 marta noto'g'ri login = 15 daqiqa bloklash
3. **Rate Limiting** - API so'rovlarni cheklash (100/15min)
4. **Input Sanitization** - XSS hujumlardan himoya
5. **Security Headers** - Helmet middleware
6. **CORS Protection** - Faqat ruxsat berilgan domenlar
7. **Session Management** - Xavfsiz session boshqaruvi
8. **Audit Logging** - Barcha muhim harakatlar log qilinadi

### 🔐 Login Xavfsizligi

```javascript
// Admin login - JWT token bilan
POST /api/admin-login
{
  "username": "admin",
  "password": "your-password"
}

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

### 🚨 Brute Force Protection

- 5 marta noto'g'ri login urinishi
- 15 daqiqa avtomatik bloklash
- IP address asosida kuzatish

---

## 🔄 AVTOMATIK TIKLASH

### Graceful Shutdown

Server to'xtatilganda:
1. Oxirgi backup yaratiladi
2. Database ulanishi yopiladi
3. Barcha jarayonlar to'g'ri tugaydi

```bash
# Graceful stop
pm2 stop dokon-server

# Graceful restart
pm2 restart dokon-server
```

### Auto Restart

PM2 avtomatik ravishda serverni qayta ishga tushiradi:
- Xatolik yuz berganda
- Memory limit oshganda
- Crash bo'lganda

---

## 📁 PAPKA STRUKTURASI

```
dokon/
├── backups/              # Avtomatik backuplar
├── excel-files/          # Excel fayllar
├── logs/                 # PM2 loglar
│   ├── server-error.log
│   ├── server-out.log
│   ├── backup-error.log
│   └── backup-out.log
├── config/               # Konfiguratsiya
├── services/             # Xizmatlar
├── middleware/           # Middleware
├── routes/               # API routes
├── models/               # Database schemas
└── public/               # Frontend fayllar
```

---

## 🚀 PRODUCTION CHECKLIST

### Ishga Tushirishdan Oldin

- [ ] `.env` faylda barcha kalitlar o'zgartirildi
- [ ] `ADMIN_PASSWORD` kuchli parol qo'yildi
- [ ] `JWT_SECRET` yangi generatsiya qilindi
- [ ] `SESSION_SECRET` yangi generatsiya qilindi
- [ ] `ENCRYPTION_KEY` yangi generatsiya qilindi
- [ ] MongoDB ulanish xavfsiz
- [ ] `ALLOWED_ORIGINS` to'g'ri sozlandi
- [ ] PM2 o'rnatildi
- [ ] Backup papkasi yaratildi
- [ ] Logs papkasi yaratildi

### Ishga Tushirgandan Keyin

- [ ] Health check ishlayapti
- [ ] Backup avtomatik yaratilmoqda
- [ ] Loglar yozilmoqda
- [ ] Rate limiting ishlayapti
- [ ] Admin login ishlayapti
- [ ] Telegram bot ulandi (agar kerak bo'lsa)

---

## 🆘 MUAMMOLARNI HAL QILISH

### Server Ishlamayapti

```bash
# PM2 statusni tekshirish
pm2 status

# Loglarni ko'rish
pm2 logs dokon-server --lines 100

# Restart
pm2 restart dokon-server
```

### MongoDB Ulanmayapti

```bash
# MongoDB statusni tekshirish
systemctl status mongod

# MongoDB ni ishga tushirish
sudo systemctl start mongod
```

### Backup Ishlamayapti

```bash
# Backup loglarni ko'rish
pm2 logs dokon-backup

# Manual backup yaratish
npm run backup

# Backup papkasini tekshirish
ls -lh backups/
```

### Memory Muammosi

```bash
# Memory ishlatilishini ko'rish
pm2 list

# Memory limit oshirish (ecosystem.config.js)
max_memory_restart: '1G'

# Restart
pm2 restart dokon-server
```

---

## 📞 QULAYLIK UCHUN KOMANDALAR

```bash
# Barcha servislarni ishga tushirish
pm2 start ecosystem.config.js

# Barcha servislarni to'xtatish
pm2 stop all

# Barcha servislarni restart
pm2 restart all

# Loglarni tozalash
pm2 flush

# PM2 ni avtomatik ishga tushirish (reboot)
pm2 startup
pm2 save

# Backup yaratish
npm run backup

# Health check
curl http://localhost:3000/health

# Metrics
curl http://localhost:3000/health/metrics
```

---

## 🎯 XULOSA

Sizning tizimingiz endi:

✅ **100% Xavfsiz** - Enterprise-level security
✅ **100% Ishonchli** - Avtomatik backup va monitoring
✅ **100% Professional** - Production-ready architecture
✅ **Avtomatik Tiklash** - Crash bo'lsa ham qayta ishga tushadi
✅ **Ma'lumotlar Himoyalangan** - Har kuni backup, 30 kun saqlash
✅ **Monitoring** - Real-time health checks va metrics

**Endi ishonch bilan ishlatishingiz mumkin!** 🚀

---

## 📚 QO'SHIMCHA RESURSLAR

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
