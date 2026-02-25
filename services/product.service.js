// ==================== PRODUCT SERVICE ====================

const IDGenerator = require('../utils/id-generator');
const Validators = require('../utils/validators');
const { ErrorHandler } = require('../middleware/error-handler');
const { HTTP_STATUS, ERRORS, DEFAULTS } = require('../config/constants');

class ProductService {
  constructor(Product) {
    this.Product = Product;
  }

  async getAllProducts(filters = {}) {
    const query = { isActive: true };
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.lowStock) {
      query.$expr = { $lte: ['$stock', '$minStock'] };
    }
    
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { barcode: filters.search }
      ];
    }

    return await this.Product.find(query).sort({ name: 1 });
  }

  async getProductById(productId) {
    const product = await this.Product.findOne({ 
      productId: Number(productId),
      isActive: true 
    });
    
    if (!product) {
      throw new ErrorHandler(ERRORS.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return product;
  }

  async createProduct(data) {
    const validation = Validators.validateProductData(data);
    
    if (!validation.isValid) {
      throw new ErrorHandler(validation.errors.join(', '), HTTP_STATUS.BAD_REQUEST);
    }

    const productId = await IDGenerator.generateProductId(this.Product);

    const product = await this.Product.create({
      productId,
      name: Validators.sanitizeString(data.name),
      category: data.category || DEFAULTS.CATEGORY,
      buyPrice: data.buyPrice || 0,
      sellPrice: data.sellPrice,
      stock: data.stock || 0,
      minStock: data.minStock || DEFAULTS.MIN_STOCK,
      unit: data.unit || DEFAULTS.UNIT,
      barcode: data.barcode,
      description: data.description ? Validators.sanitizeString(data.description) : undefined
    });

    return product;
  }

  async updateProduct(productId, data) {
    const product = await this.Product.findOne({ 
      productId: Number(productId),
      isActive: true 
    });
    
    if (!product) {
      throw new ErrorHandler(ERRORS.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Update fields
    const updateFields = ['name', 'category', 'buyPrice', 'sellPrice', 'stock', 'minStock', 'unit', 'barcode', 'description'];
    
    updateFields.forEach(field => {
      if (data[field] !== undefined) {
        if (field === 'name' || field === 'description') {
          product[field] = Validators.sanitizeString(data[field]);
        } else {
          product[field] = data[field];
        }
      }
    });

    await product.save();
    return product;
  }

  async deleteProduct(productId) {
    const product = await this.Product.findOneAndUpdate(
      { productId: Number(productId) },
      { isActive: false },
      { new: true }
    );
    
    if (!product) {
      throw new ErrorHandler(ERRORS.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return { message: 'Mahsulot o\'chirildi' };
  }

  async searchProducts(query) {
    const products = await this.Product.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { barcode: query },
        { productId: Number(query) || 0 }
      ]
    }).limit(10);

    return products;
  }

  async getLowStockProducts() {
    return await this.Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$minStock'] }
    }).sort({ stock: 1 });
  }

  async getCategories() {
    return await this.Product.distinct('category', { isActive: true });
  }

  async updateStock(productId, quantity, operation = 'add') {
    const product = await this.getProductById(productId);

    if (operation === 'add') {
      product.stock += quantity;
    } else if (operation === 'subtract') {
      if (product.stock < quantity) {
        throw new ErrorHandler('Omborda yetarli mahsulot yo\'q', HTTP_STATUS.BAD_REQUEST);
      }
      product.stock -= quantity;
    } else {
      product.stock = quantity;
    }

    await product.save();
    return product;
  }
}

module.exports = ProductService;
