// 🔍 QARZ MUAMMOSINI DEBUG QILISH
// Bu faylni index.html ga qo'shing: <script src="debug-debt.js"></script>

console.log('🔍 QARZ DEBUG BOSHLANDI\n');

// 1. Ma'lumotlarni tekshirish
setTimeout(() => {
    console.log('📊 MA\'LUMOTLAR:');
    console.log('  Customers:', typeof customers !== 'undefined' ? customers.length : 'UNDEFINED');
    console.log('  Sales:', typeof sales !== 'undefined' ? sales.length : 'UNDEFINED');
    
    if (typeof customers === 'undefined' || typeof sales === 'undefined') {
        console.error('❌ MUAMMO: customers yoki sales yuklanmagan!');
        return;
    }
    
    // 2. Funksiyalarni tekshirish
    console.log('\n🔧 FUNKSIYALAR:');
    console.log('  getCustomerDebt:', typeof getCustomerDebt);
    console.log('  getTotalDebt:', typeof getTotalDebt);
    console.log('  getDebtorsCount:', typeof getDebtorsCount);
    console.log('  formatMoney:', typeof formatMoney);
    
    // 3. Qarz hisoblash
    console.log('\n💰 QARZ HISOBLASH:');
    
    if (customers.length > 0) {
        const firstCustomer = customers[0];
        console.log('  Birinchi mijoz:', firstCustomer.name);
        
        if (typeof getCustomerDebt === 'function') {
            const debt = getCustomerDebt(firstCustomer.id);
            console.log('  Uning qarzi:', debt);
            console.log('  NaN?:', isNaN(debt));
        }
    }
    
    // 4. Jami qarz
    if (typeof getTotalDebt === 'function') {
        const totalDebt = getTotalDebt();
        console.log('\n  Jami qarz:', totalDebt);
        console.log('  NaN?:', isNaN(totalDebt));
        console.log('  Formatted:', typeof formatMoney === 'function' ? formatMoney(totalDebt) : 'formatMoney yo\'q');
    }
    
    // 5. Qarzdorlar soni
    if (typeof getDebtorsCount === 'function') {
        const debtorsCount = getDebtorsCount();
        console.log('\n  Qarzdorlar soni:', debtorsCount);
        console.log('  NaN?:', isNaN(debtorsCount));
    }
    
    // 6. HTML elementlarni tekshirish
    console.log('\n📄 HTML ELEMENTLAR:');
    const totalDebtEl = document.getElementById('totalDebt');
    const debtorsCountEl = document.getElementById('debtorsCount');
    
    console.log('  totalDebt element:', totalDebtEl ? 'TOPILDI' : 'YO\'Q');
    console.log('  debtorsCount element:', debtorsCountEl ? 'TOPILDI' : 'YO\'Q');
    
    if (totalDebtEl) {
        console.log('  totalDebt qiymati:', totalDebtEl.textContent);
    }
    if (debtorsCountEl) {
        console.log('  debtorsCount qiymati:', debtorsCountEl.textContent);
    }
    
    // 7. Xavfsiz yangilash
    console.log('\n🔄 XAVFSIZ YANGILASH:');
    
    if (typeof getTotalDebt === 'function' && typeof formatMoney === 'function' && totalDebtEl) {
        const totalDebt = getTotalDebt();
        const formatted = formatMoney(totalDebt);
        console.log('  Yangi qiymat:', formatted);
        totalDebtEl.textContent = formatted;
        console.log('  ✅ totalDebt yangilandi');
    }
    
    if (typeof getDebtorsCount === 'function' && debtorsCountEl) {
        const count = getDebtorsCount();
        console.log('  Yangi qarzdorlar soni:', count);
        debtorsCountEl.textContent = count;
        console.log('  ✅ debtorsCount yangilandi');
    }
    
    console.log('\n✅ DEBUG YAKUNLANDI');
    
}, 2000); // 2 soniya kutish
