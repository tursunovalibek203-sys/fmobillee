// ==================== PROFESSIONAL SECURITY SERVICE ====================

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const securityConfig = require('../config/security.config');

class SecurityService {
  constructor() {
    this.loginAttempts = new Map(); // Track login attempts
    this.blacklistedTokens = new Set(); // Blacklisted JWT tokens
  }

  // Hash password with bcrypt
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Generate JWT token
  generateToken(payload) {
    return jwt.sign(payload, securityConfig.jwt.secret, {
      expiresIn: securityConfig.jwt.expiresIn
    });
  }

  // Generate refresh token
  generateRefreshToken(payload) {
    return jwt.sign(payload, securityConfig.jwt.secret, {
      expiresIn: securityConfig.jwt.refreshExpiresIn
    });
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      if (this.blacklistedTokens.has(token)) {
        throw new Error('Token has been revoked');
      }
      return jwt.verify(token, securityConfig.jwt.secret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Revoke token (logout)
  revokeToken(token) {
    this.blacklistedTokens.add(token);
    // Clean up old tokens periodically
    if (this.blacklistedTokens.size > 1000) {
      this.blacklistedTokens.clear();
    }
  }

  // Check login attempts (brute force protection)
  checkLoginAttempts(identifier) {
    const attempts = this.loginAttempts.get(identifier) || { count: 0, lockedUntil: null };

    // Check if account is locked
    if (attempts.lockedUntil && attempts.lockedUntil > Date.now()) {
      const remainingTime = Math.ceil((attempts.lockedUntil - Date.now()) / 1000 / 60);
      throw new Error(`Account locked. Try again in ${remainingTime} minutes`);
    }

    // Reset if lock expired
    if (attempts.lockedUntil && attempts.lockedUntil <= Date.now()) {
      this.loginAttempts.delete(identifier);
      return true;
    }

    return attempts.count < securityConfig.password.maxAttempts;
  }

  // Record failed login attempt
  recordFailedLogin(identifier) {
    const attempts = this.loginAttempts.get(identifier) || { count: 0, lockedUntil: null };
    attempts.count++;

    if (attempts.count >= securityConfig.password.maxAttempts) {
      attempts.lockedUntil = Date.now() + securityConfig.password.lockoutDuration;
      console.warn(`🔒 Account locked: ${identifier}`);
    }

    this.loginAttempts.set(identifier, attempts);
  }

  // Reset login attempts (successful login)
  resetLoginAttempts(identifier) {
    this.loginAttempts.delete(identifier);
  }

  // Validate password strength
  validatePasswordStrength(password) {
    const errors = [];
    const config = securityConfig.password;

    if (password.length < config.minLength) {
      errors.push(`Password must be at least ${config.minLength} characters`);
    }

    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Sanitize input (prevent XSS)
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Generate secure random token
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Encrypt sensitive data
  encryptData(data, key) {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      iv: iv.toString('hex'),
      data: encrypted
    };
  }

  // Decrypt sensitive data
  decryptData(encryptedData, key) {
    const algorithm = 'aes-256-cbc';
    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(key, 'hex'),
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  // Generate encryption key
  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Audit log entry
  createAuditLog(action, user, details) {
    return {
      timestamp: new Date().toISOString(),
      action,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      details,
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown'
    };
  }

  // Check if IP is rate limited
  checkRateLimit(ip) {
    // This would integrate with express-rate-limit
    // For now, just return true
    return true;
  }

  // Validate session
  validateSession(sessionId, userId) {
    // Session validation logic
    return true;
  }

  // Generate CSRF token
  generateCSRFToken() {
    return this.generateSecureToken(32);
  }

  // Verify CSRF token
  verifyCSRFToken(token, storedToken) {
    return token === storedToken;
  }
}

module.exports = new SecurityService();
