// Kassir Reports Script
const API_URL = window.location.origin + '/api';

let cashierData = null;
let allSales = [];
let filteredSales = [];
let currentPeriod = 'today';
const EXCHANGE_RATE = parseFloat(localStorage.getItem('exchangeRate')) || 12500;

// ==================== INIT ====================

async function init() {
  // Login tekshiruvi
  if (localStorage.getItem('cashierLoggedIn') !== 'true') {
    window.location.href = '/cashier-login.html';
    return;
  }
  
  cashierData = JSON.parse(localStorage.getItem('cashierData'));
  document.getElementById('cashierName').textContent = `${cashierData.name} (ID: ${cashierData.cashierId})`;
  
  await loadSales();
  await loadHandovers();
}

// ==================== LOAD DATA ====================

async function loadSales() {
  try {
    const response = await fetch(`${API_URL}/cashier-sales/${cashierData.cashierId}`);
    const data = await response.json();
    
    if (data.success) {
      allSales = data.sales || [];
      filterByPeriod();
    }
  } catch (error) {
    console.error('Savdolar yuklash xatosi:', error);
  }
}

async function loadHandovers() {
  try {
    const response = await fetch(`${API_URL}/cashier-handovers/${cashierData.cashierId}`);
    const data = await response.json();
    
    if (data.success) {
      const totalHandedOver = data.handovers.reduce((sum, h) => sum + (Number(h.amount) || 0), 0);
      document.getElementById('handedOver').textContent = '$' + totalHandedOver.toFixed(2);
    }
  } catch (error) {
    console.error('Kirimlar yuklash xatosi:', error);
  }
}

// ==================== PERIOD FILTER ====================

function selectPeriod(period) {
  currentPeriod = period;
  
  // Update tabs
  document.querySelectorAll('.period-tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById('tab' + period.charAt(0).toUpperCase() + period.slice(1)).classList.add('active');
  
  filterByPeriod();
}

function filterByPeriod() {
  const now = new Date();
  const today = now.toLocaleDateString('uz-UZ');
  
  filteredSales = allSales.filter(sale => {
    const saleDate = new Date(sale.createdAt || sale.date);
    
    switch (currentPeriod) {
      case 'today':
        return sale.date === today;
      
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return saleDate >= weekAgo;
      
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return saleDate >= monthAgo;
      
      case 'all':
      default:
        return true;
    }
  });
  
  updateMetrics();
  renderSales();
}

// ==================== METRICS ====================

function updateMetrics() {
  const totalUSD = filteredSales.reduce((sum, s) => sum + (s.paidUSD || 0), 0);
  const totalUZS = filteredSales.reduce((sum, s) => sum + (s.paidUZS || 0), 0);
  const totalUZSinUSD = totalUZS / EXCHANGE_RATE;
  const total = totalUSD + totalUZSinUSD;
  const count = filteredSales.filter(s => s.type === 'sale').length;
  
  document.getElementById('metricUSD').textContent = '$' + totalUSD.toFixed(2);
  document.getElementById('metricUZS').textContent = totalUZS.toLocaleString('uz-UZ') + ' so\'m';
  document.getElementById('metricTotal').textContent = '$' + total.toFixed(2);
  document.getElementById('metricCount').textContent = count;
  
  // Summary
  const avgCheck = count > 0 ? total / count : 0;
  const maxSale = filteredSales.length > 0 ? Math.max(...filteredSales.map(s => (s.paidUSD || 0) + (s.paidUZS || 0) / EXCHANGE_RATE)) : 0;
  const uniqueCustomers = new Set(filteredSales.map(s => s.customerId)).size;
  
  document.getElementById('avgCheck').textContent = '$' + avgCheck.toFixed(2);
  document.getElementById('maxSale').textContent = '$' + maxSale.toFixed(2);
  document.getElementById('customersCount').textContent = uniqueCustomers;
}

// ==================== RENDER ====================

function renderSales() {
  const list = document.getElementById('salesList');
  
  if (filteredSales.length === 0) {
    list.innerHTML = '<div style="padding: 40px; text-align: center; color: #6b7280;">Savdo topilmadi</div>';
    return;
  }
  
  list.innerHTML = filteredSales.map(sale => {
    const isSale = sale.type === 'sale';
    const icon = isSale ? '🛒' : '💰';
    const bgColor = isSale ? '#f0f9ff' : '#f0fdf4';
    
    const totalPaid = (sale.paidUSD || 0) + (sale.paidUZS || 0) / EXCHANGE_RATE;
    
    return `
      <div class="sale-item" style="background: ${bgColor};">
        <div>
          <div style="font-weight: 700; color: #111827;">${icon} ${sale.customerName}</div>
          <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">
            ${isSale ? sale.product : 'To\'lov'}
          </div>
        </div>
        <div>
          <div style="font-size: 12px; color: #6b7280;">Narx</div>
          <div style="font-weight: 700; color: #111827;">$${(sale.price || 0).toFixed(2)}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #6b7280;">To'lov</div>
          <div style="font-weight: 700; color: #059669;">$${totalPaid.toFixed(2)}</div>
          ${sale.paidUZS > 0 ? `<div style="font-size: 11px; color: #6b7280;">${sale.paidUZS.toLocaleString('uz-UZ')} so'm</div>` : ''}
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; color: #6b7280;">${sale.date}</div>
          <div style="font-size: 12px; color: #6b7280;">${sale.time}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== SEARCH & FILTER ====================

function filterSales() {
  const searchQuery = document.getElementById('searchSales').value.toLowerCase();
  const typeFilter = document.getElementById('typeFilter').value;
  
  let sales = allSales;
  
  // Period filter
  const now = new Date();
  const today = now.toLocaleDateString('uz-UZ');
  
  sales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt || sale.date);
    
    switch (currentPeriod) {
      case 'today':
        return sale.date === today;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return saleDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return saleDate >= monthAgo;
      default:
        return true;
    }
  });
  
  // Search filter
  if (searchQuery) {
    sales = sales.filter(s => 
      s.customerName.toLowerCase().includes(searchQuery) ||
      (s.product && s.product.toLowerCase().includes(searchQuery))
    );
  }
  
  // Type filter
  if (typeFilter) {
    sales = sales.filter(s => s.type === typeFilter);
  }
  
  filteredSales = sales;
  updateMetrics();
  renderSales();
}

// ==================== START ====================

init();
