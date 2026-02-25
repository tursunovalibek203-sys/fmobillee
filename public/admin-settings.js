// Admin Settings Script

// ==================== INIT ====================

function init() {
  loadSettings();
}

// ==================== LOAD SETTINGS ====================

function loadSettings() {
  // Currency
  const exchangeRate = localStorage.getItem('exchangeRate') || '12500';
  const baseCurrency = localStorage.getItem('baseCurrency') || 'USD';
  const dualCurrency = localStorage.getItem('dualCurrency') !== 'false';
  
  document.getElementById('exchangeRate').value = exchangeRate;
  document.getElementById('baseCurrency').value = baseCurrency;
  document.getElementById('dualCurrencyToggle').classList.toggle('active', dualCurrency);
  
  // System
  const autoBackup = localStorage.getItem('autoBackup') !== 'false';
  const backupTime = localStorage.getItem('backupTime') || '02:00';
  const sessionTimeout = localStorage.getItem('sessionTimeout') || '24';
  
  document.getElementById('autoBackupToggle').classList.toggle('active', autoBackup);
  document.getElementById('backupTime').value = backupTime;
  document.getElementById('sessionTimeout').value = sessionTimeout;
  
  // Notifications
  const telegram = localStorage.getItem('telegramNotifications') !== 'false';
  const lowStock = localStorage.getItem('lowStockNotifications') !== 'false';
  const minStock = localStorage.getItem('minStock') || '5';
  const largeDebt = localStorage.getItem('largeDebtNotifications') !== 'false';
  const largeDebtAmount = localStorage.getItem('largeDebtAmount') || '1000';
  
  document.getElementById('telegramToggle').classList.toggle('active', telegram);
  document.getElementById('lowStockToggle').classList.toggle('active', lowStock);
  document.getElementById('minStock').value = minStock;
  document.getElementById('largeDebtToggle').classList.toggle('active', largeDebt);
  document.getElementById('largeDebtAmount').value = largeDebtAmount;
  
  // Display
  const language = localStorage.getItem('language') || 'uz';
  const dateFormat = localStorage.getItem('dateFormat') || 'DD.MM.YYYY';
  const itemsPerPage = localStorage.getItem('itemsPerPage') || '20';
  
  document.getElementById('language').value = language;
  document.getElementById('dateFormat').value = dateFormat;
  document.getElementById('itemsPerPage').value = itemsPerPage;
}

// ==================== CURRENCY SETTINGS ====================

function saveExchangeRate() {
  const rate = document.getElementById('exchangeRate').value;
  if (!rate || rate <= 0) {
    alert('⚠️ Noto\'g\'ri qiymat!');
    return;
  }
  
  localStorage.setItem('exchangeRate', rate);
  showSuccess('Valyuta kursi saqlandi!');
}

function saveBaseCurrency() {
  const currency = document.getElementById('baseCurrency').value;
  localStorage.setItem('baseCurrency', currency);
  showSuccess('Asosiy valyuta saqlandi!');
}

function toggleDualCurrency() {
  const toggle = document.getElementById('dualCurrencyToggle');
  toggle.classList.toggle('active');
  const isActive = toggle.classList.contains('active');
  localStorage.setItem('dualCurrency', isActive);
  showSuccess(isActive ? 'Dual Currency yoqildi!' : 'Dual Currency o\'chirildi!');
}

// ==================== SYSTEM SETTINGS ====================

function toggleAutoBackup() {
  const toggle = document.getElementById('autoBackupToggle');
  toggle.classList.toggle('active');
  const isActive = toggle.classList.contains('active');
  localStorage.setItem('autoBackup', isActive);
  showSuccess(isActive ? 'Avtomatik backup yoqildi!' : 'Avtomatik backup o\'chirildi!');
}

function saveBackupTime() {
  const time = document.getElementById('backupTime').value;
  localStorage.setItem('backupTime', time);
  showSuccess('Backup vaqti saqlandi!');
}

function saveSessionTimeout() {
  const timeout = document.getElementById('sessionTimeout').value;
  if (!timeout || timeout < 1) {
    alert('⚠️ Noto\'g\'ri qiymat!');
    return;
  }
  
  localStorage.setItem('sessionTimeout', timeout);
  showSuccess('Session timeout saqlandi!');
}

// ==================== NOTIFICATION SETTINGS ====================

function toggleTelegram() {
  const toggle = document.getElementById('telegramToggle');
  toggle.classList.toggle('active');
  const isActive = toggle.classList.contains('active');
  localStorage.setItem('telegramNotifications', isActive);
  showSuccess(isActive ? 'Telegram bildirishnomalar yoqildi!' : 'Telegram bildirishnomalar o\'chirildi!');
}

function toggleLowStock() {
  const toggle = document.getElementById('lowStockToggle');
  toggle.classList.toggle('active');
  const isActive = toggle.classList.contains('active');
  localStorage.setItem('lowStockNotifications', isActive);
  showSuccess(isActive ? 'Kam qolgan mahsulotlar ogohlantirish yoqildi!' : 'Kam qolgan mahsulotlar ogohlantirish o\'chirildi!');
}

function saveMinStock() {
  const minStock = document.getElementById('minStock').value;
  if (!minStock || minStock < 1) {
    alert('⚠️ Noto\'g\'ri qiymat!');
    return;
  }
  
  localStorage.setItem('minStock', minStock);
  showSuccess('Minimal miqdor saqlandi!');
}

function toggleLargeDebt() {
  const toggle = document.getElementById('largeDebtToggle');
  toggle.classList.toggle('active');
  const isActive = toggle.classList.contains('active');
  localStorage.setItem('largeDebtNotifications', isActive);
  showSuccess(isActive ? 'Katta qarzlar ogohlantirish yoqildi!' : 'Katta qarzlar ogohlantirish o\'chirildi!');
}

function saveLargeDebtAmount() {
  const amount = document.getElementById('largeDebtAmount').value;
  if (!amount || amount < 0) {
    alert('⚠️ Noto\'g\'ri qiymat!');
    return;
  }
  
  localStorage.setItem('largeDebtAmount', amount);
  showSuccess('Katta qarz miqdori saqlandi!');
}

// ==================== DISPLAY SETTINGS ====================

function saveLanguage() {
  const language = document.getElementById('language').value;
  localStorage.setItem('language', language);
  showSuccess('Til saqlandi! Sahifani yangilang.');
}

function saveDateFormat() {
  const format = document.getElementById('dateFormat').value;
  localStorage.setItem('dateFormat', format);
  showSuccess('Sana formati saqlandi!');
}

function saveItemsPerPage() {
  const items = document.getElementById('itemsPerPage').value;
  localStorage.setItem('itemsPerPage', items);
  showSuccess('Sahifadagi elementlar soni saqlandi!');
}

// ==================== SAVE ALL ====================

function saveAllSettings() {
  saveExchangeRate();
  saveBaseCurrency();
  saveBackupTime();
  saveSessionTimeout();
  saveMinStock();
  saveLargeDebtAmount();
  saveLanguage();
  saveDateFormat();
  saveItemsPerPage();
  
  setTimeout(() => {
    alert('✅ Barcha sozlamalar muvaffaqiyatli saqlandi!');
  }, 500);
}

// ==================== HELPERS ====================

function showSuccess(message) {
  // Simple success notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = '✅ ' + message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// ==================== START ====================

init();
