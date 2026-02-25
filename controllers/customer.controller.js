// ==================== CUSTOMER CONTROLLER ====================

const asyncHandler = require('../middleware/async-handler');
const ResponseHandler = require('../utils/response-handler');
const CustomerService = require('../services/customer.service');

class CustomerController {
  constructor(customerService) {
    this.customerService = customerService;
  }

  getAllCustomers = asyncHandler(async (req, res) => {
    const { hasDebt, search } = req.query;
    const filters = { hasDebt: hasDebt === 'true', search };
    
    const customers = await this.customerService.getAllCustomers(filters);
    
    ResponseHandler.success(res, customers, 'Mijozlar ro\'yxati');
  });

  getCustomerById = asyncHandler(async (req, res) => {
    const { customerId } = req.params;
    const customer = await this.customerService.getCustomerById(customerId);
    
    ResponseHandler.success(res, customer, 'Mijoz topildi');
  });

  createCustomer = asyncHandler(async (req, res) => {
    const customer = await this.customerService.createCustomer(req.body);
    
    ResponseHandler.created(res, customer, 'Yangi mijoz yaratildi');
  });

  updateCustomer = asyncHandler(async (req, res) => {
    const { customerId } = req.params;
    const customer = await this.customerService.updateCustomer(customerId, req.body);
    
    ResponseHandler.success(res, customer, 'Mijoz yangilandi');
  });

  deleteCustomer = asyncHandler(async (req, res) => {
    const { customerId } = req.params;
    const result = await this.customerService.deleteCustomer(customerId);
    
    ResponseHandler.success(res, result, 'Mijoz o\'chirildi');
  });
}

module.exports = CustomerController;
