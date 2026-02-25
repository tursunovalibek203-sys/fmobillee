# 🔧 DNS NI TERMINAL ORQALI TUZATISH

## 📋 HOZIRGI HOLAT

```
DNS Server: 10.121.171.194 (Router DNS)
```

Bu ham muammo bo'lishi mumkin, chunki router DNS so'rovlarini to'g'ri hal qilmayapti.

---

## ✅ YECHIM: GOOGLE DNS GA O'ZGARTIRISH

### USUL 1: PowerShell (Administrator kerak)

#### 1. PowerShell ni Administrator sifatida oching

```
Windows tugmasi → "PowerShell" → O'ng tugma → "Run as Administrator"
```

#### 2. Wi-Fi uchun DNS ni o'zgartirish

```powershell
# Google DNS ni o'rnatish
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("8.8.8.8","8.8.4.4")

# Tekshirish
Get-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -AddressFamily IPv4
```

#### 3. DNS Cache ni tozalash

```powershell
Clear-DnsClientCache
ipconfig /flushdns
```

#### 4. Test qilish

```powershell
# Google ga ping
Resolve-DnsName google.com

# MongoDB Atlas ga ping
Resolve-DnsName cloud.mongodb.com
```

---

### USUL 2: CMD (Administrator kerak)

#### 1. CMD ni Administrator sifatida oching

```
Windows tugmasi → "cmd" → O'ng tugma → "Run as Administrator"
```

#### 2. DNS ni o'zgartirish

```cmd
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2
```

#### 3. DNS Cache ni tozalash

```cmd
ipconfig /flushdns
ipconfig /registerdns
```

#### 4. Tekshirish

```cmd
ipconfig /all | findstr "DNS"
```

---

### USUL 3: Avtomatik Script

Men sizga tayyor script yaratdim: `fix-dns-auto.ps1`

#### Ishga tushirish:

1. **PowerShell ni Administrator sifatida oching**

2. **Scriptni ishga tushiring:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\fix-dns-auto.ps1
```

3. **Restart qiling**

---

## 🧪 TEKSHIRISH

DNS o'zgartirilgandan keyin:

```bash
# 1. Noutbuk tarmoqni tekshirish
node check-laptop-network.js

# Kutilayotgan natija:
# DNS Serverlar: 2
#    1. 8.8.8.8
#    2. 8.8.4.4
# Google.com: ✅ Ulanadi
```

```bash
# 2. MongoDB ni test qilish
node test-mongodb-final.js

# Kutilayotgan natija:
# ✅ DNS SRV Record topildi
# ✅ MongoDB ulanish muvaffaqiyatli
```

```bash
# 3. Serverni ishga tushirish
npm start
```

---

## 📊 QADAMMA QADAM (TO'LIQ)

### 1. PowerShell ni Administrator sifatida oching

```
Windows → PowerShell → O'ng tugma → Run as Administrator
```

### 2. DNS ni o'zgartirish

```powershell
# Wi-Fi uchun
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("8.8.8.8","8.8.4.4")

# Ethernet uchun (agar kerak bo'lsa)
Set-DnsClientServerAddress -InterfaceAlias "Ethernet 2" -ServerAddresses ("8.8.8.8","8.8.4.4")
```

### 3. DNS Cache ni tozalash

```powershell
Clear-DnsClientCache
ipconfig /flushdns
ipconfig /registerdns
```

### 4. Tekshirish

```powershell
# DNS ni ko'rish
Get-DnsClientServerAddress -AddressFamily IPv4

# Google ga ping
Resolve-DnsName google.com

# MongoDB ga ping
Resolve-DnsName cloud.mongodb.com
```

### 5. Restart

```powershell
Restart-Computer
```

---

## ⚠️ AGAR ADMINISTRATOR HUQUQI BO'LMASA

Agar Administrator huquqi bo'lmasa, qo'lda o'zgartirish kerak:

### Qo'lda o'zgartirish:

1. **Settings** → **Network & Internet** → **Wi-Fi**
2. **Hardware properties**
3. **Edit** (IP settings)
4. **Manual** → **IPv4** → **On**
5. DNS ni kiriting:
   - Primary: `8.8.8.8`
   - Secondary: `8.8.4.4`
6. **Save**
7. **Restart**

---

## 🎯 NIMA UCHUN BU ISHLAYDI?

### Hozirgi holat:
```
Kompyuter → Router DNS (10.121.171.194)
            ↓
            Router DNS so'rovni hal qilmaydi
            ↓
            ❌ ECONNREFUSED
```

### Yangi holat:
```
Kompyuter → Google DNS (8.8.8.8)
            ↓
            Google DNS javob beradi
            ↓
            ✅ Ishlaydi!
```

---

## ✅ KEYINGI QADAMLAR

DNS o'zgartirilgandan va restart qilingandan keyin:

### 1. Tekshirish

```bash
node check-laptop-network.js
```

### 2. MongoDB Atlas IP Whitelist

```
1. https://cloud.mongodb.com
2. Network Access → Add IP Address
3. 0.0.0.0/0 qo'shing
4. Confirm
5. 2 daqiqa kuting
```

### 3. MongoDB Test

```bash
node test-mongodb-final.js
```

### 4. Server

```bash
npm start
```

### 5. Browser

```
http://localhost:3000
```

---

## 🎉 XULOSA

**Muammo:** Router DNS (10.121.171.194) to'g'ri ishlamayapti

**Yechim:** Google DNS (8.8.8.8) ga o'zgartirish

**Usul:** PowerShell (Administrator) yoki Qo'lda

**Vaqt:** 5 daqiqa + restart

**Natija:** MongoDB va internet ishlaydi!

---

## 📝 TEZKOR BUYRUQLAR

```powershell
# DNS ni o'zgartirish (Administrator)
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("8.8.8.8","8.8.4.4")

# Cache tozalash
Clear-DnsClientCache

# Tekshirish
Resolve-DnsName google.com

# Restart
Restart-Computer
```

---

**Keyingi qadam: PowerShell ni Administrator sifatida ochib, DNS ni o'zgartiring! 🚀**
