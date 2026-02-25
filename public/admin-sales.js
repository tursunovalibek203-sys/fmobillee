// Global variables
let branches = [];
let currentBranch = null;
let currentCustomer = null;
let exchangeRates = {
    USD: 1,
    UZS: 12500,
    EUR: 0.92
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBranches();
    loadExchangeRates();
});

// Load Branches
async function loadBranches() {
    try {
        const response = await fetch('/api/branches');
        const data = await response.json();
        
        if (data.success && data.branches) {
            branches = data.branches;
            
            const select = document.getElementById('branchSelect');
            select.innerHTML = '<option value="">Filial tanlang</option>' +
                branches.map(b => `<option value="${b.branchId}">${b.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Filiallar yuklashda xato:', error);
    }
}

// Load Branch Data
function loadBranchData() {
    const branchId = document.getElementById('branchSelect').value;
    if (!branchId) {
        currentBranch = null;
        return;
    }
    
    currentBranch = branches.find(b => b.branchId == branchId);
    console.log('Tanlangan filial:', currentBranch);
}

// Load Exchange Rates
async function loadExchangeRates() {
    try {
        const response = await fetch('/api/exchange-rate');
        const data = await response.json();
        
        if (data.success) {
            exchangeRates.UZS = data.exchangeRateUZS || 12500;
            exchangeRates.EUR = data.exchangeRateEUR || 0.92;
            console.log('✅ Valyuta kurslari yuklandi:', exchangeRates);
        }
    } catch (error) {
        console.error('Valyuta kurslari yuklashda xato:', error);
    }
}

// Search Customer
async function searchCustomer() {
    const customerId = document.getElementById('customerId').value;
    const branchId = document.getElementById('branchSelect').value;
    
    if (!branchId) {
        alert('Avval filial tanlang!');
        return;
    }
    
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
            document.getElementById('customerName').textContent = currentCustomer.name;
            document.getElementById('customerPhone').textContent = currentCustomer.phone || 'Yo\'q';
            document.getElementById('customerDebt').textContent = '$' + (currentCustomer.totalDebt || 0).toFixed(2);
            document.getElementById('customerInfo').style.display = 'block';
        } else {
            alert('Mijoz topilmadi!');
            currentCustomer = null;
            document.getElementById('customerInfo').style.display = 'none';
        }
    } catch (error) {
        console.error('Mijoz qidirishda xato:', error);
        alert('Xatolik yuz berdi!');
    }
}

// Update Currency Display
function updateCurrencyDisplay() {
    const price = parseFloat(document.getElementById('productPrice').value) || 0;
    const currency = document.getElementById('paymentCurrency').value;
    
    let amount = price;
    if (currency === 'UZS') {
        amount = price * exchangeRates.UZS;
    } else if (currency === 'EUR') {
        amount = price * exchangeRates.EUR;
    }
    
    document.getElementById('paymentAmount').value = amount.toFixed(2);
    calculateCurrencies();
}

// Calculate Currencies
function calculateCurrencies() {
    const currency = document.getElementById('paymentCurrency').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value) || 0;
    
    let usdAmount = amount;
    if (currency === 'UZS') {
        usdAmount = amount / exchangeRates.UZS;
    } else if (currency === 'EUR') {
        usdAmount = amount / exchangeRates.EUR;
    }
    
    // Display in all currencies
    document.getElementById('displayUSD').textContent = '$' + usdAmount.toFixed(2);
    document.getElementById('displayUZS').textContent = (usdAmount * exchangeRates.UZS).toFixed(0) + ' so\'m';
    document.getElementById('displayEUR').textContent = '€' + (usdAmount * exchangeRates.EUR).toFixed(2);
    document.getElementById('currencyDisplay').style.display = 'block';
}

// Complete Sale
async function completeSale() {
    const branchId = document.getElementById('branchSelect').value;
    const productName = document.getElementById('productName').value;
    const productPrice = parseFloat(document.getElementById('productPrice').value) || 0;
    const paymentCurrency = document.getElementById('paymentCurrency').value;
    const paymentAmountInput = parseFloat(document.getElementById('paymentAmount').value) || 0;
    
    // Validation
    if (!branchId) {
        alert('Filial tanlang!');
        return;
    }
    
    if (!currentCustomer) {
        alert('Mijozni tanlang!');
        return;
    }
    
    if (!productName || productPrice <= 0) {
        alert('Mahsulot va narxni to\'g\'ri kiriting!');
        return;
    }
    
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
        cashierId: 0, // Admin
        cashierName: 'Admin',
        branchId: Number(branchId),
        saleType: 'customer',
        items: [{
            productId: 0,
            name: productName,
            price: productPrice,
            quantity: 1
        }],
        totalAmount: productPrice,
        paidAmount: paymentAmountUSD,
        paymentCurrency: paymentCurrency,
        paymentAmountOriginal: paymentAmountInput,
        exchangeRates: exchangeRates,
        customerId: currentCustomer.customerId,
        customerName: currentCustomer.name,
        date: new Date().toLocaleDateString('uz-UZ'),
        time: new Date().toLocaleTimeString('uz-UZ')
    };
    
    try {
        const response = await fetch('/api/cashier-sales/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saleData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Savdo muvaffaqiyatli yakunlandi!\n\n' +
                  `Mahsulot: ${productName}\n` +
                  `Narx: $${productPrice.toFixed(2)}\n` +
                  `To\'lov: ${formatCurrency(paymentAmountInput, paymentCurrency)}`);
            
            // Reset form
            document.getElementById('customerId').value = '';
            document.getElementById('productName').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('paymentAmount').value = '';
            document.getElementById('customerInfo').style.display = 'none';
            document.getElementById('currencyDisplay').style.display = 'none';
            currentCustomer = null;
        } else {
            alert('❌ Xatolik: ' + (result.error || 'Noma\'lum xato'));
        }
    } catch (error) {
        console.error('Savdo yakunlashda xato:', error);
        alert('❌ Xatolik yuz berdi!');
    }
}

// Format Currency
function formatCurrency(amount, currency) {
    if (currency === 'USD') return '$' + amount.toFixed(2);
    if (currency === 'UZS') return amount.toFixed(0) + ' so\'m';
    if (currency === 'EUR') return '€' + amount.toFixed(2);
    return amount.toFixed(2);
}
