// ==================== PRODUCT CONTROLLER ====================

const asyncHandler = require('../middleware/async-handler');
const ResponseHandler = require('../utils/response-handler');
const ProductService = require('../services/product.service');

class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  getAllProducts = asyncHandler(async (req, res) => {
    const { category, lowStock, search } = req.query;
    const filters = { 
      category, 
      lowStock: lowStock === 'true', 
      search 
    };
    
    const products = await this.productService.getAllProducts(filters);
    
    ResponseHandler.success(res, products, 'Mahsulotlar ro\'yxati');
  });

  getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const product = await this.productService.getProductById(productId);
    
    ResponseHandler.success(res, product, 'Mahsulot topildi');
  });

  createProduct = asyncHandler(async (req, res) => {
    const product = await this.productService.createProduct(req.body);
    
    ResponseHandler.created(res, product, 'Yangi mahsulot yaratildi');
  });

  updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const product = await this.productService.updateProduct(productId, req.body);
    
    ResponseHandler.success(res, product, 'Mahsulot yangilandi');
  });

  deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const result = await this.productService.deleteProduct(productId);
    
    ResponseHandler.success(res, result, 'Mahsulot o\'chirildi');
  });

  searchProducts = asyncHandler(async (req, res) => {
    const { query } = req.params;
    const products = await this.productService.searchProducts(query);
    
    ResponseHandler.success(res, products, 'Qidiruv natijalari');
  });

  getLowStockProducts = asyncHandler(async (req, res) => {
    const products = await this.productService.getLowStockProducts();
    
    ResponseHandler.success(res, products, 'Kam qolgan mahsulotlar');
  });

  getCategories = asyncHandler(async (req, res) => {
    const categories = await this.productService.getCategories();
    
    ResponseHandler.success(res, categories, 'Kategoriyalar ro\'yxati');
  });

  updateStock = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity, operation } = req.body;
    
    const product = await this.productService.updateStock(productId, quantity, operation);
    
    ResponseHandler.success(res, product, 'Ombor yangilandi');
  });
}

module.exports = ProductController;
