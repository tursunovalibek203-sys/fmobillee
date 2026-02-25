// Backend server URL - Render.com dan deploy qilgandan keyin bu yerga qo'ying
const API_URL = 'https://fmobilee.onrender.com/api';

let customers = [];
let sales = [];
let products = []; // Mahsulotlar bazasi
let selectedProduct = null; // Tanlangan mahsulot
let selectedCustomer = null;
let editId = null;
let currentFilter = 'all';

// Kassir balans
let cashierBalance = {
  cash: 0,      // Naqd pul
  card: 0,      // Karta
  total: 0      // Jami
};
let handoverHistory = []; // Kirim tarixi

let settings = {
  // Bildirishnomalar
  reminderDays: 7,
  reminderTime: '09:00',
  blockDays: 10,
  reminder3days: true,
  reminder5days: true,
  reminder7days: true,
  soundEnabled: true,
  desktopNotifications: true,
  
  // Umumiy
  shopName: '',
  shopPhone: '',
  shopAddress: '',
  currency: 'USD',
  exchangeRate: 12500,
  workStartTime: '09:00',
  workEndTime: '20:00',
  
  // To'lov
  enableCash: true,
  enableCard: true,
  enableTransfer: true,
  maxDiscount: 50,
  autoDiscount: false,
  autoPrintReceipt: false,
  sendReceiptTelegram: true,
  
  // Xavfsizlik
  sessionTimeout: 60,
  requirePasswordForDelete: true,
  autoBackup: true,
  backupTime: '23:00',
  
  // Ko'rinish
  theme: 'blue',
  fontSize: 'medium',
  compactMode: false,
  showAnimations: true,
  language: 'uz'
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
      fullDate: s.createdAt,
      paymentType: s.paymentType || 'cash',
      quantity: s.quantity || 1
    }));
  } catch (error) {
    console.error('Savdolar yuklash xatosi:', error);
    const savedSales = localStorage.getItem('sales');
    if (savedSales) sales = JSON.parse(savedSales);
  }
}

// Mahsulotlarni yuklash
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const data = await response.json();
    products = data.map(p => ({
      id: p.productId,
      name: p.name,
      category: p.category || 'Umumiy',
      buyPrice: p.buyPrice || 0,
      sellPrice: p.sellPrice,
      stock: p.stock || 0,
      unit: p.unit || 'dona',
      barcode: p.barcode || '',
      sku: p.sku || '',
      description: p.description || ''
    }));
    console.log(`✅ ${products.length} ta mahsulot yuklandi`);
  } catch (error) {
    console.error('Mahsulotlar yuklash xatosi:', error);
    // Demo mahsulotlar
    products = [
      { id: 1, name: 'iPhone 15 Pro', category: 'Telefonlar', sellPrice: 1200, buyPrice: 1000, stock: 5, unit: 'dona', barcode: '123456', sku: 'IP15P' },
      { id: 2, name: 'Samsung Galaxy S24', category: 'Telefonlar', sellPrice: 900, buyPrice: 750, stock: 8, unit: 'dona', barcode: '123457', sku: 'SGS24' },
      { id: 3, name: 'AirPods Pro', category: 'Aksessuarlar', sellPrice: 250, buyPrice: 200, stock: 15, unit: 'dona', barcode: '123458', sku: 'APP' },
      { id: 4, name: 'MacBook Air M2', category: 'Noutbuklar', sellPrice: 1500, buyPrice: 1300, stock: 3, unit: 'dona', barcode: '123459', sku: 'MBAM2' },
      { id: 5, name: 'iPad Pro 12.9', category: 'Planshetlar', sellPrice: 1100, buyPrice: 950, stock: 4, unit: 'dona', barcode: '123460', sku: 'IPP12' }
    ];
    localStorage.setItem('products', JSON.stringify(products));
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
  return '$' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// ==================== MAHSULOT QIDIRUV ====================

function searchProducts() {
  const query = document.getElementById('productSearchInput').value.trim().toLowerCase();
  const resultsDiv = document.getElementById('productSearchResults');
  
  if (query.length < 2) {
    resultsDiv.classList.remove('active');
    return;
  }
  
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(query) ||
    p.barcode.toLowerCase().includes(query) ||
    p.sku.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  ).slice(0, 8);
  
  if (filtered.length === 0) {
    resultsDiv.innerHTML = '<div class="product-search-empty">❌ Mahsulot topilmadi</div>';
    resultsDiv.classList.add('active');
    return;
  }
  
  resultsDiv.innerHTML = filtered.map(product => `
    <div class="product-search-item" onclick="selectProduct(${product.id})">
      <div class="product-name">📦 ${product.name}</div>
      <div class="product-details">
        <span>💰 ${formatMoney(product.sellPrice)}</span>
        <span>📊 Ombor: ${product.stock} ${product.unit}</span>
        <span>🏷️ ${product.category}</span>
        ${product.barcode ? `<span>🔢 ${product.barcode}</span>` : ''}
      </div>
    </div>
  `).join('');
  
  resultsDiv.classList.add('active');
}

function selectProduct(productId) {
  selectedProduct = products.find(p => p.id === productId);
  if (!selectedProduct) return;
  
  // Qidiruv natijalarini yashirish
  document.getElementById('productSearchResults').classList.remove('active');
  document.getElementById('productSearchInput').value = '';
  
  // Tanlangan mahsulotni ko'rsatish
  document.getElementById('selectedProductInfo').style.display = 'block';
  document.getElementById('selectedProductName').textContent = selectedProduct.name;
  document.getElementById('selectedProductDetails').textContent = 
    `${selectedProduct.category} • ${formatMoney(selectedProduct.sellPrice)} • Ombor: ${selectedProduct.stock} ${selectedProduct.unit}`;
  
  // Narxni avtomatik to'ldirish
  document.getElementById('priceInput').value = selectedProduct.sellPrice;
  document.getElementById('quantityInput').focus();
}

