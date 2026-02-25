// ==================== KASSIR DASHBOARD PROFESSIONAL ====================

let cashierData = {};
let salesChart = null;
let revenueChart = null;
let currentTimeFilter = 'day';
let currentRevenueFilter = 'day';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadCashierInfo();
    loadDashboardData();
    initializeCharts();
    
    // Auto-refresh every 60 seconds
    setInterval(() => {
        loadDashboardData();
        updateCharts();
    }, 60000);
});

// ==================== CASHIER INFO ====================
async function loadCashierInfo() {
    try {
        const cashierId = localStorage.getItem('cashierId');
        if (!cashierId) {
            window.location.href = 'cashier-login-enhanced.html';
            return;
        }

        const response = await fetch(`/api/cashier/${cashierId}`);
        if (response.ok) {
            cashierData = await response.json();
            document.getElementById('cashierInfo').textContent = 
                `Kassir: ${cashierData.name} | Filial: ${cashierData.branchId} | Balans: $${cashierData.balance || 0}`;
        }
    } catch (error) {
        console.error('Kassir ma\'lumotlarini yuklashda xato:', error);
    }
}

// ==================== DASHBOARD DATA ====================
async function loadDashboardData() {
    try {
        const cashierId = localStorage.getItem('cashierId');
        
        // Today's stats
        await loadTodayStats(cashierId);
        
        // Performance metrics
        await loadPerformanceMetrics(cashierId);
        
        // Top products
        await loadTopProducts(cashierId);
        
        // Activity feed
        await loadActivityFeed(cashierId);
        
    } catch (error) {
        console.error('Dashboard ma\'lumotlarini yuklashda xato:', error);
    }
}

async function loadTodayStats(cashierId) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/cashier-sales/${cashierId}?date=${today}&detailed=true`);
        
        if (response.ok) {
            const data = await response.json();
            
            // Update main stats
            document.getElementById('todaySales').textContent = data.totalSales || 0;
            document.getElementById('todayRevenue').textContent = formatMoney(data.totalAmount || 0);
            
            // Calculate progress (compared to weekly average)
            const weeklyAvg = await getWeeklyAverage(cashierId);
            const todayProgress = Math.min(100, ((data.totalSales || 0) / (weeklyAvg.sales || 1)) * 100);
            const revenueProgress = Math.min(100, ((data.totalAmount || 0) / (weeklyAvg.revenue || 1)) * 100);
            
            document.getElementById('todayProgress').style.width = todayProgress + '%';
            document.getElementById('revenueProgress').style.width = revenueProgress + '%';
            document.getElementById('weeklyAvg').textContent = formatMoney(weeklyAvg.revenue || 0);
            document.getElementById('weeklyProgress').style.width = Math.min(100, weeklyAvg.efficiency || 0) + '%';
            
            // Calculate efficiency
            const efficiency = calculateEfficiency(data);
            document.getElementById('efficiency').textContent = efficiency + '%';
            document.getElementById('efficiencyProgress').style.width = efficiency + '%';
        }
    } catch (error) {
        console.error('Bugungi statistikani yuklashda xato:', error);
    }
}

async function getWeeklyAverage(cashierId) {
    try {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const response = await fetch(`/api/cashier-sales/${cashierId}?from=${weekAgo.toISOString().split('T')[0]}&detailed=true`);
        
        if (response.ok) {
            const data = await response.json();
            return {
                sales: Math.round((data.totalSales || 0) / 7),
                revenue: (data.totalAmount || 0) / 7,
                efficiency: Math.min(100, ((data.totalSales || 0) / 50) * 100) // Assuming 50 sales per week is 100%
            };
        }
    } catch (error) {
        console.error('Haftalik o\'rtachani hisoblashda xato:', error);
    }
    
    return { sales: 0, revenue: 0, efficiency: 0 };
}

function calculateEfficiency(data) {
    // Simple efficiency calculation based on sales count and revenue
    const salesCount = data.totalSales || 0;
    const revenue = data.totalAmount || 0;
    
    if (salesCount === 0) return 0;
    
    const avgSaleValue = revenue / salesCount;
    const targetSaleValue = 50; // Target average sale value
    
    return Math.min(100, Math.round((avgSaleValue / targetSaleValue) * 100));
}

async function loadPerformanceMetrics(cashierId) {
    try {
        // Mock performance data - in real app, this would come from API
        document.getElementById('avgSaleTime').textContent = '45s';
        document.getElementById('errorRate').textContent = '2.1%';
        document.getElementById('customerSatisfaction').textContent = '94%';
    } catch (error) {
        console.error('Performance metrics yuklashda xato:', error);
    }
}

async function loadTopProducts(cashierId) {
    try {
        const response = await fetch(`/api/cashier-top-products/${cashierId}?limit=5`);
        
        if (response.ok) {
            const products = await response.json();
            displayTopProducts(products);
        } else {
            // Mock data if API not available
            const mockProducts = [
                { name: 'Telefon', count: 15, revenue: 1500 },
                { name: 'Noutbuk', count: 8, revenue: 4000 },
                { name: 'Quloqchin', count: 25, revenue: 750 },
                { name: 'Kabel', count: 30, revenue: 300 },
                { name: 'Zaryadlovchi', count: 20, revenue: 400 }
            ];
            displayTopProducts(mockProducts);
        }
    } catch (error) {
        console.error('Top mahsulotlarni yuklashda xato:', error);
    }
}

function displayTopProducts(products) {
    const container = document.getElementById('topProductsList');
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #6b7280; padding: 40px;">
                Ma'lumotlar topilmadi
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map((product, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">
                    ${index + 1}
                </div>
                <div>
                    <div style="font-weight: 600; color: #374151;">${product.name}</div>
                    <div style="font-size: 12px; color: #6b7280;">${product.count} ta sotildi</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: #059669;">${formatMoney(product.revenue || 0)}</div>
            </div>
        </div>
    `).join('');
}

