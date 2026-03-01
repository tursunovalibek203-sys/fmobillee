// Barcha admin sahifalarga sidebar qo'shish

const fs = require('fs');
const path = require('path');

// Admin sahifalar ro'yxati
const adminPages = [
    'admin-dashboard.html',
    'admin-branches.html',
    'admin-cashiers.html',
    'admin-handovers.html',
    'admin-warehouse-branches.html',
    'admin-reports.html',
    'admin-notifications-new.html',
    'warehouse-pro.html',
    'warehouse-history.html',
    'warehouse-imei-search.html',
    'activity-log.html',
    'admin-branches-sales.html'
];

// Sidebar HTML (body boshiga qo'shiladi)
const sidebarHTML = `
    <!-- Mobile Menu Button -->
    <button class="mobile-menu-btn" onclick="toggleSidebar()" style="display: none; position: fixed; top: 20px; left: 20px; z-index: 1001; background: white; border: none; padding: 10px 15px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-size: 24px; cursor: pointer;">☰</button>
    <div class="sidebar-overlay" onclick="toggleSidebar()" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999;"></div>
    
    <!-- Sidebar -->
    <div class="admin-sidebar" style="width: 280px; background: white; box-shadow: 2px 0 10px rgba(0,0,0,0.1); position: fixed; left: 0; top: 0; height: 100vh; overflow-y: auto; z-index: 1000; transition: transform 0.3s;">
        <div class="sidebar-header" style="padding: 30px 20px; border-bottom: 2px solid #f3f4f6; background: linear-gradient(135deg, #667eea, #764ba2); color: white;">
            <div class="sidebar-logo" style="font-size: 24px; font-weight: 700; margin-bottom: 10px;">🏪 ADMIN PANEL</div>
            <div class="sidebar-user" style="font-size: 14px; opacity: 0.9;">👤 Administrator</div>
        </div>
        
        <div class="sidebar-menu" style="padding: 20px 0;">
            <a href="admin-super-dashboard.html" class="menu-item" style="padding: 15px 20px; color: #374151; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <span class="menu-icon" style="font-size: 20px; width: 24px; text-align: center;">📊</span>
                <span class="menu-label" style="font-weight: 600; font-size: 14px;">Super Dashboard</span>
            </a>
            <a href="admin-dashboard.html" class="menu-item" style="padding: 15px 20px; color: #374151; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <span class="menu-icon" style="font-size: 20px; width: 24px; text-align: center;">🏠</span>
                <span class="menu-label" style="font-weight: 600; font-size: 14px;">Asosiy Dashboard</span>
            </a>
            <a href="admin-branches.html" class="menu-item" style="padding: 15px 20px; color: #374151; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <span class="menu-icon" style="font-size: 20px; width: 24px; text-align: center;">🏢</span>
                <span class="menu-label" style="font-weight: 600; font-size: 14px;">Filiallar</span>
            </a>
            <a href="admin-cashiers.html" class="menu-item" style="padding: 15px 20px; color: #374151; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <span class="menu-icon" style="font-size: 20px; width: 24px; text-align: center;">👥</span>
                <span class="menu-label" style="font-weight: 600; font-size: 14px;">Kassirlar</span>
            </a>
            <a href="warehouse-pro.html" class="menu-item" style="padding: 15px 20px; color: #374151; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <span class="menu-icon" style="font-size: 20px; width: 24px; text-align: center;">📦</span>
                <span class="menu-label" style="font-weight: 600; font-size: 14px;">Ombor</span>
            </a>
            <a href="admin-warehouse-branches.html" class="menu-item" style="padding: 15px 20px; color: #374151; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <span class="menu-icon" style="font-size: 20px; width: 24px; text-align: center;">🏭</span>
                <span class="menu-label" style="font-weight: 600; font-size: 14px;">Filial Omborlari</span>
            </a>
            <a href="warehouse-history.html" class="menu-item" style="padding: 15px 20px; color: #374151; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <span class="menu-icon" style="font-size: 20px; width: 24px; text-align: center;">📋</span>
                <span class="menu-label" style="font-weight: 600; font-size: 14px;">Ombor Tarixi</span>
            </a>
            <a href="admin-handovers.html" class="menu-item" style="padding: 15px 20px; color: #374151; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <span class="menu-icon" style="font-size: 20px; width: 24px; text-align: center;">💰</span>
                <span class="menu-label" style="font-weight: 600; font-size: 14px;">Kirim Berish</span>
            </a>
            <a href="admin-reports.html" class="menu-item" style="padding: 15px 20px; color: #374151; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <span class="menu-icon" style="font-size: 20px; width: 24px; text-align: center;">📈</span>
                <span class="menu-label" style="font-weight: 600; font-size: 14px;">Hisobotlar</span>
            </a>
            <a href="admin-notifications-new.html" class="menu-item" style="padding: 15px 20px; color: #374151; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <span class="menu-icon" style="font-size: 20px; width: 24px; text-align: center;">🔔</span>
                <span class="menu-label" style="font-weight: 600; font-size: 14px;">Bildirishnomalar</span>
            </a>
            <a href="activity-log.html" class="menu-item" style="padding: 15px 20px; color: #374151; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <span class="menu-icon" style="font-size: 20px; width: 24px; text-align: center;">📝</span>
                <span class="menu-label" style="font-weight: 600; font-size: 14px;">Faoliyat Tarixi</span>
            </a>
        </div>
        
        <div class="sidebar-footer" style="padding: 20px; border-top: 2px solid #f3f4f6; position: sticky; bottom: 0; background: white;">
            <button class="logout-btn" onclick="logout()" style="width: 100%; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                🚪 Chiqish
            </button>
        </div>
    </div>
`;

