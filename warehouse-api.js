// ==================== OMBOR API HELPER FUNCTIONS ====================
// Bu fayl server.js dan ajratilgan ombor API funksiyalarini o'z ichiga oladi

const {
  Product: WarehouseProduct,
  Category,
  Supplier,
  StockMovement,
  Branch: WarehouseBranch,
  ProductItem,
  generateId,
  stockIn,
  stockOut,
  getLowStockProducts,
  getWarehouseStats
} = require('./warehouse-database');

// ==================== MAHSULOT FUNKSIYALARI ====================

/**
 * Mahsulotlarni qidirish (IMEI/Barcode/Nom orqali)
 */
async function searchProducts(query) {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, products: [] };
    }
    
    const products = await WarehouseProduct.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } },
        { productId: isNaN(query) ? 0 : Number(query) }
      ]
    }).limit(10);
    
    return {
      success: true,
      products: products.map(p => ({
        productId: p.productId,
        name: p.name,
        categoryName: p.categoryName,
        sellPrice: p.sellPrice,
        buyPrice: p.buyPrice,
        stock: p.stock,
        minStock: p.minStock,
        unit: p.unit,
        barcode: p.barcode,
        sku: p.sku,
        description: p.description
      }))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Bitta mahsulot ma'lumotlarini olish
 */
async function getProductById(productId) {
  try {
    const product = await WarehouseProduct.findOne({ 
      productId: Number(productId),
      isActive: true 
    });
    
    if (!product) {
      return { success: false, error: 'Mahsulot topilmadi' };
    }
    
    return {
      success: true,
      product: {
        productId: product.productId,
        branchId: product.branchId,
        name: product.name,
        categoryName: product.categoryName,
        sellPrice: product.sellPrice,
        buyPrice: product.buyPrice,
        stock: product.stock,
        minStock: product.minStock,
        maxStock: product.maxStock,
        unit: product.unit,
        barcode: product.barcode,
        sku: product.sku,
        description: product.description,
        supplierName: product.supplierName
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Barcha mahsulotlarni olish
 */
async function getAllProducts(branchId = null) {
  try {
    const query = { isActive: true };
    if (branchId) {
      query.branchId = Number(branchId);
    }
    
    const products = await WarehouseProduct.find(query).sort({ name: 1 });
    
    return {
      success: true,
      products: products.map(p => ({
        productId: p.productId,
        branchId: p.branchId,
        name: p.name,
        categoryName: p.categoryName,
        sellPrice: p.sellPrice,
        buyPrice: p.buyPrice,
        stock: p.stock,
        minStock: p.minStock,
        unit: p.unit,
        barcode: p.barcode
      })),
      count: products.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Yangi mahsulot qo'shish
 */
async function createProduct(productData) {
  try {
    const { 
      branchId,
      name, 
      categoryId, 
      categoryName, 
      buyPrice, 
      sellPrice, 
      stock, 
      minStock, 
      unit, 
      barcode, 
      sku, 
      description 
    } = productData;
    
    if (!name || !sellPrice) {
      return { success: false, error: 'Mahsulot nomi va narxi kiritilishi shart' };
    }
    
    const finalBranchId = branchId ? Number(branchId) : 1001;
    const productId = await generateId(WarehouseProduct);
    
    const product = await WarehouseProduct.create({
      productId,
      branchId: finalBranchId,
      name,
      categoryId: categoryId || null,
      categoryName: categoryName || 'Umumiy',
      buyPrice: buyPrice || 0,
      sellPrice,
      stock: stock || 0,
      minStock: minStock || 5,
      unit: unit || 'dona',
      barcode: barcode || undefined,
      sku: sku || undefined,
      description: description || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return {
      success: true,
      product,
      message: 'Mahsulot muvaffaqiyatli qo\'shildi'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ==================== IMEI / PRODUCT ITEMS FUNKSIYALARI ====================

/**
 * Mahsulotga IMEI qo'shish
 */
async function addProductItem(itemData) {
  try {
    const { 
      productId, 
      branchId, 
      imei, 
      serialNumber, 
      buyPrice, 
      sellPrice, 
      warranty, 
      condition, 
      notes 
    } = itemData;
    
    if (!productId || !imei) {
      return { success: false, error: 'Mahsulot ID va IMEI kiritilishi shart' };
    }
    
    // Parallel query
    const [product, existingItem] = await Promise.all([
      WarehouseProduct.findOne({ productId: Number(productId) }),
      ProductItem.findOne({ imei })
    ]);
    
    if (!product) {
      return { success: false, error: 'Mahsulot topilmadi' };
    }
    
    if (existingItem) {
      return { success: false, error: 'Bu IMEI allaqachon mavjud' };
    }
    
    const itemId = await generateId(ProductItem);
    
    // Parallel create va update
    const [item] = await Promise.all([
      ProductItem.create({
        itemId,
        productId: Number(productId),
        branchId: branchId || product.branchId,
        productName: product.name,
        imei,
        serialNumber: serialNumber || null,
        buyPrice: buyPrice || product.buyPrice,
        sellPrice: sellPrice || product.sellPrice,
        warranty: warranty || null,
        condition: condition || 'new',
        notes: notes || null,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      }),
      WarehouseProduct.updateOne(
        { productId: Number(productId) },
        { $inc: { stock: 1 } }
      )
    ]);
    
    return {
      success: true,
      item,
      message: 'IMEI muvaffaqiyatli qo\'shildi'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Mahsulot IMEI larini olish
 */
async function getProductItems(productId, status = null) {
  try {
    const query = { productId: Number(productId) };
    if (status) {
      query.status = status;
    }
    
    const items = await ProductItem.find(query).sort({ createdAt: -1 });
    
    return {
      success: true,
      items,
      count: items.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ==================== FILIAL FUNKSIYALARI ====================

/**
 * Barcha filiallarni olish
 */
async function getAllBranches() {
  try {
    const branches = await WarehouseBranch.find({ isActive: true }).sort({ name: 1 });
    
    return {
      success: true,
      branches,
      count: branches.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Yangi filial yaratish
 */
async function createBranch(branchData) {
  try {
    const { name, address, phone, manager } = branchData;
    
    if (!name) {
      return { success: false, error: 'Filial nomi kiritilishi shart' };
    }
    
    const branchId = await generateId(WarehouseBranch);
    
    const branch = await WarehouseBranch.create({
      branchId,
      name,
      address,
      phone,
      manager,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return {
      success: true,
      branch,
      message: 'Yangi filial yaratildi'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Filial statistikasi
 */
async function getBranchStats(branchId) {
  try {
    const branch = await WarehouseBranch.findOne({ branchId: Number(branchId) });
    if (!branch) {
      return { success: false, error: 'Filial topilmadi' };
    }
    
    const [totalProducts, totalItems, lowStockCount, totalStockValue] = await Promise.all([
      WarehouseProduct.countDocuments({ 
        branchId: Number(branchId), 
        isActive: true 
      }),
      ProductItem.countDocuments({
        branchId: Number(branchId),
        status: 'available'
      }),
      WarehouseProduct.countDocuments({
        branchId: Number(branchId),
        isActive: true,
        $expr: { $lte: ['$stock', '$minStock'] }
      }),
      WarehouseProduct.aggregate([
        { 
          $match: { 
            branchId: Number(branchId), 
            isActive: true 
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { 
              $sum: { 
                $multiply: [
                  { $ifNull: ['$stock', 0] }, 
                  { $ifNull: ['$buyPrice', 0] }
                ] 
              } 
            } 
          } 
        }
      ])
    ]);
    
    // totalStockValue ni xavfsiz olish
    const stockValue = totalStockValue && totalStockValue[0] && totalStockValue[0].total 
      ? parseFloat(totalStockValue[0].total) 
      : 0;
    
    return {
      success: true,
      stats: {
        branch,
        totalProducts,
        totalItems,
        lowStockCount,
        totalStockValue: isNaN(stockValue) ? 0 : stockValue
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ==================== KATEGORIYA FUNKSIYALARI ====================

/**
 * Barcha kategoriyalarni olish
 */
async function getAllCategories() {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    return {
      success: true,
      categories,
      count: categories.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ==================== MOVEMENTS (CHIQIM TARIXI) ====================

/**
 * Ombor chiqim tarixini olish
 */
async function getWarehouseMovements(filters = {}) {
  try {
    const { dateFrom, dateTo, branchId, cashierId } = filters;
    
    // Query yaratish
    const query = {
      status: 'sold'
    };
    
    if (branchId) {
      query.branchId = Number(branchId);
    }
    
    if (dateFrom || dateTo) {
      query.soldDate = {};
      if (dateFrom) {
        query.soldDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.soldDate.$lte = endDate;
      }
    }
    
    // Sotilgan mahsulotlarni olish
    const movements = await ProductItem.find(query)
      .sort({ soldDate: -1 })
      .lean();
    
    // Har bir movement uchun qo'shimcha ma'lumotlar
    const enrichedMovements = await Promise.all(
      movements.map(async (movement) => {
        // Mahsulot ma'lumotlari
        const product = await WarehouseProduct.findOne({ productId: movement.productId });
        
        // Filial ma'lumotlari
        const branch = await Branch.findOne({ branchId: movement.branchId });
        
        // Kassir ma'lumotlari (agar cashierId bo'lsa)
        let cashier = null;
        if (movement.soldBy) {
          cashier = await Cashier.findOne({ cashierId: movement.soldBy });
        }
        
        return {
          ...movement,
          productName: product?.name || 'N/A',
          branchName: branch?.name || `Filial ${movement.branchId}`,
          cashierName: cashier?.name || 'N/A',
          customerName: movement.soldTo || '-'
        };
      })
    );
    
    // Agar cashierId filter bo'lsa
    let filteredMovements = enrichedMovements;
    if (cashierId) {
      filteredMovements = enrichedMovements.filter(m => m.soldBy === Number(cashierId));
    }
    
    return {
      success: true,
      movements: filteredMovements,
      total: filteredMovements.length
    };
  } catch (error) {
    console.error('Get warehouse movements xato:', error);
    return { success: false, error: error.message };
  }
}

// ==================== EXPORT ====================

module.exports = {
  // Mahsulot funksiyalari
  searchProducts,
  getProductById,
  getAllProducts,
  createProduct,
  
  // IMEI funksiyalari
  addProductItem,
  getProductItems,
  
  // Filial funksiyalari
  getAllBranches,
  createBranch,
  getBranchStats,
  
  // Kategoriya funksiyalari
  getAllCategories,
  
  // Movements (Chiqim tarixi)
  getWarehouseMovements,
  
  // Database funksiyalari (re-export)
  stockIn,
  stockOut,
  getLowStockProducts,
  getWarehouseStats
};