function clearProductSelection() {
  selectedProduct = null;
  document.getElementById('selectedProductInfo').style.display = 'none';
  document.getElementById('priceInput').value = '';
  document.getElementById('quantityInput').value = 1;
  document.getElementById('productSearchInput').focus();
}

// Qidiruv oynasini tashqarida bosish orqali yopish
document.addEventListener('click', function(e) {
  const searchInput = document.getElementById('productSearchInput');
  const resultsDiv = document.getElementById('productSearchResults');
  
  if (searchInput && resultsDiv && !searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
    resultsDiv.classList.remove('active');
  }
});

// ==================== HELPER FUNCTIONS (davomi) ====================

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
  document.getElementById('todaySalesCount').textContent = todaySales.length;
  
  // Kassir balansini yangilash
  updateCashierBalance();
}

function updateCashierBalance() {
  // Bugungi savdolardan balansni hisoblash
  const todaySales = sales.filter(s => s.date === getTodayShort() && s.type === 'sale');
  
  cashierBalance.cash = todaySales
    .filter(s => s.paymentType === 'cash')
    .reduce((sum, s) => sum + s.paid, 0);
    
  cashierBalance.card = todaySales
    .filter(s => s.paymentType === 'card')
    .reduce((sum, s) => sum + s.paid, 0);
  
  // Aralash to'lovlar (50/50 deb hisoblaymiz)
  const mixedPayments = todaySales
    .filter(s => s.paymentType === 'mixed')
    .reduce((sum, s) => sum + s.paid, 0);
  
  cashierBalance.cash += mixedPayments / 2;
  cashierBalance.card += mixedPayments / 2;
  
  // Kirim berilganlarni ayirish
  const todayHandovers = handoverHistory.filter(h => h.date === getTodayShort());
  const totalHandedOver = todayHandovers.reduce((sum, h) => sum + h.amount, 0);
  
  cashierBalance.total = cashierBalance.cash + cashierBalance.card - totalHandedOver;
  
  // UI ni yangilash
  document.getElementById('cashierBalance').textContent = formatMoney(cashierBalance.total);
  document.getElementById('cashBalance').textContent = formatMoney(cashierBalance.cash);
  document.getElementById('cardBalance').textContent = formatMoney(cashierBalance.card);
}

// ==================== KASSIR BALANS FUNKSIYALARI ====================

function openHandoverModal() {
  document.getElementById('handoverCurrentBalance').textContent = formatMoney(cashierBalance.total);
  document.getElementById('handoverCashBalance').textContent = formatMoney(cashierBalance.cash);
  document.getElementById('handoverCardBalance').textContent = formatMoney(cashierBalance.card);
  document.getElementById('handoverAmount').value = '';
  document.getElementById('handoverNotes').value = '';
  document.getElementById('handoverModal').classList.add('active');
}

function closeHandoverModal() {
  document.getElementById('handoverModal').classList.remove('active');
}

