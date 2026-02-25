// Global variables
let currentCashier = null;
let currentBranch = null;
let currentCustomer = null;
let saleType = 'customer'; // 'customer' or 'walk-in'
let cart = [];
let products = [];
let exchangeRates = {
    USD: 1,
    UZS: 12500,
    EUR: 0.92
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCashierInfo();
    loadProducts();
    loadStats();
    loadExchangeRates();
});

// Load Cashier Info
function loadCashierInfo() {
    const cashierData = localStorage.getItem('cashierData');
    if (!cashierData) {
        window.location.href = 'cashier-login-enhanced.html';
        return;
    }

    currentCashier = JSON.parse(cashierData);
    document.getElementById('cashierName').textContent = currentCashier.name;
    document.getElementById('branchName').textContent = currentCashier.branchName || 'Asosiy';
    
    // Sidebar uchun ham yangilash
    const sidebarName = document.getElementById('sidebarCashierName');
    if (sidebarName) {
        sidebarName.textContent = currentCashier.name;
    }
    
    // Load customers for this branch
    loadCustomers();
}

// Load Customers (filtered by branch)
async function loadCustomers() {
    try {
        const branchId = currentCashier.branchId || 0;
        console.log('Mijozlar yuklanmoqda, branchId:', branchId);
        
        const response = await fetch(`/api/customers?branchId=${branchId}`);
        const data = await response.json();
        
        console.log('Mijozlar yuklandi:', data);
        
        if (Array.isArray(data)) {
            window.customers = data; // Global o'zgaruvchiga saqlash
            console.log(`✅ ${data.length} ta mijoz yuklandi`);
        } else {
            console.error('Noto\'g\'ri javob formati:', data);
            window.customers = [];
        }
    } catch (error) {
        console.error('Mijozlar yuklashda xato:', error);
        window.customers = [];
    }
}

// Load Products (filtered by branch)
async function loadProducts() {
    try {
        const branchId = currentCashier.branchId || 0;
        console.log('Mahsulotlar yuklanmoqda, branchId:', branchId);
        
        const response = await fetch(`/api/products?branchId=${branchId}`);
        const data = await response.json();
        
        console.log('Mahsulotlar yuklandi:', data);
        
        if (Array.isArray(data)) {
            products = data;
            displayProducts(products);
            
            if (products.length === 0) {
                console.warn('Mahsulotlar topilmadi!');
            }
        } else {
            console.error('Noto\'g\'ri javob formati:', data);
            document.getElementById('productsList').innerHTML = 
                '<div class="empty-state"><p>Mahsulotlar yuklanmadi</p></div>';
        }
    } catch (error) {
        console.error('Mahsulotlar yuklashda xato:', error);
        document.getElementById('productsList').innerHTML = 
            '<div class="empty-state"><p>Xatolik: ' + error.message + '</p></div>';
    }
}

