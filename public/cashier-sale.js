// Kassir Sale Script
const API_URL = window.location.origin + '/api';

let cashierData = null;
let customers = [];
let selectedCustomer = null;
let selectedProduct = null;
let selectedCurrency = 'USD';
let exchangeRate = parseFloat(localStorage.getItem('exchangeRate')) || 12500;

// ==================== INIT ====================

async function init() {
  // Login tekshiruvi
  if (localStorage.getItem('cashierLoggedIn') !== 'true') {
    window.location.href = '/cashier-login.html';
    return;
  }
  
  cashierData = JSON.parse(localStorage.getItem('cashierData'));
  document.getElementById('cashierName').textContent = `${cashierData.name} (ID: ${cashierData.cashierId})`;
  document.getElementById('exchangeRate').textContent = exchangeRate.toLocaleString('uz-UZ');
  
  await loadCustomers();
}

// ==================== LOAD DATA ====================

async function loadCustomers() {
  try {
    const response = await fetch(`${API_URL}/customers`);
    const data = await response.json();
    customers = data;
  } catch (error) {
    console.error('Mijozlar yuklash xatosi:', error);
  }
}

// ==================== CUSTOMER SEARCH ====================

function searchCustomers() {
  const query = document.getElementById('customerSearch').value.toLowerCase();
  const resultsDiv = document.getElementById('customerResults');
  
  if (!query || query.length < 2) {
    resultsDiv.innerHTML = '';
    return;
  }
  
  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.customerId.toString().includes(query) ||
    (c.phone && c.phone.includes(query))
  );
  
  if (filtered.length === 0) {
    resultsDiv.innerHTML = '<p style="color: #6b7280; font-size: 14px;">Mijoz topilmadi</p>';
    return;
  }
  
  resultsDiv.innerHTML = filtered.slice(0, 5).map(c => `
    <div onclick="selectCustomer(${c.customerId})" style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; cursor: pointer; border: 2px solid #e5e7eb; transition: all 0.2s;"
         onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='#e5e7eb'">
      <div style="font-weight: 700;">${c.name}</div>
      <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
        ID: ${c.customerId} ${c.phone ? '• ' + c.phone : ''}
        ${c.totalDebt > 0 ? `• Qarz: $${(Number(c.totalDebt) || 0).toFixed(2)}` : ''}
      </div>
    </div>
  `).join('');
}

function selectCustomer(customerId) {
  selectedCustomer = customers.find(c => c.customerId === customerId);
  
  document.getElementById('customerSelectBox').style.display = 'none';
  document.getElementById('customerSelected').style.display = 'flex';
  document.getElementById('selectedCustomerName').textContent = selectedCustomer.name;
  document.getElementById('selectedCustomerInfo').textContent = 
    `ID: ${selectedCustomer.customerId} ${selectedCustomer.phone ? '• ' + selectedCustomer.phone : ''} ${selectedCustomer.totalDebt > 0 ? `• Qarz: $${(Number(selectedCustomer.totalDebt) || 0).toFixed(2)}` : ''}`;
  
  document.getElementById('productSearch').focus();
}

function clearCustomer() {
  selectedCustomer = null;
  document.getElementById('customerSelectBox').style.display = 'block';
  document.getElementById('customerSelected').style.display = 'none';
  document.getElementById('customerSearch').value = '';
  document.getElementById('customerResults').innerHTML = '';
}

// ==================== PRODUCT SEARCH ====================

let searchTimeout = null;

