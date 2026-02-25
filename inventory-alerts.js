// Inventory Alerts JavaScript
const API_URL = 'https://fmobilee.onrender.com/api';

let products = [];
let currentFilter = 'all';
let selectedProduct = null;

// Alert thresholds
const CRITICAL_THRESHOLD = 5;  // 5 dan kam - kritik
const WARNING_THRESHOLD = 10;  // 10 dan kam - ogohlantirish

// Load products
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    products = await response.json();
    console.log(`✅ Loaded ${products.length} products`);
  } catch (error) {
    console.error('Load error:', error);
    products = JSON.parse(localStorage.getItem('products') || '[]');
  }
}

// Get alert level
function getAlertLevel(stock) {
  if (stock === 0) return 'critical';
  if (stock <= CRITICAL_THRESHOLD) return 'critical';
  if (stock <= WARNING_THRESHOLD) return 'warning';
  return 'good';
}

// Calculate stats
function calculateStats() {
  const critical = products.filter(p => getAlertLevel(p.stock || 0) === 'critical').length;
  const warning = products.filter(p => getAlertLevel(p.stock || 0) === 'warning').length;
  const good = products.filter(p => getAlertLevel(p.stock || 0) === 'good').length;
  
  document.getElementById('criticalCount').textContent = critical;
  document.getElementById('warningCount').textContent = warning;
  document.getElementById('goodCount').textContent = good;
}

// Filter alerts
function filterAlerts(filter) {
  currentFilter = filter;
  
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  event.target.classList.add('active');
  
  renderAlerts();
}

// Render alerts
function renderAlerts() {
  let filtered = products;
  
  if (currentFilter !== 'all') {
    filtered = products.filter(p => getAlertLevel(p.stock || 0) === currentFilter);
  }
  
  // Sort by stock (lowest first)
  filtered.sort((a, b) => (a.stock || 0) - (b.stock || 0));
  
  const html = filtered.map(product => {
    const level = getAlertLevel(product.stock || 0);
    const stock = product.stock || 0;
    
    let alertText = '';
    let alertIcon = '';
    
    if (level === 'critical') {
      alertText = stock === 0 ? 'TUGAGAN' : 'KRITIK KAM';
      alertIcon = '🚨';
    } else if (level === 'warning') {
      alertText = 'KAM QOLGAN';
      alertIcon = '⚠️';
    } else {
      alertText = 'YETARLI';
      alertIcon = '✅';
    }
    
    return `
      <div class="alert-card ${level}">
        <div class="alert-header">
          <div>
            <span class="alert-badge ${level}">${alertIcon} ${alertText}</span>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 32px; font-weight: 800; color: ${level === 'critical' ? '#ef4444' : level === 'warning' ? '#f59e0b' : '#10b981'};">
              ${stock}
            </div>
            <div style="font-size: 12px; color: #6b7280; font-weight: 600;">
              ${product.unit || 'dona'}
            </div>
          </div>
        </div>
        
        <div class="product-name">${product.name}</div>
        
        <div class="product-details">
          <div class="detail-item">
            <div class="detail-label">Kategoriya</div>
            <div class="detail-value">${product.category || 'Umumiy'}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">Sotish narxi</div>
            <div class="detail-value">$${(product.sellPrice || 0).toFixed(2)}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">SKU</div>
            <div class="detail-value">${product.sku || '-'}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">Barcode</div>
            <div class="detail-value">${product.barcode || '-'}</div>
          </div>
        </div>
        
        ${level !== 'good' ? `
          <div class="alert-actions">
            <button class="action-btn order-btn" onclick="openOrderModal(${product.productId || product.id})">
              <span>📦</span>
              Buyurtma berish
            </button>
            <button class="action-btn dismiss-btn" onclick="dismissAlert(${product.productId || product.id})">
              <span>✓</span>
              Keyinroq
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
  
  document.getElementById('alertsList').innerHTML = html || '<p class="empty">Ogohlantirishlar yo\'q</p>';
}

// Open order modal
function openOrderModal(productId) {
  selectedProduct = products.find(p => (p.productId || p.id) === productId);
  if (!selectedProduct) return;
  
  document.getElementById('orderProductName').textContent = selectedProduct.name;
  document.getElementById('orderProductDetails').textContent = 
    `${selectedProduct.category || 'Umumiy'} • Hozirgi qoldiq: ${selectedProduct.stock || 0} ${selectedProduct.unit || 'dona'}`;
  
  // Suggest order quantity
  const suggestedQty = Math.max(20, WARNING_THRESHOLD * 2);
  document.getElementById('orderQuantity').value = suggestedQty;
  
  document.getElementById('orderModal').classList.add('active');
}

// Close order modal
function closeOrderModal() {
  document.getElementById('orderModal').classList.remove('active');
  selectedProduct = null;
}

// Submit order
async function submitOrder() {
  const quantity = Number(document.getElementById('orderQuantity').value);
  const supplier = document.getElementById('orderSupplier').value.trim();
  const notes = document.getElementById('orderNotes').value.trim();
  
  if (!quantity || quantity <= 0) {
    alert('❌ Miqdorni kiriting!');
    return;
  }
  
  const order = {
    id: Date.now(),
    productId: selectedProduct.productId || selectedProduct.id,
    productName: selectedProduct.name,
    quantity,
    supplier,
    notes,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  // Save order
  try {
    await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
  } catch (error) {
    console.error('Order error:', error);
    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
  }
  
  closeOrderModal();
  alert(`✅ Buyurtma berildi!\n\nMahsulot: ${selectedProduct.name}\nMiqdor: ${quantity} ${selectedProduct.unit || 'dona'}\nYetkazib beruvchi: ${supplier || 'Ko\'rsatilmagan'}`);
  
  // Clear form
  document.getElementById('orderQuantity').value = '';
  document.getElementById('orderSupplier').value = '';
  document.getElementById('orderNotes').value = '';
}

// Dismiss alert
function dismissAlert(productId) {
  if (!confirm('⏰ Bu ogohlantirishni keyinroq ko\'rmoqchimisiz?')) return;
  
  // Save to dismissed list
  const dismissed = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
  dismissed.push({
    productId,
    dismissedAt: new Date().toISOString()
  });
  localStorage.setItem('dismissedAlerts', JSON.stringify(dismissed));
  
  // Remove from view
  products = products.filter(p => (p.productId || p.id) !== productId);
  
  calculateStats();
  renderAlerts();
  
  alert('✅ Ogohlantirish yashirildi');
}

// Refresh alerts
async function refreshAlerts() {
  await loadProducts();
  calculateStats();
  renderAlerts();
  alert('✅ Ma\'lumotlar yangilandi!');
}

// Initialize
async function init() {
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('uz-UZ', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  await loadProducts();
  
  calculateStats();
  renderAlerts();
}

init();
