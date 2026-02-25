// ==================== CUSTOMER ROUTES ====================

const express = require('express');
const router = express.Router();

module.exports = (customerController) => {
  // Get all customers with optional filters
  router.get('/', customerController.getAllCustomers);

  // Search customer by ID
  router.get('/search/:customerId', customerController.getCustomerById);

  // Create new customer
  router.post('/', customerController.createCustomer);

  // Update customer
  router.put('/:customerId', customerController.updateCustomer);

  // Delete customer
  router.delete('/:customerId', customerController.deleteCustomer);

  return router;
};
