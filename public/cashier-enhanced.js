// ==================== KASSIR YAXSHILANGAN PANEL ====================

let currentCurrency = 'USD';
let exchangeRate = 12800; // 1 USD = 12800 UZS
let cashierData = {};
let recentSales = [];
let currentPage = 1;
const itemsPerPage = 10;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadCashierInfo();
    loadTodayStats();
    loadRecentSales();
    loadQuickStats();
    setDefaultDates();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        loadTodayStats();
        loadRecentSales();
    }, 30000);
});

// ==================== CURRENCY FUNCTIONS ====================
function setCurrency(currency) {
    currentCurrency = currency;
    
    // Update UI
    document.getElementById('usdBtn').classList.toggle('active', currency === 'USD');
    document.getElementById('uzsBtn').classList.toggle('active', currency === 'UZS');
    
    document.getElementById('currencyLabel').textContent = currency;
    document.getElementById('currencyLabel2').textContent = currency;
    
    // Refresh displays
    loadTodayStats();
    loadRecentSales();
    
    localStorage.setItem('preferredCurrency', currency);
}

function formatMoney(amount, currency = currentCurrency) {
    if (currency === 'UZS') {
        const uzsAmount = amount * exchangeRate;
        return new Intl.NumberFormat('uz-UZ').format(uzsAmount) + ' so\'m';
    } else {
        return '$' + parseFloat(amount).toFixed(2);
    }
}

// ==================== CASHIER INFO ====================
async function loadCashierInfo() {
    try {
        const cashierId = localStorage.getItem('cashierId');
        if (!cashierId) {
            window.location.href = 'cashier-login.html';
            return;
        }

        const response = await fetch(`/api/cashier/${cashierId}`);
        if (response.ok) {
            cashierData = await response.json();
            document.getElementById('cashierInfo').textContent = 
                `Kassir: ${cashierData.name} | Filial: ${cashierData.branchId}`;
            
            // Load preferred currency
            const savedCurrency = localStorage.getItem('preferredCurrency');
            if (savedCurrency) {
                setCurrency(savedCurrency);
            }
        }
    } catch (error) {
        console.error('Kassir ma\'lumotlarini yuklashda xato:', error);
    }
}

