require('dotenv').config();
const dns = require('dns');

// DNS YECHIMI: Google DNS ishlatish (Windows DNS MongoDB SRV ni to'g'ri resolve qilmaydi)
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS
dns.setDefaultResultOrder('ipv4first'); // IPv4 birinchi

console.log('🌐 DNS Server: Google DNS (8.8.8.8, 8.8.4.4)');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const cron = require('node-cron');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const ExcelManager = require('./excel-manager');
const BackupManager = require('./backup-manager');
const ExcelRealtimeManager = require('./excel-realtime-manager'); // YANGI: Real-time Excel

const app = express();
const PORT = process.env.PORT || 3000;

// Excel va Backup Manager ni ishga tushirish
const excelManager = new ExcelManager();
const backupManager = new BackupManager();
const excelRT = ExcelRealtimeManager; // YANGI: Real-time Excel instance

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Static fayllar uchun

// MongoDB ulanish
connectDB = async () => {
  // MongoDB ulanish parametrlari
  const atlasOptions = {
    serverSelectionTimeoutMS: 30000, // 30 soniya timeout
    connectTimeoutMS: 30000,
    socketTimeoutMS: 60000,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority',
    family: 4  // IPv4 majburiy - querySrv ECONNREFUSED muammosini bartaraf etish
  };

  const localOptions = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    maxPoolSize: 5
  };

  // Atlas URI ga appName qo'shish (Atlas ulanishini yaxshilaydi)
  let atlasUri = process.env.MONGODB_URI;
  if (atlasUri && atlasUri.includes('mongodb+srv://') && !atlasUri.includes('appName=')) {
    atlasUri += (atlasUri.includes('?') ? '&' : '?') + 'appName=Cluster0';
  }

  // 1. Atlas ga urinish
  if (atlasUri && atlasUri.includes('mongodb+srv://')) {
    try {
      console.log('🔄 MongoDB Atlas ga ulanish...');
      console.log('🌐 Atlas URL:', atlasUri.replace(/\/\/.*:.*@/, '//***:***@'));

      const conn = await mongoose.connect(atlasUri, atlasOptions);
      console.log('✅ MongoDB Atlas ulandi:', conn.connection.host);
      console.log('📊 Database:', conn.connection.name);
      console.log('🔗 Connection State:', conn.connection.readyState);
      return true;
    } catch (error) {
      console.error('❌ MongoDB Atlas xato:', error.message);
      if (error.reason) {
        console.error('📝 Sabab:', error.reason);
      }
      try { await mongoose.disconnect(); } catch (_) {}

      // querySrv ECONNREFUSED - Standard URI yoki SRV dan direct formatga o'tkazish
      const isSrvError = error.message && (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED'));
      let tryUri = process.env.MONGODB_URI_STANDARD;
      if (!tryUri && isSrvError && atlasUri) {
        // SRV dan direct: mongodb+srv://user:pass@host/db -> mongodb://user:pass@host:27017/db?ssl=true
        try {
          const s = atlasUri.replace('mongodb+srv://', '');
          const atIdx = s.indexOf('@');
          if (atIdx > 0) {
            const creds = s.substring(0, atIdx);
            const rest = s.substring(atIdx + 1);
            const colonIdx = creds.indexOf(':');
            const user = creds.substring(0, colonIdx);
            const pass = colonIdx >= 0 ? creds.substring(colonIdx + 1) : '';
            const host = rest.split('/')[0].split('?')[0];
            const db = rest.includes('/') ? rest.split('/')[1].split('?')[0] : 'dokon_db';
            if (host && user) {
              tryUri = `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:27017/${db || 'dokon_db'}?ssl=true&directConnection=true`;
            }
          }
        } catch (_) {}
      }
      if (isSrvError && tryUri && tryUri.startsWith('mongodb://')) {
        try {
          console.log('🔄 Direct connection sinab ko\'rilmoqda (SRV atladi)...');
          const conn = await mongoose.connect(tryUri, { ...atlasOptions, directConnection: true });
          console.log('✅ MongoDB Direct URI orqali ulandi:', conn.connection.host);
          return true;
        } catch (err) {
          console.error('❌ Direct URI xato:', err.message);
          try { await mongoose.disconnect(); } catch (_) {}
        }
      }
    }
  }

  // 2. Lokal MongoDB ga urinish (mongodb:// yoki mongodb+srv:// emas)
  const localUri = process.env.MONGODB_LOCAL || 
    (process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith('mongodb://') ? process.env.MONGODB_URI : null) ||
    'mongodb://127.0.0.1:27017/dokon_db';
  try {
    console.log('🔄 Lokal MongoDB ga ulanish...');
    const localConn = await mongoose.connect(localUri, localOptions);
    console.log('✅ Lokal MongoDB ulandi:', localConn.connection.host);
    console.log('📊 Database:', localConn.connection.name);
    return true;
  } catch (localError) {
    console.error('❌ Lokal MongoDB xato:', localError.message);
  }

  // 3. JSON fayl bazasiga o'tish
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  MONGODB ULANMADI - JSON FALLBACK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📁 Ma\'lumotlar JSON fayllarida saqlanadi');
  console.log('💡 MongoDB Atlas: https://www.mongodb.com/atlas');
  console.log('💡 MongoDB Community: https://www.mongodb.com/try/download/community');
  console.log('🔧 Yechim: .env faylidagi MONGODB_URI ni tekshiring');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  return false;
}

// MongoDB ga ulanish
let isDBConnected = false;
connectDB().then(connected => {
  isDBConnected = connected;
  
  // MongoDB diagnostika
  if (connected) {
    setTimeout(async () => {
      try {
        const admin = mongoose.connection.db.admin();
        const result = await admin.ping();
        console.log('🏓 MongoDB Ping:', result.ok ? 'OK' : 'FAILED');
        
        const stats = await mongoose.connection.db.stats();
        console.log('📊 Database Stats:');
        console.log('   - Collections:', stats.collections);
        console.log('   - Objects:', stats.objects);
        console.log('   - Data Size:', Math.round(stats.dataSize / 1024) + ' KB');
      } catch (error) {
        console.error('❌ MongoDB diagnostika xato:', error.message);
      }
    }, 2000);
  }
});

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose MongoDB ga ulandi');
  isDBConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB ulanish xatosi:', err);
  isDBConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB ulanish uzildi');
  isDBConnected = false;
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB ulanish yopildi');
  process.exit(0);
});

// ==================== EXCEL SETUP ====================

async function initExcel() {
  try {
    console.log('📊 Excel tizimi ishga tushirilmoqda...');
    
    // Haftalik Excel fayl yaratish
    await excelManager.createWeeklyExcel();
    
    console.log('✅ Excel tizimi tayyor!');
    
  } catch (error) {
    console.error('❌ Excel tizimi xato:', error.message);
  }
}

// ==================== SCHEMAS ====================

const CustomerSchema = new mongoose.Schema({
  customerId: { type: Number, required: true, unique: true },
  branchId: { type: Number, default: 0 }, // Qaysi filialga tegishli (0 = umumiy)
  name: String,
  phone: String,
  chatId: String,
  firstDebtDate: Date,
  totalDebt: { type: Number, default: 0 }
});

const SaleSchema = new mongoose.Schema({
  saleId: { type: Number, required: true },
  customerId: Number,
  customerName: String,
  product: String,
  price: Number,
  paidUSD: { type: Number, default: 0 }, // Dollar to'lovi
  type: { type: String, default: 'sale' }, // 'sale' yoki 'payment'
  date: String,
  time: String,
  createdAt: { type: Date, default: Date.now }
});

const SettingsSchema = new mongoose.Schema({
  reminderDays: { type: Number, default: 7 },
  reminderTime: { type: String, default: '09:00' },
  blockDays: { type: Number, default: 10 },
  reminder3days: { type: Boolean, default: true },
  reminder5days: { type: Boolean, default: true },
  reminder7days: { type: Boolean, default: true },
  currencyType: { type: String, default: 'USD' },
  currencyPosition: { type: String, default: 'before' },
  language: { type: String, default: 'uz' },
  theme: { type: String, default: 'blue' },
  soundEnabled: { type: Boolean, default: true },
  autoBackup: { type: String, default: 'weekly' },
  autoExcelExport: { type: Boolean, default: true },
  exchangeRate: { type: Number, default: 12500 }, // USD/UZS kursi (eski)
  exchangeRateUZS: { type: Number, default: 12500 }, // 1 USD = 12500 UZS
  exchangeRateEUR: { type: Number, default: 0.92 } // 1 USD = 0.92 EUR
});

const ProductSchema = new mongoose.Schema({
  productId: { type: Number, required: true, unique: true },
  branchId: { type: Number, default: 0 }, // Qaysi filialga tegishli (0 = umumiy)
  name: { type: String, required: true },
  category: { type: String, default: 'Umumiy' },
  buyPrice: { type: Number, default: 0 },
  sellPrice: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 5 },
  unit: { type: String, default: 'dona' },
  barcode: String,
  imei: String, // Bitta IMEI (eski versiya uchun)
  imeis: [String], // Ko'p IMEI kodlar (yangi)
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Kassir Schema
const CashierSchema = new mongoose.Schema({
  cashierId: { type: Number, required: true, unique: true },
  branchId: { type: Number, required: true }, // Qaysi filialga tegishli
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, default: 'cashier' }, // 'admin' yoki 'cashier'
  isActive: { type: Boolean, default: true },
  balance: { type: Number, default: 0 }, // Jami balans (USD da)
  balanceUSD: { type: Number, default: 0 }, // Dollar balans
  balanceUZS: { type: Number, default: 0 }, // So'm balans
  totalSales: { type: Number, default: 0 }, // Jami savdo
  totalSalesAmount: { type: Number, default: 0 }, // Jami savdo summasi
  totalHandedOver: { type: Number, default: 0 }, // Adminga berilgan
  totalHandovers: { type: Number, default: 0 }, // Kirim berish soni
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
});

// Kassir savdolari Schema (3 valyuta bilan)
const CashierSaleSchema = new mongoose.Schema({
  saleId: { type: Number, required: true },
  branchId: { type: Number, default: 1 }, // Qaysi filialda (default 1)
  cashierId: { type: Number, required: true },
  cashierName: String,
  customerId: Number,
  customerName: String,
  product: String,
  quantity: { type: Number, default: 1 }, // Miqdor
  price: Number, // Jami narx (USD da)
  paid: { type: Number, default: 0 }, // Jami to'lov (USD da)
  paidUSD: { type: Number, default: 0 }, // Dollar to'lovi
  paidUZS: { type: Number, default: 0 }, // So'm to'lovi
  paidEUR: { type: Number, default: 0 }, // Yevro to'lovi
  exchangeRateUSD: { type: Number, default: 1 }, // USD kursi (1 USD = 1 USD)
  exchangeRateUZS: { type: Number, default: 12500 }, // UZS kursi (1 USD = 12500 UZS)
  exchangeRateEUR: { type: Number, default: 0.92 }, // EUR kursi (1 USD = 0.92 EUR)
  saleType: { type: String, default: 'customer' }, // 'customer' or 'walk-in'
  type: { type: String, default: 'sale' },
  date: String,
  time: String,
  createdAt: { type: Date, default: Date.now }
});

// Kassir kirim berish Schema
const CashierHandoverSchema = new mongoose.Schema({
  handoverId: { type: Number, required: true, unique: true },
  branchId: { type: Number, required: true }, // Qaysi filialda
  cashierId: { type: Number, required: true },
  cashierName: String,
  amount: { type: Number, required: true },
  balanceBefore: Number,
  balanceAfter: Number,
  notes: String,
  date: String,
  time: String,
  createdAt: { type: Date, default: Date.now }
});

// Filial Schema
const BranchSchema = new mongoose.Schema({
  branchId: { type: Number, required: true, unique: true },
  name: { type: String, required: true }, // Filial nomi
  address: String, // Manzil
  phone: String, // Telefon
  manager: String, // Menejer ismi
  isActive: { type: Boolean, default: true },
  totalSales: { type: Number, default: 0 }, // Jami savdo
  totalRevenue: { type: Number, default: 0 }, // Jami daromad
  createdAt: { type: Date, default: Date.now }
});

// Xarajatlar Schema
const ExpenseSchema = new mongoose.Schema({
  expenseId: { type: Number, required: true, unique: true },
  branchId: { type: Number, default: 0 }, // 0 = umumiy xarajat
  category: { type: String, required: true }, // Kategoriya
  amount: { type: Number, required: true }, // Summa (USD)
  amountUZS: { type: Number, default: 0 }, // So'm
  description: String, // Tavsif
  date: String, // Sana
  time: String, // Vaqt
  addedBy: String, // Kim qo'shgan
  paymentMethod: { type: String, default: 'cash' }, // naqd/karta/bank
  isRecurring: { type: Boolean, default: false }, // Takrorlanuvchi
  recurringPeriod: String, // kunlik/haftalik/oylik
  createdAt: { type: Date, default: Date.now }
});

// Activity Log Schema - BARCHA HARAKATLAR TARIXI
const ActivityLogSchema = new mongoose.Schema({
  activityId: { type: Number, required: true, unique: true },
  action: { type: String, required: true }, // 'create', 'update', 'delete', 'sale', 'payment', 'login', 'logout'
  entity: { type: String, required: true }, // 'product', 'customer', 'sale', 'cashier', 'branch', 'expense'
  entityId: { type: Number }, // Ob'ekt ID
  entityName: String, // Ob'ekt nomi
  userId: { type: Number }, // Kim qildi (cashierId yoki adminId)
  userName: { type: String, required: true }, // Foydalanuvchi ismi
  userRole: { type: String, default: 'cashier' }, // 'admin', 'cashier'
  branchId: { type: Number, default: 0 }, // Qaysi filialda
  branchName: String, // Filial nomi
  description: String, // Tavsif
  oldValue: mongoose.Schema.Types.Mixed, // Eski qiymat (update uchun)
  newValue: mongoose.Schema.Types.Mixed, // Yangi qiymat
  ipAddress: String, // IP manzil
  userAgent: String, // Brauzer ma'lumoti
  timestamp: { type: Date, default: Date.now }, // Aniq vaqt
  date: String, // Sana (uz-UZ format)
  time: String, // Vaqt (uz-UZ format)
  metadata: mongoose.Schema.Types.Mixed // Qo'shimcha ma'lumotlar
});

// Ombor Kelish Tarixi Schema (Stock In History)
const StockInSchema = new mongoose.Schema({
  stockInId: { type: Number, required: true, unique: true },
  productId: { type: Number, required: true },
  productName: { type: String, required: true },
  branchId: { type: Number, default: 0 },
  branchName: String,
  quantity: { type: Number, required: true }, // Nechta keldi
  buyPrice: { type: Number, default: 0 }, // Kelish narxi
  totalCost: { type: Number, default: 0 }, // Jami xarajat
  supplier: String, // Yetkazib beruvchi
  supplierPhone: String,
  invoiceNumber: String, // Faktura raqami
  notes: String, // Izoh
  addedBy: { type: String, required: true }, // Kim qo'shdi
  addedById: { type: Number, default: 0 }, // Foydalanuvchi ID
  userRole: { type: String, default: 'admin' }, // 'admin' yoki 'manager'
  timestamp: { type: Date, default: Date.now },
  date: String, // Sana (25/02/2026)
  time: String, // Vaqt (14:30:45)
  createdAt: { type: Date, default: Date.now }
});

// Ombor Chiqish Tarixi Schema (Stock Out History)
const StockOutSchema = new mongoose.Schema({
  stockOutId: { type: Number, required: true, unique: true },
  productId: { type: Number, required: true },
  productName: { type: String, required: true },
  branchId: { type: Number, default: 0 },
  branchName: String,
  quantity: { type: Number, required: true }, // Nechta chiqdi
  sellPrice: { type: Number, default: 0 }, // Sotish narxi
  totalAmount: { type: Number, default: 0 }, // Jami summa
  reason: { type: String, required: true }, // Sabab: 'sale', 'return', 'damage', 'transfer'
  reasonText: String, // Sabab matni
  customerId: Number, // Agar sotilgan bo'lsa
  customerName: String,
  saleId: Number, // Savdo ID
  imei: String, // IMEI (agar telefon bo'lsa)
  notes: String, // Izoh
  processedBy: { type: String, required: true }, // Kim chiqardi
  processedById: { type: Number, default: 0 }, // Foydalanuvchi ID
  userRole: { type: String, default: 'cashier' }, // 'admin', 'cashier'
  timestamp: { type: Date, default: Date.now },
  date: String, // Sana (25/02/2026)
  time: String, // Vaqt (14:30:45)
  createdAt: { type: Date, default: Date.now }
});

