require('dotenv').config();
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

const app = express();
const PORT = process.env.PORT || 3000;

// Excel va Backup Manager ni ishga tushirish
const excelManager = new ExcelManager();
const backupManager = new BackupManager();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Static fayllar uchun

// MongoDB ulanish
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB ulandi'))
  .catch(err => console.error('❌ MongoDB xato:', err));

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
  paid: Number,
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
  autoExcelExport: { type: Boolean, default: true }
});

const ProductSchema = new mongoose.Schema({
  productId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, default: 'Umumiy' },
  buyPrice: { type: Number, default: 0 },
  sellPrice: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 5 },
  unit: { type: String, default: 'dona' },
  barcode: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', CustomerSchema);
const Sale = mongoose.model('Sale', SaleSchema);
const Settings = mongoose.model('Settings', SettingsSchema);
const Product = mongoose.model('Product', ProductSchema);

// ==================== HELPER FUNCTIONS ====================

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

// Mahsulotlarni olish
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mahsulot qo'shish/yangilash
app.post('/api/products', async (req, res) => {
  try {
    const { productId, name, category, buyPrice, sellPrice, stock, minStock, unit, barcode, description } = req.body;
    
    if (productId) {
      // Mavjud mahsulotni yangilash
      const product = await Product.findOneAndUpdate(
        { productId: Number(productId) },
        { name, category, buyPrice, sellPrice, stock, minStock, unit, barcode, description },
        { new: true }
      );
      
      if (!product) {
        return res.status(404).json({ error: 'Mahsulot topilmadi' });
      }
      
      res.json({ success: true, product, message: 'Mahsulot yangilandi' });
    } else {
      // Yangi mahsulot yaratish
      let newProductId = Math.floor(1000 + Math.random() * 9000);
      
      // ID takrorlanmasligini ta'minlash
      while (await Product.findOne({ productId: newProductId })) {
        newProductId = Math.floor(1000 + Math.random() * 9000);
      }
      
      const product = await Product.create({
        productId: newProductId,
        name,
        category: category || 'Umumiy',
        buyPrice: buyPrice || 0,
        sellPrice,
        stock: stock || 0,
        minStock: minStock || 5,
        unit: unit || 'dona',
        barcode,
        description
      });
      
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
    await Product.findOneAndUpdate(
      { productId: Number(productId) },
      { isActive: false }
    );
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
    const { reminderDays, reminderTime, blockDays, reminder3days, reminder5days, reminder7days } = req.body;
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        reminderDays, reminderTime, blockDays, reminder3days, reminder5days, reminder7days
      });
    } else {
      settings.reminderDays = reminderDays;
      settings.reminderTime = reminderTime;
      settings.blockDays = blockDays;
      settings.reminder3days = reminder3days;
      settings.reminder5days = reminder5days;
      settings.reminder7days = reminder7days;
      await settings.save();
    }
    
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mijozlarni olish
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
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
    
    // Mijoz qarzini yangilash
    const allSales = await Sale.find({ customerId });
    const totalPrice = allSales.reduce((sum, s) => s.type === 'sale' ? sum + s.price : sum, 0);
    const totalPaid = allSales.reduce((sum, s) => sum + s.paid, 0);
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
      { $group: { _id: null, total: { $sum: '$totalDebt' } } }
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
        totalDebt: totalDebt[0]?.total || 0,
        todaySales,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
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

// Telegram bot webhook
const TelegramBot = require('./telegram-bot');

// Bot ni ishga tushirish
async function startTelegramBot() {
  try {
    console.log('🤖 Telegram bot ishga tushirilmoqda...');
    // Modellarni telegram botga yuborish
    TelegramBot.setModels(Customer, Sale);
    await TelegramBot.start();
    console.log('✅ Telegram bot tayyor!');
  } catch (error) {
    console.error('❌ Telegram bot xato:', error.message);
  }
}

// ==================== SERVER START ====================

// Server ni ishga tushirish
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