// Warehouse View Script (Read-only for Cashiers)
const API_URL = window.location.origin + '/api';

let allProducts = [];

// ==================== INIT ====================

async function init() {
  // Login tekshiruvi (kassir yoki admin)
  const isCashier = localStorage.getItem('cashierLoggedIn') === 'true';
  const isAdmin = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isCashier && !isAdmin) {
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
    
    // Kassir ma'lumotlarini olish
    const cashierData = JSON.parse(localStorage.getItem('cashierData') || '{}');
    const branchId = cashierData.branchId;
    
    // Agar kassir bo'lsa, faqat o'z filialining mahsulotlarini olish
    let url = `${API_URL}/warehouse/products`;
    if (branchId) {
      url += `?branchId=${branchId}`;
      console.log('Filial ID:', branchId);
    }
    
    console.log('API URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server javobi:', errorText);
      throw new Error(`Server xatosi: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Kelgan ma\'lumot:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Ma\'lumot yuklashda xatolik');
    }
    
    allProducts = data.products || [];
    console.log(`✅ ${allProducts.length} ta mahsulot yuklandi`);
    
    displayProducts(allProducts);
    
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

// ==================== DISPLAY ====================

function displayProducts(products) {
  const grid = document.getElementById('productsGrid');
  
  if (!products || products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: white; border-radius: 16px;">
        <p style="font-size: 48px; margin-bottom: 16px;">📦</p>
        <h3 style="color: #6b7280;">Mahsulotlar topilmadi</h3>
        <p style="color: #9ca3af; margin-top: 8px;">Omborda hozircha mahsulotlar yo'q</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = products.map(product => {
    const stockClass = product.stock > product.minStock ? 'stock-ok' : 'stock-low';
    const stockIcon = product.stock > product.minStock ? '✅' : '⚠️';
    
    return `
      <div class="product-card" onclick="showProductDetail(${product.productId})">
        <div class="product-name">${product.name}</div>
        <div class="product-info">📁 ${product.categoryName || 'Kategoriyasiz'}</div>
        <div class="product-info">💰 ${formatMoney(product.sellPrice)}</div>
        ${product.barcode ? `<div class="product-info">🏷️ ${product.barcode}</div>` : ''}
        <div class="product-stock ${stockClass}">
          ${stockIcon} ${product.stock} ${product.unit || 'dona'}
        </div>
      </div>
    `;
  }).join('');
}

// ==================== SEARCH ====================

function searchProducts() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  
  if (!query) {
    displayProducts(allProducts);
    return;
  }
  
  const filtered = allProducts.filter(product => {
    return (
      product.name.toLowerCase().includes(query) ||
      (product.barcode && product.barcode.toLowerCase().includes(query)) ||
      (product.categoryName && product.categoryName.toLowerCase().includes(query)) ||
      product.productId.toString().includes(query)
    );
  });
  
  displayProducts(filtered);
}

// ==================== PRODUCT DETAIL ====================

async function showProductDetail(productId) {
  try {
    const response = await fetch(`${API_URL}/warehouse/product/${productId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Mahsulot topilmadi');
    }
    
    const product = data.product;
    const stockClass = product.stock > product.minStock ? 'stock-ok' : 'stock-low';
    
    document.getElementById('detailProductName').textContent = `📦 ${product.name}`;
    document.getElementById('productDetailContent').innerHTML = `
      <div style="display: grid; gap: 16px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="background: #f3f4f6; padding: 16px; border-radius: 12px;">
            <p style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">Mahsulot ID</p>
            <p style="font-weight: 700; font-size: 16px;">${product.productId}</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 16px; border-radius: 12px;">
            <p style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">Kategoriya</p>
            <p style="font-weight: 700; font-size: 16px;">${product.categoryName || 'Kategoriyasiz'}</p>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="background: #dbeafe; padding: 16px; border-radius: 12px;">
            <p style="color: #1e40af; font-size: 13px; margin-bottom: 4px;">Sotish narxi</p>
            <p style="font-weight: 700; font-size: 18px; color: #1e40af;">${formatMoney(product.sellPrice)}</p>
          </div>
          
          <div style="background: #d1fae5; padding: 16px; border-radius: 12px;">
            <p style="color: #065f46; font-size: 13px; margin-bottom: 4px;">Sotib olish narxi</p>
            <p style="font-weight: 700; font-size: 18px; color: #065f46;">${formatMoney(product.buyPrice || 0)}</p>
          </div>
        </div>
        
        <div style="background: ${product.stock > product.minStock ? '#d1fae5' : '#fee2e2'}; padding: 20px; border-radius: 12px; text-align: center;">
          <p style="color: ${product.stock > product.minStock ? '#065f46' : '#991b1b'}; font-size: 14px; margin-bottom: 8px;">Omborda mavjud</p>
          <p style="font-weight: 700; font-size: 32px; color: ${product.stock > product.minStock ? '#059669' : '#dc2626'};">
            ${product.stock} ${product.unit || 'dona'}
          </p>
          <p style="color: #6b7280; font-size: 13px; margin-top: 8px;">Minimal: ${product.minStock} ${product.unit || 'dona'}</p>
        </div>
        
        ${product.barcode ? `
          <div style="background: #f3f4f6; padding: 16px; border-radius: 12px;">
            <p style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">Barcode</p>
            <p style="font-weight: 700; font-size: 16px; font-family: monospace;">${product.barcode}</p>
          </div>
        ` : ''}
        
        ${product.description ? `
          <div style="background: #f3f4f6; padding: 16px; border-radius: 12px;">
            <p style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">Tavsif</p>
            <p style="font-size: 14px; line-height: 1.6;">${product.description}</p>
          </div>
        ` : ''}
      </div>
    `;
    
    document.getElementById('productDetailModal').style.display = 'flex';
    
  } catch (error) {
    console.error('❌ Mahsulot ma\'lumotlarini yuklash xatosi:', error);
    alert('Mahsulot ma\'lumotlarini yuklashda xatolik: ' + error.message);
  }
}

function closeProductDetailModal() {
  document.getElementById('productDetailModal').style.display = 'none';
}

// ==================== HELPERS ====================

function formatMoney(amount) {
  // NaN va undefined tekshiruvi
  const num = parseFloat(amount);
  if (isNaN(num) || num === null || num === undefined) {
    return '$0.00';
  }
  
  return '$' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

function goBack() {
  const isCashier = localStorage.getItem('cashierLoggedIn') === 'true';
  if (isCashier) {
    window.location.href = '/cashier.html';
  } else {
    window.location.href = '/warehouse.html';
  }
}

// ==================== EVENT LISTENERS ====================

// Modal tashqarisiga bosilganda yopish
window.onclick = function(event) {
  const modal = document.getElementById('productDetailModal');
  if (event.target === modal) {
    closeProductDetailModal();
  }
};

// ESC tugmasi bilan yopish
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeProductDetailModal();
  }
});

// ==================== START ====================

document.addEventListener('DOMContentLoaded', init);
