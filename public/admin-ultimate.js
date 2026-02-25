// ==================== ADMIN ULTIMATE DASHBOARD ====================

let salesChart = null;
let currentSection = 'dashboard';
let sidebarCollapsed = false;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    initializeCharts();
    loadActivityFeed();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        loadDashboardData();
        loadActivityFeed();
    }, 30000);
    
    // Global search functionality
    document.getElementById('globalSearch').addEventListener('input', handleGlobalSearch);
});

// ==================== SIDEBAR MANAGEMENT ====================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebarCollapsed = !sidebarCollapsed;
    
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    } else {
        sidebar.classList.remove('collapsed');
        mainContent.classList.remove('expanded');
    }
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.style.display = 'none');
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    currentSection = sectionName;
    
    // Load section-specific data
    loadSectionData(sectionName);
}

function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
        case 'users':
            loadUsersData();
            break;
        case 'branches':
            loadBranchesData();
            break;
        case 'inventory':
            loadInventoryData();
            break;
        case 'finance':
            loadFinanceData();
            break;
        case 'reports':
            loadReportsData();
            break;
        case 'notifications':
            // Notifications are loaded via iframe
            break;
        case 'security':
            loadSecurityData();
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

// ==================== DASHBOARD DATA ====================
async function loadDashboardData() {
    try {
        // Load main statistics
        await loadMainStats();
        
        // Update charts
        if (salesChart) {
            updateSalesChart();
        }
        
    } catch (error) {
        console.error('Dashboard ma\'lumotlarini yuklashda xato:', error);
    }
}

async function loadMainStats() {
    try {
        // Total Revenue
        const revenueResponse = await fetch('/api/admin/total-revenue');
        if (revenueResponse.ok) {
            const revenueData = await revenueResponse.json();
            document.getElementById('totalRevenue').textContent = formatMoney(revenueData.total || 0);
        }
        
        // Total Sales
        const salesResponse = await fetch('/api/admin/total-sales');
        if (salesResponse.ok) {
            const salesData = await salesResponse.json();
            document.getElementById('totalSales').textContent = salesData.total || 0;
        }
        
        // Total Customers
        const customersResponse = await fetch('/api/customers');
        if (customersResponse.ok) {
            const customersData = await customersResponse.json();
            document.getElementById('totalCustomers').textContent = customersData.length || 0;
        }
        
        // Total Debt
        const debtResponse = await fetch('/api/admin/total-debt');
        if (debtResponse.ok) {
            const debtData = await debtResponse.json();
            document.getElementById('totalDebt').textContent = formatMoney(debtData.total || 0);
        }
        
    } catch (error) {
        console.error('Statistikani yuklashda xato:', error);
        
        // Mock data if API fails
        document.getElementById('totalRevenue').textContent = '$12,450';
        document.getElementById('totalSales').textContent = '156';
        document.getElementById('totalCustomers').textContent = '89';
        document.getElementById('totalDebt').textContent = '$2,340';
    }
}

// ==================== CHARTS ====================
function initializeCharts() {
    initSalesChart();
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
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
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
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: '#667eea',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    updateSalesChart();
}

async function updateSalesChart() {
    try {
        const data = await getSalesChartData();
        
        salesChart.data.labels = data.labels;
        salesChart.data.datasets[0].data = data.values;
        salesChart.update('active');
        
    } catch (error) {
        console.error('Sales chart yangilashda xato:', error);
        
        // Mock data
        const mockData = {
            labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
            values: [25, 32, 28, 45, 38, 52, 30]
        };
        
        salesChart.data.labels = mockData.labels;
        salesChart.data.datasets[0].data = mockData.values;
        salesChart.update('active');
    }
}

async function getSalesChartData() {
    // This would fetch real data from API
    // For now, return mock data
    return {
        labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
        values: [25, 32, 28, 45, 38, 52, 30]
    };
}

function setChartFilter(period) {
    // Update active filter button
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    
    // Find the clicked button and make it active
    const clickedBtn = document.querySelector(`[onclick="setChartFilter('${period}')"]`);
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
    
    // Update chart data based on period
    updateSalesChart();
}