async function loadActivityFeed(cashierId) {
    try {
        const response = await fetch(`/api/cashier-recent-sales/${cashierId}?limit=10`);
        
        if (response.ok) {
            const activities = await response.json();
            displayActivityFeed(activities);
        }
    } catch (error) {
        console.error('Faoliyat lentasini yuklashda xato:', error);
    }
}

function displayActivityFeed(activities) {
    const container = document.getElementById('activityFeed');
    
    if (!activities || activities.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #6b7280; padding: 40px;">
                Faoliyat topilmadi
            </div>
        `;
        return;
    }
    
    container.innerHTML = activities.map(activity => {
        const icon = getActivityIcon(activity.type);
        const iconBg = getActivityIconBg(activity.type);
        
        return `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${iconBg};">
                    ${icon}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.customerName} - ${activity.product}</div>
                    <div class="activity-time">${formatMoney(activity.price)} • ${formatTime(activity.createdAt)}</div>
                </div>
            </div>
        `;
    }).join('');
}

function getActivityIcon(type) {
    switch (type) {
        case 'payment': return '💰';
        case 'refund': return '↩️';
        default: return '🛒';
    }
}

function getActivityIconBg(type) {
    switch (type) {
        case 'payment': return '#d1fae5';
        case 'refund': return '#fef3c7';
        default: return '#dbeafe';
    }
}

// ==================== CHARTS ====================
function initializeCharts() {
    initSalesChart();
    initRevenueChart();
}

function initSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    salesChart = new Chart(ctx, {
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
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
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
    
    updateSalesChart();
}

function initRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Daromad',
                data: [],
                backgroundColor: 'rgba(118, 75, 162, 0.8)',
                borderColor: '#764ba2',
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
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
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
    
    updateRevenueChart();
}

async function updateSalesChart() {
    try {
        const cashierId = localStorage.getItem('cashierId');
        const data = await getSalesChartData(cashierId, currentTimeFilter);
        
        salesChart.data.labels = data.labels;
        salesChart.data.datasets[0].data = data.values;
        salesChart.update();
    } catch (error) {
        console.error('Sales chart yangilashda xato:', error);
    }
}

async function updateRevenueChart() {
    try {
        const cashierId = localStorage.getItem('cashierId');
        const data = await getRevenueChartData(cashierId, currentRevenueFilter);
        
        revenueChart.data.labels = data.labels;
        revenueChart.data.datasets[0].data = data.values;
        revenueChart.update();
    } catch (error) {
        console.error('Revenue chart yangilashda xato:', error);
    }
}

async function getSalesChartData(cashierId, timeFilter) {
    // Mock data - in real app, this would come from API
    const mockData = {
        day: {
            labels: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
            values: [2, 5, 3, 8, 12, 7, 9, 6, 4]
        },
        week: {
            labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
            values: [25, 32, 28, 45, 38, 52, 30]
        },
        month: {
            labels: ['1-hafta', '2-hafta', '3-hafta', '4-hafta'],
            values: [120, 145, 132, 168]
        }
    };
    
    return mockData[timeFilter] || mockData.day;
}

async function getRevenueChartData(cashierId, timeFilter) {
    // Mock data - in real app, this would come from API
    const mockData = {
        day: {
            labels: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
            values: [120, 250, 180, 400, 600, 350, 450, 300, 200]
        },
        week: {
            labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
            values: [1250, 1600, 1400, 2250, 1900, 2600, 1500]
        },
        month: {
            labels: ['1-hafta', '2-hafta', '3-hafta', '4-hafta'],
            values: [6000, 7250, 6600, 8400]
        }
    };
    
    return mockData[timeFilter] || mockData.day;
}

// ==================== FILTER FUNCTIONS ====================
function setTimeFilter(filter) {
    currentTimeFilter = filter;
    
    // Update active button
    document.querySelectorAll('.time-filter .time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updateSalesChart();
}

function setRevenueFilter(filter) {
    currentRevenueFilter = filter;
    
    // Update active button
    const revenueButtons = document.querySelectorAll('.chart-card:nth-child(2) .time-filter .time-btn');
    revenueButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    updateRevenueChart();
}

// ==================== ACTION FUNCTIONS ====================
function quickSale() {
    window.location.href = 'cashier-quick-actions.html';
}

function openCustomerSearch() {
    window.location.href = 'customer-search.html';
}

function openReports() {
    window.location.href = 'cashier-history-enhanced.html';
}

function openSettings() {
    // Open settings modal or page
    alert('Sozlamalar sahifasi tez orada qo\'shiladi!');
}

function refreshDashboard() {
    loadDashboardData();
    updateCharts();
    showNotification('🔄 Dashboard yangilandi', 'success');
}

function updateCharts() {
    updateSalesChart();
    updateRevenueChart();
}

// ==================== UTILITY FUNCTIONS ====================
function formatMoney(amount) {
    return '$' + parseFloat(amount || 0).toFixed(2);
}

function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit'
    });
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

function logout() {
    if (confirm('Haqiqatan ham chiqmoqchimisiz?')) {
        localStorage.removeItem('cashierId');
        localStorage.removeItem('cashierName');
        localStorage.removeItem('loginTime');
        window.location.href = 'cashier-login-enhanced.html';
    }
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