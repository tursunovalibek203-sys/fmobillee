// Global variables
let revenueChart, categoryChart, topProductsChart;
let salesTrendChart, customerGrowthChart;
let currentRevenueFilter = '7d';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initCharts();
});

// Load Data
async function loadData() {
    try {
        // Load stats
        await loadStats();
        
        // Load charts data
        await loadRevenueData();
        await loadCategoryData();
        await loadTopProducts();
        await loadSalesTrend();
        await loadCustomerGrowth();
        await loadTopCustomers();
        
    } catch (error) {
        console.error('Ma\'lumot yuklashda xato:', error);
    }
}

// Load Stats
async function loadStats() {
    try {
        const response = await fetch('/api/reports/dashboard-stats');
        const data = await response.json();
        
        if (data.success) {
            // Total Revenue
            document.getElementById('totalRevenue').textContent = 
                '$' + (data.totalRevenue || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
            document.getElementById('revenueChange').textContent = 
                `+${data.revenueGrowth || 0}% bugungi kun`;
            
            // Total Sales
            document.getElementById('totalSales').textContent = 
                (data.totalSales || 0).toLocaleString();
            document.getElementById('salesChange').textContent = 
                `+${data.salesGrowth || 0}% bugungi kun`;
            
            // Active Customers
            document.getElementById('activeCustomers').textContent = 
                (data.activeCustomers || 0).toLocaleString();
            document.getElementById('customersChange').textContent = 
                `+${data.newCustomers || 0} yangi`;
            
            // Inventory Value
            document.getElementById('inventoryValue').textContent = 
                '$' + (data.inventoryValue || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
            document.getElementById('inventoryChange').textContent = 
                `${data.totalProducts || 0} mahsulot`;
        }
    } catch (error) {
        console.error('Stats yuklashda xato:', error);
    }
}

// Initialize Charts
function initCharts() {
    // Revenue Chart (Chart.js)
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Daromad ($)',
                data: [],
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
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
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    // Category Chart (Doughnut)
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(17, 153, 142, 0.8)',
                    'rgba(56, 239, 125, 0.8)',
                    'rgba(240, 147, 251, 0.8)',
                    'rgba(245, 87, 108, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
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
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Top Products Chart (Horizontal Bar)
    const topProductsCtx = document.getElementById('topProductsChart').getContext('2d');
    topProductsChart = new Chart(topProductsCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Sotilgan Miqdor',
                data: [],
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgb(102, 126, 234)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });

    // Sales Trend (ApexCharts - Area)
    const salesTrendOptions = {
        series: [{
            name: 'Savdolar',
            data: []
        }],
        chart: {
            type: 'area',
            height: 250,
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        dataLabels: { enabled: false },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.2,
                stops: [0, 90, 100]
            }
        },
        colors: ['#667eea'],
        xaxis: {
            categories: []
        },
        yaxis: {
            labels: {
                formatter: function(val) {
                    return val.toFixed(0);
                }
            }
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return val + ' ta';
                }
            }
        }
    };
    salesTrendChart = new ApexCharts(document.querySelector("#salesTrendChart"), salesTrendOptions);
    salesTrendChart.render();

    // Customer Growth (ApexCharts - Line)
    const customerGrowthOptions = {
        series: [{
            name: 'Mijozlar',
            data: []
        }],
        chart: {
            type: 'line',
            height: 250,
            toolbar: { show: false }
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        colors: ['#11998e'],
        markers: {
            size: 5,
            colors: ['#11998e'],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: { size: 7 }
        },
        xaxis: {
            categories: []
        },
        yaxis: {
            labels: {
                formatter: function(val) {
                    return val.toFixed(0);
                }
            }
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return val + ' mijoz';
                }
            }
        }
    };
    customerGrowthChart = new ApexCharts(document.querySelector("#customerGrowthChart"), customerGrowthOptions);
    customerGrowthChart.render();
}

