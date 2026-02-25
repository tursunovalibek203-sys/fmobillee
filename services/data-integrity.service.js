// ==================== DATA INTEGRITY SERVICE ====================
// Ma'lumotlar yaxlitligini ta'minlash

const crypto = require('crypto');

class DataIntegrityService {
  constructor() {
    this.checksums = new Map();
  }

  // Ma'lumot uchun checksum yaratish
  generateChecksum(data) {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
  }

  // Ma'lumotni tekshirish
  verifyData(data, expectedChecksum) {
    const actualChecksum = this.generateChecksum(data);
    return actualChecksum === expectedChecksum;
  }

  // Savdo ma'lumotlarini validatsiya qilish
  validateSale(sale) {
    const errors = [];

    // Asosiy maydonlar
    if (!sale.saleId || typeof sale.saleId !== 'number') {
      errors.push('Savdo ID noto\'g\'ri');
    }

    if (!sale.customerId || typeof sale.customerId !== 'number') {
      errors.push('Mijoz ID noto\'g\'ri');
    }

    if (!sale.customerName || sale.customerName.trim() === '') {
      errors.push('Mijoz ismi bo\'sh');
    }

    // Narx validatsiyasi
    if (sale.type === 'sale') {
      if (!sale.product || sale.product.trim() === '') {
        errors.push('Mahsulot nomi bo\'sh');
      }

      if (!sale.price || sale.price <= 0) {
        errors.push('Narx noto\'g\'ri');
      }
    }

    // To'lov validatsiyasi
    if (sale.paid < 0) {
      errors.push('To\'lov manfiy bo\'lishi mumkin emas');
    }

    if (sale.type === 'sale' && sale.paid > sale.price) {
      errors.push('To\'lov narxdan oshib ketgan');
    }

    // Sana validatsiyasi
    if (!sale.date || !this.isValidDate(sale.date)) {
      errors.push('Sana noto\'g\'ri');
    }

    if (!sale.time || !this.isValidTime(sale.time)) {
      errors.push('Vaqt noto\'g\'ri');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Mijoz ma'lumotlarini validatsiya qilish
  validateCustomer(customer) {
    const errors = [];

    if (!customer.customerId || typeof customer.customerId !== 'number') {
      errors.push('Mijoz ID noto\'g\'ri');
    }

    if (!customer.name || customer.name.trim() === '') {
      errors.push('Mijoz ismi bo\'sh');
    }

    if (customer.name && customer.name.length > 100) {
      errors.push('Mijoz ismi juda uzun (max 100 belgi)');
    }

    if (customer.phone && !this.isValidPhone(customer.phone)) {
      errors.push('Telefon raqam noto\'g\'ri formatda');
    }

    if (customer.totalDebt && typeof customer.totalDebt !== 'number') {
      errors.push('Qarz summasi noto\'g\'ri');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Mahsulot ma'lumotlarini validatsiya qilish
  validateProduct(product) {
    const errors = [];

    if (!product.productId || typeof product.productId !== 'number') {
      errors.push('Mahsulot ID noto\'g\'ri');
    }

    if (!product.name || product.name.trim() === '') {
      errors.push('Mahsulot nomi bo\'sh');
    }

    if (product.sellPrice <= 0) {
      errors.push('Sotish narxi noto\'g\'ri');
    }

    if (product.buyPrice < 0) {
      errors.push('Sotib olish narxi manfiy');
    }

    if (product.buyPrice > product.sellPrice) {
      errors.push('Sotib olish narxi sotish narxidan katta');
    }

    if (product.stock < 0) {
      errors.push('Ombor miqdori manfiy');
    }

    if (product.minStock < 0) {
      errors.push('Minimal miqdor manfiy');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Sana validatsiyasi
  isValidDate(dateString) {
    // Format: DD.MM.YYYY yoki DD/MM/YYYY
    const regex = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/;
    const match = dateString.match(regex);
    
    if (!match) return false;

    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = parseInt(match[3]);

    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 2020 || year > 2100) return false;

    return true;
  }

  // Vaqt validatsiyasi
  isValidTime(timeString) {
    // Format: HH:MM yoki HH:MM:SS
    const regex = /^(\d{1,2}):(\d{2})(:\d{2})?$/;
    const match = timeString.match(regex);
    
    if (!match) return false;

    const hour = parseInt(match[1]);
    const minute = parseInt(match[2]);

    if (hour < 0 || hour > 23) return false;
    if (minute < 0 || minute > 59) return false;

    return true;
  }

  // Telefon validatsiyasi
  isValidPhone(phone) {
    // O'zbekiston telefon raqamlari: +998XXXXXXXXX yoki 998XXXXXXXXX
    const regex = /^(\+?998)?[0-9]{9}$/;
    return regex.test(phone.replace(/[\s\-()]/g, ''));
  }

  // Dublikat tekshirish
  async checkDuplicate(collection, field, value, excludeId = null) {
    try {
      const query = { [field]: value };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      
      const existing = await collection.findOne(query);
      return existing !== null;
    } catch (error) {
      console.error('❌ Dublikat tekshirish xato:', error);
      return false;
    }
  }

  // Ma'lumotlar sinxronligini tekshirish
  async verifySyncIntegrity(mongoData, excelData) {
    const issues = [];

    // Miqdor tekshiruvi
    if (mongoData.length !== excelData.length) {
      issues.push({
        type: 'COUNT_MISMATCH',
        message: `MongoDB: ${mongoData.length}, Excel: ${excelData.length}`
      });
    }

    // Har bir yozuvni tekshirish
    for (const mongoRecord of mongoData) {
      const excelRecord = excelData.find(e => e.saleId === mongoRecord.saleId);
      
      if (!excelRecord) {
        issues.push({
          type: 'MISSING_IN_EXCEL',
          saleId: mongoRecord.saleId,
          message: 'MongoDB da bor, Excel da yo\'q'
        });
        continue;
      }

      // Ma'lumotlar mos kelishini tekshirish
      if (mongoRecord.price !== excelRecord.price) {
        issues.push({
          type: 'PRICE_MISMATCH',
          saleId: mongoRecord.saleId,
          mongo: mongoRecord.price,
          excel: excelRecord.price
        });
      }

      if (mongoRecord.paid !== excelRecord.paid) {
        issues.push({
          type: 'PAID_MISMATCH',
          saleId: mongoRecord.saleId,
          mongo: mongoRecord.paid,
          excel: excelRecord.paid
        });
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      summary: {
        mongoCount: mongoData.length,
        excelCount: excelData.length,
        issuesFound: issues.length
      }
    };
  }

  // Qarz hisoblashni tekshirish
  calculateDebt(sales) {
    let totalPrice = 0;
    let totalPaid = 0;

    for (const sale of sales) {
      if (sale.type === 'sale') {
        totalPrice += sale.price;
      }
      totalPaid += sale.paid;
    }

    return {
      totalPrice,
      totalPaid,
      debt: totalPrice - totalPaid,
      isValid: totalPrice >= totalPaid
    };
  }

  // Sanitize input (XSS prevention)
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // HTML teglarni olib tashlash
      .replace(/javascript:/gi, '') // JavaScript injection oldini olish
      .replace(/on\w+=/gi, '') // Event handlerlarni olib tashlash
      .trim();
  }

  // SQL Injection prevention
  escapeSQL(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  }

  // Ma'lumotlarni tozalash
  cleanData(data) {
    const cleaned = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        cleaned[key] = this.sanitizeInput(value);
      } else if (typeof value === 'number') {
        cleaned[key] = isNaN(value) ? 0 : value;
      } else {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }
}

module.exports = DataIntegrityService;