// Display Products
function displayProducts(productsToShow) {
    const container = document.getElementById('productsList');
    
    if (productsToShow.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Mahsulot topilmadi</p></div>';
        return;
    }

    container.innerHTML = productsToShow.map(product => `
        <div class="product-item" onclick="addToCart(${product.productId})">
            <div class="product-name">${product.name}</div>
            <div class="product-details">
                <span>Omborda: ${product.stock} ${product.unit || 'dona'}</span>
                <span class="product-price">$${product.sellPrice.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

// Search Products
function searchProducts() {
    const query = document.getElementById('productSearch').value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.barcode && p.barcode.includes(query))
    );
    displayProducts(filtered);
}

// Set Sale Type
function setSaleType(type) {
    saleType = type;
    
    // Update buttons
    document.getElementById('customerSaleBtn').classList.toggle('active', type === 'customer');
    document.getElementById('walkInSaleBtn').classList.toggle('active', type === 'walk-in');
    
    // Toggle forms
    document.getElementById('customerSaleForm').style.display = type === 'customer' ? 'block' : 'none';
    document.getElementById('walkInSaleForm').style.display = type === 'walk-in' ? 'block' : 'none';
    
    // Reset customer
    if (type === 'walk-in') {
        currentCustomer = null;
        document.getElementById('customerInfo').classList.remove('show');
    }
}

// Search Customer
async function searchCustomer() {
    const customerId = document.getElementById('customerId').value;
    
    if (!customerId) {
        alert('Mijoz ID ni kiriting!');
        return;
    }

    try {
        const response = await fetch(`/api/customers/search/${customerId}`);
        const data = await response.json();
        
        if (data.success && data.customer) {
            currentCustomer = data.customer;
            
            // Display customer info
            document.getElementById('customerNameDisplay').textContent = currentCustomer.name;
            document.getElementById('customerPhone').textContent = currentCustomer.phone || 'Yo\'q';
            document.getElementById('customerDebt').textContent = '$' + (currentCustomer.totalDebt || 0).toFixed(2);
            document.getElementById('customerInfo').classList.add('show');
        } else {
            alert('Mijoz topilmadi!');
            currentCustomer = null;
            document.getElementById('customerInfo').classList.remove('show');
        }
    } catch (error) {
        console.error('Mijoz qidirishda xato:', error);
        alert('Xatolik yuz berdi!');
    }
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.productId === productId);
    
    if (!product) return;
    
    if (product.stock <= 0) {
        alert('Bu mahsulot omborda yo\'q!');
        return;
    }

    // Check if already in cart
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert('Omborda yetarli mahsulot yo\'q!');
            return;
        }
    } else {
        cart.push({
            productId: product.productId,
            name: product.name,
            price: product.sellPrice,
            quantity: 1,
            maxStock: product.stock
        });
    }

    updateCart();
}

// Update Cart Display
function updateCart() {
    const container = document.getElementById('cartItems');
    const summary = document.getElementById('cartSummary');
    const paymentSection = document.getElementById('paymentSection');
    const completeBtn = document.getElementById('completeSaleBtn');

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <p>Savat bo'sh</p>
            </div>
        `;
        summary.style.display = 'none';
        paymentSection.style.display = 'none';
        completeBtn.disabled = true;
        return;
    }

    // Display cart items
    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-header">
                <span class="cart-item-name">${item.name}</span>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">✕</button>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        </div>
    `).join('');

    // Calculate totals
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    document.getElementById('cartItemCount').textContent = itemCount;
    document.getElementById('cartSubtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('cartTotal').textContent = '$' + subtotal.toFixed(2);

    summary.style.display = 'block';
    paymentSection.style.display = 'block';
    document.getElementById('paymentAmountSection').style.display = 'block';
    
    // Set default payment amount based on selected currency
    updatePaymentDisplay();
    
    completeBtn.disabled = false;
}

// Update payment display when currency changes
function updatePaymentDisplay() {
    const currency = document.getElementById('paymentCurrency').value;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let amount = subtotal;
    if (currency === 'UZS') {
        amount = subtotal * exchangeRates.UZS;
    } else if (currency === 'EUR') {
        amount = subtotal * exchangeRates.EUR;
    }
    
    document.getElementById('paymentAmount').value = amount.toFixed(2);
    calculatePayment();
}

// Calculate payment in all currencies
function calculatePayment() {
    const currency = document.getElementById('paymentCurrency').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value) || 0;
    
    let usdAmount = amount;
    if (currency === 'UZS') {
        usdAmount = amount / exchangeRates.UZS;
    } else if (currency === 'EUR') {
        usdAmount = amount / exchangeRates.EUR;
    }
    
    // Display in all currencies
    document.getElementById('paymentUSD').textContent = '$' + usdAmount.toFixed(2);
    document.getElementById('paymentUZS').textContent = (usdAmount * exchangeRates.UZS).toFixed(0) + ' so\'m';
    document.getElementById('paymentEUR').textContent = '€' + (usdAmount * exchangeRates.EUR).toFixed(2);
}

// Update Quantity
function updateQuantity(index, change) {
    const item = cart[index];
    const newQty = item.quantity + change;

    if (newQty <= 0) {
        removeFromCart(index);
        return;
    }

    if (newQty > item.maxStock) {
        alert('Omborda yetarli mahsulot yo\'q!');
        return;
    }

    item.quantity = newQty;
    updateCart();
}

// Remove from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Complete Sale
async function completeSale() {
    if (cart.length === 0) {
        alert('Savat bo\'sh!');
        return;
    }

    // Validate customer for customer sale
    if (saleType === 'customer' && !currentCustomer) {
        alert('Mijozni tanlang!');
        return;
    }

    const paymentCurrency = document.getElementById('paymentCurrency').value;
    const paymentAmountInput = parseFloat(document.getElementById('paymentAmount').value) || 0;
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (paymentAmountInput < 0) {
        alert('To\'lov summasi noto\'g\'ri!');
        return;
    }

    // Convert payment to USD
    let paymentAmountUSD = paymentAmountInput;
    if (paymentCurrency === 'UZS') {
        paymentAmountUSD = paymentAmountInput / exchangeRates.UZS;
    } else if (paymentCurrency === 'EUR') {
        paymentAmountUSD = paymentAmountInput / exchangeRates.EUR;
    }

    // Prepare sale data
    const saleData = {
        cashierId: currentCashier.cashierId,
        cashierName: currentCashier.name,
        branchId: currentCashier.branchId,
        saleType: saleType,
        items: cart,
        totalAmount: totalAmount,
        paidAmount: paymentAmountUSD,
        paymentCurrency: paymentCurrency,
        paymentAmountOriginal: paymentAmountInput,
        exchangeRates: exchangeRates,
        date: new Date().toLocaleDateString('uz-UZ'),
        time: new Date().toLocaleTimeString('uz-UZ')
    };

    // Add customer info
    if (saleType === 'customer') {
        saleData.customerId = currentCustomer.customerId;
        saleData.customerName = currentCustomer.name;
    } else {
        saleData.customerName = document.getElementById('walkInCustomerName').value || 'Ochiq Savdo';
        saleData.customerPhone = document.getElementById('walkInCustomerPhone').value || '';
    }

    try {
        const response = await fetch('/api/cashier-sales/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saleData)
        });

        const result = await response.json();

        if (result.success) {
            alert('✅ Savdo muvaffaqiyatli yakunlandi!\n\n' +
                  `To'lov: ${formatCurrency(paymentAmountInput, paymentCurrency)}\n` +
                  `USD: ${formatCurrency(paymentAmountUSD, 'USD')}`);
            
            // Reset
            cart = [];
            currentCustomer = null;
            document.getElementById('customerId').value = '';
            document.getElementById('walkInCustomerName').value = '';
            document.getElementById('walkInCustomerPhone').value = '';
            document.getElementById('paymentAmount').value = '';
            document.getElementById('productSearch').value = '';
            document.getElementById('customerInfo').classList.remove('show');
            
            updateCart();
            loadStats();
            loadProducts();
        } else {
            alert('❌ Xatolik: ' + (result.error || 'Noma\'lum xato'));
        }
    } catch (error) {
        console.error('Savdo yakunlashda xato:', error);
        alert('❌ Xatolik yuz berdi!');
    }
}

