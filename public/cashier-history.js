// Kassir History Script
const API_URL = window.location.origin + '/api';

let cashierData = null;
let allHistory = [];
let filteredHistory = [];
let currentPage = 1;
const itemsPerPage = 20;
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
  
  // Set default dates
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  document.getElementById('dateTo').valueAsDate = today;
  document.getElementById('dateFrom').valueAsDate = weekAgo;
  
  await loadHistory();
}

// ==================== LOAD DATA ====================

async function loadHistory() {
  try {
    const response = await fetch(`${API_URL}/cashier-sales/${cashierData.cashierId}`);
    const data = await response.json();
    
    if (data.success) {
      allHistory = data.sales || [];
      filterHistory();
    }
  } catch (error) {
    console.error('Tarix yuklash xatosi:', error);
    document.getElementById('historyTableBody').innerHTML = 
      '<div style="padding: 40px; text-align: center; color: #dc2626;">❌ Tarix yuklanmadi</div>';
  }
}

// ==================== FILTER ====================

function filterHistory() {
  const dateFrom = new Date(document.getElementById('dateFrom').value);
  const dateTo = new Date(document.getElementById('dateTo').value);
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  const typeFilter = document.getElementById('typeFilter').value;
  
  filteredHistory = allHistory.filter(item => {
    // Date filter
    const itemDate = new Date(item.createdAt || item.date);
    const matchesDate = (!document.getElementById('dateFrom').value || itemDate >= dateFrom) &&
                       (!document.getElementById('dateTo').value || itemDate <= dateTo);
    
    // Search filter
    const matchesSearch = !searchQuery || 
      item.customerName.toLowerCase().includes(searchQuery) ||
      (item.product && item.product.toLowerCase().includes(searchQuery));
    
    // Type filter
    const matchesType = !typeFilter || item.type === typeFilter;
    
    return matchesDate && matchesSearch && matchesType;
  });
  
  currentPage = 1;
  updateSummary();
  renderHistory();
}

// ==================== SUMMARY ====================

function updateSummary() {
  const totalCount = filteredHistory.length;
  const totalAmount = filteredHistory.reduce((sum, item) => {
    const usd = item.paidUSD || 0;
    const uzs = item.paidUZS || 0;
    return sum + usd + (uzs / EXCHANGE_RATE);
  }, 0);
  const avgCheck = totalCount > 0 ? totalAmount / totalCount : 0;
  
  document.getElementById('totalCount').textContent = totalCount;
  document.getElementById('totalAmount').textContent = '$' + totalAmount.toFixed(2);
  document.getElementById('avgCheck').textContent = '$' + avgCheck.toFixed(2);
}

// ==================== RENDER ====================

function renderHistory() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = filteredHistory.slice(start, end);
  
  const tbody = document.getElementById('historyTableBody');
  
  if (pageItems.length === 0) {
    tbody.innerHTML = '<div style="padding: 40px; text-align: center; color: #6b7280;">Ma\'lumot topilmadi</div>';
    return;
  }
  
  tbody.innerHTML = pageItems.map(item => {
    const isSale = item.type === 'sale';
    const totalPaid = (item.paidUSD || 0) + (item.paidUZS || 0) / EXCHANGE_RATE;
    
    return `
      <div class="table-row">
        <div>
          <span class="type-badge ${isSale ? 'type-sale' : 'type-payment'}">
            ${isSale ? '🛒 Savdo' : '💰 To\'lov'}
          </span>
        </div>
        <div data-label="Mijoz">
          <div style="font-weight: 700;">${item.customerName}</div>
          <div style="font-size: 12px; color: #6b7280;">ID: ${item.customerId}</div>
        </div>
        <div data-label="Mahsulot">
          ${isSale ? item.product : '-'}
        </div>
        <div data-label="Narx">
          <span style="font-weight: 700;">$${(item.price || 0).toFixed(2)}</span>
        </div>
        <div data-label="To'lov">
          <div style="font-weight: 700; color: #059669;">$${totalPaid.toFixed(2)}</div>
          ${item.paidUSD > 0 ? `<div style="font-size: 11px; color: #6b7280;">💵 $${item.paidUSD.toFixed(2)}</div>` : ''}
          ${item.paidUZS > 0 ? `<div style="font-size: 11px; color: #6b7280;">💰 ${item.paidUZS.toLocaleString('uz-UZ')} so'm</div>` : ''}
        </div>
        <div data-label="Sana">
          ${item.date}
        </div>
        <div data-label="Vaqt">
          ${item.time}
        </div>
      </div>
    `;
  }).join('');
  
  updatePagination();
}

function updatePagination() {
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  document.getElementById('pageInfo').textContent = `${currentPage} / ${totalPages}`;
  
  document.getElementById('prevBtn').disabled = currentPage === 1;
  document.getElementById('nextBtn').disabled = currentPage === totalPages;
  
  document.getElementById('prevBtn').style.opacity = currentPage === 1 ? '0.5' : '1';
  document.getElementById('nextBtn').style.opacity = currentPage === totalPages ? '0.5' : '1';
}

// ==================== PAGINATION ====================

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    renderHistory();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderHistory();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ==================== START ====================

init();
