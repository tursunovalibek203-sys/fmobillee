// ==================== LOCALSTORAGE NI OLIB TASHASH ====================
// Ma'lumotlar faqat MongoDB da saqlansin

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🗑️ LOCALSTORAGE NI OLIB TASHASH');
console.log('='.repeat(70) + '\n');

const filesToCheck = [
    'public/script.js',
    'public/admin-branches.js',
    'public/admin-cashiers.js',
    'public/admin-sidebar.html',
    'public/admin-simple.html',
    'public/admin-ultimate.js',
    'public/admin-settings.js'
];

let totalChanges = 0;

console.log('📋 Tekshirilayotgan fayllar:\n');

filesToCheck.forEach((file, index) => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`   ${index + 1}. ⚠️ ${file} - TOPILMADI`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;
    
    // localStorage.getItem ni olib tashlash (faqat ma'lumotlar uchun, login emas)
    const localStorageMatches = content.match(/localStorage\.(getItem|setItem|removeItem|clear)/g);
    
    if (localStorageMatches && localStorageMatches.length > 0) {
        console.log(`   ${index + 1}. ⚠️ ${file}`);
        console.log(`      localStorage ishlatilgan: ${localStorageMatches.length} marta`);
        totalChanges += localStorageMatches.length;
    } else {
        console.log(`   ${index + 1}. ✅ ${file} - TOZA`);
    }
});

console.log(`\n📊 Jami topildi: ${totalChanges} ta localStorage ishlatilishi`);

console.log('\n' + '='.repeat(70));
console.log('📝 TAVSIYALAR');
console.log('='.repeat(70) + '\n');

console.log('1. Login uchun localStorage qoldiring:');
console.log('   - localStorage.getItem(\'isLoggedIn\')');
console.log('   - localStorage.getItem(\'adminToken\')');
console.log('   - localStorage.getItem(\'loginTime\')');
console.log('');

console.log('2. Ma\'lumotlar uchun localStorage ni olib tashlang:');
console.log('   - localStorage.getItem(\'customers\') ❌');
console.log('   - localStorage.getItem(\'sales\') ❌');
console.log('   - localStorage.getItem(\'products\') ❌');
console.log('   - localStorage.getItem(\'settings\') ❌');
console.log('   - localStorage.getItem(\'expenses\') ❌');
console.log('');

console.log('3. Faqat API dan ma\'lumot oling:');
console.log('   - await fetch(\'/api/customers\')');
console.log('   - await fetch(\'/api/sales\')');
console.log('   - await fetch(\'/api/products\')');
console.log('   - await fetch(\'/api/settings\')');
console.log('');

console.log('4. MongoDB ulanish tekshiruvi qo\'shing:');
console.log('   - Agar MongoDB ulanmasa, xato ko\'rsating');
console.log('   - localStorage ga fallback qilmang');
console.log('');

console.log('✅ YAKUNIY MAQSAD:');
console.log('   Ma\'lumotlar FAQAT MongoDB da saqlansin!');
console.log('   localStorage FAQAT login uchun ishlatilsin!\n');
