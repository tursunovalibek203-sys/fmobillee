// ==================== PROFESSIONAL CASHIER SYSTEM ====================

let currentCashier = null;
let exchangeRate = 12500; // Default: 1 USD = 12,500 UZS
let selectedCustomer = null;
let allSales = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadExchangeRate();
  loadCashierData();
  loadSales();
  
  // Auto-refresh every 30 seconds
  setInterval(() => {
    loadCashierData();
    loadSales();
  }, 30000);
});

// ==================== AUTHENTICATION ====================

function checkAuth() {
  const cashierData = localStorage.getItem('cashierData');
  if (!cashierData) {
    window.location.href = 'cashier-login.html';
    return;
  }
  
  currentCashier = JSON.parse(cashierData);
  document.getElementById('cashierName').textContent = 
    `${currentCashier.name} - Filial #${currentCashier.branchId}`;
}

function logout() {
  if (confirm('Chiqishni xohlaysizmi?')) {
    localStorage.removeItem('cashierData');
    window.location.href = 'cashier-login.html';
  }
}

// ==================== EXCHANGE RATE ====================

function loadExchangeRate() {
  const savedRate = localStorage.getItem('exchangeRate');
  if (savedRate) {
    exchangeRate = parseFloat(savedRate);
  }
  updateExchangeRateDisplay();
}

function updateExchangeRateDisplay() {
  document.getElementById('exchangeRate').textContent = 
    exchangeRate.toLocaleString('uz-UZ');
}

function editExchangeRate() {
  const newRate = prompt('Yangi valyuta kursini kiriting (1 USD = ? UZS):', exchangeRate);
  if (newRate && !isNaN(newRate) && newRate > 0) {
    exchangeRate = parseFloat(newRate);
    localStorage.setItem('exchangeRate', exchangeRate);
    updateExchangeRateDisplay();
    calculatePayment();
    showNotification('Valyuta kursi yangilandi', 'success');
  }
}

// ==================== CALCULATIONS ====================

function calculateFromUSD() {
  const usdInput = document.getElementById('paidUSD');
  const uzsInput = document.getElementById('paidUZS');
  
  const usdValue = parseFloat(usdInput.value) || 0;
  
  // Don't auto-fill UZS when typing USD
  // Just update calculation display
  updateCalculationDisplay();
}

function calculateFromUZS() {
  const uzsInput = document.getElementById('paidUZS');
  const uzsValue = parseFloat(uzsInput.value) || 0;
  
  // Calculate USD equivalent
  const usdEquivalent = uzsValue / exchangeRate;
  
  // Update calculation display
  updateCalculationDisplay();
}

function calculatePayment() {
  updateCalculationDisplay();
}

function updateCalculationDisplay() {
  const usdValue = parseFloat(document.getElementById('paidUSD').value) || 0;
  const uzsValue = parseFloat(document.getElementById('paidUZS').value) || 0;
  
  // Calculate UZS in USD
  const uzsInUSD = uzsValue / exchangeRate;
  
  // Total payment in USD
  const totalPayment = usdValue + uzsInUSD;
  
  // Show calculation
  const display = document.getElementById('calculationDisplay');
  if (usdValue > 0 || uzsValue > 0) {
    display.style.display = 'block';
    document.getElementById('calcUSD').textContent = `$${usdValue.toFixed(2)}`;
    document.getElementById('calcUZSinUSD').textContent = `$${uzsInUSD.toFixed(2)}`;
    document.getElementById('calcTotal').textContent = `$${totalPayment.toFixed(2)}`;
  } else {
    display.style.display = 'none';
  }
}

// ==================== CUSTOMER SEARCH ====================

let searchTimeout;
document.getElementById('customerSearch').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchCustomers(e.target.value);
  }, 300);
});

async function searchCustomers(query) {
  if (!query || query.length < 2) {
    document.getElementById('customerResults').innerHTML = '';
    return;
  }

  try {
    const response = await fetch('/api/customers');
    const customers = await response.json();
    
    const filtered = customers.filter(c => 
      c.customerId.toString().includes(query) ||
      c.name.toLowerCase().includes(query.toLowerCase())
    );

    displayCustomerResults(filtered.slice(0, 5));
  } catch (error) {
    console.error('Mijozlarni qidirishda xato:', error);
  }
}

