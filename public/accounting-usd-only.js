// ==================== USD ONLY ACCOUNTING SYSTEM ====================
// Faqat dollar valyutasi bilan ishlash

class USDAccounting {
  constructor() {
    this.precision = 2; // Decimal precision
    this.currency = 'USD';
  }

  // ==================== PULSUZ HISOBLASH ====================
  
  /**
   * Pulni aniq formatlash (USD)
   * @param {number} amount - Miqdor
   * @returns {string} Formatlangan pul
   */
  formatMoney(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      amount = 0;
    }
    
    return '$' + new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(this.roundMoney(amount));
  }

  /**
   * Pulni aniq yaxlitlash
   * @param {number} amount - Miqdor
   * @returns {number} Yaxlitlangan miqdor
   */
  roundMoney(amount) {
    return Math.round(amount * 100) / 100;
  }

  // ==================== SAVDO HISOBLASH ====================
  
  /**
   * Savdo uchun to'liq hisob-kitob
   * @param {Object} sale - Savdo ma'lumotlari
   * @returns {Object} Hisoblangan savdo
   */
  calculateSale(sale) {
    const price = this.roundMoney(parseFloat(sale.price) || 0);
    const paid = this.roundMoney(parseFloat(sale.paid) || 0);
    
    // Qarz
    const debt = this.roundMoney((Number(price) || 0) - (Number(paid) || 0));
    
    // To'lov foizi
    const paymentPercent = price > 0 ? this.roundMoney((paid / price) * 100) : 0;
    
    return {
      saleId: sale.saleId || Date.now(),
      customerId: sale.customerId,
      customerName: sale.customerName,
      product: sale.product,
      price: price,
      paid: paid,
      debt: debt,
      paymentPercent: paymentPercent,
      isPaidFull: debt <= 0,
      date: sale.date || new Date().toLocaleDateString('uz-UZ'),
      time: sale.time || new Date().toLocaleTimeString('uz-UZ')
    };
  }

  /**
   * Savdoni validatsiya qilish
   * @param {Object} sale - Savdo ma'lumotlari
   * @returns {Object} Validatsiya natijasi
   */
  validateSale(sale) {
    const errors = [];
    
    if (!sale.customerId) {
      errors.push('Mijoz ID kiritilmagan');
    }
    
    if (!sale.customerName || sale.customerName.trim() === '') {
      errors.push('Mijoz ismi kiritilmagan');
    }
    
    if (!sale.product || sale.product.trim() === '') {
      errors.push('Mahsulot nomi kiritilmagan');
    }
    
    const price = parseFloat(sale.price);
    if (isNaN(price) || price <= 0) {
      errors.push('Narx noto\'g\'ri');
    }
    
    const paid = parseFloat(sale.paid);
    if (isNaN(paid) || paid < 0) {
      errors.push('To\'lov miqdori noto\'g\'ri');
    }
    
    if (paid > price) {
      errors.push('To\'lov narxdan oshib ketgan');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // ==================== KASSIR HISOBLASH ====================
  
  /**
   * Kassir balansi va statistikasini hisoblash
   * @param {Array} sales - Savdolar ro'yxati
   * @param {Array} handovers - Kirim berishlar ro'yxati
   * @returns {Object} Kassir statistikasi
   */
  calculateCashierBalance(sales, handovers = []) {
    // Jami savdo summasi
    const totalSalesAmount = sales.reduce((sum, s) => sum + (s.price || 0), 0);
    
    // Jami to'langan
    const totalPaid = sales.reduce((sum, s) => sum + (s.paid || 0), 0);
    
    // Jami kirim berilgan
    const totalHandovers = handovers.reduce((sum, h) => sum + (h.amount || 0), 0);
    
    // Kassadagi pul
    const balance = this.roundMoney(totalPaid - totalHandovers);
    
    return {
      totalSalesAmount: this.roundMoney(totalSalesAmount),
      totalPaid: this.roundMoney(totalPaid),
      totalHandovers: this.roundMoney(totalHandovers),
      balance: balance,
      salesCount: sales.length,
      handoversCount: handovers.length,
      averageSale: sales.length > 0 ? this.roundMoney(totalSalesAmount / sales.length) : 0
    };
  }

  /**
   * Kirim berishni hisoblash
   * @param {number} currentBalance - Hozirgi balans
   * @param {number} handoverAmount - Beriladigan miqdor
   * @returns {Object} Kirim berish natijasi
   */
  calculateHandover(currentBalance, handoverAmount) {
    const balanceBefore = this.roundMoney(currentBalance);
    const amount = this.roundMoney(handoverAmount);
    const balanceAfter = this.roundMoney(balanceBefore - amount);
    
    const errors = [];
    
    if (amount <= 0) {
      errors.push('Kirim berish miqdori noto\'g\'ri');
    }
    
    if (amount > balanceBefore) {
      errors.push('Kassada yetarli pul yo\'q');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      balanceBefore: balanceBefore,
      amount: amount,
      balanceAfter: balanceAfter
    };
  }

  // ==================== HISOBOTLAR ====================
  
  /**
   * Kunlik hisobot
   * @param {Array} sales - Savdolar ro'yxati
   * @param {string} date - Sana
   * @returns {Object} Kunlik hisobot
   */
  dailyReport(sales, date) {
    const daySales = sales.filter(s => s.date === date);
    
    const totalSales = daySales.length;
    const totalRevenue = daySales.reduce((sum, s) => sum + (s.paid || 0), 0);
    const totalDebt = daySales.reduce((sum, s) => sum + (Number(s.debt) || 0), 0);
    
    return {
      date: date,
      totalSales: totalSales,
      totalRevenue: this.roundMoney(totalRevenue),
      totalDebt: this.roundMoney(totalDebt),
      averageSale: totalSales > 0 ? this.roundMoney(totalRevenue / totalSales) : 0
    };
  }

  /**
   * Mijoz hisoboti
   * @param {Array} sales - Mijoz savdolari
   * @returns {Object} Mijoz hisoboti
   */
  customerReport(sales) {
    const totalPurchases = sales.filter(s => s.type === 'sale').length;
    const totalPayments = sales.filter(s => s.type === 'payment').length;
    
    const totalAmount = sales
      .filter(s => s.type === 'sale')
      .reduce((sum, s) => sum + (s.price || 0), 0);
    
    const totalPaid = sales.reduce((sum, s) => sum + (s.paid || 0), 0);
    
    const totalDebt = this.roundMoney(totalAmount - totalPaid);
    
    return {
      totalPurchases: totalPurchases,
      totalPayments: totalPayments,
      totalAmount: this.roundMoney(totalAmount),
      totalPaid: this.roundMoney(totalPaid),
      totalDebt: totalDebt,
      hasDebt: totalDebt > 0
    };
  }

  // ==================== UTILITY FUNCTIONS ====================
  
  /**
   * Foizni hisoblash
   * @param {number} part - Qism
   * @param {number} total - Jami
   * @returns {number} Foiz
   */
  calculatePercent(part, total) {
    if (total === 0) return 0;
    return this.roundMoney((part / total) * 100);
  }

  /**
   * Chegirmani hisoblash
   * @param {number} price - Asl narx
   * @param {number} discount - Chegirma foizi
   * @returns {Object} Chegirma hisoblash natijasi
   */
  calculateDiscount(price, discount) {
    const originalPrice = this.roundMoney(price);
    const discountPercent = this.roundMoney(discount);
    const discountAmount = this.roundMoney((originalPrice * discountPercent) / 100);
    const finalPrice = this.roundMoney(originalPrice - discountAmount);
    
    return {
      originalPrice: originalPrice,
      discountPercent: discountPercent,
      discountAmount: discountAmount,
      finalPrice: finalPrice
    };
  }

  /**
   * Foydani hisoblash
   * @param {number} buyPrice - Sotib olish narxi
   * @param {number} sellPrice - Sotish narxi
   * @returns {Object} Foyda hisoblash natijasi
   */
  calculateProfit(buyPrice, sellPrice) {
    const buy = this.roundMoney(buyPrice);
    const sell = this.roundMoney(sellPrice);
    const profit = this.roundMoney(sell - buy);
    const profitPercent = buy > 0 ? this.roundMoney((profit / buy) * 100) : 0;
    
    return {
      buyPrice: buy,
      sellPrice: sell,
      profit: profit,
      profitPercent: profitPercent
    };
  }
}

// Global instance
const accounting = new USDAccounting();
