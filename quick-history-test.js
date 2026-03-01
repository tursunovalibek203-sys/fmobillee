// Tezkor tarix testi - Fayllarni tekshirish

const fs = require('fs');
const path = require('path');

console.log('TEZKOR TARIX TESTI\n');
console.log('='.repeat(70));

let totalTests = 0;
let passedTests = 0;

function test(name, condition, details = '') {
    totalTests++;
    if (condition) {
        console.log(`   OK ${name}`);
        if (details) console.log(`      ${details}`);
        passedTests++;
    } else {
        console.log(`   FAIL ${name}`);
        if (details) console.log(`      ${details}`);
    }
}

// 1. Tarix sahifalari mavjudmi?
console.log('\n1. TARIX SAHIFALARI');
console.log('-'.repeat(70));

const historyPages = [
    'public/warehouse-history.html',
    'public/activity-log.html',
    'public/cashier-transactions.html',
    'public/admin-handovers.html'
];

historyPages.forEach(page => {
    const exists = fs.existsSync(path.join(__dirname, page));
    test(page.split('/').pop(), exists);
});

// 2. Test sahifalari mavjudmi?
console.log('\n2. TEST SAHIFALARI');
console.log('-'.repeat(70));

const testPages = [
    'public/test-all-history.html',
    'public/generate-test-data.html'
];

testPages.forEach(page => {
    const exists = fs.existsSync(path.join(__dirname, page));
    test(page.split('/').pop(), exists);
});

// 3. Tarix sahifalarida API chaqiruvlar bormi?
console.log('\n3. API CHAQIRUVLAR');
console.log('-'.repeat(70));

// warehouse-history.html
const warehousePath = path.join(__dirname, 'public/warehouse-history.html');
if (fs.existsSync(warehousePath)) {
    const content = fs.readFileSync(warehousePath, 'utf8');
    test('warehouse-history.html - API', 
        content.includes('/api/products') || content.includes('fetch'));
}

// activity-log.html
const activityPath = path.join(__dirname, 'public/activity-log.html');
if (fs.existsSync(activityPath)) {
    const content = fs.readFileSync(activityPath, 'utf8');
    test('activity-log.html - API', 
        content.includes('/api/activity') || content.includes('fetch'));
}

// cashier-transactions.html
const transactionsPath = path.join(__dirname, 'public/cashier-transactions.html');
if (fs.existsSync(transactionsPath)) {
    const content = fs.readFileSync(transactionsPath, 'utf8');
    test('cashier-transactions.html - API', 
        content.includes('/api/cashier') || content.includes('fetch'));
}

// 4. Tarix sahifalarida sana filterlari bormi?
console.log('\n4. SANA FILTERLARI');
console.log('-'.repeat(70));

historyPages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasDateFilter = content.includes('date') || 
                             content.includes('filter') || 
                             content.includes('search');
        test(`${page.split('/').pop()} - Filter`, hasDateFilter);
    }
});

// 5. Admin dashboard da tarix statistikasi bormi?
console.log('\n5. ADMIN DASHBOARD STATISTIKA');
console.log('-'.repeat(70));

const dashboardPages = [
    'public/admin-super-dashboard.html',
    'public/admin-dashboard.html'
];

dashboardPages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasStats = content.includes('chart') || 
                        content.includes('graph') || 
                        content.includes('statistics');
        test(`${page.split('/').pop()} - Statistika`, hasStats);
    }
});

// 6. Test data generator endpoint bormi?
console.log('\n6. TEST DATA GENERATOR');
console.log('-'.repeat(70));

const serverPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverPath)) {
    const content = fs.readFileSync(serverPath, 'utf8');
    test('Server.js - generate-test-data endpoint', 
        content.includes('/api/generate-test-data'));
}

// 7. Validation scriptlar tarixda ishlatilmoqdami?
console.log('\n7. VALIDATION SCRIPTLAR');
console.log('-'.repeat(70));

const validationFiles = [
    'public/warehouse-strict-validation.js',
    'public/sales-strict-validation.js'
];

validationFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    test(file.split('/').pop(), exists);
});

// 8. Hujjatlar mavjudmi?
console.log('\n8. HUJJATLAR');
console.log('-'.repeat(70));

const docs = [
    'TARIXLAR_KOPAYTIRISH_TAYYOR.md',
    'TARIXLAR_TEST_NATIJASI.md',
    'TIZIM_100_FOIZ_TAYYOR.md'
];

docs.forEach(doc => {
    const exists = fs.existsSync(path.join(__dirname, doc));
    test(doc, exists);
});

// Natijalar
console.log('\n' + '='.repeat(70));
console.log('\nNATIJALAR:\n');

const successRate = ((passedTests / totalTests) * 100).toFixed(1);

console.log(`OK: ${passedTests}/${totalTests}`);
console.log(`FAIL: ${totalTests - passedTests}/${totalTests}`);
console.log(`Muvaffaqiyat: ${successRate}%`);

if (passedTests === totalTests) {
    console.log('\nBARCHA FAYLLAR MAVJUD!');
    console.log('\nKeyingi qadam:');
    console.log('1. Serverni ishga tushiring: node server.js');
    console.log('2. Test sahifasini oching: http://localhost:3000/test-all-history.html');
    console.log('3. Testlarni boshlang va natijalarni koring');
} else {
    console.log(`\n${totalTests - passedTests} ta fayl topilmadi`);
}

console.log('\n' + '='.repeat(70));
