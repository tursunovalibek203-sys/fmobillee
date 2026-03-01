// Eski mahsulotlarni o'chirish va har bir filialga IMEI kodli mahsulotlar qo'shish

require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const { ProductSchema, BranchSchema } = require('./models/schemas');

const Product = mongoose.model('Product', ProductSchema);
const Branch = mongoose.model('Branch', BranchSchema);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      family: 4
    });
    console.log('✅ MongoDB ulandi');
    return true;
  } catch (error) {
    console.error('❌ MongoDB xato:', error.message);
    return false;
  }
}

// IMEI generator
function generateIMEI() {
  const prefix = '35'; // Standard IMEI prefix
  const tac = Math.floor(100000 + Math.random() * 900000); // 6 digits
  const serial = Math.floor(100000 + Math.random() * 900000); // 6 digits
  const checkDigit = Math.floor(Math.random() * 10); // 1 digit
  return `${prefix}${tac}${serial}${checkDigit}`;
}

async function clearAndAddProducts() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️  ESKI MAHSULOTLARNI O\'CHIRISH VA YANGI QOSHISH');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Eski mahsulotlarni o'chirish
    console.log('🗑️  1. ESKI MAHSULOTLARNI O\'CHIRISH\n');
    
    const deleteResult = await Product.deleteMany({});
    console.log(`✅ ${deleteResult.deletedCount} ta eski mahsulot o'chirildi\n`);

    // 2. Filiallarni tekshirish
    console.log('🏢 2. FILIALLARNI TEKSHIRISH\n');
    
    const branches = await Branch.find({ isActive: true });
    console.log(`Topildi: ${branches.length} ta faol filial\n`);
    
    branches.forEach(b => {
      console.log(`   - ${b.name} (ID: ${b.branchId})`);
    });

    // 3. Har bir filialga IMEI kodli mahsulotlar qo'shish
    console.log('\n📱 3. HAR BIR FILIALGA IMEI KODLI MAHSULOTLAR QO\'SHISH\n');

    let productIdCounter = 3001;
    const allNewProducts = [];

    for (const branch of branches) {
      console.log(`\n🏢 ${branch.name} (ID: ${branch.branchId})\n`);

      // iPhone 15 Pro Max - 10 ta (har biri alohida IMEI bilan)
      for (let i = 1; i <= 10; i++) {
        const product = {
          productId: productIdCounter++,
          branchId: branch.branchId,
          name: `iPhone 15 Pro Max ${i}`,
          category: 'Telefonlar',
          buyPrice: 1000,
          sellPrice: 1200,
          stock: 1,
          minStock: 1,
          unit: 'dona',
          imei: generateIMEI(),
          description: `iPhone 15 Pro Max - ${branch.name}`,
          isActive: true
        };
        allNewProducts.push(product);
        console.log(`   ✅ iPhone 15 Pro Max ${i} - IMEI: ${product.imei}`);
      }

      // Samsung S24 Ultra - 10 ta
      for (let i = 1; i <= 10; i++) {
        const product = {
          productId: productIdCounter++,
          branchId: branch.branchId,
          name: `Samsung S24 Ultra ${i}`,
          category: 'Telefonlar',
          buyPrice: 800,
          sellPrice: 950,
          stock: 1,
          minStock: 1,
          unit: 'dona',
          imei: generateIMEI(),
          description: `Samsung S24 Ultra - ${branch.name}`,
          isActive: true
        };
        allNewProducts.push(product);
        console.log(`   ✅ Samsung S24 Ultra ${i} - IMEI: ${product.imei}`);
      }

      // iPhone 14 Pro - 8 ta
      for (let i = 1; i <= 8; i++) {
        const product = {
          productId: productIdCounter++,
          branchId: branch.branchId,
          name: `iPhone 14 Pro ${i}`,
          category: 'Telefonlar',
          buyPrice: 750,
          sellPrice: 900,
          stock: 1,
          minStock: 1,
          unit: 'dona',
          imei: generateIMEI(),
          description: `iPhone 14 Pro - ${branch.name}`,
          isActive: true
        };
        allNewProducts.push(product);
        console.log(`   ✅ iPhone 14 Pro ${i} - IMEI: ${product.imei}`);
      }

      // Samsung S23 - 8 ta
      for (let i = 1; i <= 8; i++) {
        const product = {
          productId: productIdCounter++,
          branchId: branch.branchId,
          name: `Samsung S23 ${i}`,
          category: 'Telefonlar',
          buyPrice: 600,
          sellPrice: 720,
          stock: 1,
          minStock: 1,
          unit: 'dona',
          imei: generateIMEI(),
          description: `Samsung S23 - ${branch.name}`,
          isActive: true
        };
        allNewProducts.push(product);
        console.log(`   ✅ Samsung S23 ${i} - IMEI: ${product.imei}`);
      }

      // iPhone 13 - 5 ta
      for (let i = 1; i <= 5; i++) {
        const product = {
          productId: productIdCounter++,
          branchId: branch.branchId,
          name: `iPhone 13 ${i}`,
          category: 'Telefonlar',
          buyPrice: 550,
          sellPrice: 680,
          stock: 1,
          minStock: 1,
          unit: 'dona',
          imei: generateIMEI(),
          description: `iPhone 13 - ${branch.name}`,
          isActive: true
        };
        allNewProducts.push(product);
        console.log(`   ✅ iPhone 13 ${i} - IMEI: ${product.imei}`);
      }

      console.log(`\n   📊 Jami: 41 ta telefon qo'shildi`);
    }

    // 4. Umumiy ombor uchun aksessuarlar (IMEI siz)
    console.log('\n\n🏭 UMUMIY OMBOR (ID: 0)\n');

    const accessories = [
      { name: 'USB-C Kabel', buyPrice: 5, sellPrice: 10, stock: 100 },
      { name: 'Telefon Qopqog\'i', buyPrice: 3, sellPrice: 8, stock: 150 },
      { name: 'Ekran Himoyasi', buyPrice: 2, sellPrice: 5, stock: 200 },
      { name: 'AirPods Pro 2', buyPrice: 200, sellPrice: 250, stock: 20 },
      { name: 'Samsung Buds 2', buyPrice: 100, sellPrice: 130, stock: 25 },
      { name: 'Zaryadlovchi 20W', buyPrice: 10, sellPrice: 18, stock: 80 },
      { name: 'Power Bank 10000mAh', buyPrice: 15, sellPrice: 25, stock: 50 }
    ];

    for (const acc of accessories) {
      const product = {
        productId: productIdCounter++,
        branchId: 0,
        name: acc.name,
        category: 'Aksessuarlar',
        buyPrice: acc.buyPrice,
        sellPrice: acc.sellPrice,
        stock: acc.stock,
        minStock: 10,
        unit: 'dona',
        description: 'Umumiy ombor - Barcha filiallar uchun',
        isActive: true
      };
      allNewProducts.push(product);
      console.log(`   ✅ ${acc.name} - ${acc.stock} dona`);
    }

    // 5. Barcha mahsulotlarni saqlash
    console.log('\n\n💾 4. MAHSULOTLARNI SAQLASH\n');
    
    await Product.insertMany(allNewProducts);
    console.log(`✅ ${allNewProducts.length} ta mahsulot saqlandi\n`);

    // 6. Statistika
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 YAKUNIY STATISTIKA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const branch of branches) {
      const branchProducts = allNewProducts.filter(p => p.branchId === branch.branchId);
      const totalValue = branchProducts.reduce((sum, p) => sum + (p.stock * p.buyPrice), 0);
      const potentialRevenue = branchProducts.reduce((sum, p) => sum + (p.stock * p.sellPrice), 0);
      
      console.log(`🏢 ${branch.name}`);
      console.log(`   📱 Telefonlar: ${branchProducts.length} ta`);
      console.log(`   💰 Xarajat: $${totalValue.toFixed(2)}`);
      console.log(`   💵 Potensial daromad: $${potentialRevenue.toFixed(2)}`);
      console.log(`   📈 Potensial foyda: $${(potentialRevenue - totalValue).toFixed(2)}`);
      console.log('');
    }

    const commonProducts = allNewProducts.filter(p => p.branchId === 0);
    const commonValue = commonProducts.reduce((sum, p) => sum + (p.stock * p.buyPrice), 0);
    const commonRevenue = commonProducts.reduce((sum, p) => sum + (p.stock * p.sellPrice), 0);
    
    console.log('🏭 Umumiy Ombor');
    console.log(`   📦 Aksessuarlar: ${commonProducts.length} ta`);
    console.log(`   💰 Xarajat: $${commonValue.toFixed(2)}`);
    console.log(`   💵 Potensial daromad: $${commonRevenue.toFixed(2)}`);
    console.log(`   📈 Potensial foyda: $${(commonRevenue - commonValue).toFixed(2)}`);
    console.log('');

    const totalValue = allNewProducts.reduce((sum, p) => sum + (p.stock * p.buyPrice), 0);
    const totalRevenue = allNewProducts.reduce((sum, p) => sum + (p.stock * p.sellPrice), 0);
    
    console.log('📊 JAMI');
    console.log(`   📦 Mahsulotlar: ${allNewProducts.length} ta`);
    console.log(`   💰 Jami xarajat: $${totalValue.toFixed(2)}`);
    console.log(`   💵 Potensial daromad: $${totalRevenue.toFixed(2)}`);
    console.log(`   📈 Potensial foyda: $${(totalRevenue - totalValue).toFixed(2)}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ BARCHA AMALLAR MUVAFFAQIYATLI BAJARILDI!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ XATO:', error.message);
    console.error(error);
  }
}

async function main() {
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ MongoDB ga ulanib bo\'lmadi');
    process.exit(1);
  }

  await clearAndAddProducts();

  await mongoose.disconnect();
  console.log('🔌 MongoDB ulanish yopildi');
}

main();
