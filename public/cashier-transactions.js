// Cashier Transactions JavaScript
let cashierData = null;
let allTransactions = [];
let filteredTransactions = [];
let currentPage = 1;
const itemsPerPage = 20;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadCashierData();
  loadTransactions();
  
  // Set default dates (last 30 days)
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setDate(lastMonth.getDate() - 30);
  
  document.getElementById('filterEndDate').valueAsDate = today;
  document.getElementById('filterStartDate').valueAsDate = lastMonth;
});

// Load cashier data
function loadCashierData() {
  const cashier = JSON.parse(localStorage.getItem('currentCashier'));
  
  if (!cashier) {
    alert('⚠️ Kassir ma\'lumotlari topilmadi!');
    window.location.href = '/cashier-login.html';
    return;
  }
  
  cashierData = cashier;
}

// Load all transactions
async function loadTransactions() {
  try {
    showLoading();
    
    // Savdolar
    const salesResponse = await fetch(`/api/cashier-sales?cashierId=${cashierData.cashierId}`);
    const salesData = await salesResponse.json();
    
    // Kirim berishlar
    const handoversResponse = await fetch(`/api/cashier-handovers?cashierId=${cashierData.cashierId}`);
    const handoversData = await handoversResponse.json();
    
    // Barcha operatsiyalarni birlashtirish
    allTransactions = [];
    
    // Savdolarni qo'shish
    if (salesData.sales) {
      salesData.sales.forEach(sale => {
        allTransactions.push({
          id: sale.saleId,
          type: sale.type === 'payment' ? 'income' : (sale.returned ? 'return' : 'income'),
          description: sale.product,
          customer: sale.customerName || 'Walk-in',
          amount: sale.type === 'payment' ? sale.paid : sale.price,
          paid: sale.paid,
          balance: 0, // Keyinroq hisoblaymiz
          date: sale.date,
          time: sale.time,
          timestamp: sale.createdAt || new Date(sale.date + ' ' + sale.time)
        });
      });
    }
    
    // Kirim berishlarni qo'shish
    if (handoversData.handovers) {
      handoversData.handovers.forEach(handover => {
        allTransactions.push({
          id: handover.handoverId,
          type: 'handover',
          description: 'Adminga kirim berish',
          customer: 'Admin',
          amount: handover.amount,
          paid: handover.amount,
          balance: handover.balanceAfter,
          date: handover.date,
          time: handover.time,
          timestamp: handover.createdAt || new Date(handover.date + ' ' + handover.time)
        });
      });
    }
    
    // Vaqt bo'yicha saralash
    allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Balansni hisoblash (oxiridan boshlab)
    let runningBalance = cashierData.balance || 0;
    for (let i = 0; i < allTransactions.length; i++) {
      allTransactions[i].balance = runningBalance;
      
      // Keyingi operatsiya uchun balansni hisoblash
      if (allTransactions[i].type === 'income') {
        runningBalance -= allTransactions[i].paid;
      } else if (allTransactions[i].type === 'handover') {
        runningBalance += allTransactions[i].amount;
      } else if (allTransactions[i].type === 'return') {
        runningBalance += allTransactions[i].paid;
      }
    }
    
    // Statistikani hisoblash
    calculateSummary();
    
    // Filtrlarni qo'llash
    applyFilters();
    
  } catch (error) {
    console.error('Operatsiyalar yuklashda xato:', error);
    showError('Ma\'lumotlar yuklashda xato yuz berdi');
  }
}

// Calculate summary
function calculateSummary() {
  let totalIncome = 0;
  let totalExpense = 0;
  let totalHandover = 0;
  
  allTransactions.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.paid;
    } else if (t.type === 'handover') {
      totalHandover += t.amount;
    } else if (t.type === 'return') {
      totalExpense += t.paid;
    }
  });
  
  document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
  document.getElementById('totalExpense').textContent = `$${totalExpense.toFixed(2)}`;
  document.getElementById('totalHandover').textContent = `$${totalHandover.toFixed(2)}`;
  document.getElementById('currentBalance').textContent = `$${(cashierData.balance || 0).toFixed(2)}`;
}

