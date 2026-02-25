// Barcha HTML fayllariga orqaga qaytish tugmasini qo'shish
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Qo'shish kerak bo'lgan skript
const backButtonScript = '<script src="back-button.js"></script>';

// HTML fayllarni o'qish
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

console.log(`📄 ${files.length} ta HTML fayl topildi\n`);

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Agar allaqachon mavjud bo'lsa, o'tkazib yuborish
  if (content.includes('back-button.js')) {
    console.log(`⏭️  ${file} - allaqachon mavjud`);
    skipped++;
    return;
  }
  
  // </head> dan oldin qo'shish
  if (content.includes('</head>')) {
    content = content.replace('</head>', `  ${backButtonScript}\n</head>`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file} - yangilandi`);
    updated++;
  } else {
    console.log(`⚠️  ${file} - </head> topilmadi`);
    skipped++;
  }
});

console.log(`\n📊 Natija:`);
console.log(`   ✅ Yangilandi: ${updated}`);
console.log(`   ⏭️  O'tkazildi: ${skipped}`);
console.log(`   📄 Jami: ${files.length}`);