async function submitHandover() {
  const amount = Number(document.getElementById('handoverAmount').value);
  const notes = document.getElementById('handoverNotes').value.trim();
  
  if (!amount || amount <= 0) {
    showNotification('❌ Kirim miqdorini kiriting!', 'error');
    return;
  }
  
  if (amount > cashierBalance.total) {
    showNotification('❌ Kassada yetarli pul yo\'q!', 'error');
    return;
  }
  
  const handover = {
    id: Date.now(),
    amount,
    notes,
    balanceBefore: cashierBalance.total,
    balanceAfter: cashierBalance.total - amount,
    date: getTodayShort(),
    time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    fullDate: new Date().toISOString()
  };
  
  handoverHistory.push(handover);
  localStorage.setItem('handoverHistory', JSON.stringify(handoverHistory));
  
  // API ga yuborish (agar mavjud bo'lsa)
  try {
    await fetch(`${API_URL}/cashier-handover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(handover)
    });
  } catch (error) {
    console.log('API mavjud emas, localStorage da saqlandi');
  }
  
  closeHandoverModal();
  updateCashierBalance();
  showNotification('✅ Kirim qabul qilindi!', 'success');
}

function openBalanceHistoryModal() {
  const list = document.getElementById('handoverHistoryList');
  
  if (handoverHistory.length === 0) {
    list.innerHTML = '<p class="empty">Hali kirim yo\'q</p>';
  } else {
    list.innerHTML = handoverHistory.slice().reverse().map(h => `
      <div style="background: #f9fafb; border-radius: 14px; padding: 20px; margin-bottom: 12px; border-left: 3px solid #667eea;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <div>
            <p style="font-weight: 700; color: #5b21b6; font-size: 16px; margin-bottom: 4px;">📤 ${formatMoney(h.amount)}</p>
            <p style="font-size: 13px; color: #6b7280;">${h.date} • ${h.time}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 12px; color: #9ca3af; margin-bottom: 2px;">Oldin: ${formatMoney(h.balanceBefore)}</p>
            <p style="font-size: 12px; color: #9ca3af;">Keyin: ${formatMoney(h.balanceAfter)}</p>
          </div>
        </div>
        ${h.notes ? `<p style="font-size: 13px; color: #6b7280; font-style: italic;">💬 ${h.notes}</p>` : ''}
      </div>
    `).join('');
  }
  
  const totalHandedOver = handoverHistory.reduce((sum, h) => sum + h.amount, 0);
  document.getElementById('totalHandedOver').textContent = formatMoney(totalHandedOver);
  
  document.getElementById('balanceHistoryModal').classList.add('active');
}

function closeBalanceHistoryModal() {
  document.getElementById('balanceHistoryModal').classList.remove('active');
}

// ==================== CHEK CHOP ETISH ====================

function generateReceipt(sale, customer) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // Chek o'lchami
  });
  
  const debt = getCustomerDebt(customer.id);
  const paymentTypeText = {
    'cash': '💵 Naqd',
    'card': '💳 Karta',
    'transfer': '🏦 O\'tkazma',
    'mixed': '🔄 Aralash'
  };
  
  // Chek dizayni
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('SAVDO CHEKI', 40, 10, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('================================', 40, 15, { align: 'center' });
  
  // Sana va vaqt
  doc.setFontSize(9);
  doc.text(`Sana: ${sale.date}`, 5, 22);
  doc.text(`Vaqt: ${sale.time}`, 5, 27);
  
  // Mijoz
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('MIJOZ:', 5, 35);
  doc.setFont(undefined, 'normal');
  doc.text(customer.name, 5, 40);
  if (customer.phone) {
    doc.setFontSize(8);
    doc.text(`Tel: ${customer.phone}`, 5, 45);
  }
  
  doc.setFontSize(8);
  doc.text('================================', 40, 50, { align: 'center' });
  
  // Mahsulot
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('MAHSULOT:', 5, 57);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  
  // Mahsulot nomini qisqartirish (agar uzun bo'lsa)
  const productName = sale.product.length > 30 ? sale.product.substring(0, 30) + '...' : sale.product;
  doc.text(productName, 5, 62);
  
  // Narx va miqdor
  let yPos = 70;
  doc.text(`Narxi:`, 5, yPos);
  doc.text(`${formatMoney(sale.price / sale.quantity)}`, 75, yPos, { align: 'right' });
  
  yPos += 5;
  doc.text(`Miqdori:`, 5, yPos);
  doc.text(`${sale.quantity}`, 75, yPos, { align: 'right' });
  
  yPos += 5;
  doc.setFont(undefined, 'bold');
  doc.text(`Jami:`, 5, yPos);
  doc.text(`${formatMoney(sale.price)}`, 75, yPos, { align: 'right' });
  
  doc.setFont(undefined, 'normal');
  yPos += 5;
  doc.text(`To'landi:`, 5, yPos);
  doc.text(`${formatMoney(sale.paid)}`, 75, yPos, { align: 'right' });
  
  yPos += 5;
  doc.text(`To'lov turi:`, 5, yPos);
  doc.text(paymentTypeText[sale.paymentType] || 'Naqd', 75, yPos, { align: 'right' });
  
  doc.setFontSize(8);
  yPos += 3;
  doc.text('================================', 40, yPos, { align: 'center' });
  
  // Qarz
  yPos += 7;
  const saleDebt = sale.price - sale.paid;
  if (saleDebt > 0) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text(`Bu savdo qarzi:`, 5, yPos);
    doc.text(`${formatMoney(saleDebt)}`, 75, yPos, { align: 'right' });
  } else {
    doc.setFontSize(9);
    doc.text(`To'liq to'landi`, 40, yPos, { align: 'center' });
  }
  
  if (debt > 0) {
    yPos += 5;
    doc.setFont(undefined, 'bold');
    doc.text(`JAMI QARZ:`, 5, yPos);
    doc.text(`${formatMoney(debt)}`, 75, yPos, { align: 'right' });
  }
  
  // Footer
  yPos += 10;
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('================================', 40, yPos, { align: 'center' });
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('RAHMAT!', 40, yPos, { align: 'center' });
  
  yPos += 7;
  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');
  doc.text('Xaridingiz uchun tashakkur!', 40, yPos, { align: 'center' });
  
  // Chekni ochish
  doc.output('dataurlnewwindow');
  
  showNotification('✅ Chek yaratildi!', 'success');
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
      
      <!-- Mahsulot qidiruv -->
      <div style="position: relative;">
        <input type="text" id="productSearchInput" placeholder="🔍 Mahsulot qidirish (nom, barcode, SKU)..." 
               oninput="searchProducts()" autocomplete="off">
        <div id="productSearchResults" class="product-search-results"></div>
      </div>
      
      <!-- Tanlangan mahsulot -->
      <div id="selectedProductInfo" style="display: none; background: #ede9fe; padding: 12px; border-radius: 10px; margin-bottom: 12px; border-left: 3px solid #667eea;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="font-weight: 700; color: #5b21b6; margin-bottom: 4px;" id="selectedProductName"></p>
            <p style="font-size: 13px; color: #7c3aed;" id="selectedProductDetails"></p>
          </div>
          <button onclick="clearProductSelection()" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">✕ Bekor</button>
        </div>
      </div>
      
      <div class="row">
        <input type="number" id="priceInput" placeholder="Narxi ($)" step="0.01">
        <input type="number" id="quantityInput" placeholder="Miqdori" value="1" min="1">
      </div>
      
      <div class="row">
        <input type="number" id="paidInput" placeholder="Berilgan pul ($)" step="0.01">
        <select id="paymentTypeInput" style="padding: 14px 18px; border: 2px solid #e5e7eb; border-radius: 14px; font-size: 15px; font-weight: 500; outline: none;">
          <option value="cash">💵 Naqd</option>
          <option value="card">💳 Karta</option>
          <option value="transfer">🏦 O'tkazma</option>
          <option value="mixed">🔄 Aralash</option>
        </select>
      </div>
      
      <button class="submit-btn" id="submitBtn" onclick="addSale()">
        <span>➕</span>
        Savdo qo'shish
      </button>
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
              <button onclick="editSale(${sale.id})" title="Tahrirlash" style="background: #3b82f6; color: white;">✏️</button>
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
  const product = selectedProduct ? selectedProduct.name : document.getElementById('productInput')?.value.trim();
  const price = Number(document.getElementById('priceInput').value);
  const quantity = Number(document.getElementById('quantityInput').value) || 1;
  const paid = Number(document.getElementById('paidInput').value);
  const paymentType = document.getElementById('paymentTypeInput').value;

  if (!product || !price || paid === '') {
    alert('Iltimos, barcha maydonlarni to\'ldiring!');
    return;
  }
  
  if (quantity <= 0) {
    alert('Miqdor 0 dan katta bo\'lishi kerak!');
    return;
  }
  
  // Omborda yetarli mahsulot borligini tekshirish
  if (selectedProduct && selectedProduct.stock < quantity) {
    if (!confirm(`⚠️ Omborda faqat ${selectedProduct.stock} ${selectedProduct.unit} bor!\n\nBaribir davom etasizmi?`)) {
      return;
    }
  }

  const totalPrice = price * quantity;

  const newSale = {
    id: Date.now(),
    customerId: selectedCustomer.id,
    customerName: selectedCustomer.name,
    product,
    price: totalPrice,
    paid,
    quantity,
    paymentType,
    type: 'sale',
    time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    date: getTodayShort(),
    fullDate: new Date().toISOString()
  };
  
  sales.push(newSale);
  await saveSale(newSale);
  await loadCustomers();
  
  // Ombor miqdorini kamaytirish (agar mahsulot tanlangan bo'lsa)
  if (selectedProduct) {
    selectedProduct.stock -= quantity;
    // Bu yerda API ga ombor yangilanishini yuborish kerak
  }
  
  // Chek yaratish
  const shouldPrintReceipt = confirm('✅ Savdo qo\'shildi!\n\n🖨️ Chek chop etishni xohlaysizmi?');
  if (shouldPrintReceipt) {
    generateReceipt(newSale, selectedCustomer);
  }
  
  // Formani tozalash
  clearProductSelection();
  document.getElementById('priceInput').value = '';
  document.getElementById('quantityInput').value = 1;
  document.getElementById('paidInput').value = '';
  document.getElementById('paymentTypeInput').value = 'cash';
  
  renderCustomerSales();
  renderTodaySales();
  renderCustomers();
  
  // Muvaffaqiyat xabari
  if (!shouldPrintReceipt) {
    showNotification('✅ Savdo qo\'shildi!', 'success');
  }
}

// ==================== PROFESSIONAL NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification-toast ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  notification.innerHTML = `
    <div style="font-size: 24px;">${icons[type] || icons.success}</div>
    <div style="flex: 1;">
      <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #111827;">${type === 'success' ? 'Muvaffaqiyatli' : type === 'error' ? 'Xatolik' : type === 'warning' ? 'Ogohlantirish' : 'Ma\'lumot'}</div>
      <div style="font-size: 13px; color: #6b7280;">${message}</div>
    </div>
    <button onclick="this.parentElement.remove()" style="background: transparent; border: none; color: #9ca3af; cursor: pointer; font-size: 20px; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s;">×</button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.classList.add('hiding');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
  
  // Add ripple effect on click
  notification.addEventListener('click', function(e) {
    if (e.target.tagName !== 'BUTTON') {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const rect = this.getBoundingClientRect();
      ripple.style.left = e.clientX - rect.left + 'px';
      ripple.style.top = e.clientY - rect.top + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
  });
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

// ==================== SAVDONI TAHRIRLASH ====================

let editingSaleId = null;

function editSale(saleId) {
  const sale = sales.find(s => s.id === saleId);
  if (!sale) return;
  
  editingSaleId = saleId;
  
  // Modalga ma'lumotlarni to'ldirish
  document.getElementById('editProductName').value = sale.product;
  document.getElementById('editPrice').value = sale.price / (sale.quantity || 1);
  document.getElementById('editQuantity').value = sale.quantity || 1;
  document.getElementById('editPaid').value = sale.paid;
  document.getElementById('editPaymentType').value = sale.paymentType || 'cash';
  
  // Modalni ochish
  document.getElementById('editSaleModal').classList.add('active');
}

function closeEditSaleModal() {
  document.getElementById('editSaleModal').classList.remove('active');
  editingSaleId = null;
}

async function saveEditedSale() {
  if (!editingSaleId) return;
  
  const product = document.getElementById('editProductName').value.trim();
  const pricePerUnit = Number(document.getElementById('editPrice').value);
  const quantity = Number(document.getElementById('editQuantity').value) || 1;
  const paid = Number(document.getElementById('editPaid').value);
  const paymentType = document.getElementById('editPaymentType').value;
  
  if (!product || !pricePerUnit || paid === '') {
    showNotification('❌ Barcha maydonlarni to\'ldiring!', 'error');
    return;
  }
  
  if (quantity <= 0) {
    showNotification('❌ Miqdor 0 dan katta bo\'lishi kerak!', 'error');
    return;
  }
  
  const totalPrice = pricePerUnit * quantity;
  
  // Savdoni topish va yangilash
  const saleIndex = sales.findIndex(s => s.id === editingSaleId);
  if (saleIndex === -1) return;
  
  sales[saleIndex] = {
    ...sales[saleIndex],
    product,
    price: totalPrice,
    paid,
    quantity,
    paymentType
  };
  
  // API ga yuborish
  try {
    await fetch(`${API_URL}/sales/${editingSaleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product,
        price: totalPrice,
        paid,
        quantity,
        paymentType
      })
    });
  } catch (error) {
    console.error('Savdo yangilash xatosi:', error);
  }
  
  // Mijoz qarzini qayta hisoblash
  await loadCustomers();
  
  closeEditSaleModal();
  renderCustomerSales();
  renderTodaySales();
  renderCustomers();
  
  showNotification('✅ Savdo yangilandi!', 'success');
}

// ==================== DELETE CUSTOMER ====================

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
  // Bildirishnomalar
  document.getElementById('reminderDays').value = settings.reminderDays;
  document.getElementById('reminderTime').value = settings.reminderTime;
  document.getElementById('blockDays').value = settings.blockDays;
  document.getElementById('reminder3days').checked = settings.reminder3days;
  document.getElementById('reminder5days').checked = settings.reminder5days;
  document.getElementById('reminder7days').checked = settings.reminder7days;
  document.getElementById('soundEnabled').checked = settings.soundEnabled;
  document.getElementById('desktopNotifications').checked = settings.desktopNotifications;
  
  // Umumiy
  document.getElementById('shopName').value = settings.shopName || '';
  document.getElementById('shopPhone').value = settings.shopPhone || '';
  document.getElementById('shopAddress').value = settings.shopAddress || '';
  document.getElementById('currency').value = settings.currency || 'USD';
  document.getElementById('exchangeRate').value = settings.exchangeRate || 12500;
  document.getElementById('workStartTime').value = settings.workStartTime || '09:00';
  document.getElementById('workEndTime').value = settings.workEndTime || '20:00';
  
  // To'lov
  document.getElementById('enableCash').checked = settings.enableCash !== false;
  document.getElementById('enableCard').checked = settings.enableCard !== false;
  document.getElementById('enableTransfer').checked = settings.enableTransfer !== false;
  document.getElementById('maxDiscount').value = settings.maxDiscount || 50;
  document.getElementById('autoDiscount').checked = settings.autoDiscount || false;
  document.getElementById('autoPrintReceipt').checked = settings.autoPrintReceipt || false;
  document.getElementById('sendReceiptTelegram').checked = settings.sendReceiptTelegram !== false;
  
  // Xavfsizlik
  document.getElementById('sessionTimeout').value = settings.sessionTimeout || 60;
  document.getElementById('requirePasswordForDelete').checked = settings.requirePasswordForDelete !== false;
  document.getElementById('autoBackup').checked = settings.autoBackup !== false;
  document.getElementById('backupTime').value = settings.backupTime || '23:00';
  
  // Ko'rinish
  document.getElementById('fontSize').value = settings.fontSize || 'medium';
  document.getElementById('compactMode').checked = settings.compactMode || false;
  document.getElementById('showAnimations').checked = settings.showAnimations !== false;
  document.getElementById('language').value = settings.language || 'uz';
  
  // Birinchi tabni ko'rsatish
  switchSettingsTab('general');
  
  document.getElementById('settingsModal').classList.add('active');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('active');
}

// Sozlamalar tablarini almashtirish
function switchSettingsTab(tabName) {
  // Barcha tablarni yashirish
  document.querySelectorAll('.settings-content').forEach(content => {
    content.style.display = 'none';
  });
  
  // Barcha tab tugmalaridan active ni olib tashlash
  document.querySelectorAll('[id^="settingsTab-"]').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Tanlangan tabni ko'rsatish
  const contentElement = document.getElementById(`settingsContent-${tabName}`);
  const tabElement = document.getElementById(`settingsTab-${tabName}`);
  
  if (contentElement) contentElement.style.display = 'block';
  if (tabElement) tabElement.classList.add('active');
}

// Parolni o'zgartirish
async function changePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    showNotification('❌ Barcha maydonlarni to\'ldiring!', 'error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showNotification('❌ Yangi parollar mos kelmadi!', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    showNotification('❌ Parol kamida 6 ta belgidan iborat bo\'lishi kerak!', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotification('✅ Parol muvaffaqiyatli o\'zgartirildi!', 'success');
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
    } else {
      showNotification('❌ Hozirgi parol noto\'g\'ri!', 'error');
    }
  } catch (error) {
    console.error('Parol o\'zgartirish xatosi:', error);
    showNotification('⚠️ Parol o\'zgartirish funksiyasi hozircha ishlamaydi', 'warning');
  }
}

// Temani o'zgartirish
function changeTheme(theme) {
  settings.theme = theme;
  
  // Tema ranglarini o'zgartirish
  const root = document.documentElement;
  
  if (theme === 'blue') {
    root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  } else if (theme === 'green') {
    root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #10b981 0%, #059669 100%)');
    document.body.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  } else if (theme === 'red') {
    root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)');
    document.body.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  }
  
  // Tema tanlash tugmalarini yangilash
  document.querySelectorAll('[onclick^="changeTheme"]').forEach(btn => {
    btn.style.border = '3px solid transparent';
  });
  event.target.style.border = '3px solid currentColor';
  
  showNotification(`✅ ${theme === 'blue' ? 'Ko\'k' : theme === 'green' ? 'Yashil' : 'Qizil'} tema qo'llandi!`, 'success');
  
  // Sozlamalarni saqlash
  localStorage.setItem('settings', JSON.stringify(settings));
}

async function saveSettings() {
  settings = {
    // Bildirishnomalar
    reminderDays: Number(document.getElementById('reminderDays').value),
    reminderTime: document.getElementById('reminderTime').value,
    blockDays: Number(document.getElementById('blockDays').value),
    reminder3days: document.getElementById('reminder3days').checked,
    reminder5days: document.getElementById('reminder5days').checked,
    reminder7days: document.getElementById('reminder7days').checked,
    soundEnabled: document.getElementById('soundEnabled').checked,
    desktopNotifications: document.getElementById('desktopNotifications').checked,
    
    // Umumiy
    shopName: document.getElementById('shopName').value,
    shopPhone: document.getElementById('shopPhone').value,
    shopAddress: document.getElementById('shopAddress').value,
    currency: document.getElementById('currency').value,
    exchangeRate: Number(document.getElementById('exchangeRate').value),
    workStartTime: document.getElementById('workStartTime').value,
    workEndTime: document.getElementById('workEndTime').value,
    
    // To'lov
    enableCash: document.getElementById('enableCash').checked,
    enableCard: document.getElementById('enableCard').checked,
    enableTransfer: document.getElementById('enableTransfer').checked,
    maxDiscount: Number(document.getElementById('maxDiscount').value),
    autoDiscount: document.getElementById('autoDiscount').checked,
    autoPrintReceipt: document.getElementById('autoPrintReceipt').checked,
    sendReceiptTelegram: document.getElementById('sendReceiptTelegram').checked,
    
    // Xavfsizlik
    sessionTimeout: Number(document.getElementById('sessionTimeout').value),
    requirePasswordForDelete: document.getElementById('requirePasswordForDelete').checked,
    autoBackup: document.getElementById('autoBackup').checked,
    backupTime: document.getElementById('backupTime').value,
    
    // Ko'rinish
    theme: settings.theme,
    fontSize: document.getElementById('fontSize').value,
    compactMode: document.getElementById('compactMode').checked,
    showAnimations: document.getElementById('showAnimations').checked,
    language: document.getElementById('language').value
  };
  
  await saveSettingsAPI(settings);
  closeSettingsModal();
  renderCustomers();
  showNotification('✅ Sozlamalar saqlandi!', 'success');
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

// ==================== HISOBOTLAR VA ANALITIKA ====================

let currentReportType = 'daily';

function openReportsModal() {
  document.getElementById('reportsModal').classList.add('active');
  switchReportTab('daily');
}

function closeReportsModal() {
  document.getElementById('reportsModal').classList.remove('active');
}

function switchReportTab(type) {
  currentReportType = type;
  
  // Tab buttonlarni yangilash
  document.querySelectorAll('#reportsModal .filter-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(`reportTab-${type}`).classList.add('active');
  
  // Hisobotni ko'rsatish
  const content = document.getElementById('reportContent');
  
  switch(type) {
    case 'daily':
      content.innerHTML = generateDailyReport();
      break;
    case 'weekly':
      content.innerHTML = generateWeeklyReport();
      break;
    case 'monthly':
      content.innerHTML = generateMonthlyReport();
      break;
    case 'products':
      content.innerHTML = generateProductsReport();
      break;
    case 'customers':
      content.innerHTML = generateCustomersReport();
      break;
  }
}

function generateDailyReport() {
  const today = getTodayShort();
  const todaySales = sales.filter(s => s.date === today && s.type === 'sale');
  
  const totalRevenue = todaySales.reduce((sum, s) => sum + s.paid, 0);
  const totalSales = todaySales.reduce((sum, s) => sum + s.price, 0);
  const totalDebt = totalSales - totalRevenue;
  
  const cashPayments = todaySales.filter(s => s.paymentType === 'cash').reduce((sum, s) => sum + s.paid, 0);
  const cardPayments = todaySales.filter(s => s.paymentType === 'card').reduce((sum, s) => sum + s.paid, 0);
  const transferPayments = todaySales.filter(s => s.paymentType === 'transfer').reduce((sum, s) => sum + s.paid, 0);
  
  return `
    <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 24px; border-radius: 14px; margin-bottom: 20px;">
      <h3 style="font-size: 20px; margin-bottom: 16px;">📅 Bugungi hisobot - ${getToday()}</h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div>
          <p style="opacity: 0.9; font-size: 13px; margin-bottom: 4px;">Jami savdo</p>
          <p style="font-size: 28px; font-weight: 800;">${formatMoney(totalSales)}</p>
        </div>
        <div>
          <p style="opacity: 0.9; font-size: 13px; margin-bottom: 4px;">To'langan</p>
          <p style="font-size: 28px; font-weight: 800;">${formatMoney(totalRevenue)}</p>
        </div>
        <div>
          <p style="opacity: 0.9; font-size: 13px; margin-bottom: 4px;">Savdolar soni</p>
          <p style="font-size: 28px; font-weight: 800;">${todaySales.length}</p>
        </div>
        <div>
          <p style="opacity: 0.9; font-size: 13px; margin-bottom: 4px;">Qarz</p>
          <p style="font-size: 28px; font-weight: 800;">${formatMoney(totalDebt)}</p>
        </div>
      </div>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 14px; margin-bottom: 16px;">
      <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #667eea;">💳 To'lov turlari</h4>
      <div style="display: grid; gap: 12px;">
        <div style="display: flex; justify-content: space-between; padding: 12px; background: #f0f4ff; border-radius: 10px;">
          <span style="font-weight: 600;">💵 Naqd</span>
          <span style="font-weight: 700; color: #667eea;">${formatMoney(cashPayments)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px; background: #f0f4ff; border-radius: 10px;">
          <span style="font-weight: 600;">💳 Karta</span>
          <span style="font-weight: 700; color: #667eea;">${formatMoney(cardPayments)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px; background: #f0f4ff; border-radius: 10px;">
          <span style="font-weight: 600;">🏦 O'tkazma</span>
          <span style="font-weight: 700; color: #667eea;">${formatMoney(transferPayments)}</span>
        </div>
      </div>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 14px;">
      <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #667eea;">📋 Bugungi savdolar</h4>
      ${todaySales.length === 0 ? '<p style="text-align: center; color: #9ca3af; padding: 20px;">Bugun savdo yo\'q</p>' : 
        todaySales.map(sale => `
          <div style="padding: 12px; background: #f9fafb; border-radius: 10px; margin-bottom: 8px; border-left: 3px solid #667eea;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 700; color: #667eea;">${sale.customerName}</span>
              <span style="font-weight: 700; color: #667eea;">${formatMoney(sale.price)}</span>
            </div>
            <div style="font-size: 13px; color: #6b7280;">
              ${sale.product} • ${sale.time}
            </div>
          </div>
        `).join('')
      }
    </div>
  `;
}

function generateWeeklyReport() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weekSales = sales.filter(s => {
    const saleDate = new Date(s.fullDate || s.date);
    return saleDate >= weekAgo && saleDate <= today && s.type === 'sale';
  });
  
  const totalRevenue = weekSales.reduce((sum, s) => sum + s.paid, 0);
  const totalSales = weekSales.reduce((sum, s) => sum + s.price, 0);
  const avgDaily = totalRevenue / 7;
  
  return `
    <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 24px; border-radius: 14px; margin-bottom: 20px;">
      <h3 style="font-size: 20px; margin-bottom: 16px;">📆 Haftalik hisobot</h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div>
          <p style="opacity: 0.9; font-size: 13px; margin-bottom: 4px;">Jami savdo</p>
          <p style="font-size: 28px; font-weight: 800;">${formatMoney(totalSales)}</p>
        </div>
        <div>
          <p style="opacity: 0.9; font-size: 13px; margin-bottom: 4px;">To'langan</p>
          <p style="font-size: 28px; font-weight: 800;">${formatMoney(totalRevenue)}</p>
        </div>
        <div>
          <p style="opacity: 0.9; font-size: 13px; margin-bottom: 4px;">Savdolar soni</p>
          <p style="font-size: 28px; font-weight: 800;">${weekSales.length}</p>
        </div>
        <div>
          <p style="opacity: 0.9; font-size: 13px; margin-bottom: 4px;">O'rtacha kunlik</p>
          <p style="font-size: 28px; font-weight: 800;">${formatMoney(avgDaily)}</p>
        </div>
      </div>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 14px;">
      <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #d97706;">📊 Kunlik taqsimot</h4>
      <p style="text-align: center; color: #6b7280; padding: 40px;">Grafik tez orada qo'shiladi</p>
    </div>
  `;
}

function generateMonthlyReport() {
  const currentMonth = getCurrentMonth();
  const monthlySales = sales.filter(s => {
    const saleDate = new Date(s.fullDate || s.date);
    const saleMonth = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
    return saleMonth === currentMonth && s.type === 'sale';
  });
  
  const totalRevenue = monthlySales.reduce((sum, s) => sum + s.paid, 0);
  const totalSales = monthlySales.reduce((sum, s) => sum + s.price, 0);
  const totalDebt = totalSales - totalRevenue;
  
  return `
    <div style="background: linear-gradient(135deg, #a855f7, #7e22ce); color: white; padding: 24px; border-radius: 14px; margin-bottom: 20px;">
      <h3 style="font-size: 20px; margin-bottom: 16px;">📊 Oylik hisobot</h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div>
          <p style="opacity: 0.9; font-size: 13px; margin-bottom: 4px;">Jami savdo</p>
          <p style="font-size: 28px; font-weight: 800;">${formatMoney(totalSales)}</p>
        </div>
        <div>
          <p style="opacity: 0.9; font-size: 13px; margin-bottom: 4px;">To'langan</p>
          <p style="font-size: 28px; font-weight: 800;">${formatMoney(totalRevenue)}</p>
        </div>
        <div>
          <p style="opacity: 0.9; font-size: 13px; margin-bottom: 4px;">Savdolar soni</p>
          <p style="font-size: 28px; font-weight: 800;">${monthlySales.length}</p>
        </div>
        <div>
          <p style="opacity: 0.9; font-size: 13px; margin-bottom: 4px;">Qarz</p>
          <p style="font-size: 28px; font-weight: 800;">${formatMoney(totalDebt)}</p>
        </div>
      </div>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 14px;">
      <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #7e22ce;">📈 Oylik o'sish</h4>
      <p style="text-align: center; color: #6b7280; padding: 40px;">Taqqoslash grafigi tez orada</p>
    </div>
  `;
}

function generateProductsReport() {
  // Eng ko'p sotilgan mahsulotlar
  const productSales = {};
  sales.filter(s => s.type === 'sale').forEach(sale => {
    if (!productSales[sale.product]) {
      productSales[sale.product] = { count: 0, revenue: 0, quantity: 0 };
    }
    productSales[sale.product].count++;
    productSales[sale.product].revenue += sale.paid;
    productSales[sale.product].quantity += (sale.quantity || 1);
  });
  
  const sortedProducts = Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10);
  
  return `
    <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 24px; border-radius: 14px; margin-bottom: 20px;">
      <h3 style="font-size: 20px; margin-bottom: 8px;">📦 Mahsulotlar hisoboti</h3>
      <p style="opacity: 0.9; font-size: 14px;">Top 10 eng ko'p sotilgan mahsulotlar</p>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 14px;">
      ${sortedProducts.length === 0 ? '<p style="text-align: center; color: #9ca3af; padding: 20px;">Hali savdo yo\'q</p>' :
        sortedProducts.map(([ product, data], index) => `
          <div style="padding: 16px; background: ${index % 2 === 0 ? '#f9fafb' : 'white'}; border-radius: 10px; margin-bottom: 8px; border-left: 4px solid #3b82f6;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
              <div style="flex: 1;">
                <div style="font-weight: 700; color: #1e40af; font-size: 15px; margin-bottom: 4px;">
                  ${index + 1}. ${product}
                </div>
                <div style="font-size: 13px; color: #6b7280;">
                  Sotildi: ${data.quantity} dona • ${data.count} marta
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 800; color: #667eea; font-size: 18px;">
                  ${formatMoney(data.revenue)}
                </div>
              </div>
            </div>
          </div>
        `).join('')
      }
    </div>
  `;
}

function generateCustomersReport() {
  // Eng yaxshi mijozlar
  const customerStats = {};
  sales.filter(s => s.type === 'sale').forEach(sale => {
    if (!customerStats[sale.customerId]) {
      const customer = customers.find(c => c.id === sale.customerId);
      customerStats[sale.customerId] = {
        name: sale.customerName,
        totalPurchases: 0,
        totalSpent: 0,
        count: 0,
        debt: customer ? getCustomerDebt(customer.id) : 0
      };
    }
    customerStats[sale.customerId].totalPurchases += sale.price;
    customerStats[sale.customerId].totalSpent += sale.paid;
    customerStats[sale.customerId].count++;
  });
  
  const sortedCustomers = Object.values(customerStats)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);
  
  return `
    <div style="background: linear-gradient(135deg, #ec4899, #be123c); color: white; padding: 24px; border-radius: 14px; margin-bottom: 20px;">
      <h3 style="font-size: 20px; margin-bottom: 8px;">👥 Mijozlar hisoboti</h3>
      <p style="opacity: 0.9; font-size: 14px;">Top 10 eng yaxshi mijozlar</p>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 14px;">
      ${sortedCustomers.length === 0 ? '<p style="text-align: center; color: #9ca3af; padding: 20px;">Hali mijozlar yo\'q</p>' :
        sortedCustomers.map((customer, index) => `
          <div style="padding: 16px; background: ${index % 2 === 0 ? '#fef2f2' : 'white'}; border-radius: 10px; margin-bottom: 8px; border-left: 4px solid #ec4899;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
              <div style="flex: 1;">
                <div style="font-weight: 700; color: #be123c; font-size: 15px; margin-bottom: 4px;">
                  ${index + 1}. ${customer.name}
                </div>
                <div style="font-size: 13px; color: #6b7280;">
                  Xaridlar: ${customer.count} marta • Qarz: ${formatMoney(customer.debt)}
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 800; color: #667eea; font-size: 18px;">
                  ${formatMoney(customer.totalSpent)}
                </div>
                <div style="font-size: 12px; color: #9ca3af;">
                  Jami: ${formatMoney(customer.totalPurchases)}
                </div>
              </div>
            </div>
          </div>
        `).join('')
      }
    </div>
  `;
}

function exportCurrentReport() {
  showNotification('📥 PDF export tez orada qo\'shiladi', 'success');
}

// ==================== INIT ====================

async function init() {
  await loadSettings();
  await loadProducts(); // Mahsulotlarni yuklash
  await loadCustomers();
  await loadSales();
  
  // Kirim tarixini yuklash
  const savedHandovers = localStorage.getItem('handoverHistory');
  if (savedHandovers) {
    handoverHistory = JSON.parse(savedHandovers);
  }
  
  // Temani yuklash
  if (settings.theme) {
    const root = document.documentElement;
    if (settings.theme === 'blue') {
      root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
      document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    } else if (settings.theme === 'green') {
      root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #10b981 0%, #059669 100%)');
      document.body.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    } else if (settings.theme === 'red') {
      root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)');
      document.body.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    }
  }
  
  document.getElementById('todayDate').textContent = getToday();
  renderCustomers();
  renderTodaySales();
  updateStatistics();
  
  console.log('✅ Tizim tayyor!');
  console.log('💰 Kassir balans:', cashierBalance);
}

// CSS animatsiyalar
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

init();


// ==================== LOADING STATE ====================
function showLoading(button) {
  if (!button) return;
  button.disabled = true;
  button.dataset.originalText = button.innerHTML;
  button.innerHTML = '<span class="loading-spinner"></span> Yuklanmoqda...';
}

function hideLoading(button) {
  if (!button) return;
  button.disabled = false;
  if (button.dataset.originalText) {
    button.innerHTML = button.dataset.originalText;
  }
}

// ==================== RIPPLE EFFECT ====================
function addRippleEffect(element) {
  element.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = this.getBoundingClientRect();
    ripple.style.left = e.clientX - rect.left + 'px';
    ripple.style.top = e.clientY - rect.top + 'px';
    ripple.style.width = ripple.style.height = '10px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

// Add ripple to all buttons
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('button:not(.no-ripple)').forEach(btn => {
    addRippleEffect(btn);
  });
});

// ==================== SMOOTH SCROLL ====================
function smoothScrollTo(element) {
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ==================== COPY TO CLIPBOARD ====================
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Nusxalandi!', 'success');
  } catch (err) {
    showNotification('Nusxalash xatosi', 'error');
  }
}

