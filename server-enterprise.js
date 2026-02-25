// ==================== ENTERPRISE SERVER ====================
// 1C darajasida professional server

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const path = require('path');

// Services
const TransactionService = require('./services/transaction.service');
const DataIntegrityService = require('./services/data-integrity.service');
const DualDatabaseService = require('./services/dual-database.service');
const ExcelManager = require('./excel-manager');
const BackupManager = require('./backup-manager');

const app = express();
const PORT = process.env.PORT || 3000;

// Service instances
const transactionService = new TransactionService();
const integrityService = new DataIntegrityService();
const excelManager = new ExcelManager();
const backupManager = new BackupManager();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ==================== DATABASE CONNECTION ====================

let mongoConnected = false;
let pgConnected = false;

// MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ MongoDB ulandi');
    mongoConnected = true;
  })
  .catch(err => {
    console.error('❌ MongoDB xato:', err.message);
    console.log('⚠️ Tizim PostgreSQL va Excel bilan davom etadi');
  });

// MongoDB reconnection
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB ulanish uzildi');
  mongoConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB qayta ulandi');
  mongoConnected = true;
});

// ==================== SCHEMAS ====================

const CustomerSchema = new mongoose.Schema({
  customerId: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  phone: String,
  chatId: String,
  firstDebtDate: Date,
  totalDebt: { type: Number, default: 0, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

const SaleSchema = new mongoose.Schema({
  saleId: { type: Number, required: true, unique: true, index: true },
  customerId: { type: Number, required: true, index: true },
  customerName: { type: String, required: true },
  product: String,
  price: { type: Number, required: true },
  paid: { type: Number, default: 0 },
  type: { type: String, default: 'sale', index: true },
  date: { type: String, required: true, index: true },
  time: { type: String, required: true },
  checksum: String, // Ma'lumot yaxlitligi uchun
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  productId: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  category: { type: String, default: 'Umumiy', index: true },
  buyPrice: { type: Number, default: 0 },
  sellPrice: { type: Number, required: true },
  stock: { type: Number, default: 0, index: true },
  minStock: { type: Number, default: 5 },
  unit: { type: String, default: 'dona' },
  barcode: { type: String, index: true },
  isActive: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
CustomerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

SaleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  // Checksum yaratish
  this.checksum = integrityService.generateChecksum({
    saleId: this.saleId,
    price: this.price,
    paid: this.paid
  });
  next();
});

ProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Customer = mongoose.model('Customer', CustomerSchema);
const Sale = mongoose.model('Sale', SaleSchema);
const Product = mongoose.model('Product', ProductSchema);

// ==================== ENTERPRISE SALE ENDPOINT ====================

app.post('/api/sales/enterprise', async (req, res) => {
  let transaction = null;
  
  try {
    const saleData = req.body;
    
    // 1. Input sanitization
    const cleanData = integrityService.cleanData(saleData);
    
    // 2. Validation
    const validation = integrityService.validateSale(cleanData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    // 3. Transaction boshlash
    transaction = await transactionService.beginTransaction('sale', cleanData);
    console.log(`🔄 Transaction boshlandi: ${transaction.id}`);

    // 4. Mijozni tekshirish
    const customer = await Customer.findOne({ customerId: cleanData.customerId });
    if (!customer) {
      await transactionService.rollbackTransaction(transaction.id, new Error('Mijoz topilmadi'));
      return res.status(404).json({
        success: false,
        error: 'Mijoz topilmadi'
      });
    }
    await transactionService.logStep(transaction.id, 'customer_check', 'SUCCESS');

    // 5. Excel ga yozish (birinchi navbatda)
    try {
      await excelManager.addToExcel(cleanData, customer.name);
      await transactionService.logStep(transaction.id, 'excel_write', 'SUCCESS');
      console.log('✅ Excel: Yozildi');
    } catch (excelError) {
      await transactionService.rollbackTransaction(transaction.id, excelError);
      return res.status(500).json({
        success: false,
        error: 'Excel ga yozishda xatolik',
        details: excelError.message
      });
    }

    // 6. MongoDB ga saqlash
    let sale;
    try {
      sale = await Sale.create(cleanData);
      await transactionService.logStep(transaction.id, 'mongodb_write', 'SUCCESS');
      console.log('✅ MongoDB: Saqlandi');
    } catch (mongoError) {
      await transactionService.rollbackTransaction(transaction.id, mongoError);
      return res.status(500).json({
        success: false,
        error: 'MongoDB ga saqlashda xatolik',
        details: mongoError.message
      });
    }

    // 7. Mijoz qarzini yangilash
    const allSales = await Sale.find({ customerId: cleanData.customerId });
    const debtCalc = integrityService.calculateDebt(allSales);
    
    customer.totalDebt = debtCalc.debt;
    if (debtCalc.debt > 0 && !customer.firstDebtDate) {
      customer.firstDebtDate = new Date();
    } else if (debtCalc.debt <= 0) {
      customer.firstDebtDate = null;
    }
    
    await customer.save();
    await transactionService.logStep(transaction.id, 'customer_update', 'SUCCESS');

    // 8. Transaction commit
    await transactionService.commitTransaction(transaction.id, 'COMMITTED');

    // 9. Success response
    res.json({
      success: true,
      sale,
      customer: {
        totalDebt: customer.totalDebt,
        firstDebtDate: customer.firstDebtDate
      },
      transaction: {
        id: transaction.id,
        status: 'COMMITTED'
      },
      message: 'Savdo muvaffaqiyatli saqlandi (Enterprise mode)'
    });

  } catch (error) {
    console.error('❌ Enterprise sale xato:', error);
    
    if (transaction) {
      await transactionService.rollbackTransaction(transaction.id, error);
    }

    res.status(500).json({
      success: false,
      error: error.message,
      transaction: transaction ? {
        id: transaction.id,
        status: 'ROLLED_BACK'
      } : null
    });
  }
});

// ==================== SYSTEM HEALTH ====================

app.get('/api/system/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: {
          connected: mongoConnected,
          status: mongoConnected ? 'UP' : 'DOWN'
        },
        excel: {
          status: 'UP',
          filesCount: excelManager.getExcelFiles().length
        },
        backup: {
          status: 'UP'
        },
        transaction: {
          status: 'UP'
        }
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    // Agar biror service ishlamasa
    if (!mongoConnected) {
      health.status = 'degraded';
    }

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// ==================== TRANSACTION MONITORING ====================

app.get('/api/transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const transactions = await transactionService.getAllTransactions(limit);
    
    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/transactions/failed', async (req, res) => {
  try {
    const failed = await transactionService.getFailedTransactions();
    
    res.json({
      success: true,
      count: failed.length,
      transactions: failed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/transactions/stats', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const stats = await transactionService.getStatistics(days);
    
    res.json({
      success: true,
      period: `${days} kun`,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== DATA INTEGRITY ====================

app.post('/api/integrity/verify', async (req, res) => {
  try {
    const { saleId } = req.body;
    
    const sale = await Sale.findOne({ saleId });
    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Savdo topilmadi'
      });
    }

    const expectedChecksum = integrityService.generateChecksum({
      saleId: sale.saleId,
      price: sale.price,
      paid: sale.paid
    });

    const isValid = sale.checksum === expectedChecksum;

    res.json({
      success: true,
      saleId,
      isValid,
      storedChecksum: sale.checksum,
      calculatedChecksum: expectedChecksum,
      message: isValid ? 'Ma\'lumot yaxlitligi tasdiqlandi' : 'Ma\'lumot buzilgan!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== AUTOMATIC TASKS ====================

// Har 5 daqiqada health check
cron.schedule('*/5 * * * *', async () => {
  console.log('🏥 Health check...');
  
  if (!mongoConnected) {
    console.log('⚠️ MongoDB ulanish yo\'q, qayta ulanish...');
    try {
      await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
      console.error('❌ Qayta ulanish xato:', error.message);
    }
  }
});

// Har soatda backup
cron.schedule('0 * * * *', async () => {
  console.log('💾 Avtomatik backup...');
  try {
    const customers = await Customer.find();
    const sales = await Sale.find();
    await backupManager.createFullBackup(customers, sales);
    console.log('✅ Backup yaratildi');
  } catch (error) {
    console.error('❌ Backup xato:', error.message);
  }
});

// Har kuni eski transaction loglarni tozalash
cron.schedule('0 2 * * *', async () => {
  console.log('🧹 Eski loglarni tozalash...');
  try {
    const deleted = await transactionService.cleanOldLogs(30);
    console.log(`✅ ${deleted} ta eski log o'chirildi`);
  } catch (error) {
    console.error('❌ Log tozalash xato:', error.message);
  }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('❌ Server xato:', err);
  
  res.status(500).json({
    success: false,
    error: 'Server xatosi',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ichki server xatosi',
    timestamp: new Date().toISOString()
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🚀 ENTERPRISE SERVER ISHGA TUSHDI       ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║   📡 Port: ${PORT}                            ║`);
  console.log(`║   🔒 Mode: Enterprise (1C darajasi)       ║`);
  console.log(`║   💾 MongoDB: ${mongoConnected ? 'Ulandi' : 'Kutilmoqda'}                  ║`);
  console.log('║   ✅ Transaction Log: Faol                ║');
  console.log('║   ✅ Data Integrity: Faol                 ║');
  console.log('║   ✅ Auto Backup: Faol                    ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
