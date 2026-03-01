// 📱 TELEFON UCHUN MAXSUS YAXSHILANISHLAR

// 1. Touch optimizatsiyasi
document.addEventListener('DOMContentLoaded', function() {
    
    // Barcha tugmalar uchun touch feedback
    const buttons = document.querySelectorAll('button, .btn, a[role="button"]');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.opacity = '0.7';
        });
        btn.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
    });
    
    // 2. Swipe to refresh
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', e => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        // Yuqoriga swipe - refresh
        if (touchEndY - touchStartY > 100 && window.scrollY === 0) {
            if (confirm('Sahifani yangilamoqchimisiz?')) {
                location.reload();
            }
        }
    }
    
    // 3. Table scroll indicator
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.overflow = 'auto';
        wrapper.style.webkitOverflowScrolling = 'touch';
        
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
        
        // Scroll indicator
        if (table.scrollWidth > table.clientWidth) {
            const indicator = document.createElement('div');
            indicator.innerHTML = '👉 Chapga suring';
            indicator.style.cssText = `
                position: absolute;
                right: 10px;
                top: 10px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 10;
                animation: pulse 2s infinite;
            `;
            wrapper.appendChild(indicator);
            
            wrapper.addEventListener('scroll', () => {
                if (wrapper.scrollLeft > 50) {
                    indicator.style.display = 'none';
                }
            });
        }
    });
    
    // 4. Input focus optimization (iOS zoom oldini olish)
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        // Agar font-size 16px dan kichik bo'lsa, 16px qilish
        const fontSize = window.getComputedStyle(input).fontSize;
        if (parseInt(fontSize) < 16) {
            input.style.fontSize = '16px';
        }
    });
    
    // 5. Modal scroll lock
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('show', () => {
            document.body.style.overflow = 'hidden';
        });
        modal.addEventListener('hide', () => {
            document.body.style.overflow = '';
        });
    });
    
    // 6. Lazy loading images
    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // 7. Network status indicator
    function updateOnlineStatus() {
        const status = navigator.onLine ? 'online' : 'offline';
        if (!navigator.onLine) {
            showToast('⚠️ Internet aloqasi yo\'q', 'warning');
        }
    }
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // 8. Toast notification system
    window.showToast = function(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `mobile-toast mobile-toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };
    
    // 9. Pull to refresh indicator
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        @keyframes slideUp {
            from {
                transform: translateX(-50%) translateY(100px);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
        
        @keyframes slideDown {
            from {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            to {
                transform: translateX(-50%) translateY(100px);
                opacity: 0;
            }
        }
        
        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }
        
        /* Better tap targets */
        @media (max-width: 768px) {
            a, button, input, select, textarea {
                min-height: 44px;
                min-width: 44px;
            }
        }
        
        /* Prevent text selection on buttons */
        button, .btn {
            -webkit-user-select: none;
            user-select: none;
        }
        
        /* Better focus states for accessibility */
        *:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
        }
        
        button:focus, .btn:focus {
            outline: 3px solid #3b82f6;
        }
    `;
    document.head.appendChild(style);
    
    // 10. Orientation change handler - O'CHIRILDI (scroll muammosi)
    // window.addEventListener('orientationchange', function() {
    //     // Orientatsiya o'zgarganda layout ni qayta hisoblash
    //     setTimeout(() => {
    //         window.scrollTo(0, 0);
    //     }, 100);
    // });
    
    // 11. Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // 12. Safe area insets for notched devices
    if (CSS.supports('padding-top: env(safe-area-inset-top)')) {
        document.documentElement.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
    }
    
    // 13. Haptic feedback (if supported)
    window.vibrate = function(pattern = 10) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    };
    
    // 14. Long press detection
    let pressTimer;
    document.addEventListener('touchstart', function(e) {
        if (e.target.classList.contains('long-press-enabled')) {
            pressTimer = setTimeout(() => {
                window.vibrate(50);
                e.target.dispatchEvent(new CustomEvent('longpress'));
            }, 500);
        }
    });
    
    document.addEventListener('touchend', function() {
        clearTimeout(pressTimer);
    });
    
    document.addEventListener('touchmove', function() {
        clearTimeout(pressTimer);
    });
    
    // 15. Auto-hide address bar on scroll - O'CHIRILDI (muammo keltirayotgan edi)
    // let lastScrollTop = 0;
    // window.addEventListener('scroll', function() {
    //     const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    //     if (scrollTop > lastScrollTop && scrollTop > 100) {
    //         // Scrolling down
    //         window.scrollTo(0, scrollTop + 1);
    //     }
    //     lastScrollTop = scrollTop;
    // }, false);
    
    console.log('📱 Telefon optimizatsiyalari yuklandi!');
});

// 16. Service Worker registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('✅ Service Worker registered'))
            .catch(err => console.log('❌ Service Worker registration failed:', err));
    });
}

// 17. Add to Home Screen prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button
    const installBtn = document.createElement('button');
    installBtn.textContent = '📱 Ilovani o\'rnatish';
    installBtn.className = 'install-app-btn';
    installBtn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        z-index: 9999;
        cursor: pointer;
    `;
    
    installBtn.addEventListener('click', async () => {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
        installBtn.remove();
    });
    
    document.body.appendChild(installBtn);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (installBtn.parentNode) {
            installBtn.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => installBtn.remove(), 300);
        }
    }, 10000);
});