function searchProducts() {
  const query = document.getElementById('productSearch').value;
  
  if (!query || query.length < 2) {
    document.getElementById('productResults').style.display = 'none';
    return;
  }
  
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const response = await fetch(`${API_URL}/warehouse/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      displayProductResults(data.products || []);
    } catch (error) {
      console.error('Qidiruv xatosi:', error);
    }
  }, 300);
}

function displayProductResults(products) {
  const resultsDiv = document.getElementById('productResults');
  
  if (products.length === 0) {
    resultsDiv.innerHTML = '<div style="padding: 16px; text-align: center; color: #6b7280;">Mahsulot topilmadi</div>';
    resultsDiv.style.display = 'block';
    return;
  }
  
  resultsDiv.innerHTML = products.map(p => `
    <div class="search-item" onclick='selectProduct(${JSON.stringify(p).replace(/'/g, "&apos;")})'>
      <div style="display: flex; justify-content: space-between;">
        <div>
          <div style="font-weight: 700; color: #111827;">${p.name}</div>
          <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">
            ${p.barcode ? '🏷️ ' + p.barcode : ''} • 📊 ${p.stock} ${p.unit}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 20px; font-weight: 800; color: #059669;">$${p.sellPrice.toFixed(2)}</div>
          <div style="font-size: 12px; color: ${p.stock > 0 ? '#059669' : '#dc2626'};">
            ${p.stock > 0 ? '✅ Mavjud' : '❌ Tugagan'}
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  resultsDiv.style.display = 'block';
}

function selectProduct(product) {
  if (product.stock <= 0) {
    alert('⚠️ Bu mahsulot omborda yo\'q!');
    return;
  }
  
  selectedProduct = product;
  
  document.getElementById('productResults').style.display = 'none';
  document.getElementById('selectedProductBox').style.display = 'block';
  document.getElementById('selectedProductName').textContent = product.name;
  document.getElementById('selectedProductInfo').textContent = 
    `${product.barcode ? '🏷️ ' + product.barcode : ''} • 📊 ${product.stock} ${product.unit}`;
  document.getElementById('selectedProductPrice').textContent = '$' + product.sellPrice.toFixed(2);
  
  calculateTotal();
  document.getElementById('paidUSD').focus();
}

function clearProduct() {
  selectedProduct = null;
  document.getElementById('selectedProductBox').style.display = 'none';
  document.getElementById('productSearch').value = '';
  calculateTotal();
}

// ==================== CURRENCY ====================

function selectCurrency(currency) {
  selectedCurrency = currency;
  
  // Update tabs
  document.getElementById('tabUSD').classList.remove('active');
  document.getElementById('tabUZS').classList.remove('active');
  document.getElementById('tabBOTH').classList.remove('active');
  document.getElementById('tab' + currency).classList.add('active');
  
  // Show/hide inputs
  if (currency === 'USD') {
    document.getElementById('usdPayment').style.display = 'block';
    document.getElementById('uzsPayment').style.display = 'none';
    document.getElementById('paidUZS').value = '';
  } else if (currency === 'UZS') {
    document.getElementById('usdPayment').style.display = 'none';
    document.getElementById('uzsPayment').style.display = 'block';
    document.getElementById('paidUSD').value = '';
  } else {
    document.getElementById('usdPayment').style.display = 'block';
    document.getElementById('uzsPayment').style.display = 'block';
  }
  
  calculateTotal();
}

function changeExchangeRate() {
  const newRate = prompt('Yangi valyuta kursini kiriting (1 USD = ? so\'m):', exchangeRate);
  if (newRate && !isNaN(newRate) && newRate > 0) {
    exchangeRate = parseFloat(newRate);
    localStorage.setItem('exchangeRate', exchangeRate);
    document.getElementById('exchangeRate').textContent = exchangeRate.toLocaleString('uz-UZ');
    calculateTotal();
  }
}

// ==================== CALCULATE ====================

