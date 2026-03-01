// Kassir sidebar avtomatik yuklash
(function() {
    // CSS yuklash
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'cashier-sidebar.css';
    document.head.appendChild(link);

    // Sidebar HTML yuklash
    fetch('cashier-sidebar.html')
        .then(response => response.text())
        .then(html => {
            // Sidebar konteynerini yaratish
            const sidebarContainer = document.createElement('div');
            sidebarContainer.innerHTML = html;
            document.body.insertBefore(sidebarContainer.firstChild, document.body.firstChild);

            // Body ga class qo'shish
            document.body.classList.add('has-cashier-sidebar');

            // Agar container class mavjud bo'lsa, uni o'zgartirish
            const containers = document.querySelectorAll('.container');
            containers.forEach(container => {
                if (!container.classList.contains('cashier-main-content')) {
                    container.classList.add('cashier-main-content');
                }
            });
        })
        .catch(error => {
            console.error('Sidebar yuklashda xato:', error);
        });
})();

// Toggle sidebar function
function toggleSidebar() {
    const sidebar = document.querySelector('.cashier-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.cashier-sidebar');
        const toggleBtn = document.querySelector('.sidebar-toggle');
        
        if (sidebar && sidebar.classList.contains('show') && 
            !sidebar.contains(event.target) && 
            !toggleBtn.contains(event.target)) {
            sidebar.classList.remove('show');
        }
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    const sidebar = document.querySelector('.cashier-sidebar');
    if (sidebar && window.innerWidth > 768) {
        sidebar.classList.remove('show');
    }
});