// ==================== STATISTICS ====================
async function loadTodayStats() {
    try {
        const cashierId = localStorage.getItem('cashierId');
        const today = new Date().toISOString().split('T')[0];
        
        const response = await fetch(`/api/cashier-sales/${cashierId}?date=${today}`);
        if (response.ok) {
            const stats = await response.json();
            
            document.getElementById('todaySales').textContent = stats.totalSales || 0;
            document.getElementById('todayAmount').textContent = formatMoney(stats.totalAmount || 0);
            document.getElementById('cashierBalance').textContent = formatMoney(cashierData.balance || 0);
            
            if (stats.lastSaleTime) {
                document.getElementById('lastSaleTime').textContent = 
                    new Date(stats.lastSaleTime).toLocaleTimeString('uz-UZ', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
            }
        }
    } catch (error) {
        console.error('Bugungi statistikani yuklashda xato:', error);
    }
}

async function loadQuickStats() {
    try {
        const cashierId = localStorage.getItem('cashierId');
        
        // Weekly stats
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weekResponse = await fetch(`/api/cashier-sales/${cashierId}?from=${weekStart.toISOString().split('T')[0]}`);
        
        if (weekResponse.ok) {
            const weekStats = await weekResponse.json();
            document.getElementById('weeklySales').textContent = weekStats.totalSales || 0;
        }
        
        // Monthly stats
        const monthStart = new Date();
        monthStart.setDate(monthStart.getDate() - 30);
        const monthResponse = await fetch(`/api/cashier-sales/${cashierId}?from=${monthStart.toISOString().split('T')[0]}`);
        
        if (monthResponse.ok) {
            const monthStats = await monthResponse.json();
            document.getElementById('monthlySales').textContent = monthStats.totalSales || 0;
        }
        
        // Top product
        const topProductResponse = await fetch(`/api/cashier-top-product/${cashierId}`);
        if (topProductResponse.ok) {
            const topProduct = await topProductResponse.json();
            document.getElementById('topProduct').textContent = topProduct.name || '--';
        }
        
    } catch (error) {
        console.error('Tezkor statistikani yuklashda xato:', error);
    }
}

// ==================== RECENT SALES ====================
async function loadRecentSales() {
    try {
        const cashierId = localStorage.getItem('cashierId');
        const response = await fetch(`/api/cashier-recent-sales/${cashierId}?limit=5`);
        
        if (response.ok) {
            recentSales = await response.json();
            displayRecentSales();
        }
    } catch (error) {
        console.error('So\'nggi savdolarni yuklashda xato:', error);
    }
}

function displayRecentSales() {
    const container = document.getElementById('recentSalesList');
    
    if (recentSales.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #6b7280; padding: 20px;">
                Hozircha savdolar yo'q
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentSales.map(sale => `
        <div class="sale-item">
            <div>
                <div style="font-weight: 700; color: #374151;">${sale.customerName}</div>
                <div style="font-size: 14px; color: #6b7280;">${sale.product}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: #059669;">${formatMoney(sale.price)}</div>
                <div style="font-size: 12px; color: #6b7280;">${formatTime(sale.createdAt)}</div>
            </div>
        </div>
    `).join('');
}

// ==================== SALE FUNCTIONS ====================
async function addSale() {
    const customerName = document.getElementById('customerName').value.trim();
    const productName = document.getElementById('productName').value.trim();
    const salePrice = parseFloat(document.getElementById('salePrice').value);
    const paidAmount = parseFloat(document.getElementById('paidAmount').value);
    const notes = document.getElementById('saleNotes').value.trim();
    
    // Validation
    if (!customerName || !productName || !salePrice || salePrice <= 0) {
        alert('Iltimos, barcha majburiy maydonlarni to\'ldiring!');
        return;
    }
    
    if (paidAmount < 0) {
        alert('To\'lov miqdori manfiy bo\'lishi mumkin emas!');
        return;
    }
    
    try {
        const cashierId = localStorage.getItem('cashierId');
        const saleData = {
            cashierId: parseInt(cashierId),
            cashierName: cashierData.name,
            branchId: cashierData.branchId,
            customerName,
            product: productName,
            price: currentCurrency === 'UZS' ? salePrice / exchangeRate : salePrice,
            paid: currentCurrency === 'UZS' ? paidAmount / exchangeRate : paidAmount,
            notes,
            currency: currentCurrency,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('uz-UZ')
        };
        
        const response = await fetch('/api/cashier-sale', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(saleData)
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Show success message
            showNotification('✅ Savdo muvaffaqiyatli qo\'shildi!', 'success');
            
            // Clear form
            clearForm();
            
            // Refresh data
            loadTodayStats();
            loadRecentSales();
            loadQuickStats();
            
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Savdo qo\'shishda xato');
        }
        
    } catch (error) {
        console.error('Savdo qo\'shishda xato:', error);
        showNotification('❌ Savdo qo\'shishda xato: ' + error.message, 'error');
    }
}

function clearForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('salePrice').value = '';
    document.getElementById('paidAmount').value = '';
    document.getElementById('saleNotes').value = '';
}

// ==================== HISTORY FUNCTIONS ====================
function setDefaultDates() {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    
    document.getElementById('historyDateFrom').value = weekAgo.toISOString().split('T')[0];
    document.getElementById('historyDateTo').value = today.toISOString().split('T')[0];
}

