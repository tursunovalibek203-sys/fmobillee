// Barcha HTML fayllarni telefon uchun moslashtiradigan script
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Barcha HTML fayllarni topish
const htmlFiles = fs.readdirSync(publicDir).filter(file => file.endsWith('.html'));

console.log(`📱 ${htmlFiles.length} ta HTML fayl topildi`);

let updatedCount = 0;
let skippedCount = 0;

htmlFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Agar allaqachon mobile-responsive.css qo'shilgan bo'lsa, o'tkazib yuborish
    if (content.includes('mobile-responsive.css')) {
        console.log(`⏭️  ${file} - allaqachon moslashtirilgan`);
        skippedCount++;
        return;
    }
    
    // Viewport meta tegini yangilash
    if (content.includes('<meta name="viewport"')) {
        content = content.replace(
            /<meta name="viewport" content="[^"]*">/,
            '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">'
        );
    }
    
    // mobile-responsive.css ni qo'shish
    // <head> dan keyin yoki birinchi <link> dan oldin qo'shamiz
    if (content.includes('<head>')) {
        // Agar <title> bor bo'lsa, undan keyin qo'shamiz
        if (content.includes('</title>')) {
            content = content.replace(
                '</title>',
                '</title>\n    <link rel="stylesheet" href="mobile-responsive.css">'
            );
        } else {
            // Aks holda <head> dan keyin qo'shamiz
            content = content.replace(
                '<head>',
                '<head>\n    <link rel="stylesheet" href="mobile-responsive.css">'
            );
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${file} - moslashtirildi`);
        updatedCount++;
    } else {
        console.log(`❌ ${file} - <head> topilmadi`);
    }
});

console.log(`\n📊 Natija:`);
console.log(`✅ Yangilandi: ${updatedCount}`);
console.log(`⏭️  O'tkazib yuborildi: ${skippedCount}`);
console.log(`📱 Barcha fayllar telefon uchun moslashtirildi!`);
