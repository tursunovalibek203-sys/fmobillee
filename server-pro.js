// ==================== PROFESSIONAL SERVER ARCHITECTURE ====================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Middleware
const { errorMiddleware } = require('./middleware/error-handler');

// Models
const Customer = require('./database').Customer;
const Sale = require('./database').Sale;
const Product = require('./database').Product;
const Settings = require('./database').Settings;
const Cashier = require('./database').Cashier;
const Branch = require('./database').Branch;

// Services
const CustomerService = require('./services/customer.service');
const ProductService = require('./services/product.service');
const SaleService = require('./services/sale.service');
const TelegramService = require('./services/telegram.service');

// Controllers
const CustomerController = require('./controllers/customer.controller');
const ProductController = require('./controllers/product.controller');

// Managers
const ExcelManager = require('./excel-manager');
const BackupManager = require('./backup-manager');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ==================== DATABASE CONNECTION ====================

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB ulandi'))
  .catch(err => {
    console.error('❌ MongoDB xato:', err);
    process.exit(1);
  });

// ==================== SERVICES INITIALIZATION ====================

const excelManager = new ExcelManager();
const backupManager = new BackupManager();
const telegramService = new TelegramService(process.env.BOT_TOKEN);

const customerService = new CustomerService(Customer, Sale, excelManager);
const productService = new ProductService(Product);
const saleService = new SaleService(Sale, Customer, excelManager, telegramService);

// ==================== CONTROLLERS INITIALIZATION ====================

const customerController = new CustomerController(customerService);
const productController = new ProductController(productService);

// ==================== ROUTES ====================

// Customer routes
const customerRoutes = require('./routes/customer.routes')(customerController);
app.use('/api/customers', customerRoutes);

// Product routes
const productRoutes = require('./routes/product.routes')(productController);
app.use('/api/products', productRoutes);

// Reports routes
const reportsRoutes = require('./routes/reports.routes')(Customer, Sale, Product, Cashier, Branch);
app.use('/api/reports', reportsRoutes);

// Legacy routes (for backward compatibility)
require('./routes/legacy.routes')(app, {
  Customer,
  Sale,
  Product,
  Settings,
  Cashier,
  Branch,
  excelManager,
  backupManager,
  telegramService,
  saleService
});

// ==================== ERROR HANDLING ====================

app.use(errorMiddleware);

// ==================== ROOT ROUTE ====================

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// ==================== SERVER START ====================

app.listen(PORT, async () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 PROFESSIONAL DO\'KON BOSHQARUV TIZIMI');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Admin: http://localhost:${PORT}/admin.html`);
  console.log(`📋 Reports: http://localhost:${PORT}/admin-reports.html`);
  console.log(`💾 MongoDB: ${process.env.MONGODB_URI ? '✅ Ulangan' : '❌ Ulanmagan'}`);
  console.log(`🤖 Telegram: ${process.env.BOT_TOKEN ? '✅ Faol' : '❌ Token yo\'q'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Initialize Excel
  try {
    await excelManager.createWeeklyExcel();
    console.log('✅ Excel tizimi tayyor');
  } catch (error) {
    console.error('❌ Excel xato:', error.message);
  }
  
  // Test Telegram
  if (process.env.BOT_TOKEN) {
    try {
      const botInfo = await telegramService.getMe();
      if (botInfo) {
        console.log(`✅ Telegram bot: @${botInfo.username}`);
      }
    } catch (error) {
      console.error('❌ Telegram xato:', error.message);
    }
  }
  
  console.log('\n✅ Barcha tizimlar tayyor!\n');
});

module.exports = app;
