// Takrorlangan mahsulotlarni o'chirish

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

async function removeDuplicates() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️  TAKRORLANGAN MAHSULOTLARNI O\'CHIRISH');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const branches = [1001, 1002, 1003];
    let totalRemoved = 0;

    for (const branchId of branches) {
      console.log(`🏢 Filial ${branchId} tekshirilmoqda...`);
      
      const products = await Product.find({ branchId }).sort({ createdAt: 1 });
      console.log(`   Jami: ${products.length} ta mahsulot`);
      
      if (products.length <= 41) {
        console.log('   ✅ Takrorlanganlar yo\'q\n');
        continue;
      }

      // Birinchi 41 ta mahsulotni saqlash, qolganlarini o'chirish
      const toKeep = products.slice(0, 41);
      const toRemove = products.slice(41);

      console.log(`   🗑️  O'chiriladi: ${toRemove.length} ta`);

      for (const product of toRemove) {
        await Product.deleteOne({ _id: product._id });
      }

      totalRemoved += toRemove.length;
      console.log(`   ✅ O'chirildi: ${toRemove.length} ta\n`);
    }

    console.log(`✅ Jami ${totalRemoved} ta takrorlangan mahsulot o'chirildi`);

    // Yakuniy tekshirish
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 YAKUNIY HOLAT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const branchId of branches) {
      const count = await Product.countDocuments({ branchId });
      const withIMEI = await Product.countDocuments({ 
        branchId,
        imei: { $exists: true, $ne: null, $ne: '' }
      });
      
      console.log(`Filial ${branchId}:`);
      console.log(`   Mahsulotlar: ${count} ta`);
      console.log(`   IMEI bilan: ${withIMEI} ta`);
      console.log('');
    }

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

  await removeDuplicates();

  await mongoose.disconnect();
  console.log('🔌 MongoDB ulanish yopildi\n');
}

main();
