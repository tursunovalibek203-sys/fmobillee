// ==================== CUSTOMER SERVICE ====================

const IDGenerator = require('../utils/id-generator');
const Validators = require('../utils/validators');
const { ErrorHandler } = require('../middleware/error-handler');
const { HTTP_STATUS, ERRORS } = require('../config/constants');

class CustomerService {
  constructor(Customer, Sale, excelManager) {
    this.Customer = Customer;
    this.Sale = Sale;
    this.excelManager = excelManager;
  }

  async getAllCustomers(filters = {}) {
    const query = {};
    
    if (filters.hasDebt) {
      query.totalDebt = { $gt: 0 };
    }
    
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } }
      ];
    }

    return await this.Customer.find(query).sort({ name: 1 });
  }

  async getCustomerById(customerId) {
    const customer = await this.Customer.findOne({ customerId: Number(customerId) });
    
    if (!customer) {
      throw new ErrorHandler(ERRORS.CUSTOMER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const sales = await this.Sale.find({ customerId: Number(customerId) })
      .sort({ createdAt: -1 });

    return {
      ...customer.toObject(),
      salesHistory: sales
    };
  }

  async createCustomer(data) {
    const validation = Validators.validateCustomerData(data);
    
    if (!validation.isValid) {
      throw new ErrorHandler(validation.errors.join(', '), HTTP_STATUS.BAD_REQUEST);
    }

    const customerId = await IDGenerator.generateCustomerId(this.Customer);

    const customer = await this.Customer.create({
      customerId,
      name: Validators.sanitizeString(data.name),
      phone: data.phone ? Validators.sanitizeString(data.phone) : undefined,
      chatId: data.chatId,
      totalDebt: 0
    });

    // Create Excel file for customer
    try {
      await this.excelManager.createCustomerExcel(customer.name);
    } catch (error) {
      console.error('Excel yaratishda xato:', error.message);
    }

    return customer;
  }

  async updateCustomer(customerId, data) {
    const customer = await this.Customer.findOne({ customerId: Number(customerId) });
    
    if (!customer) {
      throw new ErrorHandler(ERRORS.CUSTOMER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (data.name) {
      customer.name = Validators.sanitizeString(data.name);
    }
    if (data.phone !== undefined) {
      customer.phone = data.phone ? Validators.sanitizeString(data.phone) : undefined;
    }
    if (data.chatId !== undefined) {
      customer.chatId = data.chatId;
    }

    await customer.save();
    return customer;
  }

  async deleteCustomer(customerId) {
    const customer = await this.Customer.findOneAndDelete({ 
      customerId: Number(customerId) 
    });
    
    if (!customer) {
      throw new ErrorHandler(ERRORS.CUSTOMER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Delete all sales for this customer
    await this.Sale.deleteMany({ customerId: Number(customerId) });

    return { message: 'Mijoz va uning savdolari o\'chirildi' };
  }

  async recalculateDebt(customerId) {
    const customer = await this.Customer.findOne({ customerId });
    
    if (!customer) {
      throw new ErrorHandler(ERRORS.CUSTOMER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const sales = await this.Sale.find({ customerId });
    
    const totalPrice = sales
      .filter(s => s.type === 'sale')
      .reduce((sum, s) => sum + s.price, 0);
    
    const totalPaid = sales.reduce((sum, s) => sum + s.paid, 0);
    
    customer.totalDebt = totalPrice - totalPaid;

    if (customer.totalDebt > 0 && !customer.firstDebtDate) {
      customer.firstDebtDate = new Date();
    } else if (customer.totalDebt <= 0) {
      customer.firstDebtDate = null;
    }

    await customer.save();
    return customer;
  }
}

module.exports = CustomerService;
