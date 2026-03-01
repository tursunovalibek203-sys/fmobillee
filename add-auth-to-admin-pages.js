// Barcha admin sahifalarga authentication qo'shish

const fs = require('fs');
const path = require('path');

const adminPages = [
    'admin-super-dashboard.html',
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

const authScript = '<script src="admin-auth-check.js"></script>';

console.log('🔐 Barcha admin sahifalarga authentication qo\'shilmoqda...\n');

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
        
        // Agar auth script allaqachon bo'lsa, o'tkazib yuborish
        if (content.includes('admin-auth-check.js')) {
            console.log(`✅ ${page} - Auth allaqachon mavjud`);
            successCount++;
            return;
        }
        
        // Auth script ni head tagiga qo'shish (boshqa scriptlardan oldin)
        content = content.replace('</head>', '    ' + authScript + '\n</head>');
        
        // Faylni saqlash
        fs.writeFileSync(filePath, content, 'utf8');
        
        console.log(`✅ ${page} - Auth qo\'shildi`);
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

if (successCount === adminPages.length) {
    console.log('\n🎉 BARCHA SAHIFALARGA AUTH QO\'SHILDI!');
    console.log('🔐 Endi admin panelga kirish uchun login kerak');
    console.log('\n📝 Login ma\'lumotlari:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
} else {
    console.log('\n⚠️  BA\'ZI SAHIFALARDA MUAMMOLAR BOR');
}
