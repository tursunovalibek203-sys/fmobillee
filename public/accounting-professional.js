// ==================== PROFESSIONAL ACCOUNTING SYSTEM ====================
// Super aniq hisob-kitoblar va savdolar tizimi

class ProfessionalAccounting {
  constructor() {
    this.precision = 2; // Decimal precision
    this.currency = 'USD';
    this.exchangeRate = 12700; // UZS to USD
  }

  // ==================== PULSUZ HISOBLASH ====================
  
  /**
   * Pulni aniq formatlash
   * @param {number} amount - Miqdor
   * @param {string} currency - Valyuta (USD/UZS)
   * @returns {string} Formatlangan pul
   */
  formatMoney(amount, currency = 'USD') {
    if (typeof amount !== 'number' || isNaN(amount)) {
      amount = 0;
    }
    
    if (currency === 'UZS') {
      return new Intl.NumberFormat('uz-UZ', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Math.round(amount)) + ' so\'m';
    } else {
      return '$' + new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(this.roundMoney(amount));
    }
  }

  /**
   * Pulni aniq yaxlitlash
   * @param {number} amount - Miqdor
   * @returns {number} Yaxlitlangan miqdor
   */
  roundMoney(amount) {
    return Math.round(amount * 100) / 100;
  }

  /**
   * UZS ni USD ga o'girish
   * @param {number} uzs - UZS miqdori
   * @returns {number} USD miqdori
   */
  convertUZStoUSD(uzs) {
    return this.roundMoney(uzs / this.exchangeRate);
  }

  /**
   * USD ni UZS ga o'girish
   * @param {number} usd - USD miqdori
   * @returns {number} UZS miqdori
   */
  convertUSDtoUZS(usd) {
    return Math.round(usd * this.exchangeRate);
  }

  // ==================== SAVDO HISOBLASH ====================
  
  /**
   * Savdo uchun to'liq hisob-kitob
   * @param {Object} sale - Savdo ma'lumotlari
   * @returns {Object} Hisoblangan savdo
   */
  calculateSale(sale) {
    const price = this.roundMoney(parseFloat(sale.price) || 0);
    const paidUSD = this.roundMoney(parseFloat(sale.paidUSD) || 0);
    const paidUZS = Math.round(parseFloat(sale.paidUZS) || 0);
    
    // UZS ni USD ga o'girish
    const uzsToUSD = this.convertUZStoUSD(paidUZS);
    
    // Jami to'langan (USD)
    const totalPaidUSD = this.roundMoney(paidUSD + uzsToUSD);
    
    // Qarz
    const debt = this.roundMoney(price - totalPaidUSD);
    
    // To'lov foizi
    const paymentPercent = price > 0 ? this.roundMoney((totalPaidUSD / price) * 100) : 0;
    
    return {
      saleId: sale.saleId || Date.now(),
      customerId: sale.customerId,
      customerName: sale.customerName,
      product: sale.product,
      price: price,
      paidUSD: paidUSD,
      paidUZS: paidUZS,
      uzsToUSD: uzsToUSD,
      totalPaidUSD: totalPaidUSD,
      debt: debt,
      paymentPercent: paymentPercent,
      isPaid: debt <= 0.01, // 1 cent dan kam bo'lsa to'langan
      date: sale.date || new Date().toLocaleDateString('uz-UZ'),
      time: sale.time || new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      type: sale.type || 'sale',
      cashierId: sale.cashierId,
      cashierName: sale.cashierName,
      branchId: sale.branchId,
      branchName: sale.branchName
    };
  }

  /**
   * To'lov qo'shish
   * @param {Object} payment - To'lov ma'lumotlari
   * @returns {Object} Hisoblangan to'lov
   */
  calculatePayment(payment) {
    const amountUSD = this.roundMoney(parseFloat(payment.amountUSD) || 0);
    const amountUZS = Math.round(parseFloat(payment.amountUZS) || 0);
    
    // UZS ni USD ga o'girish
    const uzsToUSD = this.convertUZStoUSD(amountUZS);
    
    // Jami to'lov (USD)
    const totalAmountUSD = this.roundMoney(amountUSD + uzsToUSD);
    
    return {
      paymentId: payment.paymentId || Date.now(),
      customerId: payment.customerId,
      customerName: payment.customerName,
      amountUSD: amountUSD,
      amountUZS: amountUZS,
      uzsToUSD: uzsToUSD,
      totalAmountUSD: totalAmountUSD,
      date: payment.date || new Date().toLocaleDateString('uz-UZ'),
      time: payment.time || new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      type: 'payment',
      cashierId: payment.cashierId,
      cashierName: payment.cashierName,
      notes: payment.notes || ''
    };
  }

  // ==================== MIJOZ HISOBLASH ====================
  
