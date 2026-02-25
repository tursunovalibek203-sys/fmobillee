// ==================== ADMIN NOTIFICATIONS CENTER ====================

let allNotifications = [];
let filteredNotifications = [];
let currentFilter = 'all';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadNotifications();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        loadNotifications();
    }, 30000);
});

// ==================== LOAD NOTIFICATIONS ====================
async function loadNotifications() {
    try {
        const response = await fetch('/api/admin/notifications');
        
        if (response.ok) {
            allNotifications = await response.json();
            applyFilter(currentFilter);
            updateStatistics();
            updateFilterCounts();
        } else {
            // Mock data if API fails
            allNotifications = generateMockNotifications();
            applyFilter(currentFilter);
            updateStatistics();
            updateFilterCounts();
        }
    } catch (error) {
        console.error('Bildirishnomalarni yuklashda xato:', error);
        
        // Use mock data
        allNotifications = generateMockNotifications();
        applyFilter(currentFilter);
        updateStatistics();
        updateFilterCounts();
    }
}

function generateMockNotifications() {
    return [
        {
            id: 1,
            type: 'critical',
            title: 'Tizim Xavfsizligi',
            message: 'Noto\'g\'ri parol kiritish urinishlari aniqlandi. IP: 192.168.1.105',
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            type: 'warning',
            title: 'Kam Qolgan Mahsulot',
            message: 'iPhone 15 Pro mahsuloti omborda tugamoqda. Qolgan: 3 dona',
            read: false,
            createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            type: 'info',
            title: 'Yangi Mijoz',
            message: 'Olima Toshmatova yangi mijoz sifatida ro\'yxatdan o\'tdi',
            read: true,
            createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        },
        {
            id: 4,
            type: 'success',
            title: 'Backup Muvaffaqiyatli',
            message: 'Kunlik ma\'lumotlar zaxirasi muvaffaqiyatli yaratildi',
            read: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 5,
            type: 'critical',
            title: 'Katta Qarz',
            message: 'Ali Karimov mijozining qarzi $5,000 dan oshdi',
            read: false,
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 6,
            type: 'warning',
            title: 'Kassir Xatosi',
            message: 'Bobur Kassir tomonidan noto\'g\'ri summa kiritildi',
            read: false,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 7,
            type: 'info',
            title: 'Yangi Savdo',
            message: 'Nargiza Manager tomonidan $2,500 lik savdo amalga oshirildi',
            read: true,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 8,
            type: 'success',
            title: 'To\'lov Qabul Qilindi',
            message: 'Sardor Rahimov $1,200 to\'lovni amalga oshirdi',
            read: true,
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
    ];
}

// ==================== DISPLAY NOTIFICATIONS ====================
function displayNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    
    if (!notifications || notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Bildirishnomalar yo'q</div>
                <div style="font-size: 14px;">Hozircha yangi bildirishnomalar mavjud emas</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notifications.map(notification => {
        const icon = getNotificationIcon(notification.type);
        const timeAgo = formatTimeAgo(notification.createdAt);
        const unreadClass = notification.read ? '' : 'unread';
        const typeClass = notification.type;
        
        return `
            <div class="notification-item ${unreadClass} ${typeClass}">
                <div class="notification-icon ${notification.type}">
                    ${icon}
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-meta">
                        <div class="notification-time">
                            🕐 ${timeAgo}
                        </div>
                        <div class="notification-actions">
                            ${!notification.read ? `
                                <button class="action-btn" onclick="markAsRead(${notification.id})">
                                    ✓ O'qilgan
                                </button>
                            ` : ''}
                            <button class="action-btn" onclick="deleteNotification(${notification.id})">
                                🗑️ O'chirish
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getNotificationIcon(type) {
    switch (type) {
        case 'critical': return '🚨';
        case 'warning': return '⚠️';
        case 'success': return '✅';
        case 'info': return 'ℹ️';
        default: return '📢';
    }
}

// ==================== FILTER FUNCTIONS ====================
function filterNotifications(filter) {
    currentFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-option').forEach(option => {
        option.classList.remove('active');
    });
    event.target.closest('.filter-option').classList.add('active');
    
    applyFilter(filter);
}

function applyFilter(filter) {
    switch (filter) {
        case 'all':
            filteredNotifications = allNotifications;
            break;
        case 'unread':
            filteredNotifications = allNotifications.filter(n => !n.read);
            break;
        case 'critical':
            filteredNotifications = allNotifications.filter(n => n.type === 'critical');
            break;
        case 'warning':
            filteredNotifications = allNotifications.filter(n => n.type === 'warning');
            break;
        case 'info':
            filteredNotifications = allNotifications.filter(n => n.type === 'info');
            break;
        case 'success':
            filteredNotifications = allNotifications.filter(n => n.type === 'success');
            break;
        default:
            filteredNotifications = allNotifications;
    }
    
    displayNotifications(filteredNotifications);
}

// ==================== STATISTICS ====================
function updateStatistics() {
    const total = allNotifications.length;
    const unread = allNotifications.filter(n => !n.read).length;
    const critical = allNotifications.filter(n => n.type === 'critical').length;
    const today = allNotifications.filter(n => isToday(n.createdAt)).length;
    
    document.getElementById('totalNotifications').textContent = total;
    document.getElementById('unreadNotifications').textContent = unread;
    document.getElementById('criticalNotifications').textContent = critical;
    document.getElementById('todayNotifications').textContent = today;
}

function updateFilterCounts() {
    const all = allNotifications.length;
    const unread = allNotifications.filter(n => !n.read).length;
    const critical = allNotifications.filter(n => n.type === 'critical').length;
    const warning = allNotifications.filter(n => n.type === 'warning').length;
    const info = allNotifications.filter(n => n.type === 'info').length;
    const success = allNotifications.filter(n => n.type === 'success').length;
    
    document.getElementById('allCount').textContent = all;
    document.getElementById('unreadCount').textContent = unread;
    document.getElementById('criticalCount').textContent = critical;
    document.getElementById('warningCount').textContent = warning;
    document.getElementById('infoCount').textContent = info;
    document.getElementById('successCount').textContent = success;
}

// ==================== ACTIONS ====================
async function markAsRead(notificationId) {
    try {
        const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            // Update local data
            const notification = allNotifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
            }
            
            applyFilter(currentFilter);
            updateStatistics();
            updateFilterCounts();
            
            showNotification('✅ Bildirishnoma o\'qilgan deb belgilandi', 'success');
        } else {
            showNotification('❌ Xatolik yuz berdi', 'error');
        }
    } catch (error) {
        console.error('Bildirishnomani o\'qilgan deb belgilashda xato:', error);
        showNotification('❌ Xatolik yuz berdi', 'error');
    }
}

async function deleteNotification(notificationId) {
    if (!confirm('Haqiqatan ham bu bildirishnomani o\'chirmoqchimisiz?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/notifications/${notificationId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Remove from local data
            allNotifications = allNotifications.filter(n => n.id !== notificationId);
            
            applyFilter(currentFilter);
            updateStatistics();
            updateFilterCounts();
            
            showNotification('✅ Bildirishnoma o\'chirildi', 'success');
        } else {
            showNotification('❌ Xatolik yuz berdi', 'error');
        }
    } catch (error) {
        console.error('Bildirishnomani o\'chirishda xato:', error);
        showNotification('❌ Xatolik yuz berdi', 'error');
    }
}

async function markAllAsRead() {
    if (!confirm('Barcha bildirishnomalarni o\'qilgan deb belgilaysizmi?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/notifications/mark-all-read', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            // Update all local notifications
            allNotifications.forEach(n => n.read = true);
            
            applyFilter(currentFilter);
            updateStatistics();
            updateFilterCounts();
            
            showNotification('✅ Barcha bildirishnomalar o\'qilgan deb belgilandi', 'success');
        } else {
            showNotification('❌ Xatolik yuz berdi', 'error');
        }
    } catch (error) {
        console.error('Barcha bildirishnomalarni o\'qilgan deb belgilashda xato:', error);
        showNotification('❌ Xatolik yuz berdi', 'error');
    }
}

async function createNotification() {
    const type = prompt('Bildirishnoma turi (critical/warning/info/success):');
    if (!type) return;
    
    const title = prompt('Sarlavha:');
    if (!title) return;
    
    const message = prompt('Xabar:');
    if (!message) return;
    
    try {
        const response = await fetch('/api/admin/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type, title, message })
        });
        
        if (response.ok) {
            await loadNotifications();
            showNotification('✅ Yangi bildirishnoma yaratildi', 'success');
        } else {
            showNotification('❌ Xatolik yuz berdi', 'error');
        }
    } catch (error) {
        console.error('Bildirishnoma yaratishda xato:', error);
        showNotification('❌ Xatolik yuz berdi', 'error');
    }
}

function refreshNotifications() {
    loadNotifications();
    showNotification('🔄 Bildirishnomalar yangilandi', 'info');
}

// ==================== QUICK ACTIONS ====================
async function checkSystemHealth() {
    const notification = {
        type: 'info',
        title: 'Tizim Holati Tekshirilmoqda',
        message: 'Tizim holati tekshirilmoqda...'
    };
    
    showNotification('🖥️ Tizim holati tekshirilmoqda...', 'info');
    
    // Simulate system check
    setTimeout(() => {
        const newNotification = {
            id: Date.now(),
            type: 'success',
            title: 'Tizim Holati',
            message: 'Tizim normal ishlayapti. Barcha xizmatlar faol.',
            read: false,
            createdAt: new Date().toISOString()
        };
        
        allNotifications.unshift(newNotification);
        applyFilter(currentFilter);
        updateStatistics();
        updateFilterCounts();
        
        showNotification('✅ Tizim holati yaxshi', 'success');
    }, 1500);
}

async function checkLowStock() {
    showNotification('📦 Kam qolgan mahsulotlar tekshirilmoqda...', 'info');
    
    // Simulate stock check
    setTimeout(() => {
        const newNotification = {
            id: Date.now(),
            type: 'warning',
            title: 'Kam Qolgan Mahsulotlar',
            message: '5 ta mahsulot omborda tugamoqda: iPhone 15 Pro (3), Samsung S24 (2), MacBook Air (1), AirPods Pro (4), iPad Air (2)',
            read: false,
            createdAt: new Date().toISOString()
        };
        
        allNotifications.unshift(newNotification);
        applyFilter(currentFilter);
        updateStatistics();
        updateFilterCounts();
        
        showNotification('⚠️ 5 ta mahsulot kam qolgan', 'warning');
    }, 1500);
}

async function checkHighDebts() {
    showNotification('💰 Katta qarzlar tekshirilmoqda...', 'info');
    
    // Simulate debt check
    setTimeout(() => {
        const newNotification = {
            id: Date.now(),
            type: 'critical',
            title: 'Katta Qarzlar',
            message: '3 ta mijozning qarzi $3,000 dan oshgan: Ali Karimov ($5,200), Olima Saidova ($4,100), Bobur Rahimov ($3,500)',
            read: false,
            createdAt: new Date().toISOString()
        };
        
        allNotifications.unshift(newNotification);
        applyFilter(currentFilter);
        updateStatistics();
        updateFilterCounts();
        
        showNotification('🚨 3 ta mijozda katta qarz', 'error');
    }, 1500);
}

async function checkCashierErrors() {
    showNotification('⚠️ Kassir xatolari tekshirilmoqda...', 'info');
    
    // Simulate error check
    setTimeout(() => {
        const newNotification = {
            id: Date.now(),
            type: 'warning',
            title: 'Kassir Xatolari',
            message: 'Bugun 2 ta kassir xatosi aniqlandi: Noto\'g\'ri summa kiritish (1), Chegirma xatosi (1)',
            read: false,
            createdAt: new Date().toISOString()
        };
        
        allNotifications.unshift(newNotification);
        applyFilter(currentFilter);
        updateStatistics();
        updateFilterCounts();
        
        showNotification('⚠️ 2 ta kassir xatosi topildi', 'warning');
    }, 1500);
}

// ==================== UTILITY FUNCTIONS ====================
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return `${seconds} soniya oldin`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} soat oldin`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} kun oldin`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} hafta oldin`;
    
    const months = Math.floor(days / 30);
    return `${months} oy oldin`;
}

function isToday(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
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
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
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
