// Analytics Dashboard JavaScript
const API_URL = 'https://fmobilee.onrender.com/api';

let sales = [];
let products = [];
let customers = [];

// Load data
async function loadData() {
  try {
    // Load sales
    const salesRes = await fetch(`${API_URL}/sales`);
    const salesData = await salesRes.json();
    sales = salesData.map(s => ({
      ...s,
      fullDate: new Date(s.createdAt || s.date),
      price: Number(s.price),
      paid: Number(s.paid)
    }));

    // Load products
    const productsRes = await fetch(`${API_URL}/products`);
    products = await productsRes.json();

    // Load customers
    const customersRes = await fetch(`${API_URL}/customers`);
    customers = await customersRes.json();

    console.log(`✅ Loaded: ${sales.length} sales, ${products.length} products, ${customers.length} customers`);
  } catch (error) {
    console.error('Data load error:', error);
    // Load from localStorage as fallback
    sales = JSON.parse(localStorage.getItem('sales') || '[]');
    products = JSON.parse(localStorage.getItem('products') || '[]');
    customers = JSON.parse(localStorage.getItem('customers') || '[]');
  }
}

// Format money
function formatMoney(num) {
  return '$' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Get date range
function getLast7Days() {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }));
  }
  return dates;
}

// Calculate KPIs
function calculateKPIs() {
  const today = new Date().toLocaleDateString('uz-UZ');
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('uz-UZ');
  
  // Today's revenue
  const todaySales = sales.filter(s => {
    const saleDate = new Date(s.fullDate).toLocaleDateString('uz-UZ');
    return saleDate === today && s.type === 'sale';
  });
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.price, 0);
  
  // Yesterday's revenue
  const yesterdaySales = sales.filter(s => {
    const saleDate = new Date(s.fullDate).toLocaleDateString('uz-UZ');
    return saleDate === yesterday && s.type === 'sale';
  });
  const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + s.price, 0);
  
  // Today change
  const todayChange = yesterdayRevenue > 0 
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
    : 0;
  
  // Month revenue
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthSales = sales.filter(s => {
    const saleDate = new Date(s.fullDate);
    return saleDate.getMonth() === currentMonth && 
           saleDate.getFullYear() === currentYear &&
           s.type === 'sale';
  });
  const monthRevenue = monthSales.reduce((sum, s) => sum + s.price, 0);
  
  // Last month revenue
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthSales = sales.filter(s => {
    const saleDate = new Date(s.fullDate);
    return saleDate.getMonth() === lastMonth && 
           saleDate.getFullYear() === lastMonthYear &&
           s.type === 'sale';
  });
  const lastMonthRevenue = lastMonthSales.reduce((sum, s) => sum + s.price, 0);
  
  const monthChange = lastMonthRevenue > 0
    ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : 0;
  
  // Average check
  const avgCheck = todaySales.length > 0 ? todayRevenue / todaySales.length : 0;
  
  // Conversion rate
  const conversion = customers.length > 0 
    ? (sales.filter(s => s.type === 'sale').length / customers.length * 100).toFixed(1)
    : 0;
  
  // Update UI
  document.getElementById('todayRevenue').textContent = formatMoney(todayRevenue);
  document.getElementById('todayChange').textContent = `${todayChange > 0 ? '+' : ''}${todayChange}% kechaga nisbatan`;
  
  document.getElementById('monthRevenue').textContent = formatMoney(monthRevenue);
  document.getElementById('monthChange').textContent = `${monthChange > 0 ? '+' : ''}${monthChange}% o'tgan oyga nisbatan`;
  
  document.getElementById('avgCheck').textContent = formatMoney(avgCheck);
  document.getElementById('conversion').textContent = conversion + '%';
}

// Sales Trend Chart (7 days)
function createSalesTrendChart() {
  const ctx = document.getElementById('salesTrendChart').getContext('2d');
  const labels = getLast7Days();
  
  const data = labels.map(label => {
    const daySales = sales.filter(s => {
      const saleDate = new Date(s.fullDate).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' });
      return saleDate === label && s.type === 'sale';
    });
    return daySales.reduce((sum, s) => sum + s.price, 0);
  });
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Savdo ($)',
        data: data,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#111827',
          padding: 12,
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          callbacks: {
            label: (context) => formatMoney(context.parsed.y)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => '$' + value
          },
          grid: {
            color: '#f3f4f6'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Revenue vs Profit Chart
function createRevenueProfitChart() {
  const ctx = document.getElementById('revenueProfitChart').getContext('2d');
  
  const totalRevenue = sales.filter(s => s.type === 'sale').reduce((sum, s) => sum + s.price, 0);
  
  // Calculate profit (assuming 30% margin for demo)
  const totalProfit = totalRevenue * 0.3;
  const totalCost = totalRevenue - totalProfit;
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Foyda', 'Xarajat'],
      datasets: [{
        data: [totalProfit, totalCost],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: { size: 13, weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: '#111827',
          padding: 12,
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = formatMoney(context.parsed);
              const percent = ((context.parsed / totalRevenue) * 100).toFixed(1);
              return `${label}: ${value} (${percent}%)`;
            }
          }
        }
      }
    }
  });
}

