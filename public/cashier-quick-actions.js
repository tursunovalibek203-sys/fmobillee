// ==================== KASSIR TEZKOR HARAKATLAR ====================

let cashierData = {};
let calcExpression = '';
let scannedProductData = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadCashierInfo();
    loadTodayStats();
    loadRecentCustomers();
    
    // Form event listeners
    document.getElementById('quickSaleForm').addEventListener('submit', handleQuickSale);
    document.getElementById('barcodeInput').addEventListener('input', handleBarcodeInput);
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        loadTodayStats();
        loadRecentCustomers();
    }, 30000);
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

// ==================== QUICK SALE ====================
async function handleQuickSale(e) {
    e.preventDefault();
    
    const customerName = document.getElementById('quickCustomer').value.trim();
    const product = document.getElementById('quickProduct').value;
    const price = parseFloat(document.getElementById('quickPrice').value);
    const paid = parseFloat(document.getElementById('quickPaid').value) || 0;
    
    if (!customerName || !product || !price || price <= 0) {
        showNotification('❌ Barcha maydonlarni to\'ldiring!', 'error');
        return;
    }
    
    try {
        const cashierId = localStorage.getItem('cashierId');
        const saleData = {
            cashierId: parseInt(cashierId),
            cashierName: cashierData.name,
            branchId: cashierData.branchId,
            customerName,
            product,
            price,
            paid,
            currency: 'USD',
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
            showNotification('✅ Savdo muvaffaqiyatli qo\'shildi!', 'success');
            
            // Clear form
            document.getElementById('quickSaleForm').reset();
            
            // Refresh stats
            loadTodayStats();
            
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Savdo qo\'shishda xato');
        }
        
    } catch (error) {
        console.error('Tezkor savdo xato:', error);
        showNotification('❌ Savdo qo\'shishda xato: ' + error.message, 'error');
    }
}

function setQuickCustomer(name) {
    document.getElementById('quickCustomer').value = name;
}

// ==================== CALCULATOR ====================
function calcInput(value) {
    const display = document.getElementById('calcDisplay');
    
    if (display.value === '0' && !isNaN(value)) {
        display.value = value;
    } else {
        display.value += value;
    }
    
    calcExpression = display.value;
}

function clearCalc() {
    document.getElementById('calcDisplay').value = '0';
    calcExpression = '';
}

function deleteLast() {
    const display = document.getElementById('calcDisplay');
    if (display.value.length > 1) {
        display.value = display.value.slice(0, -1);
    } else {
        display.value = '0';
    }
    calcExpression = display.value;
}

function calculate() {
    try {
        const display = document.getElementById('calcDisplay');
        let expression = display.value;
        
        // Replace display symbols with JavaScript operators
        expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
        
        // Evaluate the expression safely
        const result = Function('"use strict"; return (' + expression + ')')();
        
        display.value = result.toString();
        calcExpression = result.toString();
        
    } catch (error) {
        document.getElementById('calcDisplay').value = 'Error';
        setTimeout(() => {
            clearCalc();
        }, 1500);
    }
}

// ==================== RECENT CUSTOMERS ====================
async function loadRecentCustomers() {
    try {
        const cashierId = localStorage.getItem('cashierId');
        const response = await fetch(`/api/cashier-recent-customers/${cashierId}?limit=8`);
        
        if (response.ok) {
            const customers = await response.json();
            displayRecentCustomers(customers);
        } else {
            // Mock data if API not available
            const mockCustomers = [
                { name: 'Ali Valiyev', lastSale: '2 soat oldin', totalDebt: 50 },
                { name: 'Olima Karimova', lastSale: '1 kun oldin', totalDebt: 0 },
                { name: 'Bobur Toshmatov', lastSale: '3 kun oldin', totalDebt: 25 },
                { name: 'Nargiza Saidova', lastSale: '1 hafta oldin', totalDebt: 100 }
            ];
            displayRecentCustomers(mockCustomers);
        }
    } catch (error) {
        console.error('So\'nggi mijozlarni yuklashda xato:', error);
    }
}

