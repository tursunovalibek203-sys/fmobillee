// Warehouse Management Script
const API_URL = window.location.origin + '/api';

let allProducts = [];
let filteredProducts = [];
let currentFilter = 'all';
let editingProductId = null;

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
  
  await loadProducts();
  await loadStats();
}

// ==================== LOAD DATA ====================

async function loadProducts() {
  try {
    console.log('📦 Mahsulotlar yuklanmoqda...');
    
    const response = await fetch(`${API_URL}/warehouse/products`);
    
    if (!response.ok) {
      throw new Error(`Server xatosi: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Ma\'lumot yuklashda xatolik');
    }
    
    allProducts = data.products || [];
    console.log(`✅ ${allProducts.length} ta mahsulot yuklandi`);
    
    filterProducts(currentFilter);
    
  } catch (error) {
    console.error('❌ Mahsulotlar yuklash xatosi:', error);
    document.getElementById('productsGrid').innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: white; border-radius: 16px;">
        <p style="font-size: 48px; margin-bottom: 16px;">❌</p>
        <h3 style="color: #dc2626; margin-bottom: 8px;">Xatolik yuz berdi</h3>
        <p style="color: #6b7280;">${error.message}</p>
        <button onclick="loadProducts()" style="margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">
          🔄 Qayta yuklash
        </button>
      </div>
    `;
  }
}

async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/warehouse/stats`);
    const data = await response.json();
    
    if (data.success && data.stats) {
      const totalProducts = parseInt(data.stats.totalProducts) || 0;
      const lowStockCount = parseInt(data.stats.lowStockCount) || 0;
      const totalStockValue = parseFloat(data.stats.totalStockValue) || 0;
      
      document.getElementById('totalProducts').textContent = totalProducts;
      document.getElementById('inStockProducts').textContent = Math.max(0, totalProducts - lowStockCount);
      document.getElementById('lowStockProducts').textContent = lowStockCount;
      document.getElementById('totalValue').textContent = formatMoney(totalStockValue);
      
      console.log('📊 Statistika:', { totalProducts, lowStockCount, totalStockValue });
    }
  } catch (error) {
    console.error('❌ Statistika yuklash xatosi:', error);
    // Xatolik bo'lsa 0 ko'rsatish
    document.getElementById('totalProducts').textContent = '0';
    document.getElementById('inStockProducts').textContent = '0';
    document.getElementById('lowStockProducts').textContent = '0';
    document.getElementById('totalValue').textContent = '$0.00';
  }
}

// ==================== FILTER & SEARCH ====================

function filterProducts(filter) {
  currentFilter = filter;
  
  // Filter tugmalarini yangilash
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.includes('Barchasi') && filter === 'all') {
      btn.classList.add('active');
    } else if (btn.textContent.includes('Omborda bor') && filter === 'in-stock') {
      btn.classList.add('active');
    } else if (btn.textContent.includes('Kam qolgan') && filter === 'low-stock') {
      btn.classList.add('active');
    } else if (btn.textContent.includes('Tugagan') && filter === 'out-of-stock') {
      btn.classList.add('active');
    }
  });
  
  // Mahsulotlarni filtrlash
  if (filter === 'all') {
    filteredProducts = [...allProducts];
  } else if (filter === 'in-stock') {
    filteredProducts = allProducts.filter(p => p.stock > p.minStock);
  } else if (filter === 'low-stock') {
    filteredProducts = allProducts.filter(p => p.stock > 0 && p.stock <= p.minStock);
  } else if (filter === 'out-of-stock') {
    filteredProducts = allProducts.filter(p => p.stock === 0);
  }
  
  renderProducts();
}

function searchProducts() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  
  if (!query) {
    filterProducts(currentFilter);
    return;
  }
  
  filteredProducts = allProducts.filter(p => {
    return p.name.toLowerCase().includes(query) ||
           (p.barcode && p.barcode.toLowerCase().includes(query)) ||
           (p.categoryName && p.categoryName.toLowerCase().includes(query)) ||
           p.productId.toString().includes(query);
  });
  
  renderProducts();
}

// ==================== RENDER ====================

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  
  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: white; border-radius: 16px;">
        <p style="font-size: 48px; margin-bottom: 16px;">📦</p>
        <h3 style="color: #6b7280;">Mahsulot topilmadi</h3>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = filteredProducts.map(product => {
    const stockClass = product.stock > product.minStock ? 'stock-ok' : 'stock-low';
    const stockIcon = product.stock > product.minStock ? '✅' : '⚠️';
    
    return `
      <div class="product-card" onclick="openProductDetail(${product.productId})">
        <div class="product-name">📦 ${product.name}</div>
        <div class="product-info">
          ${product.categoryName ? `📂 ${product.categoryName}` : ''}
        </div>
        <div class="product-info">
          💰 Sotish: ${formatMoney(product.sellPrice)}
        </div>
        ${product.buyPrice > 0 ? `
          <div class="product-info">
            💵 Kelgan: ${formatMoney(product.buyPrice)}
          </div>
        ` : ''}
        ${product.barcode ? `
          <div class="product-info">
            🏷️ ${product.barcode}
          </div>
        ` : ''}
        <div class="product-stock ${stockClass}">
          ${stockIcon} ${product.stock} ${product.unit}
        </div>
        ${product.stock <= product.minStock ? `
          <div style="margin-top: 8px; padding: 6px 12px; background: #fee2e2; border-radius: 8px; font-size: 12px; color: #dc2626; font-weight: 600;">
            Minimal: ${product.minStock} ${product.unit}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// ==================== PRODUCT DETAIL ====================

async function openProductDetail(productId) {
  try {
    const response = await fetch(`${API_URL}/warehouse/product/${productId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Mahsulot topilmadi');
    }
    
    const product = data.product;
    editingProductId = productId;
    
    // IMEI larni olish
    const imeiResponse = await fetch(`${API_URL}/warehouse/product-items/${productId}`);
    const imeiData = await imeiResponse.json();
    const items = imeiData.success ? imeiData.items : [];
    
    document.getElementById('detailProductName').textContent = `📦 ${product.name}`;
    
    const stockClass = product.stock > product.minStock ? 'stock-ok' : 'stock-low';
    const profit = product.sellPrice - product.buyPrice;
    const profitPercent = product.buyPrice > 0 ? ((profit / product.buyPrice) * 100).toFixed(1) : 0;
    
    document.getElementById('productDetailContent').innerHTML = `
      <div style="display: grid; gap: 20px;">
        <!-- Asosiy ma'lumotlar -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 12px;">
          <h3 style="margin: 0 0 16px 0; color: #111827;">📋 Asosiy ma'lumotlar</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">ID</p>
              <p style="font-weight: 600; margin: 0;">#${product.productId}</p>
            </div>
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">Kategoriya</p>
              <p style="font-weight: 600; margin: 0;">${product.categoryName || 'Umumiy'}</p>
            </div>
            ${product.barcode ? `
              <div style="grid-column: 1/-1;">
                <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">Barcode</p>
                <p style="font-weight: 600; margin: 0; font-family: monospace;">${product.barcode}</p>
              </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Narxlar -->
        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px;">
          <h3 style="margin: 0 0 16px 0; color: #111827;">💰 Narxlar</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">Kelgan narxi</p>
              <p style="font-weight: 700; font-size: 18px; margin: 0; color: #dc2626;">${formatMoney(product.buyPrice)}</p>
            </div>
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">Sotish narxi</p>
              <p style="font-weight: 700; font-size: 18px; margin: 0; color: #059669;">${formatMoney(product.sellPrice)}</p>
            </div>
            ${product.buyPrice > 0 ? `
              <div style="grid-column: 1/-1; padding: 12px; background: white; border-radius: 8px;">
                <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">Foyda (1 dona)</p>
                <p style="font-weight: 700; font-size: 16px; margin: 0; color: #059669;">
                  ${formatMoney(profit)} (${profitPercent}%)
                </p>
              </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Ombor -->
        <div style="background: ${product.stock > product.minStock ? '#eff6ff' : '#fef2f2'}; padding: 20px; border-radius: 12px;">
          <h3 style="margin: 0 0 16px 0; color: #111827;">📊 Ombor holati</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">Hozirgi miqdor</p>
              <p style="font-weight: 700; font-size: 20px; margin: 0;" class="${stockClass}">
                ${product.stock} ${product.unit}
              </p>
            </div>
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">Minimal</p>
              <p style="font-weight: 600; margin: 0;">${product.minStock} ${product.unit}</p>
            </div>
            <div>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0;">Maksimal</p>
              <p style="font-weight: 600; margin: 0;">${product.maxStock || 1000} ${product.unit}</p>
            </div>
          </div>
          ${product.stock <= product.minStock ? `
            <div style="margin-top: 12px; padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #dc2626;">
              <p style="margin: 0; color: #dc2626; font-weight: 600;">⚠️ Mahsulot kam qolgan! Yangi partiya buyurtma qiling.</p>
            </div>
          ` : ''}
        </div>
        
        <!-- IMEI / Serial Numbers -->
        ${items.length > 0 ? `
          <div style="background: #fef3c7; padding: 20px; border-radius: 12px;">
            <h3 style="margin: 0 0 16px 0; color: #111827;">🏷️ IMEI / Serial Numbers (${items.length} ta)</h3>
            <div style="max-height: 400px; overflow-y: auto;">
              ${items.map(item => {
                const statusColors = {
                  available: '#059669',
                  sold: '#dc2626',
                  reserved: '#f59e0b',
                  damaged: '#6b7280',
                  returned: '#8b5cf6'
                };
                const statusTexts = {
                  available: '✅ Mavjud',
                  sold: '🔴 Sotilgan',
                  reserved: '🟡 Band',
                  damaged: '⚫ Shikastlangan',
                  returned: '🔵 Qaytarilgan'
                };
                return `
                  <div style="background: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                      <p style="margin: 0 0 4px 0; font-weight: 700; font-family: monospace; font-size: 14px; color: #111827;">
                        ${item.imei}
                      </p>
                      ${item.serialNumber ? `
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">SN: ${item.serialNumber}</p>
                      ` : ''}
                      ${item.soldDate ? `
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">
                          Sotilgan: ${new Date(item.soldDate).toLocaleDateString('uz-UZ')}
                          ${item.soldTo ? ` - ${item.soldTo}` : ''}
                        </p>
                      ` : ''}
                    </div>
                    <div style="text-align: right;">
                      <span style="padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; background: ${statusColors[item.status]}20; color: ${statusColors[item.status]};">
                        ${statusTexts[item.status]}
                      </span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
        
        ${product.description ? `
          <div style="background: #f9fafb; padding: 20px; border-radius: 12px;">
            <h3 style="margin: 0 0 12px 0; color: #111827;">📝 Qo'shimcha ma'lumot</h3>
            <p style="margin: 0; color: #6b7280; line-height: 1.6;">${product.description}</p>
          </div>
        ` : ''}
        
        <!-- Harakatlar -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <button onclick="openStockInModal(${product.productId})" style="padding: 14px; background: #059669; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 14px;">
            📥 Omborga kiritish
          </button>
          <button onclick="openStockOutModal(${product.productId})" style="padding: 14px; background: #dc2626; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 14px;">
            📤 Ombordan chiqarish
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('productDetailModal').classList.add('active');
    
  } catch (error) {
    console.error('❌ Mahsulot ma\'lumotlari xatosi:', error);
    alert('❌ Mahsulot ma\'lumotlarini yuklashda xatolik!\n\n' + error.message);
  }
}

function closeProductDetailModal() {
  document.getElementById('productDetailModal').classList.remove('active');
  editingProductId = null;
}

function viewProductItems() {
  if (!editingProductId) return;
  window.location.href = `/product-items.html?productId=${editingProductId}`;
}

// ==================== ADD/EDIT PRODUCT ====================

function openAddProductModal() {
  editingProductId = null;
  document.getElementById('modalTitle').textContent = '➕ Yangi mahsulot';
  
  // Formani tozalash
  document.getElementById('productName').value = '';
  document.getElementById('productIMEI').value = '';
  document.getElementById('productBuyPrice').value = '';
  document.getElementById('productSellPrice').value = '';
  
  document.getElementById('productModal').classList.add('active');
  document.getElementById('productName').focus();
}

function editProduct() {
  if (!editingProductId) return;
  
  const product = allProducts.find(p => p.productId === editingProductId);
  if (!product) return;
  
  document.getElementById('modalTitle').textContent = '✏️ Mahsulotni tahrirlash';
  
  document.getElementById('productName').value = product.name;
  document.getElementById('productCategory').value = product.categoryName || 'Umumiy';
  document.getElementById('productBuyPrice').value = product.buyPrice || '';
  document.getElementById('productSellPrice').value = product.sellPrice;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productMinStock').value = product.minStock;
  document.getElementById('productUnit').value = product.unit;
  document.getElementById('productBarcode').value = product.barcode || '';
  document.getElementById('productDescription').value = product.description || '';
  
  closeProductDetailModal();
  document.getElementById('productModal').classList.add('active');
  document.getElementById('productName').focus();
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
  editingProductId = null;
}

async function saveProduct() {
  const name = document.getElementById('productName').value.trim();
  const imei = document.getElementById('productIMEI').value.trim();
  const buyPrice = parseFloat(document.getElementById('productBuyPrice').value);
  const sellPrice = parseFloat(document.getElementById('productSellPrice').value);
  
  // Validatsiya
  if (!name) {
    alert('⚠️ Mahsulot nomini kiriting!');
    document.getElementById('productName').focus();
    return;
  }
  
  if (!imei) {
    alert('⚠️ IMEI kodini kiriting!');
    document.getElementById('productIMEI').focus();
    return;
  }
  
  if (!buyPrice || buyPrice <= 0) {
    alert('⚠️ Kelgan narxini kiriting!');
    document.getElementById('productBuyPrice').focus();
    return;
  }
  
  if (!sellPrice || sellPrice <= 0) {
    alert('⚠️ Sotish narxini kiriting!');
    document.getElementById('productSellPrice').focus();
    return;
  }
  
  // Loading ko'rsatish
  const saveBtn = event.target;
  const originalText = saveBtn.innerHTML;
  saveBtn.innerHTML = '<span>⏳</span> Saqlanmoqda...';
  saveBtn.disabled = true;
  
  try {
    // Avval mahsulot borligini tekshirish (nom bo'yicha)
    let product = allProducts.find(p => p.name.toLowerCase() === name.toLowerCase());
    
    if (!product) {
      // Yangi mahsulot yaratish
      const productResponse = await fetch(`${API_URL}/warehouse/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          categoryName: 'Umumiy',
          buyPrice,
          sellPrice,
          stock: 0,
          minStock: 1,
          unit: 'dona'
        })
      });
      
      const productData = await productResponse.json();
      
      if (!productData.success) {
        throw new Error(productData.error || 'Mahsulot yaratishda xatolik');
      }
      
      product = productData.product;
    }
    
    // IMEI qo'shish
    const imeiResponse = await fetch(`${API_URL}/warehouse/product-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.productId,
        imei,
        buyPrice,
        sellPrice,
        condition: 'new'
      })
    });
    
    const imeiData = await imeiResponse.json();
    
    if (!imeiData.success) {
      throw new Error(imeiData.error || 'IMEI qo\'shishda xatolik');
    }
    
    alert('✅ Mahsulot va IMEI muvaffaqiyatli saqlandi!');
    closeProductModal();
    
    // Faqat kerakli ma'lumotlarni yangilash
    await Promise.all([
      loadProducts(),
      loadStats()
    ]);
    
  } catch (error) {
    console.error('❌ Saqlash xatosi:', error);
    alert('❌ Saqlashda xatolik!\n\n' + error.message);
  } finally {
    saveBtn.innerHTML = originalText;
    saveBtn.disabled = false;
  }
}

// ==================== STOCK IN/OUT ====================

function openStockInModal(productId) {
  const product = allProducts.find(p => p.productId === productId);
  if (!product) return;
  
  const quantity = prompt(`📥 Omborga kiritish\n\nMahsulot: ${product.name}\nHozirgi miqdor: ${product.stock} ${product.unit}\n\nNecha ${product.unit} kiritasiz?`);
  
  if (!quantity || isNaN(quantity) || quantity <= 0) {
    return;
  }
  
  const price = prompt(`💰 Kelgan narxi\n\n1 ${product.unit} uchun kelgan narx (so'm):`);
  
  if (!price || isNaN(price) || price < 0) {
    return;
  }
  
  stockIn(productId, parseInt(quantity), parseFloat(price));
}

function openStockOutModal(productId) {
  const product = allProducts.find(p => p.productId === productId);
  if (!product) return;
  
  if (product.stock <= 0) {
    alert('⚠️ Omborda bu mahsulot yo\'q!');
    return;
  }
  
  const quantity = prompt(`📤 Ombordan chiqarish\n\nMahsulot: ${product.name}\nHozirgi miqdor: ${product.stock} ${product.unit}\n\nNecha ${product.unit} chiqarasiz?`);
  
  if (!quantity || isNaN(quantity) || quantity <= 0) {
    return;
  }
  
  if (parseInt(quantity) > product.stock) {
    alert(`⚠️ Omborda faqat ${product.stock} ${product.unit} bor!`);
    return;
  }
  
  stockOut(productId, parseInt(quantity));
}

async function stockIn(productId, quantity, price) {
  try {
    const response = await fetch(`${API_URL}/warehouse/stock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        quantity,
        price,
        userId: 'admin',
        userName: 'Admin'
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Kiritishda xatolik');
    }
    
    alert(`✅ Omborga kiritildi!\n\n${data.product.name}\n+${quantity} ${data.product.unit}\n\nYangi miqdor: ${data.product.stock} ${data.product.unit}`);
    
    closeProductDetailModal();
    await loadProducts();
    await loadStats();
    
  } catch (error) {
    console.error('❌ Omborga kiritish xatosi:', error);
    alert('❌ Omborga kiritishda xatolik!\n\n' + error.message);
  }
}

async function stockOut(productId, quantity) {
  try {
    const response = await fetch(`${API_URL}/warehouse/stock-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        quantity,
        reason: 'Qo\'lda chiqarish',
        userId: 'admin',
        userName: 'Admin'
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Chiqarishda xatolik');
    }
    
    alert(`✅ Ombordan chiqarildi!\n\n${data.product.name}\n-${quantity} ${data.product.unit}\n\nQolgan: ${data.product.stock} ${data.product.unit}`);
    
    closeProductDetailModal();
    await loadProducts();
    await loadStats();
    
  } catch (error) {
    console.error('❌ Ombordan chiqarish xatosi:', error);
    alert('❌ Ombordan chiqarishda xatolik!\n\n' + error.message);
  }
}

// ==================== HELPERS ====================

function formatMoney(num) {
  // NaN va undefined tekshiruvi
  const amount = parseFloat(num);
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$0.00';
  }
  
  return '$' + amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function goBack() {
  window.location.href = '/';
}

// ==================== START ====================

init();


// ==================== STOCK MOVEMENTS ====================

let allMovements = [];
let filteredMovements = [];
let currentMovementFilter = 'all';

async function showStockMovements() {
  try {
    document.getElementById('stockMovementsModal').classList.add('active');
    document.getElementById('stockMovementsContent').innerHTML = '<p class="empty">Yuklanmoqda...</p>';
    
    const response = await fetch(`${API_URL}/warehouse/stock-movements?limit=100`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Ma\'lumot yuklashda xatolik');
    }
    
    allMovements = data.movements || [];
    filterMovements('all');
    
  } catch (error) {
    console.error('❌ Stock movements xatosi:', error);
    document.getElementById('stockMovementsContent').innerHTML = `
      <div style="text-align: center; padding: 48px;">
        <p style="font-size: 48px; margin-bottom: 16px;">❌</p>
        <h3 style="color: #dc2626; margin-bottom: 8px;">Xatolik yuz berdi</h3>
        <p style="color: #6b7280;">${error.message}</p>
      </div>
    `;
  }
}

function filterMovements(type) {
  currentMovementFilter = type;
  
  // Filter tugmalarini yangilash
  document.querySelectorAll('#stockMovementsModal .filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.includes('Barchasi') && type === 'all') {
      btn.classList.add('active');
    } else if (btn.textContent.includes('Chiqimlar') && type === 'out') {
      btn.classList.add('active');
    } else if (btn.textContent.includes('Kirimlar') && type === 'in') {
      btn.classList.add('active');
    }
  });
  
  // Filtrlash
  if (type === 'all') {
    filteredMovements = [...allMovements];
  } else {
    filteredMovements = allMovements.filter(m => m.type === type);
  }
  
  renderStockMovements();
}