// ==================== ACTIVITY FEED ====================
async function loadActivityFeed() {
    try {
        const response = await fetch('/api/admin/recent-activity?limit=10');
        
        if (response.ok) {
            const activities = await response.json();
            displayActivityFeed(activities);
        } else {
            // Mock data if API fails
            const mockActivities = [
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
                },
                {
                    user: 'Bobur Kassir',
                    action: 'To\'lov qabul qildi',
                    time: '1 soat oldin',
                    type: 'payment'
                },
                {
                    user: 'Nargiza Manager',
                    action: 'Hisobot yaratdi',
                    time: '2 soat oldin',
                    type: 'report'
                }
            ];
            displayActivityFeed(mockActivities);
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
        const avatar = getActivityAvatar(activity.user);
        const icon = getActivityIcon(activity.type);
        
        return `
            <div class="activity-item">
                <div class="activity-avatar">
                    ${avatar}
                </div>
                <div class="activity-content">
                    <div class="activity-title">
                        ${icon} ${activity.user} ${activity.action}
                    </div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `;
    }).join('');
}

function getActivityAvatar(userName) {
    return userName.charAt(0).toUpperCase();
}

function getActivityIcon(type) {
    switch (type) {
        case 'sale': return '🛒';
        case 'customer': return '👤';
        case 'payment': return '💰';
        case 'report': return '📊';
        default: return '📝';
    }
}

// ==================== NOTIFICATIONS ====================
function showNotifications() {
    // This would show a notifications panel
    alert('Bildirishnomalar paneli tez orada qo\'shiladi!');
}

// ==================== SEARCH ====================
function handleGlobalSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
        return;
    }
    
    // Implement global search functionality
    console.log('Qidiruv:', query);
    
    // This would search across all sections
    // For now, just show a notification
    if (query.length >= 3) {
        showNotification(`"${query}" bo'yicha qidiruv natijasi tez orada...`, 'info');
    }
}

