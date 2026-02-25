// Admin Handovers Script
const API_URL = window.location.origin + '/api';

let allHandovers = [];
let filteredHandovers = [];
let cashiers = [];
let currentPage = 1;
const itemsPerPage = 20;

// ==================== INIT ====================

async function init() {
  // Set default dates
  const today = new Date();
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  document.getElementById('dateTo').valueAsDate = today;
  document.getElementById('dateFrom').valueAsDate = monthAgo;
  
  await loadCashiers();
  await loadHandovers();
}

// ==================== LOAD DATA ====================

async function loadCashiers() {
  try {
    const response = await fetch(`${API_URL}/cashiers`);
    const data = await response.json();
    
    if (data.success) {
      cashiers = data.cashiers || [];
      renderCashierFilter();
    }
  } catch (error) {
    console.error('Kassirlar yuklash xatosi:', error);
  }
}

async function loadHandovers() {
  try {
    const response = await fetch(`${API_URL}/all-handovers`);
    const data = await response.json();
    
    if (data.success) {
      allHandovers = data.handovers || [];
      filterHandovers();
    }
  } catch (error) {
    console.error('Kirimlar yuklash xatosi:', error);
    document.getElementById('handoversTableBody').innerHTML = 
      '<div style="padding: 40px; text-align: center; color: #dc2626;">❌ Kirimlar yuklanmadi</div>';
  }
}

// ==================== RENDER ====================

function renderCashierFilter() {
  const select = document.getElementById('cashierFilter');
  select.innerHTML = '<option value="">Barcha kassirlar</option>';
  
  cashiers.forEach(cashier => {
    const option = document.createElement('option');
    option.value = cashier.cashierId;
    option.textContent = `${cashier.name} (ID: ${cashier.cashierId})`;
    select.appendChild(option);
  });
}

function updateSummary() {
  const totalHandovers = filteredHandovers.length;
  const totalAmount = filteredHandovers.reduce((sum, h) => sum + (h.amount || 0), 0);
  
  const today = new Date().toLocaleDateString('uz-UZ');
  const todayHandovers = filteredHandovers.filter(h => h.date === today);
  const todayAmount = todayHandovers.reduce((sum, h) => sum + (h.amount || 0), 0);
  
  const activeCashiers = new Set(filteredHandovers.map(h => h.cashierId)).size;
  
  document.getElementById('totalHandovers').textContent = totalHandovers;
  document.getElementById('totalAmount').textContent = '$' + totalAmount.toFixed(2);
  document.getElementById('todayAmount').textContent = '$' + todayAmount.toFixed(2);
  document.getElementById('activeCashiers').textContent = activeCashiers;
}

function renderHandovers() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageHandovers = filteredHandovers.slice(start, end);
  
  const tbody = document.getElementById('handoversTableBody');
  
  if (pageHandovers.length === 0) {
    tbody.innerHTML = '<div style="padding: 40px; text-align: center; color: #6b7280;">Kirim topilmadi</div>';
    return;
  }
  
  tbody.innerHTML = pageHandovers.map((handover, index) => `
    <div class="table-row">
      <div>${start + index + 1}</div>
      <div data-label="Kassir">
        <div>
          <div style="font-weight: 700; color: #111827;">${handover.cashierName}</div>
          <div style="font-size: 12px; color: #6b7280;">ID: ${handover.cashierId}</div>
        </div>
      </div>
      <div data-label="Summa">
        <span style="font-weight: 800; color: #059669; font-size: 18px;">
          $${(handover.amount || 0).toFixed(2)}
        </span>
      </div>
      <div data-label="Oldingi Balans">
        <span style="font-weight: 600; color: #6b7280;">
          $${(handover.balanceBefore || 0).toFixed(2)}
        </span>
      </div>
      <div data-label="Keyingi Balans">
        <span style="font-weight: 600; color: #6b7280;">
          $${(handover.balanceAfter || 0).toFixed(2)}
        </span>
      </div>
      <div data-label="Izoh">
        <span style="font-size: 13px; color: #6b7280;">
          ${handover.notes || '-'}
        </span>
      </div>
      <div data-label="Sana/Vaqt">
        <div style="font-size: 13px;">
          <div>${handover.date}</div>
          <div style="color: #6b7280;">${handover.time}</div>
        </div>
      </div>
    </div>
  `).join('');
  
  updatePagination();
}

function updatePagination() {
  const totalPages = Math.ceil(filteredHandovers.length / itemsPerPage);
  document.getElementById('pageInfo').textContent = `${currentPage} / ${totalPages}`;
  
  document.getElementById('prevBtn').disabled = currentPage === 1;
  document.getElementById('nextBtn').disabled = currentPage === totalPages;
  
  document.getElementById('prevBtn').style.opacity = currentPage === 1 ? '0.5' : '1';
  document.getElementById('nextBtn').style.opacity = currentPage === totalPages ? '0.5' : '1';
}

// ==================== FILTER ====================

function filterHandovers() {
  const dateFrom = new Date(document.getElementById('dateFrom').value);
  const dateTo = new Date(document.getElementById('dateTo').value);
  const cashierFilter = document.getElementById('cashierFilter').value;
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  
  filteredHandovers = allHandovers.filter(handover => {
    // Date filter
    const handoverDate = new Date(handover.createdAt || handover.date);
    const matchesDate = (!document.getElementById('dateFrom').value || handoverDate >= dateFrom) &&
                       (!document.getElementById('dateTo').value || handoverDate <= dateTo);
    
    // Cashier filter
    const matchesCashier = !cashierFilter || handover.cashierId.toString() === cashierFilter;
    
    // Search filter
    const matchesSearch = !searchQuery || 
      handover.cashierName.toLowerCase().includes(searchQuery) ||
      handover.cashierId.toString().includes(searchQuery) ||
      (handover.notes && handover.notes.toLowerCase().includes(searchQuery));
    
    return matchesDate && matchesCashier && matchesSearch;
  });
  
  currentPage = 1;
  updateSummary();
  renderHandovers();
}

// ==================== PAGINATION ====================

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    renderHandovers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredHandovers.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderHandovers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ==================== START ====================

init();

// Auto refresh every 60 seconds
setInterval(loadHandovers, 60000);