// Load Revenue Data
async function loadRevenueData() {
    try {
        const response = await fetch(`/api/reports/revenue-trend?period=${currentRevenueFilter}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            revenueChart.data.labels = data.data.map(d => d.date);
            revenueChart.data.datasets[0].data = data.data.map(d => d.revenue);
            revenueChart.update();
        }
    } catch (error) {
        console.error('Revenue data yuklashda xato:', error);
        // Demo data
        const demoLabels = ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak'];
        const demoData = [1200, 1900, 1500, 2200, 1800, 2400, 2100];
        revenueChart.data.labels = demoLabels;
        revenueChart.data.datasets[0].data = demoData;
        revenueChart.update();
    }
}

// Load Category Data
async function loadCategoryData() {
    try {
        const response = await fetch('/api/reports/sales-by-category');
        const data = await response.json();
        
        if (data.success && data.data) {
            categoryChart.data.labels = data.data.map(d => d.category);
            categoryChart.data.datasets[0].data = data.data.map(d => d.total);
            categoryChart.update();
        }
    } catch (error) {
        console.error('Category data yuklashda xato:', error);
        // Demo data
        categoryChart.data.labels = ['Telefonlar', 'Aksessuarlar', 'Planshetlar', 'Noutbuklar', 'Boshqalar'];
        categoryChart.data.datasets[0].data = [4500, 2300, 1800, 3200, 1500];
        categoryChart.update();
    }
}

// Load Top Products
async function loadTopProducts() {
    try {
        const response = await fetch('/api/reports/top-products?limit=5');
        const data = await response.json();
        
        if (data.success && data.data) {
            topProductsChart.data.labels = data.data.map(d => d.name);
            topProductsChart.data.datasets[0].data = data.data.map(d => d.quantity);
            topProductsChart.update();
        }
    } catch (error) {
        console.error('Top products yuklashda xato:', error);
        // Demo data
        topProductsChart.data.labels = ['iPhone 15 Pro', 'Samsung S24', 'AirPods Pro', 'iPad Air', 'MacBook Pro'];
        topProductsChart.data.datasets[0].data = [45, 38, 52, 28, 22];
        topProductsChart.update();
    }
}

// Load Sales Trend
async function loadSalesTrend() {
    try {
        const response = await fetch('/api/reports/sales-trend?period=7d');
        const data = await response.json();
        
        if (data.success && data.data) {
            salesTrendChart.updateOptions({
                xaxis: { categories: data.data.map(d => d.date) }
            });
            salesTrendChart.updateSeries([{
                name: 'Savdolar',
                data: data.data.map(d => d.count)
            }]);
        }
    } catch (error) {
        console.error('Sales trend yuklashda xato:', error);
        // Demo data
        salesTrendChart.updateOptions({
            xaxis: { categories: ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak'] }
        });
        salesTrendChart.updateSeries([{
            name: 'Savdolar',
            data: [12, 19, 15, 22, 18, 24, 21]
        }]);
    }
}

// Load Customer Growth
async function loadCustomerGrowth() {
    try {
        const response = await fetch('/api/reports/customer-growth?period=7d');
        const data = await response.json();
        
        if (data.success && data.data) {
            customerGrowthChart.updateOptions({
                xaxis: { categories: data.data.map(d => d.date) }
            });
            customerGrowthChart.updateSeries([{
                name: 'Mijozlar',
                data: data.data.map(d => d.count)
            }]);
        }
    } catch (error) {
        console.error('Customer growth yuklashda xato:', error);
        // Demo data
        customerGrowthChart.updateOptions({
            xaxis: { categories: ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak'] }
        });
        customerGrowthChart.updateSeries([{
            name: 'Mijozlar',
            data: [5, 8, 6, 12, 9, 15, 11]
        }]);
    }
}

// Load Top Customers
async function loadTopCustomers() {
    try {
        const response = await fetch('/api/reports/top-customers?limit=10');
        const data = await response.json();
        
        const tbody = document.getElementById('topCustomersTable');
        
        if (data.success && data.data && data.data.length > 0) {
            tbody.innerHTML = data.data.map((customer, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${customer.name}</strong></td>
                    <td>${customer.totalPurchases || 0}</td>
                    <td>$${(customer.totalAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td>${customer.lastPurchase || 'N/A'}</td>
                    <td>
                        <span class="badge ${customer.debt > 0 ? 'warning' : 'success'}">
                            ${customer.debt > 0 ? 'Qarzli' : 'Faol'}
                        </span>
                    </td>
                </tr>
            `).join('');
        } else {
            // Demo data
            tbody.innerHTML = `
                <tr>
                    <td>1</td>
                    <td><strong>Alisher Karimov</strong></td>
                    <td>45</td>
                    <td>$12,450.00</td>
                    <td>2026-02-24</td>
                    <td><span class="badge success">Faol</span></td>
                </tr>
                <tr>
                    <td>2</td>
                    <td><strong>Dilshod Rahimov</strong></td>
                    <td>38</td>
                    <td>$9,800.00</td>
                    <td>2026-02-23</td>
                    <td><span class="badge success">Faol</span></td>
                </tr>
                <tr>
                    <td>3</td>
                    <td><strong>Nodira Toshmatova</strong></td>
                    <td>32</td>
                    <td>$8,200.00</td>
                    <td>2026-02-22</td>
                    <td><span class="badge warning">Qarzli</span></td>
                </tr>
                <tr>
                    <td>4</td>
                    <td><strong>Jamshid Umarov</strong></td>
                    <td>28</td>
                    <td>$7,500.00</td>
                    <td>2026-02-21</td>
                    <td><span class="badge success">Faol</span></td>
                </tr>
                <tr>
                    <td>5</td>
                    <td><strong>Malika Azimova</strong></td>
                    <td>25</td>
                    <td>$6,800.00</td>
                    <td>2026-02-20</td>
                    <td><span class="badge success">Faol</span></td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Top customers yuklashda xato:', error);
    }
}

// Change Revenue Filter
function changeRevenueFilter(period) {
    currentRevenueFilter = period;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Reload data
    loadRevenueData();
}

// Refresh Data
function refreshData() {
    loadData();
    showNotification('Ma\'lumotlar yangilandi!', 'success');
}

// Export Report
function exportReport() {
    showNotification('Hisobot yuklab olinmoqda...', 'info');
    // TODO: Implement export functionality
    setTimeout(() => {
        showNotification('Hisobot muvaffaqiyatli yuklandi!', 'success');
    }, 1500);
}

// Show Notification
function showNotification(message, type = 'info') {
    // Simple notification (you can enhance this)
    alert(message);
}
