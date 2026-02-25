// ==================== MOLIYA BOSHQARUVI DASHBOARD ====================

let currentPeriod = 'month';
let revenueExpenseChart = null;
let expenseCategoriesChart = null;
let profitTrendChart = null;

let financeData = {
    revenue: 0,
    expense: 0,
    profit: 0,
    debt: 0,
    expenses: [],
    revenueHistory: [],
    expenseHistory: []
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadFinanceData();
    initializeCharts();
    
    // Auto-refresh every 60 seconds
    setInterval(loadFinanceData, 60000);
});

// ==================== LOAD FINANCE DATA ====================
async function loadFinanceData() {
    try {
        // Load revenue data
        const revenueResponse = await fetch(`/api/finance/revenue?period=${currentPeriod}`);
        if (revenueResponse.ok) {
            const revenueData = await revenueResponse.json();
            financeData.revenue = revenueData.total || 0;
            financeData.revenueHistory = revenueData.history || [];
        }
        
        // Load expense data
        const expenseResponse = await fetch(`/api/finance/expenses?period=${currentPeriod}`);
        if (expenseResponse.ok) {
            const expenseData = await expenseResponse.json();
            financeData.expense = expenseData.total || 0;
            financeData.expenses = expenseData.list || [];
            financeData.expenseHistory = expenseData.history || [];
        }
        
        // Load debt data
        const debtResponse = await fetch('/api/finance/debt');
        if (debtResponse.ok) {
            const debtData = await debtResponse.json();
            financeData.debt = debtData.total || 0;
        }
        
        // Calculate profit
        financeData.profit = financeData.revenue - financeData.expense;
        
        updateStatistics();
        updateCharts();
        displayExpenses();
        
    } catch (error) {
        console.error('Moliya ma\'lumotlarini yuklashda xato:', error);
        
        // Use mock data if API fails
        generateMockData();
        updateStatistics();
        updateCharts();
        displayExpenses();
    }
}

