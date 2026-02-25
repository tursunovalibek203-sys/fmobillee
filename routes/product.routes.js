// ==================== PRODUCT ROUTES ====================

const express = require('express');
const router = express.Router();

module.exports = (productController) => {
  // Get all products with optional filters
  router.get('/', productController.getAllProducts);

  // Search products
  router.get('/search/:query', productController.searchProducts);

  // Get low stock products
  router.get('/low-stock', productController.getLowStockProducts);

  // Get categories
  router.get('/categories', productController.getCategories);

  // Get product by ID
  router.get('/:productId', productController.getProductById);

  // Create new product
  router.post('/', productController.createProduct);

  // Update product
  router.put('/:productId', productController.updateProduct);

  // Update stock
  router.patch('/:productId/stock', productController.updateStock);

  // Delete product (soft delete)
  router.delete('/:productId', productController.deleteProduct);

  return router;
};
