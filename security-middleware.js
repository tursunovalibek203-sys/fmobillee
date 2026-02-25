// 🔐 Security Middleware - Professional xavfsizlik tizimi
const crypto = require('crypto');
const mongoose = require('mongoose');

// ==================== SCHEMAS ====================

// Session Schema
const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  username: String,
  role: { type: String, default: 'admin' }, // 'admin', 'cashier', 'manager'
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now }
});

// Activity Log Schema
const ActivityLogSchema = new mongoose.Schema({
  userId: String,
  username: String,
  role: String,
  action: String, // 'login', 'logout', 'create', 'update', 'delete', 'view'
  resource: String, // 'customer', 'sale', 'product', 'cashier', etc.
  resourceId: String,
  details: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'success' } // 'success', 'failed', 'blocked'
});

// Failed Login Attempts Schema
const FailedLoginSchema = new mongoose.Schema({
  username: String,
  ipAddress: String,
  attempts: { type: Number, default: 1 },
  lastAttempt: { type: Date, default: Date.now },
  blockedUntil: Date
});

// Security Settings Schema
const SecuritySettingsSchema = new mongoose.Schema({
  maxLoginAttempts: { type: Number, default: 5 },
  lockoutDuration: { type: Number, default: 15 }, // minutes
  sessionTimeout: { type: Number, default: 24 }, // hours
  requireStrongPassword: { type: Boolean, default: true },
  enable2FA: { type: Boolean, default: false },
  ipWhitelist: [String],
  allowedIPs: [String],
  blockedIPs: [String]
});

const Session = mongoose.model('Session', SessionSchema);
const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
const FailedLogin = mongoose.model('FailedLogin', FailedLoginSchema);
const SecuritySettings = mongoose.model('SecuritySettings', SecuritySettingsSchema);

// ==================== HELPER FUNCTIONS ====================

// Session ID generatsiya
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

// Password hash
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Strong password tekshirish
function isStrongPassword(password) {
  // Kamida 8 ta belgi, 1 katta harf, 1 kichik harf, 1 raqam, 1 maxsus belgi
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

// IP address olish
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress;
}

// ==================== MIDDLEWARE FUNCTIONS ====================

// 1. Rate Limiting - Har bir IP uchun so'rovlar cheklash
const rateLimitMap = new Map();

function rateLimit(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    const ip = getClientIP(req);
    const now = Date.now();
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = rateLimitMap.get(ip);
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Juda ko\'p so\'rov yuborildi. Iltimos, biroz kuting.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    record.count++;
    next();
  };
}

// 2. Session Authentication
async function authenticateSession(req, res, next) {
  try {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: 'Session topilmadi. Iltimos, qayta login qiling.'
      });
    }
    
    const session = await Session.findOne({ 
      sessionId, 
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Session yaroqsiz yoki muddati tugagan.'
      });
    }
    
    // Session activity yangilash
    session.lastActivity = new Date();
    await session.save();
    
    // Request ga user ma'lumotlarini qo'shish
    req.user = {
      userId: session.userId,
      username: session.username,
      role: session.role
    };
    req.sessionId = sessionId;
    
    next();
  } catch (error) {
    console.error('Session authentication xato:', error);
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

// 3. Role-based Access Control
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autentifikatsiya talab qilinadi'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      // Activity log
      logActivity({
        userId: req.user.userId,
        username: req.user.username,
        role: req.user.role,
        action: 'access_denied',
        resource: req.path,
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent'],
        status: 'blocked'
      });
      
      return res.status(403).json({
        success: false,
        error: 'Sizda bu amalni bajarish uchun ruxsat yo\'q'
      });
    }
    
    next();
  };
}

// 4. Activity Logging
async function logActivity(data) {
  try {
    await ActivityLog.create(data);
  } catch (error) {
    console.error('Activity log xato:', error);
  }
}

// Activity logging middleware
function activityLogger(action, resource) {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log activity
      if (req.user) {
        logActivity({
          userId: req.user.userId,
          username: req.user.username,
          role: req.user.role,
          action,
          resource,
          resourceId: req.params.id || req.body.id,
          details: {
            method: req.method,
            path: req.path,
            body: req.body,
            query: req.query
          },
          ipAddress: getClientIP(req),
          userAgent: req.headers['user-agent'],
          status: data.success ? 'success' : 'failed'
        });
      }
      
      originalJson.call(this, data);
    };
    
    next();
  };
}

