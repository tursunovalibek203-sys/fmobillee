// Professional Warehouse Management with IMEI System
const API_URL = window.location.origin + '/api';

let products = [];
let allIMEIs = [];
let editingProductId = null;
let currentProductForIMEI = null;

// ==================== INIT ====================

async function init() {
  await loadProducts();
  await loadAllIMEIs();
  updateStatistics();
}

// ==================== LOAD DATA ====================

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/warehouse/products`);
    const data = await response.json();
    
    if (data.success) {
      products = data.products;
      renderProducts();
    }
  } catch (error) {
    console.error('Mahsulotlar yuklash xatosi:', error);
    alert('❌ Mahsulotlarni yuklashda xatolik!');
  }
}

async function loadAllIMEIs() {
  try {
    const response = await fetch(`${API_URL}/warehouse/imei/all`);
    const data = await response.json();
    
    if (data.success) {
      allIMEIs = data.imeis || [];
    }
  } catch (error) {
    console.error('IMEI yuklash xatosi:', error);
  }
}

// ==================== RENDER ====================

function renderProducts(filteredProducts = null) {
  const productsToRender = filteredProducts || products;
  const grid = document.getElementById('productsGrid');
  
  if (productsToRender.length === 0) {
    grid.innerHTML = '<p class="empty">Mahsulotlar topilmadi</p>';
    return;
  }
  
  grid.innerHTML = productsToRender.map(product => {
    const productIMEIs = allIMEIs.filter(imei => imei.productId === product.productId);
    const availableIMEIs = productIMEIs.filter(imei => imei.status === 'available');
    
    let stockBadge = '';
    let stockClass = '';
    
    if (product.stock > 10) {
      stockBadge = '<span class="product-badge badge-in-stock">✅ Omborda</span>';
      stockClass = 'stock-ok';
    } else if (product.stock > 0) {
      stockBadge = '<span class="product-badge badge-low-stock">⚠️ Kam qolgan</span>';
      stockClass = 'stock-low';
    } else {
      stockBadge = '<span class="product-badge badge-out-stock">❌ Tugagan</span>';
      stockClass = 'stock-low';
    }
    
    return `
      <div class="product-card-pro">
        <div class="product-header">
          <div>
            <div class="product-name-pro">${product.name}</div>
            <div class="product-category">${product.category || 'Kategoriyasiz'}</div>
          </div>
          ${stockBadge}
        </div>
        
        <div class="product-details">
          <div class="detail-item">
            <div class="detail-label">Sotib olish</div>
            <div class="detail-value">${accounting.formatMoney(product.buyPrice, 'USD')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Sotish</div>
            <div class="detail-value">${accounting.formatMoney(product.sellPrice, 'USD')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Miqdor</div>
            <div class="detail-value ${stockClass}">${product.stock} ${product.unit || 'dona'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Foyda</div>
            <div class="detail-value" style="color: #059669;">
              ${accounting.formatMoney(product.sellPrice - product.buyPrice, 'USD')}
            </div>
          </div>
        </div>
        
        ${productIMEIs.length > 0 ? `
          <div class="imei-section">
            <div class="imei-header">
              <div class="imei-title">📱 IMEI Raqamlar</div>
              <div class="imei-count">${availableIMEIs.length}/${productIMEIs.length} mavjud</div>
            </div>
            <div class="imei-list">
              ${productIMEIs.slice(0, 3).map(imei => `
                <div class="imei-item">
                  <span class="imei-number">${imei.imei}</span>
                  <span class="imei-status ${imei.status === 'available' ? 'imei-available' : 'imei-sold'}">
                    ${imei.status === 'available' ? '✅ Mavjud' : '❌ Sotilgan'}
                  </span>
                </div>
              `).join('')}
              ${productIMEIs.length > 3 ? `
                <div style="text-align: center; padding: 8px; color: #6b7280; font-size: 12px; font-weight: 600;">
                  +${productIMEIs.length - 3} ta yana...
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
        
        <div class="product-actions">
          <button class="action-btn btn-edit" onclick="editProduct(${product.productId})">
            <span>✏️</span>
            Tahrirlash
          </button>
          <button class="action-btn btn-stock" onclick="openStockModal(${product.productId})">
            <span>📦</span>
            Kirim/Chiqim
          </button>
          <button class="action-btn btn-imei" onclick="openIMEIModal(${product.productId})">
            <span>📱</span>
            IMEI (${productIMEIs.length})
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== STATISTICS ====================

function updateStatistics() {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.buyPrice * p.stock), 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalIMEI = allIMEIs.length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  
  document.getElementById('totalProducts').textContent = totalProducts;
  document.getElementById('totalValue').textContent = accounting.formatMoney(totalValue, 'USD');
  document.getElementById('totalStock').textContent = totalStock;
  document.getElementById('totalIMEI').textContent = totalIMEI;
  document.getElementById('lowStockCount').textContent = lowStockCount;
}

// ==================== FILTER ====================

function filterProducts() {
  const searchText = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const stockFilter = document.getElementById('stockFilter').value;
  
  let filtered = products;
  
  // Search filter
  if (searchText) {
    filtered = filtered.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(searchText);
      const barcodeMatch = p.barcode && p.barcode.toLowerCase().includes(searchText);
      const imeiMatch = allIMEIs.some(imei => 
        imei.productId === p.productId && imei.imei.includes(searchText)
      );
      return nameMatch || barcodeMatch || imeiMatch;
    });
  }
  
  // Category filter
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  // Stock filter
  if (stockFilter === 'in-stock') {
    filtered = filtered.filter(p => p.stock > 10);
  } else if (stockFilter === 'low-stock') {
    filtered = filtered.filter(p => p.stock > 0 && p.stock <= 10);
  } else if (stockFilter === 'out-stock') {
    filtered = filtered.filter(p => p.stock === 0);
  }
  
  renderProducts(filtered);
}

// ==================== PRODUCT MODAL ====================

function openAddProductModal() {
  editingProductId = null;
  document.getElementById('modalTitle').textContent = '➕ Yangi Mahsulot';
  
  document.getElementById('productName').value = '';
  document.getElementById('productCategory').value = '';
  document.getElementById('buyPrice').value = '';
  document.getElementById('sellPrice').value = '';
  document.getElementById('productStock').value = '';
  document.getElementById('productBarcode').value = '';
  document.getElementById('productUnit').value = 'dona';
  document.getElementById('productDescription').value = '';
  
  document.getElementById('productModal').classList.add('active');
  document.getElementById('productName').focus();
}

function editProduct(productId) {
  const product = products.find(p => p.productId === productId);
  if (!product) return;
  
  editingProductId = productId;
  document.getElementById('modalTitle').textContent = '✏️ Mahsulotni Tahrirlash';
  
  document.getElementById('productName').value = product.name;
  document.getElementById('productCategory').value = product.category || '';
  document.getElementById('buyPrice').value = product.buyPrice;
  document.getElementById('sellPrice').value = product.sellPrice;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productBarcode').value = product.barcode || '';
  document.getElementById('productUnit').value = product.unit || 'dona';
  document.getElementById('productDescription').value = product.description || '';
  
  document.getElementById('productModal').classList.add('active');
  document.getElementById('productName').focus();
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
  editingProductId = null;
}

async function saveProduct() {
  const name = document.getElementById('productName').value.trim();
  const category = document.getElementById('productCategory').value;
  const buyPrice = parseFloat(document.getElementById('buyPrice').value);
  const sellPrice = parseFloat(document.getElementById('sellPrice').value);
  const stock = parseInt(document.getElementById('productStock').value);
  const barcode = document.getElementById('productBarcode').value.trim();
  const unit = document.getElementById('productUnit').value.trim() || 'dona';
  const description = document.getElementById('productDescription').value.trim();
  
  if (!name || !category || isNaN(buyPrice) || isNaN(sellPrice) || isNaN(stock)) {
    alert('⚠️ Barcha majburiy maydonlarni to\'ldiring!');
    return;
  }
  
  if (buyPrice < 0 || sellPrice < 0 || stock < 0) {
    alert('⚠️ Qiymatlar manfiy bo\'lishi mumkin emas!');
    return;
  }
  
  if (sellPrice < buyPrice) {
    if (!confirm('⚠️ Sotish narxi sotib olish narxidan past!\n\nDavom etasizmi?')) {
      return;
    }
  }
  
  try {
    const productData = {
      name,
      category,
      buyPrice,
      sellPrice,
      stock,
      barcode: barcode || null,
      unit,
      description: description || null
    };
    
    let response;
    if (editingProductId) {
      response = await fetch(`${API_URL}/warehouse/products/${editingProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
    } else {
      response = await fetch(`${API_URL}/warehouse/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Saqlashda xatolik');
    }
    
    alert(editingProductId ? '✅ Mahsulot yangilandi!' : '✅ Mahsulot qo\'shildi!');
    closeProductModal();
    await loadProducts();
    updateStatistics();
    
  } catch (error) {
    console.error('Mahsulot saqlash xatosi:', error);
    alert('❌ Xatolik: ' + error.message);
  }
}

// ==================== IMEI MODAL ====================

function openIMEIModal(productId) {
  const product = products.find(p => p.productId === productId);
  if (!product) return;
  
  currentProductForIMEI = product;
  
  document.getElementById('imeiModalTitle').textContent = `📱 ${product.name} - IMEI Boshqaruvi`;
  document.getElementById('imeiProductName').textContent = product.name;
  
  const productIMEIs = allIMEIs.filter(imei => imei.productId === productId);
  document.getElementById('imeiTotalCount').textContent = productIMEIs.length;
  
  document.getElementById('newIMEI').value = '';
  document.getElementById('imeiValidation').innerHTML = '';
  
  renderIMEIList(productIMEIs);
  
  document.getElementById('imeiModal').classList.add('active');
  document.getElementById('newIMEI').focus();
}

function closeIMEIModal() {
  document.getElementById('imeiModal').classList.remove('active');
  currentProductForIMEI = null;
}

function renderIMEIList(imeis) {
  const container = document.getElementById('imeiListModal');
  
  if (imeis.length === 0) {
    container.innerHTML = '<p class="empty">IMEI yo\'q</p>';
    return;
  }
  
  container.innerHTML = imeis.map(imei => `
    <div class="imei-item-modal">
      <div>
        <div style="font-family: 'Courier New', monospace; font-weight: 700; font-size: 15px; color: #0f172a; margin-bottom: 4px;">
          ${imei.imei}
        </div>
        <div style="font-size: 12px; color: #6b7280;">
          ${imei.status === 'available' ? '✅ Mavjud' : '❌ Sotilgan'}
          ${imei.soldDate ? ` • ${imei.soldDate}` : ''}
        </div>
      </div>
      ${imei.status === 'available' ? `
        <button class="delete-imei-btn" onclick="deleteIMEI('${imei.imei}')">
          🗑️ O'chirish
        </button>
      ` : ''}
    </div>
  `).join('');
}

// ==================== IMEI VALIDATION ====================

function validateIMEI(imei) {
  const validation = document.getElementById('imeiValidation');
  
  if (!imei) {
    validation.innerHTML = '';
    return false;
  }
  
  // Faqat raqamlar
  if (!/^\d+$/.test(imei)) {
    validation.innerHTML = '<span class="validation-error">❌ Faqat raqamlar kiritilishi kerak</span>';
    return false;
  }
  
  // 15 raqam
  if (imei.length !== 15) {
    validation.innerHTML = `<span class="validation-error">❌ IMEI 15 raqamdan iborat bo'lishi kerak (${imei.length}/15)</span>`;
    return false;
  }
  
  // Dublikat tekshirish
  const exists = allIMEIs.some(i => i.imei === imei);
  if (exists) {
    validation.innerHTML = '<span class="validation-error">❌ Bu IMEI allaqachon mavjud!</span>';
    return false;
  }
  
  validation.innerHTML = '<span class="validation-success">✅ IMEI to\'g\'ri</span>';
  return true;
}

// ==================== IMEI OPERATIONS ====================

async function addIMEI() {
  if (!currentProductForIMEI) return;
  
  const imei = document.getElementById('newIMEI').value.trim();
  
  if (!validateIMEI(imei)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/warehouse/imei`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: currentProductForIMEI.productId,
        imei: imei
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'IMEI qo\'shishda xatolik');
    }
    
    alert('✅ IMEI qo\'shildi!');
    
    // Yangilash
    await loadAllIMEIs();
    const productIMEIs = allIMEIs.filter(i => i.productId === currentProductForIMEI.productId);
    document.getElementById('imeiTotalCount').textContent = productIMEIs.length;
    renderIMEIList(productIMEIs);
    renderProducts();
    updateStatistics();
    
    document.getElementById('newIMEI').value = '';
    document.getElementById('imeiValidation').innerHTML = '';
    document.getElementById('newIMEI').focus();
    
  } catch (error) {
    console.error('IMEI qo\'shish xatosi:', error);
    alert('❌ Xatolik: ' + error.message);
  }
}

async function deleteIMEI(imei) {
  if (!confirm(`IMEI ${imei} ni o'chirmoqchimisiz?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/warehouse/imei/${imei}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'IMEI o\'chirishda xatolik');
    }
    
    alert('✅ IMEI o\'chirildi!');
    
    // Yangilash
    await loadAllIMEIs();
    const productIMEIs = allIMEIs.filter(i => i.productId === currentProductForIMEI.productId);
    document.getElementById('imeiTotalCount').textContent = productIMEIs.length;
    renderIMEIList(productIMEIs);
    renderProducts();
    updateStatistics();
    
  } catch (error) {
    console.error('IMEI o\'chirish xatosi:', error);
    alert('❌ Xatolik: ' + error.message);
  }
}

// ==================== STOCK MODAL ====================

function openStockModal(productId) {
  // Bu funksiya mavjud warehouse.html dan olinadi
  alert('Kirim/Chiqim funksiyasi tez orada qo\'shiladi!');
}

// ==================== HELPERS ====================

function goBack() {
  window.history.back();
}

// ==================== START ====================

document.addEventListener('DOMContentLoaded', init);
