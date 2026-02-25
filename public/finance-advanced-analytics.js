// ==================== KENGAYTIRILGAN MOLIYAVIY TAHLIL ====================

let charts = {};
let analyticsData = {};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadAnalyticsData();
    initializeAllCharts();
});

// ==================== TAB SWITCHING ====================
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Update active button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load tab-specific data
    loadTabData(tabName);
}

// ==================== LOAD DATA ====================
async function loadAnalyticsData() {
    try {
        // Generate comprehensive mock data
        analyticsData = generateComprehensiveMockData();
        
        updateMetrics();
        updateAllCharts();
        updateComparisonTable();
        
    } catch (error) {
        console.error('Tahlil ma\'lumotlarini yuklashda xato:', error);
    }
}

function generateComprehensiveMockData() {
    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const currentMonth = new Date().getMonth();
    
    return {
        // Revenue breakdown
        revenueBySource: {
            'Chakana savdo': 25000000,
            'Ulgurji savdo': 15000000,
            'Online savdo': 8000000,
            'Xizmatlar': 5000000
        },
        
        // Expense categories
        expenseByCategory: {
            'Ish haqi': 12000000,
            'Ijara': 5000000,
            'Kommunal': 2500000,
            'Marketing': 3000000,
            'Transport': 1500000,
            'Boshqa': 2000000
        },
        
        // Monthly data
        monthlyData: months.map((month, index) => ({
            month: month,
            revenue: 30000000 + Math.random() * 20000000,
            expense: 18000000 + Math.random() * 8000000,
            profit: 0, // Will be calculated
            sales: 100 + Math.floor(Math.random() * 100),
            customers: 50 + Math.floor(Math.random() * 50)
        })),
        
        // Cash flow
        cashFlow: Array.from({length: 30}, (_, i) => ({
            day: i + 1,
            inflow: 1000000 + Math.random() * 2000000,
            outflow: 500000 + Math.random() * 1500000
        })),
        
        // Product performance
        products: [
            { name: 'Mahsulot A', sales: 150, revenue: 15000000, profit: 5000000 },
            { name: 'Mahsulot B', sales: 120, revenue: 12000000, profit: 4000000 },
            { name: 'Mahsulot C', sales: 100, revenue: 10000000, profit: 3500000 },
            { name: 'Mahsulot D', sales: 80, revenue: 8000000, profit: 2800000 },
            { name: 'Mahsulot E', sales: 60, revenue: 6000000, profit: 2000000 }
        ],
        
        // KPIs
        kpis: {
            roi: 45.5,
            profitMargin: 38.2,
            breakEven: 18,
            cashFlow: 15000000,
            avgDailySales: 156,
            customerRetention: 78.5,
            inventoryTurnover: 4.2,
            debtCollection: 25
        }
    };
}

// ==================== UPDATE METRICS ====================
function updateMetrics() {
    const kpis = analyticsData.kpis;
    
    document.getElementById('roiValue').textContent = kpis.roi.toFixed(1) + '%';
    document.getElementById('profitMarginValue').textContent = kpis.profitMargin.toFixed(1) + '%';
    document.getElementById('breakEvenValue').textContent = kpis.breakEven + ' kun';
    document.getElementById('cashFlowValue').textContent = formatMoney(kpis.cashFlow);
    
    document.getElementById('avgDailySales').textContent = kpis.avgDailySales;
    document.getElementById('customerRetention').textContent = kpis.customerRetention.toFixed(1) + '%';
    document.getElementById('inventoryTurnover').textContent = kpis.inventoryTurnover.toFixed(1) + 'x';
    document.getElementById('debtCollection').textContent = kpis.debtCollection + ' kun';
}

// ==================== INITIALIZE CHARTS ====================
function initializeAllCharts() {
    initRevenueBreakdownChart();
    initExpenseTrendChart();
    initCashFlowChart();
    initSalesGrowthChart();
    initCustomerGrowthChart();
    initProductPerformanceChart();
    initYearlyComparisonChart();
    initMonthlyComparisonChart();
    initRevenueForecastChart();
    initExpenseForecastChart();
    initProfitForecastChart();
    initKPIDashboardChart();
    initEfficiencyChart();
}

function initRevenueBreakdownChart() {
    const ctx = document.getElementById('revenueBreakdownChart').getContext('2d');
    
    charts.revenueBreakdown = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatMoney(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function initExpenseTrendChart() {
    const ctx = document.getElementById('expenseTrendChart').getContext('2d');
    
    charts.expenseTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Xarajat',
                data: [],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatMoney(value);
                        }
                    }
                }
            }
        }
    });
}

