# 🔐 ENVIRONMENT VARIABLES SOZLASH

## 📅 Sana: 25-Fevral-2026

---

## 📋 TO'LIQ .ENV FAYLI

```env
# SERVER
NODE_ENV=production
PORT=3000

# MONGODB ATLAS
MONGODB_URI=mongodb+srv://tilavovazizbek37_db_user:JAew6wsMp8cfffzd@cluster0.1t3sy1v.mongodb.net/dokon_db?retryWrites=true&w=majority&appName=Cluster0

# TELEGRAM BOT
BOT_TOKEN=8606346204:AAHXKuTfA6FkRZzxipBTAXA_6lopoygPonQ

# ADMIN LOGIN
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin12345
```

---

## 🌐 RENDER.COM DA SOZLASH

### 1. Render Dashboard ga Kiring
```
https://dashboard.render.com
```

### 2. Service ni Tanlang
- Yaratilgan web service ni oching
- "Environment" tab ga o'ting

### 3. Environment Variables Qo'shing

#### A. NODE_ENV
```
Key: NODE_ENV
Value: production
```

#### B. PORT
```
Key: PORT
Value: 3000
```

#### C. MONGODB_URI
```
Key: MONGODB_URI
Value: mongodb+srv://tilavovazizbek37_db_user:JAew6wsMp8cfffzd@cluster0.1t3sy1v.mongodb.net/dokon_db?retryWrites=true&w=majority&appName=Cluster0
```

#### D. BOT_TOKEN
```
Key: BOT_TOKEN
Value: 8606346204:AAHXKuTfA6FkRZzxipBTAXA_6lopoygPonQ
```

#### E. ADMIN_USERNAME
```
Key: ADMIN_USERNAME
Value: admin
```

#### F. ADMIN_PASSWORD
```
Key: ADMIN_PASSWORD
Value: admin12345
```

⚠️ **MUHIM**: Production da parolni o'zgartiring!

### 4. Save Changes
- "Save Changes" tugmasini bosing
- Service avtomatik restart bo'ladi

---

## 🔒 MONGODB ATLAS SOZLASH

### 1. MongoDB Atlas ga Kiring
```
https://cloud.mongodb.com
```

### 2. Network Access
1. Sidebar → "Network Access"
2. "Add IP Address" tugmasini bosing
3. "Allow Access from Anywhere" ni tanlang
4. IP: `0.0.0.0/0`
5. "Confirm" tugmasini bosing

### 3. Database User
1. Sidebar → "Database Access"
2. User mavjudligini tekshiring:
   - Username: `tilavovazizbek37_db_user`
   - Password: `JAew6wsMp8cfffzd`
3. Agar yo'q bo'lsa, yangi user yarating

---

## 📱 TELEGRAM BOT SOZLASH

### 1. Bot Token Tekshirish
```
https://api.telegram.org/bot8606346204:AAHXKuTfA6FkRZzxipBTAXA_6lopoygPonQ/getMe
```

Javob:
```json
{
  "ok": true,
  "result": {
    "id": 8606346204,
    "is_bot": true,
    "first_name": "Your Bot Name",
    "username": "your_bot_username"
  }
}
```

### 2. Webhook Sozlash (Ixtiyoriy)
```
https://api.telegram.org/bot8606346204:AAHXKuTfA6FkRZzxipBTAXA_6lopoygPonQ/setWebhook?url=https://your-app.onrender.com/webhook
```

---

## ✅ TEKSHIRISH

### 1. Health Check
```
https://your-app.onrender.com/health
```

Javob:
```json
{
  "status": "OK",
  "message": "Server ishlayapti",
  "timestamp": "2026-02-25T10:00:00.000Z",
  "mongodb": "Connected"
}
```

### 2. Admin Login
```
URL: https://your-app.onrender.com/admin-dashboard.html
Username: admin
Password: admin12345
```

### 3. API Test
```
https://your-app.onrender.com/api/products
https://your-app.onrender.com/api/cashiers
```

---

## 🔐 XAVFSIZLIK

### ⚠️ MUHIM ESLATMALAR:

1. **Parolni O'zgartiring**:
   ```
   ADMIN_PASSWORD=YourSecurePassword123!
   ```

2. **MongoDB Parolni O'zgartiring**:
   - MongoDB Atlas → Database Access
   - User → Edit → Change Password

3. **Telegram Bot Token**:
   - Hech kimga bermang
   - GitHub ga push qilmang
   - Faqat Render da saqlang

4. **IP Whitelist**:
   - Production da faqat kerakli IP larni qo'shing
   - Development da `0.0.0.0/0` ishlatish mumkin

---

## 📊 ENVIRONMENT VARIABLES RO'YXATI

| Variable | Tavsif | Majburiy | Default |
|----------|--------|----------|---------|
| NODE_ENV | Environment | Ha | production |
| PORT | Server port | Ha | 3000 |
| MONGODB_URI | MongoDB ulanish | Ha | - |
| BOT_TOKEN | Telegram bot | Ha | - |
| ADMIN_USERNAME | Admin login | Ha | admin |
| ADMIN_PASSWORD | Admin parol | Ha | - |

---

## 🐛 MUAMMOLAR

### 1. MongoDB Connection Error
**Xato**: `MongoServerError: bad auth`

**Yechim**:
- Parol to'g'ri ekanligini tekshiring
- Special characters ni encode qiling
- IP whitelist ni tekshiring

### 2. Telegram Bot Not Working
**Xato**: `Unauthorized`

**Yechim**:
- Bot token to'g'ri ekanligini tekshiring
- @BotFather da bot active ekanligini tekshiring

### 3. Admin Login Failed
**Xato**: `Login yoki parol noto'g'ri`

**Yechim**:
- ADMIN_USERNAME va ADMIN_PASSWORD ni tekshiring
- Render da environment variables to'g'ri sozlanganini tekshiring

---

## 📞 YORDAM

Agar muammolar bo'lsa:
1. Render Logs ni tekshiring
2. MongoDB Atlas Metrics ni ko'ring
3. Environment variables ni qayta tekshiring

---

**Yaratilgan:** 25-Fevral-2026  
**Status:** ✅ TAYYOR

---

## 🎉 YAKUNIY TEKSHIRISH

✅ Environment variables sozlandi  
✅ MongoDB Atlas sozlandi  
✅ Telegram Bot sozlandi  
✅ Admin login sozlandi  
✅ Render ga deploy qilishga tayyor

**Omad!** 🚀
