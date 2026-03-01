// IMEI kodlarni to'g'ridan-to'g'ri qo'shish

require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const { ProductSchema } = require('./models/schemas');

const Product = mongoose.model('Product', ProductSchema);

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

function generateIMEI() {
  const prefix = '35';
  const tac = Math.floor(100000 + Math.random() * 900000);
  const serial = Math.floor(100000 + Math.random() * 900000);
  const checkDigit = Math.floor(Math.random() * 10);
  return `${prefix}${tac}${serial}${checkDigit}`;
}

async function addIMEI() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 IMEI KODLARNI QO\'SHISH');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Barcha telefonlarni olish
    const products = await Product.find({ 
      branchId: { $ne: 0 },
      category: 'Telefonlar'
    });
    
    console.log(`Jami telefonlar: ${products.length} ta\n`);
    
    let updated = 0;
    
    for (const product of products) {
      const imei = generateIMEI();
      
      // To'g'ridan-to'g'ri update
      const result = await Product.updateOne(
        { _id: product._id },
        { $set: { imei: imei } }
      );
      
      if (result.modifiedCount > 0) {
        updated++;
        if (updated <= 5) {
          console.log(`✅ ${product.name} - IMEI: ${imei}`);
        }
      }
    }
    
    if (updated > 5) {
      console.log(`... va yana ${updated - 5} ta`);
    }
    
    console.log(`\n✅ Jami ${updated} ta mahsulot yangilandi`);
    
    // Tekshirish
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 TEKSHIRISH');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const withIMEI = await Product.countDocuments({
      branchId: { $ne: 0 },
      category: 'Telefonlar',
      imei: { $exists: true, $ne: null, $ne: '' }
    });
    
    console.log(`IMEI bilan telefonlar: ${withIMEI} ta`);
    
    // Birinchi 3 ta mahsulotni ko'rsatish
    const samples = await Product.find({
      branchId: 1001,
      category: 'Telefonlar'
    }).limit(3);
    
    console.log('\nNamunalar:\n');
    samples.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   IMEI: ${p.imei || 'Yo\'q'}`);
      console.log('');
    });

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

  await addIMEI();

  await mongoose.disconnect();
  console.log('🔌 MongoDB ulanish yopildi\n');
}

main();