// 5. Failed Login Tracking
async function trackFailedLogin(username, ipAddress) {
  try {
    const settings = await SecuritySettings.findOne() || { maxLoginAttempts: 5, lockoutDuration: 15 };
    
    let record = await FailedLogin.findOne({ username, ipAddress });
    
    if (!record) {
      record = await FailedLogin.create({ username, ipAddress, attempts: 1 });
    } else {
      // Agar block muddati tugagan bo'lsa, reset qilish
      if (record.blockedUntil && record.blockedUntil < new Date()) {
        record.attempts = 1;
        record.blockedUntil = null;
      } else {
        record.attempts++;
      }
      
      record.lastAttempt = new Date();
      
      // Agar maksimal urinishlar soniga yetsa, bloklash
      if (record.attempts >= settings.maxLoginAttempts) {
        record.blockedUntil = new Date(Date.now() + settings.lockoutDuration * 60000);
      }
      
      await record.save();
    }
    
    return record;
  } catch (error) {
    console.error('Failed login tracking xato:', error);
    return null;
  }
}

// 6. Check if user is blocked
async function isUserBlocked(username, ipAddress) {
  try {
    const record = await FailedLogin.findOne({ username, ipAddress });
    
    if (!record) return false;
    
    if (record.blockedUntil && record.blockedUntil > new Date()) {
      return {
        blocked: true,
        remainingTime: Math.ceil((record.blockedUntil - new Date()) / 60000),
        attempts: record.attempts
      };
    }
    
    return false;
  } catch (error) {
    console.error('Block check xato:', error);
    return false;
  }
}

// 7. Clear failed login attempts
async function clearFailedLogins(username, ipAddress) {
  try {
    await FailedLogin.deleteOne({ username, ipAddress });
  } catch (error) {
    console.error('Clear failed logins xato:', error);
  }
}

// 8. Create Session
async function createSession(userId, username, role, req) {
  try {
    const sessionId = generateSessionId();
    const settings = await SecuritySettings.findOne() || { sessionTimeout: 24 };
    
    const session = await Session.create({
      sessionId,
      userId,
      username,
      role,
      ipAddress: getClientIP(req),
      userAgent: req.headers['user-agent'],
      expiresAt: new Date(Date.now() + settings.sessionTimeout * 3600000)
    });
    
    // Activity log
    await logActivity({
      userId,
      username,
      role,
      action: 'login',
      resource: 'auth',
      ipAddress: getClientIP(req),
      userAgent: req.headers['user-agent'],
      status: 'success'
    });
    
    return sessionId;
  } catch (error) {
    console.error('Create session xato:', error);
    return null;
  }
}

// 9. Destroy Session
async function destroySession(sessionId, req) {
  try {
    const session = await Session.findOne({ sessionId });
    
    if (session) {
      session.isActive = false;
      await session.save();
      
      // Activity log
      await logActivity({
        userId: session.userId,
        username: session.username,
        role: session.role,
        action: 'logout',
        resource: 'auth',
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent'],
        status: 'success'
      });
    }
    
    return true;
  } catch (error) {
    console.error('Destroy session xato:', error);
    return false;
  }
}

// 10. Cleanup expired sessions
async function cleanupExpiredSessions() {
  try {
    const result = await Session.updateMany(
      { expiresAt: { $lt: new Date() }, isActive: true },
      { isActive: false }
    );
    
    console.log(`🧹 ${result.modifiedCount} ta eski session tozalandi`);
  } catch (error) {
    console.error('Session cleanup xato:', error);
  }
}

// ==================== EXPORTS ====================

module.exports = {
  // Middleware
  rateLimit,
  authenticateSession,
  requireRole,
  activityLogger,
  
  // Helper functions
  hashPassword,
  isStrongPassword,
  getClientIP,
  
  // Session management
  createSession,
  destroySession,
  cleanupExpiredSessions,
  
  // Failed login tracking
  trackFailedLogin,
  isUserBlocked,
  clearFailedLogins,
  
  // Activity logging
  logActivity,
  
  // Models
  Session,
  ActivityLog,
  FailedLogin,
  SecuritySettings
};