// ==================== CONFIRM DIALOG ====================
function confirmDialog(message, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content scale-in" style="max-width: 400px;">
      <div class="modal-header">
        <h2>⚠️ Tasdiqlash</h2>
      </div>
      <p style="font-size: 15px; color: #6b7280; margin-bottom: 24px;">${message}</p>
      <div class="modal-buttons">
        <button class="cancel-btn" onclick="this.closest('.modal').remove()">Yo'q</button>
        <button class="confirm-btn" onclick="this.closest('.modal').remove(); (${onConfirm})()">Ha, ishonchim komil</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// ==================== FORMAT PHONE NUMBER ====================
function formatPhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('998')) {
    return `+998 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
  }
  return phone;
}

// ==================== DEBOUNCE ====================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==================== ANIMATE ON SCROLL ====================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in-up');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all cards
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card, .stat-card, .customer-card').forEach(el => {
    observer.observe(el);
  });
});

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K - Search focus
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.focus();
  }
  
  // Escape - Close modals
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }
  
  // Ctrl/Cmd + N - New customer
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    openAddModal();
  }
});

// ==================== AUTO SAVE INDICATOR ====================
let autoSaveTimeout;
function showAutoSaveIndicator() {
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
    z-index: 9999;
    font-weight: 600;
    font-size: 13px;
    animation: slideInRight 0.3s ease;
  `;
  indicator.innerHTML = '✓ Avtomatik saqlandi';
  document.body.appendChild(indicator);
  
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    indicator.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => indicator.remove(), 300);
  }, 2000);
}

// ==================== PRINT FUNCTION ====================
function printElement(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>Chop etish</title>');
  printWindow.document.write('<style>body{font-family: Arial, sans-serif; padding: 20px;}</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(element.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}

// ==================== EXPORT TO CSV ====================
function exportToCSV(data, filename) {
  const csv = data.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
  showNotification('CSV fayl yuklandi!', 'success');
}

console.log('🎨 Professional dizayn yuklandi!');
