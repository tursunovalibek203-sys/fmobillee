# 🗄️ MENING MONGODB CLUSTER MA'LUMOTLARI

## 📊 CLUSTER ASOSIY MA'LUMOTLARI

**Cluster Nomi:** `Cluster0`  
**Cluster URL:** `cluster0.b53zfib.mongodb.net`  
**Cluster ID:** `b53zfib`  
**Region:** AWS (Auto-selected)  
**Tier:** M0 Sandbox (Bepul)  
**MongoDB Version:** 8.0 (Latest)

---

## 🔗 CLUSTER LINKLAR

### 1. Cluster Dashboard (Asosiy sahifa)
```
https://cloud.mongodb.com/v2/65xxxxx/clusters
```
**Yoki:**
```
https://cloud.mongodb.com/v2#/clusters
```

### 2. Cluster Metrics (Monitoring)
```
https://cloud.mongodb.com/v2#/metrics/replicaSet/65xxxxx/cluster0
```

### 3. Cluster Configuration
```
https://cloud.mongodb.com/v2#/clusters/edit/cluster0
```

---

## 🔐 ULANISH MA'LUMOTLARI

### Database Name
```
dokon_db
```

### Username
```
raxmanovichkamol_db_user
```

### Password
```
n6Ph44RYbiHAsTSH
```

---

## 🌐 CONNECTION STRINGS

### 1. SRV Connection String (Tavsiya etiladi)
```
mongodb+srv://raxmanovichkamol_db_user:n6Ph44RYbiHAsTSH@cluster0.b53zfib.mongodb.net/dokon_db?retryWrites=true&w=majority&appName=Cluster0
```

### 2. Standard Connection String
```
mongodb://raxmanovichkamol_db_user:n6Ph44RYbiHAsTSH@cluster0-shard-00-00.b53zfib.mongodb.net:27017,cluster0-shard-00-01.b53zfib.mongodb.net:27017,cluster0-shard-00-02.b53zfib.mongodb.net:27017/dokon_db?ssl=true&replicaSet=atlas-zzqxqz-shard-0&authSource=admin&retryWrites=true&w=majority
```

### 3. Direct Connection String (DNS muammosi bo'lsa)
```
mongodb://raxmanovichkamol_db_user:n6Ph44RYbiHAsTSH@cluster0-shard-00-00.b53zfib.mongodb.net:27017/dokon_db?ssl=true&authSource=admin&retryWrites=true&w=majority
```

---

## 🖥️ CLUSTER HOSTS (Shard Nodes)

### Primary Node
```
cluster0-shard-00-00.b53zfib.mongodb.net:27017
```

### Secondary Node 1
```
cluster0-shard-00-01.b53zfib.mongodb.net:27017
```

### Secondary Node 2
```
cluster0-shard-00-02.b53zfib.mongodb.net:27017
```

### Replica Set Name
```
atlas-zzqxqz-shard-0
```

---

## 📋 CLUSTER SOZLAMALARI

### Storage
- **Storage Engine:** WiredTiger
- **Storage Size:** 512 MB (Free Tier)
- **Backup:** Disabled (Free Tier)

### Compute
- **RAM:** Shared
- **vCPU:** Shared
- **Cluster Tier:** M0 (Free)

### Network
- **Cloud Provider:** AWS
- **Region:** Auto-selected
- **VPC Peering:** Not available (Free Tier)

---

## 🔧 CLUSTER BOSHQARUV LINKLAR

### 1. Network Access (IP Whitelist)
```
https://cloud.mongodb.com/v2#/security/network/accessList
```
**Kerakli IP:** `0.0.0.0/0` (Allow from anywhere)

### 2. Database Access (Users)
```
https://cloud.mongodb.com/v2#/security/database/users
```
**User:** `raxmanovichkamol_db_user`

### 3. Cluster Settings
```
https://cloud.mongodb.com/v2#/clusters/edit/cluster0
```

### 4. Monitoring & Alerts
```
https://cloud.mongodb.com/v2#/metrics/replicaSet
```

### 5. Backup (Snapshots)
```
https://cloud.mongodb.com/v2#/backup/snapshots
```
*(Free Tier da mavjud emas)*

---

## 📊 CLUSTER HOLATI TEKSHIRISH

