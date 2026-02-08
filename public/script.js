// Backend server URL
const API_URL = window.location.origin + '/api';

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
    console.log('🔄 Mijozlar yuklanmoqda...', API_URL);
    
    // Avval cache dan yuklash (tez)
    const cachedCustomers = localStorage.getItem('customers_cache');
    if (cachedCustomers) {
      const cached = JSON.parse(cachedCustomers);
      // Agar cache 5 daqiqadan eski bo'lmasa
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        customers = cached.data;
        console.log(`⚡ ${customers.length} ta mijoz cache dan yuklandi (tez)`);
        renderCustomers();
        // Background da yangilash
        fetchCustomersInBackground();
        return;
      }
    }
    
    // Cache yo'q yoki eski - serverdan yuklash
    const response = await fetch(`${API_URL}/customers`);
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Server xatosi: ${response.status}`);
    }
    const data = await response.json();
    console.log('📦 Kelgan ma\'lumotlar:', data);
    
    customers = data.map(c => ({
      id: c.customerId,
      name: c.name,
      phone: c.phone,
      chatId: c.chatId,
      firstDebtDate: c.firstDebtDate ? new Date(c.firstDebtDate) : null,
      totalDebt: c.totalDebt || 0
    }));
    
    // Cache ga saqlash
    localStorage.setItem('customers_cache', JSON.stringify({
      data: customers,
      timestamp: Date.now()
    }));
    
    console.log(`✅ ${customers.length} ta mijoz yuklandi va cache ga saqlandi`);
    renderCustomers();
  } catch (error) {
    console.error('❌ Mijozlar yuklash xatosi:', error);
    
    // Xato bo'lsa, eski cache dan yuklash
    const cachedCustomers = localStorage.getItem('customers_cache');
    if (cachedCustomers) {
      const cached = JSON.parse(cachedCustomers);
      customers = cached.data;
      console.log(`⚠️ Xato! Eski cache dan yuklandi: ${customers.length} ta mijoz`);
      renderCustomers();
      alert('⚠️ Server bilan aloqa yo\'q. Eski ma\'lumotlar ko\'rsatilmoqda.');
    } else {
      alert('❌ Mijozlarni yuklashda xatolik!\n\nXato: ' + error.message + '\n\nIltimos, serverni tekshiring.');
    }
  }
}

// Background da yangilash (foydalanuvchi kutmaydi)
async function fetchCustomersInBackground() {
  try {
    const response = await fetch(`${API_URL}/customers`);
    if (response.ok) {
      const data = await response.json();
      customers = data.map(c => ({
        id: c.customerId,
        name: c.name,
        phone: c.phone,
        chatId: c.chatId,
        firstDebtDate: c.firstDebtDate ? new Date(c.firstDebtDate) : null,
        totalDebt: c.totalDebt || 0
      }));
      
      // Cache ni yangilash
      localStorage.setItem('customers_cache', JSON.stringify({
        data: customers,
        timestamp: Date.now()
      }));
      
      console.log('🔄 Background da yangilandi');
      renderCustomers();
    }
  } catch (error) {
    console.log('Background yangilanish xatosi:', error.message);
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
    console.error('Chat ID yo\'q');
    return { success: false, error: 'Chat ID yo\'q' };
  }

  try {
    console.log('📤 Xabar yuborilmoqda...', { chatId, messageLength: message.length });
    
    const response = await fetch(`${API_URL}/send-telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message })
    });

    const data = await response.json();
    console.log('📥 Server javobi:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Telegram xato:', error);
    return { success: false, error: error.message };
  }
}

// ==================== HELPER FUNCTIONS ====================

// Valyuta sozlamalari
let currency = {
  symbol: '$',
  name: 'USD',
  position: 'before'
};