function initCashFlowChart() {
    const ctx = document.getElementById('cashFlowChart').getContext('2d');
    
    charts.cashFlow = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Kirim',
                    data: [],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: '#10b981',
                    borderWidth: 2
                },
                {
                    label: 'Chiqim',
                    data: [],
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: '#ef4444',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatMoney(value);
                        }
                    }
                }
            }
        }
    });
}

function initSalesGrowthChart() {
    const ctx = document.getElementById('salesGrowthChart').getContext('2d');
    
    charts.salesGrowth = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Savdolar',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initCustomerGrowthChart() {
    const ctx = document.getElementById('customerGrowthChart').getContext('2d');
    
    charts.customerGrowth = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Mijozlar',
                data: [],
                borderColor: '#764ba2',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initProductPerformanceChart() {
    const ctx = document.getElementById('productPerformanceChart').getContext('2d');
    
    charts.productPerformance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Daromad',
                    data: [],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    yAxisID: 'y'
                },
                {
                    label: 'Foyda',
                    data: [],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatMoney(value);
                        }
                    }
                }
            }
        }
    });
}

function initYearlyComparisonChart() {
    const ctx = document.getElementById('yearlyComparisonChart').getContext('2d');
    
    charts.yearlyComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2024', '2025', '2026'],
            datasets: [{
                label: 'Daromad',
                data: [350000000, 420000000, 480000000],
                backgroundColor: 'rgba(102, 126, 234, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatMoney(value);
                        }
                    }
                }
            }
        }
    });
}

function initMonthlyComparisonChart() {
    const ctx = document.getElementById('monthlyComparisonChart').getContext('2d');
    
    charts.monthlyComparison = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '2025',
                    data: [],
                    borderColor: '#667eea',
                    borderWidth: 2
                },
                {
                    label: '2026',
                    data: [],
                    borderColor: '#10b981',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatMoney(value);
                        }
                    }
                }
            }
        }
    });
}

function initRevenueForecastChart() {
    const ctx = document.getElementById('revenueForecastChart').getContext('2d');
    
    charts.revenueForecast = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Haqiqiy',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true
                },
                {
                    label: 'Prognoz',
                    data: [],
                    borderColor: '#f093fb',
                    backgroundColor: 'rgba(240, 147, 251, 0.1)',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatMoney(value);
                        }
                    }
                }
            }
        }
    });
}

function initExpenseForecastChart() {
    const ctx = document.getElementById('expenseForecastChart').getContext('2d');
    
    charts.expenseForecast = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Haqiqiy',
                    data: [],
                    borderColor: '#ef4444',
                    borderWidth: 3
                },
                {
                    label: 'Prognoz',
                    data: [],
                    borderColor: '#f5576c',
                    borderWidth: 3,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatMoney(value);
                        }
                    }
                }
            }
        }
    });
}

function initProfitForecastChart() {
    const ctx = document.getElementById('profitForecastChart').getContext('2d');
    
    charts.profitForecast = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Prognoz Foyda',
                data: [],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: '#3b82f6',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatMoney(value);
                        }
                    }
                }
            }
        }
    });
}

