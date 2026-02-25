// Avtomatik backup tizimi - har 1 soatda backup yaratadi
require('dotenv').config();
const mongoose = require('mongoose');
const BackupManager = require('./backup-manager');
const cron = require('node-cron');

// MongoDB ulanish
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL || 'mongodb://127.0.0.1:27017/dokon_db';

if (MONGODB_URI && MONGODB_URI.trim()) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Backup tizimi: MongoDB ulandi'))
    .catch(err => {
      console.log('⚠️ Backup tizimi: MongoDB ulanmadi, JSON fayllar ishlatiladi');
    });
} else {
  console.log('⚠️ Backup tizimi: MongoDB URI topilmadi, JSON fayllar ishlatiladi');
}

// Schemas
const CustomerSchema = new mongoose.Schema({
  customerId: { type: Number, required: true, unique: true },
  name: String,
  phone: String,
  chatId: String,
  firstDebtDate: Date,
  totalDebt: { type: Number, default: 0 }
});

const SaleSchema = new mongoose.Schema({
  saleId: { type: Number, required: true },
  customerId: Number,
  customerName: String,
  product: String,
  price: Number,
  paid: Number,
  type: { type: String, default: 'sale' },
  date: String,
  time: String,
  createdAt: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', CustomerSchema);
const Sale = mongoose.model('Sale', SaleSchema);

const backupManager = new BackupManager();

// Har 1 soatda backup yaratish
cron.schedule('0 * * * *', async () => {
  console.log('💾 Avtomatik backup yaratilmoqda...');
  try {
    const customers = await Customer.find();
    const sales = await Sale.find();
    
    await backupManager.createFullBackup(customers, sales);
    console.log('✅ Avtomatik backup yaratildi!');
  } catch (error) {
    console.error('❌ Avtomatik backup xato:', error);
  }
});

// Har 6 soatda CSV export
cron.schedule('0 */6 * * *', async () => {
  console.log('📊 CSV export yaratilmoqda...');
  try {
    const customers = await Customer.find();
    const sales = await Sale.find();
    
    // Mijozlar CSV
    const customersData = customers.map(c => ({
      'ID': c.customerId,
      'Ism': c.name,
      'Telefon': c.phone || '',
      'Chat ID': c.chatId || '',
      'Jami Qarz': c.totalDebt,
      'Birinchi Qarz': c.firstDebtDate ? new Date(c.firstDebtDate).toLocaleDateString('uz-UZ') : ''
    }));
    
    await backupManager.exportToCSV(customersData, 'Mijozlar_Backup');
    
    // Savdolar CSV
    const salesData = sales.map(s => ({
      'Savdo ID': s.saleId,
      'Mijoz': s.customerName,
      'Mahsulot': s.product || 'To\'lov',
      'Narxi': s.price,
      'Berilgan': s.paid,
      'Sana': s.date,
      'Vaqt': s.time,
      'Turi': s.type === 'payment' ? 'To\'lov' : 'Savdo'
    }));
    
    await backupManager.exportToCSV(salesData, 'Savdolar_Backup');
    
    console.log('✅ CSV export yaratildi!');
  } catch (error) {
    console.error('❌ CSV export xato:', error);
  }
});

console.log('🔄 Avtomatik backup tizimi ishga tushdi!');
console.log('⏰ Backup: Har 1 soatda');
console.log('📊 CSV Export: Har 6 soatda');
