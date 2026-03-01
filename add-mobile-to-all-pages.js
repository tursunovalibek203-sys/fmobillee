const fs = require('fs');
const path = require('path');

console.log('📱 BARCHA SAHIFALARGA MOBILE RESPONSIVE QO\'SHISH\n');
console.log('='.repeat(60));

const publicDir = path.join(__dirname, 'public');
const htmlFiles = fs.readdirSync(publicDir).filter(file => file.endsWith('.html'));

console.log(`\n📄 Topilgan HTML fayllar: ${htmlFiles.length} ta\n`);

const mobileCSS = '<link rel="stylesheet" href="/mobile-responsive-complete.css">';
const mobileJS = '<script src="/mobile-enhancements-complete.js"></script>';
const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">';

let updated = 0;
let skipped = 0;

htmlFiles.forEach((file, index) => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;
    
    // 1. Add viewport if not exists
    if (!content.includes('viewport')) {
        content = content.replace('</head>', `    ${viewport}\n</head>`);
        modified = true;
    }
    
    // 2. Add mobile CSS if not exists
    if (!content.includes('mobile-responsive-complete.css') && !content.includes('mobile-responsive.css')) {
        content = content.replace('</head>', `    ${mobileCSS}\n</head>`);
        modified = true;
    }
    
    // 3. Add mobile JS if not exists
    if (!content.includes('mobile-enhancements-complete.js') && !content.includes('mobile-enhancements.js')) {
        content = content.replace('</body>', `    ${mobileJS}\n</body>`);
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${index + 1}. ${file} - Yangilandi`);
        updated++;
    } else {
        console.log(`⏭️  ${index + 1}. ${file} - O'tkazib yuborildi (allaqachon bor)`);
        skipped++;
    }
});

console.log('\n' + '='.repeat(60));
console.log('📊 NATIJA:');
console.log('='.repeat(60));
console.log(`✅ Yangilandi: ${updated} ta fayl`);
console.log(`⏭️  O'tkazib yuborildi: ${skipped} ta fayl`);
console.log(`📄 Jami: ${htmlFiles.length} ta fayl`);
console.log('\n🎉 BARCHA SAHIFALAR TELEFON UCHUN MOSLASHTIRILDI!\n');
