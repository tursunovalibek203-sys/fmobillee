# 🔐 Professional Admin Panel - Xavfsizlik va Analytics

## ✅ Qo'shilgan Yangi Funksiyalar

### 1. 🔐 Xavfsizlik Tizimi (Security System)

#### Asosiy Xususiyatlar:
- ✅ **Session Management** - Har bir foydalanuvchi uchun xavfsiz session
- ✅ **Activity Logging** - Barcha harakatlar tarixi
- ✅ **Failed Login Tracking** - Muvaffaqiyatsiz login urinishlarini kuzatish
- ✅ **Auto Blocking** - Avtomatik bloklash (5 marta noto'g'ri parol)
- ✅ **Rate Limiting** - So'rovlar sonini cheklash (DDoS himoya)
- ✅ **Role-Based Access Control** - Rol asosida ruxsatlar
- ✅ **IP Tracking** - IP manzillarni kuzatish
- ✅ **Session Timeout** - Avtomatik chiqish (24 soat)

#### Security Settings:
```javascript
{
  maxLoginAttempts: 5,        // Maksimal login urinishlari
  lockoutDuration: 15,        // Bloklash muddati (daqiqa)
  sessionTimeout: 24,         // Session muddati (soat)
  requireStrongPassword: true, // Kuchli parol talab qilish
  enable2FA: false            // 2FA (kelajakda)
}
```

#### Xavfsizlik Sahifasi:
- **URL:** `/admin-security.html`
- **Funksiyalar:**
  - Faol sessionlarni ko'rish va tugatish
  - Faoliyat tarixini ko'rish
  - Muvaffaqiyatsiz login urinishlarini ko'rish
  - Bloklangan foydalanuvchilarni boshqarish
  - Xavfsizlik sozlamalarini o'zgartirish

### 2. 📊 Analytics Dashboard

#### Asosiy Metrikalar:
- ✅ **Jami Daromad** - O'sish foizi bilan
- ✅ **Jami Savdolar** - O'sish foizi bilan
- ✅ **O'rtacha Savdo** - O'sish foizi bilan
- ✅ **Jami Foyda** - O'sish foizi bilan

#### Grafiklar:
1. **Savdolar Dinamikasi** - Line chart
2. **Daromad va Foyda** - Bar chart
3. **Kategoriyalar Taqsimoti** - Doughnut chart
4. **Filiallar Performance** - Horizontal bar chart

#### TOP Ro'yxatlar:
- **TOP-10 Mahsulotlar** - Eng ko'p sotiladigan
- **TOP-10 Kassirlar** - Eng ko'p savdo qilgan

#### Vaqt Filtrlari:
- Bugun
- Hafta
- Oy
- Yil

#### Analytics Sahifasi:
- **URL:** `/admin-analytics.html`
- **Texnologiya:** Chart.js
- **Real-time:** Har 30 sekundda yangilanadi

### 3. 🛡️ Security Middleware

#### Middleware Funksiyalari:

1. **rateLimit(maxRequests, windowMs)**
   - So'rovlar sonini cheklash
   - Default: 100 so'rov / 1 daqiqa

2. **authenticateSession(req, res, next)**
   - Session autentifikatsiya
   - Session muddatini tekshirish
   - Avtomatik yangilash

3. **requireRole(...roles)**
   - Rol asosida ruxsat berish
   - Admin, Cashier, Manager

4. **activityLogger(action, resource)**
   - Barcha harakatlarni log qilish
   - Database ga saqlash

5. **trackFailedLogin(username, ipAddress)**
   - Muvaffaqiyatsiz urinishlarni kuzatish
   - Avtomatik bloklash

#### Qo'llash:
```javascript
// Rate limiting
app.use('/api', rateLimit(100, 60000));

// Authentication
app.get('/api/admin-data', authenticateSession, requireRole('admin'), (req, res) => {
  // Admin faqat
});

// Activity logging
app.post('/api/products', 
  authenticateSession, 
  requireRole('admin'), 
  activityLogger('create', 'product'),
  async (req, res) => {
    // Mahsulot yaratish
  }
);
```

### 4. 📋 Activity Log

#### Log Ma'lumotlari:
```javascript
{
  userId: "admin123",
  username: "admin",
  role: "admin",
  action: "create",           // login, logout, create, update, delete, view
  resource: "product",         // customer, sale, product, cashier, etc.
  resourceId: "12345",
  details: {
    method: "POST",
    path: "/api/products",
    body: {...},
    query: {...}
  },
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  timestamp: "2025-02-12T10:30:00Z",
  status: "success"            // success, failed, blocked
}
```

#### Log Turlari:
- 🟢 **Success** - Muvaffaqiyatli
- 🔴 **Failed** - Muvaffaqiyatsiz
- 🟡 **Blocked** - Bloklangan

### 5. 🔑 Session Management

#### Session Ma'lumotlari:
```javascript
{
  sessionId: "abc123...",      // Unique session ID
  userId: "admin123",
  username: "admin",
  role: "admin",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  createdAt: "2025-02-12T10:00:00Z",
  expiresAt: "2025-02-13T10:00:00Z",
  isActive: true,
  lastActivity: "2025-02-12T10:30:00Z"
}
```

#### Session Xususiyatlari:
- Avtomatik muddati tugashi (24 soat)
- Har bir harakatda yangilanadi
- Admin tomonidan tugatish mumkin
- Bir foydalanuvchi bir nechta session ochishi mumkin

## 🚀 O'rnatish va Ishga Tushirish

### 1. Paketlarni O'rnatish:
```bash
npm install
```

