// Cashier Authentication Check - Barcha kassir sahifalarda ishlatish uchun

(function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('cashierLoggedIn');
    const loginTime = localStorage.getItem('cashierLoginTime');
    const now = Date.now();
    
    // Session 12 soat davom etadi
    const sessionDuration = 12 * 60 * 60 * 1000; // 12 hours
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Not logged in - redirect to login
        window.location.href = 'cashier-login.html';
        return;
    }
    
    if (loginTime && (now - loginTime) > sessionDuration) {
        // Session expired
        localStorage.removeItem('cashierLoggedIn');
        localStorage.removeItem('cashierLoginTime');
        localStorage.removeItem('cashierId');
        localStorage.removeItem('cashierName');
        localStorage.removeItem('cashierUsername');
        localStorage.removeItem('cashierBranchId');
        alert('⏰ Sessiya tugadi. Iltimos, qaytadan kiring.');
        window.location.href = 'cashier-login.html';
        return;
    }
    
    // Update last activity time
    localStorage.setItem('cashierLastActivity', now.toString());
    
    // Auto logout after 2 hours of inactivity
    let inactivityTimer;
    
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            localStorage.removeItem('cashierLoggedIn');
            localStorage.removeItem('cashierLoginTime');
            localStorage.removeItem('cashierId');
            localStorage.removeItem('cashierName');
            localStorage.removeItem('cashierUsername');
            localStorage.removeItem('cashierBranchId');
            alert('⏰ Faolsizlik tufayli tizimdan chiqdingiz.');
            window.location.href = 'cashier-login.html';
        }, 2 * 60 * 60 * 1000); // 2 hours
    }
    
    // Reset timer on user activity
    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);
    document.addEventListener('click', resetInactivityTimer);
    document.addEventListener('scroll', resetInactivityTimer);
    document.addEventListener('touchstart', resetInactivityTimer);
    
    // Start timer
    resetInactivityTimer();
    
    console.log('✅ Kassir autentifikatsiya tekshirildi');
    console.log('👤 Kassir:', localStorage.getItem('cashierName'));
    console.log('🏢 Filial ID:', localStorage.getItem('cashierBranchId'));
})();
