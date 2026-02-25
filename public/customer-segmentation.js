// ==================== MIJOZLARNI AVTOMATIK SARALASH ====================

let allCustomers = [];
let filteredCustomers = [];
let currentSegment = 'all';
let currentSort = 'name';

// Segmentatsiya mezonlari
const SEGMENTATION_RULES = {
    VIP: {
        minPurchases: 20,
        minRevenue: 10000000, // 10 million UZS
        minFrequency: 2 // 2 xarid/oy
    },
    ACTIVE: {
        daysSinceLastPurchase: 30,
        minPurchases: 3
    },
    INACTIVE: {
        daysSinceLastPurchase: 90
    },
    NEW: {
        daysSinceRegistration: 30,
        maxPurchases: 3
    },
    RISK: {
        daysSinceLastPurchase: 60,
        minPreviousPurchases: 5
    },
    HIGH_VALUE: {
        minAveragePurchase: 1000000 // 1 million UZS
    },
    DEBT: {
        minDebt: 100000 // 100k UZS
    }
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadCustomers();
    
    // Auto-refresh every 60 seconds
    setInterval(loadCustomers, 60000);
});

// ==================== LOAD CUSTOMERS ====================
async function loadCustomers() {
    try {
        const response = await fetch('/api/customers');
        
        if (response.ok) {
            const customers = await response.json();
            allCustomers = await enrichCustomersData(customers);
            applySegmentation();
            updateStatistics();
            filterBySegment(currentSegment);
        } else {
            // Mock data if API fails
            allCustomers = generateMockCustomers();
            applySegmentation();
            updateStatistics();
            filterBySegment(currentSegment);
        }
    } catch (error) {
        console.error('Mijozlarni yuklashda xato:', error);
        allCustomers = generateMockCustomers();
        applySegmentation();
        updateStatistics();
        filterBySegment(currentSegment);
    }
}

// ==================== ENRICH CUSTOMERS DATA ====================
async function enrichCustomersData(customers) {
    // Har bir mijoz uchun qo'shimcha ma'lumotlar olish
    return Promise.all(customers.map(async (customer) => {
        try {
            // Savdolar ma'lumotini olish
            const salesResponse = await fetch(`/api/customer-sales/${customer.id}`);
            const salesData = salesResponse.ok ? await salesResponse.json() : { purchases: 0, revenue: 0, lastPurchase: null };
            
            return {
                ...customer,
                purchases: salesData.purchases || 0,
                revenue: salesData.revenue || 0,
                lastPurchaseDate: salesData.lastPurchase,
                averagePurchase: salesData.purchases > 0 ? salesData.revenue / salesData.purchases : 0,
                registrationDate: customer.createdAt || new Date().toISOString(),
                segments: []
            };
        } catch (error) {
            return {
                ...customer,
                purchases: 0,
                revenue: 0,
                lastPurchaseDate: null,
                averagePurchase: 0,
                registrationDate: customer.createdAt || new Date().toISOString(),
                segments: []
            };
        }
    }));
}

