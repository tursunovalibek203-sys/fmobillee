// Admin Sidebar Loader - Barcha admin sahifalarda sidebarni yuklash uchun

(function() {
    // Sidebar HTML ni yuklash
    fetch('admin-sidebar-component.html')
        .then(response => response.text())
        .then(html => {
            // Body boshiga sidebar qo'shish
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Body ni wrapper ga o'rash
            const bodyContent = document.body.innerHTML;
            document.body.innerHTML = '';
            
            // Sidebar qo'shish
            document.body.appendChild(tempDiv);
            
            // Main wrapper yaratish
            const mainWrapper = document.createElement('div');
            mainWrapper.className = 'admin-main-wrapper';
            mainWrapper.innerHTML = bodyContent;
            document.body.appendChild(mainWrapper);
            
            console.log('✅ Admin sidebar yuklandi');
        })
        .catch(error => {
            console.error('❌ Sidebar yuklashda xato:', error);
        });
})();
