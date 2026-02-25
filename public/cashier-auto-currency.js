// ==================== AVTOMATIK VALYUTA KONVERTATSIYASI ====================

let cashierData = {};
let selectedCurrency = 'UZS';
let exchangeRates = {
    USD: 12650,
    EUR: 13800,
    RUB: 135,
    UZS: 1
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadCashierInfo();
    loadExchangeRates();
    loadRecentSales();
    
    // Auto-refresh recent sales every 30 seconds
    setInterval(loadRecentSales, 30000);
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
                `Kassir: ${cashierData.name} | Filial: ${cashierData.branchId}`;
        }
    } catch (error) {
        console.error('Kassir ma\'lumotlarini yuklashda xato:', error);
    }
}

// ==================== EXCHANGE RATES ====================
function loadExchangeRates() {
    const saved = localStorage.getItem('exchangeRates');
    if (saved) {
        exchangeRates = JSON.parse(saved);
        document.getElementById('usdRate').value = exchangeRates.USD;
        document.getElementById('eurRate').value = exchangeRates.EUR;
        document.getElementById('rubRate').value = exchangeRates.RUB;
    }
}

function saveExchangeRate() {
    exchangeRates.USD = parseFloat(document.getElementById('usdRate').value) || 12650;
    exchangeRates.EUR = parseFloat(document.getElementById('eurRate').value) || 13800;
    exchangeRates.RUB = parseFloat(document.getElementById('rubRate').value) || 135;
    
    localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
    
    // Recalculate if there's a price
    calculateTotal();
    
    showNotification('✅ Valyuta kursi saqlandi', 'success');
}

async function updateExchangeRate() {
    // In real app, this would fetch from API
    showNotification('🔄 Valyuta kursi yangilanmoqda...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        // Mock updated rates
        exchangeRates.USD = 12650 + Math.floor(Math.random() * 100 - 50);
        exchangeRates.EUR = 13800 + Math.floor(Math.random() * 100 - 50);
        exchangeRates.RUB = 135 + Math.floor(Math.random() * 5 - 2);
        
        document.getElementById('usdRate').value = exchangeRates.USD;
        document.getElementById('eurRate').value = exchangeRates.EUR;
        document.getElementById('rubRate').value = exchangeRates.RUB;
        
        localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
        calculateTotal();
        
        showNotification('✅ Valyuta kursi yangilandi', 'success');
    }, 1000);
}

