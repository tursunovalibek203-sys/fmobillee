// ==================== REPORTS ROUTES ====================

const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/async-handler');
const ResponseHandler = require('../utils/response-handler');

module.exports = (Customer, Sale, Product, Cashier, Branch) => {
  
  // Comprehensive dashboard statistics
  router.get('/dashboard', asyncHandler(async (req, res) => {
    const [
      totalCustomers,
      totalSales,
      totalProducts,
      totalCashiers,
      totalBranches,
      customersWithDebt,
      lowStockProducts,
      todaySales,
      monthlyRevenue,
      totalDebt
    ] = await Promise.all([
      Customer.countDocuments(),
      Sale.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Cashier.countDocuments({ isActive: true }),
      Branch.countDocuments({ isActive: true }),
      Customer.countDocuments({ totalDebt: { $gt: 0 } }),
      Product.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$minStock'] } }),
      Sale.countDocuments({ date: new Date().toLocaleDateString('uz-UZ') }),
      Sale.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$paid' } } }
      ]),
      Customer.aggregate([
        { $group: { _id: null, total: { $sum: '$totalDebt' } } }
      ])
    ]);

    ResponseHandler.success(res, {
      totalCustomers,
      totalSales,
      totalProducts,
      totalCashiers,
      totalBranches,
      customersWithDebt,
      lowStockProducts,
      todaySales,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      totalDebt: totalDebt[0]?.total || 0
    }, 'Dashboard statistikasi');
  }));

  // Sales analytics
  router.get('/sales-analytics', asyncHandler(async (req, res) => {
    const { period = 'week' } = req.query;
    
    let startDate = new Date();
    switch(period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const sales = await Sale.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    const analytics = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, s) => sum + s.paid, 0),
      totalAmount: sales.filter(s => s.type === 'sale').reduce((sum, s) => sum + s.price, 0),
      averageSale: sales.length > 0 ? sales.reduce((sum, s) => sum + s.price, 0) / sales.length : 0,
      salesByDay: {},
      salesByType: {
        sale: sales.filter(s => s.type === 'sale').length,
        payment: sales.filter(s => s.type === 'payment').length
      }
    };

    // Group by day
    sales.forEach(sale => {
      if (!analytics.salesByDay[sale.date]) {
        analytics.salesByDay[sale.date] = { count: 0, revenue: 0 };
      }
      analytics.salesByDay[sale.date].count++;
      analytics.salesByDay[sale.date].revenue += sale.paid;
    });

    ResponseHandler.success(res, analytics, 'Savdolar analitikasi');
  }));

  // Customer analytics
  router.get('/customer-analytics', asyncHandler(async (req, res) => {
    const customers = await Customer.find();
    const sales = await Sale.find();

    // Calculate customer metrics
    const customerMetrics = customers.map(customer => {
      const customerSales = sales.filter(s => s.customerId === customer.customerId);
      const totalPurchases = customerSales.filter(s => s.type === 'sale').length;
      const totalPayments = customerSales.filter(s => s.type === 'payment').length;
      const totalSpent = customerSales.filter(s => s.type === 'sale').reduce((sum, s) => sum + s.price, 0);
      const totalPaid = customerSales.reduce((sum, s) => sum + s.paid, 0);

      return {
        customerId: customer.customerId,
        name: customer.name,
        totalPurchases,
        totalPayments,
        totalSpent,
        totalPaid,
        totalDebt: customer.totalDebt,
        debtDays: customer.firstDebtDate 
          ? Math.floor((new Date() - new Date(customer.firstDebtDate)) / (1000 * 60 * 60 * 24))
          : 0
      };
    });

    // Sort by total spent
    customerMetrics.sort((a, b) => b.totalSpent - a.totalSpent);

    ResponseHandler.success(res, {
      totalCustomers: customers.length,
      activeCustomers: customerMetrics.filter(c => c.totalPurchases > 0).length,
      customersWithDebt: customerMetrics.filter(c => c.totalDebt > 0).length,
      topCustomers: customerMetrics.slice(0, 10),
      debtAnalysis: customerMetrics.filter(c => c.totalDebt > 0)
    }, 'Mijozlar analitikasi');
  }));

  // Product analytics
  router.get('/product-analytics', asyncHandler(async (req, res) => {
    const products = await Product.find({ isActive: true });
    const sales = await Sale.find({ type: 'sale' });

    // Calculate product metrics
    const productMetrics = products.map(product => {
      const productSales = sales.filter(s => s.product === product.name);
      const totalSold = productSales.length;
      const totalRevenue = productSales.reduce((sum, s) => sum + s.price, 0);
      const totalProfit = totalRevenue - (product.buyPrice * totalSold);

      return {
        productId: product.productId,
        name: product.name,
        category: product.category,
        stock: product.stock,
        minStock: product.minStock,
        totalSold,
        totalRevenue,
        totalProfit,
        profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
      };
    });

    // Sort by revenue
    productMetrics.sort((a, b) => b.totalRevenue - a.totalRevenue);

    ResponseHandler.success(res, {
      totalProducts: products.length,
      lowStockProducts: products.filter(p => p.stock <= p.minStock).length,
      topProducts: productMetrics.slice(0, 10),
      categoryBreakdown: products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {})
    }, 'Mahsulotlar analitikasi');
  }));

  // Activity log
  router.get('/activity-log', asyncHandler(async (req, res) => {
    const { limit = 50 } = req.query;

    const recentSales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const activities = recentSales.map(sale => ({
      type: sale.type,
      action: sale.type === 'payment' ? 'To\'lov qabul qilindi' : 'Yangi savdo',
      customer: sale.customerName,
      details: `${sale.product || 'To\'lov'} - $${sale.price.toFixed(2)}`,
      amount: sale.price,
      date: sale.date,
      time: sale.time,
      timestamp: sale.createdAt
    }));

    ResponseHandler.success(res, activities, 'Faoliyat jurnali');
  }));

  // Financial summary
  router.get('/financial-summary', asyncHandler(async (req, res) => {
    const { period = 'month' } = req.query;

    let startDate = new Date();
    switch(period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const sales = await Sale.find({ createdAt: { $gte: startDate } });
    const customers = await Customer.find();

    const totalRevenue = sales.reduce((sum, s) => sum + s.paid, 0);
    const totalSalesAmount = sales.filter(s => s.type === 'sale').reduce((sum, s) => sum + s.price, 0);
    const totalDebt = customers.reduce((sum, c) => sum + c.totalDebt, 0);
    const totalCollected = sales.filter(s => s.type === 'payment').reduce((sum, s) => sum + s.paid, 0);

    ResponseHandler.success(res, {
      period,
      totalRevenue,
      totalSalesAmount,
      totalDebt,
      totalCollected,
      netProfit: totalRevenue * 0.3, // Simplified profit calculation
      profitMargin: 30 // Simplified
    }, 'Moliyaviy xulosа');
  }));

  // ==================== PROFESSIONAL ANALYTICS ENDPOINTS ====================

  // Dashboard Stats for Analytics Pro
  router.get('/dashboard-stats', asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [
      totalRevenue,
      yesterdayRevenue,
      totalSales,
      yesterdaySales,
      activeCustomers,
      newCustomers,
      products,
      todaySales
    ] = await Promise.all([
      Sale.aggregate([{ $group: { _id: null, total: { $sum: '$paid' } } }]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: yesterday, $lt: today } } },
        { $group: { _id: null, total: { $sum: '$paid' } } }
      ]),
      Sale.countDocuments(),
      Sale.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
      Customer.countDocuments(),
      Customer.countDocuments({ createdAt: { $gte: today } }),
      Product.find({ isActive: true }),
      Sale.countDocuments({ createdAt: { $gte: today } })
    ]);

    const totalRev = totalRevenue[0]?.total || 0;
    const yesterdayRev = yesterdayRevenue[0]?.total || 0;
    const revenueGrowth = yesterdayRev > 0 ? (((totalRev - yesterdayRev) / yesterdayRev) * 100).toFixed(1) : 0;
    
    const salesGrowth = yesterdaySales > 0 ? (((todaySales - yesterdaySales) / yesterdaySales) * 100).toFixed(1) : 0;
    
    const inventoryValue = products.reduce((sum, p) => sum + (p.sellPrice * p.stock), 0);

    ResponseHandler.success(res, {
      totalRevenue: totalRev,
      revenueGrowth,
      totalSales,
      salesGrowth,
      activeCustomers,
      newCustomers,
      inventoryValue,
      totalProducts: products.length
    });
  }));

  // Revenue Trend
  router.get('/revenue-trend', asyncHandler(async (req, res) => {
    const { period = '7d' } = req.query;
    
    let days = 7;
    if (period === '30d') days = 30;
    if (period === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await Sale.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Group by date
    const revenueByDate = {};
    sales.forEach(sale => {
      if (!revenueByDate[sale.date]) {
        revenueByDate[sale.date] = 0;
      }
      revenueByDate[sale.date] += sale.paid;
    });

    const data = Object.keys(revenueByDate).map(date => ({
      date,
      revenue: revenueByDate[date]
    }));

    ResponseHandler.success(res, { data });
  }));

  // Sales by Category
  router.get('/sales-by-category', asyncHandler(async (req, res) => {
    const products = await Product.find({ isActive: true });
    const sales = await Sale.find({ type: 'sale' });

    const categoryTotals = {};
    
    sales.forEach(sale => {
      const product = products.find(p => p.name === sale.product);
      const category = product?.category || 'Boshqalar';
      
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += sale.price;
    });

    const data = Object.keys(categoryTotals).map(category => ({
      category,
      total: categoryTotals[category]
    }));

    ResponseHandler.success(res, { data });
  }));

  // Top Products
  router.get('/top-products', asyncHandler(async (req, res) => {
    const { limit = 5 } = req.query;
    
    const sales = await Sale.find({ type: 'sale' });
    
    const productCounts = {};
    sales.forEach(sale => {
      if (!productCounts[sale.product]) {
        productCounts[sale.product] = 0;
      }
      productCounts[sale.product]++;
    });

    const data = Object.keys(productCounts)
      .map(name => ({
        name,
        quantity: productCounts[name]
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, Number(limit));

    ResponseHandler.success(res, { data });
  }));

  // Sales Trend
  router.get('/sales-trend', asyncHandler(async (req, res) => {
    const { period = '7d' } = req.query;
    
    let days = 7;
    if (period === '30d') days = 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await Sale.find({
      createdAt: { $gte: startDate },
      type: 'sale'
    }).sort({ createdAt: 1 });

    const salesByDate = {};
    sales.forEach(sale => {
      if (!salesByDate[sale.date]) {
        salesByDate[sale.date] = 0;
      }
      salesByDate[sale.date]++;
    });

    const data = Object.keys(salesByDate).map(date => ({
      date,
      count: salesByDate[date]
    }));

    ResponseHandler.success(res, { data });
  }));

  // Customer Growth
  router.get('/customer-growth', asyncHandler(async (req, res) => {
    const { period = '7d' } = req.query;
    
    let days = 7;
    if (period === '30d') days = 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const customers = await Customer.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    const customersByDate = {};
    customers.forEach(customer => {
      const date = customer.createdAt.toLocaleDateString('uz-UZ');
      if (!customersByDate[date]) {
        customersByDate[date] = 0;
      }
      customersByDate[date]++;
    });

    const data = Object.keys(customersByDate).map(date => ({
      date,
      count: customersByDate[date]
    }));

    ResponseHandler.success(res, { data });
  }));

  // Top Customers
  router.get('/top-customers', asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    
    const customers = await Customer.find();
    const sales = await Sale.find();

    const customerData = customers.map(customer => {
      const customerSales = sales.filter(s => s.customerId === customer.customerId && s.type === 'sale');
      const totalAmount = customerSales.reduce((sum, s) => sum + s.price, 0);
      const lastSale = customerSales.length > 0 ? customerSales[customerSales.length - 1] : null;

      return {
        customerId: customer.customerId,
        name: customer.name,
        totalPurchases: customerSales.length,
        totalAmount,
        lastPurchase: lastSale?.date || 'N/A',
        debt: customer.totalDebt
      };
    });

    const data = customerData
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, Number(limit));

    ResponseHandler.success(res, { data });
  }));

  return router;
};
