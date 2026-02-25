// 📊 Analytics API Routes
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment');

// ==================== HELPER FUNCTIONS ====================

function getPeriodDates(period) {
  const now = moment();
  let startDate, endDate;
  
  switch (period) {
    case 'today':
      startDate = now.clone().startOf('day');
      endDate = now.clone().endOf('day');
      break;
    case 'week':
      startDate = now.clone().startOf('isoWeek');
      endDate = now.clone().endOf('isoWeek');
      break;
    case 'month':
      startDate = now.clone().startOf('month');
      endDate = now.clone().endOf('month');
      break;
    case 'year':
      startDate = now.clone().startOf('year');
      endDate = now.clone().endOf('year');
      break;
    default:
      startDate = now.clone().startOf('isoWeek');
      endDate = now.clone().endOf('isoWeek');
  }
  
  return { startDate: startDate.toDate(), endDate: endDate.toDate() };
}

function getPreviousPeriodDates(period) {
  const now = moment();
  let startDate, endDate;
  
  switch (period) {
    case 'today':
      startDate = now.clone().subtract(1, 'day').startOf('day');
      endDate = now.clone().subtract(1, 'day').endOf('day');
      break;
    case 'week':
      startDate = now.clone().subtract(1, 'week').startOf('isoWeek');
      endDate = now.clone().subtract(1, 'week').endOf('isoWeek');
      break;
    case 'month':
      startDate = now.clone().subtract(1, 'month').startOf('month');
      endDate = now.clone().subtract(1, 'month').endOf('month');
      break;
    case 'year':
      startDate = now.clone().subtract(1, 'year').startOf('year');
      endDate = now.clone().subtract(1, 'year').endOf('year');
      break;
    default:
      startDate = now.clone().subtract(1, 'week').startOf('isoWeek');
      endDate = now.clone().subtract(1, 'week').endOf('isoWeek');
  }
  
  return { startDate: startDate.toDate(), endDate: endDate.toDate() };
}

// ==================== ANALYTICS ENDPOINTS ====================