// Payment Methods Chart
function createPaymentMethodsChart() {
  const ctx = document.getElementById('paymentMethodsChart').getContext('2d');
  
  const paymentTypes = {
    cash: 0,
    card: 0,
    transfer: 0,
    mixed: 0
  };
  
  sales.filter(s => s.type === 'sale').forEach(s => {
    const type = s.paymentType || 'cash';
    paymentTypes[type] += s.paid;
  });
  
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['💵 Naqd', '💳 Karta', '🏦 O\'tkazma', '🔄 Aralash'],
      datasets: [{
        data: [paymentTypes.cash, paymentTypes.card, paymentTypes.transfer, paymentTypes.mixed],
        backgroundColor: ['#667eea', '#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: { size: 13, weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: '#111827',
          padding: 12,
          callbacks: {
            label: (context) => {
              const value = formatMoney(context.parsed);
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percent = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${value} (${percent}%)`;
            }
          }
        }
      }
    }
  });
}

// Category Sales Chart
function createCategorySalesChart() {
  const ctx = document.getElementById('categorySalesChart').getContext('2d');
  
  const categories = {};
  
  sales.filter(s => s.type === 'sale').forEach(sale => {
    const product = products.find(p => p.name === sale.product);
    const category = product ? product.category : 'Boshqa';
    categories[category] = (categories[category] || 0) + sale.price;
  });
  
  const labels = Object.keys(categories);
  const data = Object.values(categories);
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Savdo ($)',
        data: data,
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: '#667eea',
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#111827',
          padding: 12,
          callbacks: {
            label: (context) => formatMoney(context.parsed.y)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => '$' + value
          },
          grid: {
            color: '#f3f4f6'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Hourly Sales Chart
function createHourlySalesChart() {
  const ctx = document.getElementById('hourlySalesChart').getContext('2d');
  
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const data = hours.map(hour => {
    const hourSales = sales.filter(s => {
      const saleHour = new Date(s.fullDate).getHours();
      return saleHour === hour && s.type === 'sale';
    });
    return hourSales.reduce((sum, s) => sum + s.price, 0);
  });
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hours.map(h => h + ':00'),
      datasets: [{
        label: 'Savdo ($)',
        data: data,
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: '#f59e0b',
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#111827',
          padding: 12,
          callbacks: {
            label: (context) => formatMoney(context.parsed.y)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => '$' + value
          },
          grid: {
            color: '#f3f4f6'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Top Products
function renderTopProducts() {
  const productSales = {};
  
  sales.filter(s => s.type === 'sale').forEach(sale => {
    if (!productSales[sale.product]) {
      productSales[sale.product] = {
        name: sale.product,
        count: 0,
        revenue: 0
      };
    }
    productSales[sale.product].count += sale.quantity || 1;
    productSales[sale.product].revenue += sale.price;
  });
  
  const sorted = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  const html = sorted.map((product, index) => `
    <div class="product-item">
      <div class="product-rank">${index + 1}</div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-sales">${product.count} ta sotildi</div>
      </div>
      <div class="product-revenue">${formatMoney(product.revenue)}</div>
    </div>
  `).join('');
  
  document.getElementById('topProductsList').innerHTML = html || '<p class="empty">Ma\'lumot yo\'q</p>';
}

// Export Analytics
function exportAnalytics() {
  const data = {
    kpis: {
      todayRevenue: document.getElementById('todayRevenue').textContent,
      monthRevenue: document.getElementById('monthRevenue').textContent,
      avgCheck: document.getElementById('avgCheck').textContent,
      conversion: document.getElementById('conversion').textContent
    },
    generatedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  alert('✅ Analytics eksport qilindi!');
}

// Initialize
async function init() {
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('uz-UZ', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  await loadData();
  
  calculateKPIs();
  createSalesTrendChart();
  createRevenueProfitChart();
  createPaymentMethodsChart();
  createCategorySalesChart();
  createHourlySalesChart();
  renderTopProducts();
}

init();
