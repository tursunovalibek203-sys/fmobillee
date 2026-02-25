# 🎯 IP MANZIL QO'SHISH - ODDIY QADAMLAR

## ✅ SIZ HOZIR TO'G'RI SAHIFADASIZ!

Siz "Network Access" sahifasida turibsiz. Endi IP manzil qo'shishingiz kerak.

---

## 📋 QADAMLAR (2 daqiqa)

### 1️⃣ "ADD IP ADDRESS" tugmasini toping va bosing
Sahifaning o'ng tomonida yashil tugma bo'lishi kerak:
```
┌──────────────────────┐
│  + ADD IP ADDRESS    │  ← SHU TUGMANI BOSING!
└──────────────────────┘
```

### 2️⃣ Oyna ochiladi - "ALLOW ACCESS FROM ANYWHERE" ni bosing
```
┌─────────────────────────────────────────┐
│  Add IP Access List Entry               │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🌍 ALLOW ACCESS FROM ANYWHERE     │  │  ← SHU TUGMANI BOSING!
│  └───────────────────────────────────┘  │
│                                         │
│  yoki                                   │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 💻 ADD CURRENT IP ADDRESS         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 3️⃣ IP avtomatik to'ladi
```
Access List Entry:
┌──────────────────┐
│ 0.0.0.0/0        │  ← AVTOMATIK TO'LADI
└──────────────────┘

Comment (optional):
┌──────────────────┐
│ Allow all IPs    │  ← IXTIYORIY
└──────────────────┘
```

### 4️⃣ "CONFIRM" tugmasini bosing
```
┌──────────┐  ┌──────────┐
│ Cancel   │  │ Confirm  │  ← SHU TUGMANI BOSING!
└──────────┘  └──────────┘
```

### 5️⃣ Kuting (1-2 daqiqa)
```
Status: PENDING ⏳ → ACTIVE ✅
```

### 6️⃣ Test qiling
Terminal/CMD da:
```bash
node test-direct-bypass-dns.js
```

---

## 🎯 NATIJA

Agar hammasi to'g'ri bo'lsa, IP Access List da ko'rinadi:

```
┌────────────────────────────────────────────────┐
│  IP Access List                                │
│  ┌──────────────────────────────────────────┐  │
│  │ IP Address  │ Comment      │ Status     │  │
│  ├──────────────────────────