function formatMoney(num) {
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  if (currency.position === 'before') {
    return `${currency.symbol}${formatted}`;
  } else {
    return `${formatted} ${currency.symbol}`;
  }
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
  
  // Bugungi to'lovlar
  const todayPayments = sales.filter(s => s.date === getTodayShort());
  const todayPaid = todayPayments.reduce((sum, s) => sum + s.paid, 0);
  
  document.getElementById('todayTotal').textContent = formatMoney(todayTotal);
  document.getElementById('todayPaid').textContent = formatMoney(todayPaid);
  document.getElementById('totalDebt').textContent = formatMoney(getTotalDebt());
  document.getElementById('debtorsCount').textContent = getDebtorsCount();
  document.getElementById('totalCustomers').textContent = customers.length;
  document.getElementById('activeCustomers').textContent = customers.filter(c => 
    sales.some(s => s.customerId === c.id)
  ).length;
  
  // Bugungi barcha yozuvlar
  const todayAllRecords = sales.filter(s => s.date === getTodayShort());
  document.getElementById('todaySalesCount').textContent = todayAllRecords.length;
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
  // Bugungi savdolar VA to'lovlar
  const todaySales = sales.filter(s => s.date === getTodayShort());
  
  const list = document.getElementById('todaySalesList');
  if (todaySales.length === 0) {
    list.innerHTML = '<p class="empty">Bugun savdo yo\'q</p>';
  } else {
    list.innerHTML = todaySales.map(sale => {
      const isPayment = sale.type === 'payment';
      return `
        <div class="sale-item-small ${isPayment ? 'payment-item' : ''}">
          <p class="name">👤 ${sale.customerName}</p>
          <p class="product">${isPayment ? '💵 To\'lov' : '📦 ' + sale.product}</p>
          <p class="price">${formatMoney(isPayment ? sale.paid : sale.price)}</p>
          <p class="time">🕐 ${sale.time}</p>
        </div>
      `;
    }).join('');
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
  const paymentInput = document.getElementById('paymentAmount');
  const amount = Number(paymentInput.value);
  
  if (!amount || amount <= 0) {
    alert('⚠️ To\'lov miqdorini kiriting!');
    paymentInput.focus();
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
  
  // Local arrayga qo'shish (tez)
  sales.push(newPayment);
  
  // Serverga saqlash (background)
  saveSale(newPayment).catch(err => console.error('To\'lov saqlash xatosi:', err));
  
  // Input tozalash
  paymentInput.value = '';
  
  // UI ni yangilash (tez)
  renderCustomerSales();
  renderTodaySales();
  updateStatistics();
  
  // Background da mijozlarni yangilash
  fetchCustomersInBackground();
  
  alert('✅ To\'lov qabul qilindi!');
}

// ==================== SALES ====================

async function addSale() {
  const productInput = document.getElementById('productInput');
  const priceInput = document.getElementById('priceInput');
  const paidInput = document.getElementById('paidInput');
  
  const product = productInput.value.trim();
  const price = Number(priceInput.value);
  const paid = Number(paidInput.value);

  if (!product || !price || paid === '') {
    alert('⚠️ Iltimos, barcha maydonlarni to\'ldiring!');
    return;
  }
  
  // Button holatini o'zgartirish
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '⏳ Saqlanmoqda...';
  submitBtn.disabled = true;

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
  
  try {
    // Local arrayga qo'shish (tez)
    sales.push(newSale);
    
    // Serverga saqlash (background)
    saveSale(newSale).catch(err => console.error('Savdo saqlash xatosi:', err));
    
    // Inputlarni tozalash
    productInput.value = '';
    priceInput.value = '';
    paidInput.value = '';
    
    // UI ni yangilash (tez)
    renderCustomerSales();
    renderTodaySales();
    updateStatistics();
    
    // Button holatini qaytarish
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    
    // Focus qaytarish
    productInput.focus();
    
    // Background da mijozlarni yangilash (kutmasdan)
    fetchCustomersInBackground();
    
  } catch (error) {
    console.error('Savdo qo\'shish xatosi:', error);
    alert('❌ Xatolik yuz berdi!');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

async function deleteSale(id) {
  if (confirm('Yozuvni o\'chirmoqchimisiz?')) {
    // Local arraydan o'chirish (tez)
    sales = sales.filter(s => s.id !== id);
    
    // Serverdan o'chirish (background)
    deleteSaleAPI(id).catch(err => console.error('Savdo o\'chirish xatosi:', err));
    
    // UI ni yangilash (tez)
    renderCustomerSales();
    renderTodaySales();
    updateStatistics();
    
    // Background da yangilash
    fetchCustomersInBackground();
    loadSales().catch(err => console.error('Savdolar yuklash xatosi:', err));
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
  const nameInput = document.getElementById('newCustomerInput');
  const phoneInput = document.getElementById('newCustomerPhone');
  const chatIdInput = document.getElementById('newCustomerChatId');
  
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const chatId = chatIdInput.value.trim();
  
  if (!name) {
    alert('⚠️ Iltimos, mijoz ismini kiriting!');
    nameInput.focus();
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
  
  // Local arrayga qo'shish (tez)
  customers.push(newCustomer);
  
  // Cache ni yangilash
  localStorage.setItem('customers_cache', JSON.stringify({
    data: customers,
    timestamp: Date.now()
  }));
  
  // Serverga saqlash (background)
  saveCustomer(newCustomer).catch(err => console.error('Mijoz saqlash xatosi:', err));
  
  closeAddModal();
  renderCustomers();
  
  alert('✅ Mijoz qo\'shildi!');
}

function openSettingsModal() {
  document.getElementById('reminderDays').value = settings.reminderDays;
  document.getElementById('reminderTime').value = settings.reminderTime;
  document.getElementById('blockDays').value = settings.blockDays;
  document.getElementById('reminder3days').checked = settings.reminder3days;
  document.getElementById('reminder5days').checked = settings.reminder5days;
  document.getElementById('reminder7days').checked = settings.reminder7days;
  
  // Valyuta sozlamalari
  if (document.getElementById('currencyType')) {
    document.getElementById('currencyType').value = settings.currencyType || 'USD';
    document.getElementById('currencyPosition').value = settings.currencyPosition || 'before';
    updateCurrencyPreview();
  }
  
  // Boshqa sozlamalar
  if (document.getElementById('languageSetting')) {
    document.getElementById('languageSetting').value = settings.language || 'uz';
  }
  if (document.getElementById('themeSetting')) {
    document.getElementById('themeSetting').value = settings.theme || 'blue';
  }
  if (document.getElementById('soundEnabled')) {
    document.getElementById('soundEnabled').checked = settings.soundEnabled !== false;
  }
  if (document.getElementById('autoBackup')) {
    document.getElementById('autoBackup').value = settings.autoBackup || 'weekly';
  }
  if (document.getElementById('autoExcelExport')) {
    document.getElementById('autoExcelExport').checked = settings.autoExcelExport !== false;
  }
  
  document.getElementById('settingsModal').classList.add('active');
}

function updateCurrencyPreview() {
  if (!document.getElementById('currencyType')) return;
  
  const type = document.getElementById('currencyType').value;
  const position = document.getElementById('currencyPosition').value;
  
  const symbols = {
    'USD': '$',
    'UZS': 'so\'m',
    'EUR': '€',
    'RUB': '₽'
  };
  
  const symbol = symbols[type];
  const amount = '1,234.56';
  
  let preview;
  if (position === 'before') {
    preview = `${symbol}${amount}`;
  } else {
    preview = `${amount} ${symbol}`;
  }
  
  if (document.getElementById('currencyPreview')) {
    document.getElementById('currencyPreview').textContent = preview;
  }
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
  
  // Valyuta sozlamalari
  if (document.getElementById('currencyType')) {
    settings.currencyType = document.getElementById('currencyType').value;
    settings.currencyPosition = document.getElementById('currencyPosition').value;
    
    // Valyuta sozlamalarini yangilash
    const symbols = {
      'USD': '$',
      'UZS': 'so\'m',
      'EUR': '€',
      'RUB': '₽'
    };
    
    currency = {
      symbol: symbols[settings.currencyType],
      name: settings.currencyType,
      position: settings.currencyPosition
    };
  }
  
  // Boshqa sozlamalar
  if (document.getElementById('languageSetting')) {
    settings.language = document.getElementById('languageSetting').value;
  }
  if (document.getElementById('themeSetting')) {
    settings.theme = document.getElementById('themeSetting').value;
  }
  if (document.getElementById('soundEnabled')) {
    settings.soundEnabled = document.getElementById('soundEnabled').checked;
  }
  if (document.getElementById('autoBackup')) {
    settings.autoBackup = document.getElementById('autoBackup').value;
  }
  if (document.getElementById('autoExcelExport')) {
    settings.autoExcelExport = document.getElementById('autoExcelExport').checked;
  }
  
  await saveSettingsAPI(settings);
  localStorage.setItem('appSettings', JSON.stringify(settings));
  
  closeSettingsModal();
  renderCustomers();
  renderTodaySales();
  updateStatistics();
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

function openCustomMessageFromDaftar() {
  if (!selectedCustomer || !selectedCustomer.chatId) {
    alert('❌ Mijozning Telegram Chat ID si yo\'q!');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>💬 Xabar Yuborish</h2>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      <p class="modal-info">
        <strong>${selectedCustomer.name}</strong> ga xabar yuboriladi.
      </p>
      <div class="form-group">
        <label for="customMessageText">Xabar matni:</label>
        <textarea id="customMessageText" rows="8" placeholder="Xabar matnini kiriting..." style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 14px; font-family: inherit; resize: vertical;"></textarea>
      </div>
      <div class="modal-buttons">
        <button class="cancel-btn" onclick="this.closest('.modal').remove()">Bekor qilish</button>
        <button class="confirm-btn" onclick="sendCustomMessageNow('${selectedCustomer.chatId}', this)">
          <span>📤</span>
          Yuborish
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Textarea ga avtomatik focus
  setTimeout(() => {
    const textarea = modal.querySelector('#customMessageText');
    if (textarea) {
      textarea.focus();
    }
  }, 100);
  
  // Modal tashqarisiga bosilganda yopish
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

async function sendCustomMessageNow(chatId, button) {
  // Modal ichidan textarea ni topish
  const modal = button.closest('.modal');
  const textarea = modal.querySelector('#customMessageText');
  
  if (!textarea) {
    alert('❌ Xabar maydoni topilmadi!');
    console.error('Textarea element topilmadi');
    return;
  }
  
  const message = textarea.value.trim();
  
  if (!message) {
    alert('⚠️ Iltimos, xabar matnini kiriting!');
    textarea.focus();
    return;
  }
  
  const originalText = button.innerHTML;
  button.innerHTML = '⏳ Yuborilmoqda...';
  button.disabled = true;
  
  try {
    const result = await sendTelegramMessage(chatId, message);
    
    if (result.success) {
      modal.remove();
      alert('✅ Xabar muvaffaqiyatli yuborildi!');
    } else {
      button.innerHTML = originalText;
      button.disabled = false;
      alert('❌ Xabar yuborilmadi. Qaytadan urinib ko\'ring.');
    }
  } catch (error) {
    console.error('Xabar yuborish xatosi:', error);
    button.innerHTML = originalText;
    button.disabled = false;
    alert('❌ Xatolik yuz berdi: ' + error.message);
  }
}

function openEditCustomerFromDaftar() {
  if (!selectedCustomer) return;
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>✏️ Mijozni Tahrirlash</h2>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      <input type="text" id="editCustomerName" placeholder="Mijoz ismi *" value="${selectedCustomer.name}" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 14px; margin-bottom: 12px;">
      <input type="tel" id="editCustomerPhone" placeholder="Telefon: +998901234567" value="${selectedCustomer.phone || ''}" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 14px; margin-bottom: 12px;">
      <input type="text" id="editCustomerChatId" placeholder="Telegram Chat ID" value="${selectedCustomer.chatId || ''}" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 14px; margin-bottom: 12px;">
      <p class="hint-text" style="color: #6b7280; font-size: 13px; margin-bottom: 16px;">
        💡 Ma'lumotlarni yangilang
      </p>
      <div class="modal-buttons">
        <button class="cancel-btn" onclick="this.closest('.modal').remove()">Bekor qilish</button>
        <button class="confirm-btn" onclick="saveEditCustomerNow(this)">
          <span>✓</span>
          Saqlash
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Modal tashqarisiga bosilganda yopish
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

async function saveEditCustomerNow(button) {
  // Modal ichidan inputlarni topish
  const modal = button.closest('.modal');
  const nameInput = modal.querySelector('#editCustomerName');
  const phoneInput = modal.querySelector('#editCustomerPhone');
  const chatIdInput = modal.querySelector('#editCustomerChatId');
  
  if (!nameInput || !phoneInput || !chatIdInput) {
    alert('❌ Forma elementlari topilmadi!');
    console.error('Input elementlar topilmadi');
    return;
  }
  
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const chatId = chatIdInput.value.trim();
  
  if (!name) {
    alert('⚠️ Iltimos, mijoz ismini kiriting!');
    nameInput.focus();
    return;
  }
  
  const originalText = button.innerHTML;
  button.innerHTML = '⏳ Saqlanmoqda...';
  button.disabled = true;
  
  try {
    const response = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: selectedCustomer.id,
        name: name,
        phone: phone || null,
        chatId: chatId || null
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Local ma'lumotlarni yangilash
      selectedCustomer.name = name;
      selectedCustomer.phone = phone || null;
      selectedCustomer.chatId = chatId || null;
      
      // Customers arrayda ham yangilash
      const customerIndex = customers.findIndex(c => c.id === selectedCustomer.id);
      if (customerIndex !== -1) {
        customers[customerIndex] = { ...selectedCustomer };
      }
      
      // Cache ni yangilash
      localStorage.setItem('customers_cache', JSON.stringify({
        data: customers,
        timestamp: Date.now()
      }));
      
      // UI ni yangilash
      document.getElementById('customerNameTitle').textContent = name;
      
      modal.remove();
      alert('✅ Mijoz ma\'lumotlari yangilandi!');
      
      // Mijozlar ro'yxatini yangilash
      renderCustomers();
    } else {
      throw new Error(data.error || 'Xatolik yuz berdi');
    }
  } catch (error) {
    console.error('Mijoz yangilash xatosi:', error);
    alert('❌ Xatolik yuz berdi: ' + error.message);
    button.innerHTML = originalText;
    button.disabled = false;
  }
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

async function viewExcelFiles() {
  try {
    console.log('📊 Excel fayllar yuklanmoqda...');
    const response = await fetch(`${API_URL}/excel-files`);
    
    if (!response.ok) {
      throw new Error(`Server xatosi: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Excel fayllar:', data);
    
    if (!data.success || !data.files || data.files.length === 0) {
      alert('📁 Excel fayllar topilmadi!\n\nFayllar avtomatik yaratiladi savdo qo\'shganingizda.');
      return;
    }
    
    // Modal yaratish
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content large" style="max-width: 800px;">
        <div class="modal-header">
          <h2>📊 Excel Fayllar (${data.files.length} ta)</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div style="max-height: 400px; overflow-y: auto; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px; text-align: left; font-weight: 700; font-size: 14px;">📄 Fayl nomi</th>
                <th style="padding: 12px; text-align: right; font-weight: 700; font-size: 14px;">📏 Hajmi</th>
                <th style="padding: 12px; text-align: right; font-weight: 700; font-size: 14px;">📅 Sana</th>
                <th style="padding: 12px; text-align: center; font-weight: 700; font-size: 14px;">⚡ Amal</th>
              </tr>
            </thead>
            <tbody>
              ${data.files.map(file => {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                const sizeKB = (file.size / 1024).toFixed(2);
                const sizeText = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
                const date = new Date(file.date).toLocaleDateString('uz-UZ', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                
                return `
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 12px; font-weight: 500; font-size: 13px;">${file.name}</td>
                    <td style="padding: 12px; text-align: right; color: #6b7280; font-size: 13px;">${sizeText}</td>
                    <td style="padding: 12px; text-align: right; color: #6b7280; font-size: 13px;">${date}</td>
                    <td style="padding: 12px; text-align: center;">
                      <button onclick="downloadExcelFile('${file.name}')" 
                              style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                                     color: white; border: none; padding: 8px 16px; 
                                     border-radius: 8px; cursor: pointer; font-weight: 600;
                                     transition: all 0.3s; font-size: 13px;"
                              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.4)'"
                              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        📥 Yuklab olish
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div style="margin-top: 20px; padding: 16px; background: #f0f9ff; border-radius: 12px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; color: #1e40af; font-weight: 600; font-size: 14px;">
            💡 Fayllar joylashuvi:
          </p>
          <p style="margin: 8px 0 0 0; color: #1e3a8a; font-family: monospace; font-size: 12px;">
            ${data.path || 'excel-files papkasi'}
          </p>
        </div>
        <div class="modal-buttons" style="margin-top: 20px;">
          <button class="cancel-btn" onclick="this.closest('.modal').remove()">Yopish</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Modal tashqarisiga bosilganda yopish
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
  } catch (error) {
    console.error('❌ Excel fayllar xatosi:', error);
    alert('❌ Excel fayllarni yuklashda xatolik!\n\nXato: ' + error.message);
  }
}

async function downloadExcelFile(fileName) {
  try {
    console.log('📥 Yuklab olinmoqda:', fileName);
    
    // Yuklab olish jarayonini ko'rsatish
    const downloadBtn = event.target;
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '⏳ Yuklanmoqda...';
    downloadBtn.disabled = true;
    
    // Faylni yuklab olish
    const link = document.createElement('a');
    link.href = `${API_URL}/excel-download/${encodeURIComponent(fileName)}`;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Tozalash
    setTimeout(() => {
      document.body.removeChild(link);
      downloadBtn.innerHTML = '✅ Yuklandi!';
      setTimeout(() => {
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
      }, 2000);
    }, 500);
    
    console.log('✅ Yuklab olish boshlandi');
  } catch (error) {
    console.error('❌ Yuklab olish xatosi:', error);
    alert('❌ Faylni yuklab olishda xatolik!');
    event.target.innerHTML = '❌ Xato';
    setTimeout(() => {
      event.target.innerHTML = '📥 Yuklab olish';
      event.target.disabled = false;
    }, 2000);
  }
}

async function createBackup() {
  if (!confirm('💾 Backup yaratilsinmi?\n\nBarcha ma\'lumotlar saqlanadi.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/backup/create`, {
      method: 'POST'
    });
    const data = await response.json();
    
    if (data.success) {
      alert(`✅ Backup yaratildi!\n\n📁 Fayl: ${data.fileName}\n📏 Hajmi: ${(data.size / 1024).toFixed(2)} KB`);
    } else {
      alert('❌ Backup yaratishda xatolik!');
    }
  } catch (error) {
    console.error('Backup xatosi:', error);
    alert('❌ Backup yaratishda xatolik!');
  }
}

function exportToExcel() {
  viewExcelFiles();
}

function logout() {
  if (confirm('Tizimdan chiqmoqchimisiz?')) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
    window.location.href = '/login.html';
  }
}

// ==================== INIT ====================

async function init() {
  // Saqlangan sozlamalarni yuklash
  const savedSettings = localStorage.getItem('appSettings');
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings);
    settings = { ...settings, ...parsed };
    
    // Valyuta sozlamalarini o'rnatish
    const symbols = {
      'USD': '$',
      'UZS': 'so\'m',
      'EUR': '€',
      'RUB': '₽'
    };
    
    currency = {
      symbol: symbols[settings.currencyType] || '$',
      name: settings.currencyType || 'USD',
      position: settings.currencyPosition || 'before'
    };
  }
  
  await loadSettings();
  await loadCustomers();
  await loadSales();
  
  document.getElementById('todayDate').textContent = getToday();
  renderCustomers();
  renderTodaySales();
  updateStatistics();
  
  // Excel fayllar sonini yuklash
  try {
    const response = await fetch(`${API_URL}/excel-files`);
    const data = await response.json();
    if (data.success) {
      const excelCountElement = document.getElementById('excelFilesCount');
      excelCountElement.textContent = data.files.length;
      
      // Excel fayllar soniga click event qo'shish
      excelCountElement.style.cursor = 'pointer';
      excelCountElement.onclick = function() {
        viewExcelFiles();
      };
      
      // Stat card ga ham click qo'shish
      const statCard = excelCountElement.closest('.stat-card');
      if (statCard) {
        statCard.style.cursor = 'pointer';
        statCard.onclick = function() {
          viewExcelFiles();
        };
      }
    }
  } catch (error) {
    console.error('Excel fayllar soni yuklash xatosi:', error);
  }
}

init();