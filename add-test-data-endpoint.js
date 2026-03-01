// Server.js ga test data endpoint qo'shish

const fs = require('fs');
const path = require('path');

console.log('TEST DATA ENDPOINT QOSHISH\n');
console.log('='.repeat(70));

const serverPath = path.join(__dirname, 'server.js');

if (!fs.existsSync(serverPath)) {
    console.log('ERROR: server.js topilmadi');
    process.exit(1);
}

let content = fs.readFileSync(serverPath, 'utf8');

// Endpoint allaqachon mavjudmi?
if (content.includes('/api/generate-test-data')) {
    console.log('INFO: Test data endpoint allaqachon mavjud');
    process.exit(0);
}

// Endpoint kodini yaratish
const endpointCode = `

// ==================== TEST DATA GENERATOR ====================
app.post('/api/generate-test-data', async (req, res) => {
    try {
        const { count = 100 } = req.body;
        
        console.log('Test malumotlar generatsiya qilinmoqda...');
        
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
        const branches = [0, 1001, 1002, 1003];
        const cashiers = [1, 2, 3, 4, 5];
        
        // Sana oralig'i - oxirgi 90 kun
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        
        // Oxirgi ID larni olish
        const lastProduct = await Product.findOne().sort({ productId: -1 });
        const lastSale = await CashierSale.findOne().sort({ saleId: -1 });
        const lastHandover = await CashierHandover.findOne().sort({ handoverId: -1 });
        const lastLog = await ActivityLog.findOne().sort({ logId: -1 });
        
        let productId = lastProduct ? lastProduct.productId + 1 : 1001;
        let saleId = lastSale ? lastSale.saleId + 1 : 1001;
        let handoverId = lastHandover ? lastHandover.handoverId + 1 : 1001;
        let logId = lastLog ? lastLog.logId + 1 : 1001;
        
        const results = {
            products: 0,
            sales: 0,
            handovers: 0,
            logs: 0
        };
        
        // 1. Mahsulotlar qo'shish
        const productsToAdd = Math.floor(count * 0.1); // 10%
        for (let i = 0; i < productsToAdd; i++) {
            const branchId = randomChoice(branches);
            const name = randomChoice(productNames);
            const category = randomChoice(categories);
            const buyPrice = randomInt(100, 1000) * 1000;
            const sellPrice = buyPrice + randomInt(50, 300) * 1000;
            const stock = randomInt(0, 50);
            const createdAt = randomDate(startDate, endDate);
            
            await Product.create({
                productId: productId++,
                branchId,
                name: \`\${name} \${randomInt(1, 999)}\`,
                category,
                buyPrice,
                sellPrice,
                stock,
                minStock: 5,
                imei: category === 'Telefon' ? \`IMEI\${randomInt(100000, 999999)}\` : null,
                createdAt
            });
            
            results.products++;
        }
        
        // 2. Savdolar qo'shish
        const salesToAdd = Math.floor(count * 0.5); // 50%
        for (let i = 0; i < salesToAdd; i++) {
            const branchId = randomChoice([1001, 1002, 1003]);
            const cashierId = randomChoice(cashiers);
            const product = randomChoice(productNames);
            const price = randomInt(200, 2000) * 1000;
            const paid = Math.random() > 0.2 ? price : randomInt(50, 90) * price / 100;
            const debt = price - paid;
            const currency = randomChoice(['UZS', 'USD']);
            const createdAt = randomDate(startDate, endDate);
            
            await CashierSale.create({
                saleId: saleId++,
                branchId,
                cashierId,
                product: \`\${product} \${randomInt(1, 999)}\`,
                price,
                paid,
                debt,
                currency,
                date: createdAt.toLocaleDateString('uz-UZ'),
                createdAt
            });
            
            results.sales++;
        }
        
        // 3. Kirim berishlar qo'shish
        const handoversToAdd = Math.floor(count * 0.2); // 20%
        for (let i = 0; i < handoversToAdd; i++) {
            const branchId = randomChoice([1001, 1002, 1003]);
            const cashierId = randomChoice(cashiers);
            const amount = randomInt(500, 5000) * 1000;
            const createdAt = randomDate(startDate, endDate);
            
            await CashierHandover.create({
                handoverId: handoverId++,
                branchId,
                cashierId,
                amount,
                notes: \`Kirim berish \${randomInt(1, 999)}\`,
                createdAt
            });
            
            results.handovers++;
        }
        
        // 4. Faoliyat tarixi qo'shish
        const logsToAdd = Math.floor(count * 0.2); // 20%
        const actions = [
            'Mahsulot qoshildi',
            'Mahsulot yangilandi',
            'Savdo qilindi',
            'Kirim berildi',
            'Stock yangilandi',
            'Narx ozgartirildi'
        ];
        
        for (let i = 0; i < logsToAdd; i++) {
            const branchId = randomChoice([0, 1001, 1002, 1003]);
            const cashierId = Math.random() > 0.3 ? randomChoice(cashiers) : null;
            const action = randomChoice(actions);
            const createdAt = randomDate(startDate, endDate);
            
            await ActivityLog.create({
                logId: logId++,
                branchId,
                cashierId,
                action,
                details: \`\${action} - \${randomInt(1, 999)}\`,
                createdAt
            });
            
            results.logs++;
        }
        
        console.log('Test malumotlar yaratildi:', results);
        
        res.json({
            success: true,
            message: 'Test malumotlar muvaffaqiyatli yaratildi',
            results
        });
        
    } catch (error) {
        console.error('Test malumotlar yaratishda xato:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
`;

// app.listen dan oldin qo'shish
const listenIndex = content.lastIndexOf('app.listen(');

if (listenIndex === -1) {
    console.log('ERROR: app.listen topilmadi');
    process.exit(1);
}

// Endpoint ni qo'shish
content = content.slice(0, listenIndex) + endpointCode + '\n' + content.slice(listenIndex);

// Faylga yozish
fs.writeFileSync(serverPath, content, 'utf8');

console.log('OK Test data endpoint qoshildi');
console.log('\nEndpoint: POST /api/generate-test-data');
console.log('Body: { "count": 100 }');
console.log('\n' + '='.repeat(70));