// Sidebar CSS (style tagiga qo'shiladi)
const sidebarCSS = `
        /* Sidebar Styles */
        .menu-item:hover {
            background: #f3f4f6 !important;
            color: #667eea !important;
        }
        
        .menu-item.active {
            background: linear-gradient(135deg, #667eea, #764ba2) !important;
            color: white !important;
        }
        
        .logout-btn:hover {
            background: #dc2626 !important;
        }
        
        /* Main Content Wrapper */
        body {
            display: flex !important;
        }
        
        body > .container,
        body > .dashboard,
        body > div:not(.admin-sidebar):not(.sidebar-overlay):not(.mobile-menu-btn) {
            margin-left: 280px !important;
            flex: 1 !important;
        }
        
        /* Mobile */
        @media (max-width: 768px) {
            .admin-sidebar {
                transform: translateX(-100%) !important;
            }
            
            .admin-sidebar.active {
                transform: translateX(0) !important;
            }
            
            body > .container,
            body > .dashboard,
            body > div:not(.admin-sidebar):not(.sidebar-overlay):not(.mobile-menu-btn) {
                margin-left: 0 !important;
            }
            
            .mobile-menu-btn {
                display: block !important;
            }
            
            .sidebar-overlay.active {
                display: block !important;
            }
        }
`;

// Sidebar JavaScript
const sidebarJS = `
    <script>
        // Toggle Sidebar (Mobile)
        function toggleSidebar() {
            document.querySelector('.admin-sidebar').classList.toggle('active');
            document.querySelector('.sidebar-overlay').classList.toggle('active');
        }
        
        // Logout
        function logout() {
            if (confirm('Tizimdan chiqmoqchimisiz?')) {
                localStorage.removeItem('adminData');
                localStorage.removeItem('adminToken');
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

console.log('🚀 Barcha admin sahifalarga sidebar qo\'shilmoqda...\n');

let successCount = 0;
let errorCount = 0;

adminPages.forEach(page => {
    const filePath = path.join(__dirname, 'public', page);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${page} - Fayl topilmadi`);
            errorCount++;
            return;
        }
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Agar sidebar allaqachon bo'lsa, o'tkazib yuborish
        if (content.includes('admin-sidebar') || content.includes('ADMIN PANEL')) {
            console.log(`✅ ${page} - Sidebar allaqachon mavjud`);
            successCount++;
            return;
        }
        
        // CSS qo'shish
        content = content.replace('</style>', sidebarCSS + '\n    </style>');
        
        // HTML qo'shish (body tagidan keyin)
        content = content.replace('<body>', '<body>\n' + sidebarHTML);
        
        // JavaScript qo'shish (body yopilishidan oldin)
        content = content.replace('</body>', sidebarJS + '\n</body>');
        
        // Faylni saqlash
        fs.writeFileSync(filePath, content, 'utf8');
        
        console.log(`✅ ${page} - Sidebar qo\'shildi`);
        successCount++;
        
    } catch (error) {
        console.log(`❌ ${page} - Xato: ${error.message}`);
        errorCount++;
    }
});

console.log(`\n📊 Natija:`);
console.log(`✅ Muvaffaqiyatli: ${successCount}`);
console.log(`❌ Xato: ${errorCount}`);
console.log(`📝 Jami: ${adminPages.length}`);
