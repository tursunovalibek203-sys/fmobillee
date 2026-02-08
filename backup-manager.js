const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const moment = require('moment');

class BackupManager {
  constructor() {
    this.backupDir = path.join(__dirname, 'backups');
    this.ensureDirectoryExists();
  }

  // Backup papkasini yaratish
  ensureDirectoryExists() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log('📁 Backup papkasi yaratildi:', this.backupDir);
    }
  }

  // Barcha ma'lumotlarni backup qilish
  async createFullBackup(customers, sales) {
    try {
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const fileName = `Backup_${timestamp}.xlsx`;
      const filePath = path.join(this.backupDir, fileName);

      // Yangi workbook yaratish
      const workbook = XLSX.utils.book_new();

      // Mijozlar varoq
      const customersData = customers.map(customer => ({
        'ID': customer.customerId,
        'Ism': customer.name,
        'Telefon': customer.phone || '',
        'Chat ID': customer.chatId || '',
        'Jami Qarz': customer.totalDebt,
        'Birinchi Qarz Sanasi': customer.firstDebtDate ? 
          moment(customer.firstDebtDate).format('DD.MM.YYYY') : ''
      }));

      const customersSheet = XLSX.utils.json_to_sheet(customersData);
      customersSheet['!cols'] = [
        { width: 10 }, { width: 20 }, { width: 15 }, 
        { width: 15 }, { width: 15 }, { width: 20 }
      ];
      XLSX.utils.book_append_sheet(workbook, customersSheet, 'Mijozlar');

      // Savdolar varoq
      const salesData = sales.map(sale => ({
        'Savdo ID': sale.saleId,
        'Mijoz ID': sale.customerId,
        'Mijoz Nomi': sale.customerName,
        'Mahsulot': sale.product || 'To\'lov',
        'Narxi': sale.price,
        'Berilgan': sale.paid,
        'Balans': sale.price - sale.paid,
        'Sana': sale.date,
        'Vaqt': sale.time,
        'Turi': sale.type === 'payment' ? 'To\'lov' : 'Savdo',
        'Yaratilgan': moment(sale.createdAt).format('DD.MM.YYYY HH:mm')
      }));

      const salesSheet = XLSX.utils.json_to_sheet(salesData);
      salesSheet['!cols'] = [
        { width: 10 }, { width: 10 }, { width: 20 }, { width: 20 },
        { width: 15 }, { width: 15 }, { width: 15 }, { width: 12 },
        { width: 8 }, { width: 10 }, { width: 18 }
      ];
      XLSX.utils.book_append_sheet(workbook, salesSheet, 'Savdolar');

      // Statistika varoq
      const totalCustomers = customers.length;
      const totalSales = sales.length;
      const totalDebt = customers.reduce((sum, c) => sum + c.totalDebt, 0);
      const totalRevenue = sales.reduce((sum, s) => sum + s.paid, 0);

      const statsData = [
        { 'Ko\'rsatkich': 'Jami Mijozlar', 'Qiymat': totalCustomers },
        { 'Ko\'rsatkich': 'Jami Savdolar', 'Qiymat': totalSales },
        { 'Ko\'rsatkich': 'Jami Qarz', 'Qiymat': totalDebt },
        { 'Ko\'rsatkich': 'Jami Tushum', 'Qiymat': totalRevenue },
        { 'Ko\'rsatkich': 'Backup Sanasi', 'Qiymat': moment().format('DD.MM.YYYY HH:mm') }
      ];

      const statsSheet = XLSX.utils.json_to_sheet(statsData);
      statsSheet['!cols'] = [{ width: 20 }, { width: 20 }];
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistika');

      // Faylni saqlash
      XLSX.writeFile(workbook, filePath);
      
      console.log(`✅ To'liq backup yaratildi: ${fileName}`);
      return {
        success: true,
        fileName,
        filePath,
        size: fs.statSync(filePath).size
      };

    } catch (error) {
      console.error('❌ Backup yaratishda xato:', error);
      return { success: false, error: error.message };
    }
  }

  // CSV formatida export qilish
  async exportToCSV(data, fileName) {
    try {
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const csvFileName = `${fileName}_${timestamp}.csv`;
      const filePath = path.join(this.backupDir, csvFileName);

      // Ma'lumotlarni CSV formatiga o'tkazish
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ma\'lumotlar');

      // CSV sifatida saqlash
      XLSX.writeFile(workbook, filePath, { bookType: 'csv' });

      console.log(`✅ CSV export yaratildi: ${csvFileName}`);
      return {
        success: true,
        fileName: csvFileName,
        filePath,
        size: fs.statSync(filePath).size
      };

    } catch (error) {
      console.error('❌ CSV export xato:', error);
      return { success: false, error: error.message };
    }
  }

  // Backup fayllar ro'yxati
  getBackupFiles() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.xlsx') || file.endsWith('.csv'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          size: fs.statSync(path.join(this.backupDir, file)).size,
          modified: fs.statSync(path.join(this.backupDir, file)).mtime,
          type: file.endsWith('.xlsx') ? 'Excel' : 'CSV'
        }))
        .sort((a, b) => b.modified - a.modified); // Eng yangi birinchi

      return files;
    } catch (error) {
      console.error('❌ Backup fayllar ro\'yxatini olishda xato:', error);
      return [];
    }
  }

  // Eski backup fayllarni tozalash (30 kundan eski)
  cleanOldBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const thirtyDaysAgo = moment().subtract(30, 'days');
      let deletedCount = 0;

      files.forEach(file => {
        const filePath = path.join(this.backupDir, file);
        const fileStats = fs.statSync(filePath);
        const fileDate = moment(fileStats.mtime);

        if (fileDate.isBefore(thirtyDaysAgo)) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`🗑️ Eski backup o'chirildi: ${file}`);
        }
      });

      if (deletedCount > 0) {
        console.log(`✅ ${deletedCount} ta eski backup tozalandi`);
      }

      return { success: true, deletedCount };
    } catch (error) {
      console.error('❌ Eski backup tozalashda xato:', error);
      return { success: false, error: error.message };
    }
  }

  // Avtomatik haftalik backup
  async createWeeklyBackup(customers, sales) {
    try {
      // Eski backuplarni tozalash
      this.cleanOldBackups();

      // Yangi backup yaratish
      const result = await this.createFullBackup(customers, sales);
      
      if (result.success) {
        console.log('📅 Haftalik avtomatik backup yaratildi');
      }

      return result;
    } catch (error) {
      console.error('❌ Haftalik backup xato:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = BackupManager;