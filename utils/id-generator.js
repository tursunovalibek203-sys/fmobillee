// ==================== PROFESSIONAL ID GENERATOR ====================

const { ID_RANGES } = require('../config/constants');

class IDGenerator {
  static async generateUniqueId(Model, field, range) {
    const { MIN, MAX } = range;
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const id = Math.floor(MIN + Math.random() * (MAX - MIN + 1));
      const query = {};
      query[field] = id;
      
      const exists = await Model.findOne(query);
      if (!exists) {
        return id;
      }
      attempts++;
    }

    throw new Error(`ID generatsiya qilishda xatolik: ${maxAttempts} urinishdan keyin topilmadi`);
  }

  static async generateCustomerId(CustomerModel) {
    return this.generateUniqueId(CustomerModel, 'customerId', ID_RANGES.CUSTOMER);
  }

  static async generateProductId(ProductModel) {
    return this.generateUniqueId(ProductModel, 'productId', ID_RANGES.PRODUCT);
  }

  static async generateCashierId(CashierModel) {
    return this.generateUniqueId(CashierModel, 'cashierId', ID_RANGES.CASHIER);
  }

  static async generateBranchId(BranchModel) {
    return this.generateUniqueId(BranchModel, 'branchId', ID_RANGES.BRANCH);
  }
}

module.exports = IDGenerator;
