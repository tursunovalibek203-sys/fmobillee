// Kassir Dashboard Script
const API_URL = window.location.origin + '/api';

let cashierData = null;
const EXCHANGE_RATE = parseFloat(localStorage.getItem('exchangeRate')) || 12500;

// ==================== INIT ====================

async function init() {
  // Login tekshiruvi
  if (localStorage.getItem('cashierLoggedIn') !== 'true') {
    window.location.href = '/cashier-login.html';
    return;
  }
  
  // Kassir ma'lumotlarini olish
  const savedData = localStorage.getItem('cashierData');
  if (!savedData) {
    logout();
    return;
  }
  
  cashierData = JSON.parse(savedData);
  document.getElementById('cashierInfo').textContent = `${cashierData.name} (ID: ${cashierData.cashierId}) - ${cashierData.username}`;
  
  await loadStats();
}

// ==================== LOAD STATS ====================

async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/cashier-stats/${cashierData.cashierId}`);
    const data = await response.json();
    
    if (data.success) {
      const stats = data.stats;
      
      // Balans
      const balanceUSD = stats.balanceUSD || 0;
      const balanceUZS = stats.balanceUZS || 0;
      const balanceUZSinUSD = balanceUZS / EXCHANGE_RATE;
      const totalBalance = balanceUSD + balanceUZSinUSD;
      
      document.getElementById('balanceUSD').textContent = formatMoney(balanceUSD);
      document.getElementById('balanceUZSinUSD').textContent = formatMoney(balanceUZSinUSD);
      document.getElementById('balanceUZSAmount').textContent = formatMoney(balanceUZS, 'UZS');
      document.getElementById('totalBalance').textContent = formatMoney(totalBalance);
      document.getElementById('modalBalance').textContent = formatMoney(totalBalance);
      
      // Statistika
      document.getElementById('todaySales').textContent = formatMoney(stats.todayTotalUSD || 0);
      document.getElementById('totalSales').textContent = formatMoney(stats.totalSalesAmount || 0);
      document.getElementById('todayCount').textContent = stats.todaySalesCount || 0;
      document.getElementById('handedOver').textContent = formatMoney(stats.totalHandedOver || 0);
      
      // Kassir ma'lumotlarini yangilash
      cashierData.balance = totalBalance;
      cashierData.balanceUSD = balanceUSD;
      cashierData.balanceUZS = balanceUZS;
      localStorage.setItem('cashierData', JSON.stringify(cashierData));
    }
  } catch (error) {
    console.error('Statistika yuklash xatosi:', error);
    showNotification('Statistika yuklanmadi!', 'error');
  }
}

// ==================== HANDOVER ====================

function openHandoverModal() {
  document.getElementById('handoverAmount').value = '';
  document.getElementById('handoverNotes').value = '';
  document.getElementById('handoverModal').classList.add('active');
  document.getElementById('handoverAmount').focus();
}

function closeHandoverModal() {
  document.getElementById('handoverModal').classList.remove('active');
}

async function submitHandover() {
  const amount = parseFloat(document.getElementById('handoverAmount').value);
  const notes = document.getElementById('handoverNotes').value.trim();
  
  if (!amount || amount <= 0) {
    alert('⚠️ Miqdorni kiriting!');
    return;
  }
  
  if (amount > cashierData.balance) {
    alert('⚠️ Kassada yetarli pul yo\'q!');
    return;
  }
  
  if (!confirm(`${formatMoney(amount)} kirim berasizmi?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/cashier-handover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cashierId: cashierData.cashierId,
        amount,
        notes
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Kirim berishda xatolik');
    }
    
    closeHandoverModal();
    await loadStats();
    
    showNotification('✅ Kirim muvaffaqiyatli berildi!', 'success');
    
  } catch (error) {
    console.error('Kirim berish xatosi:', error);
    showNotification('❌ Xatolik: ' + error.message, 'error');
  }
}

// ==================== HELPERS ====================

function formatMoney(num, currency = 'USD') {
  if (currency === 'UZS') {
    return num.toLocaleString('uz-UZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }) + ' so\'m';
  } else {
    return '$' + num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}

function showNotification(message, type = 'info') {
  // Simple notification
  alert(message);
}

function logout() {
  if (confirm('Chiqmoqchimisiz?')) {
    localStorage.removeItem('cashierLoggedIn');
    localStorage.removeItem('cashierData');
    localStorage.removeItem('cashierLoginTime');
    window.location.href = '/cashier-login.html';
  }
}

// ==================== START ====================

init();

// Auto refresh every 30 seconds
setInterval(loadStats, 30000);