function displayCustomerResults(customers) {
  const container = document.getElementById('customerResults');
  
  if (customers.length === 0) {
    container.innerHTML = '<p style="color: #94a3b8; font-size: 14px;">Mijoz topilmadi</p>';
    return;
  }

  container.innerHTML = customers.map(customer => `
    <div onclick="selectCustomer(${customer.customerId})" 
         style="padding: 12px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s;"
         onmouseover="this.style.background='white'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'"
         onmouseout="this.style.background='#f8fafc'; this.style.boxShadow='none'">
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">
        ${customer.name} (#${customer.customerId})
      </div>
      <div style="font-size: 13px; color: #64748b;">
        ${customer.phone || 'Telefon yo\'q'} • 
        Qarz: ${(Number(customer.totalDebt) || 0).toFixed(2)}
      </div>
    </div>
  `).join('');
}

async function selectCustomer(customerId) {
  try {
    const response = await fetch(`/api/customers/search/${customerId}`);
    const result = await response.json();
    
    if (result.success) {
      selectedCustomer = result.customer;
      document.getElementById('customerSearch').value = 
        `${selectedCustomer.name} (#${selectedCustomer.customerId})`;
      document.getElementById('customerResults').innerHTML = '';
      showNotification('Mijoz tanlandi', 'success');
    }
  } catch (error) {
    console.error('Mijozni yuklashda xato:', error);
    showNotification('Xato yuz berdi', 'error');
  }
}

// ==================== SUBMIT SALE ====================

