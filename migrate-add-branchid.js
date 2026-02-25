// Migration: Add branchId to existing products
require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
  try {
    console.log('🔄 Migration boshlandi: branchId qo\'shish...');
    
    // Warehouse database ga ulanish
    const warehouseConnection = mongoose.createConnection(
      process.env.WAREHOUSE_MONGODB_URI || process.env.MONGODB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'warehouse_db'
      }
    );
    
    await new Promise((resolve, reject) => {
      warehouseConnection.once('connected', resolve);
      warehouseConnection.once('error', reject);
    });
    
    console.log('✅ Database ulandi');
    
    // Product collection
    const Product = warehouseConnection.collection('products');
    
    // branchId yo'q mahsulotlarni topish
    const productsWithoutBranch = await Product.find({ 
      branchId: { $exists: false } 
    }).toArray();
    
    console.log(`📦 ${productsWithoutBranch.length} ta mahsulotga branchId qo'shilmoqda...`);
    
    if (productsWithoutBranch.length > 0) {
      // Barcha mahsulotlarga default branchId (1001) qo'shish
      const result = await Product.updateMany(
        { branchId: { $exists: false } },
        { $set: { branchId: 1001 } }
      );
      
      console.log(`✅ ${result.modifiedCount} ta mahsulot yangilandi`);
    } else {
      console.log('✅ Barcha mahsulotlarda branchId mavjud');
    }
    
    // StockMovement collection
    const StockMovement = warehouseConnection.collection('stockmovements');
    
    const movementsWithoutBranch = await StockMovement.find({ 
      branchId: { $exists: false } 
    }).toArray();
    
    console.log(`📊 ${movementsWithoutBranch.length} ta harakatga branchId qo'shilmoqda...`);
    
    if (movementsWithoutBranch.length > 0) {
      const result = await StockMovement.updateMany(
        { branchId: { $exists: false } },
        { $set: { branchId: 1001 } }
      );
      
      console.log(`✅ ${result.modifiedCount} ta harakat yangilandi`);
    } else {
      console.log('✅ Barcha harakatlarda branchId mavjud');
    }
    
    // Branch yaratish
    const Branch = warehouseConnection.collection('branches');
    const branchExists = await Branch.findOne({ branchId: 1001 });
    
    if (!branchExists) {
      await Branch.insertOne({
        branchId: 1001,
        name: 'Asosiy Filial',
        address: 'Toshkent',
        phone: '+998 90 123 45 67',
        manager: 'Admin',
        isActive: true,
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Default filial yaratildi');
    } else {
      console.log('✅ Default filial mavjud');
    }
    
    console.log('✅ Migration muvaffaqiyatli yakunlandi!');
    
    await warehouseConnection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration xatosi:', error);
    process.exit(1);
  }
}

migrate();
