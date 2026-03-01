// Admin Authentication Check - Barcha admin sahifalarda ishlatish uchun

(function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const loginTime = localStorage.getItem('adminLoginTime');
    const now = Date.now();
    
    // Session 24 soat davom etadi
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Not logged in - redirect to login
        window.location.href = 'admin-login.html';
        return;
    }
    
    if (loginTime && (now - loginTime) > sessionDuration) {
        // Session expired
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        localStorage.removeItem('adminUsername');
        alert('⏰ Sessiya tugadi. Iltimos, qaytadan kiring.');
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Update last activity time
    localStorage.setItem('adminLastActivity', now.toString());
    
    // Auto logout after 30 minutes of inactivity
    let inactivityTimer;
    
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminLoginTime');
            localStorage.removeItem('adminUsername');
            alert('⏰ Faolsizlik tufayli tizimdan chiqdingiz.');
            window.location.href = 'admin-login.html';
        }, 30 * 60 * 1000); // 30 minutes
    }
    
    // Reset timer on user activity
    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);
    document.addEventListener('click', resetInactivityTimer);
    document.addEventListener('scroll', resetInactivityTimer);
    
    // Start timer
    resetInactivityTimer();
    
    console.log('✅ Admin autentifikatsiya tekshirildi');
})();