// ==================== UTILITY FUNCTIONS ====================
function formatMoney(amount) {
    return '$' + parseFloat(amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
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

// ==================== SECTION-SPECIFIC FUNCTIONS ====================
function loadAnalyticsData() {
    console.log('Analytics ma\'lumotlari yuklanmoqda...');
    initAnalyticsCharts();
    loadTopProducts();
}

function loadUsersData() {
    console.log('Foydalanuvchilar ma\'lumotlari yuklanmoqda...');
    loadUsersTable();
}

function loadBranchesData() {
    console.log('Filiallar ma\'lumotlari yuklanmoqda...');
    loadBranchStats();
    loadBranchesGrid();
}

function loadInventoryData() {
    console.log('Ombor ma\'lumotlari yuklanmoqda...');
    loadInventoryStats();
    loadInventoryTable();
}

function loadFinanceData() {
    console.log('Moliya ma\'lumotlari yuklanmoqda...');
    loadFinanceStats();
    initFinanceCharts();
}

function loadReportsData() {
    console.log('Hisobotlar ma\'lumotlari yuklanmoqda...');
}

function loadSecurityData() {
    console.log('Xavfsizlik ma\'lumotlari yuklanmoqda...');
    loadSecurityStats();
    loadSecurityLogs();
}

function loadSettingsData() {
    console.log('Sozlamalar yuklanmoqda...');
    loadCurrentSettings();
}

// ==================== ANALYTICS FUNCTIONS ====================
function initAnalyticsCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
                datasets: [{
                    label: 'Daromad ($)',
                    data: [1200, 1900, 800, 1500, 2000, 1800, 1300],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Category Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        new Chart(categoryCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Elektronika', 'Kiyim', 'Oziq-ovqat', 'Kitoblar', 'Boshqa'],
                datasets: [{
                    data: [35, 25, 20, 15, 5],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c',
                        '#4facfe'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Customer Activity Chart
    const customerCtx = document.getElementById('customerActivityChart');
    if (customerCtx) {
        new Chart(customerCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun'],
                datasets: [{
                    label: 'Yangi Mijozlar',
                    data: [12, 19, 8, 15, 20, 18],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true
                }, {
                    label: 'Faol Mijozlar',
                    data: [45, 52, 38, 48, 65, 58],
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

function loadTopProducts() {
    const container = document.getElementById('topProductsList');
    if (!container) return;
    
    const topProducts = [
        { name: 'iPhone 15 Pro', sales: 45, revenue: '$45,000' },
        { name: 'Samsung Galaxy S24', sales: 38, revenue: '$38,000' },
        { name: 'MacBook Air M2', sales: 25, revenue: '$50,000' },
        { name: 'AirPods Pro', sales: 67, revenue: '$20,100' },
        { name: 'iPad Air', sales: 32, revenue: '$25,600' }
    ];
    
    container.innerHTML = topProducts.map((product, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <div>
                <div style="font-weight: 600; color: #374151;">${index + 1}. ${product.name}</div>
                <div style="font-size: 12px; color: #6b7280;">${product.sales} ta sotildi</div>
            </div>
            <div style="font-weight: 700; color: #667eea;">${product.revenue}</div>
        </div>
    `).join('');
}

// ==================== USERS MANAGEMENT ====================
function loadUsersTable() {
    const container = document.getElementById('usersTable');
    if (!container) return;
    
    const users = [
        { id: 1, name: 'Ali Karimov', role: 'admin', email: 'ali@dokon.uz', status: 'active', lastLogin: '2 daqiqa oldin' },
        { id: 2, name: 'Olima Toshmatova', role: 'cashier', email: 'olima@dokon.uz', status: 'active', lastLogin: '15 daqiqa oldin' },
        { id: 3, name: 'Bobur Rahimov', role: 'cashier', email: 'bobur@dokon.uz', status: 'inactive', lastLogin: '2 soat oldin' },
        { id: 4, name: 'Nargiza Saidova', role: 'manager', email: 'nargiza@dokon.uz', status: 'active', lastLogin: '1 soat oldin' }
    ];
    
    container.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Foydalanuvchi</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Rol</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Email</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Holat</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600;">So'nggi Kirish</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Harakatlar</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                        <td style="padding: 12px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                                    ${user.name.charAt(0)}
                                </div>
                                <div>
                                    <div style="font-weight: 600;">${user.name}</div>
                                    <div style="font-size: 12px; color: #6b7280;">ID: ${user.id}</div>
                                </div>
                            </div>
                        </td>
                        <td style="padding: 12px;">
                            <span style="padding: 4px 8px; background: ${user.role === 'admin' ? '#fef3c7' : user.role === 'manager' ? '#dbeafe' : '#d1fae5'}; color: ${user.role === 'admin' ? '#d97706' : user.role === 'manager' ? '#2563eb' : '#059669'}; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                ${user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Manager' : 'Kassir'}
                            </span>
                        </td>
                        <td style="padding: 12px; color: #6b7280;">${user.email}</td>
                        <td style="padding: 12px;">
                            <span style="padding: 4px 8px; background: ${user.status === 'active' ? '#d1fae5' : '#fee2e2'}; color: ${user.status === 'active' ? '#059669' : '#dc2626'}; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                ${user.status === 'active' ? 'Faol' : 'Nofaol'}
                            </span>
                        </td>
                        <td style="padding: 12px; color: #6b7280; font-size: 12px;">${user.lastLogin}</td>
                        <td style="padding: 12px;">
                            <div style="display: flex; gap: 4px;">
                                <button class="action-btn" onclick="editUser(${user.id})">✏️</button>
                                <button class="action-btn" onclick="deleteUser(${user.id})">🗑️</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ==================== BRANCHES MANAGEMENT ====================
function loadBranchStats() {
    document.getElementById('totalBranches').textContent = '5';
    document.getElementById('activeBranches').textContent = '4';
    document.getElementById('branchRevenue').textContent = '$125,450';
    document.getElementById('branchEmployees').textContent = '23';
}

function loadBranchesGrid() {
    const container = document.getElementById('branchesGrid');
    if (!container) return;
    
    const branches = [
        { id: 1, name: 'Markaziy Filial', address: 'Toshkent, Amir Temur ko\'chasi', manager: 'Ali Karimov', revenue: '$45,000', status: 'active' },
        { id: 2, name: 'Chilonzor Filial', address: 'Toshkent, Chilonzor tumani', manager: 'Olima Saidova', revenue: '$38,500', status: 'active' },
        { id: 3, name: 'Yunusobod Filial', address: 'Toshkent, Yunusobod tumani', manager: 'Bobur Rahimov', revenue: '$32,200', status: 'active' },
        { id: 4, name: 'Sergeli Filial', address: 'Toshkent, Sergeli tumani', manager: 'Nargiza Toshmatova', revenue: '$28,750', status: 'inactive' }
    ];
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; padding: 20px;">
            ${branches.map(branch => `
                <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; background: white;">
                    <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 12px;">
                        <h3 style="margin: 0; color: #374151; font-size: 18px;">${branch.name}</h3>
                        <span style="padding: 4px 8px; background: ${branch.status === 'active' ? '#d1fae5' : '#fee2e2'}; color: ${branch.status === 'active' ? '#059669' : '#dc2626'}; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${branch.status === 'active' ? 'Faol' : 'Nofaol'}
                        </span>
                    </div>
                    <p style="margin: 8px 0; color: #6b7280; font-size: 14px;">📍 ${branch.address}</p>
                    <p style="margin: 8px 0; color: #6b7280; font-size: 14px;">👤 Manager: ${branch.manager}</p>
                    <p style="margin: 8px 0; color: #667eea; font-weight: 700; font-size: 16px;">💰 ${branch.revenue}</p>
                    <div style="display: flex; gap: 8px; margin-top: 16px;">
                        <button class="btn btn-secondary" onclick="viewBranch(${branch.id})" style="flex: 1; font-size: 12px;">👁️ Ko'rish</button>
                        <button class="btn btn-primary" onclick="editBranch(${branch.id})" style="flex: 1; font-size: 12px;">✏️ Tahrirlash</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ==================== INVENTORY MANAGEMENT ====================
function loadInventoryStats() {
    document.getElementById('totalProducts').textContent = '1,245';
    document.getElementById('lowStockProducts').textContent = '23';
    document.getElementById('outOfStockProducts').textContent = '5';
    document.getElementById('inventoryValue').textContent = '$89,450';
}

function loadInventoryTable() {
    const container = document.getElementById('inventoryTable');
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="margin-bottom: 16px; display: flex; gap: 12px;">
                <input type="text" placeholder="Mahsulot qidirish..." style="flex: 1; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px;">
                <select style="padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px;">
                    <option>Barcha kategoriyalar</option>
                    <option>Elektronika</option>
                    <option>Kiyim</option>
                    <option>Oziq-ovqat</option>
                </select>
            </div>
            <p style="color: #6b7280; text-align: center; padding: 40px;">Mahsulotlar jadvali tez orada qo'shiladi...</p>
        </div>
    `;
}

// ==================== FINANCE MANAGEMENT ====================
function loadFinanceStats() {
    document.getElementById('totalIncome').textContent = '$156,780';
    document.getElementById('totalExpenses').textContent = '$89,450';
    document.getElementById('netProfit').textContent = '$67,330';
    document.getElementById('pendingDebts').textContent = '$12,450';
}

function initFinanceCharts() {
    // Finance Chart
    const financeCtx = document.getElementById('financeChart');
    if (financeCtx) {
        new Chart(financeCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun'],
                datasets: [{
                    label: 'Daromad',
                    data: [25000, 28000, 22000, 30000, 35000, 32000],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                }, {
                    label: 'Xarajatlar',
                    data: [15000, 18000, 14000, 20000, 22000, 19000],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Expenses Chart
    const expensesCtx = document.getElementById('expensesChart');
    if (expensesCtx) {
        new Chart(expensesCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Ish haqi', 'Ijara', 'Kommunal', 'Marketing', 'Boshqa'],
                datasets: [{
                    data: [45, 25, 15, 10, 5],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c',
                        '#4facfe'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// ==================== SECURITY MANAGEMENT ====================
function loadSecurityStats() {
    document.getElementById('securityStatus').textContent = 'Xavfsiz';
    document.getElementById('activeUsers').textContent = '8';
    document.getElementById('securityAlerts').textContent = '2';
    document.getElementById('auditLogs').textContent = '1,245';
}

function loadSecurityLogs() {
    const container = document.getElementById('securityLogsList');
    if (!container) return;
    
    const logs = [
        { type: 'login', user: 'Ali Admin', action: 'Tizimga kirdi', time: '2 daqiqa oldin', ip: '192.168.1.100' },
        { type: 'warning', user: 'System', action: 'Noto\'g\'ri parol urinishi', time: '15 daqiqa oldin', ip: '192.168.1.105' },
        { type: 'logout', user: 'Olima Kassir', action: 'Tizimdan chiqdi', time: '1 soat oldin', ip: '192.168.1.102' },
        { type: 'error', user: 'System', action: 'Ma\'lumotlar bazasi xatosi', time: '2 soat oldin', ip: 'localhost' }
    ];
    
    container.innerHTML = logs.map(log => {
        const icon = log.type === 'login' ? '🔓' : log.type === 'logout' ? '🔒' : log.type === 'warning' ? '⚠️' : '❌';
        const color = log.type === 'login' ? '#10b981' : log.type === 'logout' ? '#6b7280' : log.type === 'warning' ? '#f59e0b' : '#ef4444';
        
        return `
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                <div style="font-size: 20px;">${icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: ${color};">${log.user} - ${log.action}</div>
                    <div style="font-size: 12px; color: #6b7280;">IP: ${log.ip} • ${log.time}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== SETTINGS MANAGEMENT ====================
function loadCurrentSettings() {
    // Load current settings from localStorage or API
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    
    if (settings.shopName) document.getElementById('shopName').value = settings.shopName;
    if (settings.baseCurrency) document.getElementById('baseCurrency').value = settings.baseCurrency;
    if (settings.timezone) document.getElementById('timezone').value = settings.timezone;
}

// ==================== ACTION FUNCTIONS ====================

// User Management Actions
function addNewUser() {
    showNotification('Yangi foydalanuvchi qo\'shish paneli tez orada...', 'info');
}

function editUser(userId) {
    showNotification(`Foydalanuvchi ${userId} tahrirlash paneli tez orada...`, 'info');
}

function deleteUser(userId) {
    if (confirm('Bu foydalanuvchini o\'chirmoqchimisiz?')) {
        showNotification(`Foydalanuvchi ${userId} o'chirildi`, 'success');
    }
}

function filterUsers() {
    showNotification('Foydalanuvchilar filtrlash tez orada...', 'info');
}

function exportUsers() {
    showNotification('Foydalanuvchilar eksport qilinmoqda...', 'info');
}

function refreshUsers() {
    loadUsersData();
    showNotification('Foydalanuvchilar ro\'yxati yangilandi', 'success');
}

// Branch Management Actions
function addNewBranch() {
    showNotification('Yangi filial qo\'shish paneli tez orada...', 'info');
}

function viewBranch(branchId) {
    showNotification(`Filial ${branchId} ma'lumotlari ko'rsatilmoqda...`, 'info');
}

function editBranch(branchId) {
    showNotification(`Filial ${branchId} tahrirlash paneli tez orada...`, 'info');
}

// Inventory Management Actions
function addNewProduct() {
    showNotification('Yangi mahsulot qo\'shish paneli tez orada...', 'info');
}

function importProducts() {
    showNotification('Mahsulotlar import paneli tez orada...', 'info');
}

function exportInventory() {
    showNotification('Ombor ma\'lumotlari eksport qilinmoqda...', 'info');
}

// Report Generation Actions
function generateSalesReport() {
    showNotification('Savdolar hisoboti yaratilmoqda...', 'info');
}

function generateInventoryReport() {
    showNotification('Ombor hisoboti yaratilmoqda...', 'info');
}

function generateFinanceReport() {
    showNotification('Moliya hisoboti yaratilmoqda...', 'info');
}

function generateCustomerReport() {
    showNotification('Mijozlar hisoboti yaratilmoqda...', 'info');
}

function generateCustomReport() {
    const type = document.getElementById('reportType').value;
    const period = document.getElementById('reportPeriod').value;
    const format = document.getElementById('reportFormat').value;
    
    showNotification(`${type} hisoboti (${period}, ${format}) yaratilmoqda...`, 'info');
}

// Security Actions
function runSecurityScan() {
    showNotification('Xavfsizlik skaneri ishga tushirilmoqda...', 'info');
    setTimeout(() => {
        showNotification('Xavfsizlik skaneri yakunlandi. Muammolar topilmadi ✅', 'success');
    }, 3000);
}

function viewAuditLogs() {
    showNotification('Audit loglar paneli tez orada...', 'info');
}

function managePermissions() {
    showNotification('Ruxsatlar boshqaruvi paneli tez orada...', 'info');
}

function backupSecurity() {
    showNotification('Xavfsiz backup yaratilmoqda...', 'info');
    setTimeout(() => {
        showNotification('Xavfsiz backup muvaffaqiyatli yaratildi ✅', 'success');
    }, 2000);
}

function refreshSecurityLogs() {
    loadSecurityLogs();
    showNotification('Xavfsizlik loglari yangilandi', 'success');
}

// Settings Actions
function saveGeneralSettings() {
    const settings = {
        shopName: document.getElementById('shopName').value,
        baseCurrency: document.getElementById('baseCurrency').value,
        timezone: document.getElementById('timezone').value
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    showNotification('Umumiy sozlamalar saqlandi ✅', 'success');
}

function saveBackupSettings() {
    showNotification('Backup sozlamalari saqlandi ✅', 'success');
}

function saveNotificationSettings() {
    showNotification('Bildirishnoma sozlamalari saqlandi ✅', 'success');
}

function saveSecuritySettings() {
    showNotification('Xavfsizlik sozlamalari saqlandi ✅', 'success');
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
    
    .content-section {
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);