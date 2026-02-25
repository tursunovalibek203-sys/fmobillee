// Cashier Advanced JavaScript
let cashierData = null;
let products = [];
let recentSales = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadCashierData();
  loadProducts();
  loadRecentSales();
  loadStatistics();
  
  // Auto refresh every 30 seconds
  setInterval(() => {
    loadRecentSales();
    loadStatistics();
  }, 30000);
});

// Load cashier data from localStorage
function loadCashierData() {
  const cashier = JSON.parse(localStorage.getItem('currentCashier'));
  
  if (!cashier) {
    alert('⚠️ Kassir ma\'lumotlari topilmadi!');
    window.location.href = '/cashier-login.html';
    return;
  }
  
  cashierData = cashier;
  document.getElementById('cashierName').textContent = cashier.name;
  document.getElementById('cashierBalance').textContent = `$${(cashier.balance || 0).toFixed(2)}`;
}

// Load products
async function loadProducts() {
  try {
    const branchId = cashierData?.branchId || 0;
    const response = await fetch(`/api/products?branchId=${branchId}`);
    const data = await response.json();
    
    products = data;
    
    const select = document.getElementById('productSelect');
    select.innerHTML = '<option value="">Mahsulot tanlang</option>';
    
    data.forEach(product => {
      const option = document.createElement('option');
      option.value = product.productId;
      option.textContent = `${product.name} - $${product.sellPrice} (${product.stock} dona)`;
      option.dataset.price = product.sellPrice;
      option.dataset.stock = product.stock;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Mahsulotlar yuklashda xato:', error);
  }
}

// Load recent sales
async function loadRecentSales() {
  try {
    const response = await fetch(`/api/cashier-sales?cashierId=${cashierData.cashierId}&limit=10`);
    const data = await response.json();
    
    recentSales = data.sales || [];
    displayRecentSales();
  } catch (error) {
    console.error('Savdolar yuklashda xato:', error);
  }
}

// Display recent sales
function displayRecentSales() {
  const container = document.getElementById('recentSales');
  
  if (recentSales.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Hozircha savdolar yo\'q</p>';
    return;
  }
  
  container.innerHTML = recentSales.map(sale => `
    <div class="sale-item">
      <div class="sale-info">
        <div class="sale-customer">${sale.customerName || 'Walk-in'}</div>
        <div class="sale-product">${sale.product} x${sale.quantity || 1}</div>
        <div class="sale-time">${sale.time} - ${sale.date}</div>
      </div>
      <div>
        <div class="sale-amount">$${sale.price.toFixed(2)}</div>
        ${sale.paid < sale.price ? `<div style="color: #e74c3c; font-size: 12px;">Qarz: $${(sale.price - sale.paid).toFixed(2)}</div>` : ''}
      </div>
    </div>
  `).join('');
}

// Load statistics
async function loadStatistics() {
  try {
    const today = new Date().toLocaleDateString('uz-UZ');
    const response = await fetch(`/api/cashier-stats?cashierId=${cashierData.cashierId}&date=${today}`);
    const data = await response.json();
    
    document.getElementById('todaySales').textContent = data.totalSales || 0;
    document.getElementById('todayRevenue').textContent = `$${(data.totalRevenue || 0).toFixed(0)}`;
    document.getElementById('todayPayments').textContent = data.totalPayments || 0;
    document.getElementById('todayCustomers').textContent = data.uniqueCustomers || 0;
  } catch (error) {
    console.error('Statistika yuklashda xato:', error);
  }
}

// Modal functions
function openSaleModal() {
  document.getElementById('saleModal').classList.add('active');
}

function closeSaleModal() {
  document.getElementById('saleModal').classList.remove('active');
  document.getElementById('saleForm').reset();
}

function openPaymentModal() {
  document.getElementById('paymentModal').classList.add('active');
}

function closePaymentModal() {
  document.getElementById('paymentModal').classList.remove('active');
  document.getElementById('paymentForm').reset();
}

function openReturnModal() {
  document.getElementById('returnModal').classList.add('active');
}

function closeReturnModal() {
  document.getElementById('returnModal').classList.remove('active');
  document.getElementById('returnForm').reset();
}

function openHandoverModal() {
  document.getElementById('handoverModal').classList.add('active');
}

function closeHandoverModal() {
  document.getElementById('handoverModal').classList.remove('active');
  document.getElementById('handoverForm').reset();
}

// Product select change
document.getElementById('productSelect')?.addEventListener('change', function() {
  const option = this.options[this.selectedIndex];
  if (option.dataset.price) {
    document.getElementById('price').value = option.dataset.price;
    document.getElementById('paid').value = option.dataset.price;
  }
});

// Search customer
async function searchCustomer() {
  const customerId = document.getElementById('customerId').value;
  
  if (!customerId) {
    alert('⚠️ Mijoz ID kiriting!');
    return;
  }
  
  try {
    const response = await fetch(`/api/customers/search/${customerId}`);
    const data = await response.json();
    
    if (data.success && data.customer) {
      const customer = data.customer;
      const infoDiv = document.getElementById('customerInfo');
      const infoText = document.getElementById('customerInfoText');
      
      let info = `✅ Mijoz: ${customer.name}`;
      if (customer.phone) info += ` | 📱 ${customer.phone}`;
      if (customer.totalDebt > 0) {
        info += ` | ⚠️ Qarz: $${customer.totalDebt.toFixed(2)}`;
      }
      
      infoText.textContent = info;
      infoDiv.style.display = 'block';
    } else {
      alert('❌ Mijoz topilmadi!');
      document.getElementById('customerInfo').style.display = 'none';
    }
  } catch (error) {
    console.error('Mijoz qidirishda xato:', error);
    alert('❌ Mijoz qidirishda xato yuz berdi!');
  }
}

// Submit sale
async function submitSale(event) {
  event.preventDefault();
  
  const customerId = document.getElementById('customerId').value;
  const productId = document.getElementById('productSelect').value;
  const quantity = parseInt(document.getElementById('quantity').value);
  const price = parseFloat(document.getElementById('price').value);
  const paid = parseFloat(document.getElementById('paid').value);
  
  const product = products.find(p => p.productId == productId);
  
  if (!product) {
    alert('❌ Mahsulot topilmadi!');
    return;
  }
  
  if (product.stock < quantity) {
    alert(`❌ Omborda yetarli mahsulot yo'q! (Mavjud: ${product.stock})`);
    return;
  }
  
  // Mijozni tekshirish
  let customerName = 'Walk-in';
  if (customerId) {
    try {
      const customerResponse = await fetch(`/api/customers/search/${customerId}`);
      const customerData = await customerResponse.json();
      
      if (customerData.success && customerData.customer) {
        customerName = customerData.customer.name;
      } else {
        if (!confirm(`⚠️ Mijoz ID ${customerId} topilmadi. Davom etasizmi?`)) {
          return;
        }
      }
    } catch (error) {
      console.error('Mijoz tekshirishda xato:', error);
    }
  }
  
  try {
    const saleData = {
      cashierId: cashierData.cashierId,
      cashierName: cashierData.name,
      branchId: cashierData.branchId,
      customerId: customerId ? parseInt(customerId) : 0,
      customerName: customerName,
      product: product.name,
      quantity: quantity,
      price: price,
      paid: paid,
      paidUSD: paid,
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ')
    };
    
    const response = await fetch('/api/cashier-sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ Savdo muvaffaqiyatli saqlandi!');
      closeSaleModal();
      loadRecentSales();
      loadStatistics();
      loadCashierData();
    } else {
      alert('❌ Xato: ' + result.error);
    }
  } catch (error) {
    console.error('Savdo saqlashda xato:', error);
    alert('❌ Savdo saqlashda xato yuz berdi!');
  }
}

// Submit payment
async function submitPayment(event) {
  event.preventDefault();
  
  const customerId = document.getElementById('paymentCustomerId').value;
  const amount = parseFloat(document.getElementById('paymentAmount').value);
  const note = document.getElementById('paymentNote').value;
  
  try {
    const paymentData = {
      cashierId: cashierData.cashierId,
      cashierName: cashierData.name,
      branchId: cashierData.branchId,
      customerId: parseInt(customerId),
      product: 'To\'lov',
      price: 0,
      paid: amount,
      paidUSD: amount,
      type: 'payment',
      notes: note,
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ')
    };
    
    const response = await fetch('/api/cashier-sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ To\'lov muvaffaqiyatli qabul qilindi!');
      closePaymentModal();
      loadRecentSales();
      loadStatistics();
    } else {
      alert('❌ Xato: ' + result.error);
    }
  } catch (error) {
    console.error('To\'lov saqlashda xato:', error);
    alert('❌ To\'lov saqlashda xato yuz berdi!');
  }
}