### Cluster Active/Paused
```bash
# Agar cluster PAUSED bo'lsa:
# 1. https://cloud.mongodb.com/v2#/clusters ga kiring
# 2. Cluster0 yonidagi "Resume" tugmasini bosing
# 3. 1-2 daqiqa kuting
```

### Cluster Metrics
- **Connections:** 0/500 (Free Tier limit)
- **Operations:** 0 ops/sec
- **Network:** 0 MB/sec
- **Storage:** 0 MB / 512 MB

---

## 🎯 TEZKOR HARAKATLAR

### 1. Cluster ni ochish
```
https://cloud.mongodb.com/v2#/clusters
```

### 2. IP Whitelist qo'shish
```
https://cloud.mongodb.com/v2#/security/network/accessList
```
- "Add IP Address" → "ALLOW ACCESS FROM ANYWHERE" → "Confirm"

### 3. User yaratish/tahrirlash
```
https://cloud.mongodb.com/v2#/security/database/users
```

### 4. Connection String olish
```
https://cloud.mongodb.com/v2#/clusters
```
- "Connect" tugmasini bosing → "Connect your application"

---

## 💾 DATABASE MA'LUMOTLARI

### Database Name
```
dokon_db
```

### Collections (Jadvallar)
```
- customers (Mijozlar)
- sales (Savdolar)
- products (Mahsulotlar)
- warehouse (Ombor)
- expenses (Harajatlar)
- cashiers (Kassirlar)
- branches (Filiallar)
- handovers (Topshiriqlar)
```

---

## 🔍 CLUSTER TEKSHIRISH KOMANDASI

### Node.js orqali test
```bash
node test-direct-bypass-dns.js
```

### MongoDB Compass orqali
```
1. MongoDB Compass ni oching
2. Connection String ni kiriting:
   mongodb+srv://raxmanovichkamol_db_user:n6Ph44RYbiHAsTSH@cluster0.b53zfib.mongodb.net/dokon_db
3. "Connect" tugmasini bosing
```

### MongoDB Shell orqali
```bash
mongosh "mongodb+srv://cluster0.b53zfib.mongodb.net/dokon_db" --username raxmanovichkamol_db_user
```

---

## 📱 MOBIL ORQALI BOSHQARISH

### MongoDB Atlas Mobile App
- **iOS:** https://apps.apple.com/app/mongodb-atlas/id1454190288
- **Android:** https://play.google.com/store/apps/details?id=com.mongodb.atlas

### Login
- Email: *(sizning MongoDB Atlas email)*
- Password: *(sizning MongoDB Atlas password)*

---

## 🚨 MUHIM ESLATMALAR

### 1. IP Whitelist
- **Hozirgi holat:** Ehtimol qo'shilmagan ❌
- **Kerakli IP:** 0.0.0.0/0 (Barcha IP'lardan ruxsat)
- **Qo'shish:** https://cloud.mongodb.com/v2#/security/network/accessList

### 2. Cluster Holati
- **Tekshirish:** https://cloud.mongodb.com/v2#/clusters
- **Kerakli holat:** ACTIVE ✅
- **Agar PAUSED:** "Resume" tugmasini bosing

### 3. Free Tier Limitlar
- **Storage:** 512 MB
- **RAM:** Shared
- **Connections:** 500 max
- **Backup:** Yo'q
- **Auto-scaling:** Yo'q

---

## 📞 YORDAM

### MongoDB Support
- **Email:** support@mongodb.com
- **Forum:** https://www.mongodb.com/community/forums
- **Docs:** https://www.mongodb.com/docs/atlas/

### Status
- **MongoDB Status:** https://status.mongodb.com
- **AWS Status:** https://status.aws.amazon.com

---

## 🎓 O'RGANISH

### MongoDB University (Bepul)
- https://university.mongodb.com
- Kurslar: M001, M121, M220

### Documentation
- **Atlas:** https://www.mongodb.com/docs/atlas/
- **MongoDB:** https://www.mongodb.com/docs/manual/

---

**Yaratilgan:** 2024-02-24  
**Cluster:** cluster0.b53zfib.mongodb.net  
**Tier:** M0 (Free)  
**Status:** IP Whitelist kerak ⚠️