// Load Stats
async function loadStats() {
    try {
        const response = await fetch(`/api/cashier-sales/stats?cashierId=${currentCashier.cashierId}`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('todaySales').textContent = data.todaySales || 0;
            document.getElementById('todayRevenue').textContent = '$' + (data.todayRevenue || 0).toFixed(2);
            document.getElementById('totalBalance').textContent = '$' + (data.totalBalance || 0).toFixed(2);
            document.getElementById('handedOver').textContent = '$' + (data.handedOver || 0).toFixed(2);
        }
    } catch (error) {
        console.error('Statistika yuklashda xato:', error);
    }
}

// Show History
function showHistory() {
    window.location.href = `cashier-history.html?cashierId=${currentCashier.cashierId}`;
}

// Handover Money
function handoverMoney() {
    window.location.href = `cashier-handover.html?cashierId=${currentCashier.cashierId}`;
}

// Load Exchange Rates
async function loadExchangeRates() {
    try {
        const response = await fetch('/api/exchange-rate');
        const data = await response.json();
        
        if (data.success) {
            exchangeRates.UZS = data.exchangeRate || 12500;
            exchangeRates.EUR = data.exchangeRateEUR || 0.92;
            console.log('✅ Valyuta kurslari yuklandi:', exchangeRates);
        }
    } catch (error) {
        console.error('Valyuta kurslari yuklashda xato:', error);
    }
}

// Convert currency to USD
function convertToUSD(amount, currency) {
    if (currency === 'USD') return amount;
    if (currency === 'UZS') return amount / exchangeRates.UZS;
    if (currency === 'EUR') return amount / exchangeRates.EUR;
    return amount;
}

// Format currency
function formatCurrency(amount, currency = 'USD') {
    if (currency === 'USD') return '$' + amount.toFixed(2);
    if (currency === 'UZS') return amount.toFixed(0) + ' so\'m';
    if (currency === 'EUR') return '€' + amount.toFixed(2);
    return amount.toFixed(2);
}

// Logout
function logout() {
    if (confirm('Tizimdan chiqmoqchimisiz?')) {
        localStorage.removeItem('cashierData');
        window.location.href = 'cashier-login-enhanced.html';
    }
}