// ==================== CURRENCY SELECTION ====================
function selectCurrency(currency) {
    selectedCurrency = currency;
    
    // Update active button
    document.querySelectorAll('.currency-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update price label
    const symbols = {
        UZS: '🇺🇿 UZS',
        USD: '💵 USD',
        EUR: '💶 EUR',
        RUB: '💷 RUB'
    };
    document.getElementById('priceLabel').textContent = `💵 Narx (${symbols[currency]})`;
    
    // Recalculate
    calculateTotal();
}

// ==================== PRICE CALCULATION ====================
function calculateTotal() {
    const price = parseFloat(document.getElementById('price').value) || 0;
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    
    if (price === 0 || quantity === 0) {
        document.getElementById('displayUnitPrice').textContent = '0 ' + selectedCurrency;
        document.getElementById('displayQuantity').textContent = '0';
        document.getElementById('displayTotal').textContent = '0 ' + selectedCurrency;
        document.getElementById('conversionDisplay').style.display = 'none';
        return;
    }
    
    // Calculate total in selected currency
    const total = price * quantity;
    
    // Display in selected currency
    document.getElementById('displayUnitPrice').textContent = formatCurrency(price, selectedCurrency);
    document.getElementById('displayQuantity').textContent = quantity;
    document.getElementById('displayTotal').textContent = formatCurrency(total, selectedCurrency);
    
    // Convert to UZS first (base currency)
    let totalInUZS = total;
    if (selectedCurrency !== 'UZS') {
        totalInUZS = total * exchangeRates[selectedCurrency];
    }
    
    // Show conversions
    document.getElementById('conversionDisplay').style.display = 'block';
    
    // Convert to all currencies
    document.getElementById('convertedUSD').textContent = '$' + (totalInUZS / exchangeRates.USD).toFixed(2);
    document.getElementById('convertedEUR').textContent = '€' + (totalInUZS / exchangeRates.EUR).toFixed(2);
    document.getElementById('convertedRUB').textContent = '₽' + (totalInUZS / exchangeRates.RUB).toFixed(2);
    document.getElementById('convertedUZS').textContent = formatNumber(totalInUZS) + ' so\'m';
}

function formatCurrency(amount, currency) {
    const symbols = {
        UZS: ' so\'m',
        USD: ' $',
        EUR: ' €',
        RUB: ' ₽'
    };
    
    if (currency === 'UZS') {
        return formatNumber(amount) + symbols[currency];
    } else {
        return amount.toFixed(2) + symbols[currency];
    }
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ==================== SALE HANDLING ====================
async function handleSale(event) {
    event.preventDefault();
    
    const customerName = document.getElementById('customerName').value;
    const productName = document.getElementById('productName').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const price = parseFloat(document.getElementById('price').value);
    
    if (!customerName || !productName || !quantity || !price) {
        showNotification('❌ Barcha maydonlarni to\'ldiring', 'error');
        return;
    }
    
    // Calculate total in UZS (base currency)
    let totalInUZS = price * quantity;
    if (selectedCurrency !== 'UZS') {
        totalInUZS = totalInUZS * exchangeRates[selectedCurrency];
    }
    
    // Prepare sale data
    const saleData = {
        cashierId: localStorage.getItem('cashierId'),
        cashierName: cashierData.name,
        branchId: cashierData.branchId,
        customerName: customerName,
        productName: productName,
        quantity: quantity,
        pricePerUnit: price,
        currency: selectedCurrency,
        totalInCurrency: price * quantity,
        totalInUZS: totalInUZS,
        exchangeRate: selectedCurrency !== 'UZS' ? exchangeRates[selectedCurrency] : 1,
        conversions: {
            USD: totalInUZS / exchangeRates.USD,
            EUR: totalInUZS / exchangeRates.EUR,
            RUB: totalInUZS / exchangeRates.RUB,
            UZS: totalInUZS
        },
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch('/api/cashier-sale', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(saleData)
        });
        
        if (response.ok) {
            showNotification('✅ Savdo muvaffaqiyatli saqlandi!', 'success');
            
            // Reset form
            document.getElementById('saleForm').reset();
            document.getElementById('quantity').value = 1;
            calculateTotal();
            
            // Reload recent sales
            loadRecentSales();
        } else {
            showNotification('❌ Savdoni saqlashda xato', 'error');
        }
    } catch (error) {
        console.error('Savdo saqlashda xato:', error);
        showNotification('❌ Savdoni saqlashda xato', 'error');
    }
}

// ==================== RECENT SALES ====================
async function loadRecentSales() {
    try {
        const cashierId = localStorage.getItem('cashierId');
        const response = await fetch(`/api/cashier-recent-sales/${cashierId}?limit=10`);
        
        if (response.ok) {
            const sales = await response.json();
            displayRecentSales(sales);
        } else {
            // Mock data if API fails
            const mockSales = [
                {
                    id: 1,
                    customerName: 'Ali Karimov',
                    productName: 'iPhone 15 Pro',
                    quantity: 1,
                    currency: 'USD',
                    totalInCurrency: 1200,
                    totalInUZS: 15180000,
                    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
                },
                {
                    id: 2,
                    customerName: 'Olima Saidova',
                    productName: 'Samsung Galaxy S24',
                    quantity: 2,
                    currency: 'UZS',
                    totalInCurrency: 20000000,
                    totalInUZS: 20000000,
                    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
                }
            ];
            displayRecentSales(mockSales);
        }
    } catch (error) {
        console.error('So\'nggi savdolarni yuklashda xato:', error);
    }
}

function displayRecentSales(sales) {
    const container = document.getElementById('recentSalesList');
    
    if (!sales || sales.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #6b7280; padding: 40px;">
                Hozircha savdolar yo'q
            </div>
        `;
        return;
    }
    
    container.innerHTML = sales.map(sale => {
        const timeAgo = formatTimeAgo(sale.timestamp);
        const currencySymbols = {
            UZS: 'so\'m',
            USD: '$',
            EUR: '€',
            RUB: '₽'
        };
        
        return `
            <div class="sale-item">
                <div class="sale-header">
                    <div class="sale-customer">
                        👤 ${sale.customerName}
                    </div>
                    <div class="sale-amount">
                        ${formatNumber(sale.totalInUZS)} so'm
                    </div>
                </div>
                <div class="sale-details">
                    <span>📦 ${sale.productName}</span>
                    <span>×${sale.quantity}</span>
                    <span class="currency-badge">${sale.currency}</span>
                    <span>${formatCurrency(sale.totalInCurrency, sale.currency)}</span>
                    <span>🕐 ${timeAgo}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== UTILITY FUNCTIONS ====================
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