  /**
   * Mijoz uchun jami hisob-kitob
   * @param {Array} sales - Savdolar ro'yxati
   * @param {Array} payments - To'lovlar ro'yxati
   * @returns {Object} Mijoz hisobi
   */
  calculateCustomerBalance(sales, payments) {
    // Jami savdo
    const totalSales = sales.reduce((sum, s) => sum + (s.price || 0), 0);
    
    // Jami to'langan (savdolardan)
    const totalPaidFromSales = sales.reduce((sum, s) => sum + (s.totalPaidUSD || 0), 0);
    
    // Jami to'lovlar
    const totalPayments = payments.reduce((sum, p) => sum + (p.totalAmountUSD || 0), 0);
    
    // Jami to'langan
    const totalPaid = this.roundMoney(totalPaidFromSales + totalPayments);
    
    // Qarz
    const debt = this.roundMoney(totalSales - totalPaid);
    
    // To'lov foizi
    const paymentPercent = totalSales > 0 ? this.roundMoney((totalPaid / totalSales) * 100) : 0;
    
    return {
      totalSales: this.roundMoney(totalSales),
      totalPaid: totalPaid,
      debt: debt,
      paymentPercent: paymentPercent,
      salesCount: sales.length,
      paymentsCount: payments.length,
      hasDebt: debt > 0.01,
      isPaidFull: debt <= 0.01
    };
  }

  // ==================== KASSIR HISOBLASH ====================
  
  /**
   * Kassir uchun jami hisob-kitob
   * @param {Array} sales - Savdolar ro'yxati
   * @param {Array} handovers - Kirimlar ro'yxati
   * @returns {Object} Kassir hisobi
   */
  calculateCashierBalance(sales, handovers) {
    // Jami savdolar
    const totalSalesAmount = sales.reduce((sum, s) => sum + (s.price || 0), 0);
    
    // Jami to'langan (USD)
    const totalPaidUSD = sales.reduce((sum, s) => sum + (s.paidUSD || 0), 0);
    
    // Jami to'langan (UZS)
    const totalPaidUZS = sales.reduce((sum, s) => sum + (s.paidUZS || 0), 0);
    
    // UZS ni USD ga o'girish
    const totalUZStoUSD = this.convertUZStoUSD(totalPaidUZS);
    
    // Jami to'langan (USD ekvivalenti)
    const totalPaidInUSD = this.roundMoney(totalPaidUSD + totalUZStoUSD);
    
    // Jami kirimlar
    const totalHandovers = handovers.reduce((sum, h) => sum + (h.amount || 0), 0);
    
    // Kassadagi pul (USD)
    const balanceUSD = this.roundMoney(totalPaidUSD - totalHandovers);
    
    // Kassadagi pul (UZS)
    const balanceUZS = totalPaidUZS;
    
    // Jami balans (USD ekvivalenti)
    const totalBalance = this.roundMoney(balanceUSD + this.convertUZStoUSD(balanceUZS));
    
    return {
      totalSalesAmount: this.roundMoney(totalSalesAmount),
      totalPaidUSD: this.roundMoney(totalPaidUSD),
      totalPaidUZS: totalPaidUZS,
      totalUZStoUSD: this.roundMoney(totalUZStoUSD),
      totalPaidInUSD: totalPaidInUSD,
      totalHandovers: this.roundMoney(totalHandovers),
      balanceUSD: balanceUSD,
      balanceUZS: balanceUZS,
      totalBalance: totalBalance,
      salesCount: sales.length,
      handoversCount: handovers.length
    };
  }

  // ==================== STATISTIKA ====================
  
  /**
   * Kunlik statistika
   * @param {Array} sales - Savdolar ro'yxati
   * @param {string} date - Sana
   * @returns {Object} Kunlik statistika
   */
  calculateDailyStats(sales, date) {
    const daySales = sales.filter(s => s.date === date);
    
    const totalAmount = daySales.reduce((sum, s) => sum + (s.price || 0), 0);
    const totalPaid = daySales.reduce((sum, s) => sum + (s.totalPaidUSD || 0), 0);
    const totalDebt = daySales.reduce((sum, s) => sum + (s.debt || 0), 0);
    
    return {
      date: date,
      salesCount: daySales.length,
      totalAmount: this.roundMoney(totalAmount),
      totalPaid: this.roundMoney(totalPaid),
      totalDebt: this.roundMoney(totalDebt),
      avgCheck: daySales.length > 0 ? this.roundMoney(totalAmount / daySales.length) : 0,
      paymentPercent: totalAmount > 0 ? this.roundMoney((totalPaid / totalAmount) * 100) : 0
    };
  }