// Submit return
async function submitReturn(event) {
  event.preventDefault();
  
  const saleId = document.getElementById('returnSaleId').value;
  const reason = document.getElementById('returnReason').value;
  const note = document.getElementById('returnNote').value;
  
  try {
    const returnData = {
      saleId: parseInt(saleId),
      cashierId: cashierData.cashierId,
      reason: reason,
      note: note,
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ')
    };
    
    const response = await fetch('/api/cashier-returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(returnData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ Qaytarish muvaffaqiyatli amalga oshirildi!');
      closeReturnModal();
      loadRecentSales();
      loadStatistics();
    } else {
      alert('❌ Xato: ' + result.error);
    }
  } catch (error) {
    console.error('Qaytarish saqlashda xato:', error);
    alert('❌ Qaytarish amalga oshirilmadi!');
  }
}

// Submit handover
async function submitHandover(event) {
  event.preventDefault();
  
  const amount = parseFloat(document.getElementById('handoverAmount').value);
  const note = document.getElementById('handoverNote').value;
  
  if (amount > cashierData.balance) {
    alert('❌ Balansingizda yetarli mablag\' yo\'q!');
    return;
  }
  
  if (!confirm(`Adminga $${amount.toFixed(2)} kirim berasizmi?`)) {
    return;
  }
  
  try {
    const handoverData = {
      cashierId: cashierData.cashierId,
      cashierName: cashierData.name,
      branchId: cashierData.branchId,
      amount: amount,
      balanceBefore: cashierData.balance,
      balanceAfter: cashierData.balance - amount,
      notes: note,
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ')
    };
    
    const response = await fetch('/api/cashier-handovers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(handoverData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ Kirim muvaffaqiyatli berildi!');
      closeHandoverModal();
      loadCashierData();
      loadStatistics();
    } else {
      alert('❌ Xato: ' + result.error);
    }
  } catch (error) {
    console.error('Kirim berishda xato:', error);
    alert('❌ Kirim berishda xato yuz berdi!');
  }
}
