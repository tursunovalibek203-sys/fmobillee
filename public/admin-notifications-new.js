// BILDIRISHNOMALAR - JavaScript

const API_URL = 'http://localhost:3000/api';

// Sahifa yuklanganda
document.addEventListener('DOMContentLoaded', () => {
    loadNotifications();
    loadStats();
    
    // Har 30 soniyada yangilash
    setInterval(() => {
        loadNotifications();
        loadStats();
    }, 30000);
});

// Bildirishnomalarni yuklash
async function loadNotifications() {
    try {
        const type = document.getElementById('filterType').value;
        const category = document.getElementById('filterCategory').value;
        const isRead = document.getElementById('filterRead').value;
        
        let url = `${API_URL}/notifications?limit=100`;
        if (type) url += `&type=${type}`;
        if (category) url += `&category=${category}`;
        if (isRead) url += `&isRead=${isRead}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displayNotifications(data.notifications);
        }
    } catch (error) {
        console.error('Bildirishnomalar yuklash xato:', error);
    }
}

// Statistikani yuklash
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/notifications/stats`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalNotifications').textContent = data.stats.total;
            document.getElementById('unreadNotifications').textContent = data.stats.unread;
            document.getElementById('readNotifications').textContent = data.stats.read;
            
            // Shoshilinch bildirishnomalar
            const urgent = data.stats.byPriority.find(p => p._id === 'urgent');
            document.getElementById('urgentNotifications').textContent = urgent ? urgent.count : 0;
        }
    } catch (error) {
        console.error('Statistika yuklash xato:', error);
    }
}

// Bildirishnomalarni ko'rsatish
function displayNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📭</div>
                <h3>Bildirishnomalar yo'q</h3>
                <p>Hozircha yangi bildirishnomalar mavjud emas</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    notifications.forEach(notification => {
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification ${notification.category} ${!notification.isRead ? 'unread' : ''}`;
        
        const priorityBadge = notification.priority !== 'normal' 
            ? `<span class="priority-badge priority-${notification.priority}">${getPriorityText(notification.priority)}</span>`
            : '';
        
        notificationEl.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">
                    ${notification.title}
                    ${priorityBadge}
                </div>
                <div class="notification-time">${notification.date} ${notification.time}</div>
            </div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-actions">
                ${!notification.isRead ? `<button class="btn-read" onclick="markAsRead(${notification.notificationId})">✅ O'qilgan</button>` : ''}
                ${notification.actionUrl ? `<button class="btn-action" onclick="goToAction('${notification.actionUrl}')">🔗 Ko'rish</button>` : ''}
                <button class="btn-delete" onclick="deleteNotification(${notification.notificationId})">🗑️ O'chirish</button>
            </div>
        `;
        
        container.appendChild(notificationEl);
    });
}

// Ustuvorlik matni
function getPriorityText(priority) {
    const texts = {
        'urgent': '🔴 Shoshilinch',
        'high': '🟠 Muhim',
        'normal': '🔵 Oddiy',
        'low': '⚪ Past'
    };
    return texts[priority] || priority;
}

// Bildirishnomani o'qilgan deb belgilash
async function markAsRead(notificationId) {
    try {
        const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                readBy: 'Admin'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadNotifications();
            loadStats();
        }
    } catch (error) {
        console.error('O\'qilgan deb belgilash xato:', error);
        alert('Xato yuz berdi!');
    }
}

// Barcha bildirishnomalarni o'qilgan deb belgilash
async function markAllAsRead() {
    if (!confirm('Barcha bildirishnomalarni o\'qilgan deb belgilaysizmi?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                readBy: 'Admin'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Barcha bildirishnomalar o\'qildi!');
            loadNotifications();
            loadStats();
        }
    } catch (error) {
        console.error('Barcha o\'qilgan deb belgilash xato:', error);
        alert('Xato yuz berdi!');
    }
}

// Bildirishnomani o'chirish
async function deleteNotification(notificationId) {
    if (!confirm('Bu bildirishnomani o\'chirasizmi?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadNotifications();
            loadStats();
        }
    } catch (error) {
        console.error('O\'chirish xato:', error);
        alert('Xato yuz berdi!');
    }
}

// Harakatga o'tish
function goToAction(url) {
    window.location.href = url;
}