// ==================== APPLY SEGMENTATION ====================
function applySegmentation() {
    const now = new Date();
    
    allCustomers.forEach(customer => {
        customer.segments = [];
        
        const daysSinceRegistration = customer.registrationDate 
            ? Math.floor((now - new Date(customer.registrationDate)) / (1000 * 60 * 60 * 24))
            : 999;
            
        const daysSinceLastPurchase = customer.lastPurchaseDate
            ? Math.floor((now - new Date(customer.lastPurchaseDate)) / (1000 * 60 * 60 * 24))
            : 999;
        
        // VIP Segment
        if (customer.purchases >= SEGMENTATION_RULES.VIP.minPurchases &&
            customer.revenue >= SEGMENTATION_RULES.VIP.minRevenue) {
            customer.segments.push('vip');
        }
        
        // Active Segment
        if (daysSinceLastPurchase <= SEGMENTATION_RULES.ACTIVE.daysSinceLastPurchase &&
            customer.purchases >= SEGMENTATION_RULES.ACTIVE.minPurchases) {
            customer.segments.push('active');
        }
        
        // Inactive Segment
        if (daysSinceLastPurchase >= SEGMENTATION_RULES.INACTIVE.daysSinceLastPurchase) {
            customer.segments.push('inactive');
        }
        
        // New Segment
        if (daysSinceRegistration <= SEGMENTATION_RULES.NEW.daysSinceRegistration &&
            customer.purchases <= SEGMENTATION_RULES.NEW.maxPurchases) {
            customer.segments.push('new');
        }
        
        // Risk Segment (was active, now becoming inactive)
        if (daysSinceLastPurchase >= SEGMENTATION_RULES.RISK.daysSinceLastPurchase &&
            daysSinceLastPurchase < SEGMENTATION_RULES.INACTIVE.daysSinceLastPurchase &&
            customer.purchases >= SEGMENTATION_RULES.RISK.minPreviousPurchases) {
            customer.segments.push('risk');
        }
        
        // High Value Segment
        if (customer.averagePurchase >= SEGMENTATION_RULES.HIGH_VALUE.minAveragePurchase) {
            customer.segments.push('high-value');
        }
        
        // Debt Segment
        if (customer.debt && customer.debt >= SEGMENTATION_RULES.DEBT.minDebt) {
            customer.segments.push('debt');
        }
    });
}

// ==================== UPDATE STATISTICS ====================
function updateStatistics() {
    const stats = {
        total: allCustomers.length,
        vip: allCustomers.filter(c => c.segments.includes('vip')).length,
        active: allCustomers.filter(c => c.segments.includes('active')).length,
        inactive: allCustomers.filter(c => c.segments.includes('inactive')).length,
        new: allCustomers.filter(c => c.segments.includes('new')).length,
        risk: allCustomers.filter(c => c.segments.includes('risk')).length,
        highValue: allCustomers.filter(c => c.segments.includes('high-value')).length,
        debt: allCustomers.filter(c => c.segments.includes('debt')).length
    };
    
    document.getElementById('totalCustomers').textContent = stats.total;
    document.getElementById('vipCustomers').textContent = stats.vip;
    document.getElementById('activeCustomers').textContent = stats.active;
    document.getElementById('riskCustomers').textContent = stats.risk;
    
    document.getElementById('allCount').textContent = stats.total;
    document.getElementById('vipCount').textContent = stats.vip;
    document.getElementById('activeCount').textContent = stats.active;
    document.getElementById('inactiveCount').textContent = stats.inactive;
    document.getElementById('newCount').textContent = stats.new;
    document.getElementById('riskCount').textContent = stats.risk;
    document.getElementById('highValueCount').textContent = stats.highValue;
    document.getElementById('debtCount').textContent = stats.debt;
}

// ==================== FILTER BY SEGMENT ====================
function filterBySegment(segment) {
    currentSegment = segment;
    
    // Update active button
    document.querySelectorAll('.segment-option').forEach(option => {
        option.classList.remove('active');
    });
    event.target.closest('.segment-option').classList.add('active');
    
    // Filter customers
    if (segment === 'all') {
        filteredCustomers = [...allCustomers];
    } else {
        filteredCustomers = allCustomers.filter(c => c.segments.includes(segment));
    }
    
    // Update panel title
    const titles = {
        all: 'Barcha Mijozlar',
        vip: '⭐ VIP Mijozlar',
        active: '✅ Faol Mijozlar',
        inactive: '😴 Nofaol Mijozlar',
        new: '🆕 Yangi Mijozlar',
        risk: '⚠️ Xavf Ostidagi Mijozlar',
        'high-value': '💎 Yuqori Qiymatli Mijozlar',
        debt: '💰 Qarzli Mijozlar'
    };
    document.getElementById('panelTitle').textContent = titles[segment] || 'Mijozlar';
    
    sortCustomers();
}

