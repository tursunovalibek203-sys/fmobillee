// Expenses Management JavaScript
const API_URL = 'https://fmobilee.onrender.com/api';

let expenses = [];
let sales = [];
let selectedCategory = 'rent';
let currentPeriod = 'today';

// Category names
const categoryNames = {
  rent: '🏢 Ijara',
  salary: '💼 Ish haqi',
  utilities: '💡 Kommunal',
  inventory: '📦 Ombor',
  marketing: '📢 Marketing',
  other: '📝 Boshqa'
};

// Load data
async function loadData() {
  try {
    // Load expenses
    const expensesRes = await fetch(`${API_URL}/expenses`);
    if (expensesRes.ok) {
      expenses = await expensesRes.json();
    }
    
    // Load sales for profit calculation
    const salesRes = await fetch(`${API_URL}/sales`);
    if (salesRes.ok) {
      sales = await salesRes.json();
    }
  } catch (error) {
    console.error('Data load error:', error);
    // Load from localStorage
    expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    sales = JSON.parse(localStorage.getItem('sales') || '[]');
  }
  
  console.log(`✅ Loaded: ${expenses.length} expenses, ${sales.length} sales`);
}

// Format money
function formatMoney(num) {
  return '$' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Select category
function selectCategory(category) {
  selectedCategory = category;
  
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.querySelector(`[data-category="${category}"]`).classList.add('active');
}

// Add expense
async function addExpense() {
  const title = document.getElementById('expenseTitle').value.trim();
  const amount = Number(document.getElementById('expenseAmount').value);
  const date = document.getElementById('expenseDate').value;
  const description = document.getElementById('expenseDescription').value.trim();
  
  if (!title) {
    alert('❌ Xarajat nomini kiriting!');
    return;
  }
  
  if (!amount || amount <= 0) {
    alert('❌ Miqdorni kiriting!');
    return;
  }
  
  if (!date) {
    alert('❌ Sanani tanlang!');
    return;
  }
  
  const expense = {
    id: Date.now(),
    category: selectedCategory,
    title,
    amount,
    date,
    description,
    createdAt: new Date().toISOString()
  };
  
  expenses.push(expense);
  
  // Save to API
  try {
    await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
  } catch (error) {
    console.error('Save error:', error);
  }
  
  // Save to localStorage
  localStorage.setItem('expenses', JSON.stringify(expenses));
  
  // Clear form
  document.getElementById('expenseTitle').value = '';
  document.getElementById('expenseAmount').value = '';
  document.getElementById('expenseDate').value = '';
  document.getElementById('expenseDescription').value = '';
  
  // Refresh
  calculateSummary();
  renderExpenses();
  
  alert('✅ Xarajat qo\'shildi!');
}

// Edit expense
function editExpense(id) {
  const expense = expenses.find(e => e.id === id);
  if (!expense) return;
  
  document.getElementById('expenseTitle').value = expense.title;
  document.getElementById('expenseAmount').value = expense.amount;
  document.getElementById('expenseDate').value = expense.date;
  document.getElementById('expenseDescription').value = expense.description || '';
  
  selectCategory(expense.category);
  
  // Delete old one
  deleteExpense(id, true);
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete expense
async function deleteExpense(id, silent = false) {
  if (!silent && !confirm('❌ Xarajatni o\'chirmoqchimisiz?')) return;
  
  expenses = expenses.filter(e => e.id !== id);
  
  // Delete from API
  try {
    await fetch(`${API_URL}/expenses/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Delete error:', error);
  }
  
  // Save to localStorage
  localStorage.setItem('expenses', JSON.stringify(expenses));
  
  calculateSummary();
  renderExpenses();
  
  if (!silent) {
    alert('✅ Xarajat o\'chirildi!');
  }
}

// Filter period
function filterPeriod(period) {
  currentPeriod = period;
  
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  event.target.classList.add('active');
  
  renderExpenses();
}

// Get filtered expenses
function getFilteredExpenses() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    
    switch (currentPeriod) {
      case 'today':
        return expense.date === today;
      
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return expenseDate >= weekAgo;
      
      case 'month':
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
      
      case 'all':
      default:
        return true;
    }
  });
}

// Render expenses
function renderExpenses() {
  const filtered = getFilteredExpenses();
  const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const html = sorted.map(expense => `
    <div class="expense-item">
      <div class="expense-header-row">
        <div>
          <div class="expense-category">${categoryNames[expense.category]}</div>
          <div class="expense-title">${expense.title}</div>
          <div class="expense-date">📅 ${new Date(expense.date).toLocaleDateString('uz-UZ', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
        </div>
        <div class="expense-amount">${formatMoney(expense.amount)}</div>
      </div>
      
      ${expense.description ? `<div class="expense-description">${expense.description}</div>` : ''}
      
      <div class="expense-actions">
        <button class="edit-btn" onclick="editExpense(${expense.id})">✏️ Tahrirlash</button>
        <button class="delete-btn" onclick="deleteExpense(${expense.id})">🗑️ O'chirish</button>
      </div>
    </div>
  `).join('');
  
  document.getElementById('expensesList').innerHTML = html || '<p class="empty">Xarajatlar topilmadi</p>';
}

// Calculate summary
function calculateSummary() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Today's expenses
  const todayExpenses = expenses.filter(e => e.date === today);
  const todayExpense = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Month expenses
  const monthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear();
  });
  const monthExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Month revenue
  const monthSales = sales.filter(s => {
    const saleDate = new Date(s.createdAt || s.date);
    return saleDate.getMonth() === now.getMonth() && 
           saleDate.getFullYear() === now.getFullYear() &&
           s.type === 'sale';
  });
  const monthRevenue = monthSales.reduce((sum, s) => sum + (s.price || 0), 0);
  
  // Net profit
  const netProfit = monthRevenue - monthExpense;
  
  // Profit margin
  const profitMargin = monthRevenue > 0 ? ((netProfit / monthRevenue) * 100).toFixed(1) : 0;
  
  // Update UI
  document.getElementById('todayExpense').textContent = formatMoney(todayExpense);
  document.getElementById('monthExpense').textContent = formatMoney(monthExpense);
  document.getElementById('netProfit').textContent = formatMoney(netProfit);
  document.getElementById('profitMargin').textContent = profitMargin + '%';
}

// Export expenses
function exportExpenses() {
  const data = {
    expenses: expenses,
    summary: {
      todayExpense: document.getElementById('todayExpense').textContent,
      monthExpense: document.getElementById('monthExpense').textContent,
      netProfit: document.getElementById('netProfit').textContent,
      profitMargin: document.getElementById('profitMargin').textContent
    },
    generatedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  alert('✅ Xarajatlar eksport qilindi!');
}

// Initialize
async function init() {
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('uz-UZ', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Set today's date as default
  document.getElementById('expenseDate').valueAsDate = new Date();
  
  await loadData();
  
  calculateSummary();
  renderExpenses();
}

init();
