// Test ma'lumotlar generatori - Tarixlarni ko'paytirish

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('TEST MALUMOTLAR GENERATORI\n');
console.log('='.repeat(70));

// Schemas
const ProductSchema = new mongoose.Schema({
    productId: { type: Number, required: true, unique: true },
    branchId: { type: Number, required: true },
    name: String,
    category: String,
    buyPrice: Number,
    sellPrice: Number,
    stock: Number,
    minStock: Number,
    imei: String,
    createdAt: { type: Date, default: Date.now }
});

const CashierSaleSchema = new mongoose.Schema({
    saleId: { type: Number, required: true, unique: true },
    branchId: { type: Number, required: true },
    cashierId: { type: Number, required: true },
    product: String,
    price: Number,
    paid: Number,
    debt: Number,
    currency: String,
    date: String,
    createdAt: { type: Date, default: Date.now }
});

const CashierHandoverSchema = new mongoose.Schema({
    handoverId: { type: Number, required: true, unique: true },
    branchId: { type: Number, required: true },
    cashierId: { type: Number, required: true },
    amount: Number,
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

const ActivityLogSchema = new mongoose.Schema({
    logId: { type: Number, required: true, unique: true },
    branchId: Number,
    cashierId: Number,
    action: String,
    details: String,
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);
const CashierSale = mongoose.model('CashierSale', CashierSaleSchema);
const CashierHandover = mongoose.model('CashierHandover', CashierHandoverSchema);
const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

// Helper funksiyalar
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Ma'lumotlar
const productNames = [
    'iPhone 15 Pro Max', 'Samsung Galaxy S24', 'Xiaomi 14 Pro', 'Redmi Note 13',
    'iPhone 14', 'Samsung A54', 'Realme 11 Pro', 'Poco X6 Pro',
    'OnePlus 12', 'Vivo V30', 'Oppo Reno 11', 'Huawei P60',
    'iPhone 13', 'Samsung S23', 'Xiaomi 13T', 'Redmi 12',
    'Airpods Pro', 'Galaxy Buds', 'Xiaomi Buds', 'Powerbank 20000mAh',
    'Charger 65W', 'Cable Type-C', 'Phone Case', 'Screen Protector'
];

const categories = ['Telefon', 'Aksessuar', 'Quloqchin', 'Zaryadlovchi'];

async function generateData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('\nMongoDB ga ulandi\n');

        // Oxirgi ID larni olish
        const lastProduct = await Product.findOne().sort({ productId: -1 });
        const lastSale = await CashierSale.findOne().sort({ saleId: -1 });
        const lastHandover = await CashierHandover.findOne().sort({ handoverId: -1 });
        const lastLog = await ActivityLog.findOne().sort({ logId: -1 });

        let productId = lastProduct ? lastProduct.productId + 1 : 1001;
        let saleId = lastSale ? lastSale.saleId + 1 : 1001;
        let handoverId = lastHandover ? lastHandover.handoverId + 1 : 1001;
        let logId = lastLog ? lastLog.logId + 1 : 1001;

        console.log('Boshlang\'ich ID lar:');
        console.log('  Product ID:', productId);
        console.log('  Sale ID:', saleId);
        console.log('  Handover ID:', handoverId);
        console.log('  Log ID:', logId);

        // Sana oralig'i - oxirgi 90 kun
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);

        console.log('\nSana oralig\'i:');
        console.log('  Boshlanish:', startDate.toLocaleDateString('uz-UZ'));
        console.log('  Tugash:', endDate.toLocaleDateString('uz-UZ'));

        // 1. MAHSULOTLAR QOSHISH (100 ta)
        console.log('\n1. MAHSULOTLAR QOSHISH...');
        const products = [];
        const branches = [0, 1001, 1002, 1003]; // Umumiy + 3 ta filial

        for (let i = 0; i < 100; i++) {
            const branchId = randomChoice(branches);
            const name = randomChoice(productNames);
            const category = randomChoice(categories);
            const buyPrice = randomInt(100, 1000) * 1000; // 100k - 1M
            const sellPrice = buyPrice + randomInt(50, 300) * 1000; // +50k - +300k
            const stock = randomInt(0, 50);
            const createdAt = randomDate(startDate, endDate);

            const product = {
                productId: productId++,
                branchId,
                name: `${name} ${randomInt(1, 999)}`,
                category,
                buyPrice,
                sellPrice,
                stock,
                minStock: 5,
                imei: category === 'Telefon' ? `IMEI${randomInt(100000, 999999)}` : null,
                createdAt
            };

            products.push(product);
        }

        await Product.insertMany(products);
        console.log('   OK 100 ta mahsulot qoshildi');

        // 2. SAVDOLAR QOSHISH (500 ta)
        console.log('\n2. SAVDOLAR QOSHISH...');
        const sales = [];
        const cashiers = [1, 2, 3, 4, 5]; // 5 ta kassir

        for (let i = 0; i < 500; i++) {
            const branchId = randomChoice([1001, 1002, 1003]);
            const cashierId = randomChoice(cashiers);
            const product = randomChoice(productNames);
            const price = randomInt(200, 2000) * 1000; // 200k - 2M
            const paid = Math.random() > 0.2 ? price : randomInt(50, 90) * price / 100; // 80% to'liq to'lov
            const debt = price - paid;
            const currency = randomChoice(['UZS', 'USD']);
            const createdAt = randomDate(startDate, endDate);

            const sale = {
                saleId: saleId++,
                branchId,
                cashierId,
                product: `${product} ${randomInt(1, 999)}`,
                price,
                paid,
                debt,
                currency,
                date: createdAt.toLocaleDateString('uz-UZ'),
                createdAt
            };

            sales.push(sale);
        }

        await CashierSale.insertMany(sales);
        console.log('   OK 500 ta savdo qoshildi');

        // 3. KIRIM BERISHLAR QOSHISH (100 ta)
        console.log('\n3. KIRIM BERISHLAR QOSHISH...');
        const handovers = [];

        for (let i = 0; i < 100; i++) {
            const branchId = randomChoice([1001, 1002, 1003]);
            const cashierId = randomChoice(cashiers);
            const amount = randomInt(500, 5000) * 1000; // 500k - 5M
            const createdAt = randomDate(startDate, endDate);

            const handover = {
                handoverId: handoverId++,
                branchId,
                cashierId,
                amount,
                notes: `Kirim berish ${randomInt(1, 999)}`,
                createdAt
            };

            handovers.push(handover);
        }

        await CashierHandover.insertMany(handovers);
        console.log('   OK 100 ta kirim berish qoshildi');

        // 4. FAOLIYAT TARIXI QOSHISH (200 ta)
        console.log('\n4. FAOLIYAT TARIXI QOSHISH...');
        const logs = [];
        const actions = [
            'Mahsulot qoshildi',
            'Mahsulot yangilandi',
            'Savdo qilindi',
            'Kirim berildi',
            'Stock yangilandi',
            'Narx ozgartirildi'
        ];

        for (let i = 0; i < 200; i++) {
            const branchId = randomChoice([0, 1001, 1002, 1003]);
            const cashierId = Math.random() > 0.3 ? randomChoice(cashiers) : null;
            const action = randomChoice(actions);
            const createdAt = randomDate(startDate, endDate);

            const log = {
                logId: logId++,
                branchId,
                cashierId,
                action,
                details: `${action} - ${randomInt(1, 999)}`,
                createdAt
            };

            logs.push(log);
        }

        await ActivityLog.insertMany(logs);
        console.log('   OK 200 ta faoliyat tarixi qoshildi');

        // Statistika
        console.log('\n' + '='.repeat(70));
        console.log('\nSTATISTIKA:\n');

        const totalProducts = await Product.countDocuments();
        const totalSales = await CashierSale.countDocuments();
        const totalHandovers = await CashierHandover.countDocuments();
        const totalLogs = await ActivityLog.countDocuments();

        console.log('Mahsulotlar:', totalProducts);
        console.log('Savdolar:', totalSales);
        console.log('Kirim berishlar:', totalHandovers);
        console.log('Faoliyat tarixi:', totalLogs);

        // Filial bo'yicha
        console.log('\nFILIAL BOYICHA:\n');
        for (const branchId of [0, 1001, 1002, 1003]) {
            const branchProducts = await Product.countDocuments({ branchId });
            const branchSales = await CashierSale.countDocuments({ branchId });
            const branchHandovers = await CashierHandover.countDocuments({ branchId });

            const branchName = branchId === 0 ? 'Umumiy' : `Filial ${branchId}`;
            console.log(`${branchName}:`);
            console.log(`  Mahsulotlar: ${branchProducts}`);
            console.log(`  Savdolar: ${branchSales}`);
            console.log(`  Kirim berishlar: ${branchHandovers}`);
        }

        // Kassir bo'yicha
        console.log('\nKASSIR BOYICHA:\n');
        for (const cashierId of cashiers) {
            const cashierSales = await CashierSale.countDocuments({ cashierId });
            const cashierHandovers = await CashierHandover.countDocuments({ cashierId });
            const totalSalesAmount = await CashierSale.aggregate([
                { $match: { cashierId } },
                { $group: { _id: null, total: { $sum: '$paid' } } }
            ]);

            console.log(`Kassir ${cashierId}:`);
            console.log(`  Savdolar: ${cashierSales}`);
            console.log(`  Kirim berishlar: ${cashierHandovers}`);
            console.log(`  Jami summa: ${totalSalesAmount[0]?.total || 0} UZS`);
        }

        console.log('\n' + '='.repeat(70));
        console.log('\nBARCHA MALUMOTLAR MUVAFFAQIYATLI QOSHILDI!\n');

        await mongoose.disconnect();
        console.log('MongoDB dan uzildi\n');

    } catch (error) {
        console.error('\nXATO:', error.message);
        process.exit(1);
    }
}

// Ishga tushirish
generateData();
