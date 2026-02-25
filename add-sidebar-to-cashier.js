// Barcha kassir sahifalariga sidebar qo'shish uchun script
const fs = require('fs');
const path = require('path');

const cashierFiles = [
    'public/cashier-dashboard-pro.html',
    'public/cashier-history-enhanced.html',
    'public/cashier-report.html',
    'public/cashier-quick-sale.html',
    'public/cashier-simple.html',
    'public/cashier-pro.html',
    'public/cashier-enhanced.html',
    'public/cashier-daily-report.html'
];

const sidebarScript = '<script src="cashier-sidebar-loader.js"></script>';

cashierFiles.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        
        // Agar sidebar script mavjud bo'lmasa, qo'shish
        if (!content.includes('cashier-sidebar-loader.js')) {
            // </body> dan oldin qo'shish
            if (content.includes('</body>')) {
                content = content.replace('</body>', `    ${sidebarScript}\n</body>`);
                fs.writeFileSync(file, content, 'utf8');
                console.log(`✅ Sidebar qo'shildi: ${file}`);
            } else {
                console.log(`⚠️ </body> topilmadi: ${file}`);
            }
        } else {
            console.log(`ℹ️ Sidebar allaqachon mavjud: ${file}`);
        }
    } catch (error) {
        console.error(`❌ Xato (${file}):`, error.message);
    }
});

console.log('\n✅ Jarayon tugadi!');