  /**
   * Oylik statistika
   * @param {Array} sales - Savdolar ro'yxati
   * @param {number} month - Oy (1-12)
   * @param {number} year - Yil
   * @returns {Object} Oylik statistika
   */
  calculateMonthlyStats(sales, month, year) {
    const monthSales = sales.filter(s => {
      const saleDate = new Date(s.date.split('.').reverse().join('-'));
      return saleDate.getMonth() + 1 === month && saleDate.getFullYear() === year;
    });
    
    const totalAmount = monthSales.reduce((sum, s) => sum + (s.price || 0), 0);
    const totalPaid = monthSales.reduce((sum, s) => sum + (s.totalPaidUSD || 0), 0);
    const totalDebt = monthSales.reduce((sum, s) => sum + (s.debt || 0), 0);
    
    // Kunlik o'rtacha
    const daysInMonth = new Date(year, month, 0).getDate();
    const avgDailySales = this.roundMoney(totalAmount / daysInMonth);
    
    return {
      month: month,
      year: year,
      salesCount: monthSales.length,
      totalAmount: this.roundMoney(totalAmount),
      totalPaid: this.roundMoney(totalPaid),
      totalDebt: this.roundMoney(totalDebt),
      avgCheck: monthSales.length > 0 ? this.roundMoney(totalAmount / monthSales.length) : 0,
      avgDailySales: avgDailySales,
      paymentPercent: totalAmount > 0 ? this.roundMoney((totalPaid / totalAmount) * 100) : 0
    };
  }

  // ==================== VALIDATSIYA ====================
  
  /**
   * Savdo ma'lumotlarini tekshirish
   * @param {Object} sale - Savdo ma'lumotlari
   * @returns {Object} Validatsiya natijasi
   */
  validateSale(sale) {
    const errors = [];
    
    if (!sale.customerId) {
      errors.push('Mijoz tanlanmagan');
    }
    
    if (!sale.product || sale.product.trim() === '') {
      errors.push('Mahsulot nomi kiritilmagan');
    }
    
    const price = parseFloat(sale.price);
    if (isNaN(price) || price <= 0) {
      errors.push('Narx noto\'g\'ri');
    }
    
    const paidUSD = parseFloat(sale.paidUSD) || 0;
    const paidUZS = parseFloat(sale.paidUZS) || 0;
    
    if (paidUSD < 0 || paidUZS < 0) {
      errors.push('To\'lov manfiy bo\'lishi mumkin emas');
    }
    
    if (paidUSD === 0 && paidUZS === 0) {
      errors.push('Kamida bitta valyutada to\'lov kiritilishi kerak');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * To'lov ma'lumotlarini tekshirish
   * @param {Object} payment - To'lov ma'lumotlari
   * @returns {Object} Validatsiya natijasi
   */
  validatePayment(payment) {
    const errors = [];
    
    if (!payment.customerId) {
      errors.push('Mijoz tanlanmagan');
    }
    
    const amountUSD = parseFloat(payment.amountUSD) || 0;
    const amountUZS = parseFloat(payment.amountUZS) || 0;
    
    if (amountUSD <= 0 && amountUZS <= 0) {
      errors.push('To\'lov miqdori noto\'g\'ri');
    }
    
    if (amountUSD < 0 || amountUZS < 0) {
      errors.push('To\'lov manfiy bo\'lishi mumkin emas');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // ==================== HISOBOT ====================
  
  /**
   * Batafsil hisobot yaratish
   * @param {Array} sales - Savdolar ro'yxati
   * @param {Array} payments - To'lovlar ro'yxati
   * @param {Array} handovers - Kirimlar ro'yxati
   * @returns {Object} Batafsil hisobot
   */
  generateDetailedReport(sales, payments, handovers) {
    const today = new Date().toLocaleDateString('uz-UZ');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Kunlik statistika
    const dailyStats = this.calculateDailyStats(sales, today);
    
    // Oylik statistika
    const monthlyStats = this.calculateMonthlyStats(sales, currentMonth, currentYear);
    
    // Jami statistika
    const totalSalesAmount = sales.reduce((sum, s) => sum + (s.price || 0), 0);
    const totalPaid = sales.reduce((sum, s) => sum + (s.totalPaidUSD || 0), 0);
    const totalPayments = payments.reduce((sum, p) => sum + (p.totalAmountUSD || 0), 0);
    const totalHandovers = handovers.reduce((sum, h) => sum + (h.amount || 0), 0);
    
    return {
      generatedAt: new Date().toISOString(),
      daily: dailyStats,
      monthly: monthlyStats,
      total: {
        salesCount: sales.length,
        paymentsCount: payments.length,
        handoversCount: handovers.length,
        totalSalesAmount: this.roundMoney(totalSalesAmount),
        totalPaid: this.roundMoney(totalPaid),
        totalPayments: this.roundMoney(totalPayments),
        totalHandovers: this.roundMoney(totalHandovers),
        totalDebt: this.roundMoney(totalSalesAmount - totalPaid - totalPayments)
      }
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProfessionalAccounting;
}

// Global instance
const accounting = new ProfessionalAccounting();
