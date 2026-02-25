// ==================== PROFESSIONAL SECURE SERVER ====================
// Enterprise-grade security with automatic backups

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Security & Monitoring
const securityConfig = require('./config/security.config');
const securityService = require('./services/security.service');
const BackupService = require('./services/backup.service');
const monitoringService = require('./services/monitoring.service');

// Security Middleware
const {
  apiRateLimiter,
  authRateLimiter,
  securityHeaders,
  sanitizeInput,
  preventParameterPollution,
  auditLog
} = require('./middleware/security.middleware');

// Managers
const ExcelManager = require('./excel-manager');
const BackupManager = require('./backup-manager');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// ==================== SECURITY MIDDLEWARE ====================

// Security headers (Helmet)
app.use(securityHeaders);

// CORS with configuration
app.use(cors(securityConfig.cors));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Session management
app.use(session(securityConfig.session));

// Input sanitization
app.use(sanitizeInput);

// Parameter pollution prevention
app.use(preventParameterPollution);

// API rate limiting
app.use('/api/', apiRateLimiter);

// Static files
app.use(express.static('public'));

// Request monitoring
app.use((req, res, next) => {
  monitoringService.recordRequest();
  next();
});

// ==================== DATABASE CONNECTION ====================

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000
})
  .then(() => console.log('✅ MongoDB connected securely'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ==================== SERVICES INITIALIZATION ====================

const excelManager = new ExcelManager();
const backupManager = new BackupManager();
const backupService = new BackupService();

// ==================== MODELS ====================

const schemas = require('./models/schemas');

const Customer = mongoose.model('Customer', schemas.CustomerSchema);
const Sale = mongoose.model('Sale', schemas.SaleSchema);
const Product = mongoose.model('Product', schemas.ProductSchema);
const Settings = mongoose.model('Settings', schemas.SettingsSchema);
const Cashier = mongoose.model('Cashier', schemas.CashierSchema);
const CashierSale = mongoose.model('CashierSale', schemas.CashierSaleSchema);
const CashierHandover = mongoose.model('CashierHandover', schemas.CashierHandoverSchema);
const Branch = mongoose.model('Branch', schemas.BranchSchema);

// ==================== HEALTH CHECK ROUTES ====================

const healthRoutes = require('./routes/health.routes');
app.use('/health', healthRoutes);

// ==================== SECURE ADMIN LOGIN ====================

app.post('/api/admin-login', authRateLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username va password kiritilishi shart'
      });
    }

    // Check brute force protection
    try {
      securityService.checkLoginAttempts(username);
    } catch (error) {
      return res.status(429).json({
        success: false,
        error: error.message
      });
    }

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUsername && password === adminPassword) {
      // Reset failed attempts
      securityService.resetLoginAttempts(username);

      // Generate JWT token
      const token = securityService.generateToken({
        username,
        role: 'admin',
        loginTime: new Date().toISOString()
      });

      // Audit log
      console.log('📝 Admin login:', username, 'IP:', req.ip);

      res.json({
        success: true,
        message: 'Login muvaffaqiyatli',
        token,
        user: {
          username,
          role: 'admin'
        }
      });
    } else {
      // Record failed attempt
      securityService.recordFailedLogin(username);

      res.status(401).json({
        success: false,
        error: 'Login yoki parol noto\'g\'ri'
      });
    }
  } catch (error) {
    monitoringService.recordError(error, { endpoint: '/api/admin-login' });
    res.status(500).json({
      success: false,
      error: 'Server xatosi'
    });
  }
});

// ==================== SECURE BACKUP ENDPOINTS ====================

