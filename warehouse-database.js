// ==================== OMBOR MA'LUMOTLAR BAZASI ====================
// Alohida MongoDB ulanish - Ombor uchun
const mongoose = require('mongoose');
require('dotenv').config();

function srvToDirectUri(srvUri) {
  try {
    const s = srvUri.replace('mongodb+srv://', '');
    const atIdx = s.indexOf('@');
    if (atIdx <= 0) return null;
    const creds = s.substring(0, atIdx);
    const rest = s.substring(atIdx + 1);
    const colonIdx = creds.indexOf(':');
    const user = creds.substring(0, colonIdx);
    const pass = colonIdx >= 0 ? creds.substring(colonIdx + 1) : '';
    const host = rest.split('/')[0].split('?')[0];
    const db = rest.includes('/') ? rest.split('/')[1].split('?')[0] : 'dokon_db';
    if (host && user) {
      return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:27017/${db || 'dokon_db'}?ssl=true&directConnection=true`;
    }
  } catch (_) {}
  return null;
}

let warehouseConnection;

async function initWarehouseConnection() {
  try {
    let mongoUri = process.env.WAREHOUSE_MONGODB_URI || process.env.MONGODB_URI || process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/dokon_db';
    
    if (mongoUri && mongoUri.trim() !== '') {
      let uri = mongoUri;
      if (uri.includes('mongodb+srv://') && !uri.includes('appName=')) {
        uri += (uri.includes('?') ? '&' : '?') + 'appName=Cluster0';
      }
      const opts = { dbName: 'warehouse_db', serverSelectionTimeoutMS: 30000, connectTimeoutMS: 30000, socketTimeoutMS: 45000, family: 4 };
      
      try {
        warehouseConnection = mongoose.createConnection(uri, opts);
        warehouseConnection.on('connected', () => console.log('✅ Ombor MongoDB ulandi'));
        warehouseConnection.on('error', (err) => { console.error('❌ Ombor MongoDB xato:', err.message); warehouseConnection = null; });
        await warehouseConnection.asPromise();
      } catch (err) {
        const isSrvErr = err.message && (err.message.includes('querySrv') || err.message.includes('ECONNREFUSED'));
        const tryUri = process.env.MONGODB_URI_STANDARD || (isSrvErr ? srvToDirectUri(uri) : null);
        if (tryUri && tryUri.startsWith('mongodb://')) {
          warehouseConnection = mongoose.createConnection(tryUri, { ...opts, directConnection: true });
          warehouseConnection.on('connected', () => console.log('✅ Ombor MongoDB ulandi (direct)'));
          warehouseConnection.on('error', (e) => { console.error('❌ Ombor MongoDB xato:', e.message); warehouseConnection = null; });
          await warehouseConnection.asPromise();
        } else throw err;
      }
    } else {
      console.log('⚠️ MongoDB URI topilmadi, ombor JSON rejimida ishlaydi');
      warehouseConnection = null;
    }
  } catch (error) {
    console.error('❌ Ombor MongoDB ulanish xatosi:', error.message);
    warehouseConnection = null;
  }
}

initWarehouseConnection();

// ==================== OMBOR SCHEMAS ====================

// Mahsulot kategoriyasi
const CategorySchema = new mongoose.Schema({
  categoryId: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: String,
  icon: String,
  color: { type: String, default: '#3498db' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Mahsulot
const ProductSchema = new mongoose.Schema({
  productId: { type: Number, required: true, unique: true },
  branchId: { type: Number, default: 1001 }, // Qaysi filialga tegishli (default: asosiy filial)
  name: { type: String, required: true },
  categoryId: { type: Number, ref: 'Category' },
  categoryName: String,
  
  // Narxlar
  buyPrice: { type: Number, default: 0 },
  sellPrice: { type: Number, required: true },
  wholesalePrice: { type: Number, default: 0 }, // Ulgurji narx
  minPrice: { type: Number, default: 0 }, // Minimal narx
  
  // Ombor ma'lumotlari
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 5 },
  maxStock: { type: Number, default: 1000 },
  unit: { type: String, default: 'dona' }, // dona, kg, litr, metr
  
  // Qo'shimcha ma'lumotlar
  barcode: { type: String, sparse: true, default: undefined }, // Default undefined to avoid null duplicates
  sku: { type: String, sparse: true, default: undefined }, // Stock Keeping Unit - default undefined to avoid null duplicates
  description: String,
  image: String,
  
  // Yetkazib beruvchi
  supplierId: { type: Number, ref: 'Supplier' },
  supplierName: String,
  
  // Status
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  
  // Statistika
  totalSold: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  lastSaleDate: Date,
  lastRestockDate: Date,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index - har bir filialda unique barcode (faqat mavjud bo'lganda)
ProductSchema.index({ branchId: 1, barcode: 1 }, { unique: true, partialFilterExpression: { barcode: { $exists: true, $type: 'string' } } });
// SKU index - faqat mavjud bo'lganda
ProductSchema.index({ sku: 1 }, { unique: true, partialFilterExpression: { sku: { $exists: true, $type: 'string' } } });

// Yetkazib beruvchi
const SupplierSchema = new mongoose.Schema({
  supplierId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  company: String,
  phone: String,
  email: String,
  address: String,
  
  // Moliyaviy ma'lumotlar
  totalDebt: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  
  // Qo'shimcha
  notes: String,
  rating: { type: Number, min: 1, max: 5, default: 5 },
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ombor harakati (kirim-chiqim)
const StockMovementSchema = new mongoose.Schema({
  movementId: { type: Number, required: true, unique: true },
  branchId: { type: Number, default: 1001 }, // Qaysi filialda (default: asosiy filial)
  productId: { type: Number, required: true, ref: 'Product' },
  productName: String,
  
  // Harakat turi
  type: { 
    type: String, 
    enum: ['in', 'out', 'return', 'adjustment', 'transfer'],
    required: true 
  },
  // in - kirim, out - chiqim, return - qaytarish, adjustment - tuzatish, transfer - ko'chirish
  
  quantity: { type: Number, required: true },
  price: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  
  // Qoldiq
  stockBefore: { type: Number, required: true },
  stockAfter: { type: Number, required: true },
  
  // Yetkazib beruvchi (faqat kirim uchun)
  supplierId: { type: Number, ref: 'Supplier' },
  supplierName: String,
  
  // Sabab va izoh
  reason: String,
  notes: String,
  
  // Kim amalga oshirdi
  userId: String,
  userName: String,
  
  date: { type: String, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Inventarizatsiya
const InventoryCheckSchema = new mongoose.Schema({
  checkId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Tekshirilgan mahsulotlar
  items: [{
    productId: Number,
    productName: String,
    expectedStock: Number,
    actualStock: Number,
    difference: Number,
    notes: String
  }],
  
  // Natijalar
  totalProducts: { type: Number, default: 0 },
  totalDifference: { type: Number, default: 0 },
  
  // Kim tekshirdi
  userId: String,
  userName: String,
  
  startDate: Date,
  endDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ombor sozlamalari
const WarehouseSettingsSchema = new mongoose.Schema({
  // Ogohlantirish sozlamalari
  lowStockAlert: { type: Boolean, default: true },
  lowStockThreshold: { type: Number, default: 5 },
  
  expiryAlert: { type: Boolean, default: true },
  expiryDays: { type: Number, default: 30 },
  
  // Avtomatik hisob-kitob
  autoCalculateProfit: { type: Boolean, default: true },
  autoUpdateStock: { type: Boolean, default: true },
  
  // Barcode sozlamalari
  barcodePrefix: { type: String, default: 'WH' },
  barcodeLength: { type: Number, default: 10 },
  
  // Umumiy
  currency: { type: String, default: 'USD' },
  language: { type: String, default: 'uz' },
  
  updatedAt: { type: Date, default: Date.now }
});

// Filial Schema
const BranchSchema = new mongoose.Schema({
  branchId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  address: String,
  phone: String,
  manager: String,
  isActive: { type: Boolean, default: true },
  
  // Statistika
  totalProducts: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// IMEI/Serial Number Schema - Har bir mahsulot nusxasi uchun
const ProductItemSchema = new mongoose.Schema({
  itemId: { type: Number, required: true, unique: true },
  productId: { type: Number, required: true, ref: 'Product' },
  branchId: { type: Number, required: true },
  productName: String,
  
  // IMEI yoki Serial Number
  imei: { type: String, required: true },
  serialNumber: String,
  
  // Status
  status: { 
    type: String, 
    enum: ['available', 'sold', 'reserved', 'damaged', 'returned'],
    default: 'available'
  },
  
  // Narxlar
  buyPrice: { type: Number, default: 0 },
  sellPrice: { type: Number, required: true },
  
  // Sotilgan ma'lumotlar
  soldDate: Date,
  soldTo: String,
  soldBy: String,
  saleId: Number,
  
  // Qo'shimcha
  notes: String,
  warranty: String,
  condition: { type: String, default: 'new' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexlar - faqat bir marta
ProductItemSchema.index({ imei: 1 }, { unique: true });
ProductItemSchema.index({ productId: 1, status: 1 });
ProductItemSchema.index({ branchId: 1, status: 1 });

// ==================== MODELS ====================

let Category, Product, Supplier, StockMovement, InventoryCheck, WarehouseSettings, Branch, ProductItem;

if (warehouseConnection) {
  Category = warehouseConnection.model('Category', CategorySchema);
  Product = warehouseConnection.model('WarehouseProduct', ProductSchema);
  Supplier = warehouseConnection.model('Supplier', SupplierSchema);
  StockMovement = warehouseConnection.model('StockMovement', StockMovementSchema);
  InventoryCheck = warehouseConnection.model('InventoryCheck', InventoryCheckSchema);
  WarehouseSettings = warehouseConnection.model('WarehouseSettings', WarehouseSettingsSchema);
  Branch = warehouseConnection.model('Branch', BranchSchema);
  ProductItem = warehouseConnection.model('ProductItem', ProductItemSchema);
} else {
  // MongoDB ulanish yo'q bo'lsa, null qiymatlar
  Category = Product = Supplier = StockMovement = InventoryCheck = WarehouseSettings = Branch = ProductItem = null;
}

// ==================== HELPER FUNCTIONS ====================

// ID generator
async function generateId(model) {
  const lastItem = await model.findOne().sort({ createdAt: -1 });
  if (!lastItem) return 1001;
  
  const idField = Object.keys(lastItem.toObject()).find(key => key.endsWith('Id'));
  return (lastItem[idField] || 1000) + 1;
}

// Mahsulot qo'shish
async function addProduct(productData) {
  try {
    const productId = await generateId(Product);
    
    const product = await Product.create({
      productId,
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return { success: true, product };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Mahsulot kiritish (stock in)
async function stockIn(productId, quantity, price, supplierId, supplierName, notes, userId, userName) {
  try {
    const product = await Product.findOne({ productId });
    if (!product) {
      return { success: false, error: 'Mahsulot topilmadi' };
    }
    
    const stockBefore = product.stock;
    const stockAfter = stockBefore + quantity;
    
    // Mahsulot qoldiqini yangilash
    product.stock = stockAfter;
    product.lastRestockDate = new Date();
    product.updatedAt = new Date();
    await product.save();
    
    // Harakat yozish
    const movementId = await generateId(StockMovement);
    const movement = await StockMovement.create({
      movementId,
      productId,
      productName: product.name,
      type: 'in',
      quantity,
      price,
      totalAmount: quantity * price,
      stockBefore,
      stockAfter,
      supplierId,
      supplierName,
      notes,
      userId,
      userName,
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ'),
      createdAt: new Date()
    });
    
    return { success: true, product, movement };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Mahsulot chiqarish (stock out)
async function stockOut(productId, quantity, reason, notes, userId, userName) {
  try {
    const product = await Product.findOne({ productId });
    if (!product) {
      return { success: false, error: 'Mahsulot topilmadi' };
    }
    
    if (product.stock < quantity) {
      return { success: false, error: 'Omborda yetarli mahsulot yo\'q' };
    }
    
    const stockBefore = product.stock;
    const stockAfter = stockBefore - quantity;
    
    // Mahsulot qoldiqini yangilash
    product.stock = stockAfter;
    product.totalSold += quantity;
    product.lastSaleDate = new Date();
    product.updatedAt = new Date();
    await product.save();
    
    // Harakat yozish
    const movementId = await generateId(StockMovement);
    const movement = await StockMovement.create({
      movementId,
      productId,
      productName: product.name,
      type: 'out',
      quantity,
      price: product.sellPrice,
      totalAmount: quantity * product.sellPrice,
      stockBefore,
      stockAfter,
      reason,
      notes,
      userId,
      userName,
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ'),
      createdAt: new Date()
    });
    
    return { success: true, product, movement };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Kam qolgan mahsulotlar
async function getLowStockProducts() {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$minStock'] }
    }).sort({ stock: 1 });
    
    return { success: true, products, count: products.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Ombor statistikasi
async function getWarehouseStats() {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalCategories = await Category.countDocuments({ isActive: true });
    const totalSuppliers = await Supplier.countDocuments({ isActive: true });
    
    const lowStockCount = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$stock', '$minStock'] }
    });
    
    const totalStockValue = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$stock', '$buyPrice'] } } } }
    ]);
    
    const totalRevenue = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalRevenue' } } }
    ]);
    
    return {
      success: true,
      stats: {
        totalProducts,
        totalCategories,
        totalSuppliers,
        lowStockCount,
        totalStockValue: totalStockValue[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Database ni ishga tushirish
async function initWarehouseDB() {
  try {
    console.log('🏭 Ombor ma\'lumotlar bazasi ishga tushirilmoqda...');
    
    // MongoDB ulanish yo'qligini tekshirish
    if (!warehouseConnection || !Branch) {
      console.log('⚠️ MongoDB ulanmagan, ombor JSON rejimida ishlaydi');
      return false;
    }
    
    // Default filial yaratish
    const branchCount = await Branch.countDocuments();
    if (branchCount === 0) {
      await Branch.create({
        branchId: 1001,
        name: 'Asosiy Filial',
        address: 'Toshkent',
        phone: '+998 90 123 45 67',
        manager: 'Admin',
        isActive: true
      });
      console.log('✅ Default filial yaratildi');
    }
    
    // Default sozlamalarni yaratish
    const settingsCount = await WarehouseSettings.countDocuments();
    if (settingsCount === 0) {
      await WarehouseSettings.create({
        lowStockAlert: true,
        lowStockThreshold: 5,
        autoCalculateProfit: true,
        autoUpdateStock: true
      });
      console.log('✅ Ombor sozlamalari yaratildi');
    }
    
    // Default kategoriyalarni yaratish
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        { categoryId: 1001, name: 'Oziq-ovqat', icon: '🍎', color: '#e74c3c' },
        { categoryId: 1002, name: 'Ichimliklar', icon: '🥤', color: '#3498db' },
        { categoryId: 1003, name: 'Maishiy texnika', icon: '📱', color: '#9b59b6' },
        { categoryId: 1004, name: 'Kiyim-kechak', icon: '👕', color: '#1abc9c' },
        { categoryId: 1005, name: 'Boshqa', icon: '📦', color: '#95a5a6' }
      ];
      
      await Category.insertMany(defaultCategories);
      console.log('✅ Default kategoriyalar yaratildi');
    }
    
    console.log('✅ Ombor ma\'lumotlar bazasi tayyor!');
    return true;
  } catch (error) {
    console.error('❌ Ombor DB xato:', error.message);
    return false;
  }
}

// ==================== EXPORT ====================

module.exports = {
  warehouseConnection,
  
  // Models
  Category,
  Product,
  Supplier,
  StockMovement,
  InventoryCheck,
  WarehouseSettings,
  Branch,
  ProductItem,
  
  // Functions
  generateId,
  addProduct,
  stockIn,
  stockOut,
  getLowStockProducts,
  getWarehouseStats,
  initWarehouseDB
};
