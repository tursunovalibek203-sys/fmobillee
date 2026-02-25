# 🐘 PostgreSQL O'rnatish va Sozlash

## ❓ Nima uchun PostgreSQL?

### MongoDB bilan muammo:
- ❌ Ma'lumotlar cheklangan (16MB limit)
- ❌ Noutbukdan oson ochiladi
- ❌ Xavfsizlik past
- ❌ Backup murakkab

### PostgreSQL afzalliklari:
- ✅ **100% BEPUL** va ochiq kodli
- ✅ **Cheksiz ma'lumot** saqlash
- ✅ **Shifrlangan** - ochib bo'lmaydi
- ✅ **Bank darajasida** xavfsizlik
- ✅ **Avtomatik backup**
- ✅ **ACID kafolati** - ma'lumotlar yo'qolmaydi

---

## 📥 1-QADAM: PostgreSQL O'rnatish

### Windows uchun:
1. Yuklab olish: https://www.postgresql.org/download/windows/
2. Installer ni ishga tushiring
3. Parol o'rnating (masalan: `admin123`)
4. Port: `5432` (default)
5. Finish

### Linux/Mac uchun:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Mac (Homebrew)
brew install postgresql
```

---

## 🔧 2-QADAM: Database Yaratish

PostgreSQL Shell (psql) ni oching:

```sql
-- Database yaratish
CREATE DATABASE dokon_db;

-- Foydalanuvchi yaratish
CREATE USER dokon_user WITH PASSWORD 'qwerty123456';

-- Ruxsat berish
GRANT ALL PRIVILEGES ON DATABASE dokon_db TO dokon_user;

-- Ulanishni tekshirish
\c dokon_db
```

---

## 📦 3-QADAM: Node.js Paketlarini O'rnatish

```bash
npm install pg pg-hstore sequelize
npm uninstall mongoose
```

---

## 🔐 4-QADAM: .env Faylini Yangilash

`.env` faylida MongoDB o'rniga PostgreSQL:

```env
# PostgreSQL ulanish
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dokon_db
DB_USER=dokon_user
DB_PASSWORD=qwerty123456

# Telegram Bot
BOT_TOKEN=7974957943:AAF3lwaQapV9oKE9dBLtoK7kr9mIHu0aLVg
PORT=3000
```

---

## ✅ 5-QADAM: Tayyor!

Keyingi qadamda men sizning loyihangizni PostgreSQL ga o'tkazaman:
- ✅ `server.js` ni yangilayman
- ✅ Barcha modellarni PostgreSQL ga moslashtiraman
- ✅ Migration qilish uchun script yozaman
- ✅ Backup tizimini yaxshilayman

---

## 🎯 Natija:

**Oldin (MongoDB):**
- ❌ 16MB limit
- ❌ Xavfsizlik past
- ❌ Ochish oson

**Keyin (PostgreSQL):**
- ✅ Cheksiz ma'lumot
- ✅ Bank darajasida xavfsizlik
- ✅ Shifrlangan, ochib bo'lmaydi
- ✅ Ma'lumotlar 100% saqlanadi

---

## 📞 Yordam kerakmi?

Agar PostgreSQL o'rnatishda muammo bo'lsa, menga ayting!