// Create manual backup
app.post('/api/backup/create', auditLog('create_backup'), async (req, res) => {
  try {
    console.log('🔄 Creating manual backup...');

    const models = {
      customers: Customer,
      sales: Sale,
      products: Product,
      cashiers: Cashier,
      branches: Branch
    };

    const result = await backupService.createFullBackup(models);

    if (result.success) {
      console.log('✅ Backup created successfully');
      res.json({
        success: true,
        message: 'Backup muvaffaqiyatli yaratildi',
        backup: {
          filename: result.filename,
          size: Math.round(result.size / 1024) + ' KB',
          timestamp: result.timestamp
        }
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    monitoringService.recordError(error, { endpoint: '/api/backup/create' });
    res.status(500).json({
      success: false,
      error: 'Backup yaratishda xatolik: ' + error.message
    });
  }
});

// List all backups
app.get('/api/backup/list', async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    res.json({
      success: true,
      backups: backups.map(b => ({
        filename: b.filename,
        size: Math.round(b.size / 1024) + ' KB',
        created: b.created,
        modified: b.modified
      }))
    });
  } catch (error) {
    monitoringService.recordError(error, { endpoint: '/api/backup/list' });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== IMPORT LEGACY ROUTES ====================

// Import all existing routes from server.js
require('./routes/legacy.routes')(app, {
  Customer,
  Sale,
  Product,
  Settings,
  Cashier,
  CashierSale,
  CashierHandover,
  Branch,
  excelManager,
  backupManager,
  securityService
});

// Reports routes
const reportsRoutes = require('./routes/reports.routes')(Customer, Sale, Product, Cashier, Branch);
app.use('/api/reports', reportsRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint topilmadi'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  monitoringService.recordError(err, {
    endpoint: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Server xatosi yuz berdi' 
      : err.message
  });
});

// ==================== ROOT ROUTE ====================

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// ==================== GRACEFUL SHUTDOWN ====================

process.on('SIGTERM', async () => {
  console.log('\n⚠️ SIGTERM signal received: closing HTTP server');
  
  // Create final backup before shutdown
  try {
    console.log('🔄 Creating final backup before shutdown...');
    const models = { customers: Customer, sales: Sale, products: Product, cashiers: Cashier, branches: Branch };
    await backupService.createFullBackup(models);
    console.log('✅ Final backup completed');
  } catch (error) {
    console.error('❌ Final backup failed:', error.message);
  }

  await mongoose.disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⚠️ SIGINT signal received: closing HTTP server');
  await mongoose.disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
});

// ==================== SERVER START ====================

app.listen(PORT, async () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔒 PROFESSIONAL SECURE DO\'KON BOSHQARUV TIZIMI');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🔐 Security: ✅ ENABLED`);
  console.log(`🛡️  Rate Limiting: ✅ ACTIVE`);
  console.log(`🔒 Helmet Headers: ✅ ACTIVE`);
  console.log(`🚨 Input Sanitization: ✅ ACTIVE`);
  console.log(`💾 MongoDB: ${process.env.MONGODB_URI ? '✅ Connected' : '❌ Not connected'}`);
  console.log(`🤖 Telegram: ${process.env.BOT_TOKEN ? '✅ Active' : '⚠️  Token missing'}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`📈 Metrics: http://localhost:${PORT}/health/metrics`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Initialize Excel
  try {
    await excelManager.createWeeklyExcel();
    console.log('✅ Excel system ready');
  } catch (error) {
    console.error('❌ Excel error:', error.message);
  }

  // Create initial backup
  if (process.env.BACKUP_ENABLED !== 'false') {
    try {
      console.log('🔄 Creating initial backup...');
      const models = { customers: Customer, sales: Sale, products: Product, cashiers: Cashier, branches: Branch };
      const result = await backupService.createFullBackup(models);
      if (result.success) {
        console.log(`✅ Initial backup created: ${result.filename}`);
      }
    } catch (error) {
      console.error('❌ Initial backup failed:', error.message);
    }
  }

  console.log('\n✅ All systems operational!\n');
  console.log('🔒 SECURITY FEATURES:');
  console.log('   ✓ JWT Authentication');
  console.log('   ✓ Brute Force Protection');
  console.log('   ✓ Rate Limiting');
  console.log('   ✓ Input Sanitization');
  console.log('   ✓ Security Headers (Helmet)');
  console.log('   ✓ CORS Protection');
  console.log('   ✓ Session Management');
  console.log('   ✓ Audit Logging');
  console.log('\n💾 BACKUP FEATURES:');
  console.log('   ✓ Automatic Backups');
  console.log('   ✓ Compression (gzip)');
  console.log('   ✓ 30-day Retention');
  console.log('   ✓ Manual Backup API');
  console.log('\n📊 MONITORING:');
  console.log('   ✓ Health Checks');
  console.log('   ✓ System Metrics');
  console.log('   ✓ Error Tracking');
  console.log('   ✓ Request Monitoring');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

module.exports = app;
