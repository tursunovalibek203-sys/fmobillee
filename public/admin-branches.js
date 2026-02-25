// Admin Branches Management Script
const API_URL = window.location.origin + '/api';

let allBranches = [];
let editingBranchId = null;

// ==================== INIT ====================

async function init() {
  // Admin tekshiruvi
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
  await loadStats();
}

// ==================== LOAD DATA ====================

async function loadBranches() {
  try {
    console.log('🏢 Filiallar yuklanmoqda...');
    
    const response = await fetch(`${API_URL}/branches`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Filiallar yuklashda xatolik');
    }
    
    allBranches = data.branches || [];
    console.log(`✅ ${allBranches.length} ta filial yuklandi`);
    
    displayBranches(allBranches);
    
  } catch (error) {
    console.error('❌ Filiallar yuklash xatosi:', error);
    document.getElementById('branchesGrid').innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: white; border-radius: 16px;">
        <p style="font-size: 48px; margin-bottom: 16px;">❌</p>
        <h3 style="color: #dc2626; margin-bottom: 8px;">Xatolik yuz berdi</h3>
        <p style="color: #6b7280;">${error.message}</p>
        <button onclick="loadBranches()" style="margin-top: 20px; padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">
          🔄 Qayta yuklash
        </button>
      </div>
    `;
  }
}

async function loadStats() {
  try {
    let totalProducts = 0;
    let totalValue = 0;
    
    // Har bir filial uchun statistika olish
    for (const branch of allBranches) {
      const response = await fetch(`${API_URL}/branches/${branch.branchId}/stats`);
      const data = await response.json();
      
      if (data.success && data.stats) {
        const products = parseInt(data.stats.totalProducts) || 0;
        const value = parseFloat(data.stats.totalStockValue) || 0;
        
        totalProducts += products;
        totalValue += value;
        
        console.log(`Filial ${branch.branchId}: ${products} mahsulot, $${value.toFixed(2)}`);
      }
    }
    
    console.log(`Jami: ${totalProducts} mahsulot, $${totalValue.toFixed(2)}`);
    
    document.getElementById('totalBranches').textContent = allBranches.length;
    document.getElementById('activeBranches').textContent = allBranches.filter(b => b.isActive).length;
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalValue').textContent = formatMoney(totalValue);
    
  } catch (error) {
    console.error('❌ Statistika yuklash xatosi:', error);
    // Xatolik bo'lsa ham 0 ko'rsatish
    document.getElementById('totalBranches').textContent = allBranches.length;
    document.getElementById('activeBranches').textContent = allBranches.filter(b => b.isActive).length;
    document.getElementById('totalProducts').textContent = '0';
    document.getElementById('totalValue').textContent = '$0';
  }
}

// ==================== DISPLAY ====================

function displayBranches(branches) {
  const grid = document.getElementById('branchesGrid');
  
  if (!branches || branches.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: white; border-radius: 16px;">
        <p style="font-size: 48px; margin-bottom: 16px;">🏢</p>
        <h3 style="color: #6b7280;">Filiallar topilmadi</h3>
        <p style="color: #9ca3af; margin-top: 8px;">Yangi filial qo'shish uchun yuqoridagi tugmani bosing</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = branches.map(branch => `
    <div class="branch-card" onclick="viewBranchDetails(${branch.branchId})">
      <div class="branch-header">
        <div>
          <div class="branch-name">${branch.name}</div>
          <div class="branch-id">ID: ${branch.branchId}</div>
        </div>
        <div class="branch-actions" onclick="event.stopPropagation()">
          <button class="icon-btn edit" onclick="editBranch(${branch.branchId})" title="Tahrirlash">
            ✏️
          </button>
          <button class="icon-btn delete" onclick="deleteBranch(${branch.branchId})" title="O'chirish">
            🗑️
          </button>
        </div>
      </div>
      
      <div class="branch-info">
        ${branch.address ? `
          <div class="branch-info-item">
            <span>📍</span>
            <span>${branch.address}</span>
          </div>
        ` : ''}
        
        ${branch.phone ? `
          <div class="branch-info-item">
            <span>📱</span>
            <span>${branch.phone}</span>
          </div>
        ` : ''}
        
        ${branch.manager ? `
          <div class="branch-info-item">
            <span>👤</span>
            <span>${branch.manager}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="branch-stats">
        <div class="branch-stat">
          <div class="branch-stat-value" id="branch-${branch.branchId}-products">-</div>
          <div class="branch-stat-label">Mahsulotlar</div>
        </div>
        <div class="branch-stat">
          <div class="branch-stat-value" id="branch-${branch.branchId}-sales">-</div>
          <div class="branch-stat-label">Savdolar</div>
        </div>
        <div class="branch-stat">
          <div class="branch-stat-value" id="branch-${branch.branchId}-value">-</div>
          <div class="branch-stat-label">Qiymat</div>
        </div>
      </div>
    </div>
  `).join('');
  
  // Har bir filial uchun statistika yuklash
  branches.forEach(branch => loadBranchStats(branch.branchId));
}

async function loadBranchStats(branchId) {
  try {
    const response = await fetch(`${API_URL}/branches/${branchId}/stats`);
    const data = await response.json();
    
    if (data.success && data.stats) {
      const productsEl = document.getElementById(`branch-${branchId}-products`);
      const salesEl = document.getElementById(`branch-${branchId}-sales`);
      const valueEl = document.getElementById(`branch-${branchId}-value`);
      
      const products = parseInt(data.stats.totalProducts) || 0;
      const sales = parseInt(data.stats.branch?.totalSales) || 0;
      const value = parseFloat(data.stats.totalStockValue) || 0;
      
      if (productsEl) productsEl.textContent = products;
      if (salesEl) salesEl.textContent = sales;
      if (valueEl) valueEl.textContent = formatMoney(value, true);
    }
  } catch (error) {
    console.error(`❌ Filial ${branchId} statistika xatosi:`, error);
    // Xatolik bo'lsa 0 ko'rsatish
    const productsEl = document.getElementById(`branch-${branchId}-products`);
    const salesEl = document.getElementById(`branch-${branchId}-sales`);
    const valueEl = document.getElementById(`branch-${branchId}-value`);
    
    if (productsEl) productsEl.textContent = '0';
    if (salesEl) salesEl.textContent = '0';
    if (valueEl) valueEl.textContent = '$0';
  }
}

// ==================== MODAL ====================

function showAddBranchModal() {
  editingBranchId = null;
  document.getElementById('modalTitle').textContent = '➕ Yangi Filial';
  document.getElementById('branchName').value = '';
  document.getElementById('branchAddress').value = '';
  document.getElementById('branchPhone').value = '';
  document.getElementById('branchManager').value = '';
  document.getElementById('branchModal').style.display = 'flex';
}

function closeBranchModal() {
  document.getElementById('branchModal').style.display = 'none';
  editingBranchId = null;
}

function editBranch(branchId) {
  const branch = allBranches.find(b => b.branchId === branchId);
  if (!branch) return;
  
  editingBranchId = branchId;
  document.getElementById('modalTitle').textContent = '✏️ Filialni Tahrirlash';
  document.getElementById('branchName').value = branch.name;
  document.getElementById('branchAddress').value = branch.address || '';
  document.getElementById('branchPhone').value = branch.phone || '';
  document.getElementById('branchManager').value = branch.manager || '';
  document.getElementById('branchModal').style.display = 'flex';
}

async function saveBranch() {
  const name = document.getElementById('branchName').value.trim();
  const address = document.getElementById('branchAddress').value.trim();
  const phone = document.getElementById('branchPhone').value.trim();
  const manager = document.getElementById('branchManager').value.trim();
  
  if (!name) {
    alert('Filial nomi kiritilishi shart!');
    return;
  }
  
  try {
    const url = editingBranchId 
      ? `${API_URL}/branches/${editingBranchId}`
      : `${API_URL}/branches`;
    
    const method = editingBranchId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, address, phone, manager })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Saqlashda xatolik');
    }
    
    alert(data.message || 'Muvaffaqiyatli saqlandi!');
    closeBranchModal();
    await loadBranches();
    await loadStats();
    
  } catch (error) {
    console.error('❌ Saqlash xatosi:', error);
    alert('Xatolik: ' + error.message);
  }
}

