// ==================== SECURITY MIDDLEWARE ====================

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const securityConfig = require('../config/security.config');
const securityService = require('../services/security.service');

// Rate limiting middleware
const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || securityConfig.rateLimit.windowMs,
    max: options.max || securityConfig.rateLimit.max,
    message: options.message || securityConfig.rateLimit.message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`⚠️ Rate limit exceeded: ${req.ip}`);
      res.status(429).json({
        success: false,
        error: securityConfig.rateLimit.message
      });
    }
  });
};

// Strict rate limiter for auth endpoints
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Juda ko\'p login urinishlari. 15 daqiqadan keyin urinib ko\'ring'
});

// API rate limiter
const apiRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'API limit oshdi. Biroz kutib turing'
});

// JWT authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Token topilmadi'
    });
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN

  try {
    const decoded = securityService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Token yaroqsiz yoki muddati tugagan'
    });
  }
};

// Role-based access control
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autentifikatsiya talab qilinadi'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Ruxsat yo\'q'
      });
    }

    next();
  };
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = securityService.sanitizeInput(req.body[key]);
      }
    }
  }

  // Sanitize query
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = securityService.sanitizeInput(req.query[key]);
      }
    }
  }

  // Sanitize params
  if (req.params) {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = securityService.sanitizeInput(req.params[key]);
      }
    }
  }

  next();
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const storedToken = req.session?.csrfToken;

    if (!token || !storedToken || !securityService.verifyCSRFToken(token, storedToken)) {
      return res.status(403).json({
        success: false,
        error: 'CSRF token yaroqsiz'
      });
    }
  }

  next();
};

// Audit logging middleware
const auditLog = (action) => {
  return (req, res, next) => {
    const log = securityService.createAuditLog(action, req.user || {}, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      method: req.method,
      path: req.path,
      body: req.body
    });

    console.log('📝 Audit:', JSON.stringify(log));
    
    // In production, save to database or log file
    next();
  };
};

// Security headers middleware
const securityHeaders = helmet(securityConfig.helmet);

// Prevent parameter pollution
const preventParameterPollution = (req, res, next) => {
  // Check for duplicate parameters
  const params = new Set();
  
  for (const key in req.query) {
    if (params.has(key)) {
      return res.status(400).json({
        success: false,
        error: 'Noto\'g\'ri so\'rov parametrlari'
      });
    }
    params.add(key);
  }

  next();
};

// IP whitelist middleware (for admin endpoints)
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      console.warn(`⚠️ Unauthorized IP attempt: ${clientIP}`);
      return res.status(403).json({
        success: false,
        error: 'Ruxsat yo\'q'
      });
    }

    next();
  };
};

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validatsiya xatosi',
        details: error.details.map(d => d.message)
      });
    }

    next();
  };
};

module.exports = {
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  authenticateJWT,
  requireRole,
  sanitizeInput,
  csrfProtection,
  auditLog,
  securityHeaders,
  preventParameterPollution,
  ipWhitelist,
  validateRequest
};
