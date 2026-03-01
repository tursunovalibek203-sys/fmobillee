// Admin Cashiers Management Script
const API_URL = window.location.origin + '/api';

let cashiers = [];
let handovers = [];
let editingCashierId = null;

// ==================== INIT ====================

async function init() {
  // Login tekshiruvi
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = '/login.html';
    return;
  }
  
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('uz-UZ', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  await loadBranches();
  await loadCashiers();
  await loadHandovers();
  await loadStats();
  await renderTodaySalesByCashier();
  await loadTodaySalesByBranch();
}

// ==================== LOAD DATA ====================

async function loadCashiers() {
  try {
    const response = await fetch(`${API_URL}/cashiers`);
    const data = await response.json();
    
    if (data.success) {
      cashiers = data.cashiers;
      renderCashiers();
    }
  } catch (error) {
    console.error('Kassirlar yuklash xatosi:', error);
  }
}

async function loadBranches() {
  try {
    const response = await fetch(`${API_URL}/branches`);
    const data = await response.json();
    
    if (data.success) {
      const branchSelect = document.getElementById('cashierBranch');
      branchSelect.innerHTML = '<option value="">Filial tanlang</option>';
      
      data.branches.forEach(branch => {
        const option = document.createElement('option');
        option.value = branch.branchId;
        option.textContent = branch.name;
        branchSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Filiallar yuklash xatosi:', error);
  }
}

async function loadHandovers() {
  try {
    const response = await fetch(`${API_URL}/all-handovers`);
    const data = await response.json();
    
    if (data.success) {
      handovers = data.handovers.slice(0, 10); // So'nggi 10 ta
      renderHandovers();
    }
  } catch (error) {
    console.error('Kirimlar yuklash xatosi:', error);
  }
}

async function loadStats() {
  try {
    const totalBalance = cashiers.reduce((sum, c) => sum + (c.balance || 0), 0);
    const totalBalanceUZS = cashiers.reduce((sum, c) => sum + (c.balanceUZS || 0), 0);
    const totalHandoversAmount = cashiers.reduce((sum, c) => sum + (c.totalHandedOver || 0), 0);
    
    // Bugungi savdolar
    const allSalesResponse = await fetch(`${API_URL}/all-cashier-sales`);
    const allSalesData = await allSalesResponse.json();
    
    if (allSalesData.success) {
      const today = new Date().toLocaleDateString('uz-UZ');
      const todaySales = allSalesData.sales.filter(s => s.date === today);
      
      // Bugungi jami to'lovlar
      const todayTotalUSD = todaySales.reduce((sum, s) => sum + (s.totalPaidUSD || 0), 0);
      const todayTotalUZS = todaySales.reduce((sum, s) => sum + (s.paidUZS || 0), 0);
      
      document.getElementById('todaySales').textContent = 
        `${formatMoney(todayTotalUSD, 'USD')} + ${formatMoney(todayTotalUZS, 'UZS')}`;
    }
    
    document.getElementById('totalCashiers').textContent = cashiers.length;
    document.getElementById('totalBalance').textContent = 
      `${formatMoney(totalBalance, 'USD')} + ${formatMoney(totalBalanceUZS, 'UZS')}`;
    document.getElementById('totalHandovers').textContent = formatMoney(totalHandoversAmount, 'USD');
    
  } catch (error) {
    console.error('Statistika yuklash xatosi:', error);
  }
}

// ==================== RENDER ====================

function renderCashiers() {
  const grid = document.getElementById('cashiersGrid');
  
  if (cashiers.length === 0) {
    grid.innerHTML = '<p class="empty">Kassirlar yo\'q</p>';
    return;
  }
  
  grid.innerHTML = cashiers.map(cashier => {
    const statusClass = cashier.isActive ? 'stock-ok' : 'stock-low';
    const statusText = cashier.isActive ? '✅ Faol' : '🚫 Faolsiz';
    
    return `
      <div class="cashier-card">
        <div class="cashier-name">👤 ${cashier.name}</div>
        <div class="cashier-info">🔑 Login: ${cashier.username}</div>
        <div class="cashier-info">📱 ${cashier.phone || 'Telefon yo\'q'}</div>
        <div class="cashier-info ${statusClass}">${statusText}</div>
        <div class="cashier-balance">
          ${formatMoney(cashier.balance, 'USD')}
          ${cashier.balanceUZS > 0 ? `<br><small style="font-size: 12px; opacity: 0.8;">${formatMoney(cashier.balanceUZS, 'UZS')}</small>` : ''}
        </div>
        <div class="cashier-info">
          📊 Jami savdo: ${formatMoney(cashier.totalSales, 'USD')}
        </div>
        <div class="cashier-info">
          ✅ Berilgan: ${formatMoney(cashier.totalHandedOver, 'USD')}
        </div>
        <div class="cashier-actions">
          <button class="view-btn" onclick="viewCashierDetail(${cashier.cashierId})">
            👁️ Ko'rish
          </button>
          <button class="edit-btn" onclick="editCashier(${cashier.cashierId})">
            ✏️ Tahrirlash
          </button>
          <button class="delete-btn" onclick="deleteCashier(${cashier.cashierId})">
            🗑️ O'chirish
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderHandovers() {
  const list = document.getElementById('handoversList');
  
  if (handovers.length === 0) {
    list.innerHTML = '<p class="empty">Kirimlar yo\'q</p>';
    return;
  }
  
  list.innerHTML = `
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 12px; text-align: left;">Sana</th>
            <th style="padding: 12px; text-align: left;">Kassir</th>
            <th style="padding: 12px; text-align: right;">Miqdor</th>
            <th style="padding: 12px; text-align: left;">Izoh</th>
          </tr>
        </thead>
        <tbody>
          ${handovers.map(h => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 12px;">${h.date} ${h.time}</td>
              <td style="padding: 12px;">${h.cashierName}</td>
              <td style="padding: 12px; text-align: right; font-weight: 700; color: #059669;">
                ${formatMoney(h.amount)}
              </td>
              <td style="padding: 12px; color: #6b7280;">${h.notes || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Bugungi savdolarni kassirlar bo'yicha ko'rsatish
async function renderTodaySalesByCashier() {
  try {
    const response = await fetch(`${API_URL}/all-cashier-sales`);
    const data = await response.json();
    
    if (!data.success) {
      document.getElementById('todaySalesByCashier').innerHTML = '<p class="empty">Ma\'lumot yo\'q</p>';
      return;
    }
    
    const today = new Date().toLocaleDateString('uz-UZ');
    const todaySales = data.sales.filter(s => s.date === today);
    
    // Kassirlar bo'yicha guruhlash
    const salesByCashier = {};
    todaySales.forEach(sale => {
      if (!salesByCashier[sale.cashierId]) {
        salesByCashier[sale.cashierId] = {
          cashierName: sale.cashierName,
          sales: [],
          totalAmount: 0,
          totalPaid: 0
        };
      }
      salesByCashier[sale.cashierId].sales.push(sale);
      salesByCashier[sale.cashierId].totalAmount += sale.price;
      salesByCashier[sale.cashierId].totalPaid += sale.paid;
    });
    
    const container = document.getElementById('todaySalesByCashier');
    
    if (Object.keys(salesByCashier).length === 0) {
      container.innerHTML = '<p class="empty">Bugun savdo yo\'q</p>';
      return;
    }
    
    container.innerHTML = Object.entries(salesByCashier).map(([cashierId, data]) => `
      <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 16px; border-left: 4px solid #3b82f6;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 18px;">
              👤 ${data.cashierName}
            </h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              ${data.sales.length} ta savdo
            </p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0 0 4px 0; font-size: 24px; font-weight: 800; color: #059669;">
              ${formatMoney(data.totalPaid)}
            </p>
            <p style="margin: 0; font-size: 13px; color: #6b7280;">
              Jami: ${formatMoney(data.totalAmount)}
            </p>
          </div>
        </div>
        
        <div style="max-height: 300px; overflow-y: auto;">
          ${data.sales.map(sale => `
            <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 1;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827; font-size: 14px;">
                  ${sale.customerName}
                </p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">
                  📦 ${sale.product}
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  🕐 ${sale.time}
                </p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0 0 4px 0; font-weight: 700; color: #059669; font-size: 16px;">
                  ${formatMoney(sale.price, 'USD')}
                </p>
                <p style="margin: 0; font-size: 13px; color: #6b7280;">
                  💵 ${formatMoney(sale.paidUSD || 0, 'USD')}
                </p>
                ${sale.paidUZS > 0 ? `
                  <p style="margin: 0; font-size: 13px; color: #6b7280;">
                    💰 ${formatMoney(sale.paidUZS, 'UZS')}
                  </p>
                ` : ''}
                ${sale.uzsToUSD > 0 ? `
                  <p style="margin: 0; font-size: 12px; color: #8b5cf6;">
                    🔄 ${formatMoney(sale.uzsToUSD, 'USD')}
                  </p>
                ` : ''}
                ${sale.price > (sale.totalPaidUSD || 0) ? `
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #dc2626;">
                    Qarz: ${formatMoney(sale.price - (sale.totalPaidUSD || 0), 'USD')}
                  </p>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Bugungi savdolar yuklash xatosi:', error);
    document.getElementById('todaySalesByCashier').innerHTML = '<p class="empty">Xatolik yuz berdi</p>';
  }
}

// Bugungi savdolarni filiallar bo'yicha ko'rsatish
async function loadTodaySalesByBranch() {
  try {
    const branchesResponse = await fetch(`${API_URL}/branches`);
    const branchesData = await branchesResponse.json();
    
    if (!branchesData.success) {
      document.getElementById('todaySalesByBranch').innerHTML = '<p class="empty">Ma\'lumot yo\'q</p>';
      return;
    }
    
    const salesResponse = await fetch(`${API_URL}/all-cashier-sales`);
    const salesData = await salesResponse.json();
    
    if (!salesData.success) {
      document.getElementById('todaySalesByBranch').innerHTML = '<p class="empty">Ma\'lumot yo\'q</p>';
      return;
    }
    
    const today = new Date().toLocaleDateString('uz-UZ');
    const todaySales = salesData.sales.filter(s => s.date === today);
    
    // Filiallar bo'yicha guruhlash
    const salesByBranch = {};
    branchesData.branches.forEach(branch => {
      salesByBranch[branch.branchId] = {
        branchName: branch.name,
        sales: [],
        totalAmount: 0,
        totalPaid: 0
      };
    });
    
    todaySales.forEach(sale => {
      if (salesByBranch[sale.branchId]) {
        salesByBranch[sale.branchId].sales.push(sale);
        salesByBranch[sale.branchId].totalAmount += sale.price;
        salesByBranch[sale.branchId].totalPaid += sale.paid;
      }
    });
    
    const container = document.getElementById('todaySalesByBranch');
    
    const activeBranches = Object.entries(salesByBranch).filter(([_, data]) => data.sales.length > 0);
    
    if (activeBranches.length === 0) {
      container.innerHTML = '<p class="empty">Bugun savdo yo\'q</p>';
      return;
    }
    
    container.innerHTML = activeBranches.map(([branchId, data]) => `
      <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin-bottom: 16px; border-left: 4px solid #059669;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 18px;">
              🏢 ${data.branchName}
            </h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              ${data.sales.length} ta savdo
            </p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0 0 4px 0; font-size: 24px; font-weight: 800; color: #059669;">
              ${formatMoney(data.totalPaid)}
            </p>
            <p style="margin: 0; font-size: 13px; color: #6b7280;">
              Jami: ${formatMoney(data.totalAmount)}
            </p>
          </div>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Filial savdolari xatosi:', error);
    document.getElementById('todaySalesByBranch').innerHTML = '<p class="empty">Xatolik yuz berdi</p>';
  }
}

// ==================== ADD/EDIT CASHIER ====================

function openAddCashierModal() {
  editingCashierId = null;
  document.getElementById('modalTitle').textContent = '➕ Yangi kassir';
  
  document.getElementById('cashierName').value = '';
  document.getElementById('cashierUsername').value = '';
  document.getElementById('cashierPassword').value = '';
  document.getElementById('cashierPhone').value = '';
  
  document.getElementById('cashierModal').classList.add('active');
  document.getElementById('cashierName').focus();
}

function editCashier(cashierId) {
  const cashier = cashiers.find(c => c.cashierId === cashierId);
  if (!cashier) return;
  
  editingCashierId = cashierId;
  document.getElementById('modalTitle').textContent = '✏️ Kassirni tahrirlash';
  
  document.getElementById('cashierName').value = cashier.name;
  document.getElementById('cashierUsername').value = cashier.username;
  document.getElementById('cashierPassword').value = '';
  document.getElementById('cashierPhone').value = cashier.phone || '';
  
  document.getElementById('cashierModal').classList.add('active');
  document.getElementById('cashierName').focus();
}

function closeCashierModal() {
  document.getElementById('cashierModal').classList.remove('active');
  editingCashierId = null;
}

async function saveCashier() {
  const branchId = document.getElementById('cashierBranch').value;
  const name = document.getElementById('cashierName').value.trim();
  const username = document.getElementById('cashierUsername').value.trim();
  const password = document.getElementById('cashierPassword').value;
  const phone = document.getElementById('cashierPhone').value.trim();
  
  if (!branchId) {
    alert('⚠️ Filialni tanlang!');
    return;
  }
  
  if (!name || !username) {
    alert('⚠️ Ism va loginni kiriting!');
    return;
  }
  
  if (!editingCashierId && !password) {
    alert('⚠️ Parolni kiriting!');
    return;
  }
  
  try {
    if (editingCashierId) {
      // Tahrirlash
      const response = await fetch(`${API_URL}/cashiers/${editingCashierId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId: Number(branchId), name, username, password: password || undefined, phone })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Tahrirlashda xatolik');
      }
      
      alert('✅ Kassir ma\'lumotlari yangilandi!');
    } else {
      // Yangi qo'shish
      const response = await fetch(`${API_URL}/cashiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId: Number(branchId), name, username, password, phone })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Qo\'shishda xatolik');
      }
      
      alert('✅ Yangi kassir qo\'shildi!');
    }
    
    closeCashierModal();
    await loadCashiers();
    await loadStats();
    await loadTodaySalesByBranch();
    
  } catch (error) {
    console.error('Kassir saqlash xatosi:', error);
    alert('❌ Xatolik: ' + error.message);
  }
}

async function deleteCashier(cashierId) {
  const cashier = cashiers.find(c => c.cashierId === cashierId);
  if (!cashier) return;
  
  if (!confirm(`${cashier.name} ni o'chirmoqchimisiz?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/cashiers/${cashierId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'O\'chirishda xatolik');
    }
    
    alert('✅ Kassir o\'chirildi!');
    await loadCashiers();
    await loadStats();
    
  } catch (error) {
    console.error('Kassir o\'chirish xatosi:', error);
    alert('❌ Xatolik: ' + error.message);
  }
}

// ==================== VIEW DETAIL ====================

async function viewCashierDetail(cashierId) {
  try {
    const cashier = cashiers.find(c => c.cashierId === cashierId);
    if (!cashier) return;
    
    // Kassir savdolarini olish
    const salesResponse = await fetch(`${API_URL}/cashier-sales/${cashierId}`);
    const salesData = await salesResponse.json();
    
    // Kassir kirimlarini olish
    const handoversResponse = await fetch(`${API_URL}/cashier-handovers/${cashierId}`);
    const handoversData = await handoversResponse.json();
    
    const sales = salesData.success ? salesData.sales : [];
    const cashierHandovers = handoversData.success ? handoversData.handovers : [];
    
    document.getElementById('detailCashierName').textContent = `👤 ${cashier.name}`;
    
    document.getElementById('cashierDetailContent').innerHTML = `
      <div style="display: grid; gap: 20px;">
        <!-- Asosiy ma'lumotlar -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 12px;">
          <h3 style="margin: 0 0 16px 0;">📋 Asosiy ma'lumotlar</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">ID</p>
              <p style="font-weight: 600; margin: 0;">#${cashier.cashierId}</p>
            </div>
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">Login</p>
              <p style="font-weight: 600; margin: 0;">${cashier.username}</p>
            </div>
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">Telefon</p>
              <p style="font-weight: 600; margin: 0;">${cashier.phone || 'Yo\'q'}</p>
            </div>
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">Holat</p>
              <p style="font-weight: 600; margin: 0;">${cashier.isActive ? '✅ Faol' : '🚫 Faolsiz'}</p>
            </div>
          </div>
        </div>
        
        <!-- Moliyaviy ma'lumotlar -->
        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px;">
          <h3 style="margin: 0 0 16px 0;">💰 Moliyaviy ma'lumotlar</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">Kassadagi pul</p>
              <p style="font-weight: 700; font-size: 20px; margin: 0; color: #059669;">
                ${formatMoney(cashier.balance)}
              </p>
            </div>
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">Jami savdo</p>
              <p style="font-weight: 700; font-size: 20px; margin: 0; color: #3b82f6;">
                ${formatMoney(cashier.totalSales)}
              </p>
            </div>
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">Berilgan kirim</p>
              <p style="font-weight: 700; font-size: 20px; margin: 0; color: #8b5cf6;">
                ${formatMoney(cashier.totalHandedOver)}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Savdolar -->
        <div style="background: #eff6ff; padding: 20px; border-radius: 12px;">
          <h3 style="margin: 0 0 16px 0;">📊 Savdolar (${sales.length} ta)</h3>
          ${sales.length > 0 ? `
            <div style="max-height: 300px; overflow-y: auto;">
              ${sales.slice(0, 10).map(s => `
                <div style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px;">
                  <div style="display: flex; justify-content: space-between;">
                    <div>
                      <p style="font-weight: 600; margin: 0 0 4px 0;">${s.customerName}</p>
                      <p style="font-size: 13px; color: #6b7280; margin: 0;">${s.product}</p>
                      <p style="font-size: 12px; color: #9ca3af; margin: 4px 0 0 0;">${s.date} ${s.time}</p>
                    </div>
                    <div style="text-align: right;">
                      <p style="font-weight: 700; color: #059669; margin: 0;">${formatMoney(s.price)}</p>
                      <p style="font-size: 13px; color: #6b7280; margin: 4px 0 0 0;">To'langan: ${formatMoney(s.paid)}</p>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p style="color: #6b7280; margin: 0;">Savdolar yo\'q</p>'}
        </div>
        
        <!-- Kirimlar -->
        <div style="background: #fef3c7; padding: 20px; border-radius: 12px;">
          <h3 style="margin: 0 0 16px 0;">💵 Kirimlar (${cashierHandovers.length} ta)</h3>
          ${cashierHandovers.length > 0 ? `
            <div style="max-height: 300px; overflow-y: auto;">
              ${cashierHandovers.slice(0, 10).map(h => `
                <div style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px;">
                  <div style="display: flex; justify-content: space-between;">
                    <div>
                      <p style="font-weight: 600; margin: 0 0 4px 0;">${h.date} ${h.time}</p>
                      <p style="font-size: 13px; color: #6b7280; margin: 0;">${h.notes || 'Izoh yo\'q'}</p>
                    </div>
                    <div style="text-align: right;">
                      <p style="font-weight: 700; font-size: 18px; color: #059669; margin: 0;">
                        ${formatMoney(h.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p style="color: #6b7280; margin: 0;">Kirimlar yo\'q</p>'}
        </div>
      </div>
    `;
    
    document.getElementById('cashierDetailModal').classList.add('active');
    
  } catch (error) {
    console.error('Kassir tafsilotlari xatosi:', error);
    alert('❌ Ma\'lumotlarni yuklashda xatolik!');
  }
}

function closeCashierDetailModal() {
  document.getElementById('cashierDetailModal').classList.remove('active');
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

function goBack() {
  window.location.href = '/admin.html';
}

// ==================== KPI FUNCTIONS ====================

function showKPIView() {
  document.getElementById('gridView').style.display = 'none';
  document.getElementById('kpiView').style.display = 'block';
  renderKPI();
}

function showGridView() {
  document.getElementById('kpiView').style.display = 'none';
  document.getElementById('gridView').style.display = 'block';
}

async function renderKPI() {
  try {
    // Barcha kassirlar savdolarini olish
    const salesResponse = await fetch(`${API_URL}/all-cashier-sales`);
    const salesData = await salesResponse.json();
    
    if (!salesData.success) {
      document.getElementById('kpiContent').innerHTML = '<p class="empty">Ma\'lumot yo\'q</p>';
      return;
    }
    
    const allSales = salesData.sales;
    const today = new Date().toLocaleDateString('uz-UZ');
    const todaySales = allSales.filter(s => s.date === today);
    
    // Har bir kassir uchun KPI hisoblash
    const kpiData = cashiers.map(cashier => {
      const cashierSales = allSales.filter(s => s.cashierId === cashier.cashierId);
      const cashierTodaySales = todaySales.filter(s => s.cashierId === cashier.cashierId);
      
      // Asosiy metriklar
      const totalSales = cashierSales.length;
      const todaySalesCount = cashierTodaySales.length;
      const totalRevenue = cashierSales.reduce((sum, s) => sum + (Number(s.paid) || 0), 0);
      const todayRevenue = cashierTodaySales.reduce((sum, s) => sum + (Number(s.paid) || 0), 0);
      
      // O'rtacha chek
      const avgCheck = totalSales > 0 ? totalRevenue / totalSales : 0;
      const todayAvgCheck = todaySalesCount > 0 ? todayRevenue / todaySalesCount : 0;
      
      // Mijozlar soni (unique)
      const uniqueCustomers = new Set(cashierSales.map(s => s.customerId)).size;
      
      // Samaradorlik % (bugungi savdolar / o'rtacha kunlik)
      const daysWorked = cashier.createdAt ? 
        Math.max(1, Math.floor((Date.now() - new Date(cashier.createdAt).getTime()) / (1000 * 60 * 60 * 24))) : 1;
      const avgDailySales = totalSales / daysWorked;
      const efficiency = avgDailySales > 0 ? (todaySalesCount / avgDailySales) * 100 : 0;
      
      // Reyting (umumiy daromad bo'yicha)
      return {
        cashier,
        totalSales,
        todaySalesCount,
        totalRevenue,
        todayRevenue,
        avgCheck,
        todayAvgCheck,
        uniqueCustomers,
        efficiency: Math.min(efficiency, 200), // Max 200%
        daysWorked
      };
    });
    
    // Reytingga qarab saralash
    kpiData.sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    // Reyting raqamlarini qo'shish
    kpiData.forEach((data, index) => {
      data.rank = index + 1;
    });
    
    // KPI ni render qilish
    const container = document.getElementById('kpiContent');
    
    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 16px 0; color: #111827;">📊 Kassirlar Samaradorligi (KPI)</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Kassirlar reytingi umumiy daromad bo'yicha
        </p>
      </div>
      
      <div style="display: grid; gap: 16px;">
        ${kpiData.map(data => {
          const rankColor = data.rank === 1 ? '#f59e0b' : data.rank === 2 ? '#9ca3af' : data.rank === 3 ? '#cd7f32' : '#6b7280';
          const rankIcon = data.rank === 1 ? '🥇' : data.rank === 2 ? '🥈' : data.rank === 3 ? '🥉' : `#${data.rank}`;
          const efficiencyColor = data.efficiency >= 100 ? '#059669' : data.efficiency >= 70 ? '#f59e0b' : '#dc2626';
          
          return `
            <div style="background: white; border-radius: 12px; padding: 20px; border-left: 4px solid ${rankColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 20px; align-items: center;">
                <!-- Reyting -->
                <div style="text-align: center;">
                  <div style="font-size: 32px; font-weight: 900; color: ${rankColor};">
                    ${rankIcon}
                  </div>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Reyting</p>
                </div>
                
                <!-- Kassir ma'lumotlari -->
                <div>
                  <h4 style="margin: 0 0 8px 0; font-size: 18px; color: #111827;">
                    👤 ${data.cashier.name}
                  </h4>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 12px;">
                    <div>
                      <p style="margin: 0; font-size: 12px; color: #6b7280;">Jami savdolar</p>
                      <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 700; color: #111827;">
                        ${data.totalSales} ta
                      </p>
                    </div>
                    <div>
                      <p style="margin: 0; font-size: 12px; color: #6b7280;">Bugungi savdolar</p>
                      <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 700; color: #3b82f6;">
                        ${data.todaySalesCount} ta
                      </p>
                    </div>
                    <div>
                      <p style="margin: 0; font-size: 12px; color: #6b7280;">O'rtacha chek</p>
                      <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 700; color: #059669;">
                        ${formatMoney(data.avgCheck)}
                      </p>
                    </div>
                    <div>
                      <p style="margin: 0; font-size: 12px; color: #6b7280;">Mijozlar</p>
                      <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 700; color: #8b5cf6;">
                        ${data.uniqueCustomers} ta
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- Samaradorlik -->
                <div style="text-align: center; min-width: 120px;">
                  <div style="position: relative; width: 100px; height: 100px; margin: 0 auto;">
                    <svg width="100" height="100" style="transform: rotate(-90deg);">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="8"/>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="${efficiencyColor}" stroke-width="8"
                              stroke-dasharray="${(data.efficiency / 100) * 251.2} 251.2"
                              stroke-linecap="round"/>
                    </svg>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                      <p style="margin: 0; font-size: 20px; font-weight: 900; color: ${efficiencyColor};">
                        ${Math.round(data.efficiency)}%
                      </p>
                    </div>
                  </div>
                  <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280;">Samaradorlik</p>
                </div>
              </div>
              
              <!-- Qo'shimcha metriklar -->
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                <div style="text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">Jami daromad</p>
                  <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #059669;">
                    ${formatMoney(data.totalRevenue)}
                  </p>
                </div>
                <div style="text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">Bugungi daromad</p>
                  <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #3b82f6;">
                    ${formatMoney(data.todayRevenue)}
                  </p>
                </div>
                <div style="text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">Ish kunlari</p>
                  <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #8b5cf6;">
                    ${data.daysWorked} kun
                  </p>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <!-- KPI Tushuntirish -->
      <div style="margin-top: 24px; padding: 16px; background: #f0f9ff; border-radius: 12px; border-left: 4px solid #3b82f6;">
        <h4 style="margin: 0 0 12px 0; color: #1e40af;">📖 KPI Tushuntirish</h4>
        <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
          <li><strong>Reyting:</strong> Jami daromad bo'yicha</li>
          <li><strong>Samaradorlik:</strong> Bugungi savdolar / O'rtacha kunlik savdolar × 100%</li>
          <li><strong>O'rtacha chek:</strong> Jami daromad / Savdolar soni</li>
          <li><strong>Mijozlar:</strong> Noyob mijozlar soni</li>
        </ul>
      </div>
    `;
    
  } catch (error) {
    console.error('KPI yuklash xatosi:', error);
    document.getElementById('kpiContent').innerHTML = '<p class="empty">Xatolik yuz berdi</p>';
  }
}

// ==================== START ====================

init();
