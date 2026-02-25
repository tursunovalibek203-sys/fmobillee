// Barcha HTML fayllariga mobile-enhancements.js ni qo'shish
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const htmlFiles = fs.readdirSync(publicDir).filter(file => file.endsWith('.html'));

console.log(`📱 ${htmlFiles.length} ta HTML faylga enhancement qo'shilmoqda...`);

let updatedCount = 0;

htmlFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Agar allaqachon qo'shilgan bo'lsa, o'tkazib yuborish
    if (content.includes('mobile-enhancements.js')) {
        console.log(`⏭️  ${file} - allaqachon qo'shilgan`);
        return;
    }
    
    // </body> dan oldin qo'shamiz
    if (content.includes('</body>')) {
        content = content.replace(
            '</body>',
            '    <script src="mobile-enhancements.js"></script>\n</body>'
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${file}`);
        updatedCount++;
    }
});

console.log(`\n✅ ${updatedCount} ta faylga enhancement qo'shildi!`);
