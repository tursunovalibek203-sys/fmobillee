// ==================== KASSIR TARIX YAXSHILANGAN PANEL ====================

let currentPage = 1;
const itemsPerPage = 20;
let totalPages = 1;
let allSales = [];
let filteredSales = [];
let cashierData = {};
let currentCurrency = 'USD';
let exchangeRate = 12800;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadCashierInfo();
    setDefaultDates();
    loadHistoryData();
    
    // Add event listeners for real-time filtering
    document.getElementById('customerSearch').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('productSearch').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('minAmount').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('maxAmount').addEventListener('input', debounce(applyFilters, 300));
});

// ==================== CASHIER INFO ====================
async function loadCashierInfo() {
    try {
        const cashierId = localStorage.getItem('cashierId');
        if (!cashierId) {
            window.location.href = 'cashier-login.html';
            return;
        }

        const response = await fetch(`/api/cashier/${cashierId}`);
        if (response.ok) {
            cashierData = await response.json();
            document.getElementById('cashierInfo').textContent = 
                `Kassir: ${cashierData.name} | Filial: ${cashierData.branchId}`;
        }
    } catch (error) {
        console.error('Kassir ma\'lumotlarini yuklashda xato:', error);
    }
}

// ==================== DATE FUNCTIONS ====================
function setDefaultDates() {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(today.getMonth() - 1);
    
    document.getElementById('dateFrom').value = monthAgo.toISOString().split('T')[0];
    document.getElementById('dateTo').value = today.toISOString().split('T')[0];
}

function setQuickFilter(period) {
    const today = new Date();
    let fromDate = new Date();
    
    switch (period) {
        case 'today':
            fromDate = new Date(today);
            break;
        case 'week':
            fromDate.setDate(today.getDate() - 7);
            break;
        case 'month':
            fromDate.setMonth(today.getMonth() - 1);
            break;
    }
    
    document.getElementById('dateFrom').value = fromDate.toISOString().split('T')[0];
    document.getElementById('dateTo').value = today.toISOString().split('T')[0];
    
    applyFilters();
}

// ==================== DATA LOADING ====================
async function loadHistoryData() {
    try {
        const cashierId = localStorage.getItem('cashierId');
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        
        showLoading();
        
        const response = await fetch(`/api/cashier-sales/${cashierId}?from=${dateFrom}&to=${dateTo}&detailed=true`);
        
        if (response.ok) {
            const data = await response.json();
            allSales = data.sales || [];
            filteredSales = [...allSales];
            
            updateStats();
            displayHistory();
            updatePagination();
        } else {
            throw new Error('Ma\'lumotlarni yuklashda xato');
        }
        
    } catch (error) {
        console.error('Tarix ma\'lumotlarini yuklashda xato:', error);
        showError('Ma\'lumotlarni yuklashda xato yuz berdi');
    }
}

// ==================== FILTERING ====================
function applyFilters() {
    const customerSearch = document.getElementById('customerSearch').value.toLowerCase().trim();
    const productSearch = document.getElementById('productSearch').value.toLowerCase().trim();
    const typeFilter = document.getElementById('typeFilter').value;
    const minAmount = parseFloat(document.getElementById('minAmount').value) || 0;
    const maxAmount = parseFloat(document.getElementById('maxAmount').value) || Infinity;
    const currencyFilter = document.getElementById('currencyFilter').value;
    
    filteredSales = allSales.filter(sale => {
        // Customer filter
        if (customerSearch && !sale.customerName.toLowerCase().includes(customerSearch)) {
            return false;
        }
        
        // Product filter
        if (productSearch && !sale.product.toLowerCase().includes(productSearch)) {
            return false;
        }
        
        // Type filter
        if (typeFilter && sale.type !== typeFilter) {
            return false;
        }
        
        // Amount filter
        const saleAmount = parseFloat(sale.price) || 0;
        if (saleAmount < minAmount || saleAmount > maxAmount) {
            return false;
        }
        
        // Currency filter
        if (currencyFilter && sale.currency !== currencyFilter) {
            return false;
        }
        
        return true;
    });
    
    currentPage = 1;
    updateStats();
    displayHistory();
    updatePagination();
}

