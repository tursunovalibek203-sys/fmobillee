// ==================== LEGACY ROUTES (Backward Compatibility) ====================

const asyncHandler = require('../middleware/async-handler');

module.exports = (app, dependencies) => {
  const { 
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
  } = dependencies;

  // ==================== ADMIN LOGIN ====================
  
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

  // ==================== SETTINGS ====================
  
  app.get('/api/settings', asyncHandler(async (req, res) => {
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
  }));

  app.post('/api/settings', asyncHandler(async (req, res) => {
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
  }));

  // ==================== SALES ====================
  
  app.get('/api/sales', asyncHandler(async (req, res) => {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json(sales);
  }));

  app.post('/api/sales', asyncHandler(async (req, res) => {
    const result = await saleService.createSale(req.body);
    res.json({ 
      success: true, 
      sale: result.sale,
      excelSuccess: result.excelSuccess,
      telegramSuccess: result.telegramSuccess,
      message: 'Savdo muvaffaqiyatli saqlandi'
    });
  }));

  app.delete('/api/sales/:saleId', asyncHandler(async (req, res) => {
    const { saleId } = req.params;
    await saleService.deleteSale(saleId);
    res.json({ success: true });
  }));

  app.put('/api/sales/:saleId', asyncHandler(async (req, res) => {
    const { saleId } = req.params;
    const sale = await saleService.updateSale(saleId, req.body);
    res.json({ success: true, sale });
  }));

  // ==================== TELEGRAM ====================
  
  app.post('/api/send-telegram', asyncHandler(async (req, res) => {
    const { chatId, message } = req.body;
    
    if (!chatId || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chat ID va xabar matni kiritilishi shart' 
      });
    }
    
    const result = await telegramService.sendMessage(chatId, message);
    res.json(result);
  }));

  // ==================== EXCEL ====================
  
  app.get('/api/excel-files', asyncHandler(async (req, res) => {
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
  }));

  app.get('/api/excel-download/:fileName', asyncHandler(async (req, res) => {
    const { fileName } = req.params;
    const filePath = require('path').join(__dirname, '..', 'excel-files', fileName);
    
    if (!require('fs').existsSync(filePath)) {
      return res.status(404).json({ error: 'Fayl topilmadi' });
    }
    
    res.download(filePath, fileName);
  }));

  // ==================== BACKUP ====================
  
  app.post('/api/backup/create', asyncHandler(async (req, res) => {
    const customers = await Customer.find();
    const sales = await Sale.find();
    
    const result = await backupManager.createFullBackup(customers, sales);
    res.json(result);
  }));

  app.get('/api/backup/files', asyncHandler(async (req, res) => {
    const files = backupManager.getBackupFiles();
    res.json({ success: true, files });
  }));

  // ==================== STATISTICS ====================
  
  app.get('/api/stats', asyncHandler(async (req, res) => {
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
      data: {
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
  }));

  // ==================== REPORTS ====================
  
  app.get('/api/daily-report', asyncHandler(async (req, res) => {
    const today = new Date().toLocaleDateString('uz-UZ');
    const report = await saleService.getDailyReport(today);
    res.json({ success: true, report });
  }));

  app.get('/api/weekly-report', asyncHandler(async (req, res) => {
    const moment = require('moment');
    const now = moment();
    const weekStart = now.clone().startOf('isoWeek').toDate();
    const weekEnd = now.clone().endOf('isoWeek').toDate();
    
    const report = await saleService.getWeeklyReport(weekStart, weekEnd);
    res.json({ success: true, report });
  }));

  app.get('/api/customer-report/:customerId', asyncHandler(async (req, res) => {
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
  }));
};
