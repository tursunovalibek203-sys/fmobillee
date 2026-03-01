// Ombor qattiq validatsiya - Omborlar qo'shilib ketmasligi uchun

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB ulanish
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB ulandi');
    } catch (error) {
        console.error('❌ MongoDB ulanish xatosi:', error);
        process.exit(1);
    }
}

// Product Schema
const ProductSchema = new mongoose.Schema({
    productId: { type: Number, required: true, unique: true },
    branchId: { type: Number, default: 0 },
    name: { type: String, required: true },
    category: { type: String, default: 'Umumiy' },
    buyPrice: { type: Number, default: 0 },
    sellPrice: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 5 },
    unit: { type: String, default: 'dona' },
    barcode: String,
    imei: String,
    imeis: [String],
    description: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

async function validateWarehouse() {
    await connectDB();
    
    console.log('\n🔍 OMBOR VALIDATSIYA BOSHLANDI\n');
    console.log('='.repeat(60));
    
    // 1. Barcha mahsulotlarni olish
    const products = await Product.find({});
    console.log(`\n📦 Jami mahsulotlar: ${products.length}`);
    
    // 2. BranchId bo'yicha guruhlash
    const byBranch = {};
    products.forEach(p => {
        const bid = p.branchId || 0;
        if (!byBranch[bid]) byBranch[bid] = [];
        byBranch[bid].push(p);
    });
    
    console.log('\n📊 Filiallar bo\'yicha taqsimot:');
    console.log('-'.repeat(60));
    Object.keys(byBranch).sort().forEach(bid => {
        const branchName = bid === '0' ? 'Umumiy Ombor' : `Filial ${bid}`;
        console.log(`   ${branchName}: ${byBranch[bid].length} ta mahsulot`);
    });
    
    // 3. Duplicate tekshiruvi (bir xil nom va branchId)
    console.log('\n🔍 Duplicate tekshiruvi:');
    console.log('-'.repeat(60));
    
    const duplicates = [];
    const seen = new Map();
    
    products.forEach(p => {
        const key = `${p.name.toLowerCase()}_${p.branchId}`;
        if (seen.has(key)) {
            duplicates.push({
                name: p.name,
                branchId: p.branchId,
                productIds: [seen.get(key), p.productId]
            });
        } else {
            seen.set(key, p.productId);
        }
    });
    
    if (duplicates.length > 0) {
        console.log(`   ⚠️  ${duplicates.length} ta duplicate topildi:`);
        duplicates.forEach(d => {
            console.log(`      - ${d.name} (Filial ${d.branchId}): IDs ${d.productIds.join(', ')}`);
        });
    } else {
        console.log('   ✅ Duplicate topilmadi');
    }
    
    // 4. IMEI tekshiruvi (bir xil IMEI)
    console.log('\n🔍 IMEI tekshiruvi:');
    console.log('-'.repeat(60));
    
    const imeiProducts = products.filter(p => p.imei);
    const imeiMap = new Map();
    const duplicateImeis = [];
    
    imeiProducts.forEach(p => {
        if (imeiMap.has(p.imei)) {
            duplicateImeis.push({
                imei: p.imei,
                products: [imeiMap.get(p.imei), p.name]
            });
        } else {
            imeiMap.set(p.imei, p.name);
        }
    });
    
    if (duplicateImeis.length > 0) {
        console.log(`   ⚠️  ${duplicateImeis.length} ta duplicate IMEI topildi:`);
        duplicateImeis.forEach(d => {
            console.log(`      - IMEI ${d.imei}: ${d.products.join(', ')}`);
        });
    } else {
        console.log('   ✅ Duplicate IMEI topilmadi');
    }
    
    // 5. BranchId null yoki undefined tekshiruvi
    console.log('\n🔍 BranchId tekshiruvi:');
    console.log('-'.repeat(60));
    
    const noBranchId = products.filter(p => p.branchId === null || p.branchId === undefined);
    if (noBranchId.length > 0) {
        console.log(`   ⚠️  ${noBranchId.length} ta mahsulotda branchId yo'q:`);
        noBranchId.forEach(p => {
            console.log(`      - ${p.name} (ID: ${p.productId})`);
        });
    } else {
        console.log('   ✅ Barcha mahsulotlarda branchId mavjud');
    }
    
    // 6. Tavsiyalar
    console.log('\n💡 TAVSIYALAR:');
    console.log('-'.repeat(60));
    
    if (duplicates.length > 0) {
        console.log('   1. Duplicate mahsulotlarni o\'chiring yoki birlashtiring');
    }
    
    if (duplicateImeis.length > 0) {
        console.log('   2. Duplicate IMEI kodlarni tuzating');
    }
    
    if (noBranchId.length > 0) {
        console.log('   3. BranchId yo\'q mahsulotlarga branchId qo\'shing');
    }
    
    if (duplicates.length === 0 && duplicateImeis.length === 0 && noBranchId.length === 0) {
        console.log('   ✅ Hamma narsa tartibda!');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ VALIDATSIYA TUGADI\n');
    
    mongoose.connection.close();
}

// Duplicate mahsulotlarni o'chirish
async function removeDuplicates() {
    await connectDB();
    
    console.log('\n🗑️  DUPLICATE MAHSULOTLARNI O\'CHIRISH\n');
    console.log('='.repeat(60));
    
    const products = await Product.find({}).sort({ createdAt: 1 });
    const seen = new Map();
    const toDelete = [];
    
    products.forEach(p => {
        const key = `${p.name.toLowerCase()}_${p.branchId}`;
        if (seen.has(key)) {
            toDelete.push(p.productId);
            console.log(`   🗑️  O'chiriladi: ${p.name} (ID: ${p.productId}, Filial: ${p.branchId})`);
        } else {
            seen.set(key, p.productId);
        }
    });
    
    if (toDelete.length > 0) {
        await Product.deleteMany({ productId: { $in: toDelete } });
        console.log(`\n✅ ${toDelete.length} ta duplicate mahsulot o'chirildi`);
    } else {
        console.log('\n✅ Duplicate mahsulotlar topilmadi');
    }
    
    console.log('\n' + '='.repeat(60));
    
    mongoose.connection.close();
}

// Argumentlarni tekshirish
const args = process.argv.slice(2);

if (args.includes('--remove-duplicates')) {
    removeDuplicates();
} else {
    validateWarehouse();
}