async function deleteBranch(branchId) {
  if (!confirm('Haqiqatan ham bu filialni o\'chirmoqchimisiz?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/branches/${branchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'O\'chirishda xatolik');
    }
    
    alert('Filial o\'chirildi!');
    await loadBranches();
    await loadStats();
    
  } catch (error) {
    console.error('❌ O\'chirish xatosi:', error);
    alert('Xatolik: ' + error.message);
  }
}

function viewBranchDetails(branchId) {
  // Filial tafsilotlariga o'tish
  window.location.href = `/warehouse.html?branchId=${branchId}`;
}

// ==================== HELPERS ====================

function formatMoney(amount, short = false) {
  // NaN va undefined tekshiruvi
  const num = parseFloat(amount);
  if (isNaN(num) || num === null || num === undefined) {
    return '$0';
  }
  
  if (short && num >= 1000000) {
    return '$' + (num / 1000000).toFixed(1) + 'M';
  }
  if (short && num >= 1000) {
    return '$' + (num / 1000).toFixed(1) + 'K';
  }
  
  return '$' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

function goBack() {
  window.location.href = '/admin.html';
}

// ==================== EVENT LISTENERS ====================

// Modal tashqarisiga bosilganda yopish
window.onclick = function(event) {
  const modal = document.getElementById('branchModal');
  if (event.target === modal) {
    closeBranchModal();
  }
};

// ESC tugmasi bilan yopish
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeBranchModal();
  }
});

// ==================== START ====================

document.addEventListener('DOMContentLoaded', init);
