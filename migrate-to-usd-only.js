// ==================== MIGRATSIYA: FAQAT USD ====================
// So'm valyutasini olib tashlash va faqat dollarga o'tish

require('dotenv').config();
const mongoose = require('mongoose');

async function migrateToUSDOnly() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   💵 FAQAT USD MIGRATSIYA BOSHLANDI       ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // MongoDB ulanish
    console.log('1️⃣ MongoDB ga ulanish...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB ulandi\n');

    // Sales collection
    console.log('2️⃣ Sales collection ni yangilash...');
    const salesResult = await mongoose.connection.db.collection('sales').updateMany(
      {},
      {
        $unset: {
          paidUZS: "",
          exchangeRate: "",
          uzsToUSD: "",
          totalPaidUSD: ""
        }
      }
    );
    console.log(`✅ ${salesResult.modifiedCount} ta savdo yangilandi\n`);

    // CashierSales collection
    console.log('3️⃣ CashierSales collection ni yangilash...');
    const cashierSalesResult = await mongoose.connection.db.collection('cashiersales').updateMany(
      {},
      {
        $unset: {
          paidUZS: "",
          exchangeRate: "",
          uzsToUSD: "",
          totalPaidUSD: ""
        }
      }
    );
    console.log(`✅ ${cashierSalesResult.modifiedCount} ta kassir savdosi yangilandi\n`);

    // Cashiers collection
    console.log('4️⃣ Cashiers collection ni yangilash...');
    const cashiersResult = await mongoose.connection.db.collection('cashiers').updateMany(
      {},
      {
        $unset: {
          balanceUZS: ""
        }
      }
    );
    console.log(`✅ ${cashiersResult.modifiedCount} ta kassir yangilandi\n`);

    // Natija
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   ✅ MIGRATSIYA MUVAFFAQIYATLI!           ║');
    console.log('╚════════════════════════════════════════════╝\n');

    console.log('📊 Yangilangan ma\'lumotlar:');
    console.log(`   ✅ Savdolar: ${salesResult.modifiedCount}`);
    console.log(`   ✅ Kassir savdolari: ${cashierSalesResult.modifiedCount}`);
    console.log(`   ✅ Kassirlar: ${cashiersResult.modifiedCount}\n`);

    console.log('💵 Endi tizim faqat USD bilan ishlaydi!\n');

  } catch (error) {
    console.error('❌ Migratsiya xato:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB ulanish yopildi');
  }
}

// Migratsiya ishga tushirish
migrateToUSDOnly();