// Apply filters
function applyFilters() {
  const type = document.getElementById('filterType').value;
  const startDate = document.getElementById('filterStartDate').value;
  const endDate = document.getElementById('filterEndDate').value;
  const search = document.getElementById('filterSearch').value.toLowerCase();
  
  filteredTransactions = allTransactions.filter(t => {
    // Type filter
    if (type && t.type !== type) return false;
    
    // Date filter
    if (startDate) {
      const tDate = new Date(t.timestamp);
      const sDate = new Date(startDate);
      if (tDate < sDate) return false;
    }
    
    if (endDate) {
      const tDate = new Date(t.timestamp);
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59);
      if (tDate > eDate) return false;
    }
    
    // Search filter
    if (search) {
      const searchText = `${t.description} ${t.customer}`.toLowerCase();
      if (!searchText.includes(search)) return false;
    }
    
    return true;
  });
  
  currentPage = 1;
  displayTransactions();
}

// Display transactions
function displayTransactions() {
  const tbody = document.getElementById('transactionsBody');
  
  if (filteredTransactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <p>Hech qanday operatsiya topilmadi</p>
          </div>
        </td>
      </tr>
    `;
    document.getElementById('pagination').innerHTML = '';
    return;
  }
  
  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageTransactions = filteredTransactions.slice(startIndex, endIndex);
  
  // Display
  tbody.innerHTML = pageTransactions.map(t => {
    const typeClass = t.type === 'income' ? 'type-income' : 
                      t.type === 'handover' ? 'type-handover' : 
                      t.type === 'return' ? 'type-return' : 'type-expense';
    
    const typeText = t.type === 'income' ? '💰 Kirim' : 
                     t.type === 'handover' ? '📤 Kirim Berish' : 
                     t.type === 'return' ? '↩️ Qaytarish' : '💸 Chiqim';
    
    const amountClass = t.type === 'handover' || t.type === 'return' ? 'amount-negative' : 'amount-positive';
    const amountSign = t.type === 'handover' || t.type === 'return' ? '-' : '+';
    
    return `
      <tr>
        <td>#${t.id}</td>
        <td><span class="transaction-type ${typeClass}">${typeText}</span></td>
        <td>${t.description}</td>
        <td>${t.customer}</td>
        <td class="${amountClass}">${amountSign}$${(t.type === 'handover' ? t.amount : t.paid).toFixed(2)}</td>
        <td>$${t.balance.toFixed(2)}</td>
        <td>${t.date}</td>
        <td>${t.time}</td>
      </tr>
    `;
  }).join('');
  
  // Pagination controls
  displayPagination();
}

// Display pagination
function displayPagination() {
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const pagination = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // Previous button
  html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>◀ Oldingi</button>`;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      html += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      html += `<button disabled>...</button>`;
    }
  }
  
  // Next button
  html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Keyingi ▶</button>`;
  
  pagination.innerHTML = html;
}

// Change page
function changePage(page) {
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  displayTransactions();
}

// Export to Excel
function exportToExcel() {
  if (filteredTransactions.length === 0) {
    alert('❌ Export qilish uchun ma\'lumot yo\'q!');
    return;
  }
  
  // CSV format
  let csv = 'ID,Turi,Tavsif,Mijoz,Summa,Balans,Sana,Vaqt\n';
  
  filteredTransactions.forEach(t => {
    const type = t.type === 'income' ? 'Kirim' : 
                 t.type === 'handover' ? 'Kirim Berish' : 
                 t.type === 'return' ? 'Qaytarish' : 'Chiqim';
    
    const amount = t.type === 'handover' ? t.amount : t.paid;
    
    csv += `${t.id},"${type}","${t.description}","${t.customer}",${amount},${t.balance},"${t.date}","${t.time}"\n`;
  });
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `kirim-chiqim-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert('✅ Excel fayl yuklandi!');
}

// Show loading
function showLoading() {
  document.getElementById('transactionsBody').innerHTML = `
    <tr>
      <td colspan="8">
        <div class="empty-state">
          <div class="empty-state-icon">⏳</div>
          <p>Ma'lumotlar yuklanmoqda...</p>
        </div>
      </td>
    </tr>
  `;
}

// Show error
function showError(message) {
  document.getElementById('transactionsBody').innerHTML = `
    <tr>
      <td colspan="8">
        <div class="empty-state">
          <div class="empty-state-icon">❌</div>
          <p>${message}</p>
        </div>
      </td>
    </tr>
  `;
}