function clearFilters() {
    document.getElementById('customerSearch').value = '';
    document.getElementById('productSearch').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('minAmount').value = '';
    document.getElementById('maxAmount').value = '';
    document.getElementById('currencyFilter').value = '';
    
    filteredSales = [...allSales];
    currentPage = 1;
    updateStats();
    displayHistory();
    updatePagination();
}

// ==================== DISPLAY FUNCTIONS ====================
function displayHistory() {
    const container = document.getElementById('historyTableBody');
    
    if (filteredSales.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #6b7280;">
                <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Ma'lumotlar topilmadi</div>
                <div>Filtrlarni o'zgartirib ko'ring yoki boshqa sana oralig'ini tanlang</div>
            </div>
        `;
        return;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredSales.slice(startIndex, endIndex);
    
    container.innerHTML = pageData.map(sale => `
        <div class="table-row">
            <div>
                <span class="type-badge type-${sale.type || 'sale'}">
                    ${getTypeIcon(sale.type)} ${getTypeName(sale.type)}
                </span>
            </div>
            <div style="font-weight: 600;">${sale.customerName}</div>
            <div>${sale.product}</div>
            <div style="font-weight: 600; color: #059669;">${formatMoney(sale.price, sale.currency)}</div>
            <div style="font-weight: 600; color: ${sale.paid >= sale.price ? '#059669' : '#dc2626'};">
                ${formatMoney(sale.paid, sale.currency)}
            </div>
            <div style="font-weight: 600; color: ${getDebtAmount(sale) > 0 ? '#dc2626' : '#6b7280'};">
                ${formatMoney(getDebtAmount(sale), sale.currency)}
            </div>
            <div>${formatDate(sale.date)}</div>
            <div>${sale.time}</div>
        </div>
    `).join('');
}

function updateStats() {
    const totalSales = filteredSales.length;
    const totalAmount = filteredSales.reduce((sum, sale) => sum + (Number(sale.price) || 0), 0);
    const avgAmount = totalSales > 0 ? totalAmount / totalSales : 0;
    const maxAmount = totalSales > 0 ? Math.max(...filteredSales.map(sale => parseFloat(sale.price) || 0)) : 0;
    
    document.getElementById('totalSales').textContent = totalSales.toLocaleString();
    document.getElementById('totalAmount').textContent = formatMoney(totalAmount);
    document.getElementById('avgAmount').textContent = formatMoney(avgAmount);
    document.getElementById('maxAmount').textContent = formatMoney(maxAmount);
}

// ==================== PAGINATION ====================
function updatePagination() {
    totalPages = Math.ceil(filteredSales.length / itemsPerPage);
    
    document.getElementById('pageInfo').textContent = `${currentPage} / ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage <= 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayHistory();
        updatePagination();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        displayHistory();
        updatePagination();
    }
}

// ==================== EXPORT FUNCTIONS ====================
async function exportToExcel() {
    try {
        showNotification('📊 Excel fayli tayyorlanmoqda...', 'info');
        
        const cashierId = localStorage.getItem('cashierId');
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        
        const response = await fetch('/api/export/cashier-sales-excel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cashierId,
                dateFrom,
                dateTo,
                sales: filteredSales
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Kassir_Savdolar_${dateFrom}_${dateTo}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showNotification('✅ Excel fayli yuklab olindi!', 'success');
        } else {
            throw new Error('Export qilishda xato');
        }
        
    } catch (error) {
        console.error('Excel export xatosi:', error);
        showNotification('❌ Excel export qilishda xato', 'error');
    }
}

