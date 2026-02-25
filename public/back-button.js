// Universal orqaga qaytish tugmasi
(function() {
  'use strict';
  
  // Orqaga qaytish tugmasini qo'shish
  function addBackButton() {
    // Agar tugma allaqachon mavjud bo'lsa, qaytish
    if (document.getElementById('universal-back-btn')) {
      return;
    }
    
    // Tugma yaratish
    const backBtn = document.createElement('button');
    backBtn.id = 'universal-back-btn';
    backBtn.innerHTML = '← Orqaga';
    backBtn.className = 'universal-back-button';
    
    // Tugmani sahifaga qo'shish
    document.body.appendChild(backBtn);
    
    // Click hodisasi
    backBtn.addEventListener('click', function() {
      // Agar history mavjud bo'lsa, orqaga qaytish
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Aks holda, bosh sahifaga o'tish
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('admin')) {
          window.location.href = '/admin-dashboard.html';
        } else if (currentPath.includes('cashier')) {
          window.location.href = '/cashier-new.html';
        } else if (currentPath.includes('warehouse')) {
          window.location.href = '/warehouse-pro.html';
        } else {
          window.location.href = '/';
        }
      }
    });
  }
  
  // Sahifa yuklanganda tugmani qo'shish
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addBackButton);
  } else {
    addBackButton();
  }
  
  // CSS stillarini qo'shish
  const style = document.createElement('style');
  style.textContent = `
    .universal-back-button {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 9999;
      padding: 10px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .universal-back-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    }
    
    .universal-back-button:active {
      transform: translateY(0);
      box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
    }
    
    /* Mobil uchun */
    @media (max-width: 768px) {
      .universal-back-button {
        top: 10px;
        left: 10px;
        padding: 8px 16px;
        font-size: 14px;
      }
    }
    
    /* Sidebar bilan to'qnashmaslik uchun */
    body.sidebar-open .universal-back-button {
      left: 270px;
    }
    
    @media (max-width: 768px) {
      body.sidebar-open .universal-back-button {
        left: 10px;
      }
    }
  `;
  
  document.head.appendChild(style);
})();