function renderStockMovements() {
  const container = document.getElementById('stockMovementsContent');
  
  if (filteredMovements.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px;">
        <p style="font-size: 48px; margin-bottom: 16px;">📦</p>
        <h3 style="color: #6b7280;">Ma'lumot topilmadi</h3>
      </div>
    `;
    return;
  }
  
  const typeColors = {
    in: '#059669',
    out: '#dc2626',
    return: '#f59e0b',
    adjustment: '#8b5cf6',
    transfer: '#3b82f6'
  };
  
  const typeIcons = {
    in: '📥',
    out: '📤',
    return: '↩️',
    adjustment: '⚙️',
    transfer: '🔄'
  };
  
  const typeTexts = {
    in: 'Kirim',
    out: 'Chiqim',
    return: 'Qaytarish',
    adjustment: 'Tuzatish',
    transfer: 'Ko\'chirish'
  };
  
  container.innerHTML = `
    <div style="display: grid; gap: 12px;">
      ${filteredMovements.map(movement => `
        <div style="background: white; border-radius: 12px; padding: 16px; border-left: 4px solid ${typeColors[movement.type]};">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 20px;">${typeIcons[movement.type]}</span>
                <h4 style="margin: 0; font-size: 16px; color: #111827;">${movement.productName}</h4>
              </div>
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">
                ${movement.date} ${movement.time}
              </p>
              ${movement.userName ? `
                <p style="margin: 0; color: #6b7280; font-size: 13px;">
                  👤 ${movement.userName}
                </p>
              ` : ''}
            </div>
            <div style="text-align: right;">
              <span style="padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; background: ${typeColors[movement.type]}20; color: ${typeColors[movement.type]};">
                ${typeTexts[movement.type]}
              </span>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px;">
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">Miqdor</p>
              <p style="margin: 0; font-weight: 700; font-size: 16px; color: ${movement.type === 'out' ? '#dc2626' : '#059669'};">
                ${movement.type === 'out' ? '-' : '+'}${movement.quantity} ${movement.productName.includes('dona') ? 'dona' : ''}
              </p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">Oldingi qoldiq</p>
              <p style="margin: 0; font-weight: 600; font-size: 14px;">${movement.stockBefore}</p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">Yangi qoldiq</p>
              <p style="margin: 0; font-weight: 600; font-size: 14px;">${movement.stockAfter}</p>
            </div>
            ${movement.totalAmount > 0 ? `
              <div>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">Summa</p>
                <p style="margin: 0; font-weight: 700; font-size: 14px; color: #059669;">${formatMoney(movement.totalAmount)}</p>
              </div>
            ` : ''}
          </div>
          
          ${movement.reason || movement.notes ? `
            <div style="margin-top: 12px; padding: 12px; background: #eff6ff; border-radius: 8px;">
              ${movement.reason ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #1e40af; font-weight: 600;">${movement.reason}</p>` : ''}
              ${movement.notes ? `<p style="margin: 0; font-size: 13px; color: #6b7280;">${movement.notes}</p>` : ''}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function closeStockMovementsModal() {
  document.getElementById('stockMovementsModal').classList.remove('active');
}
