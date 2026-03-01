// ============================================
// TELEFON UCHUN TO'LIQ JAVASCRIPT
// Barcha funksiyalar
// ============================================

(function() {
    'use strict';
    
    // ========== 1. MOBILE DETECTION ==========
    const isMobile = () => {
        return window.innerWidth <= 768 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    
    // ========== 2. VIEWPORT HEIGHT FIX ==========
    const fixViewportHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    window.addEventListener('resize', fixViewportHeight);
    fixViewportHeight();
    
    // ========== 3. SIDEBAR TOGGLE ==========
    const initSidebar = () => {
        const sidebar = document.querySelector('.sidebar, aside');
        const toggleBtn = document.querySelector('.sidebar-toggle, .menu-toggle, .navbar-toggler');
        
        if (!sidebar || !toggleBtn) return;
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        // Toggle function
        const toggleSidebar = () => {
            sidebar.classList.toggle('active');
            overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
        };
        
        toggleBtn.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);
        
        // Close on link click
        const sidebarLinks = sidebar.querySelectorAll('a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (isMobile()) {
                    toggleSidebar();
                }
            });
        });
    };
    
    // ========== 4. TABLE RESPONSIVE ==========
    const makeTablesResponsive = () => {
        const tables = document.querySelectorAll('table:not(.no-mobile)');
        
        tables.forEach(table => {
            // Wrap table
            if (!table.parentElement.classList.contains('table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
            
            // Add data-label for stacking
            if (isMobile() && !table.classList.contains('scroll-mobile')) {
                table.classList.add('stack-mobile');
                
                const headers = table.querySelectorAll('thead th');
                const rows = table.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    cells.forEach((cell, index) => {
                        if (headers[index]) {
                            cell.setAttribute('data-label', headers[index].textContent);
                        }
                    });
                });
            }
        });
    };
    
    // ========== 5. TOUCH SWIPE ==========
    const initSwipe = () => {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        const handleSwipe = () => {
            const sidebar = document.querySelector('.sidebar, aside');
            if (!sidebar) return;
            
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            // Swipe left to close
            if (diff > swipeThreshold && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) overlay.style.display = 'none';
            }
            
            // Swipe right to open (from edge)
            if (diff < -swipeThreshold && touchStartX < 50) {
                sidebar.classList.add('active');
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) overlay.style.display = 'block';
            }
        };
    };
    
    // ========== 6. MODAL IMPROVEMENTS ==========
    const improveModals = () => {
        const modals = document.querySelectorAll('.modal, .dialog');
        
        modals.forEach(modal => {
            // Prevent body scroll when modal open
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.attributeName === 'class') {
                        if (modal.classList.contains('show') || modal.style.display === 'block') {
                            document.body.style.overflow = 'hidden';
                        } else {
                            document.body.style.overflow = '';
                        }
                    }
                });
            });
            
            observer.observe(modal, { attributes: true });
            
            // Close on overlay click
            modal.addEventListener('click', e => {
                if (e.target === modal) {
                    const closeBtn = modal.querySelector('.close, .modal-close');
                    if (closeBtn) closeBtn.click();
                }
            });
        });
    };
    
    // ========== 7. FORM IMPROVEMENTS ==========
    const improveforms = () => {
        // Auto-focus first input in modals
        document.addEventListener('shown.bs.modal', e => {
            const firstInput = e.target.querySelector('input:not([type="hidden"]), select, textarea');
            if (firstInput) firstInput.focus();
        });
        
        // Prevent zoom on input focus (iOS)
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.style.fontSize === '' || parseInt(input.style.fontSize) < 16) {
                input.style.fontSize = '16px';
            }
        });
        
        // Number input improvements
        const numberInputs = document.querySelectorAll('input[type="number"]');
        numberInputs.forEach(input => {
            input.setAttribute('inputmode', 'decimal');
        });
    };
    
    // ========== 8. BUTTON LOADING STATE ==========
    const addButtonLoading = () => {
        document.addEventListener('submit', e => {
            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
            
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.textContent;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Yuklanmoqda...';
                
                // Re-enable after 5 seconds (safety)
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitBtn.dataset.originalText;
                }, 5000);
            }
        });
    };
    
    // ========== 9. PULL TO REFRESH ==========
    const initPullToRefresh = () => {
        let startY = 0;
        let currentY = 0;
        let pulling = false;
        
        const refreshThreshold = 80;
        const refreshIndicator = document.createElement('div');
        refreshIndicator.className = 'pull-to-refresh-indicator';
        refreshIndicator.innerHTML = '↓ Yangilash uchun torting';
        refreshIndicator.style.cssText = `
            position: fixed;
            top: -50px;
            left: 0;
            right: 0;
            height: 50px;
            background: #007bff;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: top 0.3s;
            z-index: 10000;
        `;
        document.body.appendChild(refreshIndicator);
        
        document.addEventListener('touchstart', e => {
            if (window.scrollY === 0) {
                startY = e.touches[0].pageY;
                pulling = true;
            }
        });
        
        document.addEventListener('touchmove', e => {
            if (!pulling) return;
            
            currentY = e.touches[0].pageY;
            const diff = currentY - startY;
            
            if (diff > 0 && diff < refreshThreshold * 2) {
                refreshIndicator.style.top = `${Math.min(diff - 50, 0)}px`;
            }
        });
        
        document.addEventListener('touchend', () => {
            if (!pulling) return;
            
            const diff = currentY - startY;
            
            if (diff > refreshThreshold) {
                refreshIndicator.style.top = '0';
                refreshIndicator.innerHTML = '🔄 Yangilanmoqda...';
                
                setTimeout(() => {
                    location.reload();
                }, 500);
            } else {
                refreshIndicator.style.top = '-50px';
            }
            
            pulling = false;
        });
    };
    
    // ========== 10. SCROLL TO TOP ==========
    const addScrollToTop = () => {
        const btn = document.createElement('button');
        btn.className = 'scroll-to-top';
        btn.innerHTML = '↑';
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #007bff;
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            display: none;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(btn);
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btn.style.display = 'block';
            } else {
                btn.style.display = 'none';
            }
        });
        
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };
    
    // ========== 11. DROPDOWN IMPROVEMENTS ==========
    const improveDropdowns = () => {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (!toggle || !menu) return;
            
            toggle.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                document.querySelectorAll('.dropdown-menu.show').forEach(m => {
                    if (m !== menu) m.classList.remove('show');
                });
                
                menu.classList.toggle('show');
            });
            
            // Close on outside click
            document.addEventListener('click', e => {
                if (!dropdown.contains(e.target)) {
                    menu.classList.remove('show');
                }
            });
        });
    };
    
    // ========== 12. IMAGE LAZY LOADING ==========
    const initLazyLoading = () => {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    };
    
    // ========== 13. TOAST NOTIFICATIONS ==========
    window.showToast = (message, type = 'info', duration = 3000) => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 25px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            border-radius: 8px;
            z-index: 99999;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };
    
    // ========== 14. ORIENTATION CHANGE ==========
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            fixViewportHeight();
            makeTablesResponsive();
        }, 100);
    });
    
    // ========== 15. NETWORK STATUS ==========
    const showNetworkStatus = () => {
        window.addEventListener('online', () => {
            showToast('Internet aloqasi qayta tiklandi', 'success');
        });
        
        window.addEventListener('offline', () => {
            showToast('Internet aloqasi yo\'q', 'error', 5000);
        });
    };
    
    // ========== INITIALIZE ALL ==========
    const init = () => {
        if (!isMobile()) return;
        
        console.log('📱 Mobile enhancements initialized');
        
        initSidebar();
        makeTablesResponsive();
        initSwipe();
        improveModals();
        improveforms();
        addButtonLoading();
        initPullToRefresh();
        addScrollToTop();
        improveDropdowns();
        initLazyLoading();
        showNetworkStatus();
        
        // Add mobile class to body
        document.body.classList.add('mobile-device');
    };
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

// ========== CSS ANIMATIONS ==========
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);
