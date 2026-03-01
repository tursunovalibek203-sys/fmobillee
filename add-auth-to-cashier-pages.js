// Barcha kassir sahifalarga authentication qo'shish

const fs = require('fs');
const path = require('path');

const cashierPages = [
    'cashier-new.html',
    'cashier-pro.html',
    'cashier-simple.html',
    'cashier-quick-sale.html',
    'cashier-daily-report.html',
    'cashier-report.html',
    'cashier-multi-currency.html',
    'cashier-dual-currency.html',
    'cashier-enhanced.html',
    'cashier-dashboard-pro.html',
    'cashier-quick-actions.html',
    'cashier-advanced.html',
    'cashier-transactions.html',
    'cashier-history-enhanced.html'
];

const authScript = '<script src="cashier-auth-check.js"></script>';

console.log('🔐 Barcha kassir sahifalarga authentication qo\'shilmoqda...\n');

let successCount = 0;
let errorCount = 0;
let skippedCount = 0;

cashierPages.forEach(page => {
    const filePath = path.join(__dirname, 'public', page);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${page} - Fayl topilmadi`);
            skippedCount++;
            return;
        }
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Agar auth script allaqachon bo'lsa, o'tkazib yuborish
        if (content.includes('cashier-auth-check.js')) {
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
console.log(`⚠️  O\'tkazib yuborildi: ${skippedCount}`);
console.log(`📝 Jami: ${cashierPages.length}`);

if (successCount > 0) {
    console.log('\n🎉 KASSIR SAHIFALARGA AUTH QO\'SHILDI!');
    console.log('🔐 Endi kassir panelga kirish uchun login kerak');
    console.log('\n📝 Login qilish:');
    console.log('   1. Filialni tanlang');
    console.log('   2. Username va parolni kiriting');
    console.log('   3. Kirish tugmasini bosing');
    console.log('\n💡 Kassirlar database dan olinadi');
} else {
    console.log('\n⚠️  HECH QANDAY SAHIFAGA AUTH QO\'SHILMADI');
}
