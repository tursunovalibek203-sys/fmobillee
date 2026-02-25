// ==================== PROFESSIONAL CONSTANTS ====================

module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // ID Generation Ranges
  ID_RANGES: {
    CUSTOMER: { MIN: 100000, MAX: 999999 },
    PRODUCT: { MIN: 1000, MAX: 9999 },
    CASHIER: { MIN: 1000, MAX: 9999 },
    BRANCH: { MIN: 100, MAX: 999 }
  },

  // Default Values
  DEFAULTS: {
    CURRENCY: 'USD',
    LANGUAGE: 'uz',
    THEME: 'blue',
    MIN_STOCK: 5,
    UNIT: 'dona',
    CATEGORY: 'Umumiy'
  },

  // Validation Rules
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    PHONE_REGEX: /^[\d\s\+\-\(\)]+$/
  },

  // Error Messages
  ERRORS: {
    CUSTOMER_NOT_FOUND: 'Mijoz topilmadi',
    PRODUCT_NOT_FOUND: 'Mahsulot topilmadi',
    INVALID_CREDENTIALS: 'Login yoki parol noto\'g\'ri',
    MISSING_REQUIRED_FIELDS: 'Majburiy maydonlar to\'ldirilmagan',
    INVALID_DATA: 'Noto\'g\'ri ma\'lumotlar',
    DATABASE_ERROR: 'Ma\'lumotlar bazasi xatosi'
  }
};
