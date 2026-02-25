#!/usr/bin/env node

// ==================== AUTOMATIC BACKUP SCRIPT ====================

require('dotenv').config();
const cron = require('node-cron');
const mongoose = require('mongoose');
const BackupService = require('../services/backup.service');

// Models
const Customer = mongoose.model('Customer', require('../server').CustomerSchema);
const Sale = mongoose.model('Sale', require('../server').SaleSchema);
const Product = mongoose.model('Product', require('../server').ProductSchema);
const Cashier = mongoose.model('Cashier', require('../server').CashierSchema);
const Branch = mongoose.model('Branch', require('../server').BranchSchema);

const backupService = new BackupService();

// Connect to database
async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected for backup');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

// Create full backup
async function createFullBackup() {
  console.log('\n🔄 Starting full backup...');
  console.log('⏰ Time:', new Date().toLocaleString('uz-UZ'));
  
  const models = {
    customers: Customer,
    sales: Sale,
    products: Product,
    cashiers: Cashier,
    branches: Branch
  };

  const result = await backupService.createFullBackup(models);

  if (result.success) {
    console.log('✅ Backup completed successfully!');
    console.log('📁 File:', result.filename);
    console.log('💾 Size:', Math.round(result.size / 1024) + ' KB');
    console.log('🕐 Time:', result.timestamp);
  } else {
    console.error('❌ Backup failed:', result.error);
  }

  return result;
}

// Create incremental backup
async function createIncrementalBackup() {
  console.log('\n🔄 Starting incremental backup...');
  
  const lastBackupTime = new Date();
  lastBackupTime.setHours(lastBackupTime.getHours() - 6); // Last 6 hours

  const models = {
    customers: Customer,
    sales: Sale,
    products: Product,
    cashiers: Cashier,
    branches: Branch
  };

  const result = await backupService.createIncrementalBackup(models, lastBackupTime);

  if (result.success) {
    console.log('✅ Incremental backup completed!');
    console.log('📁 File:', result.filename);
    console.log('📊 Records:', result.recordsBackedUp);
  } else {
    console.error('❌ Incremental backup failed:', result.error);
  }

  return result;
}

// Schedule backups
async function scheduleBackups() {
  await connectDatabase();

  console.log('\n📅 Backup scheduler started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Full backup every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('\n⏰ Scheduled full backup triggered');
    await createFullBackup();
  });

  // Incremental backup every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('\n⏰ Scheduled incremental backup triggered');
    await createIncrementalBackup();
  });

  console.log('✅ Full backup: Every day at 2:00 AM');
  console.log('✅ Incremental backup: Every 6 hours');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Create initial backup
  console.log('🔄 Creating initial backup...');
  await createFullBackup();
}

// Manual backup (if run directly)
async function manualBackup() {
  await connectDatabase();
  
  console.log('\n🔧 Manual backup mode');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const result = await createFullBackup();
  
  if (result.success) {
    console.log('\n✅ Manual backup completed successfully!');
  } else {
    console.log('\n❌ Manual backup failed!');
  }
  
  await mongoose.disconnect();
  process.exit(result.success ? 0 : 1);
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️ Backup scheduler stopping...');
  await mongoose.disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n⚠️ Backup scheduler stopping...');
  await mongoose.disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
});

// Check if run directly or imported
if (require.main === module) {
  // Check for command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--manual') || args.includes('-m')) {
    manualBackup();
  } else if (args.includes('--schedule') || args.includes('-s')) {
    scheduleBackups();
  } else {
    console.log('\n📚 Backup Script Usage:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('node scripts/auto-backup.js --manual     # Create backup now');
    console.log('node scripts/auto-backup.js --schedule   # Start scheduler');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  }
}

module.exports = {
  createFullBackup,
  createIncrementalBackup,
  scheduleBackups
};