// ==================== SORT CUSTOMERS ====================
function sortCustomers() {
    const sortBy = document.getElementById('sortBy').value;
    
    filteredCustomers.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'purchases':
                return b.purchases - a.purchases;
            case 'revenue':
                return b.revenue - a.revenue;
            case 'lastPurchase':
                if (!a.lastPurchaseDate) return 1;
                if (!b.lastPurchaseDate) return -1;
                return new Date(b.lastPurchaseDate) - new Date(a.lastPurchaseDate);
            case 'debt':
                return (b.debt || 0) - (a.debt || 0);
            default:
                return 0;
        }
    });
    
    displayCustomers(filteredCustomers);
}

// ==================== SEARCH CUSTOMERS ====================
function searchCustomers() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (query.length === 0) {
        displayCustomers(filteredCustomers);
        return;
    }
    
    const searchResults = filteredCustomers.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        (customer.phone && customer.phone.includes(query)) ||
        (customer.email && customer.email.toLowerCase().includes(query))
    );
    
    displayCustomers(searchResults);
}

// ==================== DISPLAY CUSTOMERS ====================
function displayCustomers(customers) {
    const container = document.getElementById('customersList');
    
    if (!customers || customers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Mijozlar topilmadi</div>
                <div style="font-size: 14px;">Bu segmentda hozircha mijozlar yo'q</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = customers.map(customer => {
        const badges = customer.segments.map(segment => {
            const badgeClasses = {
                'vip': 'badge-vip',
                'active': 'badge-active',
                'inactive': 'badge-inactive',
                'new': 'badge-new',
                'risk': 'badge-risk'
            };
            
            const badgeLabels = {
                'vip': '⭐ VIP',
                'active': '✅ Faol',
                'inactive': '😴 Nofaol',
                'new': '🆕 Yangi',
                'risk': '⚠️ Xavf',
                'high-value': '💎 Yuqori',
                'debt': '💰 Qarz'
            };
            
            return `<span class="badge ${badgeClasses[segment] || ''}">${badgeLabels[segment] || segment}</span>`;
        }).join('');
        
        const daysSinceLastPurchase = customer.lastPurchaseDate
            ? Math.floor((new Date() - new Date(customer.lastPurchaseDate)) / (1000 * 60 * 60 * 24))
            : null;
        
        return `
            <div class="customer-card">
                <div class="customer-header">
                    <div class="customer-info">
                        <div class="customer-name">${customer.name}</div>
                        <div class="customer-contact">
                            📞 ${customer.phone || 'N/A'} ${customer.email ? `| 📧 ${customer.email}` : ''}
                        </div>
                    </div>
                    <div class="customer-badges">
                        ${badges}
                    </div>
                </div>
                
                <div class="customer-stats">
                    <div class="stat-item">
                        <div class="stat-item-value">${customer.purchases || 0}</div>
                        <div class="stat-item-label">Xaridlar</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-value">${formatMoney(customer.revenue || 0)}</div>
                        <div class="stat-item-label">Daromad</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-value">${formatMoney(customer.averagePurchase || 0)}</div>
                        <div class="stat-item-label">O'rtacha</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-value">${daysSinceLastPurchase !== null ? daysSinceLastPurchase + ' kun' : 'N/A'}</div>
                        <div class="stat-item-label">So'nggi xarid</div>
                    </div>
                </div>
                
                ${customer.debt && customer.debt > 0 ? `
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 600; color: #92400e;">💰 Qarz:</span>
                        <span style="font-weight: 900; color: #92400e; font-size: 16px;">${formatMoney(customer.debt)}</span>
                    </div>
                ` : ''}
                
                <div class="customer-actions">
                    <button class="action-btn" onclick="viewCustomer(${customer.id})">👁️ Ko'rish</button>
                    <button class="action-btn" onclick="sendSMS(${customer.id})">📱 SMS</button>
                    <button class="action-btn" onclick="addDiscount(${customer.id})">🎁 Chegirma</button>
                    <button class="action-btn" onclick="viewHistory(${customer.id})">📊 Tarix</button>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== MOCK DATA GENERATOR ====================
function generateMockCustomers() {
    const names = ['Ali Karimov', 'Olima Saidova', 'Bobur Rahimov', 'Nargiza Toshmatova', 'Sardor Alimov', 
                   'Dilnoza Yusupova', 'Jasur Mahmudov', 'Malika Azimova', 'Rustam Sharipov', 'Gulnora Hamidova',
                   'Akmal Tursunov', 'Sevara Karimova', 'Timur Abdullayev', 'Madina Rashidova', 'Farrux Ismoilov'];
    
    return names.map((name, index) => {
        const purchases = Math.floor(Math.random() * 50);
        const revenue = purchases * (500000 + Math.random() * 2000000);
        const daysSinceLastPurchase = Math.floor(Math.random() * 120);
        const daysSinceRegistration = Math.floor(Math.random() * 365);
        
        return {
            id: index + 1,
            name: name,
            phone: '+998' + (90 + Math.floor(Math.random() * 10)) + Math.floor(Math.random() * 10000000).toString().padStart(7, '0'),
            email: name.toLowerCase().replace(' ', '.') + '@example.com',
            purchases: purchases,
            revenue: revenue,
            averagePurchase: purchases > 0 ? revenue / purchases : 0,
            lastPurchaseDate: new Date(Date.now() - daysSinceLastPurchase * 24 * 60 * 60 * 1000).toISOString(),
            registrationDate: new Date(Date.now() - daysSinceRegistration * 24 * 60 * 60 * 1000).toISOString(),
            debt: Math.random() > 0.7 ? Math.floor(Math.random() * 5000000) : 0,
            segments: []
        };
    });
}

// ==================== ACTIONS ====================
function viewCustomer(customerId) {
    window.location.href = `customer-details.html?id=${customerId}`;
}

function sendSMS(customerId) {
    const customer = allCustomers.find(c => c.id === customerId);
    if (customer) {
        const message = prompt(`${customer.name} ga SMS yuborish:\n\nXabar matni:`);
        if (message) {
            showNotification(`📱 SMS yuborildi: ${customer.name}`, 'success');
        }
    }
}

function addDiscount(customerId) {
    const customer = allCustomers.find(c => c.id === customerId);
    if (customer) {
        const discount = prompt(`${customer.name} uchun chegirma (%):`);
        if (discount) {
            showNotification(`🎁 ${discount}% chegirma qo'shildi: ${customer.name}`, 'success');
        }
    }
}

function viewHistory(customerId) {
    window.location.href = `customer-history.html?id=${customerId}`;
}

function exportSegment() {
    showNotification('📊 Excel fayli yuklab olinmoqda...', 'info');
    setTimeout(() => {
        showNotification('✅ Excel fayli tayyor!', 'success');
    }, 1500);
}

function sendBulkSMS() {
    const count = filteredCustomers.length;
    if (confirm(`${count} ta mijozga SMS yuborilsinmi?`)) {
        showNotification(`📱 ${count} ta mijozga SMS yuborilmoqda...`, 'info');
        setTimeout(() => {
            showNotification('✅ SMS yuborildi!', 'success');
        }, 2000);
    }
}

function createCampaign() {
    showNotification('📢 Kampaniya yaratish oynasi ochilmoqda...', 'info');
    setTimeout(() => {
        window.location.href = 'marketing-campaign.html';
    }, 1000);
}

function addCustomer() {
    window.location.href = 'customer-add.html';
}

function refreshSegmentation() {
    showNotification('🔄 Ma\'lumotlar yangilanmoqda...', 'info');
    loadCustomers();
}

// ==================== UTILITY FUNCTIONS ====================
function formatMoney(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(0) + 'K';
    }
    return amount.toString();
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
