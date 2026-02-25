// Kassir Customers Script
const API_URL = window.location.origin + '/api';

let cashierData = null;
let allCustomers = [];
let filteredCustomers = [];
let currentFilter = 'all';

// ==================== INIT ====================

async function init() {
  // Login tekshiruvi
  if (localStorage.getItem('cashierLoggedIn') !== 'true') {
    window.location.href = '/cashier-login.html';
    return;
  }
  
  cashierData = JSON.parse(localStorage.getItem('cashierData'));
  document.getElementById('cashierName').textContent = `${cashierData.name} (ID: ${cashierData.cashierId})`;
  
  await loadCustomers();
  await loadTodaySales();
}

// ==================== LOAD DATA ====================

async function loadCustomers() {
  try {
    const response = await fetch(`${API_URL}/customers`);
    const data = await response.json();
    
    allCustomers = data.map(c => ({
      id: c.customerId,
      name: c.name,
      phone: c.phone,
      chatId: c.chatId,
      totalDebt: c.totalDebt || 0,
      totalPurchases: c.totalPurchases || 0,
      totalPayments: c.totalPayments || 0
    }));
    
    filteredCustomers = [...allCustomers];
    updateStatistics();
    renderCustomers();
  } catch (error) {
    console.error('Mijozlar yuklash xatosi:', error);
  }
}

async function loadTodaySales() {
  try {
    const response = await fetch(`${API_URL}/cashier-sales/${cashierData.cashierId}`);
    const data = await response.json();
    
    if (data.success) {
      const today = new Date().toLocaleDateString('uz-UZ');
      const todaySales = data.sales.filter(s => s.date === today);
      document.getElementById('todaySalesCount').textContent = todaySales.length;
    }
  } catch (error) {
    console.error('Savdolar yuklash xatosi:', error);
  }
}

// ==================== STATISTICS ====================

function updateStatistics() {
  const totalCustomers = allCustomers.length;
  const debtors = allCustomers.filter(c => c.totalDebt > 0);
  const totalDebt = debtors.reduce((sum, c) => sum + c.totalDebt, 0);
  
  document.getElementById('totalCustomers').textContent = totalCustomers;
  document.getElementById('debtorsCount').textContent = debtors.length;
  document.getElementById('totalDebt').textContent = '$' + totalDebt.toFixed(2);
}

// ==================== RENDER ====================

function renderCustomers() {
  const grid = document.getElementById('customersGrid');
  
  if (filteredCustomers.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: white; font-size: 18px;">Mijoz topilmadi</p>';
    return;
  }
  
  grid.innerHTML = filteredCustomers.map(customer => {
    const hasDebt = customer.totalDebt > 0;
    
    return `
      <div class="customer-card-full" onclick="openCustomerDaftar(${customer.id})">
        <div class="customer-name">${customer.name}</div>
        <div class="customer-info">🆔 ID: ${customer.id}</div>
        ${customer.phone ? `<div class="customer-info">📱 ${customer.phone}</div>` : ''}
        
        <div class="customer-debt">
          <div>
            ${hasDebt ? 
              `<span class="debt-amount debt-red">💰 $${customer.totalDebt.toFixed(2)}</span>` :
              `<span class="debt-amount debt-green">✅ Qarzsiz</span>`
            }
          </div>
          <div style="text-align: right; font-size: 12px; color: #6b7280;">
            ${customer.totalPurchases > 0 ? `🛒 ${customer.totalPurchases} ta xarid` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== SEARCH & FILTER ====================

function searchCustomers() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  
  filteredCustomers = allCustomers.filter(c => {
    const matchesSearch = !query || 
      c.name.toLowerCase().includes(query) ||
      c.id.toString().includes(query) ||
      (c.phone && c.phone.includes(query));
    
    const matchesFilter = 
      currentFilter === 'all' ||
      (currentFilter === 'debt' && c.totalDebt > 0) ||
      (currentFilter === 'clear' && c.totalDebt === 0);
    
    return matchesSearch && matchesFilter;
  });
  
  renderCustomers();
}

function filterCustomers(filter) {
  currentFilter = filter;
  
  // Update button styles
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  searchCustomers();
}

// ==================== CUSTOMER ACTIONS ====================

function openCustomerDaftar(customerId) {
  window.location.href = `cashier-customer-daftar.html?customerId=${customerId}`;
}

function openAddCustomerModal() {
  document.getElementById('newCustomerName').value = '';
  document.getElementById('newCustomerPhone').value = '';
  document.getElementById('addCustomerModal').classList.add('active');
  document.getElementById('newCustomerName').focus();
}

function closeAddCustomerModal() {
  document.getElementById('addCustomerModal').classList.remove('active');
}

async function addCustomer() {
  const name = document.getElementById('newCustomerName').value.trim();
  const phone = document.getElementById('newCustomerPhone').value.trim();
  
  if (!name) {
    alert('⚠️ Mijoz ismini kiriting!');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Mijoz qo\'shilmadi');
    }
    
    closeAddCustomerModal();
    await loadCustomers();
    
    alert('✅ Mijoz muvaffaqiyatli qo\'shildi!');
    
  } catch (error) {
    console.error('Mijoz qo\'shish xatosi:', error);
    alert('❌ Xatolik: ' + error.message);
  }
}

// ==================== START ====================

init();
