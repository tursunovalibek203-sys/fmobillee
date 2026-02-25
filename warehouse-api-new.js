// ==================== IDEAL OMBOR API ====================
const express = require('express');
const router = express.Router();

// Ombor database ni import qilish
const {
  Category,
  Product,
  Supplier,
  StockMovement,
  InventoryCheck,
  WarehouseSettings,
  generateId,
  addProduct,
  stockIn,
  stockOut,
  getLowStockProducts,
  getWarehouseStats
} = require('./warehouse-database');

// ==================== KATEGORIYALAR ====================

// Barcha kategoriyalar
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kategoriya qo'shish
router.post('/categories', async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Kategoriya nomi kiritilmagan' });
    }
    
    const categoryId = await generateId(Category);
    const category = await Category.create({
      categoryId,
      name,
      description,
      icon,
      color,
      createdAt: new Date()
    });
    
    res.json({ success: true, category, message: 'Kategoriya qo\'shildi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kategoriya yangilash
router.put('/categories/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, icon, color } = req.body;
    
    const category = await Category.findOneAndUpdate(
      { categoryId: Number(categoryId) },
      { name, description, icon, color, updatedAt: new Date() },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ success: false, error: 'Kategoriya topilmadi' });
    }
    
    res.json({ success: true, category, message: 'Kategoriya yangilandi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kategoriya o'chirish
router.delete('/categories/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    await Category.findOneAndUpdate(
      { categoryId: Number(categoryId) },
      { isActive: false, updatedAt: new Date() }
    );
    
    res.json({ success: true, message: 'Kategoriya o\'chirildi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== MAHSULOTLAR ====================

// Barcha mahsulotlar
router.get('/products', async (req, res) => {
  try {
    const { categoryId, search, lowStock } = req.query;
    
    let query = { isActive: true };
    
    if (categoryId) {
      query.categoryId = Number(categoryId);
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: search },
        { sku: search }
      ];
    }
    
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$minStock'] };
    }
    
    const products = await Product.find(query).sort({ name: 1 });
    
    res.json({ success: true, products, count: products.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mahsulot qo'shish
router.post('/products', async (req, res) => {
  try {
    const result = await addProduct(req.body);
    
    if (result.success) {
      res.json({ ...result, message: 'Mahsulot qo\'shildi' });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mahsulot yangilash
router.put('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const product = await Product.findOneAndUpdate(
      { productId: Number(productId) },
      updateData,
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' });
    }
    
    res.json({ success: true, product, message: 'Mahsulot yangilandi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mahsulot o'chirish
router.delete('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    await Product.findOneAndUpdate(
      { productId: Number(productId) },
      { isActive: false, updatedAt: new Date() }
    );
    
    res.json({ success: true, message: 'Mahsulot o\'chirildi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mahsulot qidirish
router.get('/products/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { barcode: query },
        { sku: query },
        { productId: Number(query) || 0 }
      ]
    }).limit(20);
    
    res.json({ success: true, products, count: products.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kam qolgan mahsulotlar
router.get('/products/low-stock', async (req, res) => {
  try {
    const result = await getLowStockProducts();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== OMBOR HARAKATLARI ====================

// Mahsulot kiritish
router.post('/stock/in', async (req, res) => {
  try {
    const { productId, quantity, price, supplierId, supplierName, notes, userId, userName } = req.body;
    
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mahsulot ID va miqdor kiritilishi shart' 
      });
    }
    
    const result = await stockIn(
      productId, 
      quantity, 
      price || 0, 
      supplierId, 
      supplierName, 
      notes, 
      userId, 
      userName
    );
    
    if (result.success) {
      res.json({ ...result, message: 'Mahsulot omborga kiritildi' });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mahsulot chiqarish
router.post('/stock/out', async (req, res) => {
  try {
    const { productId, quantity, reason, notes, userId, userName } = req.body;
    
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mahsulot ID va miqdor kiritilishi shart' 
      });
    }
    
    const result = await stockOut(productId, quantity, reason, notes, userId, userName);
    
    if (result.success) {
      res.json({ ...result, message: 'Mahsulot ombordan chiqarildi' });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Barcha harakatlar
router.get('/stock/movements', async (req, res) => {
  try {
    const { productId, type, startDate, endDate } = req.query;
    
    let query = {};
    
    if (productId) {
      query.productId = Number(productId);
    }
    
    if (type) {
      query.type = type;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const movements = await StockMovement.find(query)
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ success: true, movements, count: movements.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mahsulot harakatlari tarixi
router.get('/stock/movements/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const movements = await StockMovement.find({ 
      productId: Number(productId) 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, movements, count: movements.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== YETKAZIB BERUVCHILAR ====================

// Barcha yetkazib beruvchilar
router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, suppliers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Yetkazib beruvchi qo'shish
router.post('/suppliers', async (req, res) => {
  try {
    const { name, company, phone, email, address, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Ism kiritilmagan' });
    }
    
    const supplierId = await generateId(Supplier);
    const supplier = await Supplier.create({
      supplierId,
      name,
      company,
      phone,
      email,
      address,
      notes,
      createdAt: new Date()
    });
    
    res.json({ success: true, supplier, message: 'Yetkazib beruvchi qo\'shildi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Yetkazib beruvchi yangilash
router.put('/suppliers/:supplierId', async (req, res) => {
  try {
    const { supplierId } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const supplier = await Supplier.findOneAndUpdate(
      { supplierId: Number(supplierId) },
      updateData,
      { new: true }
    );
    
    if (!supplier) {
      return res.status(404).json({ success: false, error: 'Yetkazib beruvchi topilmadi' });
    }
    
    res.json({ success: true, supplier, message: 'Yetkazib beruvchi yangilandi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Yetkazib beruvchi o'chirish
router.delete('/suppliers/:supplierId', async (req, res) => {
  try {
    const { supplierId } = 