async function loadHistoryByDate() {
    const dateFrom = document.getElementById('historyDateFrom').value;
    const dateTo = document.getElementById('historyDateTo').value;
    
    if (!dateFrom || !dateTo) {
        alert('Iltimos, boshlanish va tugash sanalarini tanlang!');
        return;
    }
    
    if (new Date(dateFrom) > new Date(dateTo)) {
        alert('Boshlanish sanasi tugash sanasidan katta bo\'lishi mumkin emas!');
        return;
    }
    
    try {
        const cashierId = localStorage.getItem('cashierId');
        const response = await fetch(`/api/cashier-sales/${cashierId}?from=${dateFrom}&to=${dateTo}`);
        
        if (response.ok) {
            const data = await response.json();
            displayHistoryResults(data);
        }
    } catch (error) {
        console.error('Tarix ma\'lumotlarini yuklashda xato:', error);
        showNotification('❌ Tarix ma\'lumotlarini yuklashda xato', 'error');
    }
}

function displayHistoryResults(data) {
    const container = document.getElementById('historyResults');
    
    if (!data.sales || data.sales.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #6b7280; padding: 20px;">
                Tanlangan sanalar orasida savdolar topilmadi
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="background: #f0f9ff; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Jami savdolar:</span>
                <strong>${data.totalSales}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Jami summa:</span>
                <strong>${formatMoney(data.totalAmount)}</strong>
            </div>
        </div>
        
        <div style="max-height: 300px; overflow-y: auto;">
            ${data.sales.slice(0, 10).map(sale => `
                <div class="history-item">
                    <div>
                        <div style="font-weight: 600;">${sale.customerName}</div>
                        <div style="font-size: 12px; color: #6b7280;">${sale.product}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600; color: #059669;">${formatMoney(sale.price)}</div>
                        <div style="font-size: 12px; color: #6b7280;">${formatDate(sale.date)}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${data.sales.length > 10 ? `
            <div style="text-align: center; margin-top: 12px;">
                <button class="btn btn-secondary" onclick="openDetailedHistory()" style="font-size: 14px;">
                    Barchasini ko'rish (${data.sales.length})
                </button>
            </div>
        ` : ''}
    `;
}

// ==================== UTILITY FUNCTIONS ====================
function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('uz-UZ');
}

function showNotification(message, type = 'info') {
    // Create notification element
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
    
    // Set background color based on type
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
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
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

// ==================== NAVIGATION FUNCTIONS ====================
function refreshSales() {
    loadRecentSales();
    showNotification('🔄 Ma\'lumotlar yangilandi', 'info');
}

function openDetailedHistory() {
    window.location.href = 'cashier-history-enhanced.html';
}

function openQuickActions() {
    window.location.href = 'cashier-quick-actions.html';
}

function logout() {
    if (confirm('Haqiqatan ham chiqmoqchimisiz?')) {
        localStorage.removeItem('cashierId');
        localStorage.removeItem('cashierName');
        window.location.href = 'cashier-login.html';
    }
}

// ==================== CUSTOMER SUGGESTIONS ====================
let customerSuggestions = [];

document.getElementById('customerName').addEventListener('input', async function(e) {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    try {
        const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}&limit=5`);
        if (response.ok) {
            customerSuggestions = await response.json();
            showSuggestions();
        }
    } catch (error) {
        console.error('Mijoz qidirishda xato:', error);
    }
});

function showSuggestions() {
    const container = document.getElementById('customerSuggestions');
    
    if (customerSuggestions.length === 0) {
        hideSuggestions();
        return;
    }
    
    container.innerHTML = customerSuggestions.map(customer => `
        <div style="padding: 12px; cursor: pointer; border-bottom: 1px solid #f3f4f6;" 
             onclick="selectCustomer('${customer.name}')">
            <div style="font-weight: 600;">${customer.name}</div>
            ${customer.phone ? `<div style="font-size: 12px; color: #6b7280;">${customer.phone}</div>` : ''}
        </div>
    `).join('');
    
    container.style.display = 'block';
}

function hideSuggestions() {
    document.getElementById('customerSuggestions').style.display = 'none';
}

function selectCustomer(name) {
    document.getElementById('customerName').value = name;
    hideSuggestions();
}

// Hide suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('#customerName') && !e.target.closest('#customerSuggestions')) {
        hideSuggestions();
    }
});