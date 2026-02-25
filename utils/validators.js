// ==================== PROFESSIONAL VALIDATORS ====================

const { VALIDATION } = require('../config/constants');

class Validators {
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone) {
    return VALIDATION.PHONE_REGEX.test(phone);
  }

  static isValidPassword(password) {
    return password && password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
  }

  static isPositiveNumber(value) {
    return typeof value === 'number' && value >= 0;
  }

  static isValidString(str, maxLength = VALIDATION.MAX_NAME_LENGTH) {
    return typeof str === 'string' && str.trim().length > 0 && str.length <= maxLength;
  }

  static sanitizeString(str) {
    return str ? str.trim().replace(/\s+/g, ' ') : '';
  }

  static validateSaleData(data) {
    const errors = [];

    if (!data.customerId) {
      errors.push('Mijoz ID kiritilishi shart');
    }

    if (data.type === 'sale') {
      if (!this.isValidString(data.product)) {
        errors.push('Mahsulot nomi noto\'g\'ri');
      }
      if (!this.isPositiveNumber(data.price) || data.price <= 0) {
        errors.push('Narx musbat son bo\'lishi kerak');
      }
    }

    if (!this.isPositiveNumber(data.paid)) {
      errors.push('To\'lov miqdori noto\'g\'ri');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateCustomerData(data) {
    const errors = [];

    if (!this.isValidString(data.name)) {
      errors.push('Mijoz ismi noto\'g\'ri');
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Telefon raqami noto\'g\'ri formatda');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateProductData(data) {
    const errors = [];

    if (!this.isValidString(data.name)) {
      errors.push('Mahsulot nomi noto\'g\'ri');
    }

    if (!this.isPositiveNumber(data.sellPrice) || data.sellPrice <= 0) {
      errors.push('Sotish narxi musbat son bo\'lishi kerak');
    }

    if (data.buyPrice !== undefined && !this.isPositiveNumber(data.buyPrice)) {
      errors.push('Sotib olish narxi noto\'g\'ri');
    }

    if (data.stock !== undefined && !this.isPositiveNumber(data.stock)) {
      errors.push('Ombordagi miqdor noto\'g\'ri');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = Validators;