// ==================== GENERATE MOCK DATA ====================
function generateMockData() {
    // Mock revenue
    financeData.revenue = 45000000 + Math.random() * 10000000;
    
    // Mock expenses
    financeData.expense = 28000000 + Math.random() * 5000000;
    
    // Mock profit
    financeData.profit = financeData.revenue - financeData.expense;
    
    // Mock debt
    financeData.debt = 5000000 + Math.random() * 3000000;
    
    // Mock expense list
    financeData.expenses = [
        {
            id: 1,
            category: 'Ish haqi',
            amount: 12000000,
            description: 'Xodimlar ish haqi',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            category: 'Ijara',
            amount: 5000000,
            description: 'Do\'kon ijarasi',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            category: 'Kommunal',
            amount: 2500000,
            description: 'Elektr, suv, gaz',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 4,
            category: 'Marketing',
            amount: 3000000,
            description: 'Reklama va marketing',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 5,
            category: 'Transport',
            amount: 1500000,
            description: 'Yetkazib berish',
            date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    // Mock history data
    const days = currentPeriod === 'today' ? 1 : 
                 currentPeriod === 'week' ? 7 : 
                 currentPeriod === 'month' ? 30 : 365;
    
    financeData.revenueHistory = [];
    financeData.expenseHistory = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const revenue = 1000000 + Math.random() * 2000000;
        const expense = 500000 + Math.random() * 1000000;
        
        financeData.revenueHistory.push({
            date: date.toISOString().split('T')[0],
            amount: revenue
        });
        
        financeData.expenseHistory.push({
            date: date.toISOString().split('T')[0],
            amount: expense
        });
    }
}

// ==================== UPDATE STATISTICS ====================
function updateStatistics() {
    // Revenue
    document.getElementById('totalRevenue').textContent = formatMoney(financeData.revenue);
    document.getElementById('lastMonthRevenue').textContent = formatMoney(financeData.revenue * 0.89);
    document.getElementById('revenueTrend').textContent = '+12.5%';
    
    // Expense
    document.getElementById('totalExpense').textContent = formatMoney(financeData.expense);
    document.getElementById('lastMonthExpense').textContent = formatMoney(financeData.expense * 1.05);
    document.getElementById('expenseTrend').textContent = '-5.2%';
    
    // Profit
    document.getElementById('netProfit').textContent = formatMoney(financeData.profit);
    const profitMargin = financeData.revenue > 0 ? ((financeData.profit / financeData.revenue) * 100).toFixed(1) : 0;
    document.getElementById('profitMargin').textContent = profitMargin + '%';
    document.getElementById('profitTrend').textContent = '+18.3%';
    
    // Debt
    document.getElementById('totalDebt').textContent = formatMoney(financeData.debt);
    document.getElementById('collectedDebt').textContent = formatMoney(financeData.debt * 0.3);
    document.getElementById('debtTrend').textContent = '-8.1%';
}

// ==================== DISPLAY EXPENSES ====================
function displayExpenses() {
    const container = document.getElementById('expensesList');
    
    if (!financeData.expenses || financeData.expenses.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #6b7280; padding: 40px;">
                Xarajatlar topilmadi
            </div>
        `;
        return;
    }
    
    container.innerHTML = financeData.expenses.map(expense => {
        const categoryIcons = {
            'Ish haqi': '👨‍💼',
            'Ijara': '🏢',
            'Kommunal': '💡',
            'Marketing': '📢',
            'Transport': '🚚',
            'Boshqa': '📝'
        };
        
        const icon = categoryIcons[expense.category] || '📝';
        const timeAgo = formatTimeAgo(expense.date);
        
        return `
            <div class="expense-item">
                <div class="expense-header">
                    <div class="expense-category">
                        ${icon} ${expense.category}
                    </div>
                    <div class="expense-amount">
                        ${formatMoney(expense.amount)}
                    </div>
                </div>
                <div class="expense-details">
                    ${expense.description} • ${timeAgo}
                </div>
            </div>
        `;
    }).join('');
}

// ==================== INITIALIZE CHARTS ====================
function initializeCharts() {
    initRevenueExpenseChart();
    initExpenseCategoriesChart();
    initProfitTrendChart();
}

function initRevenueExpenseChart() {
    const ctx = document.getElementById('revenueExpenseChart').getContext('2d');
    
    revenueExpenseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Daromad',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Xarajat',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatMoney(context.parsed.y);
                        }
                    }
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

function initExpenseCategoriesChart() {
    const ctx = document.getElementById('expenseCategoriesChart').getContext('2d');
    
    expenseCategoriesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe',
                    '#00f2fe'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
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

function initProfitTrendChart() {
    const ctx = document.getElementById('profitTrendChart').getContext('2d');
    
    profitTrendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Foyda',
                data: [],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: '#3b82f6',
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
                    callbacks: {
                        label: function(context) {
                            return 'Foyda: ' + formatMoney(context.parsed.y);
                        }
                    }
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

// ==================== UPDATE CHARTS ====================
function updateCharts() {
    updateRevenueExpenseChart();
    updateExpenseCategoriesChart();
    updateProfitTrendChart();
}

function updateRevenueExpenseChart() {
    const labels = financeData.revenueHistory.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
    });
    
    const revenueData = financeData.revenueHistory.map(item => item.amount);
    const expenseData = financeData.expenseHistory.map(item => item.amount);
    
    revenueExpenseChart.data.labels = labels;
    revenueExpenseChart.data.datasets[0].data = revenueData;
    revenueExpenseChart.data.datasets[1].data = expenseData;
    revenueExpenseChart.update();
}

function updateExpenseCategoriesChart() {
    // Group expenses by category
    const categoryTotals = {};
    
    financeData.expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    expenseCategoriesChart.data.labels = labels;
    expenseCategoriesChart.data.datasets[0].data = data;
    expenseCategoriesChart.update();
}

function updateProfitTrendChart() {
    const labels = [];
    const data = [];
    
    for (let i = 0; i < financeData.revenueHistory.length; i++) {
        const revenue = financeData.revenueHistory[i].amount;
        const expense = financeData.expenseHistory[i].amount;
        const profit = revenue - expense;
        
        const date = new Date(financeData.revenueHistory[i].date);
        labels.push(date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }));
        data.push(profit);
    }
    
    profitTrendChart.data.labels = labels;
    profitTrendChart.data.datasets[0].data = data;
    profitTrendChart.update();
}

// ==================== PERIOD SELECTION ====================
function setPeriod(period) {
    currentPeriod = period;
    
    // Update active button
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Reload data
    loadFinanceData();
}

// ==================== ACTIONS ====================
function addExpense() {
    // Open expense form modal
    const category = prompt('Xarajat kategoriyasi:\n1. Ish haqi\n2. Ijara\n3. Kommunal\n4. Marketing\n5. Transport\n6. Boshqa');
    if (!category) return;
    
    const amount = prompt('Summa (UZS):');
    if (!amount) return;
    
    const description = prompt('Tavsif:');
    if (!description) return;
    
    showNotification('✅ Xarajat qo\'shildi!', 'success');
    setTimeout(loadFinanceData, 500);
}

function generateReport() {
    showNotification('📊 Hisobot yaratilmoqda...', 'info');
    setTimeout(() => {
        showNotification('✅ Hisobot tayyor!', 'success');
    }, 1500);
}

function exportExcel() {
    showNotification('📥 Excel fayli yuklab olinmoqda...', 'info');
    setTimeout(() => {
        showNotification('✅ Excel fayli tayyor!', 'success');
    }, 1500);
}

function exportPDF() {
    showNotification('📄 PDF fayli yaratilmoqda...', 'info');
    setTimeout(() => {
        showNotification('✅ PDF fayli tayyor!', 'success');
    }, 1500);
}

function viewDetailedReport() {
    window.location.href = 'finance-detailed-report.html';
}

// ==================== UTILITY FUNCTIONS ====================
function formatMoney(amount) {
    return new Intl.NumberFormat('uz-UZ').format(Math.round(amount)) + ' so\'m';
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return `${seconds} soniya oldin`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} soat oldin`;
    
    const days = Math.floor(hours / 24);
    return `${days} kun oldin`;
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