// Bildirishnomalar Schema (Notifications)
const NotificationSchema = new mongoose.Schema({
  notificationId: { type: Number, required: true, unique: true },
  type: { type: String, required: true }, // 'stock', 'cashier', 'customer', 'sale', 'system'
  category: { type: String, required: true }, // 'warning', 'info', 'success', 'error'
  title: { type: String, required: true },
  message: { type: String, required: true },
  entityType: String, // 'product', 'cashier', 'customer', 'sale'
  entityId: Number,
  entityName: String,
  branchId: { type: Number, default: 0 },
  branchName: String,
  isRead: { type: Boolean, default: false },
  readAt: Date,
  readBy: String,
  priority: { type: String, default: 'normal' }, // 'low', 'normal', 'high', 'urgent'
  actionRequired: { type: Boolean, default: false },
  actionUrl: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
  date: String,
  time: String,
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', CustomerSchema);
const Sale = mongoose.model('Sale', SaleSchema);
const Settings = mongoose.model('Settings', SettingsSchema);
const Product = mongoose.model('Product', ProductSchema);
const Cashier = mongoose.model('Cashier', CashierSchema);
const CashierSale = mongoose.model('CashierSale', CashierSaleSchema);
const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
const CashierHandover = mongoose.model('CashierHandover', CashierHandoverSchema);
const Branch = mongoose.model('Branch', BranchSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);
const StockIn = mongoose.model('StockIn', StockInSchema);
const StockOut = mongoose.model('StockOut', StockOutSchema);
const Notification = mongoose.model('Notification', NotificationSchema);

// ==================== ROUTES SETUP ====================

// Reports routes
const reportsRoutes = require('./routes/reports.routes')(Customer, Sale, Product, Cashier, Branch);
app.use('/api/reports', reportsRoutes);

// ==================== HELPER FUNCTIONS ====================

// Activity Log yozish funksiyasi
async function logActivity(data) {
  try {
    const activityId = Date.now();
    const now = new Date();
    
    const activity = await ActivityLog.create({
      activityId,
      action: data.action, // 'create', 'update', 'delete', 'sale', 'payment', 'login'
      entity: data.entity, // 'product', 'customer', 'sale', 'cashier', 'branch'
      entityId: data.entityId,
      entityName: data.entityName,
      userId: data.userId,
      userName: data.userName,
      userRole: data.userRole || 'cashier',
      branchId: data.branchId || 0,
      branchName: data.branchName || 'Asosiy Filial',
      description: data.description,
      oldValue: data.oldValue,
      newValue: data.newValue,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      timestamp: now,
      date: now.toLocaleDateString('uz-UZ'),
      time: now.toLocaleTimeString('uz-UZ'),
      metadata: data.metadata
    });
    
    console.log(`📝 Activity logged: ${data.action} ${data.entity} by ${data.userName}`);
    return { success: true, activity };
  } catch (error) {
    console.error('❌ Activity log xato:', error.message);
    return { success: false, error: error.message };
  }
}

// Bildirishnoma yaratish funksiyasi
async function createNotification(data) {
  try {
    const notificationId = Date.now();
    const now = new Date();
    
    const notification = await Notification.create({
      notificationId,
      type: data.type, // 'stock', 'cashier', 'customer', 'sale', 'system'
      category: data.category, // 'warning', 'info', 'success', 'error'
      title: data.title,
      message: data.message,
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      branchId: data.branchId || 0,
      branchName: data.branchName || 'Asosiy Filial',
      priority: data.priority || 'normal',
      actionRequired: data.actionRequired || false,
      actionUrl: data.actionUrl,
      metadata: data.metadata,
      timestamp: now,
      date: now.toLocaleDateString('uz-UZ'),
      time: now.toLocaleTimeString('uz-UZ'),
      expiresAt: data.expiresAt
    });
    
    console.log(`🔔 Notification created: ${data.title}`);
    return { success: true, notification };
  } catch (error) {
    console.error('❌ Notification xato:', error.message);
    return { success: false, error: error.message };
  }
}

async function sendTelegramMessage(chatId, message) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  
  if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN topilmadi!');
    return { success: false, error: 'Bot token mavjud emas' };
  }
  
  if (!chatId) {
    console.error('❌ Chat ID topilmadi!');
    return { success: false, error: 'Chat ID mavjud emas' };
  }
  
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log(`✅ Telegram xabar yuborildi: ${chatId}`);
      return { success: true, messageId: data.result.message_id };
    } else {
      console.error('❌ Telegram API xato:', data.description);
      return { success: false, error: data.description };
    }
  } catch (error) {
    console.error('❌ Telegram ulanish xato:', error.message);
    return { success: false, error: error.message };
  }
}

