// Notification Service
// Bu fayl bildirishnomalar uchun ishlatiladi

const NotificationService = {
  // Brauzer bildirishnomalarini so'rash
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  // Bildirishnoma yuborish
  show(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });

      // Bildirishnomaga bosilganda
      notification.onclick = function(event) {
        event.preventDefault();
        window.focus();
        if (options.url) {
          window.location.href = options.url;
        }
        notification.close();
      };

      return notification;
    }
    return null;
  },

  // Savdo bildirishnomasi
  showSaleNotification(customerName, amount) {
    return this.show('Yangi savdo!', {
      body: `${customerName} - ${amount}`,
      tag: 'sale',
      requireInteraction: false
    });
  },

  // To'lov bildirishnomasi
  showPaymentNotification(customerName, amount) {
    return this.show('To\'lov qabul qilindi!', {
      body: `${customerName} - ${amount}`,
      tag: 'payment',
      requireInteraction: false
    });
  },

  // Qarz eslatmasi
  showDebtReminder(customerName, debtAmount) {
    return this.show('Qarz eslatmasi', {
      body: `${customerName} - Qarz: ${debtAmount}`,
      tag: 'debt-reminder',
      requireInteraction: true
    });
  },

  // Xatolik bildirishnomasi
  showError(message) {
    return this.show('Xatolik!', {
      body: message,
      tag: 'error',
      requireInteraction: false
    });
  },

  // Muvaffaqiyat bildirishnomasi
  showSuccess(message) {
    return this.show('Muvaffaqiyatli!', {
      body: message,
      tag: 'success',
      requireInteraction: false
    });
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationService;
}
