// ==================== MIJOZLAR MA'LUMOTLAR BAZASI ====================
// Alohida MongoDB ulanish - Mijozlar uchun
const mongoose = require('mongoose');
require('dotenv').config();

function srvToDirectUri(srvUri) {
  try {
    const s = srvUri.replace('mongodb+srv://', '');
    const atIdx = s.indexOf('@');
    if (atIdx <= 0) return null;
    const creds = s.substring(0, atIdx);
    const rest = s.substring(atIdx + 1);
    const colonIdx = creds.indexOf(':');
    const user = creds.substring(0, colonIdx);
    const pass = colonIdx >= 0 ? creds.substring(colonIdx + 1) : '';
    const host = rest.split('/')[0].split('?')[0];
    const db = rest.includes('/') ? rest.split('/')[1].split('?')[0] : 'dokon_db';
    if (host && user) {
      return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:27017/${db || 'dokon_db'}?ssl=true&directConnection=true`;
    }
  } catch (_) {}
  return null;
}

let customersConnection;

async function initCustomersConnection() {
  try {
    let mongoUri = process.env.CUSTOMERS_MONGODB_URI || process.env.MONGODB_URI;
    
    if (mongoUri && mongoUri.trim() !== '') {
      let uri = mongoUri;
      if (uri.includes('mongodb+srv://') && !uri.includes('appName=')) {
        uri += (uri.includes('?') ? '&' : '?') + 'appName=Cluster0';
      }
      const opts = { dbName: 'customers_db', serverSelectionTimeoutMS: 30000, connectTimeoutMS: 30000, family: 4 };
      
      try {
        customersConnection = mongoose.createConnection(uri, opts);
        customersConnection.on('connected', () => console.log('✅ Mijozlar MongoDB ulandi'));
        customersConnection.on('error', (err) => { console.error('❌ Mijozlar MongoDB xato:', err.message); customersConnection = null; });
        await customersConnection.asPromise();
      } catch (err) {
        const isSrvErr = err.message && (err.message.includes('querySrv') || err.message.includes('ECONNREFUSED'));
        const tryUri = process.env.MONGODB_URI_STANDARD || (isSrvErr ? srvToDirectUri(uri) : null);
        if (tryUri && tryUri.startsWith('mongodb://')) {
          customersConnection = mongoose.createConnection(tryUri, { ...opts, directConnection: true });
          customersConnection.on('connected', () => console.log('✅ Mijozlar MongoDB ulandi (direct)'));
          customersConnection.on('error', (e) => { console.error('❌ Mijozlar MongoDB xato:', e.message); customersConnection = null; });
          await customersConnection.asPromise();
        } else throw err;
      }
    } else {
      console.log('⚠️ Mijozlar MongoDB URI topilmadi, JSON rejimida ishlaydi');
      customersConnection = null;
    }
  } catch (error) {
    console.error('❌ Mijozlar MongoDB ulanish xatosi:', error.message);
    customersConnection = null;
  }
}

// Initialize connection
initCustomersConnection();

// ==================== MIJOZLAR SCHEMAS ====================

// Mijoz
const CustomerSchema = new mongoose.Schema({
  customerId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  phone: String,
  email: String,
  address: String,
  
  // Telegram
  chatId: String,
  username: String,
  
  // Moliyaviy ma'lumotlar
  totalDebt: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  firstDebtDate: Date,
  lastPaymentDate: Date,
  
  // Mijoz turi
  type: { 
    type: String, 
    enum: ['regular', 'wholesale', 'vip'],
    default: 'regular'
  },
  
  // Chegirma
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  
  // Status
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  blockReason: String,
  
  // Qo'shimcha
  notes: String,
  tags: [String],
  rating: { type: Number, min: 1, max: 5, default: 5 },
  
  // Statistika
  totalOrders: { type: Number, default: 0 },
  lastOrderDate: Date,
  averageOrderValue: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Savdo
const SaleSchema = new mongoose.Schema({
  saleId: { type: Number, required: true, unique: true },
  customerId: { type: Number, required: true, ref: 'Customer' },
  customerName: String,
  
  // Mahsulotlar
  items: [{
    productId: Number,
    productName: String,
    quantity: Number,
    price: Number,
    discount: { type: Number, default: 0 },
    total: Number
  }],
  
  // Moliyaviy
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paid: { type: Number, required: true },
  debt: { type: Number, default: 0 },
  
  // Savdo turi
  type: { 
    type: String, 
    enum: ['sale', 'payment', 'return'],
    default: 'sale'
  },
  
  // To'lov usuli
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'mixed'],
    default: 'cash'
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'refunded'],
    default: 'completed'
  },
  
  // Qo'shimcha
  notes: String,
  receiptSent: { type: Boolean, default: false },
  
  // Kim amalga oshirdi
  userId: String,
  userName: String,
  
  date: { type: String, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// To'lov tarixi
const PaymentSchema = new mongoose.Schema({
  paymentId: { type: Number, required: true, unique: true },
  customerId: { type: Number, required: true, ref: 'Customer' },
  customerName: String,
  
  amount: { type: Number, required: true },
  
  // To'lov usuli
  method: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'other'],
    default: 'cash'
  },
  
  // Qaysi savdo uchun
  saleId: { type: Number, ref: 'Sale' },
  
  // Qoldiq
  debtBefore: { type: Number, required: true },
  debtAfter: { type: Number, required: true },
  
  notes: String,
  receiptSent: { type: Boolean, default: false },
  
  // Kim qabul qildi
  userId: String,
  userName: String,
  
  date: { type: String, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Mijoz eslatmalari
const ReminderSchema = new mongoose.Schema({
  reminderId: { type: Number, required: true, unique: true },
  customerId: { type: Number, required: true, ref: 'Customer' },
  customerName: String,
  
  type: {
    type: String,
    enum: ['debt', 'birthday', 'followup', 'custom'],
    default: 'debt'
  },
  
  message: String,
  
  // Qachon yuborish
  scheduledDate: Date,
  scheduledTime: String,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  sentAt: Date,
  
  createdAt: { type: Date, default: Date.now }
});

// Mijozlar sozlamalari
const CustomerSettingsSchema = new mongoose.Schema({
  // Eslatma sozlamalari
  reminderDays: { type: Number, default: 7 },
  reminderTime: { type: String, default: '09:00' },
  blockDays: { type: Number, default: 10 },
  
  reminder3days: { type: Boolean, default: true },
  reminder5days: { type: Boolean, default: true },
  reminder7days: { type: Boolean, default: true },
  
  // Avtomatik bloklash
  autoBlock: { type: Boolean, default: false },
  autoBlockDays: { type: Number, default: 30 },
  
  // Chegirma sozlamalari
  vipDiscount: { type: Number, default: 10 },
  wholesaleDiscount: { type: Number, default: 5 },
  
  // Telegram sozlamalari
  sendReceipts: { type: Boolean, default: true },
  sendReminders: { type: Boolean, default: true },
  
  // Umumiy
  currency: { type: String, default: 'USD' },
  currencyPosition: { type: String, default: 'before' },
  language: { type: String, default: 'uz' },
  
  updatedAt: { type: Date, default: Date.now }
});

// ==================== MODELS ====================

const Customer = customersConnection.model('Customer', CustomerSchema);
const Sale = customersConnection.model('Sale', SaleSchema);
const Payment = customersConnection.model('Payment', PaymentSchema);
const Reminder = customersConnection.model('Reminder', ReminderSchema);
const CustomerSettings = customersConnection.model('CustomerSettings', CustomerSettingsSchema);

// ==================== HELPER FUNCTIONS ====================

// ID generator
async function generateId(model) {
  const lastItem = await model.findOne().sort({ createdAt: -1 });
  if (!lastItem) return 100001;
  
  const idField = Object.keys(lastItem.toObject()).find(key => key.endsWith('Id'));
  return (lastItem[idField] || 100000) + 1;
}

// Mijoz qo'shish
async function addCustomer(customerData) {
  try {
    const customerId = await generateId(Customer);
    
    const customer = await Customer.create({
      customerId,
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return { success: true, customer };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Savdo qo'shish
async function addSale(saleData) {
  try {
    const saleId = await generateId(Sale);
    
    // Mijozni topish
    const customer = await Customer.findOne({ customerId: saleData.customerId });
    if (!customer) {
      return { success: false, error: 'Mijoz topilmadi' };
    }
    
    // Savdo yaratish
    const sale = await Sale.create({
      saleId,
      ...saleData,
      customerName: customer.name,
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ'),
      createdAt: new Date()
    });
    
    // Mijoz statistikasini yangilash
    customer.totalOrders += 1;
    customer.totalPurchases += sale.total;
    customer.totalPaid += sale.paid;
    customer.totalDebt = customer.totalPurchases - customer.totalPaid;
    customer.lastOrderDate = new Date();
    customer.averageOrderValue = customer.totalPurchases / customer.totalOrders;
    
    if (customer.totalDebt > 0 && !customer.firstDebtDate) {
      customer.firstDebtDate = new Date();
    } else if (customer.totalDebt <= 0) {
      customer.firstDebtDate = null;
    }
    
    customer.updatedAt = new Date();
    await customer.save();
    
    return { success: true, sale, customer };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// To'lov qo'shish
async function addPayment(customerId, amount, method, notes, userId, userName) {
  try {
    const customer = await Customer.findOne({ customerId });
    if (!customer) {
      return { success: false, error: 'Mijoz topilmadi' };
    }
    
    const debtBefore = customer.totalDebt;
    const debtAfter = Math.max(0, debtBefore - amount);
    
    const paymentId = await generateId(Payment);
    const payment = await Payment.create({
      paymentId,
      customerId,
      customerName: customer.name,
      amount,
      method,
      debtBefore,
      debtAfter,
      notes,
      userId,
      userName,
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ'),
      createdAt: new Date()
    });
    
    // Mijoz qarzini yangilash
    customer.totalPaid += amount;
    customer.totalDebt = debtAfter;
    customer.lastPaymentDate = new Date();
    
    if (customer.totalDebt <= 0) {
      customer.firstDebtDate = null;
    }
    
    customer.updatedAt = new Date();
    await customer.save();
    
    return { success: true, payment, customer };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Qarzli mijozlar
async function getDebtCustomers() {
  try {
    const customers = await Customer.find({
      totalDebt: { $gt: 0 },
      isActive: true
    }).sort({ totalDebt: -1 });
    
    return { success: true, customers, count: customers.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Mijozlar statistikasi
async function getCustomerStats() {
  try {
    const totalCustomers = await Customer.countDocuments({ isActive: true });
    const debtCustomers = await Customer.countDocuments({ 
      totalDebt: { $gt: 0 },
      isActive: true 
    });
    
    const totalDebt = await Customer.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalDebt' } } }
    ]);
    
    const totalRevenue = await Customer.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalPaid' } } }
    ]);
    
    const totalSales = await Sale.countDocuments({ status: 'completed' });
    
    return {
      success: true,
      stats: {
        totalCustomers,
        debtCustomers,
        totalDebt: totalDebt[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalSales
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Database ni ishga tushirish
async function initCustomersDB() {
  try {
    console.log('👥 Mijozlar ma\'lumotlar bazasi ishga tushirilmoqda...');
    
    // Default sozlamalarni yaratish
    const settingsCount = await CustomerSettings.countDocuments();
    if (settingsCount === 0) {
      await CustomerSettings.create({
        reminderDays: 7,
        reminderTime: '09:00',
        blockDays: 10,
        reminder3days: true,
        reminder5days: true,
        reminder7days: true,
        sendReceipts: true,
        sendReminders: true
      });
      console.log('✅ Mijozlar sozlamalari yaratildi');
    }
    
    console.log('✅ Mijozlar ma\'lumotlar bazasi tayyor!');
    return true;
  } catch (error) {
    console.error('❌ Mijozlar DB xato:', error.message);
    return false;
  }
}

// ==================== EXPORT ====================

module.exports = {
  customersConnection,
  
  // Models
  Customer,
  Sale,
  Payment,
  Reminder,
  CustomerSettings,
  
  // Functions
  generateId,
  addCustomer,
  addSale,
  addPayment,
  getDebtCustomers,
  getCustomerStats,
  initCustomersDB
};