async function submitSale() {
  // Validation
  if (!selectedCustomer) {
    showNotification('Mijozni tanlang!', 'error');
    return;
  }

  const product = document.getElementById('productName').value.trim();
  if (!product) {
    showNotification('Mahsulot nomini kiriting!', 'error');
    return;
  }

  const price = parseFloat(document.getElementById('productPrice').value);
  if (!price || price <= 0) {
    showNotification('Narxni to\'g\'ri kiriting!', 'error');
    return;
  }

  const paidUSD = parseFloat(document.getElementById('paidUSD').value) || 0;
  const paidUZS = parseFloat(document.getElementById('paidUZS').value) || 0;

  if (paidUSD === 0 && paidUZS === 0) {
    showNotification('To\'lov miqdorini kiriting!', 'error');
    return;
  }

  // Calculate total payment in USD
  const uzsInUSD = paidUZS / exchangeRate;
  const totalPaid = paidUSD + uzsInUSD;

  // Prepare sale data
  const saleData = {
    saleId: Date.now(),
    branchId: currentCashier.branchId,
    cashierId: currentCashier.cashierId,
    cashierName: currentCashier.name,
    customerId: selectedCustomer.customerId,
    customerName: selectedCustomer.name,
    product: product,
    price: price,
    paid: totalPaid,
    paidUSD: paidUSD,
    paidUZS: paidUZS,
    exchangeRate: exchangeRate,
    type: 'sale',
    date: new Date().toLocaleDateString('uz-UZ'),
    time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  };

  try {
    const response = await fetch('/api/cashier-sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    });

    const result = await response.json();

    if (result.success) {
      showNotification('Savdo muvaffaqiyatli saqlandi!', 'success');
      clearForm();
      loadCashierData();
      loadSales();
    } else {
      showNotification('Xato: ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Savdoni saqlashda xato:', error);
    showNotification('Xato yuz berdi!', 'error');
  }
}

function clearForm() {
  selectedCustomer = null;
  document.getElementById('customerSearch').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('paidUSD').value = '';
  document.getElementById('paidUZS').value = '';
  document.getElementById('calculationDisplay').style.display = 'none';
}

// ==================== LOAD DATA ====================

async function loadCashierData() {
  try {
    const response = await fetch(`/api/cashiers/${currentCashier.cashierId}`);
    const result = await response.json();

    if (result.success) {
      const cashier = result.cashier;
      
      // Update balance displays
      const usdBalance = cashier.balanceUSD || 0;
      const uzsBalance = cashier.balanceUZS || 0;
      const uzsInUSD = uzsBalance / exchangeRate;
      const totalBalance = usdBalance + uzsInUSD;

      document.getElementById('usdBalance').textContent = `$${usdBalance.toFixed(2)}`;
      document.getElementById('uzsBalance').textContent = `${uzsBalance.toLocaleString('uz-UZ')} so'm`;
      document.getElementById('uzsInUSD').textContent = `≈ $${uzsInUSD.toFixed(2)}`;
      document.getElementById('totalBalance').textContent = `$${totalBalance.toFixed(2)}`;

      // Update statistics
      document.getElementById('totalSales').textContent = cashier.totalSales || 0;
      document.getElementById('totalAmount').textContent = `$${(cashier.totalSalesAmount || 0).toFixed(2)}`;
      document.getElementById('handoverCount').textContent = cashier.totalHandovers || 0;
      document.getElementById('handoverAmount').textContent = `$${(cashier.totalHandedOver || 0).toFixed(2)}`;
    }
  } catch (error) {
    console.error('Kassir ma\'lumotlarini yuklashda xato:', error);
  }
}

async function loadSales() {
  try {
    const response = await fetch(`/api/cashier-sales?cashierId=${currentCashier.cashierId}`);
    const sales = await response.json();

    allSales = sales;
    
    // Today's sales
    const today = new Date().toLocaleDateString('uz-UZ');
    const todaySales = sales.filter(s => s.date === today);
    const todayAmount = todaySales.reduce((sum, s) => sum + (Number(s.paid) || 0), 0);

    document.getElementById('todaySales').textContent = todaySales.length;
    document.getElementById('todayAmount').textContent = `$${todayAmount.toFixed(2)}`;

    // Display recent sales
    displaySales(sales.slice(0, 20));
  } catch (error) {
    console.error('Savdolarni yuklashda xato:', error);
  }
}

function displaySales(sales) {
  const container = document.getElementById('salesList');
  document.getElementById('salesCount').textContent = sales.length;

  if (sales.length === 0) {
    container.innerHTML = '<div class="empty">Savdolar yo\'q</div>';
    return;
  }

  container.innerHTML = sales.map(sale => {
    const debt = sale.price - sale.paid;
    const statusClass = debt === 0 ? 'paid' : 'partial';
    
    return `
      <div class="sale-item-small">
        <div class="name">${sale.customerName}</div>
        <div class="product">${sale.product}</div>
        <div class="price">
          💵 $${sale.paidUSD?.toFixed(2) || '0.00'}
          ${sale.paidUZS ? `+ 💰 ${sale.paidUZS.toLocaleString('uz-UZ')} so'm` : ''}
        </div>
        <div class="price" style="color: #10b981;">
          Jami: $${sale.paid.toFixed(2)}
        </div>
        <div class="time">${sale.time} • ${sale.date}</div>
      </div>
    `;
  }).join('');
}

// ==================== HANDOVER ====================

function openHandoverModal() {
  // This will be implemented with a modal
  const amount = prompt('Adminga beriladigan summa (USD):');
  if (amount && !isNaN(amount) && amount > 0) {
    submitHandover(parseFloat(amount));
  }
}

async function submitHandover(amount) {
  const handoverData = {
    handoverId: Date.now(),
    branchId: currentCashier.branchId,
    cashierId: currentCashier.cashierId,
    cashierName: currentCashier.name,
    amount: amount,
    date: new Date().toLocaleDateString('uz-UZ'),
    time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    notes: 'Kassadan kirim'
  };

  try {
    const response = await fetch('/api/cashier-handover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(handoverData)
    });

    const result = await response.json();

    if (result.success) {
      showNotification('Kirim muvaffaqiyatli berildi!', 'success');
      loadCashierData();
    } else {
      showNotification('Xato: ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Kirim berishda xato:', error);
    showNotification('Xato yuz berdi!', 'error');
  }
}

// ==================== SETTINGS ====================

function showSettings() {
  alert('Sozlamalar tez orada qo\'shiladi');
}

// ==================== NOTIFICATIONS ====================

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    border-radius: 12px;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);


// ==================== REPORTS ====================

async function showReports() {
  const modal = document.getElementById('reportsModal');
  modal.classList.add('active');
  
  const content = document.getElementById('reportsContent');
  content.innerHTML = '<div style="text-align: center; padding: 40px;">Yuklanmoqda...</div>';
  
  try {
    // Load today's sales
    const today = new Date().toLocaleDateString('uz-UZ');
    const todaySales = allSales.filter(s => s.date === today);
    
    // Calculate statistics
    const todayUSD = todaySales.reduce((sum, s) => sum + (s.paidUSD || 0), 0);
    const todayUZS = todaySales.reduce((sum, s) => sum + (s.paidUZS || 0), 0);
    const todayTotal = todaySales.reduce((sum, s) => sum + (Number(s.paid) || 0), 0);
    
    // Weekly sales
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklySales = allSales.filter(s => new Date(s.createdAt) >= weekAgo);
    const weeklyTotal = weeklySales.reduce((sum, s) => sum + (Number(s.paid) || 0), 0);
    
    // Monthly sales
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthlySales = allSales.filter(s => new Date(s.createdAt) >= monthAgo);
    const monthlyTotal = monthlySales.reduce((sum, s) => sum + (Number(s.paid) || 0), 0);
    
    content.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 24px; border-radius: 12px;">
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">💵 Bugungi Dollar</div>
          <div style="font-size: 32px; font-weight: 800;">$${todayUSD.toFixed(2)}</div>
        </div>
        
        <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 24px; border-radius: 12px;">
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">💰 Bugungi So'm</div>
          <div style="font-size: 32px; font-weight: 800;">${todayUZS.toLocaleString('uz-UZ')}</div>
          <div style="font-size: 14px; opacity: 0.8; margin-top: 4px;">≈ $${(todayUZS / exchangeRate).toFixed(2)}</div>
        </div>
        
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 24px; border-radius: 12px;">
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">📊 Bugungi Jami</div>
          <div style="font-size: 32px; font-weight: 800;">$${todayTotal.toFixed(2)}</div>
          <div style="font-size: 14px; opacity: 0.8; margin-top: 4px;">${todaySales.length} ta savdo</div>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b;">
          <div style="font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 8px;">HAFTALIK</div>
          <div style="font-size: 28px; font-weight: 800; color: #0f172a;">$${weeklyTotal.toFixed(2)}</div>
          <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">${weeklySales.length} ta savdo</div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #ec4899;">
          <div style="font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 8px;">OYLIK</div>
          <div style="font-size: 28px; font-weight: 800; color: #0f172a;">$${monthlyTotal.toFixed(2)}</div>
          <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">${monthlySales.length} ta savdo</div>
        </div>
      </div>
      
      <h3 style="margin-bottom: 16px; font-size: 18px; font-weight: 700;">📋 Bugungi Savdolar</h3>
      <div style="max-height: 400px; overflow-y: auto;">
        ${todaySales.length === 0 ? '<p style="text-align: center; color: #94a3b8; padding: 40px;">Bugun savdolar yo\'q</p>' : 
          todaySales.map(sale => `
            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #8b5cf6;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div>
                  <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">${sale.customerName}</div>
                  <div style="font-size: 14px; color: #64748b;">${sale.product}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 700; color: #10b981;">$${sale.paid.toFixed(2)}</div>
                  <div style="font-size: 12px; color: #94a3b8;">${sale.time}</div>
                </div>
              </div>
              <div style="display: flex; gap: 16px; font-size: 13px; color: #64748b;">
                ${sale.paidUSD > 0 ? `<span>💵 $${sale.paidUSD.toFixed(2)}</span>` : ''}
                ${sale.paidUZS > 0 ? `<span>💰 ${sale.paidUZS.toLocaleString('uz-UZ')} so'm</span>` : ''}
              </div>
            </div>
          `).join('')
        }
      </div>
    `;
  } catch (error) {
    console.error('Hisobotlarni yuklashda xato:', error);
    content.innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Xato yuz berdi</div>';
  }
}

// ==================== CUSTOMERS BOOK ====================

let allCustomers = [];

async function showCustomersBook() {
  const modal = document.getElementById('customersBookModal');
  modal.classList.add('active');
  
  const content = document.getElementById('customersBookContent');
  content.innerHTML = '<div style="text-align: center; padding: 40px;">Yuklanmoqda...</div>';
  
  try {
    const response = await fetch('/api/customers');
    allCustomers = await response.json();
    
    displayCustomersBook(allCustomers);
  } catch (error) {
    console.error('Mijozlarni yuklashda xato:', error);
    content.innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Xato yuz berdi</div>';
  }
}

function displayCustomersBook(customers) {
  const content = document.getElementById('customersBookContent');
  
  if (customers.length === 0) {
    content.innerHTML = '<div style="text-align: center; padding: 40px; color: #94a3b8;">Mijozlar yo\'q</div>';
    return;
  }
  
  content.innerHTML = customers.map(customer => {
    const debtClass = (Number(customer.totalDebt) || 0) > 0 ? 'debt' : 'paid';
    const debtColor = customer.totalDebt > 0 ? '#ef4444' : '#10b981';
    
    return `
      <div onclick="showCustomerDetail(${customer.customerId})" 
           style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; border-left: 4px solid ${debtColor};"
           onmouseover="this.style.transform='translateX(4px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
           onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='none'">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <div>
            <div style="font-weight: 700; font-size: 17px; color: #0f172a; margin-bottom: 4px;">
              ${customer.name}
            </div>
            <div style="font-size: 14px; color: #64748b;">
              ID: ${customer.customerId} ${customer.phone ? `• ${customer.phone}` : ''}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; font-size: 20px; color: ${debtColor};">
              ${(Number(customer.totalDebt) || 0).toFixed(2)}
            </div>
            <div style="font-size: 12px; color: #94a3b8;">
              ${customer.totalDebt > 0 ? 'Qarz' : 'Qarz yo\'q'}
            </div>
          </div>
        </div>
        ${customer.firstDebtDate ? `
          <div style="font-size: 13px; color: #f59e0b; font-weight: 600;">
            ⚠️ Qarz: ${Math.floor((new Date() - new Date(customer.firstDebtDate)) / (1000 * 60 * 60 * 24))} kun
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function searchCustomersBook(query) {
  if (!query) {
    displayCustomersBook(allCustomers);
    return;
  }
  
  const filtered = allCustomers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.customerId.toString().includes(query) ||
    (c.phone && c.phone.includes(query))
  );
  
  displayCustomersBook(filtered);
}

async function showCustomerDetail(customerId) {
  const modal = document.getElementById('customerDetailModal');
  modal.classList.add('active');
  
  const content = document.getElementById('customerDetailContent');
  content.innerHTML = '<div style="text-align: center; padding: 40px;">Yuklanmoqda...</div>';
  
  try {
    const response = await fetch(`/api/customers/search/${customerId}`);
    const result = await response.json();
    
    if (result.success) {
      const customer = result.customer;
      const sales = customer.salesHistory || [];
      
      const totalPurchases = sales.filter(s => s.type === 'sale').length;
      const totalPayments = sales.filter(s => s.type === 'payment').length;
      const totalSpent = sales.filter(s => s.type === 'sale').reduce((sum, s) => sum + (Number(s.price) || 0), 0);
      const totalPaid = sales.reduce((sum, s) => sum + (Number(s.paid) || 0), 0);
      
      content.innerHTML = `
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h3 style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">${customer.name}</h3>
          <div style="font-size: 14px; opacity: 0.9;">
            ID: ${customer.customerId} ${customer.phone ? `• ${customer.phone}` : ''}
          </div>
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2);">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">Jami Qarz</div>
            <div style="font-size: 36px; font-weight: 900;">${(Number(customer.totalDebt) || 0).toFixed(2)}</div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
            <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px;">XARIDLAR</div>
            <div style="font-size: 24px; font-weight: 800; color: #0f172a;">${totalPurchases}</div>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
            <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px;">TO'LOVLAR</div>
            <div style="font-size: 24px; font-weight: 800; color: #0f172a;">${totalPayments}</div>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
            <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px;">JAMI XARID</div>
            <div style="font-size: 24px; font-weight: 800; color: #0f172a;">$${totalSpent.toFixed(2)}</div>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
            <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px;">JAMI TO'LOV</div>
            <div style="font-size: 24px; font-weight: 800; color: #0f172a;">$${totalPaid.toFixed(2)}</div>
          </div>
        </div>
        
        <h4 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">📋 Savdo Tarixi</h4>
        <div style="max-height: 400px; overflow-y: auto;">
          ${sales.length === 0 ? '<p style="text-align: center; color: #94a3b8; padding: 40px;">Savdolar yo\'q</p>' :
            sales.map(sale => {
              const isPayment = sale.type === 'payment';
              const borderColor = isPayment ? '#10b981' : '#8b5cf6';
              
              return `
                <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid ${borderColor};">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div>
                      <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                        ${isPayment ? '💵 To\'lov' : sale.product}
                      </div>
                      <div style="font-size: 13px; color: #64748b;">${sale.date} • ${sale.time}</div>
                    </div>
                    <div style="text-align: right;">
                      ${!isPayment ? `<div style="font-size: 14px; color: #64748b;">Narx: $${sale.price.toFixed(2)}</div>` : ''}
                      <div style="font-weight: 700; color: ${isPayment ? '#10b981' : '#8b5cf6'};">
                        To'lov: $${sale.paid.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')
          }
        </div>
      `;
    }
  } catch (error) {
    console.error('Mijoz ma\'lumotlarini yuklashda xato:', error);
    content.innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Xato yuz berdi</div>';
  }
}

// ==================== WAREHOUSE ====================

let allProducts = [];

async function showWarehouse() {
  const modal = document.getElementById('warehouseModal');
  modal.classList.add('active');
  
  const content = document.getElementById('warehouseContent');
  content.innerHTML = '<div style="text-align: center; padding: 40px;">Yuklanmoqda...</div>';
  
  try {
    const response = await fetch('/api/products');
    allProducts = await response.json();
    
    displayWarehouse(allProducts);
  } catch (error) {
    console.error('Mahsulotlarni yuklashda xato:', error);
    content.innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Xato yuz berdi</div>';
  }
}

function displayWarehouse(products) {
  const content = document.getElementById('warehouseContent');
  
  if (products.length === 0) {
    content.innerHTML = '<div style="text-align: center; padding: 40px; color: #94a3b8;">Mahsulotlar yo\'q</div>';
    return;
  }
  
  content.innerHTML = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
          <th style="padding: 12px; text-align: left; font-size: 12px; color: #64748b; font-weight: 700;">ID</th>
          <th style="padding: 12px; text-align: left; font-size: 12px; color: #64748b; font-weight: 700;">MAHSULOT</th>
          <th style="padding: 12px; text-align: left; font-size: 12px; color: #64748b; font-weight: 700;">KATEGORIYA</th>
          <th style="padding: 12px; text-align: right; font-size: 12px; color: #64748b; font-weight: 700;">NARX</th>
          <th style="padding: 12px; text-align: right; font-size: 12px; color: #64748b; font-weight: 700;">OMBORDA</th>
          <th style="padding: 12px; text-align: center; font-size: 12px; color: #64748b; font-weight: 700;">STATUS</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(product => {
          const isLowStock = product.stock <= product.minStock;
          const statusColor = isLowStock ? '#ef4444' : '#10b981';
          const statusText = isLowStock ? 'Kam' : 'Yetarli';
          
          return `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px; font-weight: 600;">${product.productId}</td>
              <td style="padding: 12px; font-weight: 700; color: #0f172a;">${product.name}</td>
              <td style="padding: 12px; color: #64748b;">${product.category}</td>
              <td style="padding: 12px; text-align: right; font-weight: 700; color: #10b981;">$${product.sellPrice.toFixed(2)}</td>
              <td style="padding: 12px; text-align: right; font-weight: 700; color: ${isLowStock ? '#ef4444' : '#0f172a'};">${product.stock} ${product.unit}</td>
              <td style="padding: 12px; text-align: center;">
                <span style="padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; background: ${statusColor}20; color: ${statusColor};">
                  ${statusText}
                </span>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function searchWarehouse(query) {
  if (!query) {
    displayWarehouse(allProducts);
    return;
  }
  
  const filtered = allProducts.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.productId.toString().includes(query) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );
  
  displayWarehouse(filtered);
}

// ==================== MODAL CONTROLS ====================

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('active');
}

// Close modal on outside click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});
