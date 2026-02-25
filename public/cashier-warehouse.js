// Kassir Warehouse Script (Read-Only)
const API_URL = window.location.origin + '/api';

let cashierData = null;
let allProducts = [];
let filteredProducts = [];
let categories = [];
let currentPage = 1;
const itemsPerPage = 20;

// ==================== INIT ====================

async function init() {
  // Login tekshiruvi
  if (localStorage.getItem('cashierLoggedIn') !== 'true') {
    window.location.href = '/cashier-login.html';
    return;
  }
  
  cashierData = JSON.parse(localStorage.getItem('cashierData'));
  document.getElementById('cashierName').textContent = `${cashierData.name}`;
  
  await loadProducts();
  await loadCategories();
}

// ==================== LOAD DATA ====================

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/warehouse/products`);
    const data = await response.json();
    
    if (data.success) {
      allProducts = data.products || [];
      filteredProducts = [...allProducts];
      updateStatistics();
      renderProducts();
    }
  } catch (error) {
    console.error('Mahsulotlar yuklash xatosi:', error);
    document.getElementById('productsTableBody').innerHTML = 
      '<div style="padding: 40px; text-align: center; color: #dc2626;">❌ Mahsulotlar yuklanmadi</div>';
  }
}

async function loadCategories() {
  try {
    const response = await fetch(`${API_URL}/warehouse/categories`);
    const data = await response.json();
    
    if (data.success) {
      categories = data.categories || [];
      renderCategoryFilter();
    }
  } catch (error) {
    console.error('Kategoriyalar yuklash xatosi:', error);
  }
}

// ==================== RENDER ====================

function renderCategoryFilter() {
  const select = document.getElementById('categoryFilter');
  select.innerHTML = '<option value="">Barcha kategoriyalar</option>';
  
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

function updateStatistics() {
  const totalProducts = allProducts.length;
  const totalStock = allProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = allProducts.reduce((sum, p) => sum + ((p.stock || 0) * (p.sellPrice || 0)), 0);
  const lowStock = allProducts.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5)).length;
  
  document.getElementById('totalProducts').textContent = totalProducts;
  document.getElementById('totalStock').textContent = totalStock;
  document.getElementById('totalValue').textContent = '$' + totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 });
  document.getElementById('lowStock').textContent = lowStock;
}

function renderProducts() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageProducts = filteredProducts.slice(start, end);
  
  const tbody = document.getElementById('productsTableBody');
  
  if (pageProducts.length === 0) {
    tbody.innerHTML = '<div style="padding: 40px; text-align: center; color: #6b7280;">Mahsulot topilmadi</div>';
    return;
  }
  
  tbody.innerHTML = pageProducts.map((product, index) => {
    const stock = product.stock || 0;
    const minStock = product.minStock || 5;
    
    let stockBadge = '';
    if (stock === 0) {
      stockBadge = '<span class="stock-badge stock-out">❌ Tugagan</span>';
    } else if (stock <= minStock) {
      stockBadge = '<span class="stock-badge stock-low">⚠️ Kam</span>';
    } else {
      stockBadge = '<span class="stock-badge stock-high">✅ Yetarli</span>';
    }
    
    return `
      <div class="table-row">
        <div>${start + index + 1}</div>
        <div data-label="Mahsulot">
          <div>
            <div style="font-weight: 700; color: #111827;">${product.name}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
              ${product.barcode ? '🏷️ ' + product.barcode : 'ID: ' + product.productId}
            </div>
          </div>
        </div>
        <div data-label="Kategoriya">
          <span style="background: #f3f4f6; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">
            ${product.category || 'Boshqa'}
          </span>
        </div>
        <div data-label="Narx">
          <span style="font-weight: 800; color: #059669; font-size: 16px;">
            $${(product.sellPrice || 0).toFixed(2)}
          </span>
        </div>
        <div data-label="Omborda">
          <span style="font-weight: 700; font-size: 16px;">
            ${stock} ${product.unit || 'dona'}
          </span>
        </div>
        <div data-label="Holat">
          ${stockBadge}
        </div>
      </div>
    `;
  }).join('');
  
  updatePagination();
}

function updatePagination() {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  document.getElementById('pageInfo').textContent = `${currentPage} / ${totalPages}`;
  
  document.getElementById('prevBtn').disabled = currentPage === 1;
  document.getElementById('nextBtn').disabled = currentPage === totalPages;
  
  document.getElementById('prevBtn').style.opacity = currentPage === 1 ? '0.5' : '1';
  document.getElementById('nextBtn').style.opacity = currentPage === totalPages ? '0.5' : '1';
}

// ==================== FILTER ====================

function filterProducts() {
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter').value;
  const stockFilter = document.getElementById('stockFilter').value;
  
  filteredProducts = allProducts.filter(product => {
    // Search filter
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchQuery)) ||
      product.productId.toString().includes(searchQuery);
    
    // Category filter
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    
    // Stock filter
    let matchesStock = true;
    if (stockFilter === 'available') {
      matchesStock = product.stock > (product.minStock || 5);
    } else if (stockFilter === 'low') {
      matchesStock = product.stock > 0 && product.stock <= (product.minStock || 5);
    } else if (stockFilter === 'out') {
      matchesStock = product.stock === 0;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });
  
  currentPage = 1;
  renderProducts();
}

// ==================== PAGINATION ====================

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ==================== START ====================

init();

// Auto refresh every 60 seconds
setInterval(loadProducts, 60000);
