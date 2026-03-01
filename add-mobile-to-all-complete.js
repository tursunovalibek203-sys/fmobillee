// 📱 BARCHA HTML SAHIFALARGA MOBILE CSS QO'SHISH (TO'LIQ VERSIYA)

const fs = require('fs');
const path = require('path');

console.log('🚀 BARCHA HTML FAYLLAR UCHUN MOBILE CSS QO\'SHISH BOSHLANDI\n');

// Barcha HTML fayllarni topish
const publicDir = 'public';
const allHtmlFiles = fs.readdirSync(publicDir)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(publicDir, file));

console.log(`📁 Topildi: ${allHtmlFiles.length} ta HTML fayl\n`);

// CSS mapping - fayl nomiga qarab qaysi CSS ishlatish
function getCSSForFile(fileName) {
    // Admin files
    if (fileName.startsWith('admin-')) {
        if (fileName.includes('sales') || fileName === 'index.html') {
            return ['mobile-universal.css', 'mobile-admin-sales.css'];
        } else if (fileName.includes('dashboard') || fileName.includes('analytics')) {
            return ['mobile-universal.css', 'mobile-admin-dashboard.css'];
        } else if (fileName.includes('report')) {
            return ['mobile-universal.css', 'mobile-admin-reports.css'];
        } else if (fileName.includes('notification')) {
            return ['mobile-universal.css', 'mobile-admin-notifications.css'];
        } else if (fileName.includes('branch')) {
            return ['mobile-universal.css', 'mobile-admin-branches.css'];
        } else if (fileName.includes('expense') || fileName.includes('finance')) {
            return ['mobile-universal.css', 'mobile-finance.css'];
        } else {
            return ['mobile-universal.css', 'mobile-admin-dashboard.css'];
        }
    }
    
    // Cashier files
    if (fileName.startsWith('cashier-')) {
        if (fileName.includes('new')) {
            return ['mobile-universal.css', 'mobile-cashier-new.css', 'mobile-cashier-complete.css'];
        } else {
            return ['mobile-universal.css', 'mobile-cashier-complete.css'];
        }
    }
    
    // Warehouse files
    if (fileName.startsWith('warehouse-')) {
        if (fileName.includes('pro')) {
            return ['mobile-universal.css', 'mobile-warehouse-pro.css', 'mobile-warehouse-complete.css'];
        } else {
            return ['mobile-universal.css', 'mobile-warehouse-complete.css'];
        }
    }
    
    // Finance files
    if (fileName.startsWith('finance-')) {
        return ['mobile-universal.css', 'mobile-finance.css'];
    }
    
    // Activity log
    if (fileName.includes('activity')) {
        return ['mobile-universal.css', 'mobile-activity-log.css'];
    }
    
    // Login files
    if (fileName.startsWith('login-') || fileName === 'login.html') {
        return ['mobile-universal.css', 'mobile-login.css'];
    }
    
    // Customer files
    if (fileName.includes('customer')) {
        return ['mobile-universal.css', 'mobile-admin-dashboard.css'];
    }
    
    // Dashboard files
    if (fileName.includes('dashboard') || fileName.includes('executive') || fileName.includes('realtime')) {
        return ['mobile-universal.css', 'mobile-admin-dashboard.css'];
    }
    
    // Default - faqat universal
    return ['mobile-universal.css'];
}

let successCount = 0;
let skipCount = 0;
let errorCount = 0;
let updatedFiles = [];

// Har bir HTML faylni qayta ishlash
allHtmlFiles.forEach(filePath => {
    try {
        const fileName = path.basename(filePath);
        
        // Test va sidebar fayllarni o'tkazib yuborish
        if (fileName.startsWith('test-') || fileName.includes('sidebar') || fileName.includes('selector')) {
            console.log(`⏭️  O'tkazib yuborildi: ${fileName} (test/component fayl)`);
            skipCount++;
            return;
        }
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Allaqachon qo'shilganmi tekshirish
        if (content.includes('mobile-universal.css')) {
            console.log(`✅ Allaqachon qo'shilgan: ${fileName}`);
            skipCount++;
            return;
        }
        
        // CSS fayllarni aniqlash
        const cssFiles = getCSSForFile(fileName);
        
        // CSS va JS linklar yaratish
        const cssLinks = cssFiles.map(css => 
            `  <link rel="stylesheet" href="${css}">`
        ).join('\n');
        
        const jsLink = `  <script src="mobile-enhancements.js"></script>`;
        
        // </head> topish va qo'shish
        if (content.includes('</head>')) {
            content = content.replace(
                '</head>',
                `\n  <!-- 📱 Mobile Responsive CSS -->\n${cssLinks}\n${jsLink}\n</head>`
            );
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Qo'shildi: ${fileName} (${cssFiles.length} CSS)`);
            updatedFiles.push({ file: fileName, css: cssFiles.length });
            successCount++;
        } else {
            console.log(`⚠️  </head> topilmadi: ${fileName}`);
            errorCount++;
        }
        
    } catch (error) {
        console.log(`❌ Xato: ${path.basename(filePath)} - ${error.message}`);
        errorCount++;
    }
});

// Natija
console.log('\n' + '='.repeat(70));
console.log('\n📊 YAKUNIY NATIJA\n');
console.log(`✅ Yangilandi: ${successCount} ta fayl`);
console.log(`⏭️  O'tkazib yuborildi: ${skipCount} ta fayl`);
console.log(`❌ Xatolar: ${errorCount} ta fayl`);
console.log(`📁 Jami tekshirildi: ${allHtmlFiles.length} ta fayl`);

if (updatedFiles.length > 0) {
    console.log('\n📝 YANGILANGAN FAYLLAR:\n');
    updatedFiles.forEach(({ file, css }) => {
        console.log(`   • ${file} (${css} CSS)`);
    });
}

if (successCount > 0) {
    console.log('\n🎉 MOBILE CSS MUVAFFAQIYATLI QO\'SHILDI!');
    console.log('\n📱 Endi barcha sahifalar telefonda to\'liq ishlaydi!');
    console.log('\n💡 KEYINGI QADAMLAR:');
    console.log('   1. Serveringizni qayta ishga tushiring');
    console.log('   2. Telefonda saytni oching');
    console.log('   3. Har bir sahifani tekshiring');
    console.log('   4. Agar muammo bo\'lsa, browser cache ni tozalang');
} else if (skipCount === allHtmlFiles.length) {
    console.log('\n✅ BARCHA FAYLLAR ALLAQACHON TAYYOR!');
    console.log('\n📱 Sizning saytingiz telefonda ishlashga tayyor!');
} else {
    console.log('\n⚠️  BA\'ZI FAYLLAR QAYTA ISHLANMADI!');
    console.log('\n💡 Xatolarni tekshiring va qayta urinib ko\'ring.');
}

console.log('\n' + '='.repeat(70) + '\n');
