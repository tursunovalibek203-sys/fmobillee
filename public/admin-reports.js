// HISOBOTLAR VA STATISTIKA - JavaScript

const API_URL = 'http://localhost:3000/api';

// Bugungi sanani o'rnatish
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dailyDate').value = today;
    
    const currentYear = new Date().getFullYear();
    document.getElementById('yearlyDate').value = currentYear;
    
    // Dastlabki yuklanish
    loadDailyReport();
});

// Tab o'zgartirish
function showTab(tabName) {
    // Barcha tablarni yashirish
    document.querySelectorAll('.content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Tanlangan tabni ko'rsatish
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Ma'lumotlarni yuklash
    switch(tabName) {
        case 'daily':
            loadDailyReport();
            break;
        case 'weekly':
            loadWeeklyReport();
            break;
        case 'monthly':
            loadMonthlyReport();
            break;
        case 'yearly':
            loadYearlyReport();
            break;
    }
}

// KUNLIK HISOBOT
async function loadDailyReport() {
    try {
        const date = document.getElementById('dailyDate').value;
        
        // Savdolarni olish
        const salesResponse = await fetch(`${API_URL}/cashier-sales`);
        const salesData = await salesResponse.json();
        
        // Bugungi savdolarni filtrlash
        const todaySales = salesData.sales.filter(sale => {
            return sale.date === new Date(date).toLocaleDateString('uz-UZ');
        });
        
        // Statistika hisoblash
        const totalRevenue = todaySales.reduce((sum, sale) => sum + (Number(sale.price) || 0), 0);
        const totalSales = todaySales.length;
        const uniqueCustomers = new Set(todaySales.map(s => s.customerId)).size;
        const totalProducts = todaySales.reduce((sum, sale) => sum + (Number(sale.quantity) || 1), 0);
        
        // Ko'rsatish
        document.getElementById('dailyRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('dailySales').textContent = totalSales;
        document.getElementById('dailyCustomers').textContent = uniqueCustomers;
        document.getElementById('dailyProducts').textContent = totalProducts;
        
        // Eng ko'p sotilgan mahsulotlar
        const productStats = {};
        todaySales.forEach(sale => {
            const product = sale.product;
            if (!productStats[product]) {
                productStats[product] = { count: 0, amount: 0 };
            }
            productStats[product].count += (sale.quantity || 1);
            productStats[product].amount += (sale.price || 0);
        });
        
        const topProducts = Object.entries(productStats)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10);
        
        const tbody = document.querySelector('#dailyTopProducts tbody');
        tbody.innerHTML = '';
        
        topProducts.forEach(([product, stats], index) => {
            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${product}</td>
                    <td>${stats.count}</td>
                    <td>$${stats.amount.toFixed(2)}</td>
                </tr>
            `;
        });
        
    } catch (error) {
        console.error('Kunlik hisobot xato:', error);
        alert('Kunlik hisobot yuklanmadi!');
    }
}

// HAFTALIK HISOBOT
async function loadWeeklyReport() {
    try {
        const salesResponse = await fetch(`${API_URL}/cashier-sales`);
        const salesData = await salesResponse.json();
        
        // Oxirgi 7 kunni olish
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const weekSales = salesData.sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return saleDate >= weekAgo && saleDate <= today;
        });
        
        // Statistika
        const totalRevenue = weekSales.reduce((sum, sale) => sum + (Number(sale.price) || 0), 0);
        const totalSales = weekSales.length;
        const averageDaily = totalRevenue / 7;
        
        // O'sish hisoblash (oldingi hafta bilan)
        const twoWeeksAgo = new Date(weekAgo);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
        
        const prevWeekSales = salesData.sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return saleDate >= twoWeeksAgo && saleDate < weekAgo;
        });
        
        const prevRevenue = prevWeekSales.reduce((sum, sale) => sum + (Number(sale.price) || 0), 0);
        const growth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0;
        
        // Ko'rsatish
        document.getElementById('weeklyRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('weeklySales').textContent = totalSales;
        document.getElementById('weeklyGrowth').textContent = `${growth.toFixed(1)}%`;
        document.getElementById('weeklyAverage').textContent = `$${averageDaily.toFixed(2)}`;
        
        // Grafik
        drawWeeklyChart(weekSales);
        
    } catch (error) {
        console.error('Haftalik hisobot xato:', error);
        alert('Haftalik hisobot yuklanmadi!');
    }
}

// OYLIK HISOBOT
async function loadMonthlyReport() {
    try {
        const monthInput = document.getElementById('monthlyDate').value || 
            new Date().toISOString().slice(0, 7);
        
        const [year, month] = monthInput.split('-');
        
        const salesResponse = await fetch(`${API_URL}/cashier-sales`);
        const salesData = await salesResponse.json();
        
        // Oylik savdolarni filtrlash
        const monthSales = salesData.sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return saleDate.getFullYear() === parseInt(year) && 
                   saleDate.getMonth() === parseInt(month) - 1;
        });
        
        // Statistika
        const totalRevenue = monthSales.reduce((sum, sale) => sum + (sale.price || 0), 0);
        const totalSales = monthSales.length;
        
        // Xarajatlar (agar mavjud bo'lsa)
        let totalExpenses = 0;
        try {
            const expensesResponse = await fetch(`${API_URL}/expenses`);
            const expensesData = await expensesResponse.json();
            
            const monthExpenses = expensesData.expenses.filter(exp => {
                const expDate = new Date(exp.createdAt);
                return expDate.getFullYear() === parseInt(year) && 
                       expDate.getMonth() === parseInt(month) - 1;
            });
            
            totalExpenses = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        } catch (e) {
            console.log('Xarajatlar topilmadi');
        }
        
        const profit = totalRevenue - totalExpenses;
        
        // Ko'rsatish
        document.getElementById('monthlyRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('monthlySales').textContent = totalSales;
        document.getElementById('monthlyExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
        document.getElementById('monthlyProfit').textContent = `$${profit.toFixed(2)}`;
        
        // Grafik
        drawMonthlyChart(monthSales, year, month);
        
    } catch (error) {
        console.error('Oylik hisobot xato:', error);
        alert('Oylik hisobot yuklanmadi!');
    }
}

// YILLIK HISOBOT
async function loadYearlyReport() {
    try {
        const year = document.getElementById('yearlyDate').value || new Date().getFullYear();
        
        const salesResponse = await fetch(`${API_URL}/cashier-sales`);
        const salesData = await salesResponse.json();
        
        // Yillik savdolarni filtrlash
        const yearSales = salesData.sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return saleDate.getFullYear() === parseInt(year);
        });
        
        // Statistika
        const totalRevenue = yearSales.reduce((sum, sale) => sum + (sale.price || 0), 0);
        const totalSales = yearSales.length;
        
        // O'tgan yil bilan taqqoslash
        const prevYearSales = salesData.sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return saleDate.getFullYear() === parseInt(year) - 1;
        });
        
        const prevRevenue = prevYearSales.reduce((sum, sale) => sum + (sale.price || 0), 0);
        const growth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0;
        
        // Eng yaxshi oy
        const monthlyStats = {};
        yearSales.forEach(sale => {
            const month = new Date(sale.createdAt).getMonth();
            if (!monthlyStats[month]) monthlyStats[month] = 0;
            monthlyStats[month] += (sale.price || 0);
        });
        
        const bestMonth = Object.entries(monthlyStats)
            .sort((a, b) => b[1] - a[1])[0];
        
        const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 
                           'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
        
        // Ko'rsatish
        document.getElementById('yearlyRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('yearlySales').textContent = totalSales;
        document.getElementById('yearlyGrowth').textContent = `${growth.toFixed(1)}%`;
        document.getElementById('bestMonth').textContent = bestMonth ? monthNames[bestMonth[0]] : '-';
        
        // Grafik
        drawYearlyChart(yearSales, year);
        
    } catch (error) {
        console.error('Yillik hisobot xato:', error);
        alert('Yillik hisobot yuklanmadi!');
    }
}

// HAFTALIK GRAFIK
function drawWeeklyChart(sales) {
    const ctx = document.getElementById('weeklyChart');
    
    // Kunlik ma'lumotlar
    const days = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
    const dailyRevenue = new Array(7).fill(0);
    
    sales.forEach(sale => {
        const day = new Date(sale.createdAt).getDay();
        const adjustedDay = day === 0 ? 6 : day - 1; // Dushanba = 0
        dailyRevenue[adjustedDay] += (sale.price || 0);
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Daromad ($)',
                data: dailyRevenue,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// OYLIK GRAFIK
function drawMonthlyChart(sales, year, month) {
    const ctx = document.getElementById('monthlyChart');
    
    // Kunlik ma'lumotlar
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyRevenue = new Array(daysInMonth).fill(0);
    const labels = Array.from({length: daysInMonth}, (_, i) => i + 1);
    
    sales.forEach(sale => {
        const day = new Date(sale.createdAt).getDate();
        dailyRevenue[day - 1] += (sale.price || 0);
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daromad ($)',
                data: dailyRevenue,
                backgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// YILLIK GRAFIK
function drawYearlyChart(sales, year) {
    const ctx = document.getElementById('yearlyChart');
    
    // Oylik ma'lumotlar
    const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 
                       'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const monthlyRevenue = new Array(12).fill(0);
    
    sales.forEach(sale => {
        const month = new Date(sale.createdAt).getMonth();
        monthlyRevenue[month] += (sale.price || 0);
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: [{
                label: 'Daromad ($)',
                data: monthlyRevenue,
                backgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// EXCEL EXPORT
async function exportReport(type) {
    alert(`${type.toUpperCase()} hisobot Excel ga yuklanmoqda...`);
    
    try {
        const response = await fetch(`${API_URL}/reports/export/${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: document.getElementById(`${type}Date`)?.value || new Date().toISOString()
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            
            alert('✅ Excel fayl yuklandi!');
        } else {
            alert('❌ Excel yuklanmadi!');
        }
    } catch (error) {
        console.error('Excel export xato:', error);
        alert('❌ Excel yuklanmadi!');
    }
}