// Get key metrics
router.get('/metrics', async (req, res) => {
  try {
    const period = req.query.period || 'week';
    const { startDate, endDate } = getPeriodDates(period);
    const { startDate: prevStart, endDate: prevEnd } = getPreviousPeriodDates(period);
    
    // Current period
    const CashierSale = mongoose.model('CashierSale');
    const ProductItem = mongoose.model('ProductItem');
    
    const currentSales = await CashierSale.find({
      createdAt: { $gte: startDate, $lte: endDate },
      type: 'sale'
    });
    
    const previousSales = await CashierSale.find({
      createdAt: { $gte: prevStart, $lte: prevEnd },
      type: 'sale'
    });
    
    // Calculate metrics
    const totalRevenue = currentSales.reduce((sum, sale) => sum + sale.paidUSD, 0);
    const totalSales = currentSales.length;
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Calculate profit (need to get buy prices)
    let totalProfit = 0;
    for (const sale of currentSales) {
      if (sale.imei) {
        const item = await ProductItem.findOne({ imei: sale.imei });
        if (item) {
          totalProfit += (sale.paidUSD - item.buyPrice);
        }
      }
    }
    
    // Previous period metrics
    const prevRevenue = previousSales.reduce((sum, sale) => sum + sale.paidUSD, 0);
    const prevSales = previousSales.length;
    const prevAvg = prevSales > 0 ? prevRevenue / prevSales : 0;
    
    let prevProfit = 0;
    for (const sale of previousSales) {
      if (sale.imei) {
        const item = await ProductItem.findOne({ imei: sale.imei });
        if (item) {
          prevProfit += (sale.paidUSD - item.buyPrice);
        }
      }
    }
    
    // Calculate changes
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const salesChange = prevSales > 0 ? ((totalSales - prevSales) / prevSales) * 100 : 0;
    const avgChange = prevAvg > 0 ? ((avgOrderValue - prevAvg) / prevAvg) * 100 : 0;
    const profitChange = prevProfit > 0 ? ((totalProfit - prevProfit) / prevProfit) * 100 : 0;
    
    res.json({
      success: true,
      metrics: {
        totalRevenue,
        totalSales,
        avgOrderValue,
        totalProfit,
        revenueChange,
        salesChange,
        avgChange,
        profitChange
      }
    });
  } catch (error) {
    console.error('Metrics xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get sales chart data
router.get('/sales-chart', async (req, res) => {
  try {
    const period = req.query.period || 'week';
    const { startDate, endDate } = getPeriodDates(period);
    
    const CashierSale = mongoose.model('CashierSale');
    
    const sales = await CashierSale.find({
      createdAt: { $gte: startDate, $lte: endDate },
      type: 'sale'
    }).sort({ createdAt: 1 });
    
    // Group by date
    const groupedData = {};
    
    sales.forEach(sale => {
      const date = moment(sale.createdAt).format('DD.MM');
      if (!groupedData[date]) {
        groupedData[date] = 0;
      }
      groupedData[date]++;
    });
    
    const labels = Object.keys(groupedData);
    const values = Object.values(groupedData);
    
    res.json({ success: true, labels, values });
  } catch (error) {
    console.error('Sales chart xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get revenue vs profit chart
router.get('/revenue-profit', async (req, res) => {
  try {
    const period = req.query.period || 'week';
    const { startDate, endDate } = getPeriodDates(period);
    
    const CashierSale = mongoose.model('CashierSale');
    const ProductItem = mongoose.model('ProductItem');
    
    const sales = await CashierSale.find({
      createdAt: { $gte: startDate, $lte: endDate },
      type: 'sale'
    }).sort({ createdAt: 1 });
    
    // Group by date
    const groupedData = {};
    
    for (const sale of sales) {
      const date = moment(sale.createdAt).format('DD.MM');
      
      if (!groupedData[date]) {
        groupedData[date] = { revenue: 0, profit: 0 };
      }
      
      groupedData[date].revenue += sale.paidUSD;
      
      // Calculate profit
      if (sale.imei) {
        const item = await ProductItem.findOne({ imei: sale.imei });
        if (item) {
          groupedData[date].profit += (sale.paidUSD - item.buyPrice);
        }
      }
    }
    
    const labels = Object.keys(groupedData);
    const revenue = labels.map(label => groupedData[label].revenue);
    const profit = labels.map(label => groupedData[label].profit);
    
    res.json({ success: true, labels, revenue, profit });
  } catch (error) {
    console.error('Revenue profit chart xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get top products
router.get('/top-products', async (req, res) => {
  try {
    const period = req.query.period || 'week';
    const limit = parseInt(req.query.limit) || 10;
    const { startDate, endDate } = getPeriodDates(period);
    
    const CashierSale = mongoose.model('CashierSale');
    
    const topProducts = await CashierSale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          type: 'sale'
        }
      },
      {
        $group: {
          _id: '$product',
          soldCount: { $sum: 1 },
          totalRevenue: { $sum: '$paidUSD' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit }
    ]);
    
    const products = topProducts.map(p => ({
      name: p._id,
      soldCount: p.soldCount,
      totalRevenue: p.totalRevenue
    }));
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('Top products xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get top cashiers
router.get('/top-cashiers', async (req, res) => {
  try {
    const period = req.query.period || 'week';
    const limit = parseInt(req.query.limit) || 10;
    const { startDate, endDate } = getPeriodDates(period);
    
    const CashierSale = mongoose.model('CashierSale');
    
    const topCashiers = await CashierSale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          type: 'sale'
        }
      },
      {
        $group: {
          _id: { cashierId: '$cashierId', cashierName: '$cashierName' },
          salesCount: { $sum: 1 },
          totalRevenue: { $sum: '$paidUSD' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit }
    ]);
    
    const cashiers = topCashiers.map(c => ({
      cashierId: c._id.cashierId,
      name: c._id.cashierName,
      salesCount: c.salesCount,
      totalRevenue: c.totalRevenue
    }));
    
    res.json({ success: true, cashiers });
  } catch (error) {
    console.error('Top cashiers xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get category distribution
router.get('/categories', async (req, res) => {
  try {
    const period = req.query.period || 'week';
    const { startDate, endDate } = getPeriodDates(period);
    
    const CashierSale = mongoose.model('CashierSale');
    const Product = mongoose.model('Product');
    
    const sales = await CashierSale.find({
      createdAt: { $gte: startDate, $lte: endDate },
      type: 'sale'
    });
    
    // Group by category
    const categoryData = {};
    
    for (const sale of sales) {
      // Find product to get category
      const product = await Product.findOne({ name: sale.product });
      const category = product?.category || 'Umumiy';
      
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += sale.paidUSD;
    }
    
    const labels = Object.keys(categoryData);
    const values = Object.values(categoryData);
    
    res.json({ success: true, labels, values });
  } catch (error) {
    console.error('Categories xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get branch performance
router.get('/branches', async (req, res) => {
  try {
    const period = req.query.period || 'week';
    const { startDate, endDate } = getPeriodDates(period);
    
    const CashierSale = mongoose.model('CashierSale');
    const Branch = mongoose.model('Branch');
    
    const branchPerformance = await CashierSale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          type: 'sale'
        }
      },
      {
        $group: {
          _id: '$branchId',
          totalRevenue: { $sum: '$paidUSD' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
    
    // Get branch names
    const labels = [];
    const values = [];
    
    for (const item of branchPerformance) {
      const branch = await Branch.findOne({ branchId: item._id });
      labels.push(branch?.name || `Filial ${item._id}`);
      values.push(item.totalRevenue);
    }
    
    res.json({ success: true, labels, values });
  } catch (error) {
    console.error('Branches xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
