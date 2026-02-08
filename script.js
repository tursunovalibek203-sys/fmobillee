// Backend server URL - Render.com dan deploy qilgandan keyin bu yerga qo'ying
const API_URL = 'https://sizning-server.onrender.com/api';

let customers = [];
let sales = [];
let selectedCustomer = null;
let editId = null;
let currentFilter = 'all';
let settings = {
  reminderDays: 7,
  reminderTime: '09:00',
  blockDays: 10,
  reminder3days: true,
  reminder5days: true,
  reminder7days: true
};

// ==================== API FUNCTIONS ====================

async function loadSettings() {
  try {
    const response = await fetch(`${API_URL}/settings`);
    const data = await response.json();
    if (data) settings = { ...settings, ...data };
  } catch (error) {
    console.error('Sozlamalar yuklash xatosi:', error);
    const saved = localStorage.getItem('settings');
    if (saved) settings = JSON.parse(saved);
  }
}

async function saveSettingsAPI(newSettings) {
  try {
    await fetch(`${API_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    localStorage.setItem('settings', JSON.stringify(newSettings));
  } catch (error) {
    console.error('Sozlamalar saqlash xatosi:', error);
  }
}

async function loadCustomers() {
  try {
    const response = await fetch(`${API_URL}/customers`);
    const data = await response.json();
    customers = data.map(c => ({
      id: c.customerId,
      name: c.name,
      phone: c.phone,
      chatId: c.chatId,
      firstDebtDate: c.firstDebtDate ? new Date(c.firstDebtDate) : null,
      totalDebt: c.totalDebt || 0
    }));
  } catch (error) {
    console.error('Mijozlar yuklash xatosi:', error);
    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) customers = JSON.parse(savedCustomers);
  }
}

async function loadSales() {
  try {
    const response = await fetch(`${API_URL}/sales`);
    const data = await response.json();
    sales = data.map(s => ({
      id: s.saleId,
      customerId: s.customerId,
      customerName: s.customerName,
      product: s.product,
      price: s.price,
      paid: s.paid,
      date: s.date,
      time: s.time,
      type: s.type || 'sale',
      fullDate: s.createdAt
    }));
  } catch (error) {
    console.error('Savdolar yuklash xatosi:', error);
    const savedSales = localStorage.getItem('sales');
    if (savedSales) sales = JSON.parse(savedSales);
  }
}

async function saveCustomer(customer) {
  try {
    await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: customer.id,
        name: customer.name,
        phone: customer.phone,
        chatId: customer.chatId
      })
    });
  } catch (error) {
    console.error('Mijoz saqlash xatosi:', error);
  }
}

async function saveSale(sale) {
  try {
    await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        saleId: sale.id,
        customerId: sale.customerId,
        customerName: sale.customerName,
        product: sale.product,
        price: sale.price,
        paid: sale.paid,
        date: sale.date,
        time: sale.time,
        type: sale.type || 'sale'
      })
    });
  } catch (error) {
    console.error('Savdo saqlash xatosi:', error);
  }
}

async function deleteSaleAPI(saleId) {
  try {
    await fetch(`${API_URL}/sales/${saleId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Savdo o\'chirish xatosi:', error);
  }
}

async function deleteCustomerAPI(customerId) {
  try {
    await fetch(`${API_URL}/customers/${customerId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Mijoz o\'chirish xatosi:', error);
  }
}

async function sendTelegramMessage(chatId, message) {
  if (!chatId) {
    alert(`❌ Mijozning Telegram Chat ID si yo'q!\n\n📝 Qanday olish kerak:\n1. Botga /start yuboring\n2. Chat ID ni kiriting`);
    return { success: false };
  }

  try {
    const response = await fetch(`${API_URL}/send-telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message })
    });

    const data = await response.json();
    
    if (data.success) {
      alert('✅ Xabar yuborildi!');
    } else {
      alert('❌ Xatolik: Xabar yuborilmadi');
    }
    
    return data;
  } catch (error) {
    console.error('Telegram xato:', error);
    alert('❌ Server bilan aloqa yo\'q');
    return { success: false };
  }
}

// ==================== HELPER FUNCTIONS ====================

function formatMoney(num) {
  return num.toLocaleString('uz-UZ') + " so'm";
}

function getToday() {
  return new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getTodayShort() {
  return new Date().toLocaleDateString('uz-UZ');
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getCustomerDebt(customerId) {
  const customerSales = sales.filter(s => s.customerId === customerId);
  const total = customerSales.reduce((sum, s) => s.type === 'sale' ? sum + s.price : sum, 0);
  const paid = customerSales.reduce((sum, s) => sum + s.paid, 0);
  return total - paid;
}

function getDebtDays(customerId) {
  const customer = customers.find(c => c.id === customerId);
  if (!customer || !customer.firstDebtDate) return 0;
  
  const today = new Date();
  const firstDebt = new Date(customer.firstDebtDate);
  const diffTime = today - firstDebt;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function isCustomerBlocked(customerId) {
  const debt = getCustomerDebt(customerId);
  const days = getDebtDays(customerId);
  return debt > 0 && days >= settings.blockDays;
}

function getDebtorsCount() {
  return customers.filter(c => getCustomerDebt(c.id) > 0).length;
}

function getMonthlyTotal() {
  const currentMonth = getCurrentMonth();
  const monthlySales = sales.filter(s => {
    const saleDate = new Date(s.fullDate || s.date);
    const saleMonth = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
    return saleMonth === currentMonth && s.type === 'sale';
  });
  return monthlySales.reduce((sum, s) => sum + s.price, 0);
}

function getTotalDebt() {
  return customers.reduce((sum, c) => sum + Math.max(0, getCustomerDebt(c.id)), 0);
}

// ==================== STATISTICS ====================

function updateStatistics() {
  const todaySales = sales.filter(s => s.date === getTodayShort() && s.type === 'sale');
  const todayTotal = todaySales.reduce((sum, s) => sum + s.price, 0);
  const todayPaid = todaySales.reduce((sum, s) => sum + s.paid, 0);
  
  document.getElementById('todayTotal').textContent = formatMoney(todayTotal);
  document.getElementById('todayPaid').textContent = formatMoney(todayPaid);
  document.getElementById('totalDebt').textContent = formatMoney(getTotalDebt());
  document.getElementById('debtorsCount').textContent = getDebtorsCount();
  document.getElementById('totalCustomers').textContent = customers.length;
  document.getElementById('activeCustomers').textContent = customers.filter(c => 
    sales.some(s => s.customerId === c.id)
  ).length;
  document.getElementById('monthlyTotal').textContent = formatMoney(getMonthlyTotal());
  document.getElementById('todaySalesCount').textContent = todaySales.length;
}

// ==================== RENDER FUNCTIONS ====================

function filterCustomers(filter) {
  currentFilter = filter;
  
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  event.target.classList.add('active');
  
  renderCustomers();
}

function renderCustomers() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  let filtered = customers.filter(c => c.name.toLowerCase().includes(search));
  
  if (currentFilter === 'debt') {
    filtered = filtered.filter(c => getCustomerDebt(c.id) > 0);
  } else if (currentFilter === 'blocked') {
    filtered = filtered.filter(c => isCustomerBlocked(c.id));
  }
  
  const grid = document.getElementById('customersGrid');
  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty">Mijozlar topilmadi</p>';
    return;
  }
  
  grid.innerHTML = filtered.map(customer => {
    const debt = getCustomerDebt(customer.id);
    const days = getDebtDays(customer.id);
    const blocked = isCustomerBlocked(customer.id);
    
    let debtText = "✅ Qarz yo'q";
    let debtClass = 'debt-green';
    let blockText = '';
    
    if (debt > 0) {
      debtText = `⚠️ ${formatMoney(debt)}`;
      debtClass = 'debt-red';
      if (blocked) {
        blockText = `<p class="blocked-text">🚫 ${days} kun bloklangan</p>`;
      } else if (days > 0) {
        debtText += ` • ${days} kun`;
      }
    } else if (debt < 0) {
      debtText = `💰 +${formatMoney(Math.abs(debt))}`;
      debtClass = 'debt-green';
    }
    
    const showTelegram = debt > 0 && customer.chatId;
    
    return `
      <div class="customer-card ${blocked ? 'blocked' : ''}" onclick="openCustomer(${customer.id})">
        ${showTelegram ? `<button class="telegram-btn" onclick="event.stopPropagation(); openReminderModal(${customer.id})">✈️</button>` : ''}
        <p class="name">👤 ${customer.name}</p>
        <p class="debt ${debtClass}">${debtText}</p>
        ${customer.phone ? `<p class="phone">📱 ${customer.phone}</p>` : ''}
        ${customer.chatId ? `<p class="phone">💬 Chat ID: ${customer.chatId}</p>` : ''}
        ${blockText}
      </div>
    `;
  }).join('');
  
  updateStatistics();
}

function renderTodaySales() {
  const todaySales = sales.filter(s => s.date === getTodayShort() && s.type === 'sale');
  
  const list = document.getElementById('todaySalesList');
  if (todaySales.length === 0) {
    list.innerHTML = '<p class="empty">Bugun savdo yo\'q</p>';
  } else {
    list.innerHTML = todaySales.map(sale => `
      <div class="sale-item-small">
        <p class="name">👤 ${sale.customerName}</p>
        <p class="product">📦 ${sale.product}</p>
        <p class="price">${formatMoney(sale.price)}</p>
        <p class="time">🕐 ${sale.time}</p>
      </div>
    `).join('');
  }
}
// ==================== CUSTOMER DETAIL PAGE ====================

function openCustomer(id) {
  selectedCustomer = customers.find(c => c.id === id);
  const blocked = isCustomerBlocked(id);
  
  document.getElementById('mainPage').classList.add('hidden');
  document.getElementById('daftarPage').classList.add('active');
  document.getElementById('customerNameTitle').textContent = selectedCustomer.name;
  document.getElementById('daftarDate').textContent = getToday();
  
  const formCard = document.querySelector('.form-card');
  if (blocked) {
    formCard.innerHTML = `
      <div style="text-align: center; padding: 48px 20px;">
        <p style="font-size: 64px; margin-bottom: 16px;">🚫</p>
        <h2 style="font-size: 22px; color: #ef4444; margin-bottom: 8px;">Mijoz bloklangan</h2>
        <p style="font-size: 15px; color: #6b7280;">Qarzni to'laguncha yangi savdo qilish mumkin emas</p>
      </div>
    `;
  } else {
    formCard.innerHTML = `
      <h2 id="formTitle">➕ Yangi savdo</h2>
      <input type="text" id="productInput" placeholder="Mahsulot nomi">
      <div class="row">
        <input type="number" id="priceInput" placeholder="Narxi (so'm)">
        <input type="number" id="paidInput" placeholder="Berilgan pul (so'm)">
      </div>
      <button class="submit-btn" id="submitBtn" onclick="addSale()">Savdo qo'shish</button>
    `;
  }
  
  renderCustomerSales();
}

function goBack() {
  selectedCustomer = null;
  editId = null;
  document.getElementById('mainPage').classList.remove('hidden');
  document.getElementById('daftarPage').classList.remove('active');
  loadCustomers().then(() => {
    renderCustomers();
    renderTodaySales();
  });
}

function renderCustomerSales() {
  const customerSales = sales.filter(s => s.customerId === selectedCustomer.id);
  const total = customerSales.reduce((sum, s) => s.type === 'sale' ? sum + s.price : sum, 0);
  const paid = customerSales.reduce((sum, s) => sum + s.paid, 0);
  const debt = total - paid;
  const days = getDebtDays(selectedCustomer.id);
  const blocked = isCustomerBlocked(selectedCustomer.id);

  const debtCard = document.getElementById('debtCard');
  const debtLabel = document.getElementById('debtLabel');
  const debtInfo = document.getElementById('debtInfo');
  const debtStatus = document.getElementById('debtStatus');
  
  document.getElementById('debtAmount').textContent = (debt > 0 ? '' : '+') + formatMoney(Math.abs(debt));
  
  if (debt > 0) {
    debtCard.className = 'debt-card has-debt';
    debtLabel.textContent = blocked ? '🚫 Bloklangan' : '⚠️ Qarz';
    debtStatus.textContent = blocked ? `${days} kun bloklangan` : `${days} kun`;
    debtInfo.innerHTML = `
      <span>Jami: ${formatMoney(total)}</span>
      <span>To'langan: ${formatMoney(paid)}</span>
    `;
  } else {
    debtCard.className = 'debt-card no-debt';
    debtLabel.textContent = '✅ Balans';
    debtStatus.textContent = debt < 0 ? 'Ortiqcha to\'langan' : 'To\'liq to\'langan';
    debtInfo.innerHTML = `
      <span>Jami: ${formatMoney(total)}</span>
      <span>To'langan: ${formatMoney(paid)}</span>
    `;
  }

  document.getElementById('recordsCount').textContent = customerSales.length;

  const list = document.getElementById('recordsList');
  if (customerSales.length === 0) {
    list.innerHTML = '<p class="empty">Hali yozuv yo\'q</p>';
  } else {
    list.innerHTML = customerSales.reverse().map(sale => {
      const bal = sale.paid - sale.price;
      const balClass = bal < 0 ? 'negative' : 'positive';
      const isPayment = sale.type === 'payment';
      
      return `
        <div class="record-item ${isPayment ? 'payment' : ''}">
          <div class="record-header">
            <div>
              <p class="record-product">${isPayment ? '💵 To\'lov' : '📦 ' + sale.product}</p>
              <p class="record-date">${sale.date} • ${sale.time}</p>
            </div>
            <div class="record-actions">
              <button onclick="deleteSale(${sale.id})" title="O'chirish">🗑️</button>
            </div>
          </div>
          ${!isPayment ? `
          <div class="record-body">
            <div class="record-prices">
              <p>Narxi: <span>${formatMoney(sale.price)}</span></p>
              <p>Berildi: <span>${formatMoney(sale.paid)}</span></p>
            </div>
            <div class="balance-box ${balClass}">
              <p class="label">Balans</p>
              <p class="amount">${bal < 0 ? '' : '+'}${formatMoney(Math.abs(bal))}</p>
            </div>
          </div>
          ` : `
          <div class="record-body">
            <div class="record-prices">
              <p>To'lov: <span>${formatMoney(sale.paid)}</span></p>
            </div>
            <div class="balance-box positive">
              <p class="label">To'lov</p>
              <p class="amount">+${formatMoney(sale.paid)}</p>
            </div>
          </div>
          `}
        </div>
      `;
    }).join('');
  }
}

// ==================== PAYMENT ====================

async function addPayment() {
  const amount = Number(document.getElementById('paymentAmount').value);
  
  if (!amount || amount <= 0) {
    alert('To\'lov miqdorini kiriting!');
    return;
  }
  
  const debt = getCustomerDebt(selectedCustomer.id);
  
  if (debt <= 0) {
    if (!confirm('Mijozning qarzi yo\'q. Baribir to\'lov qabul qilasizmi?')) {
      return;
    }
  }
  
  const newPayment = {
    id: Date.now(),
    customerId: selectedCustomer.id,
    customerName: selectedCustomer.name,
    product: 'To\'lov',
    price: 0,
    paid: amount,
    type: 'payment',
    time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    date: getTodayShort(),
    fullDate: new Date().toISOString()
  };
  
  sales.push(newPayment);
  await saveSale(newPayment);
  await loadCustomers();
  
  document.getElementById('paymentAmount').value = '';
  renderCustomerSales();
  renderTodaySales();
  renderCustomers();
  
  alert('✅ To\'lov qabul qilindi!');
}

// ==================== SALES ====================

async function addSale() {
  const product = document.getElementById('productInput').value.trim();
  const price = Number(document.getElementById('priceInput').value);
  const paid = Number(document.getElementById('paidInput').value);

  if (!product || !price || paid === '') {
    alert('Iltimos, barcha maydonlarni to\'ldiring!');
    return;
  }

  const newSale = {
    id: Date.now(),
    customerId: selectedCustomer.id,
    customerName: selectedCustomer.name,
    product,
    price,
    paid,
    type: 'sale',
    time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    date: getTodayShort(),
    fullDate: new Date().toISOString()
  };
  
  sales.push(newSale);
  await saveSale(newSale);
  await loadCustomers();
  
  document.getElementById('productInput').value = '';
  document.getElementById('priceInput').value = '';
  document.getElementById('paidInput').value = '';
  
  renderCustomerSales();
  renderTodaySales();
  renderCustomers();
}

async function deleteSale(id) {
  if (confirm('Yozuvni o\'chirmoqchimisiz?')) {
    sales = sales.filter(s => s.id !== id);
    await deleteSaleAPI(id);
    await loadCustomers();
    await loadSales();
    
    renderCustomerSales();
    renderTodaySales();
    renderCustomers();
  }
}

async function deleteCustomer() {
  if (!selectedCustomer) return;
  
  const customerSales = sales.filter(s => s.customerId === selectedCustomer.id);
  
  if (customerSales.length > 0) {
    if (!confirm(`${selectedCustomer.name} ning ${customerSales.length} ta yozuvi bor. Baribir o'chirmoqchimisiz?`)) {
      return;
    }
  }
  
  if (confirm(`${selectedCustomer.name} ni butunlay o'chirmoqchimisiz?`)) {
    const customerId = selectedCustomer.id;
    
    sales = sales.filter(s => s.customerId !== customerId);
    customers = customers.filter(c => c.id !== customerId);
    
    await deleteCustomerAPI(customerId);
    
    goBack();
    alert('✅ Mijoz o\'chirildi!');
  }
}

// ==================== MODALS ====================

function openAddModal() {
  document.getElementById('addModal').classList.add('active');
  document.getElementById('newCustomerInput').focus();
}

function closeAddModal() {
  document.getElementById('addModal').classList.remove('active');
  document.getElementById('newCustomerInput').value = '';
  document.getElementById('newCustomerPhone').value = '';
  document.getElementById('newCustomerChatId').value = '';
}

async function addCustomer() {
  const name = document.getElementById('newCustomerInput').value.trim();
  const phone = document.getElementById('newCustomerPhone').value.trim();
  const chatId = document.getElementById('newCustomerChatId').value.trim();
  
  if (!name) {
    alert('Iltimos, mijoz ismini kiriting!');
    return;
  }
  
  const newCustomer = {
    id: Date.now(),
    name,
    phone: phone || null,
    chatId: chatId || null,
    firstDebtDate: null,
    totalDebt: 0
  };
  
  customers.push(newCustomer);
  await saveCustomer(newCustomer);
  
  closeAddModal();
  renderCustomers();
}

function openSettingsModal() {
  document.getElementById('reminderDays').value = settings.reminderDays;
  document.getElementById('reminderTime').value = settings.reminderTime;
  document.getElementById('blockDays').value = settings.blockDays;
  document.getElementById('reminder3days').checked = settings.reminder3days;
  document.getElementById('reminder5days').checked = settings.reminder5days;
  document.getElementById('reminder7days').checked = settings.reminder7days;
  
  document.getElementById('settingsModal').classList.add('active');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('active');
}

async function saveSettings() {
  settings = {
    reminderDays: Number(document.getElementById('reminderDays').value),
    reminderTime: document.getElementById('reminderTime').value,
    blockDays: Number(document.getElementById('blockDays').value),
    reminder3days: document.getElementById('reminder3days').checked,
    reminder5days: document.getElementById('reminder5days').checked,
    reminder7days: document.getElementById('reminder7days').checked
  };
  
  await saveSettingsAPI(settings);
  closeSettingsModal();
  renderCustomers();
  alert('✅ Sozlamalar saqlandi!');
}

function openReminderModal(customerId) {
  const reminderCustomer = customers.find(c => c.id === customerId);
  if (!reminderCustomer || !reminderCustomer.chatId) {
    alert('❌ Mijozning Telegram Chat ID si yo\'q!');
    return;
  }
  
  const debt = getCustomerDebt(customerId);
  const days = getDebtDays(customerId);
  
  if (debt <= 0) {
    alert('Mijozning qarzi yo\'q!');
    return;
  }
  
  const debtSales = sales.filter(s => 
    s.customerId === customerId && s.type === 'sale' && (s.price - s.paid) > 0
  );
  
  document.getElementById('reminderCustomerName').textContent = reminderCustomer.name;
  document.getElementById('reminderDebtAmount').textContent = formatMoney(debt);
  
  let message = `⚠️ <b>Qarz to'lash eslatmasi</b>\n\nAssalomu alaykum ${reminderCustomer.name}!\n\n`;
  message += `📊 Jami qarzingiz: <b>${formatMoney(debt)}</b>\n`;
  message += `📆 Qarz kunlari: ${days} kun\n\n`;
  message += `📋 Qarz tafsilotlari:\n`;
  
  debtSales.forEach((sale, index) => {
    const saleDebt = sale.price - sale.paid;
    message += `${index + 1}. ${sale.product} - ${formatMoney(saleDebt)} (${sale.date})\n`;
  });
  
  message += `\n${days >= settings.blockDays ? '🚫 Iltimos, tezroq to\'lang, aks holda bloklangan bo\'lasiz!' : 'Iltimos, qarzingizni to\'lashingizni so\'raymiz.'}\n\nRahmat! 🙏`;
  
  document.getElementById('reminderMessage').value = message;
  document.getElementById('reminderModal').classList.add('active');
  
  window.currentReminderId = customerId;
}

function closeReminderModal() {
  document.getElementById('reminderModal').classList.remove('active');
  window.currentReminderId = null;
}

async function sendReminder() {
  if (!window.currentReminderId) return;
  
  const customer = customers.find(c => c.id === window.currentReminderId);
  if (!customer || !customer.chatId) return;
  
  const message = document.getElementById('reminderMessage').value;
  await sendTelegramMessage(customer.chatId, message);
  
  closeReminderModal();
}

function sendReminderFromDaftar() {
  if (!selectedCustomer) return;
  openReminderModal(selectedCustomer.id);
}

async function sendAllReminders() {
  const debtors = customers.filter(c => {
    const debt = getCustomerDebt(c.id);
    const days = getDebtDays(c.id);
    return debt > 0 && c.chatId && days >= settings.reminderDays;
  });
  
  if (debtors.length === 0) {
    alert('Eslatma yuborish uchun qarzdorlar yo\'q!');
    return;
  }
  
  if (!confirm(`${debtors.length} ta qarzdorga eslatma yuboriladi. Davom etasizmi?`)) {
    return;
  }
  
  let sent = 0;
  for (const customer of debtors) {
    const debt = getCustomerDebt(customer.id);
    const days = getDebtDays(customer.id);
    
    const message = `⚠️ <b>Qarz to'lash eslatmasi</b>\n\nAssalomu alaykum ${customer.name}!\n\nSizning qarzingiz: <b>${formatMoney(debt)}</b>\nQarz kunlari: ${days} kun\n\nIltimos, qarzingizni to'lashingizni so'raymiz.\n\nRahmat! 🙏`;
    
    const result = await sendTelegramMessage(customer.chatId, message);
    if (result.success) sent++;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  alert(`✅ ${sent}/${debtors.length} ta eslatma yuborildi!`);
}

// ==================== EXCEL ====================

function exportToExcel() {
  alert('Excel export funksiyasi ishga tushirilmoqda...');
}

// ==================== INIT ====================

async function init() {
  await loadSettings();
  await loadCustomers();
  await loadSales();
  
  document.getElementById('todayDate').textContent = getToday();
  renderCustomers();
  renderTodaySales();
  updateStatistics();
}

init();