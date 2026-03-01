// 📱 BARCHA HTML SAHIFALARGA MOBILE CSS QO'SHISH

const fs = require('fs');
const path = require('path');

console.log('🚀 MOBILE CSS QO\'SHISH BOSHLANDI\n');

// HTML fayllar ro'yxati
const htmlFiles = [
    // Admin
    'public/index.html',
    'public/admin-dashboard.html',
    'public/admin-reports.html',
    'public/admin-notifications.html',
    'public/admin-branches.html',
    'public/admin-cashiers.html',
    'public/admin-handovers.html',
    'public/admin-sales.html',
    'public/admin-analytics-pro.html',
    'public/admin-ultimate.html',
    'public/admin-simple.html',
    'public/admin-expenses.html',
    'public/admin-imei.html',
    
    // Kassir
    'public/cashier-new.html',
    'public/cashier-pro.html',
    'public/cashier-dashboard-pro.html',
    'public/cashier-enhanced.html',
    'public/cashier-advanced.html',
    'public/cashier-transactions.html',
    'public/cashier-quick-actions.html',
    'public/cashier-simple.html',
    'public/cashier-quick-sale.html',
    'public/cashier-daily-report.html',
    'public/cashier-dual-currency.html',
    'public/cashier-multi-currency.html',
    'public/cashier-auto-currency.html',
    'public/cashier-report.html',
    
    // Ombor
    'public/warehouse-pro.html',
    'public/warehouse-history.html',
    'public/warehouse-imei-search.html',
    'public/warehouse-items.html',
    
    // Finance
    'public/finance-dashboard.html',
    'public/finance-advanced-analytics.html',
    
    // Activity
    'public/activity-log.html',
    
    // Login
    'public/login.html',
    'public/login-ultra.html',
    
    // Other
    'public/customer-search.html',
    'public/customer-segmentation.html',
    'public/executive-dashboard.html',
    'public/realtime-dashboard.html'
];

// CSS mapping - qaysi sahifaga qaysi CSS
const cssMapping = {
    // Admin
    'index.html': ['mobile-universal.css', 'mobile-responsive.css', 'mobile-admin-sales.css'],
    'admin-dashboard.html': ['mobile-universal.css', 'mobile-admin-dashboard.css'],
    'admin-reports.html': ['mobile-universal.css', 'mobile-admin-reports.css'],
    'admin-notifications.html': ['mobile-universal.css', 'mobile-admin-notifications.css'],
    'admin-branches.html': ['mobile-universal.css', 'mobile-admin-branches.css'],
    'admin-cashiers.html': ['mobile-universal.css', 'mobile-admin-dashboard.css'],
    'admin-handovers.html': ['mobile-universal.css', 'mobile-admin-dashboard.css'],
    'admin-sales.html': ['mobile-universal.css', 'mobile-admin-sales.css'],
    'admin-analytics-pro.html': ['mobile-universal.css', 'mobile-admin-reports.css'],
    'admin-ultimate.html': ['mobile-universal.css', 'mobile-admin-dashboard.css'],
    'admin-simple.html': ['mobile-universal.css', 'mobile-admin-dashboard.css'],
    'admin-expenses.html': ['mobile-universal.css', 'mobile-finance.css'],
    'admin-imei.html': ['mobile-universal.css', 'mobile-admin-dashboard.css'],
    
    // Kassir
    'cashier-new.html': ['mobile-universal.css', 'mobile-cashier-new.css', 'mobile-cashier-complete.css'],
    'cashier-pro.html': ['mobile-universal.css', 'mobile-cashier-complete.css'],
    'cashier-dashboard-pro.html': ['mobile-universal.css', 'mobile-cashier-complete.css'],
    'cashier-enhanced.html': ['mobile-universal.css', 'mobile-cashier-complete.css'],
    'cashier-advanced.html': ['mobile-universal.css', 'mobile-cashier-complete.css'],
    'cashier-transactions.html': ['mobile-universal.css', 'mobile-cashier-complete.css'],
    'cashier-quick-actions.html': ['mobile-universal.css', 'mobile-cashier-complete.css'],
    'cashier-simple.html': ['mobile-universal.css', 'mobile-cashier-complete.css'],
    'cashier-quick-sale.html': ['mobile-universal.css', 'mobile-cashier-complete.css'],
    'cashier-daily-report.html': ['mobile-universal.css', 'mobile-cashier-complete.css'],
    'cashier-dual-currency.html': ['mobile-universal.css', 'mobile-cashier-complete.css'],
    'cashier-multi-currency.html': ['mobile-universal.css', 'mobile-cashier-complete.css'],
    'cashier-auto-currency.html': ['mobile-universal.css', 'mobile-cashier-complete.css'],
    'cashier-report.html': ['mobile-universal.css', 'mobile-cashier-complete.css'],
    
    // Ombor
    'warehouse-pro.html': ['mobile-universal.css', 'mobile-warehouse-pro.css', 'mobile-warehouse-complete.css'],
    'warehouse-history.html': ['mobile-universal.css', 'mobile-warehouse-complete.css'],
    'warehouse-imei-search.html': ['mobile-universal.css', 'mobile-warehouse-complete.css'],
    'warehouse-items.html': ['mobile-universal.css', 'mobile-warehouse-complete.css'],
    
    // Finance
    'finance-dashboard.html': ['mobile-universal.css', 'mobile-finance.css'],
    'finance-advanced-analytics.html': ['mobile-universal.css', 'mobile-finance.css'],
    
    // Activity
    'activity-log.html': ['mobile-universal.css', 'mobile-activity-log.css'],
    
    // Login
    'login.html': ['mobile-universal.css', 'mobile-login.css'],
    'login-ultra.html': ['mobile-universal.css', 'mobile-login.css'],
    
    // Other
    'customer-search.html': ['mobile-universal.css', 'mobile-admin-dashboard.css'],
    'customer-segmentation.html': ['mobile-universal.css', 'mobile-admin-dashboard.css'],
    'executive-dashboard.html': ['mobile-universal.css', 'mobile-admin-dashboard.css'],
    'realtime-dashboard.html': ['mobile-universal.css', 'mobile-admin-dashboard.css']
};

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

