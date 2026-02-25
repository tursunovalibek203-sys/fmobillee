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

            // Mobile toggle button qo'shish
            if (window.innerWidth <= 768) {
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'sidebar-toggle';
                toggleBtn.innerHTML = '☰';
                toggleBtn.onclick = function() {
                    const sidebar = document.querySelector('.cashier-sidebar');
                    if (sidebar) {
                        sidebar.classList.toggle('show');
                    }
                };
                document.body.appendChild(toggleBtn);
            }
        })
        .catch(error => {
            console.error('Sidebar yuklashda xato:', error);
        });
})();
