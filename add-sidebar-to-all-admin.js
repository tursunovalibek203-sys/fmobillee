// Script to add sidebar to all admin pages

const fs = require('fs');
const path = require('path');

// Sidebar HTML
const sidebarHTML = `
    <!-- Mobile Menu Button -->
    <button class="mobile-menu-btn" onclick="toggleSidebar()">☰</button>
    <div class="sidebar-overlay" onclick="toggleSidebar()"></div>
    
    <!-- Sidebar -->
    <div class="sidebar">
        <div class="sidebar-header">
            <div class="sidebar-logo">🏪 ADMIN PANEL</div>
            <div class="sidebar-user">👤 Administrator</div>
        </div>
        
        <div class="sidebar-menu">
            <a href="admin-super-dashboard.html" class="menu-item">
                <span class="menu-icon">📊</span>
                <span class="menu-label">Super Dashboard</span>
            </a>
            <a href="admin-dashboard.html" class="menu-item">
                <span class="menu-icon">🏠</span>
                <span class="menu-label">Asosiy Dashboard</span>
            </a>
            <a href="admin-branches.html" class="menu-item">
                <span class="menu-icon">🏢</span>
                <span class="menu-label">Filiallar</span>
            </a>
            <a href="admin-cashiers.html" class="menu-item">
                <span class="menu-icon">👥</span>
                <span class="menu-label">Kassirlar</span>
            </a>
            <a href="warehouse-pro.html" class="menu-item">
                <span class="menu-icon">📦</span>
                <span class="menu-label">Ombor</span>
            </a>
            <a href="admin-warehouse-branches.html" class="menu-item">
                <span class="menu-icon">🏭</span>
                <span class="menu-label">Filial Omborlari</span>
            </a>
            <a href="warehouse-history.html" class="menu-item">
                <span class="menu-icon">📋</span>
                <span class="menu-label">Ombor Tarixi</span>
            </a>
            <a href="admin-handovers.html" class="menu-item">
                <span class="menu-icon">💰</span>
                <span class="menu-label">Kirim Berish</span>
            </a>
            <a href="admin-reports.html" class="menu-item">
                <span class="menu-icon">📈</span>
                <span class="menu-label">Hisobotlar</span>
            </a>
            <a href="admin-notifications-new.html" class="menu-item">
                <span class="menu-icon">🔔</span>
                <span class="menu-label">Bildirishnomalar</span>
            </a>
            <a href="activity-log.html" class="menu-item">
                <span class="menu-icon">📝</span>
                <span class="menu-label">Faoliyat Tarixi</span>
            </a>
        </div>
        
        <div class="sidebar-footer">
            <button class="logout-btn" onclick="logout()">
                🚪 Chiqish
            </button>
        </div>
    </div>
`;

// Sidebar CSS
const sidebarCSS = `
        /* Sidebar */
        .sidebar {
            width: 280px;
            background: white;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            overflow-y: auto;
            z-index: 1000;
            transition: transform 0.3s;
        }
        
        .sidebar-header {
            padding: 30px 20px;
            border-bottom: 2px solid #f3f4f6;
        }
        
        .sidebar-logo {
            font-size: 24px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .sidebar-user {
            color: #6b7280;
            font-size: 14px;
        }
        
        .sidebar-menu {
            padding: 20px 0;
        }
        
        .menu-item {
            padding: 15px 20px;
            color: #374151;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.2s;
            cursor: pointer;
        }
        
        .menu-item:hover {
            background: #f3f4f6;
            color: #667eea;
        }
        
        .menu-item.active {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }
        
        .menu-icon {
            font-size: 20px;
            width: 24px;
            text-align: center;
        }
        
        .menu-label {
            font-weight: 600;
            font-size: 14px;
        }
        
        .sidebar-footer {
            padding: 20px;
            border-top: 2px solid #f3f4f6;
            position: absolute;
            bottom: 0;
            width: 100%;
            background: white;
        }
        
        .logout-btn {
            width: 100%;
            padding: 12px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .logout-btn:hover {
            background: #dc2626;
        }
        
        /* Main Content Wrapper */
        body {
            display: flex;
        }
        
        .main-wrapper {
            margin-left: 280px;
            flex: 1;
            min-height: 100vh;
        }
        
        .container {
            padding: 20px;
        }
        
        /* Mobile */
        .mobile-menu-btn {
            display: none;
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1001;
            background: white;
            border: none;
            padding: 10px 15px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-size: 24px;
            cursor: pointer;
        }
        
        .sidebar-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        }
        
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
            }
            
            .sidebar.active {
                transform: translateX(0);
            }
            
            .main-wrapper {
                margin-left: 0;
            }
            
            .mobile-menu-btn {
                display: block;
            }
            
            .sidebar-overlay.active {
                display: block;
            }
        }
`;

// Sidebar JavaScript
const sidebarJS = `
    <script>
        // Toggle Sidebar (Mobile)
        function toggleSidebar() {
            document.querySelector('.sidebar').classList.toggle('active');
            document.querySelector('.sidebar-overlay').classList.toggle('active');
        }
        
        // Logout
        function logout() {
            if (confirm('Tizimdan chiqmoqchimisiz?')) {
                localStorage.removeItem('adminData');
                window.location.href = 'index.html';
            }
        }
        
        // Set active menu item
        document.addEventListener('DOMContentLoaded', () => {
            const currentPage = window.location.pathname.split('/').pop();
            document.querySelectorAll('.menu-item').forEach(item => {
                if (item.getAttribute('href') === currentPage) {
                    item.classList.add('active');
                }
            });
        });
    </script>
`;

console.log('✅ Sidebar HTML, CSS va JS tayyor!');
console.log('📝 Endi bu kodni admin sahifalarga qo'shish kerak.');