async function exportToCSV() {
    try {
        const csvContent = generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `Kassir_Savdolar_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('✅ CSV fayli yuklab olindi!', 'success');
        
    } catch (error) {
        console.error('CSV export xatosi:', error);
        showNotification('❌ CSV export qilishda xato', 'error');
    }
}

function generateCSV() {
    const headers = ['Tur', 'Mijoz', 'Mahsulot', 'Narx', 'To\'lov', 'Qarz', 'Sana', 'Vaqt'];
    const rows = filteredSales.map(sale => [
        getTypeName(sale.type),
        sale.customerName,
        sale.product,
        sale.price,
        sale.paid,
        getDebtAmount(sale),
        sale.date,
        sale.time
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    return '\uFEFF' + csvContent; // Add BOM for UTF-8
}

async function exportToPDF() {
    try {
        showNotification('📋 PDF fayli tayyorlanmoqda...', 'info');
        
        // This would require a PDF library like jsPDF
        // For now, we'll show a placeholder
        showNotification('🚧 PDF export tez orada qo\'shiladi', 'info');
        
    } catch (error) {
        console.error('PDF export xatosi:', error);
        showNotification('❌ PDF export qilishda xato', 'error');
    }
}

function printReport() {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent();
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

function generatePrintContent() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Kassir Savdolar Hisoboti</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
                .stat { text-align: center; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total-row { font-weight: bold; background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Kassir Savdolar Hisoboti</h1>
                <p>Kassir: ${cashierData.name} | Filial: ${cashierData.branchId}</p>
                <p>Davr: ${formatDate(dateFrom)} - ${formatDate(dateTo)}</p>
            </div>
            
            <div class="stats">
                <div class="stat">
                    <h3>${filteredSales.length}</h3>
                    <p>Jami savdolar</p>
                </div>
                <div class="stat">
                    <h3>${formatMoney(filteredSales.reduce((sum, sale) => sum + (Number(sale.price) || 0), 0))}</h3>
                    <p>Jami summa</p>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Tur</th>
                        <th>Mijoz</th>
                        <th>Mahsulot</th>
                        <th>Narx</th>
                        <th>To'lov</th>
                        <th>Qarz</th>
                        <th>Sana</th>
                        <th>Vaqt</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredSales.map(sale => `
                        <tr>
                            <td>${getTypeName(sale.type)}</td>
                            <td>${sale.customerName}</td>
                            <td>${sale.product}</td>
                            <td>${formatMoney(sale.price, sale.currency)}</td>
                            <td>${formatMoney(sale.paid, sale.currency)}</td>
                            <td>${formatMoney(getDebtAmount(sale), sale.currency)}</td>
                            <td>${formatDate(sale.date)}</td>
                            <td>${sale.time}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
}

// ==================== UTILITY FUNCTIONS ====================
function formatMoney(amount, currency = 'USD') {
    const numAmount = parseFloat(amount) || 0;
    
    if (currency === 'UZS') {
        return new Intl.NumberFormat('uz-UZ').format(numAmount) + ' so\'m';
    } else {
        return '$' + numAmount.toFixed(2);
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('uz-UZ');
}

function getTypeIcon(type) {
    switch (type) {
        case 'payment': return '💰';
        case 'debt': return '📋';
        default: return '🛒';
    }
}

function getTypeName(type) {
    switch (type) {
        case 'payment': return 'To\'lov';
        case 'debt': return 'Qarz';
        default: return 'Savdo';
    }
}

function getDebtAmount(sale) {
    const price = parseFloat(sale.price) || 0;
    const paid = parseFloat(sale.paid) || 0;
    return Math.max(0, price - paid);
}

function showLoading() {
    document.getElementById('historyTableBody').innerHTML = `
        <div style="padding: 40px; text-align: center; color: #6b7280;">
            <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
            <div>Ma'lumotlar yuklanmoqda...</div>
        </div>
    `;
}

function showError(message) {
    document.getElementById('historyTableBody').innerHTML = `
        <div style="padding: 40px; text-align: center; color: #dc2626;">
            <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Xato yuz berdi</div>
            <div>${message}</div>
        </div>
    `;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    `;
    
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

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

function refreshData() {
    loadHistoryData();
    showNotification('🔄 Ma\'lumotlar yangilandi', 'info');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);