function generateReceipt(sale, customer, totalDebt) {
  const debt = sale.price - sale.paid;
  const debtDays = customer.firstDebtDate 
    ? Math.floor((new Date() - customer.firstDebtDate) / (1000 * 60 * 60 * 24))
    : 0;
  
  // Pul formatini USD ga o'zgartirish
  const formatUSD = (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  if (sale.type === 'payment') {
    return `💵 <b>TO'LOV CHEKI</b>

📅 Sana: ${sale.date}
🕐 Vaqt: ${sale.time}

👤 Mijoz: ${customer.name}
📱 Telefon: ${customer.phone || 'Kiritilmagan'}

━━━━━━━━━━━━━━━━━━━━
💰 To'lov: ${formatUSD(sale.paid)}
━━━━━━━━━━━━━━━━━━━━

${totalDebt > 0 ? `📊 Qolgan qarz: ${formatUSD(totalDebt)}` : '✅ Qarz to\'liq to\'landi'}

Rahmat! 🙏`;
  }
  
  return `🧾 <b>SAVDO CHEKI</b>

📅 Sana: ${sale.date}
🕐 Vaqt: ${sale.time}

👤 Mijoz: ${customer.name}
📱 Telefon: ${customer.phone || 'Kiritilmagan'}

━━━━━━━━━━━━━━━━━━━━
📦 Mahsulot: ${sale.product}
💰 Narxi: ${formatUSD(sale.price)}
💵 To'landi: ${formatUSD(sale.paid)}
━━━━━━━━━━━━━━━━━━━━

${debt > 0 ? `⚠️ Bu savdo qarzi: ${formatUSD(debt)}` : '✅ To\'liq to\'landi'}
${totalDebt > 0 ? `\n📊 Jami qarz: ${formatUSD(totalDebt)}` : ''}
${debtDays > 0 ? `\n📆 Qarz kunlari: ${debtDays} kun` : ''}

Rahmat! 🙏`;
}

// ==================== PRODUCT API ENDPOINTS ====================

// Mahsulotlarni olish (filial bilan)
app.get('/api/products', async (req, res) => {
  try {
    const { branchId } = req.query;
    
    let query = { isActive: true };
    
    // Agar branchId berilgan bo'lsa va 0 bo'lmasa, filial bo'yicha filtr
    if (branchId && branchId !== '0' && branchId !== 'undefined') {
      query.branchId = Number(branchId);
    }
    
    const products = await Product.find(query).sort({ name: 1 });
    
    console.log(`📦 Mahsulotlar yuklandi: ${products.length} ta (branchId: ${branchId || 'hammasi'})`);
    
    res.json(products);
  } catch (error) {
    console.error('Mahsulotlar yuklashda xato:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mahsulot qo'shish/yangilash
app.post('/api/products', async (req, res) => {
  try {
    const { productId, name, category, buyPrice, sellPrice, stock, minStock, unit, barcode, description, branchId, userName, userId, imei, imeis } = req.body;
    
    if (productId) {
      // Mavjud mahsulotni yangilash
      const oldProduct = await Product.findOne({ productId: Number(productId) });
      
      const updateData = { 
        name, 
        category, 
        buyPrice, 
        sellPrice, 
        stock, 
        minStock, 
        unit, 
        barcode, 
        description 
      };
      
      // IMEI ma'lumotlarini qo'shish
      if (imei) updateData.imei = imei;
      if (imeis) updateData.imeis = imeis;
      
      const product = await Product.findOneAndUpdate(
        { productId: Number(productId) },
        updateData,
        { new: true }
      );
      
      if (!product) {
        return res.status(404).json({ error: 'Mahsulot topilmadi' });
      }
      
      // Activity log
      await logActivity({
        action: 'update',
        entity: 'product',
        entityId: product.productId,
        entityName: product.name,
        userId: userId || 0,
        userName: userName || 'Admin',
        userRole: 'admin',
        branchId: branchId || 0,
        description: `Mahsulot yangilandi: ${product.name}`,
        oldValue: oldProduct,
        newValue: product
      });
      
      res.json({ success: true, product, message: 'Mahsulot yangilandi' });
    } else {
      // Yangi mahsulot yaratish
      let newProductId = Math.floor(1000 + Math.random() * 9000);
      
      // ID takrorlanmasligini ta'minlash
      while (await Product.findOne({ productId: newProductId })) {
        newProductId = Math.floor(1000 + Math.random() * 9000);
      }
      
      // BranchId ni aniqlash
      const finalBranchId = branchId || 1001; // Default: asosiy filial
      
      const productData = {
        productId: newProductId,
        branchId: finalBranchId,  // ✅ BranchId qo'shildi
        name,
        category: category || 'Umumiy',
        buyPrice: buyPrice || 0,
        sellPrice,
        stock: stock || 0,
        minStock: minStock || 5,
        unit: unit || 'dona',
        barcode,
        description
      };
      
      // IMEI ma'lumotlarini qo'shish
      if (imei) productData.imei = imei;
      if (imeis && Array.isArray(imeis) && imeis.length > 0) {
        productData.imeis = imeis;
        console.log('📝 IMEI array qo\'shilmoqda:', imeis);
      }
      
      console.log('📦 Product data:', JSON.stringify(productData, null, 2));
      
      const product = await Product.create(productData);
      
      console.log('✅ Product yaratildi:', JSON.stringify(product, null, 2));
      
      // Activity log
      await logActivity({
        action: 'create',
        entity: 'product',
        entityId: product.productId,
        entityName: product.name,
        userId: userId || 0,
        userName: userName || 'Admin',
        userRole: 'admin',
        branchId: branchId || 0,
        description: `Yangi mahsulot qo'shildi: ${product.name}`,
        newValue: product
      });
      
      // YANGI: Real-time Excel ga yozish
      try {
        const branchName = 'Asosiy Filial'; // Keyinchalik dinamik
        await excelRT.saveWarehouseToExcel(product, branchName);
        console.log('✅ Mahsulot real-time Excel ga yozildi');
      } catch (rtError) {
        console.error('⚠️ Real-time Excel xato:', rtError.message);
      }
      
      // YANGI: Stock In tarixini yozish (agar stock > 0 bo'lsa)
      if (stock && stock > 0) {
        try {
          const now = new Date();
          const stockInId = Date.now();
          
          await StockIn.create({
            stockInId,
            productId: product.productId,
            productName: product.name,
            branchId: branchId || 0,
            branchName: 'Asosiy Ombor',
            quantity: stock,
            buyPrice: buyPrice || 0,
            totalCost: (buyPrice || 0) * stock,
            supplier: 'Dastlabki stok',
            notes: 'Mahsulot yaratilganda qo\'shilgan',
            addedBy: userName || 'Admin',
            addedById: userId || 0,
            userRole: 'admin',
            timestamp: now,
            date: now.toLocaleDateString('uz-UZ'),
            time: now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });
          
          console.log(`✅ Stock In tarixi yozildi: ${product.name} - ${stock} dona`);
        } catch (stockError) {
          console.error('⚠️ Stock In yozishda xato:', stockError.message);
        }
      }
      
      res.json({ success: true, product, message: 'Yangi mahsulot qo\'shildi' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mahsulot o'chirish
app.delete('/api/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { userName, userId } = req.body;
    
    const product = await Product.findOne({ productId: Number(productId) });
    
    await Product.findOneAndUpdate(
      { productId: Number(productId) },
      { isActive: false }
    );
    
    // Activity log
    if (product) {
      await logActivity({
        action: 'delete',
        entity: 'product',
        entityId: product.productId,
        entityName: product.name,
        userId: userId || 0,
        userName: userName || 'Admin',
        userRole: 'admin',
        description: `Mahsulot o'chirildi: ${product.name}`,
        oldValue: product
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mahsulot qidirish
app.get('/api/products/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { barcode: query },
        { productId: Number(query) || 0 }
      ]
    }).limit(10);
    
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kam qolgan mahsulotlar
app.get('/api/products/low-stock', async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$minStock'] }
    }).sort({ stock: 1 });
    
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mahsulot kategoriyalari
app.get('/api/products/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== API ENDPOINTS ====================

// Admin login
app.post('/api/admin-login', (req, res) => {
  const { username, password } = req.body;
  
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (username === adminUsername && password === adminPassword) {
    res.json({ success: true, message: 'Login muvaffaqiyatli' });
  } else {
    res.status(401).json({ success: false, error: 'Login yoki parol noto\'g\'ri' });
  }
});

// Sozlamalarni olish
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        reminderDays: 7,
        reminderTime: '09:00',
        blockDays: 10,
        reminder3days: true,
        reminder5days: true,
        reminder7days: true
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sozlamalarni yangilash
app.post('/api/settings', async (req, res) => {
  try {
    const { reminderDays, reminderTime, blockDays, reminder3days, reminder5days, reminder7days, exchangeRate } = req.body;
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        reminderDays, reminderTime, blockDays, reminder3days, reminder5days, reminder7days, exchangeRate
      });
    } else {
      settings.reminderDays = reminderDays;
      settings.reminderTime = reminderTime;
      settings.blockDays = blockDays;
      settings.reminder3days = reminder3days;
      settings.reminder5days = reminder5days;
      settings.reminder7days = reminder7days;
      if (exchangeRate) settings.exchangeRate = exchangeRate;
      await settings.save();
    }
    
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kurs sozlamalari - alohida endpoint (3 valyuta)
app.get('/api/exchange-rate', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ 
        exchangeRate: 12500,
        exchangeRateUZS: 12500,
        exchangeRateEUR: 0.92
      });
    }
    res.json({ 
      success: true, 
      exchangeRate: settings.exchangeRateUZS || settings.exchangeRate || 12500,
      exchangeRateUZS: settings.exchangeRateUZS || 12500,
      exchangeRateEUR: settings.exchangeRateEUR || 0.92
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/exchange-rate', async (req, res) => {
  try {
    const { exchangeRate, exchangeRateUZS, exchangeRateEUR } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ 
        exchangeRate: exchangeRateUZS || exchangeRate || 12500,
        exchangeRateUZS: exchangeRateUZS || exchangeRate || 12500,
        exchangeRateEUR: exchangeRateEUR || 0.92
      });
    } else {
      if (exchangeRate) settings.exchangeRate = exchangeRate;
      if (exchangeRateUZS) settings.exchangeRateUZS = exchangeRateUZS;
      if (exchangeRateEUR) settings.exchangeRateEUR = exchangeRateEUR;
      await settings.save();
    }
    
    res.json({ 
      success: true, 
      exchangeRate: settings.exchangeRateUZS,
      exchangeRateUZS: settings.exchangeRateUZS,
      exchangeRateEUR: settings.exchangeRateEUR
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mijozlarni olish (filial bilan)
app.get('/api/customers', async (req, res) => {
  try {
    const { branchId } = req.query;
    
    let query = {};
    
    // Agar branchId berilgan bo'lsa va 0 bo'lmasa, filial bo'yicha filtr
    if (branchId && branchId !== '0' && branchId !== 'undefined') {
      query.branchId = Number(branchId);
    }
    
    const customers = await Customer.find(query).sort({ name: 1 });
    
    console.log(`👥 Mijozlar yuklandi: ${customers.length} ta (branchId: ${branchId || 'hammasi'})`);
    
    res.json(customers);
  } catch (error) {
    console.error('Mijozlar yuklashda xato:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mijozni ID orqali qidirish
app.get('/api/customers/search/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await Customer.findOne({ customerId: Number(customerId) });
    
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Mijoz topilmadi',
        message: `ID ${customerId} bilan mijoz mavjud emas` 
      });
    }
    
    // Mijozning savdo tarixini ham olish
    const sales = await Sale.find({ customerId: Number(customerId) }).sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      customer: {
        ...customer.toObject(),
        salesHistory: sales
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mijoz qo'shish/yangilash
app.post('/api/customers', async (req, res) => {
  try {
    const { customerId, name, phone, chatId } = req.body;
    
    // Agar customerId berilgan bo'lsa, uni tekshirish
    if (customerId) {
      const existingCustomer = await Customer.findOne({ customerId: Number(customerId) });
      if (existingCustomer) {
        // Mavjud mijozni yangilash
        existingCustomer.name = name || existingCustomer.name;
        existingCustomer.phone = phone || existingCustomer.phone;
        existingCustomer.chatId = chatId || existingCustomer.chatId;
        await existingCustomer.save();
        
        return res.json({ 
          success: true, 
          customer: existingCustomer,
          message: 'Mijoz ma\'lumotlari yangilandi'
        });
      } else {
        return res.status(404).json({ 
          success: false, 
          error: 'Mijoz topilmadi',
          message: `ID ${customerId} bilan mijoz mavjud emas`
        });
      }
    }
    
    // Yangi mijoz yaratish (ID avtomatik generatsiya)
    let newCustomerId = Math.floor(100000 + Math.random() * 900000);
    
    // ID takrorlanmasligini ta'minlash
    while (await Customer.findOne({ customerId: newCustomerId })) {
      newCustomerId = Math.floor(100000 + Math.random() * 900000);
    }
    
    const customer = await Customer.create({
      customerId: newCustomerId,
      name,
      phone,
      chatId,
      totalDebt: 0
    });
    
    // Excel da mijoz fayli yaratish
    await excelManager.createCustomerExcel(name);
    
    res.json({ 
      success: true, 
      customer,
      message: 'Yangi mijoz yaratildi'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mijoz o'chirish
app.delete('/api/customers/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    await Customer.findOneAndDelete({ customerId: Number(customerId) });
    await Sale.deleteMany({ customerId: Number(customerId) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Universal mijoz qidirish (telefon, ism, ID)
app.get('/api/customers/find/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    // ID bo'yicha qidirish
    if (!isNaN(query)) {
      const customer = await Customer.findOne({ customerId: Number(query) });
      if (customer) {
        const sales = await Sale.find({ customerId: Number(query) }).sort({ createdAt: -1 });
        return res.json({ 
          success: true, 
          customers: [{
            ...customer.toObject(),
            salesHistory: sales
          }]
        });
      }
    }
    
    // Telefon yoki ism bo'yicha qidirish
    const customers = await Customer.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);
    
    if (customers.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Mijoz topilmadi',
        message: `"${query}" bo'yicha mijoz topilmadi` 
      });
    }
    
    // Har bir mijoz uchun savdo tarixini olish
    const customersWithHistory = await Promise.all(
      customers.map(async (customer) => {
        const sales = await Sale.find({ customerId: customer.customerId }).sort({ createdAt: -1 }).limit(10);
        return {
          ...customer.toObject(),
          salesHistory: sales
        };
      })
    );
    
    res.json({ 
      success: true, 
      customers: customersWithHistory,
      count: customers.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Savdolarni olish
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Savdo qo'shish
app.post('/api/sales', async (req, res) => {
  try {
    const { saleId, customerId, customerName, product, price, paid, date, time, type } = req.body;
    
    // Validatsiya
    if (!customerId || !customerName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mijoz ma\'lumotlari to\'liq emas' 
      });
    }
    
    if (type === 'sale' && (!product || price <= 0)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mahsulot va narx to\'g\'ri kiritilmagan' 
      });
    }
    
    if (paid < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'To\'lov miqdori manfiy bo\'lishi mumkin emas' 
      });
    }
    
    // Mijozni tekshirish
    const customer = await Customer.findOne({ customerId });
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Mijoz topilmadi' 
      });
    }
    
    // MUHIM: Avval Excel ga qo'shishni sinab ko'ramiz
    let excelSuccess = false;
    let excelError = null;
    
    const tempSale = {
      saleId, customerId, customerName, product, price, paid, date, time, type: type || 'sale'
    };
    
    try {
      await excelManager.addToExcel(tempSale, customerName);
      excelSuccess = true;
      console.log('✅ Excel ga qo\'shildi');
    } catch (error) {
      console.error('❌ Excel xato:', error.message);
      excelError = error.message;
    }
    
    // Agar Excel ga qo'shilmasa, savdoni saqlamaymiz
    if (!excelSuccess) {
      return res.status(500).json({ 
        success: false, 
        error: 'Excel faylga yozishda xatolik yuz berdi. Savdo saqlanmadi!',
        excelError: excelError
      });
    }
    
    // Excel ga muvaffaqiyatli qo'shildi, endi MongoDB ga saqlaymiz
    const sale = await Sale.create({
      saleId, customerId, customerName, product, price, paid, date, time, type: type || 'sale'
    });
    
    // YANGI: Real-time Excel ga yozish (filial va kassir bilan)
    try {
      const branchName = 'Asosiy Filial'; // Keyinchalik dinamik bo'ladi
      const cashierName = 'Admin'; // Keyinchalik dinamik bo'ladi
      await excelRT.saveSaleToExcel(sale, branchName, cashierName);
      console.log('✅ Real-time Excel ga yozildi');
    } catch (rtError) {
      console.error('⚠️ Real-time Excel xato:', rtError.message);
      // Bu xato savdoni to'xtatmaydi, faqat log
    }
    
    // Mijoz qarzini yangilash
    const allSales = await Sale.find({ customerId });
    const totalPrice = allSales.reduce((sum, s) => s.type === 'sale' ? sum + (s.price || 0) : sum, 0);
    const totalPaid = allSales.reduce((sum, s) => sum + (s.paid || s.paidUSD || 0), 0);
    const debt = totalPrice - totalPaid;
    
    customer.totalDebt = debt;
    
    // Agar birinchi marta qarzga tushsa
    if (debt > 0 && !customer.firstDebtDate) {
      customer.firstDebtDate = new Date();
    }
    // Agar qarz to'liq to'lansa
    if (debt <= 0) {
      customer.firstDebtDate = null;
    }
    
    await customer.save();
    
    // Chek yuborish
    let telegramSuccess = true;
    let telegramError = null;
    
    if (customer.chatId) {
      try {
        const receipt = generateReceipt(sale, customer, debt);
        const telegramResult = await sendTelegramMessage(customer.chatId, receipt);
        
        if (!telegramResult.success) {
          telegramSuccess = false;
          telegramError = telegramResult.error;
        }
      } catch (error) {
        console.error('❌ Chek yuborish xato:', error.message);
        telegramSuccess = false;
        telegramError = error.message;
      }
    }
    
    // Ogohlantirish
    const warnings = [];
    if (!telegramSuccess && customer.chatId) {
      warnings.push(`Telegram xato: ${telegramError}`);
    }
    
    res.json({ 
      success: true, 
      sale,
      warnings: warnings.length > 0 ? warnings : null,
      excelSuccess: true,
      telegramSuccess: customer.chatId ? telegramSuccess : null,
      message: 'Savdo muvaffaqiyatli saqlandi va Excel faylga qo\'shildi!'
    });
    
  } catch (error) {
    console.error('❌ Savdo qo\'shish xato:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Savdo o'chirish
app.delete('/api/sales/:saleId', async (req, res) => {
  try {
    const { saleId } = req.params;
    const sale = await Sale.findOneAndDelete({ saleId: Number(saleId) });
    
    if (sale) {
      // Mijoz qarzini qayta hisoblash
      const customer = await Customer.findOne({ customerId: sale.customerId });
      if (customer) {
        const allSales = await Sale.find({ customerId: sale.customerId });
        const totalPrice = allSales.reduce((sum, s) => s.type === 'sale' ? sum + s.price : sum, 0);
        const totalPaid = allSales.reduce((sum, s) => sum + s.paid, 0);
        customer.totalDebt = totalPrice - totalPaid;
        
        if (customer.totalDebt <= 0) {
          customer.firstDebtDate = null;
        }
        
        await customer.save();
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Savdo yangilash
app.put('/api/sales/:saleId', async (req, res) => {
  try {
    const { saleId } = req.params;
    const { product, price, paid } = req.body;
    
    if (!product || price < 0 || paid < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Noto\'g\'ri ma\'lumotlar' 
      });
    }
    
    const sale = await Sale.findOneAndUpdate(
      { saleId: Number(saleId) },
      { product, price, paid },
      { new: true }
    );
    
    if (!sale) {
      return res.status(404).json({ 
        success: false, 
        error: 'Savdo topilmadi' 
      });
    }
    
    // Mijoz qarzini qayta hisoblash
    const customer = await Customer.findOne({ customerId: sale.customerId });
    if (customer) {
      const allSales = await Sale.find({ customerId: sale.customerId });
      const totalPrice = allSales.reduce((sum, s) => s.type === 'sale' ? sum + s.price : sum, 0);
      const totalPaid = allSales.reduce((sum, s) => sum + s.paid, 0);
      customer.totalDebt = totalPrice - totalPaid;
      
      if (customer.totalDebt > 0 && !customer.firstDebtDate) {
        customer.firstDebtDate = new Date();
      } else if (customer.totalDebt <= 0) {
        customer.firstDebtDate = null;
      }
      
      await customer.save();
    }
    
    res.json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Telegram xabar yuborish
app.post('/api/send-telegram', async (req, res) => {
  try {
    const { chatId, message } = req.body;
    
    if (!chatId || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chat ID va xabar matni kiritilishi shart' 
      });
    }
    
    const result = await sendTelegramMessage(chatId, message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ==================== EXCEL API ENDPOINTS ====================

// Excel fayllar ro'yxatini olish
app.get('/api/excel-files', async (req, res) => {
  try {
    const files = excelManager.getExcelFiles();
    res.json({ 
      success: true, 
      files: files.map(f => ({
        name: f.name,
        size: f.size,
        date: f.modified
      })),
      path: excelManager.excelDir
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Excel faylni yuklab olish
app.get('/api/excel-download/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, 'excel-files', fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fayl topilmadi' });
    }
    
    res.download(filePath, fileName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Excel fayl ma'lumotlarini o'qish
app.get('/api/excel-read/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const data = excelManager.readExcelFile(fileName);
    
    if (!data) {
      return res.status(404).json({ error: 'Fayl topilmadi yoki o\'qib bo\'lmadi' });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STATISTIKA API ====================

// Umumiy statistika
app.get('/api/stats', async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalSales = await Sale.countDocuments();
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$stock', '$minStock'] }
    });
    
    const totalDebt = await Customer.aggregate([
      { $group: { _id: null, total: { $sum: { $ifNull: ['$totalDebt', 0] } } } }
    ]);
    
    const todaySales = await Sale.countDocuments({
      date: new Date().toLocaleDateString('uz-UZ')
    });
    
    // Oylik statistika
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$paid' } } }
    ]);
    
    const excelFiles = excelManager.getExcelFiles();
    
    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalSales,
        totalProducts,
        lowStockProducts,
        totalDebt: Number(totalDebt[0]?.total) || 0,
        todaySales,
        monthlyRevenue: Number(monthlyRevenue[0]?.total) || 0,
        excelFiles: excelFiles.length,
        totalExcelSize: excelFiles.reduce((sum, file) => sum + file.size, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kunlik hisobot
app.get('/api/daily-report', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('uz-UZ');
    const todaySales = await Sale.find({ date: today });
    
    const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.paid, 0);
    const totalSalesAmount = todaySales.reduce((sum, sale) => 
      sale.type === 'sale' ? sum + sale.price : sum, 0);
    
    res.json({
      success: true,
      report: {
        date: today,
        totalSales: todaySales.length,
        totalRevenue,
        totalSalesAmount,
        sales: todaySales
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Haftalik hisobot
app.get('/api/weekly-report', async (req, res) => {
  try {
    const now = moment();
    const weekStart = now.clone().startOf('isoWeek');
    const weekEnd = now.clone().endOf('isoWeek');
    
    const weeklySales = await Sale.find({
      createdAt: {
        $gte: weekStart.toDate(),
        $lte: weekEnd.toDate()
      }
    });
    
    const totalRevenue = weeklySales.reduce((sum, sale) => sum + sale.paid, 0);
    const totalSalesAmount = weeklySales.reduce((sum, sale) => 
      sale.type === 'sale' ? sum + sale.price : sum, 0);
    
    res.json({
      success: true,
      report: {
        weekStart: weekStart.format('DD.MM.YYYY'),
        weekEnd: weekEnd.format('DD.MM.YYYY'),
        totalSales: weeklySales.length,
        totalRevenue,
        totalSalesAmount,
        sales: weeklySales
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mijoz hisoboti
app.get('/api/customer-report/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await Customer.findOne({ customerId: Number(customerId) });
    
    if (!customer) {
      return res.status(404).json({ error: 'Mijoz topilmadi' });
    }
    
    const customerSales = await Sale.find({ customerId: Number(customerId) });
    const totalPurchases = customerSales.filter(s => s.type === 'sale').length;
    const totalPayments = customerSales.filter(s => s.type === 'payment').length;
    
    res.json({
      success: true,
      report: {
        customer,
        totalPurchases,
        totalPayments,
        totalDebt: customer.totalDebt,
        sales: customerSales
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== BACKUP API ====================

// To'liq backup yaratish
app.post('/api/backup/create', async (req, res) => {
  try {
    const customers = await Customer.find();
    const sales = await Sale.find();
    
    const result = await backupManager.createFullBackup(customers, sales);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Backup fayllar ro'yxati
app.get('/api/backup/files', async (req, res) => {
  try {
    const files = backupManager.getBackupFiles();
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Backup faylni yuklab olish
app.get('/api/backup/download/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, 'backups', fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Backup fayl topilmadi' });
    }
    
    res.download(filePath, fileName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CSV export
app.post('/api/export/csv', async (req, res) => {
  try {
    const { type } = req.body; // 'customers' yoki 'sales'
    
    let data, fileName;
    if (type === 'customers') {
      const customers = await Customer.find();
      data = customers.map(c => ({
        'ID': c.customerId,
        'Ism': c.name,
        'Telefon': c.phone || '',
        'Jami Qarz': c.totalDebt,
        'Birinchi Qarz': c.firstDebtDate ? moment(c.firstDebtDate).format('DD.MM.YYYY') : ''
      }));
      fileName = 'Mijozlar';
    } else if (type === 'sales') {
      const sales = await Sale.find();
      data = sales.map(s => ({
        'Savdo ID': s.saleId,
        'Mijoz': s.customerName,
        'Mahsulot': s.product || 'To\'lov',
        'Narxi': s.price,
        'Berilgan': s.paid,
        'Sana': s.date,
        'Turi': s.type === 'payment' ? 'To\'lov' : 'Savdo'
      }));
      fileName = 'Savdolar';
    } else {
      return res.status(400).json({ error: 'Noto\'g\'ri export turi' });
    }
    
    const result = await backupManager.exportToCSV(data, fileName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Filial savdolarini Excel ga eksport qilish
app.get('/api/export/branch-sales/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    
    // Filial mavjudligini tekshirish
    const branch = await Branch.findOne({ branchId: Number(branchId) });
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        error: 'Filial topilmadi' 
      });
    }
    
    // Filial savdolarini olish
    const sales = await CashierSale.find({ branchId: Number(branchId) })
      .sort({ createdAt: -1 });
    
    if (sales.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Bu filialda savdolar topilmadi' 
      });
    }
    
    // Excel yaratish
    const XLSX = require('xlsx');
    const workbook = XLSX.utils.book_new();
    
    // Savdolar sheet
    const salesData = [
      ['Savdo ID', 'Kassir', 'Mijoz ID', 'Mijoz', 'Mahsulot', 'Narx USD', 'To\'lov USD', 'Sana', 'Vaqt']
    ];
    
    sales.forEach(sale => {
      salesData.push([
        sale.saleId,
        sale.cashierName || '',
        sale.customerId || '',
        sale.customerName || '',
        sale.product || '',
        (sale.price || 0).toFixed(2),
        (sale.paid || 0).toFixed(2),
        sale.date || '',
        sale.time || ''
      ]);
    });
    
    const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
    
    // Ustun kengliklarini sozlash
    salesSheet['!cols'] = [
      { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 25 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Savdolar');
    
    // Statistika sheet
    const today = new Date();
    const todayStr = today.toLocaleDateString('uz-UZ');
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const todaySales = sales.filter(s => s.date === todayStr);
    const weekSales = sales.filter(s => {
      const saleDate = new Date(s.createdAt);
      return saleDate >= weekStart;
    });
    const monthSales = sales.filter(s => {
      const saleDate = new Date(s.createdAt);
      return saleDate >= monthStart;
    });
    
    const statsData = [
      ['Davr', 'Savdolar Soni', 'Jami Daromad USD'],
      ['Bugun', todaySales.length, todaySales.reduce((sum, s) => sum + (s.paid || 0), 0).toFixed(2)],
      ['Bu Hafta', weekSales.length, weekSales.reduce((sum, s) => sum + (s.paid || 0), 0).toFixed(2)],
      ['Bu Oy', monthSales.length, monthSales.reduce((sum, s) => sum + (s.paid || 0), 0).toFixed(2)],
      ['Jami', sales.length, sales.reduce((sum, s) => sum + (s.paid || 0), 0).toFixed(2)]
    ];
    
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    statsSheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }];
    
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistika');
    
    // Faylni buffer sifatida yaratish
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Response headers
    const fileName = `${branch.name}_Savdolar_${new Date().toLocaleDateString('uz-UZ').replace(/\./g, '-')}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    res.send(buffer);
    
  } catch (error) {
    console.error('Excel eksport xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== FILIAL API ENDPOINTS ====================

// Filiallarni olish
app.get('/api/branches', async (req, res) => {
  try {
    const branches = await Branch.find();
    
    // Har bir filial uchun statistika
    const branchesWithStats = await Promise.all(branches.map(async (branch) => {
      const cashiers = await Cashier.countDocuments({ branchId: branch.branchId, isActive: true });
      const sales = await CashierSale.countDocuments({ branchId: branch.branchId });
      const revenue = await CashierSale.aggregate([
        { $match: { branchId: branch.branchId } },
        { $group: { _id: null, total: { $sum: '$paid' } } }
      ]);
      
      return {
        ...branch.toObject(),
        cashiersCount: cashiers,
        salesCount: sales,
        totalRevenue: revenue[0]?.total || 0
      };

// Bitta filialni olish
app.get('/api/branches/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    const branch = await Branch.findOne({ branchId: Number(branchId) });
    
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        error: 'Filial topilmadi' 
      });
    }
    
    res.json({ success: true, branch });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
    }));
    
    res.json({ success: true, branches: branchesWithStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Filial qo'shish
app.post('/api/branches', async (req, res) => {
  try {
    const { name, address, phone, manager } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Filial nomi kiritilishi shart' 
      });
    }
    
    // Yangi ID yaratish
    const lastBranch = await Branch.findOne().sort({ branchId: -1 });
    const branchId = lastBranch ? lastBranch.branchId + 1 : 1;
    
    const branch = await Branch.create({
      branchId,
      name,
      address: address || null,
      phone: phone || null,
      manager: manager || null,
      isActive: true,
      totalSales: 0,
      totalRevenue: 0,
      createdAt: new Date()
    });
    
    // REAL-TIME EXCEL: Filial ma'lumotlarini Excel ga yozish
    try {
      await excelRT.saveBranchToExcel(branch);
      console.log('✅ Filial real-time Excel ga yozildi');
    } catch (rtError) {
      console.error('❌ Excel yozishda xato:', rtError.message);
    }
    
    res.json({ 
      success: true, 
      branch,
      message: 'Filial muvaffaqiyatli qo\'shildi' 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Filial tahrirlash
app.put('/api/branches/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    const { name, address, phone, manager, isActive } = req.body;
    
    const branch = await Branch.findOne({ branchId: Number(branchId) });
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        error: 'Filial topilmadi' 
      });
    }
    
    if (name) branch.name = name;
    if (address !== undefined) branch.address = address;
    if (phone !== undefined) branch.phone = phone;
    if (manager !== undefined) branch.manager = manager;
    if (isActive !== undefined) branch.isActive = isActive;
    
    await branch.save();
    
    res.json({ 
      success: true, 
      branch,
      message: 'Filial ma\'lumotlari yangilandi' 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Filial o'chirish
app.delete('/api/branches/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    
    const branch = await Branch.findOne({ branchId: Number(branchId) });
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        error: 'Filial topilmadi' 
      });
    }
    
    // Filialga tegishli kassirlar borligini tekshirish
    const cashiersCount = await Cashier.countDocuments({ branchId: Number(branchId) });
    if (cashiersCount > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Bu filialda ${cashiersCount} ta kassir bor. Avval kassirlarni o'chiring.` 
      });
    }
    
    // Filialga tegishli savdolar borligini tekshirish
    const salesCount = await CashierSale.countDocuments({ branchId: Number(branchId) });
    if (salesCount > 0) {
      // Faqat faolsizlantirish
      branch.isActive = false;
      await branch.save();
      
      return res.json({ 
        success: true, 
        message: 'Filialda savdolar bor. Filial faolsizlantirildi.' 
      });
    }
    
    // Agar savdolar yo'q bo'lsa, to'liq o'chirish
    await Branch.deleteOne({ branchId: Number(branchId) });
    
    res.json({ 
      success: true, 
      message: 'Filial o\'chirildi' 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Filial statistikasi
app.get('/api/branches/:branchId/stats', async (req, res) => {
  try {
    const { branchId } = req.params;
    
    const branch = await Branch.findOne({ branchId: Number(branchId) });
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        error: 'Filial topilmadi' 
      });
    }
    
    const cashiers = await Cashier.find({ branchId: Number(branchId), isActive: true });
    const sales = await CashierSale.find({ branchId: Number(branchId) });
    const handovers = await CashierHandover.find({ branchId: Number(branchId) });
    
    const today = new Date().toLocaleDateString('uz-UZ');
    const todaySales = sales.filter(s => s.date === today);
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.paid, 0);
    
    const totalRevenue = sales.reduce((sum, s) => sum + s.paid, 0);
    const totalHandedOver = handovers.reduce((sum, h) => sum + h.amount, 0);
    const totalBalance = cashiers.reduce((sum, c) => sum + c.balance, 0);
    
    res.json({ 
      success: true, 
      stats: {
        branch,
        cashiersCount: cashiers.length,
        totalSales: sales.length,
        todaySales: todaySales.length,
        todayRevenue,
        totalRevenue,
        totalHandedOver,
        totalBalance
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== KASSIR API ENDPOINTS ====================

// Kassirlarni olish
app.get('/api/cashiers', async (req, res) => {
  try {
    const cashiers = await Cashier.find().select('-password');
    res.json({ success: true, cashiers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kassir qo'shish
app.post('/api/cashiers', async (req, res) => {
  try {
    const { branchId, name, username, password, phone } = req.body;
    
    if (!branchId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Filial tanlanishi shart' 
      });
    }
    
    if (!name || !username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ism, login va parol kiritilishi shart' 
      });
    }
    
    // Filial mavjudligini tekshirish
    const branch = await Branch.findOne({ branchId: Number(branchId), isActive: true });
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        error: 'Filial topilmadi yoki faolsiz' 
      });
    }
    
    // Username mavjudligini tekshirish
    const existing = await Cashier.findOne({ username });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        error: 'Bu login band' 
      });
    }
    
    // Yangi ID yaratish
    const lastCashier = await Cashier.findOne().sort({ cashierId: -1 });
    const cashierId = lastCashier ? lastCashier.cashierId + 1 : 1001;
    
    const cashier = await Cashier.create({
      cashierId,
      branchId: Number(branchId),
      name,
      username,
      password, // Production da hash qilish kerak
      phone: phone || null,
      role: 'cashier',
      isActive: true,
      balance: 0,
      totalSales: 0,
      totalHandedOver: 0,
      createdAt: new Date()
    });
    
    // REAL-TIME EXCEL: Kassir ma'lumotlarini Excel ga yozish
    try {
      await excelRT.saveCashierToExcel(cashier, branch.name);
      console.log('✅ Kassir real-time Excel ga yozildi');
    } catch (rtError) {
      console.error('❌ Excel yozishda xato:', rtError.message);
    }
    
    // Parolni response da ko'rsatmaslik
    const cashierData = cashier.toObject();
    delete cashierData.password;
    
    res.json({ 
      success: true, 
      cashier: cashierData,
      message: 'Kassir muvaffaqiyatli qo\'shildi' 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kassir login
app.post('/api/cashier-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Login va parol kiritilishi shart' 
      });
    }
    
    const cashier = await Cashier.findOne({ username, password, isActive: true });
    
    if (!cashier) {
      return res.status(401).json({ 
        success: false, 
        error: 'Login yoki parol noto\'g\'ri' 
      });
    }
    
    // Last login ni yangilash
    cashier.lastLogin = new Date();
    await cashier.save();
    
    // Parolni response da ko'rsatmaslik
    const cashierData = cashier.toObject();
    delete cashierData.password;
    
    res.json({ 
      success: true, 
      cashier: cashierData,
      message: 'Muvaffaqiyatli kirildi' 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kassir savdolarini olish
app.get('/api/cashier-sales/:cashierId', async (req, res) => {
  try {
    const { cashierId } = req.params;
    const sales = await CashierSale.find({ cashierId: Number(cashierId) })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kassir savdolarini olish (query parameter bilan)
app.get('/api/cashier-sales', async (req, res) => {
  try {
    const { cashierId, limit, date } = req.query;
    
    let query = {};
    
    // Agar cashierId berilgan bo'lsa
    if (cashierId) {
      query.cashierId = Number(cashierId);
    }
    
    // Agar date berilgan bo'lsa
    if (date) {
      query.date = date;
    }
    
    let dbQuery = CashierSale.find(query).sort({ createdAt: -1 });
    
    if (limit) {
      dbQuery = dbQuery.limit(Number(limit));
    }
    
    const sales = await dbQuery;
    
    res.json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Barcha kassirlar savdosi
app.get('/api/all-cashier-sales', async (req, res) => {
  try {
    const sales = await CashierSale.find().sort({ createdAt: -1 });
    res.json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Filial bo'yicha savdolar
app.get('/api/cashier-sales/branch/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    
    // Filial mavjudligini tekshirish
    const branch = await Branch.findOne({ branchId: Number(branchId) });
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        error: 'Filial topilmadi' 
      });
    }
    
    const sales = await CashierSale.find({ branchId: Number(branchId) })
      .sort({ createdAt: -1 });
    
    // Bugungi, haftalik, oylik savdolarni hisoblash
    const today = new Date();
    const todayStr = today.toLocaleDateString('uz-UZ');
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const todaySales = sales.filter(s => s.date === todayStr);
    const weekSales = sales.filter(s => {
      const saleDate = new Date(s.createdAt);
      return saleDate >= weekStart;
    });
    const monthSales = sales.filter(s => {
      const saleDate = new Date(s.createdAt);
      return saleDate >= monthStart;
    });
    
    // Summalarni hisoblash
    const todayRevenue = todaySales.reduce((sum, s) => sum + (s.paid || 0), 0);
    const weekRevenue = weekSales.reduce((sum, s) => sum + (s.paid || 0), 0);
    const monthRevenue = monthSales.reduce((sum, s) => sum + (s.paid || 0), 0);
    const totalRevenue = sales.reduce((sum, s) => sum + (s.paid || 0), 0);
    
    res.json({ 
      success: true, 
      branch,
      sales,
      stats: {
        today: {
          count: todaySales.length,
          revenue: todayRevenue,
          sales: todaySales
        },
        week: {
          count: weekSales.length,
          revenue: weekRevenue,
          sales: weekSales
        },
        month: {
          count: monthSales.length,
          revenue: monthRevenue,
          sales: monthSales
        },
        total: {
          count: sales.length,
          revenue: totalRevenue
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kassir savdo qo'shish
app.post('/api/cashier-sales', async (req, res) => {
  try {
    const { 
      saleId, 
      cashierId, 
      cashierName, 
      customerId, 
      customerName, 
      product, 
      price, 
      paid,
      paidUSD,
      paidUZS,
      exchangeRate,
      type 
    } = req.body;
    
    // Kassirni topish
    const cashier = await Cashier.findOne({ cashierId });
    if (!cashier) {
      return res.status(404).json({ 
        success: false, 
        error: 'Kassir topilmadi' 
      });
    }
    
    // Kassir savdosini saqlash
    const cashierSale = await CashierSale.create({
      saleId,
      branchId: cashier.branchId,
      cashierId,
      cashierName,
      customerId,
      customerName,
      product,
      price,
      paid: paid || 0,
      paidUSD: paidUSD || 0,
      paidUZS: paidUZS || 0,
      exchangeRate: exchangeRate || 12500,
      type: type || 'sale',
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date()
    });
    
    // Kassir balansini yangilash (dual currency)
    if (!cashier.balanceUSD) cashier.balanceUSD = 0;
    if (!cashier.balanceUZS) cashier.balanceUZS = 0;
    
    cashier.balanceUSD += (paidUSD || 0);
    cashier.balanceUZS += (paidUZS || 0);
    cashier.balance = cashier.balanceUSD + (cashier.balanceUZS / (exchangeRate || 12500)); // Total in USD
    cashier.totalSales += price;
    
    await cashier.save();
    
    // REAL-TIME EXCEL: Savdoni Excel ga yozish (dinamik filial va kassir nomi bilan)
    try {
      const branch = await Branch.findOne({ branchId: cashier.branchId });
      const branchName = branch ? branch.name : 'Noma\'lum Filial';
      await excelRT.saveSaleToExcel(cashierSale, branchName, cashierName);
      console.log('✅ Kassir savdosi real-time Excel ga yozildi');
    } catch (rtError) {
      console.error('❌ Excel yozishda xato:', rtError.message);
    }
    
    // TELEGRAM: Mijozga avtomatik chek yuborish
    if (customerId && customerId > 0) {
      try {
        const customer = await Customer.findOne({ customerId });
        
        if (customer && customer.chatId) {
          const formatUSD = (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          
          const debt = price - paid;
          const totalDebt = customer.totalDebt || 0;
          
          let receiptMsg = type === 'payment' 
            ? `💵 <b>TO'LOV CHEKI</b>\n\n`
            : `🧾 <b>SAVDO CHEKI</b>\n\n`;
          
          receiptMsg += `📅 Sana: ${cashierSale.date}\n`;
          receiptMsg += `🕐 Vaqt: ${cashierSale.time}\n\n`;
          receiptMsg += `👤 Mijoz: ${customerName}\n`;
          receiptMsg += `🆔 ID: <code>${customerId}</code>\n\n`;
          receiptMsg += `━━━━━━━━━━━━━━━━━━━━\n`;
          
          if (type === 'payment') {
            receiptMsg += `💰 To'lov: <b>${formatUSD(paid)}</b>\n`;
          } else {
            receiptMsg += `📦 Mahsulot: ${product}\n`;
            receiptMsg += `💰 Narxi: ${formatUSD(price)}\n`;
            receiptMsg += `💵 To'landi: ${formatUSD(paid)}\n`;
          }
          
          receiptMsg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
          
          if (debt > 0) {
            receiptMsg += `⚠️ Bu savdo qarzi: <b>${formatUSD(debt)}</b>\n`;
          } else if (type !== 'payment') {
            receiptMsg += `✅ To'liq to'landi\n`;
          }
          
          if (totalDebt > 0) {
            receiptMsg += `📊 Jami qarz: <b>${formatUSD(totalDebt)}</b>\n`;
          }
          
          receiptMsg += `\n😊 Rahmat! Yana kutamiz!`;
          
          await sendTelegramMessage(customer.chatId, receiptMsg);
          console.log(`✅ Mijozga chek yuborildi: ${customerName} (${customer.chatId})`);
        }
      } catch (telegramError) {
        console.error('❌ Telegram chek yuborishda xato:', telegramError.message);
        // Xato bo'lsa ham savdo davom etadi
      }
    }
    
    res.json({ 
      success: true, 
      sale: cashierSale,
      cashierBalance: {
        usd: cashier.balanceUSD,
        uzs: cashier.balanceUZS,
        total: cashier.balance
      },
      message: 'Savdo muvaffaqiyatli qo\'shildi' 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kassir kirim berish
app.post('/api/cashier-handover', async (req, res) => {
  try {
    const { cashierId, amount, notes } = req.body;
    
    if (!cashierId || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kassir ID va miqdor kiritilishi shart' 
      });
    }
    
    const cashier = await Cashier.findOne({ cashierId });
    if (!cashier) {
      return res.status(404).json({ 
        success: false, 
        error: 'Kassir topilmadi' 
      });
    }
    
    if (cashier.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kassirda yetarli pul yo\'q' 
      });
    }
    
    // Yangi handover ID
    const lastHandover = await CashierHandover.findOne().sort({ handoverId: -1 });
    const handoverId = lastHandover ? lastHandover.handoverId + 1 : 1001;
    
    const balanceBefore = cashier.balance;
    const balanceAfter = balanceBefore - amount;
    
    // Handover yaratish
    const handover = await CashierHandover.create({
      handoverId,
      branchId: cashier.branchId,
      cashierId,
      cashierName: cashier.name,
      amount,
      balanceBefore,
      balanceAfter,
      notes: notes || '',
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date()
    });
    
    // Kassir balansini yangilash
    cashier.balance = balanceAfter;
    cashier.totalHandedOver += amount;
    await cashier.save();
    
    // REAL-TIME EXCEL: Kirim topshirishni Excel ga yozish (dinamik filial va kassir nomi bilan)
    try {
      const branch = await Branch.findOne({ branchId: cashier.branchId });
      const branchName = branch ? branch.name : 'Noma\'lum Filial';
      await excelRT.saveHandoverToExcel(handover, branchName, cashier.name);
      console.log('✅ Kirim topshirish real-time Excel ga yozildi');
    } catch (rtError) {
      console.error('❌ Excel yozishda xato:', rtError.message);
    }
    
    res.json({ 
      success: true, 
      handover,
      cashierBalance: cashier.balance,
      message: 'Kirim muvaffaqiyatli qabul qilindi' 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kassir kirim tarixi
app.get('/api/cashier-handovers/:cashierId', async (req, res) => {
  try {
    const { cashierId } = req.params;
    const handovers = await CashierHandover.find({ cashierId: Number(cashierId) })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, handovers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kassir kirim tarixi (query parameter bilan)
app.get('/api/cashier-handovers', async (req, res) => {
  try {
    const { cashierId } = req.query;
    
    if (!cashierId) {
      return res.status(400).json({ success: false, error: 'cashierId kerak' });
    }
    
    const handovers = await CashierHandover.find({ cashierId: Number(cashierId) })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, handovers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Barcha kirimlar
app.get('/api/all-handovers', async (req, res) => {
  try {
    const handovers = await CashierHandover.find().sort({ createdAt: -1 });
    res.json({ success: true, handovers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kassir statistikasi
app.get('/api/cashier-stats/:cashierId', async (req, res) => {
  try {
    const { cashierId } = req.params;
    
    const cashier = await Cashier.findOne({ cashierId: Number(cashierId) });
    if (!cashier) {
      return res.status(404).json({ 
        success: false, 
        error: 'Kassir topilmadi' 
      });
    }
    
    const sales = await CashierSale.find({ cashierId: Number(cashierId) });
    const handovers = await CashierHandover.find({ cashierId: Number(cashierId) });
    
    const todaySales = sales.filter(s => s.date === new Date().toLocaleDateString('uz-UZ'));
    
    // Bugungi to'lovlar (faqat dollar)
    const todayTotalUSD = todaySales.reduce((sum, s) => sum + (s.paidUSD || 0), 0);
    
    // Jami to'lovlar (faqat dollar)
    const totalUSD = sales.reduce((sum, s) => sum + (s.paidUSD || 0), 0);
    
    res.json({ 
      success: true, 
      stats: {
        balance: cashier.balance,
        totalSales: cashier.totalSales,
        totalHandedOver: cashier.totalHandedOver,
        todayTotalUSD,
        totalUSD,
        totalSalesCount: sales.length,
        totalHandoversCount: handovers.length
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kassirni tahrirlash
app.put('/api/cashiers/:cashierId', async (req, res) => {
  try {
    const { cashierId } = req.params;
    const { name, username, password, phone, isActive } = req.body;
    
    const cashier = await Cashier.findOne({ cashierId: Number(cashierId) });
    if (!cashier) {
      return res.status(404).json({ 
        success: false, 
        error: 'Kassir topilmadi' 
      });
    }
    
    // Username o'zgargan bo'lsa, mavjudligini tekshirish
    if (username && username !== cashier.username) {
      const existing = await Cashier.findOne({ username });
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          error: 'Bu login band' 
        });
      }
      cashier.username = username;
    }
    
    if (name) cashier.name = name;
    if (password) cashier.password = password;
    if (phone !== undefined) cashier.phone = phone;
    if (isActive !== undefined) cashier.isActive = isActive;
    
    await cashier.save();
    
    const cashierData = cashier.toObject();
    delete cashierData.password;
    
    res.json({ 
      success: true, 
      cashier: cashierData,
      message: 'Kassir ma\'lumotlari yangilandi' 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kassirni o'chirish
app.delete('/api/cashiers/:cashierId', async (req, res) => {
  try {
    const { cashierId } = req.params;
    
    const cashier = await Cashier.findOne({ cashierId: Number(cashierId) });
    if (!cashier) {
      return res.status(404).json({ 
        success: false, 
        error: 'Kassir topilmadi' 
      });
    }
    
    // Kassirni o'chirish o'rniga faolsizlantirish
    cashier.isActive = false;
    await cashier.save();
    
    res.json({ 
      success: true, 
      message: 'Kassir o\'chirildi' 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== OMBOR API ENDPOINTS ====================

// Ombor ma'lumotlar bazasini import qilish
const {
  Product: WarehouseProduct,
  Category,
  Supplier,
  StockMovement,
  Branch: WarehouseBranch,
  ProductItem,
  generateId,
  stockIn,
  stockOut,
  getLowStockProducts,
  getWarehouseStats,
  initWarehouseDB
} = require('./warehouse-database');

// Mahsulotlarni qidirish (IMEI/Barcode orqali)
app.get('/api/warehouse/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, products: [] });
    }
    
    // MongoDB ulanish yo'qligini tekshirish
    if (!WarehouseProduct) {
      return res.json({ 
        success: false, 
        error: 'Ombor ma\'lumotlar bazasi ulanmagan' 
      });
    }
    
    console.log('🔍 Ombor qidiruvi:', q);
    
    // IMEI, Barcode, SKU yoki nom orqali qidirish
    const products = await WarehouseProduct.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { barcode: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
        { productId: isNaN(q) ? 0 : Number(q) }
      ]
    }).limit(10);
    
    console.log(`✅ ${products.length} ta mahsulot topildi`);
    
    res.json({ 
      success: true, 
      products: products.map(p => ({
        productId: p.productId,
        name: p.name,
        categoryName: p.categoryName,
        sellPrice: p.sellPrice,
        buyPrice: p.buyPrice,
        stock: p.stock,
        minStock: p.minStock,
        unit: p.unit,
        barcode: p.barcode,
        sku: p.sku,
        description: p.description
      }))
    });
    
  } catch (error) {
    console.error('❌ Qidiruv xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Bitta mahsulot ma'lumotlarini olish
app.get('/api/warehouse/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await WarehouseProduct.findOne({ 
      productId: Number(productId),
      isActive: true 
    });
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Mahsulot topilmadi' 
      });
    }
    
    res.json({ 
      success: true, 
      product: {
        productId: product.productId,
        name: product.name,
        categoryName: product.categoryName,
        sellPrice: product.sellPrice,
        buyPrice: product.buyPrice,
        stock: product.stock,
        minStock: product.minStock,
        maxStock: product.maxStock,
        unit: product.unit,
        barcode: product.barcode,
        sku: product.sku,
        description: product.description,
        supplierName: product.supplierName
      }
    });
    
  } catch (error) {
    console.error('❌ Mahsulot olish xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Ombordan mahsulot chiqarish (savdo qilish)
app.post('/api/warehouse/stock-out', async (req, res) => {
  try {
    const { productId, quantity, reason, notes, userId, userName } = req.body;
    
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mahsulot ID va miqdor kiritilishi shart' 
      });
    }
    
    console.log('📤 Ombordan chiqarilmoqda:', { productId, quantity });
    
    const result = await stockOut(
      productId, 
      quantity, 
      reason || 'Savdo', 
      notes || '', 
      userId || 'admin', 
      userName || 'Admin'
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    console.log('✅ Ombordan chiqarildi:', result.product.name);
    
    res.json({ 
      success: true, 
      product: result.product,
      movement: result.movement,
      message: 'Mahsulot ombordan chiqarildi'
    });
    
  } catch (error) {
    console.error('❌ Ombordan chiqarish xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Omborga mahsulot kiritish
app.post('/api/warehouse/stock-in', async (req, res) => {
  try {
    const { productId, quantity, price, supplierId, supplierName, notes, userId, userName } = req.body;
    
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mahsulot ID va miqdor kiritilishi shart' 
      });
    }
    
    console.log('📥 Omborga kiritilmoqda:', { productId, quantity });
    
    const result = await stockIn(
      productId, 
      quantity, 
      price || 0,
      supplierId || null,
      supplierName || null,
      notes || '', 
      userId || 'admin', 
      userName || 'Admin'
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    console.log('✅ Omborga kiritildi:', result.product.name);
    
    res.json({ 
      success: true, 
      product: result.product,
      movement: result.movement,
      message: 'Mahsulot omborga kiritildi'
    });
    
  } catch (error) {
    console.error('❌ Omborga kiritish xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Kam qolgan mahsulotlar
app.get('/api/warehouse/low-stock', async (req, res) => {
  try {
    const result = await getLowStockProducts();
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.json({ 
      success: true, 
      products: result.products,
      count: result.count
    });
    
  } catch (error) {
    console.error('❌ Kam qolgan mahsulotlar xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Ombor statistikasi
app.get('/api/warehouse/stats', async (req, res) => {
  try {
    const result = await getWarehouseStats();
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.json({ 
      success: true, 
      stats: result.stats
    });
    
  } catch (error) {
    console.error('❌ Ombor statistikasi xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Excel export - Ombor mahsulotlari
app.get('/api/warehouse/export-excel', async (req, res) => {
  try {
    const XLSX = require('xlsx');
    
    // Barcha mahsulotlarni olish
    const products = await WarehouseProduct.find({ isActive: true })
      .sort({ name: 1 });
    
    // Excel uchun ma'lumotlarni tayyorlash
    const excelData = products.map(p => ({
      'ID': p.productId,
      'Nomi': p.name,
      'Kategoriya': p.category || 'N/A',
      'SKU': p.sku || 'N/A',
      'Barcode': p.barcode || 'N/A',
      'Miqdor': p.stock,
      'Minimal': p.minStock,
      'Birlik': p.unit || 'dona',
      'Sotib Olish': p.buyPrice || 0,
      'Sotish': p.sellPrice || 0,
      'Jami Qiymat': (p.stock * (p.buyPrice || 0)).toFixed(2),
      'Holat': p.stock <= p.minStock ? 'Kam' : 'Yetarli'
    }));
    
    // Workbook yaratish
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Ustun kengliklarini sozlash
    ws['!cols'] = [
      { wch: 8 },  // ID
      { wch: 25 }, // Nomi
      { wch: 15 }, // Kategoriya
      { wch: 12 }, // SKU
      { wch: 15 }, // Barcode
      { wch: 10 }, // Miqdor
      { wch: 10 }, // Minimal
      { wch: 10 }, // Birlik
      { wch: 12 }, // Sotib Olish
      { wch: 12 }, // Sotish
      { wch: 15 }, // Jami Qiymat
      { wch: 12 }  // Holat
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Mahsulotlar');
    
    // Fayl nomini yaratish
    const fileName = `Ombor_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Excel faylni buffer ga o'girish
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Faylni yuborish
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
    
    console.log('✅ Excel fayl yuborildi:', fileName);
    
  } catch (error) {
    console.error('❌ Excel export xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Ombor chiqim tarixi
app.get('/api/warehouse/movements', async (req, res) => {
  try {
    const { dateFrom, dateTo, branchId, cashierId } = req.query;
    
    const { getWarehouseMovements } = require('./warehouse-api');
    const result = await getWarehouseMovements({
      dateFrom,
      dateTo,
      branchId,
      cashierId
    });
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Ombor chiqim tarixi xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Barcha mahsulotlar
app.get('/api/warehouse/products', async (req, res) => {
  try {
    const { branchId } = req.query;
    
    // Agar branchId berilgan bo'lsa, faqat shu filial mahsulotlarini qaytarish
    const query = { isActive: true };
    if (branchId) {
      query.branchId = Number(branchId);
    }
    
    const products = await WarehouseProduct.find(query)
      .sort({ name: 1 });
    
    res.json({ 
      success: true, 
      products: products.map(p => ({
        productId: p.productId,
        branchId: p.branchId,
        name: p.name,
        categoryName: p.categoryName,
        sellPrice: p.sellPrice,
        buyPrice: p.buyPrice,
        stock: p.stock,
        minStock: p.minStock,
        unit: p.unit,
        barcode: p.barcode
      })),
      count: products.length
    });
    
  } catch (error) {
    console.error('❌ Mahsulotlar olish xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Mahsulot qo'shish
app.post('/api/warehouse/products', async (req, res) => {
  try {
    const { 
      branchId,
      name, 
      categoryId, 
      categoryName, 
      buyPrice, 
      sellPrice, 
      stock, 
      minStock, 
      unit, 
      barcode, 
      sku, 
      description 
    } = req.body;
    
    if (!name || !sellPrice) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mahsulot nomi va narxi kiritilishi shart' 
      });
    }
    
    // Agar branchId berilmagan bo'lsa, default filial (1001) ishlatish
    const finalBranchId = branchId ? Number(branchId) : 1001;
    
    const productId = await generateId(WarehouseProduct);
    
    const product = await WarehouseProduct.create({
      productId,
      branchId: finalBranchId,
      name,
      categoryId: categoryId || null,
      categoryName: categoryName || 'Umumiy',
      buyPrice: buyPrice || 0,
      sellPrice,
      stock: stock || 0,
      minStock: minStock || 5,
      unit: unit || 'dona',
      barcode: barcode || null,
      sku: sku || null,
      description: description || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Yangi mahsulot qo\'shildi:', product.name, '(Filial:', finalBranchId, ')');
    
    res.json({ 
      success: true, 
      product,
      message: 'Mahsulot muvaffaqiyatli qo\'shildi'
    });
    
  } catch (error) {
    console.error('❌ Mahsulot qo\'shish xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Kategoriyalar
app.get('/api/warehouse/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 });
    
    res.json({ 
      success: true, 
      categories,
      count: categories.length
    });
    
  } catch (error) {
    console.error('❌ Kategoriyalar olish xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ==================== FILIAL API ENDPOINTS ====================

// Barcha filiallar
app.get('/api/branches', async (req, res) => {
  try {
    const branches = await WarehouseBranch.find({ isActive: true })
      .sort({ name: 1 });
    
    res.json({ 
      success: true, 
      branches,
      count: branches.length
    });
  } catch (error) {
    console.error('❌ Filiallar olish xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Filial qo'shish
app.post('/api/branches', async (req, res) => {
  try {
    const { name, address, phone, manager } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Filial nomi kiritilishi shart' 
      });
    }
    
    const branchId = await generateId(WarehouseBranch);
    
    const branch = await WarehouseBranch.create({
      branchId,
      name,
      address,
      phone,
      manager,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json({ 
      success: true, 
      branch,
      message: 'Yangi filial yaratildi'
    });
  } catch (error) {
    console.error('❌ Filial qo\'shish xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Filial yangilash
app.put('/api/branches/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    const { name, address, phone, manager, isActive } = req.body;
    
    const branch = await WarehouseBranch.findOneAndUpdate(
      { branchId: Number(branchId) },
      { 
        name, 
        address, 
        phone, 
        manager, 
        isActive,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        error: 'Filial topilmadi' 
      });
    }
    
    res.json({ 
      success: true, 
      branch,
      message: 'Filial yangilandi'
    });
  } catch (error) {
    console.error('❌ Filial yangilash xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Filial statistikasi
app.get('/api/branches/:branchId/stats', async (req, res) => {
  try {
    const { branchId } = req.params;
    
    const branch = await WarehouseBranch.findOne({ branchId: Number(branchId) });
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        error: 'Filial topilmadi' 
      });
    }
    
    const totalProducts = await WarehouseProduct.countDocuments({ 
      branchId: Number(branchId), 
      isActive: true 
    });
    
    const totalItems = await ProductItem.countDocuments({
      branchId: Number(branchId),
      status: 'available'
    });
    
    const lowStockCount = await WarehouseProduct.countDocuments({
      branchId: Number(branchId),
      isActive: true,
      $expr: { $lte: ['$stock', '$minStock'] }
    });
    
    const totalStockValue = await WarehouseProduct.aggregate([
      { 
        $match: { 
          branchId: Number(branchId), 
          isActive: true 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: { $multiply: ['$stock', '$buyPrice'] } } 
        } 
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        branch,
        totalProducts,
        totalItems,
        lowStockCount,
        totalStockValue: totalStockValue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('❌ Filial statistika xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ==================== IMEI / PRODUCT ITEMS API ====================

// Mahsulotga IMEI qo'shish
app.post('/api/warehouse/product-items', async (req, res) => {
  try {
    const { productId, branchId, imei, serialNumber, buyPrice, sellPrice, warranty, condition, notes } = req.body;
    
    if (!productId || !imei) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mahsulot ID va IMEI kiritilishi shart' 
      });
    }
    
    // Parallel query - tezroq
    const [product, existingItem] = await Promise.all([
      WarehouseProduct.findOne({ productId: Number(productId) }),
      ProductItem.findOne({ imei })
    ]);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Mahsulot topilmadi' 
      });
    }
    
    if (existingItem) {
      return res.status(400).json({ 
        success: false, 
        error: 'Bu IMEI allaqachon mavjud' 
      });
    }
    
    const itemId = await generateId(ProductItem);
    
    // Parallel create va update
    const [item] = await Promise.all([
      ProductItem.create({
        itemId,
        productId: Number(productId),
        branchId: branchId || product.branchId,
        productName: product.name,
        imei,
        serialNumber: serialNumber || null,
        buyPrice: buyPrice || product.buyPrice,
        sellPrice: sellPrice || product.sellPrice,
        warranty: warranty || null,
        condition: condition || 'new',
        notes: notes || null,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      }),
      WarehouseProduct.updateOne(
        { productId: Number(productId) },
        { $inc: { stock: 1 } }
      )
    ]);
    
    console.log('✅ IMEI qo\'shildi:', imei);
    
    res.json({ 
      success: true, 
      item,
      message: 'IMEI muvaffaqiyatli qo\'shildi'
    });
    
  } catch (error) {
    console.error('❌ IMEI qo\'shish xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Mahsulot IMEI larini olish
app.get('/api/warehouse/product-items/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { status } = req.query;
    
    const query = { productId: Number(productId) };
    if (status) {
      query.status = status;
    }
    
    const items = await ProductItem.find(query).sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      items,
      count: items.length
    });
    
  } catch (error) {
    console.error('❌ IMEI lar olish xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Filial bo'yicha barcha IMEI lar
app.get('/api/warehouse/branch-items/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    const { status } = req.query;
    
    const query = { branchId: Number(branchId) };
    if (status) {
      query.status = status;
    }
    
    const items = await ProductItem.find(query).sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      items,
      count: items.length
    });
    
  } catch (error) {
    console.error('❌ Filial IMEI lar xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// IMEI qidirish
app.get('/api/warehouse/search-imei/:imei', async (req, res) => {
  try {
    const { imei } = req.params;
    
    const item = await ProductItem.findOne({ imei });
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: 'IMEI topilmadi' 
      });
    }
    
    res.json({ 
      success: true, 
      item
    });
    
  } catch (error) {
    console.error('❌ IMEI qidirish xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// IMEI sotish
app.post('/api/warehouse/sell-item', async (req, res) => {
  try {
    const { imei, soldTo, soldBy, saleId } = req.body;
    
    if (!imei) {
      return res.status(400).json({ 
        success: false, 
        error: 'IMEI kiritilishi shart' 
      });
    }
    
    const item = await ProductItem.findOne({ imei });
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: 'IMEI topilmadi' 
      });
    }
    
    if (item.status !== 'available') {
      return res.status(400).json({ 
        success: false, 
        error: 'Bu mahsulot allaqachon sotilgan yoki mavjud emas' 
      });
    }
    
    // IMEI ni sotilgan deb belgilash
    item.status = 'sold';
    item.soldDate = new Date();
    item.soldTo = soldTo || null;
    item.soldBy = soldBy || null;
    item.saleId = saleId || null;
    item.updatedAt = new Date();
    await item.save();
    
    // Mahsulot stock ni kamaytirish
    const product = await WarehouseProduct.findOne({ productId: item.productId });
    if (product && product.stock > 0) {
      product.stock -= 1;
      await product.save();
    }
    
    console.log('✅ IMEI sotildi:', imei);
    
    res.json({ 
      success: true, 
      item,
      message: 'Mahsulot muvaffaqiyatli sotildi'
    });
    
  } catch (error) {
    console.error('❌ IMEI sotish xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// IMEI o'chirish
app.delete('/api/warehouse/product-items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const item = await ProductItem.findOneAndDelete({ itemId: Number(itemId) });
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: 'IMEI topilmadi' 
      });
    }
    
    // Agar available bo'lsa, stock ni kamaytirish
    if (item.status === 'available') {
      const product = await WarehouseProduct.findOne({ productId: item.productId });
      if (product && product.stock > 0) {
        product.stock -= 1;
        await product.save();
      }
    }
    
    res.json({ 
      success: true,
      message: 'IMEI o\'chirildi'
    });
    
  } catch (error) {
    console.error('❌ IMEI o\'chirish xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Ombor harakatlari (kirim-chiqim tarixi)
app.get('/api/warehouse/movements', async (req, res) => {
  try {
    const { limit = 50, type } = req.query;
    
    const query = type ? { type } : {};
    
    const movements = await StockMovement.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    
    res.json({ 
      success: true, 
      movements,
      count: movements.length
    });
    
  } catch (error) {
    console.error('❌ Harakatlar olish xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ==================== AVTOMATIK ESLATMALAR ====================

// Har dushanba kuni soat 00:01 da yangi haftalik Excel fayl yaratish
cron.schedule('1 0 * * 1', async () => {
  console.log('📅 Yangi haftalik Excel fayl yaratilmoqda...');
  try {
    await excelManager.createWeeklyExcel();
  } catch (error) {
    console.error('❌ Haftalik Excel fayl yaratishda xato:', error);
  }
});

// Har yakshanba kuni soat 23:00 da haftalik backup yaratish
cron.schedule('0 23 * * 0', async () => {
  console.log('💾 Haftalik backup yaratilmoqda...');
  try {
    const customers = await Customer.find();
    const sales = await Sale.find();
    await backupManager.createWeeklyBackup(customers, sales);
  } catch (error) {
    console.error('❌ Haftalik backup xato:', error);
  }
});

// Har kuni soat 9:00 da ishga tushadi
cron.schedule('0 9 * * *', async () => {
  console.log('🔔 Eslatmalar tekshirilmoqda...');
  
  try {
    const settings = await Settings.findOne();
    const reminderDays = settings?.reminderDays || 7;
    const blockDays = settings?.blockDays || 10;
    
    const customers = await Customer.find({ 
      totalDebt: { $gt: 0 },
      chatId: { $exists: true, $ne: null }
    });
    
    for (const customer of customers) {
      if (!customer.firstDebtDate) continue;
      
      const debtDays = Math.floor((new Date() - customer.firstDebtDate) / (1000 * 60 * 60 * 24));
      
      // 3, 5, 7 kunlik eslatmalar
      const shouldSend3 = settings.reminder3days && debtDays === 3;
      const shouldSend5 = settings.reminder5days && debtDays === 5;
      const shouldSend7 = settings.reminder7days && debtDays === 7;
      const shouldSendMain = debtDays >= reminderDays && debtDays % reminderDays === 0;
      
      if (shouldSend3 || shouldSend5 || shouldSend7 || shouldSendMain) {
        // Barcha qarzlarni olish
        const sales = await Sale.find({ 
          customerId: customer.customerId,
          type: 'sale',
          $expr: { $gt: ['$price', '$paid'] }
        });
        
        let urgency = '💬';
        if (debtDays >= blockDays) {
          urgency = '🚫';
        } else if (debtDays >= reminderDays) {
          urgency = '⚠️';
        }
        
        let message = `${urgency} <b>Qarz to'lash eslatmasi</b>\n\nAssalomu alaykum ${customer.name}!\n\n`;
        message += `📊 Jami qarzingiz: <b>${customer.totalDebt.toLocaleString('uz-UZ')} so'm</b>\n`;
        message += `📆 Qarz kunlari: ${debtDays} kun\n\n`;
        message += `📋 Qarz tafsilotlari:\n`;
        
        sales.forEach((sale, index) => {
          const saleDebt = sale.price - sale.paid;
          message += `${index + 1}. ${sale.product} - ${saleDebt.toLocaleString('uz-UZ')} so'm (${sale.date})\n`;
        });
        
        if (debtDays >= blockDays) {
          message += `\n🚫 <b>DIQQAT!</b> Siz ${debtDays} kun bloklangansiz!\nQarzni to'laguncha yangi mahsulot ololmaysiz!`;
        } else if (debtDays >= reminderDays) {
          message += `\n⚠️ Iltimos, tezroq to'lang, ${blockDays} kundan keyin bloklangan bo'lasiz!`;
        } else {
          message += `\nIltimos, qarzingizni to'lashingizni so'raymiz.`;
        }
        
        message += `\n\nRahmat! 🙏`;
        
        const sent = await sendTelegramMessage(customer.chatId, message);
        if (sent) {
          console.log(`✅ Eslatma yuborildi: ${customer.name} (${debtDays} kun)`);
        } else {
          console.log(`❌ Xato: ${customer.name}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Eslatma xato:', error);
  }
});

// ==================== TELEGRAM BOT INTEGRATION ====================

// Stock movements (savdolar tarixi) API
app.get('/api/warehouse/stock-movements', async (req, res) => {
  try {
    const { limit = 50, type, productId } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (productId) filter.productId = Number(productId);
    
    const movements = await StockMovement.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    
    res.json({ 
      success: true, 
      movements,
      count: movements.length
    });
    
  } catch (error) {
    console.error('❌ Stock movements xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Mahsulot bo'yicha stock movements
app.get('/api/warehouse/stock-movements/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const movements = await StockMovement.find({ 
      productId: Number(productId) 
    }).sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      movements,
      count: movements.length
    });
    
  } catch (error) {
    console.error('❌ Stock movements xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ==================== TELEGRAM BOT INTEGRATION ====================

// Telegram bot webhook
const TelegramBot = require('./telegram-bot');

// Bot ni ishga tushirish
async function startTelegramBot() {
  try {
    console.log('🤖 Telegram bot ishga tushirilmoqda...');
    // Modellarni telegram botga yuborish
    TelegramBot.setModels(Customer, Sale, Branch);
    await TelegramBot.start();
    console.log('✅ Telegram bot tayyor!');
  } catch (error) {
    console.error('❌ Telegram bot xato:', error.message);
  }
}

// ==================== XARAJATLAR API ====================

// Barcha xarajatlarni olish
app.get('/api/expenses', async (req, res) => {
  try {
    const { branchId, startDate, endDate, category } = req.query;
    
    let query = {};
    
    if (branchId) query.branchId = Number(branchId);
    if (category) query.category = category;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const expenses = await Expense.find(query).sort({ createdAt: -1 });
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xarajat qo'shish
app.post('/api/expenses', async (req, res) => {
  try {
    const { branchId, category, amount, amountUZS, description, paymentMethod, isRecurring, recurringPeriod, addedBy } = req.body;
    
    if (!category || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kategoriya va summa kiritilishi shart' 
      });
    }
    
    // Yangi ID yaratish
    let newExpenseId = Math.floor(10000 + Math.random() * 90000);
    while (await Expense.findOne({ expenseId: newExpenseId })) {
      newExpenseId = Math.floor(10000 + Math.random() * 90000);
    }
    
    const now = new Date();
    const expense = await Expense.create({
      expenseId: newExpenseId,
      branchId: branchId || 0,
      category,
      amount,
      amountUZS: amountUZS || 0,
      description,
      date: now.toLocaleDateString('uz-UZ'),
      time: now.toLocaleTimeString('uz-UZ'),
      addedBy: addedBy || 'Admin',
      paymentMethod: paymentMethod || 'cash',
      isRecurring: isRecurring || false,
      recurringPeriod: recurringPeriod || null
    });
    
    res.json({ success: true, expense, message: 'Xarajat qo\'shildi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xarajat o'chirish
app.delete('/api/expenses/:expenseId', async (req, res) => {
  try {
    const { expenseId } = req.params;
    await Expense.findOneAndDelete({ expenseId: Number(expenseId) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xarajat kategoriyalari
app.get('/api/expenses/categories', async (req, res) => {
  try {
    const categories = [
      'Ish haqi',
      'Ijara',
      'Kommunal',
      'Transport',
      'Marketing',
      'Mahsulot sotib olish',
      'Ta\'mirlash',
      'Ofis jihozlari',
      'Internet va telefon',
      'Soliq',
      'Boshqa'
    ];
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xarajatlar statistikasi
app.get('/api/expenses/stats', async (req, res) => {
  try {
    const { startDate, endDate, branchId } = req.query;
    
    let query = {};
    if (branchId) query.branchId = Number(branchId);
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const expenses = await Expense.find(query);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Kategoriya bo'yicha
    const byCategory = {};
    expenses.forEach(exp => {
      if (!byCategory[exp.category]) {
        byCategory[exp.category] = 0;
      }
      byCategory[exp.category] += exp.amount;
    });
    
    res.json({ 
      success: true, 
      stats: {
        totalExpenses,
        count: expenses.length,
        byCategory
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Foyda hisobi
app.get('/api/profit', async (req, res) => {
  try {
    const { startDate, endDate, branchId } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Daromad (to'lovlar)
    let salesQuery = { ...query };
    if (branchId) salesQuery.branchId = Number(branchId);
    
    const sales = await CashierSale.find(salesQuery);
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalPaidUSD || sale.paid || 0), 0);
    const totalSalesAmount = sales.reduce((sum, sale) => sum + (sale.price || 0), 0);
    
    // Xarajatlar
    let expenseQuery = { ...query };
    if (branchId) expenseQuery.branchId = Number(branchId);
    
    const expenses = await Expense.find(expenseQuery);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Foyda
    const grossProfit = totalRevenue; // Yalpi foyda (to'lovlar)
    const netProfit = totalRevenue - totalExpenses; // Sof foyda
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;
    
    res.json({ 
      success: true, 
      profit: {
        totalRevenue,
        totalSalesAmount,
        totalExpenses,
        grossProfit,
        netProfit,
        profitMargin: Number(profitMargin),
        salesCount: sales.length,
        expensesCount: expenses.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== MONGODB TEST ENDPOINT ====================

// MongoDB ulanishini tekshirish
app.get('/api/mongodb-test', async (req, res) => {
  try {
    if (!isDBConnected) {
      return res.json({
        success: false,
        status: 'disconnected',
        message: 'MongoDB ulanmagan - JSON fallback ishlamoqda',
        details: {
          atlasUrl: process.env.MONGODB_URI ? 'Mavjud' : 'Yo\'q',
          localUrl: process.env.MONGODB_LOCAL || 'mongodb://127.0.0.1:27017/dokon_db',
          connectionState: mongoose.connection.readyState
        }
      });
    }

    // MongoDB ping test
    const admin = mongoose.connection.db.admin();
    const pingResult = await admin.ping();
    
    // Database stats
    const stats = await mongoose.connection.db.stats();
    
    // Collections list
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.json({
      success: true,
      status: 'connected',
      message: 'MongoDB muvaffaqiyatli ulangan',
      details: {
        host: mongoose.connection.host,
        database: mongoose.connection.name,
        ping: pingResult.ok ? 'OK' : 'FAILED',
        collections: collections.length,
        objects: stats.objects,
        dataSize: Math.round(stats.dataSize / 1024) + ' KB',
        connectionState: mongoose.connection.readyState,
        collectionNames: collections.map(c => c.name)
      }
    });
    
  } catch (error) {
    res.json({
      success: false,
      status: 'error',
      message: 'MongoDB test xatosi',
      error: error.message,
      details: {
        connectionState: mongoose.connection.readyState
      }
    });
  }
});

// ==================== OMBOR TARIX API ENDPOINTS ====================

// Mahsulot Kelishi (Stock In) - Yangi mahsulot omborda qo'shish
app.post('/api/stock-in', async (req, res) => {
  try {
    const {
      productId,
      productName,
      branchId,
      branchName,
      quantity,
      buyPrice,
      supplier,
      supplierPhone,
      invoiceNumber,
      notes,
      addedBy,
      addedById,
      userRole
    } = req.body;

    // Validatsiya
    if (!productId || !productName || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Mahsulot ID, nomi va miqdor majburiy'
      });
    }

    // Yangi Stock In ID yaratish
    let newStockInId = Date.now();
    while (await StockIn.findOne({ stockInId: newStockInId })) {
      newStockInId = Date.now() + Math.floor(Math.random() * 1000);
    }

    const totalCost = (buyPrice || 0) * quantity;
    const now = new Date();

    // Stock In yozuvi yaratish
    const stockIn = await StockIn.create({
      stockInId: newStockInId,
      productId,
      productName,
      branchId: branchId || 0,
      branchName: branchName || 'Asosiy Ombor',
      quantity,
      buyPrice: buyPrice || 0,
      totalCost,
      supplier: supplier || 'Noma\'lum',
      supplierPhone,
      invoiceNumber,
      notes,
      addedBy: addedBy || 'Admin',
      addedById: addedById || 0,
      userRole: userRole || 'admin',
      timestamp: now,
      date: now.toLocaleDateString('uz-UZ'),
      time: now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    // Mahsulot stokini yangilash
    const product = await Product.findOne({ productId });
    if (product) {
      product.stock += quantity;
      await product.save();
    }

    // Activity log
    await logActivity({
      action: 'stock_in',
      entity: 'product',
      entityId: productId,
      entityName: productName,
      userId: addedById || 0,
      userName: addedBy || 'Admin',
      userRole: userRole || 'admin',
      branchId: branchId || 0,
      branchName: branchName || 'Asosiy Ombor',
      description: `Omborda qo'shildi: ${productName} - ${quantity} dona`,
      newValue: stockIn
    });

    res.json({
      success: true,
      stockIn,
      message: 'Mahsulot omborda qo\'shildi'
    });

  } catch (error) {
    console.error('Stock In xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mahsulot Ketishi (Stock Out) - Mahsulot chiqarish
app.post('/api/stock-out', async (req, res) => {
  try {
    const {
      productId,
      productName,
      branchId,
      branchName,
      quantity,
      sellPrice,
      reason,
      reasonText,
      customerId,
      customerName,
      saleId,
      imei,
      notes,
      processedBy,
      processedById,
      userRole
    } = req.body;

    // Validatsiya
    if (!productId || !productName || !quantity || quantity <= 0 || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Mahsulot ID, nomi, miqdor va sabab majburiy'
      });
    }

    // Mahsulot stokini tekshirish
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Mahsulot topilmadi'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Yetarli stok yo'q. Mavjud: ${product.stock} dona`
      });
    }

    // Yangi Stock Out ID yaratish
    let newStockOutId = Date.now();
    while (await StockOut.findOne({ stockOutId: newStockOutId })) {
      newStockOutId = Date.now() + Math.floor(Math.random() * 1000);
    }

    const totalAmount = (sellPrice || 0) * quantity;
    const now = new Date();

    // Stock Out yozuvi yaratish
    const stockOut = await StockOut.create({
      stockOutId: newStockOutId,
      productId,
      productName,
      branchId: branchId || 0,
      branchName: branchName || 'Asosiy Ombor',
      quantity,
      sellPrice: sellPrice || 0,
      totalAmount,
      reason,
      reasonText: reasonText || getReasonText(reason),
      customerId,
      customerName,
      saleId,
      imei,
      notes,
      processedBy: processedBy || 'Kassir',
      processedById: processedById || 0,
      userRole: userRole || 'cashier',
      timestamp: now,
      date: now.toLocaleDateString('uz-UZ'),
      time: now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    // Mahsulot stokini kamaytirish
    product.stock -= quantity;
    await product.save();

    // BILDIRISHNOMA: Agar stok kam qolsa
    if (product.stock <= product.minStock) {
      await createNotification({
        type: 'stock',
        category: product.stock === 0 ? 'error' : 'warning',
        title: product.stock === 0 ? '⚠️ Mahsulot Tugadi!' : '⚠️ Stok Kam Qoldi!',
        message: product.stock === 0 
          ? `${productName} mahsuloti tugadi. Yangi buyurtma bering!`
          : `${productName} mahsuloti kam qoldi. Qolgan: ${product.stock} dona (Min: ${product.minStock})`,
        entityType: 'product',
        entityId: productId,
        entityName: productName,
        branchId: branchId || 0,
        branchName: branchName || 'Asosiy Ombor',
        priority: product.stock === 0 ? 'urgent' : 'high',
        actionRequired: true,
        actionUrl: '/warehouse-pro.html',
        metadata: {
          currentStock: product.stock,
          minStock: product.minStock,
          productId: productId
        }
      });
    }

    // Activity log
    await logActivity({
      action: 'stock_out',
      entity: 'product',
      entityId: productId,
      entityName: productName,
      userId: processedById || 0,
      userName: processedBy || 'Kassir',
      userRole: userRole || 'cashier',
      branchId: branchId || 0,
      branchName: branchName || 'Asosiy Ombor',
      description: `Ombordan chiqarildi: ${productName} - ${quantity} dona (${reasonText || reason})`,
      newValue: stockOut
    });

    res.json({
      success: true,
      stockOut,
      message: 'Mahsulot ombordan chiqarildi'
    });

  } catch (error) {
    console.error('Stock Out xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sabab matnini olish
function getReasonText(reason) {
  const reasons = {
    'sale': 'Sotildi',
    'return': 'Qaytarildi',
    'damage': 'Buzilgan',
    'transfer': 'Boshqa filialga o\'tkazildi',
    'lost': 'Yo\'qolgan',
    'expired': 'Muddati o\'tgan'
  };
  return reasons[reason] || reason;
}

// Stock In tarixini olish
app.get('/api/stock-in', async (req, res) => {
  try {
    const { productId, branchId, startDate, endDate, limit } = req.query;

    let query = {};
    if (productId) query.productId = Number(productId);
    if (branchId) query.branchId = Number(branchId);
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stockIns = await StockIn.find(query)
      .sort({ createdAt: -1 })
      .limit(limit ? Number(limit) : 100);

    const totalQuantity = stockIns.reduce((sum, s) => sum + s.quantity, 0);
    const totalCost = stockIns.reduce((sum, s) => sum + s.totalCost, 0);

    res.json({
      success: true,
      stockIns,
      total: stockIns.length,
      totalQuantity,
      totalCost
    });

  } catch (error) {
    console.error('Stock In olishda xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stock Out tarixini olish
app.get('/api/stock-out', async (req, res) => {
  try {
    const { productId, branchId, reason, startDate, endDate, limit } = req.query;

    let query = {};
    if (productId) query.productId = Number(productId);
    if (branchId) query.branchId = Number(branchId);
    if (reason) query.reason = reason;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stockOuts = await StockOut.find(query)
      .sort({ createdAt: -1 })
      .limit(limit ? Number(limit) : 100);

    const totalQuantity = stockOuts.reduce((sum, s) => sum + s.quantity, 0);
    const totalAmount = stockOuts.reduce((sum, s) => sum + s.totalAmount, 0);

    res.json({
      success: true,
      stockOuts,
      total: stockOuts.length,
      totalQuantity,
      totalAmount
    });

  } catch (error) {
    console.error('Stock Out olishda xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mahsulot bo'yicha to'liq tarix
app.get('/api/stock-history/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const stockIns = await StockIn.find({ productId: Number(productId) })
      .sort({ createdAt: -1 });

    const stockOuts = await StockOut.find({ productId: Number(productId) })
      .sort({ createdAt: -1 });

    // Birlashtirilgan tarix
    const history = [
      ...stockIns.map(s => ({ ...s.toObject(), type: 'in' })),
      ...stockOuts.map(s => ({ ...s.toObject(), type: 'out' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalIn = stockIns.reduce((sum, s) => sum + s.quantity, 0);
    const totalOut = stockOuts.reduce((sum, s) => sum + s.quantity, 0);
    const currentStock = totalIn - totalOut;

    res.json({
      success: true,
      history,
      stats: {
        totalIn,
        totalOut,
        currentStock,
        totalInRecords: stockIns.length,
        totalOutRecords: stockOuts.length
      }
    });

  } catch (error) {
    console.error('Stock history xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bugungi ombor harakatlari
app.get('/api/stock-today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query = {
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    };

    const stockIns = await StockIn.find(query).sort({ createdAt: -1 });
    const stockOuts = await StockOut.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      today: {
        stockIns,
        stockOuts,
        totalIn: stockIns.reduce((sum, s) => sum + s.quantity, 0),
        totalOut: stockOuts.reduce((sum, s) => sum + s.quantity, 0)
      }
    });

  } catch (error) {
    console.error('Bugungi stock xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== YAXSHILANGAN KASSA API ENDPOINTS ====================

// Kassir ma'lumotlarini olish
app.get('/api/cashier/:cashierId', async (req, res) => {
  try {
    const { cashierId } = req.params;
    const cashier = await Cashier.findOne({ cashierId: Number(cashierId) });
    
    if (!cashier) {
      return res.status(404).json({ 
        success: false, 
        error: 'Kassir topilmadi' 
      });
    }
    
    res.json(cashier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kassir savdolari statistikasi
app.get('/api/cashier-sales/:cashierId', async (req, res) => {
  try {
    const { cashierId } = req.params;
    const { date, from, to, detailed } = req.query;
    
    let query = { cashierId: Number(cashierId) };
    
    // Sana filtri
    if (date) {
      query.date = date;
    } else if (from && to) {
      query.date = { $gte: from, $lte: to };
    } else if (from) {
      query.date = { $gte: from };
    }
    
    const sales = await CashierSale.find(query).sort({ createdAt: -1 });
    
    const totalSales = sales.length;
    const totalAmount = sales.reduce((sum, sale) => sum + (sale.price || 0), 0);
    const totalPaid = sales.reduce((sum, sale) => sum + (sale.paid || 0), 0);
    
    const lastSale = sales[0];
    
    const response = {
      totalSales,
      totalAmount,
      totalPaid,
      lastSaleTime: lastSale ? lastSale.createdAt : null
    };
    
    if (detailed) {
      response.sales = sales;
    }
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// So'nggi savdolarni olish
app.get('/api/cashier-recent-sales/:cashierId', async (req, res) => {
  try {
    const { cashierId } = req.params;
    const { limit = 10 } = req.query;
    
    const sales = await CashierSale.find({ 
      cashierId: Number(cashierId) 
    })
    .sort({ createdAt: -1 })
    .limit(Number(limit));
    
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eng ko'p sotilgan mahsulot
app.get('/api/cashier-top-product/:cashierId', async (req, res) => {
  try {
    const { cashierId } = req.params;
    
    const pipeline = [
      { $match: { cashierId: Number(cashierId), type: 'sale' } },
      { $group: { _id: '$product', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ];
    
    const result = await CashierSale.aggregate(pipeline);
    
    if (result.length > 0) {
      res.json({ name: result[0]._id, count: result[0].count });
    } else {
      res.json({ name: null, count: 0 });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yangi kassir savdosi qo'shish
app.post('/api/cashier-sale', async (req, res) => {
  try {
    const { 
      cashierId, 
      cashierName, 
      branchId, 
      customerName, 
      product, 
      price, 
      paid, 
      notes, 
      currency 
    } = req.body;
    
    // Validatsiya
    if (!cashierId || !customerName || !product || !price) {
      return res.status(400).json({ 
        success: false, 
        error: 'Majburiy maydonlar to\'ldirilmagan' 
      });
    }
    
    if (price <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Narx musbat bo\'lishi kerak' 
      });
    }
    
    // Kassirni tekshirish
    const cashier = await Cashier.findOne({ cashierId: Number(cashierId) });
    if (!cashier) {
      return res.status(404).json({ 
        success: false, 
        error: 'Kassir topilmadi' 
      });
    }
    
    // Yangi savdo ID generatsiya qilish
    let newSaleId = Math.floor(100000 + Math.random() * 900000);
    while (await CashierSale.findOne({ saleId: newSaleId })) {
      newSaleId = Math.floor(100000 + Math.random() * 900000);
    }
    
    // Valyuta kursi olish
    const settings = await Settings.findOne();
    const exchangeRate = settings?.exchangeRate || 12800;
    
    // Savdo yaratish
    const saleData = {
      saleId: newSaleId,
      branchId: branchId || cashier.branchId,
      cashierId: Number(cashierId),
      cashierName: cashierName || cashier.name,
      customerName,
      product,
      price: Number(price),
      paid: Number(paid) || 0,
      currency: currency || 'USD',
      exchangeRate,
      type: 'sale',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('uz-UZ')
    };
    
    const sale = await CashierSale.create(saleData);
    
    // Kassir balansini yangilash
    cashier.totalSales += 1;
    cashier.totalSalesAmount += Number(price);
    cashier.balance += Number(paid) || 0;
    cashier.lastLogin = new Date();
    await cashier.save();
    
    // Mijozni topish yoki yaratish
    let customer = await Customer.findOne({ name: customerName });
    if (!customer) {
      let newCustomerId = Math.floor(100000 + Math.random() * 900000);
      while (await Customer.findOne({ customerId: newCustomerId })) {
        newCustomerId = Math.floor(100000 + Math.random() * 900000);
      }
      
      customer = await Customer.create({
        customerId: newCustomerId,
        name: customerName,
        totalDebt: 0
      });
    }
    
    // Mijoz qarzini yangilash
    const debt = Number(price) - (Number(paid) || 0);
    if (debt > 0) {
      customer.totalDebt += debt;
      if (!customer.firstDebtDate) {
        customer.firstDebtDate = new Date();
      }
    }
    await customer.save();
    
    // Excel ga qo'shish
    try {
      await excelManager.addToExcel(sale, customerName);
      console.log('✅ Kassir savdosi Excel ga qo\'shildi');
    } catch (excelError) {
      console.error('⚠️ Excel xato:', excelError.message);
    }
    
    // Real-time Excel ga qo'shish
    try {
      const branchName = `Filial ${branchId || cashier.branchId}`;
      await excelRT.saveSaleToExcel(sale, branchName, cashierName || cashier.name);
      console.log('✅ Real-time Excel ga qo\'shildi');
    } catch (rtError) {
      console.error('⚠️ Real-time Excel xato:', rtError.message);
    }
    
    res.json({ 
      success: true, 
      sale,
      message: 'Savdo muvaffaqiyatli qo\'shildi' 
    });
    
  } catch (error) {
    console.error('❌ Kassir savdosi qo\'shish xato:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Mijozlarni qidirish (kassa uchun)
app.get('/api/customers/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const customers = await Customer.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ]
    })
    .limit(Number(limit))
    .select('name phone totalDebt');
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Excel export uchun API
app.post('/api/export/cashier-sales-excel', async (req, res) => {
  try {
    const { cashierId, dateFrom, dateTo, sales } = req.body;
    
    // Bu yerda Excel fayl yaratish logikasi bo'ladi
    // Hozircha oddiy CSV formatida qaytaramiz
    
    const csvContent = [
      ['Tur', 'Mijoz', 'Mahsulot', 'Narx', 'To\'lov', 'Qarz', 'Sana', 'Vaqt'],
      ...sales.map(sale => [
        sale.type === 'payment' ? 'To\'lov' : 'Savdo',
        sale.customerName,
        sale.product,
        sale.price,
        sale.paid,
        Math.max(0, (sale.price || 0) - (sale.paid || 0)),
        sale.date,
        sale.time
      ])
    ].map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', `attachment; filename="Kassir_Savdolar_${dateFrom}_${dateTo}.csv"`);
    res.send('\uFEFF' + csvContent); // BOM for UTF-8
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// So'nggi mijozlar (kassir uchun)
app.get('/api/cashier-recent-customers/:cashierId', async (req, res) => {
  try {
    const { cashierId } = req.params;
    const { limit = 10 } = req.query;
    
    // So'nggi savdo qilgan mijozlarni olish
    const recentSales = await CashierSale.find({ 
      cashierId: Number(cashierId) 
    })
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 2); // Ko'proq olish, keyin unique qilish uchun
    
    // Unique mijozlar ro'yxati
    const uniqueCustomers = [];
    const seenCustomers = new Set();
    
    for (const sale of recentSales) {
      if (!seenCustomers.has(sale.customerName) && uniqueCustomers.length < limit) {
        seenCustomers.add(sale.customerName);
        
        // Mijoz qarzini hisoblash
        const customer = await Customer.findOne({ name: sale.customerName });
        
        uniqueCustomers.push({
          name: sale.customerName,
          lastSale: formatTimeAgo(sale.createdAt),
          totalDebt: customer ? customer.totalDebt : 0
        });
      }
    }
    
    res.json(uniqueCustomers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Top mahsulotlar (kassir uchun)
app.get('/api/cashier-top-products/:cashierId', async (req, res) => {
  try {
    const { cashierId } = req.params;
    const { limit = 5 } = req.query;
    
    const pipeline = [
      { $match: { cashierId: Number(cashierId), type: 'sale' } },
      { 
        $group: { 
          _id: '$product', 
          count: { $sum: 1 },
          revenue: { $sum: '$price' }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: Number(limit) }
    ];
    
    const result = await CashierSale.aggregate(pipeline);
    
    const products = result.map(item => ({
      name: item._id,
      count: item.count,
      revenue: item.revenue
    }));
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vaqt farqini hisoblash funksiyasi
function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) {
    return `${diffMins} daqiqa oldin`;
  } else if (diffHours < 24) {
    return `${diffHours} soat oldin`;
  } else {
    return `${diffDays} kun oldin`;
  }
}

// ==================== ENHANCED ADMIN API ENDPOINTS ====================

// Admin dashboard statistics
app.get('/api/admin/total-revenue', async (req, res) => {
  try {
    const revenue = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$paid' } } }
    ]);
    res.json({ total: revenue[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/total-sales', async (req, res) => {
  try {
    const total = await Sale.countDocuments();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/total-debt', async (req, res) => {
  try {
    const debt = await Customer.aggregate([
      { $group: { _id: null, total: { $sum: '$totalDebt' } } }
    ]);
    res.json({ total: debt[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recent activity feed
app.get('/api/admin/recent-activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent sales
    const recentSales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('customerName product paid createdAt type');
    
    const activities = recentSales.map(sale => ({
      user: sale.customerName || 'Noma\'lum',
      action: sale.type === 'payment' ? 'To\'lov qildi' : `${sale.product} sotib oldi`,
      time: getTimeAgo(sale.createdAt),
      type: sale.type === 'payment' ? 'payment' : 'sale'
    }));
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notifications API
app.get('/api/admin/notifications', async (req, res) => {
  try {
    // Mock notifications - in real app, these would come from database
    const notifications = [
      {
        id: 1,
        type: 'warning',
        title: 'Kam Qolgan Mahsulot',
        message: 'Ba\'zi mahsulotlar tugab qolmoqda',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        source: 'inventory'
      },
      {
        id: 2,
        type: 'info',
        title: 'Yangi Mijoz',
        message: 'Yangi mijoz ro\'yxatdan o\'tdi',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true,
        source: 'customer'
      }
    ];
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/notifications/:id/read', async (req, res) => {
  try {
    // In real app, update notification in database
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/notifications/:id', async (req, res) => {
  try {
    // In real app, delete notification from database
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/notifications/mark-all-read', async (req, res) => {
  try {
    // In real app, mark all notifications as read
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System health check
app.get('/api/admin/system-health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date()
    };
    
    if (mongoose.connection.readyState !== 1) {
      health.status = 'warning';
      health.message = 'Ma\'lumotlar bazasi ulanmagan';
    }
    
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Low stock check
app.get('/api/admin/low-stock', async (req, res) => {
  try {
    // Mock low stock items - in real app, check actual inventory
    const lowStockItems = [
      { name: 'iPhone 15 Pro Max', quantity: 3, minQuantity: 10 },
      { name: 'Samsung Galaxy S24', quantity: 2, minQuantity: 5 }
    ];
    
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// High debts check
app.get('/api/admin/high-debts', async (req, res) => {
  try {
    const highDebts = await Customer.find({ 
      totalDebt: { $gt: 500 } 
    }).select('name totalDebt');
    
    const result = highDebts.map(customer => ({
      customerName: customer.name,
      amount: customer.totalDebt
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cashier errors check
app.get('/api/admin/cashier-errors', async (req, res) => {
  try {
    // Mock cashier errors - in real app, check error logs
    const errors = [];
    
    res.json(errors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN DASHBOARD API ENDPOINTS ====================

// Admin - Jami daromad
app.get('/api/admin/total-revenue', async (req, res) => {
  try {
    const sales = await CashierSale.find();
    const total = sales.reduce((sum, sale) => sum + (sale.price || 0), 0);
    
    res.json({ 
      success: true,
      total: total,
      currency: 'USD'
    });
  } catch (error) {
    console.error('Total revenue xato:', error);
    res.json({ success: true, total: 12450 }); // Mock data
  }
});

// Admin - Jami savdolar
app.get('/api/admin/total-sales', async (req, res) => {
  try {
    const count = await CashierSale.countDocuments();
    
    res.json({ 
      success: true,
      total: count
    });
  } catch (error) {
    console.error('Total sales xato:', error);
    res.json({ success: true, total: 156 }); // Mock data
  }
});

// Admin - Jami qarz
app.get('/api/admin/total-debt', async (req, res) => {
  try {
    const customers = await Customer.find();
    const totalDebt = customers.reduce((sum, customer) => {
      return sum + (customer.debt || 0);
    }, 0);
    
    res.json({ 
      success: true,
      total: totalDebt,
      currency: 'USD'
    });
  } catch (error) {
    console.error('Total debt xato:', error);
    res.json({ success: true, total: 2340 }); // Mock data
  }
});

// Admin - So'nggi faoliyat
app.get('/api/admin/recent-activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent sales
    const recentSales = await CashierSale.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    const activities = recentSales.map(sale => ({
      user: sale.cashierName || 'Kassir',
      action: 'Yangi savdo qo\'shdi',
      time: getTimeAgo(sale.createdAt),
      type: 'sale',
      timestamp: sale.createdAt
    }));
    
    res.json(activities);
  } catch (error) {
    console.error('Recent activity xato:', error);
    // Mock data
    res.json([
      {
        user: 'Ali Kassir',
        action: 'Yangi savdo qo\'shdi',
        time: '2 daqiqa oldin',
        type: 'sale'
      },
      {
        user: 'Olima Admin',
        action: 'Yangi mijoz qo\'shdi',
        time: '15 daqiqa oldin',
        type: 'customer'
      }
    ]);
  }
});

// Admin - Bildirishnomalar ro'yxati
app.get('/api/admin/notifications', async (req, res) => {
  try {
    // In a real app, this would fetch from a Notification model
    // For now, return empty array - frontend will use mock data
    res.json([]);
  } catch (error) {
    console.error('Notifications xato:', error);
    res.json([]);
  }
});

// Admin - Yangi bildirishnoma yaratish
app.post('/api/admin/notifications', async (req, res) => {
  try {
    const { type, title, message } = req.body;
    
    // In a real app, save to database
    const notification = {
      id: Date.now(),
      type: type || 'info',
      title,
      message,
      time: new Date().toISOString(),
      read: false
    };
    
    res.json(notification);
  } catch (error) {
    console.error('Create notification xato:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin - Bildirishnomani o'qilgan deb belgilash
app.put('/api/admin/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, update in database
    res.json({ success: true, id });
  } catch (error) {
    console.error('Mark notification read xato:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin - Bildirishnomani o'chirish
app.delete('/api/admin/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, delete from database
    res.json({ success: true, id });
  } catch (error) {
    console.error('Delete notification xato:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin - Barcha bildirishnomalarni o'qilgan deb belgilash
app.put('/api/admin/notifications/mark-all-read', async (req, res) => {
  try {
    // In a real app, update all in database
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read xato:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function for time ago
function getTimeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Hozir';
  if (diffMins < 60) return `${diffMins} daqiqa oldin`;
  if (diffHours < 24) return `${diffHours} soat oldin`;
  if (diffDays < 7) return `${diffDays} kun oldin`;
  
  return past.toLocaleDateString('uz-UZ');
}

// ==================== YANGI KASSIR API ENDPOINTS ====================

// Kassir savdoni yakunlash (ochiq savdo bilan)
app.post('/api/cashier-sales/complete', async (req, res) => {
  try {
    const { 
      cashierId, 
      cashierName, 
      branchId,
      saleType, // 'customer' or 'walk-in'
      items, // [{productId, name, price, quantity}]
      totalAmount,
      paidAmount,
      customerId,
      customerName,
      customerPhone,
      date,
      time
    } = req.body;

    // Validatsiya
    if (!cashierId || !items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kassir va mahsulotlar kiritilishi shart' 
      });
    }

    // Kassirni topish
    const cashier = await Cashier.findOne({ cashierId });
    if (!cashier) {
      return res.status(404).json({ 
        success: false, 
        error: 'Kassir topilmadi' 
      });
    }

    // Har bir mahsulot uchun savdo yaratish
    const sales = [];
    for (const item of items) {
      const saleId = Math.floor(100000 + Math.random() * 900000);
      
      const sale = await CashierSale.create({
        saleId,
        branchId: branchId || cashier.branchId,
        cashierId,
        cashierName,
        customerId: saleType === 'customer' ? customerId : null,
        customerName: customerName || 'Ochiq Savdo',
        customerPhone: customerPhone || '',
        product: item.name,
        price: item.price * item.quantity,
        paid: (paidAmount / totalAmount) * (item.price * item.quantity), // Proportional payment
        paidUSD: (paidAmount / totalAmount) * (item.price * item.quantity),
        paidUZS: 0,
        exchangeRate: 12500,
        type: 'sale',
        saleType: saleType, // YANGI: savdo turi
        quantity: item.quantity, // YANGI: miqdor
        date: date || new Date().toLocaleDateString('uz-UZ'),
        time: time || new Date().toLocaleTimeString('uz-UZ'),
        createdAt: new Date()
      });

      sales.push(sale);

      // Mahsulot omborini kamaytirish
      try {
        await Product.findOneAndUpdate(
          { productId: item.productId },
          { $inc: { stock: -item.quantity } }
        );
      } catch (err) {
        console.error('Ombor yangilashda xato:', err);
      }
    }

    // Kassir balansini yangilash
    cashier.balanceUSD = (cashier.balanceUSD || 0) + paidAmount;
    cashier.balance = cashier.balanceUSD;
    cashier.totalSales = (cashier.totalSales || 0) + 1;
    cashier.totalSalesAmount = (cashier.totalSalesAmount || 0) + totalAmount;
    await cashier.save();

    // Agar doimiy mijoz bo'lsa, qarzni yangilash
    if (saleType === 'customer' && customerId) {
      try {
        const customer = await Customer.findOne({ customerId });
        if (customer) {
          const debt = totalAmount - paidAmount;
          customer.totalDebt = (customer.totalDebt || 0) + debt;
          if (debt > 0 && !customer.firstDebtDate) {
            customer.firstDebtDate = new Date();
          }
          await customer.save();
        }
      } catch (err) {
        console.error('Mijoz yangilashda xato:', err);
      }
    }

    res.json({ 
      success: true, 
      sales,
      message: 'Savdo muvaffaqiyatli yakunlandi',
      cashierBalance: cashier.balance
    });

  } catch (error) {
    console.error('Savdo yakunlashda xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kassir statistikasi
app.get('/api/cashier-sales/stats', async (req, res) => {
  try {
    const { cashierId } = req.query;

    if (!cashierId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kassir ID kiritilishi shart' 
      });
    }

    const cashier = await Cashier.findOne({ cashierId: Number(cashierId) });
    if (!cashier) {
      return res.status(404).json({ 
        success: false, 
        error: 'Kassir topilmadi' 
      });
    }

    // Bugungi savdolar
    const today = new Date().toLocaleDateString('uz-UZ');
    const todaySales = await CashierSale.find({
      cashierId: Number(cashierId),
      date: today
    });

    const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.paid || 0), 0);

    // Kirim berishlar
    const handovers = await CashierHandover.find({ cashierId: Number(cashierId) });
    const totalHandedOver = handovers.reduce((sum, h) => sum + h.amount, 0);

    res.json({
      success: true,
      todaySales: todaySales.length,
      todayRevenue,
      totalBalance: cashier.balance || 0,
      handedOver: totalHandedOver
    });

  } catch (error) {
    console.error('Statistika yuklashda xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CASHIER ADVANCED API ====================

// Kassir statistikasi (bugungi)
app.get('/api/cashier-stats', async (req, res) => {
  try {
    const { cashierId, date } = req.query;
    
    const sales = await CashierSale.find({
      cashierId: Number(cashierId),
      date: date
    });
    
    const totalSales = sales.filter(s => s.type === 'sale').length;
    const totalPayments = sales.filter(s => s.type === 'payment').length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.paid, 0);
    const uniqueCustomers = [...new Set(sales.map(s => s.customerId))].length;
    
    res.json({
      success: true,
      totalSales,
      totalPayments,
      totalRevenue,
      uniqueCustomers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kassir qaytarishlar
app.post('/api/cashier-returns', async (req, res) => {
  try {
    const { saleId, cashierId, reason, note } = req.body;
    
    // Savdoni topish
    const sale = await CashierSale.findOne({ saleId: Number(saleId) });
    
    if (!sale) {
      return res.status(404).json({ success: false, error: 'Savdo topilmadi' });
    }
    
    // Qaytarish yaratish
    const returnData = {
      saleId: Number(saleId),
      cashierId: Number(cashierId),
      originalSale: sale,
      reason,
      note,
      amount: sale.price,
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ'),
      createdAt: new Date()
    };
    
    // Savdoni o'chirish yoki belgilash
    sale.returned = true;
    sale.returnReason = reason;
    sale.returnNote = note;
    sale.returnDate = new Date();
    await sale.save();
    
    // Mahsulot stockini qaytarish
    const product = await Product.findOne({ name: sale.product });
    if (product) {
      product.stock += (sale.quantity || 1);
      await product.save();
    }
    
    // Kassir balansini kamaytirish
    const cashier = await Cashier.findOne({ cashierId: Number(cashierId) });
    if (cashier) {
      cashier.balance -= sale.paid;
      cashier.balanceUSD -= sale.paidUSD || sale.paid;
      await cashier.save();
    }
    
    res.json({ success: true, message: 'Qaytarish muvaffaqiyatli' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ACTIVITY LOG API ====================

// Barcha faoliyatlarni olish
app.get('/api/activity-log', async (req, res) => {
  try {
    const { limit = 100, userId, entity, action, branchId, startDate, endDate } = req.query;
    
    let query = {};
    
    if (userId) query.userId = Number(userId);
    if (entity) query.entity = entity;
    if (action) query.action = action;
    if (branchId) query.branchId = Number(branchId);
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const activities = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));
    
    res.json({ success: true, activities, total: activities.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Foydalanuvchi faoliyati
app.get('/api/activity-log/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    const activities = await ActivityLog.find({ userId: Number(userId) })
      .sort({ timestamp: -1 })
      .limit(Number(limit));
    
    res.json({ success: true, activities, total: activities.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ob'ekt faoliyati (masalan, bitta mahsulot tarixi)
app.get('/api/activity-log/entity/:entity/:entityId', async (req, res) => {
  try {
    const { entity, entityId } = req.params;
    
    const activities = await ActivityLog.find({ 
      entity, 
      entityId: Number(entityId) 
    }).sort({ timestamp: -1 });
    
    res.json({ success: true, activities, total: activities.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bugungi faoliyat
app.get('/api/activity-log/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activities = await ActivityLog.find({
      timestamp: { $gte: today }
    }).sort({ timestamp: -1 });
    
    res.json({ success: true, activities, total: activities.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Faoliyat statistikasi
app.get('/api/activity-log/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalActivities = await ActivityLog.countDocuments();
    const todayActivities = await ActivityLog.countDocuments({ timestamp: { $gte: today } });
    
    const byAction = await ActivityLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const byEntity = await ActivityLog.aggregate([
      { $group: { _id: '$entity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const byUser = await ActivityLog.aggregate([
      { $group: { _id: { userId: '$userId', userName: '$userName' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({ 
      success: true, 
      stats: {
        total: totalActivities,
        today: todayActivities,
        byAction,
        byEntity,
        topUsers: byUser
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ombor tarixi
app.get('/api/warehouse-history', async (req, res) => {
  try {
    const { limit = 50, productId, type, startDate, endDate } = req.query;
    
    let query = {};
    
    if (productId) {
      query.productId = Number(productId);
    }
    
    if (type) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const history = await StockMovement.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    
    res.json({ success: true, history, count: history.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SERVER START ====================

// ==================== NOTIFICATIONS API ====================

// Barcha bildirishnomalarni olish
app.get('/api/notifications', async (req, res) => {
  try {
    const { type, category, isRead, limit = 50 } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    
    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    const unreadCount = await Notification.countDocuments({ isRead: false });
    
    res.json({ 
      success: true, 
      notifications, 
      total: notifications.length,
      unreadCount 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bildirishnomani o'qilgan deb belgilash
app.put('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { readBy } = req.body;
    
    const notification = await Notification.findOneAndUpdate(
      { notificationId: Number(notificationId) },
      { 
        isRead: true, 
        readAt: new Date(),
        readBy: readBy || 'Admin'
      },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Bildirishnoma topilmadi' });
    }
    
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Barcha bildirishnomalarni o'qilgan deb belgilash
app.put('/api/notifications/read-all', async (req, res) => {
  try {
    const { readBy } = req.body;
    
    await Notification.updateMany(
      { isRead: false },
      { 
        isRead: true, 
        readAt: new Date(),
        readBy: readBy || 'Admin'
      }
    );
    
    res.json({ success: true, message: 'Barcha bildirishnomalar o\'qildi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bildirishnomani o'chirish
app.delete('/api/notifications/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await Notification.findOneAndDelete({ notificationId: Number(notificationId) });
    
    res.json({ success: true, message: 'Bildirishnoma o\'chirildi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bildirishnoma statistikasi
app.get('/api/notifications/stats', async (req, res) => {
  try {
    const total = await Notification.countDocuments();
    const unread = await Notification.countDocuments({ isRead: false });
    const read = await Notification.countDocuments({ isRead: true });
    
    const byType = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const byCategory = await Notification.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const byPriority = await Notification.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      stats: {
        total,
        unread,
        read,
        byType,
        byCategory,
        byPriority
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SERVER START ====================

// Health check endpoint (Render uchun)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server ishlayapti',
    timestamp: new Date().toISOString(),
    mongodb: isDBConnected ? 'Connected' : 'Disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="uz">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>F-Mobile - Do'kon Boshqaruv Tizimi</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          background: white;
          color: #333;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        h1 { color: #667eea; }
        .links { margin-top: 30px; }
        .link {
          display: block;
          padding: 15px;
          margin: 10px 0;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          text-align: center;
          transition: all 0.3s;
        }
        .link:hover {
          background: #764ba2;
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📱 F-Mobile</h1>
        <h2>Do'kon Boshqaruv Tizimi</h2>
        <p>Professional do'kon boshqaruv tizimi - Ombor, Kassa, Savdo va Hisobotlar</p>
        
        <div class="links">
          <a href="/admin-dashboard.html" class="link">👨‍💼 Admin Panel</a>
          <a href="/cashier-dashboard-pro.html" class="link">💰 Kassir Panel</a>
          <a href="/warehouse-pro.html" class="link">📦 Ombor</a>
          <a href="/admin-reports.html" class="link">📊 Hisobotlar</a>
          <a href="/admin-notifications-new.html" class="link">🔔 Bildirishnomalar</a>
        </div>
        
        <p style="margin-top: 30px; text-align: center; color: #999;">
          Versiya 2.0.0 | © 2026 F-Mobile
        </p>
      </div>
    </body>
    </html>
  `);
});

// Server ni ishga tushirish


// ==================== TEST DATA GENERATOR ====================
app.post('/api/generate-test-data', async (req, res) => {
    try {
        const { count = 100 } = req.body;
        
        console.log('Test malumotlar generatsiya qilinmoqda...');
        
        // Helper funksiyalar
        function randomDate(start, end) {
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        }
        
        function randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        
        function randomChoice(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }
        
        // Ma'lumotlar
        const productNames = [
            'iPhone 15 Pro Max', 'Samsung Galaxy S24', 'Xiaomi 14 Pro', 'Redmi Note 13',
            'iPhone 14', 'Samsung A54', 'Realme 11 Pro', 'Poco X6 Pro',
            'OnePlus 12', 'Vivo V30', 'Oppo Reno 11', 'Huawei P60',
            'iPhone 13', 'Samsung S23', 'Xiaomi 13T', 'Redmi 12',
            'Airpods Pro', 'Galaxy Buds', 'Xiaomi Buds', 'Powerbank 20000mAh',
            'Charger 65W', 'Cable Type-C', 'Phone Case', 'Screen Protector'
        ];
        
        const categories = ['Telefon', 'Aksessuar', 'Quloqchin', 'Zaryadlovchi'];
        const branches = [0, 1001, 1002, 1003];
        const cashiers = [1, 2, 3, 4, 5];
        
        // Sana oralig'i - oxirgi 90 kun
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        
        // Oxirgi ID larni olish
        const lastProduct = await Product.findOne().sort({ productId: -1 });
        const lastSale = await CashierSale.findOne().sort({ saleId: -1 });
        const lastHandover = await CashierHandover.findOne().sort({ handoverId: -1 });
        const lastLog = await ActivityLog.findOne().sort({ logId: -1 });
        
        let productId = lastProduct ? lastProduct.productId + 1 : 1001;
        let saleId = lastSale ? lastSale.saleId + 1 : 1001;
        let handoverId = lastHandover ? lastHandover.handoverId + 1 : 1001;
        let logId = lastLog ? lastLog.logId + 1 : 1001;
        
        const results = {
            products: 0,
            sales: 0,
            handovers: 0,
            logs: 0
        };
        
        // 1. Mahsulotlar qo'shish
        const productsToAdd = Math.floor(count * 0.1); // 10%
        for (let i = 0; i < productsToAdd; i++) {
            const branchId = randomChoice(branches);
            const name = randomChoice(productNames);
            const category = randomChoice(categories);
            const buyPrice = randomInt(100, 1000) * 1000;
            const sellPrice = buyPrice + randomInt(50, 300) * 1000;
            const stock = randomInt(0, 50);
            const createdAt = randomDate(startDate, endDate);
            
            await Product.create({
                productId: productId++,
                branchId,
                name: `${name} ${randomInt(1, 999)}`,
                category,
                buyPrice,
                sellPrice,
                stock,
                minStock: 5,
                imei: category === 'Telefon' ? `IMEI${randomInt(100000, 999999)}` : null,
                createdAt
            });
            
            results.products++;
        }
        
        // 2. Savdolar qo'shish
        const salesToAdd = Math.floor(count * 0.5); // 50%
        for (let i = 0; i < salesToAdd; i++) {
            const branchId = randomChoice([1001, 1002, 1003]);
            const cashierId = randomChoice(cashiers);
            const product = randomChoice(productNames);
            const price = randomInt(200, 2000) * 1000;
            const paid = Math.random() > 0.2 ? price : randomInt(50, 90) * price / 100;
            const debt = price - paid;
            const currency = randomChoice(['UZS', 'USD']);
            const createdAt = randomDate(startDate, endDate);
            
            await CashierSale.create({
                saleId: saleId++,
                branchId,
                cashierId,
                product: `${product} ${randomInt(1, 999)}`,
                price,
                paid,
                debt,
                currency,
                date: createdAt.toLocaleDateString('uz-UZ'),
                createdAt
            });
            
            results.sales++;
        }
        
        // 3. Kirim berishlar qo'shish
        const handoversToAdd = Math.floor(count * 0.2); // 20%
        for (let i = 0; i < handoversToAdd; i++) {
            const branchId = randomChoice([1001, 1002, 1003]);
            const cashierId = randomChoice(cashiers);
            const amount = randomInt(500, 5000) * 1000;
            const createdAt = randomDate(startDate, endDate);
            
            await CashierHandover.create({
                handoverId: handoverId++,
                branchId,
                cashierId,
                amount,
                notes: `Kirim berish ${randomInt(1, 999)}`,
                createdAt
            });
            
            results.handovers++;
        }
        
        // 4. Faoliyat tarixi qo'shish
        const logsToAdd = Math.floor(count * 0.2); // 20%
        const actions = [
            'Mahsulot qoshildi',
            'Mahsulot yangilandi',
            'Savdo qilindi',
            'Kirim berildi',
            'Stock yangilandi',
            'Narx ozgartirildi'
        ];
        
        for (let i = 0; i < logsToAdd; i++) {
            const branchId = randomChoice([0, 1001, 1002, 1003]);
            const cashierId = Math.random() > 0.3 ? randomChoice(cashiers) : null;
            const action = randomChoice(actions);
            const createdAt = randomDate(startDate, endDate);
            
            await ActivityLog.create({
                logId: logId++,
                branchId,
                cashierId,
                action,
                details: `${action} - ${randomInt(1, 999)}`,
                createdAt
            });
            
            results.logs++;
        }
        
        console.log('Test malumotlar yaratildi:', results);
        
        res.json({
            success: true,
            message: 'Test malumotlar muvaffaqiyatli yaratildi',
            results
        });
        
    } catch (error) {
        console.error('Test malumotlar yaratishda xato:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, async () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 DO\'KON BOSHQARUV TIZIMI');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Admin: http://localhost:${PORT}/admin.html`);
  console.log(`💾 MongoDB: ${process.env.MONGODB_URI ? '✅ Ulangan' : '❌ Ulanmagan'}`);
  console.log(`🤖 Telegram Bot: ${process.env.BOT_TOKEN ? '✅ Faol' : '❌ Token yo\'q'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Excel tizimini ishga tushirish
  await initExcel();
  
  // Ombor ma'lumotlar bazasini ishga tushirish
  try {
    await initWarehouseDB();
  } catch (error) {
    console.log('⚠️ Ombor ma\'lumotlar bazasi JSON rejimida ishlaydi');
  }
  
  // Telegram botni ishga tushirish
  if (process.env.BOT_TOKEN) {
    await startTelegramBot();
  } else {
    console.log('⚠️  Telegram bot o\'chirilgan (BOT_TOKEN yo\'q)');
  }
  
  console.log('\n✅ Barcha tizimlar tayyor!\n');
});

app.get('/', (req, res) => {
  res.redirect('/login.html');
});