function initKPIDashboardChart() {
    const ctx = document.getElementById('kpiDashboardChart').getContext('2d');
    
    charts.kpiDashboard = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['ROI', 'Foyda Marjasi', 'Mijoz Sodiqlik', 'Inventar', 'Qarz Yig\'ish'],
            datasets: [{
                label: 'Hozirgi',
                data: [85, 75, 90, 70, 80],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function initEfficiencyChart() {
    const ctx = document.getElementById('efficiencyChart').getContext('2d');
    
    charts.efficiency = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Samarali', 'Yaxshilanishi Kerak'],
            datasets: [{
                data: [78, 22],
                backgroundColor: ['#10b981', '#f3f4f6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// ==================== UPDATE CHARTS ====================
function updateAllCharts() {
    updateRevenueBreakdownChart();
    updateExpenseTrendChart();
    updateCashFlowChart();
    updateSalesGrowthChart();
    updateCustomerGrowthChart();
    updateProductPerformanceChart();
    updateMonthlyComparisonChart();
    updateForecastCharts();
}

function updateRevenueBreakdownChart() {
    const data = analyticsData.revenueBySource;
    charts.revenueBreakdown.data.labels = Object.keys(data);
    charts.revenueBreakdown.data.datasets[0].data = Object.values(data);
    charts.revenueBreakdown.update();
}

function updateExpenseTrendChart() {
    const monthlyData = analyticsData.monthlyData.slice(0, 6);
    charts.expenseTrend.data.labels = monthlyData.map(d => d.month);
    charts.expenseTrend.data.datasets[0].data = monthlyData.map(d => d.expense);
    charts.expenseTrend.update();
}

function updateCashFlowChart() {
    const cashFlow = analyticsData.cashFlow.slice(0, 15);
    charts.cashFlow.data.labels = cashFlow.map(d => d.day + '-kun');
    charts.cashFlow.data.datasets[0].data = cashFlow.map(d => d.inflow);
    charts.cashFlow.data.datasets[1].data = cashFlow.map(d => d.outflow);
    charts.cashFlow.update();
}

function updateSalesGrowthChart() {
    const monthlyData = analyticsData.monthlyData.slice(0, 6);
    charts.salesGrowth.data.labels = monthlyData.map(d => d.month);
    charts.salesGrowth.data.datasets[0].data = monthlyData.map(d => d.sales);
    charts.salesGrowth.update();
}

function updateCustomerGrowthChart() {
    const monthlyData = analyticsData.monthlyData.slice(0, 6);
    charts.customerGrowth.data.labels = monthlyData.map(d => d.month);
    charts.customerGrowth.data.datasets[0].data = monthlyData.map(d => d.customers);
    charts.customerGrowth.update();
}

function updateProductPerformanceChart() {
    const products = analyticsData.products;
    charts.productPerformance.data.labels = products.map(p => p.name);
    charts.productPerformance.data.datasets[0].data = products.map(p => p.revenue);
    charts.productPerformance.data.datasets[1].data = products.map(p => p.profit);
    charts.productPerformance.update();
}

function updateMonthlyComparisonChart() {
    const months = analyticsData.monthlyData.map(d => d.month);
    const data2025 = analyticsData.monthlyData.map(d => d.revenue * 0.85);
    const data2026 = analyticsData.monthlyData.map(d => d.revenue);
    
    charts.monthlyComparison.data.labels = months;
    charts.monthlyComparison.data.datasets[0].data = data2025;
    charts.monthlyComparison.data.datasets[1].data = data2026;
    charts.monthlyComparison.update();
}

function updateForecastCharts() {
    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun'];
    const actualRevenue = [40000000, 42000000, 45000000];
    const forecastRevenue = [48000000, 51000000, 54000000];
    
    charts.revenueForecast.data.labels = months;
    charts.revenueForecast.data.datasets[0].data = [...actualRevenue, null, null, null];
    charts.revenueForecast.data.datasets[1].data = [null, null, null, ...forecastRevenue];
    charts.revenueForecast.update();
    
    const actualExpense = [25000000, 26000000, 27000000];
    const forecastExpense = [28000000, 29000000, 30000000];
    
    charts.expenseForecast.data.labels = months;
    charts.expenseForecast.data.datasets[0].data = [...actualExpense, null, null, null];
    charts.expenseForecast.data.datasets[1].data = [null, null, null, ...forecastExpense];
    charts.expenseForecast.update();
    
    const forecastProfit = forecastRevenue.map((r, i) => r - forecastExpense[i]);
    charts.profitForecast.data.labels = ['Apr', 'May', 'Iyun'];
    charts.profitForecast.data.datasets[0].data = forecastProfit;
    charts.profitForecast.update();
}

// ==================== COMPARISON TABLE ====================
function updateComparisonTable() {
    const tbody = document.getElementById('comparisonTableBody');
    
    const comparisons = [
        { metric: 'Daromad', current: 45000000, previous: 40000000 },
        { metric: 'Xarajat', current: 28000000, previous: 29500000 },
        { metric: 'Foyda', current: 17000000, previous: 10500000 },
        { metric: 'Savdolar', current: 156, previous: 142 },
        { metric: 'Mijozlar', current: 89, previous: 82 }
    ];
    
    tbody.innerHTML = comparisons.map(item => {
        const change = ((item.current - item.previous) / item.previous * 100).toFixed(1);
        const isPositive = change > 0;
        const trendClass = isPositive ? 'up' : 'down';
        const trendIcon = isPositive ? '↑' : '↓';
        
        return `
            <tr>
                <td style="font-weight: 600;">${item.metric}</td>
                <td>${formatMoney(item.current)}</td>
                <td>${formatMoney(item.previous)}</td>
                <td style="font-weight: 700; color: ${isPositive ? '#059669' : '#dc2626'};">
                    ${trendIcon} ${Math.abs(change)}%
                </td>
                <td>
                    <span class="trend-indicator ${trendClass}">
                        ${trendIcon} ${isPositive ? 'O\'sish' : 'Kamayish'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// ==================== UTILITY FUNCTIONS ====================
function loadTabData(tabName) {
    // Load specific data for each tab if needed
    console.log('Loading data for tab:', tabName);
}

function downloadChart(chartName) {
    showNotification('📥 Chart yuklab olinmoqda...', 'info');
    setTimeout(() => {
        showNotification('✅ Chart yuklab olindi!', 'success');
    }, 1000);
}

function formatMoney(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(0) + 'K';
    }
    return amount.toString();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    `;
    
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