// Har bir HTML faylni qayta ishlash
htmlFiles.forEach(filePath => {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⏭️  O'tkazib yuborildi: ${filePath} (fayl topilmadi)`);
            skipCount++;
            return;
        }
        
        let content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        const cssFiles = cssMapping[fileName] || ['mobile-universal.css'];
        
        // Allaqachon qo'shilganmi tekshirish
        if (content.includes('mobile-universal.css')) {
            console.log(`✅ Allaqachon qo'shilgan: ${fileName}`);
            skipCount++;
            return;
        }
        
        // </head> dan oldin CSS qo'shish
        const cssLinks = cssFiles.map(css => 
            `  <link rel="stylesheet" href="${css}">`
        ).join('\n');
        
        const jsLink = `  <script src="mobile-enhancements.js"></script>`;
        
        // </head> topish
        if (content.includes('</head>')) {
            content = content.replace(
                '</head>',
                `\n  <!-- Mobile Responsive CSS -->\n${cssLinks}\n${jsLink}\n</head>`
            );
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Qo'shildi: ${fileName} (${cssFiles.length} CSS)`);
            successCount++;
        } else {
            console.log(`⚠️  </head> topilmadi: ${fileName}`);
            errorCount++;
        }
        
    } catch (error) {
        console.log(`❌ Xato: ${filePath} - ${error.message}`);
        errorCount++;
    }
});

// Natija
console.log('\n' + '='.repeat(60));
console.log('\n📊 NATIJA\n');
console.log(`✅ Muvaffaqiyatli: ${successCount}`);
console.log(`⏭️  O'tkazib yuborildi: ${skipCount}`);
console.log(`❌ Xatolar: ${errorCount}`);
console.log(`📁 Jami fayllar: ${htmlFiles.length}`);

if (successCount > 0) {
    console.log('\n🎉 MOBILE CSS MUVAFFAQIYATLI QO\'SHILDI!');
    console.log('\n📱 Endi barcha sahifalar telefonda ishlaydi!');
} else if (skipCount === htmlFiles.length) {
    console.log('\n✅ BARCHA FAYLLAR ALLAQACHON TAYYOR!');
} else {
    console.log('\n⚠️  BA\'ZI FAYLLAR QAYTA ISHLANMADI!');
}

console.log('\n' + '='.repeat(60));