function displayRecentCustomers(customers) {
    const container = document.getElementById('recentCustomers');
    
    if (!customers || customers.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #6b7280; padding: 20px;">
                So'nggi mijozlar yo'q
            </div>
        `;
        return;
    }
    
    container.innerHTML = customers.map(customer => `
        <div class="recent-item" onclick="selectCustomer('${customer.name}')">
            <div>
                <div style="font-weight: 600; color: #374151;">${customer.name}</div>
                <div style="font-size: 12px; color: #6b7280;">${customer.lastSale || 'Noma\'lum'}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 12px; color: ${customer.totalDebt > 0 ? '#dc2626' : '#059669'};">
                    ${customer.totalDebt > 0 ? '$' + customer.totalDebt : '✅'}
                </div>
            </div>
        </div>
    `).join('');
}

function selectCustomer(name) {
    document.getElementById('quickCustomer').value = name;
    showNotification(`👤 ${name} tanlandi`, 'info');
}

function refreshCustomers() {
    loadRecentCustomers();
    showNotification('🔄 Mijozlar ro\'yxati yangilandi', 'info');
}

// ==================== TODAY STATS ====================
async function loadTodayStats() {
    try {
        const cashierId = localStorage.getItem('cashierId');
        const today = new Date().toISOString().split('T')[0];
        
        const response = await fetch(`/api/cashier-sales/${cashierId}?date=${today}`);
        if (response.ok) {
            const stats = await response.json();
            
            document.getElementById('todaySalesCount').textContent = stats.totalSales || 0;
            document.getElementById('todayRevenue').textContent = formatMoney(stats.totalAmount || 0);
            
            const avgSale = stats.totalSales > 0 ? (stats.totalAmount || 0) / stats.totalSales : 0;
            document.getElementById('avgSale').textContent = formatMoney(avgSale);
        }
    } catch (error) {
        console.error('Bugungi statistikani yuklashda xato:', error);
    }
}

// ==================== QUICK PAYMENT ====================
async function processPayment() {
    const customerId = document.getElementById('paymentCustomerId').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    
    if (!customerId || !amount || amount <= 0) {
        showNotification('❌ Mijoz ID va to\'lov miqdorini kiriting!', 'error');
        return;
    }
    
    try {
        const cashierId = localStorage.getItem('cashierId');
        const paymentData = {
            cashierId: parseInt(cashierId),
            cashierName: cashierData.name,
            branchId: cashierData.branchId,
            customerId: parseInt(customerId),
            customerName: `Mijoz ${customerId}`,
            product: 'To\'lov',
            price: 0,
            paid: amount,
            type: 'payment',
            currency: 'USD',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('uz-UZ')
        };
        
        const response = await fetch('/api/cashier-sale', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });
        
        if (response.ok) {
            showNotification('✅ To\'lov muvaffaqiyatli qabul qilindi!', 'success');
            
            // Clear form
            document.getElementById('paymentCustomerId').value = '';
            document.getElementById('paymentAmount').value = '';
            
            // Refresh stats
            loadTodayStats();
            
        } else {
            const error = await response.json();
            throw new Error(error.message || 'To\'lov qabul qilishda xato');
        }
        
    } catch (error) {
        console.error('To\'lov xato:', error);
        showNotification('❌ To\'lov qabul qilishda xato: ' + error.message, 'error');
    }
}

function setPaymentAmount(amount) {
    document.getElementById('paymentAmount').value = amount;
}

// ==================== BARCODE SCANNER ====================
async function handleBarcodeInput(e) {
    const barcode = e.target.value.trim();
    
    if (barcode.length >= 8) { // Minimum barcode length
        await searchProductByBarcode(barcode);
    }
}

async function searchProductByBarcode(barcode) {
    try {
        const response = await fetch(`/api/products/search/${barcode}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.products && data.products.length > 0) {
                const product = data.products[0];
                scannedProductData = product;
                
                document.getElementById('productName').textContent = product.name;
                document.getElementById('productPrice').textContent = `Narx: $${product.sellPrice}`;
                document.getElementById('scannedProduct').style.display = 'block';
                
                showNotification('✅ Mahsulot topildi!', 'success');
            } else {
                document.getElementById('scannedProduct').style.display = 'none';
                showNotification('❌ Mahsulot topilmadi', 'error');
            }
        }
    } catch (error) {
        console.error('Barcode qidirish xato:', error);
        showNotification('❌ Qidirish xatosi', 'error');
    }
}

function scanBarcode() {
    // In a real app, this would open camera for barcode scanning
    showNotification('📷 Kamera barcode skaneri tez orada qo\'shiladi', 'info');
}

function addScannedProduct() {
    if (!scannedProductData) {
        showNotification('❌ Avval mahsulotni skanerlang!', 'error');
        return;
    }
    
    // Fill quick sale form with scanned product
    document.getElementById('quickProduct').value = scannedProductData.name;
    document.getElementById('quickPrice').value = scannedProductData.sellPrice;
    
    // Clear barcode input
    document.getElementById('barcodeInput').value = '';
    document.getElementById('scannedProduct').style.display = 'none';
    
    showNotification('✅ Mahsulot savdo formasiga qo\'shildi', 'success');
}

// ==================== NAVIGATION ====================
function openDashboard() {
    window.location.href = 'cashier-dashboard-pro.html';
}

function openHistory() {
    window.location.href = 'cashier-history-enhanced.html';
}

// ==================== UTILITY FUNCTIONS ====================
function formatMoney(amount) {
    return '$' + parseFloat(amount || 0).toFixed(2);
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