function calculateTotal() {
  if (!selectedProduct) {
    document.getElementById('summaryPrice').textContent = '$0.00';
    document.getElementById('summaryPaidUSD').textContent = '$0.00';
    document.getElementById('summaryPaidUZS').textContent = '0 so\'m';
    document.getElementById('summaryDebt').textContent = '$0.00';
    return;
  }
  
  const price = selectedProduct.sellPrice;
  const paidUSD = parseFloat(document.getElementById('paidUSD').value) || 0;
  const paidUZS = parseFloat(document.getElementById('paidUZS').value) || 0;
  const paidUZSinUSD = paidUZS / exchangeRate;
  const totalPaid = paidUSD + paidUZSinUSD;
  const debt = (Number(price) || 0) - (Number(totalPaid) || 0);
  
  document.getElementById('summaryPrice').textContent = '$' + price.toFixed(2);
  document.getElementById('summaryPaidUSD').textContent = '$' + paidUSD.toFixed(2);
  
  if (paidUZS > 0) {
    document.getElementById('summaryUZSRow').style.display = 'flex';
    document.getElementById('summaryPaidUZS').textContent = paidUZS.toLocaleString('uz-UZ') + ' so\'m ($' + paidUZSinUSD.toFixed(2) + ')';
  } else {
    document.getElementById('summaryUZSRow').style.display = 'none';
  }
  
  document.getElementById('summaryDebt').textContent = '$' + debt.toFixed(2);
  document.getElementById('summaryDebt').style.color = debt > 0 ? '#dc2626' : '#059669';
}

// ==================== SUBMIT ====================

async function submitSale() {
  if (!selectedCustomer) {
    alert('⚠️ Mijozni tanlang!');
    return;
  }
  
  if (!selectedProduct) {
    alert('⚠️ Mahsulotni tanlang!');
    return;
  }
  
  const paidUSD = parseFloat(document.getElementById('paidUSD').value) || 0;
  const paidUZS = parseFloat(document.getElementById('paidUZS').value) || 0;
  
  if (paidUSD === 0 && paidUZS === 0) {
    alert('⚠️ To\'lov miqdorini kiriting!');
    return;
  }
  
  if (!confirm('Savdoni saqlaysizmi?')) {
    return;
  }
  
  try {
    const saleId = Date.now();
    
    // Ombordan chiqarish
    const warehouseResponse = await fetch(`${API_URL}/warehouse/stock-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: selectedProduct.productId,
        quantity: 1,
        reason: 'Savdo',
        notes: `Kassir: ${cashierData.name}, Mijoz: ${selectedCustomer.name}`,
        userId: cashierData.cashierId.toString(),
        userName: cashierData.name
      })
    });
    
    const warehouseData = await warehouseResponse.json();
    if (!warehouseData.success) {
      throw new Error('Ombordan chiqarishda xatolik: ' + warehouseData.error);
    }
    
    // Kassir savdosini saqlash
    const cashierResponse = await fetch(`${API_URL}/cashier-sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        saleId,
        cashierId: cashierData.cashierId,
        cashierName: cashierData.name,
        branchId: cashierData.branchId || 1,
        customerId: selectedCustomer.customerId,
        customerName: selectedCustomer.name,
        product: selectedProduct.name,
        price: selectedProduct.sellPrice,
        paidUSD,
        paidUZS,
        exchangeRate,
        type: 'sale'
      })
    });
    
    const cashierData2 = await cashierResponse.json();
    if (!cashierData2.success) {
      throw new Error('Savdo saqlanmadi: ' + cashierData2.error);
    }
    
    // Asosiy savdolar jadvaliga qo'shish
    await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        saleId,
        customerId: selectedCustomer.customerId,
        customerName: selectedCustomer.name,
        product: selectedProduct.name,
        price: selectedProduct.sellPrice,
        paidUSD,
        paidUZS,
        exchangeRate,
        date: new Date().toLocaleDateString('uz-UZ'),
        time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        type: 'sale'
      })
    });
    
    alert('✅ Savdo muvaffaqiyatli saqlandi!');
    
    // Reset
    clearCustomer();
    clearProduct();
    document.getElementById('paidUSD').value = '';
    document.getElementById('paidUZS').value = '';
    
  } catch (error) {
    console.error('Savdo qo\'shish xatosi:', error);
    alert('❌ Xatolik: ' + error.message);
  }
}

// ==================== START ====================

init();