### 2. Environment Variables (.env):
```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!

# Security
SESSION_SECRET=your-secret-key-here
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=15
SESSION_TIMEOUT=24
```

### 3. Server.js ga Qo'shish:
```javascript
// Security middleware
const securityMiddleware = require('./security-middleware');
const securityRoutes = require('./security-api-routes');
const analyticsRoutes = require('./analytics-api-routes');

// Apply security
app.use(securityMiddleware.rateLimit(100, 60000));

// Routes
app.use('/api/security', securityRoutes);
app.use('/api/analytics', analyticsRoutes);

// Cleanup expired sessions (har 1 soatda)
setInterval(() => {
  securityMiddleware.cleanupExpiredSessions();
}, 3600000);
```

### 4. Login ni Yangilash:
```javascript
// Login endpoint
app.post('/api/admin-login', async (req, res) => {
  const { username, password } = req.body;
  const ipAddress = securityMiddleware.getClientIP(req);
  
  // Check if blocked
  const blocked = await securityMiddleware.isUserBlocked(username, ipAddress);
  if (blocked.blocked) {
    return res.status(403).json({
      success: false,
      error: `Siz ${blocked.remainingTime} daqiqaga bloklangansiz`,
      remainingTime: blocked.remainingTime
    });
  }
  
  // Verify credentials
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (username === adminUsername && password === adminPassword) {
    // Clear failed attempts
    await securityMiddleware.clearFailedLogins(username, ipAddress);
    
    // Create session
    const sessionId = await securityMiddleware.createSession(
      'admin123',
      username,
      'admin',
      req
    );
    
    res.json({
      success: true,
      sessionId,
      message: 'Login muvaffaqiyatli'
    });
  } else {
    // Track failed login
    await securityMiddleware.trackFailedLogin(username, ipAddress);
    
    res.status(401).json({
      success: false,
      error: 'Login yoki parol noto\'g\'ri'
    });
  }
});
```

## 📊 API Endpoints

### Security API:
```
GET    /api/security/stats              - Statistika
GET    /api/security/settings           - Sozlamalar
POST   /api/security/settings           - Sozlamalarni yangilash
GET    /api/security/sessions           - Faol sessionlar
DELETE /api/security/sessions/:id      - Session tugatish
GET    /api/security/activity-log       - Faoliyat tarixi
GET    /api/security/failed-logins      - Muvaffaqiyatsiz urinishlar
POST   /api/security/failed-logins/clear - Tozalash
```

### Analytics API:
```
GET /api/analytics/metrics              - Asosiy metrikalar
GET /api/analytics/sales-chart          - Savdolar grafigi
GET /api/analytics/revenue-profit       - Daromad va foyda
GET /api/analytics/top-products         - TOP mahsulotlar
GET /api/analytics/top-cashiers         - TOP kassirlar
GET /api/analytics/categories           - Kategoriyalar
GET /api/analytics/branches             - Filiallar
```

## 🔒 Xavfsizlik Best Practices

### 1. Parollar:
- ✅ Kuchli parol talab qilish (8+ belgi, katta/kichik harf, raqam, maxsus belgi)
- ✅ Parollarni hash qilish (SHA-256 yoki bcrypt)
- ✅ Parolni .env faylda saqlash
- ✅ Parolni kodda yozmaslik

### 2. Sessions:
- ✅ Unique session ID generatsiya
- ✅ Session muddatini cheklash (24 soat)
- ✅ Avtomatik tozalash
- ✅ Secure cookies

### 3. Rate Limiting:
- ✅ API so'rovlarini cheklash
- ✅ IP asosida cheklash
- ✅ DDoS himoya

### 4. Activity Logging:
- ✅ Barcha harakatlarni log qilish
- ✅ IP va User Agent saqlash
- ✅ Vaqt belgisi
- ✅ Status tracking

### 5. Failed Login Protection:
- ✅ Urinishlar sonini cheklash
- ✅ Avtomatik bloklash
- ✅ Vaqtinchalik bloklash
- ✅ Admin tomonidan tozalash

## 📱 Frontend Integration

### 1. Session ID Saqlash:
```javascript
// Login dan keyin
localStorage.setItem('sessionId', data.sessionId);

// Har bir API so'rovda
fetch('/api/endpoint', {
  headers: {
    'X-Session-ID': localStorage.getItem('sessionId')
  }
});
```

### 2. Session Expiry Handling:
```javascript
// 401 xato bo'lsa
if (response.status === 401) {
  localStorage.removeItem('sessionId');
  window.location.href = '/login.html';
}
```

### 3. Auto Refresh:
```javascript
// Har 30 sekundda yangilash
setInterval(loadData, 30000);
```

## 🎯 Kelajak Rejalar

### 1. 2FA (Two-Factor Authentication):
- SMS kod
- Email kod
- Authenticator app

### 2. IP Whitelist:
- Faqat ruxsat berilgan IP lardan kirish
- IP blacklist

### 3. Advanced Analytics:
- Predictive analytics
- Machine learning
- Anomaly detection

### 4. Audit Reports:
- PDF export
- Email yuborish
- Scheduled reports

### 5. Real-time Notifications:
- WebSocket
- Push notifications
- Email alerts

## 📞 Yordam

Savollar bo'lsa:
- 📧 Email: support@dokon.uz
- 📱 Telegram: @dokon_support
- 🌐 Website: https://dokon.uz

---

**Versiya:** 3.0  
**Sana:** 2025-02-12  
**Muallif:** Do'kon Pro Team
