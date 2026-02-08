const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

class ExcelManager {
  constructor() {
    this.excelDir = path.join(__dirname, 'excel-files');
    this.ensureDirectoryExists();
  }

  // Excel papkasini yaratish
  ensureDirectoryExists() {
    if (!fs.existsSync(this.excelDir)) {
      fs.mkdirSync(this.excelDir, { recursive: true });
      console.log('📁 Excel papkasi yaratildi:', this.excelDir);
    }
  }

  // Mijoz uchun Excel fayl yaratish
  async createCustomerExcel(customerName) {
    try {
      const fileName = `Mijoz_${customerName.replace(/[^a-zA-Z0-9_]/g, '_')}.xlsx`;
      const filePath = path.join(this.excelDir, fileName);

      // Agar fayl mavjud bo'lsa, qaytarish
      if (fs.existsSync(filePath)) {
        console.log(`📋 Mijoz Excel fayli mavjud: ${fileName}`);
        return filePath;
      }

      // Yangi workbook yaratish
      const workbook = XLSX.utils.book_new();
      
      // Ma'lumotlar uchun sarlavhalar
      const headers = ['Mahsulot nomi', 'Narxi', 'Berilgan pul', 'Balans', 'Sana', 'Turi'];
      const worksheet = XLSX.utils.aoa_to_sheet([headers]);
      
      // Ustunlar kengligini sozlash
      worksheet['!cols'] = [
        { width: 20 }, // Mahsulot nomi
        { width: 15 }, // Narxi
        { width: 15 }, // Berilgan pul
        { width: 15 }, // Balans
        { width: 20 }, // Sana
        { width: 10 }  // Turi
      ];

      // Worksheet ni workbook ga qo'shish
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ma\'lumotlar');
      
      // Faylni saqlash
      XLSX.writeFile(workbook, filePath);
      console.log(`✅ Yangi mijoz Excel fayli yaratildi: ${fileName}`);
      
      return filePath;
    } catch (error) {
      console.error('❌ Mijoz Excel fayli yaratishda xato:', error);
      return null;
    }
  }

  // Haftalik Excel fayl yaratish
  async createWeeklyExcel() {
    try {
      const now = moment();
      const weekStart = now.clone().startOf('isoWeek');
      const weekEnd = now.clone().endOf('isoWeek');
      
      const fileName = `Hafta_${weekStart.format('DD.MM')}_${weekEnd.format('DD.MM')}.xlsx`;
      const filePath = path.join(this.excelDir, fileName);

      // Agar fayl mavjud bo'lsa, qaytarish
      if (fs.existsSync(filePath)) {
        console.log(`📋 Haftalik Excel fayli mavjud: ${fileName}`);
        return filePath;
      }

      // Yangi workbook yaratish
      const workbook = XLSX.utils.book_new();
      
      // Haftalik ma'lumotlar uchun sarlavhalar
      const headers = ['Mijoz', 'Mahsulot nomi', 'Narxi', 'Berilgan pul', 'Balans', 'Sana', 'Turi'];
      const worksheet = XLSX.utils.aoa_to_sheet([headers]);
      
      // Ustunlar kengligini sozlash
      worksheet['!cols'] = [
        { width: 20 }, // Mijoz
        { width: 20 }, // Mahsulot nomi
        { width: 15 }, // Narxi
        { width: 15 }, // Berilgan pul
        { width: 15 }, // Balans
        { width: 20 }, // Sana
        { width: 10 }  // Turi
      ];

      // Worksheet ni workbook ga qo'shish
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Haftalik Ma\'lumotlar');
      
      // Faylni saqlash
      XLSX.writeFile(workbook, filePath);
      console.log(`✅ Yangi haftalik Excel fayli yaratildi: ${fileName}`);
      
      return filePath;
    } catch (error) {
      console.error('❌ Haftalik Excel fayli yaratishda xato:', error);
      return null;
    }
  }

  // Ma'lumotni Excel fayliga qo'shish
  async addToExcel(sale, customerName) {
    try {
      const balance = sale.price - sale.paid;
      const saleType = sale.type === 'payment' ? 'To\'lov' : 'Savdo';
      const dateTime = `${sale.date} ${sale.time}`;

      // 1. Mijoz Excel fayliga qo'shish
      await this.addToCustomerExcel(customerName, {
        'Mahsulot nomi': sale.product || 'To\'lov',
        'Narxi': sale.price,
        'Berilgan pul': sale.paid,
        'Balans': balance,
        'Sana': dateTime,
        'Turi': saleType
      });

      // 2. Haftalik Excel fayliga qo'shish
      await this.addToWeeklyExcel({
        'Mijoz': customerName,
        'Mahsulot nomi': sale.product || 'To\'lov',
        'Narxi': sale.price,
        'Berilgan pul': sale.paid,
        'Balans': balance,
        'Sana': dateTime,
        'Turi': saleType
      });

      console.log(`✅ Excel fayllariga ma'lumot qo'shildi: ${customerName}`);
    } catch (error) {
      console.error('❌ Excel fayliga ma\'lumot qo\'shishda xato:', error);
    }
  }

  // Mijoz Excel fayliga qator qo'shish
  async addToCustomerExcel(customerName, rowData) {
    try {
      const filePath = await this.createCustomerExcel(customerName);
      if (!filePath) return;

      // Mavjud faylni o'qish
      const workbook = XLSX.readFile(filePath);
      const worksheet = workbook.Sheets['Ma\'lumotlar'];
      
      // Mavjud ma'lumotlarni olish
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Yangi qatorni qo'shish
      const newRow = [
        rowData['Mahsulot nomi'],
        rowData['Narxi'],
        rowData['Berilgan pul'],
        rowData['Balans'],
        rowData['Sana'],
        rowData['Turi']
      ];
      jsonData.push(newRow);
      
      // Yangi worksheet yaratish
      const newWorksheet = XLSX.utils.aoa_to_sheet(jsonData);
      
      // Ustunlar kengligini sozlash
      newWorksheet['!cols'] = [
        { width: 20 }, { width: 15 }, { width: 15 }, 
        { width: 15 }, { width: 20 }, { width: 10 }
      ];
      
      // Workbook ni yangilash
      workbook.Sheets['Ma\'lumotlar'] = newWorksheet;
      
      // Faylni saqlash
      XLSX.writeFile(workbook, filePath);
      
    } catch (error) {
      console.error('❌ Mijoz Excel fayliga qo\'shishda xato:', error);
    }
  }

  // Haftalik Excel fayliga qator qo'shish
  async addToWeeklyExcel(rowData) {
    try {
      const filePath = await this.createWeeklyExcel();
      if (!filePath) return;

      // Mavjud faylni o'qish
      const workbook = XLSX.readFile(filePath);
      const worksheet = workbook.Sheets['Haftalik Ma\'lumotlar'];
      
      // Mavjud ma'lumotlarni olish
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Yangi qatorni qo'shish
      const newRow = [
        rowData['Mijoz'],
        rowData['Mahsulot nomi'],
        rowData['Narxi'],
        rowData['Berilgan pul'],
        rowData['Balans'],
        rowData['Sana'],
        rowData['Turi']
      ];
      jsonData.push(newRow);
      
      // Yangi worksheet yaratish
      const newWorksheet = XLSX.utils.aoa_to_sheet(jsonData);
      
      // Ustunlar kengligini sozlash
      newWorksheet['!cols'] = [
        { width: 20 }, { width: 20 }, { width: 15 }, 
        { width: 15 }, { width: 15 }, { width: 20 }, { width: 10 }
      ];
      
      // Workbook ni yangilash
      workbook.Sheets['Haftalik Ma\'lumotlar'] = newWorksheet;
      
      // Faylni saqlash
      XLSX.writeFile(workbook, filePath);
      
    } catch (error) {
      console.error('❌ Haftalik Excel fayliga qo\'shishda xato:', error);
    }
  }

  // Barcha Excel fayllarni ro'yxatini olish
  getExcelFiles() {
    try {
      const files = fs.readdirSync(this.excelDir)
        .filter(file => file.endsWith('.xlsx'))
        .map(file => ({
          name: file,
          path: path.join(this.excelDir, file),
          size: fs.statSync(path.join(this.excelDir, file)).size,
          modified: fs.statSync(path.join(this.excelDir, file)).mtime
        }));
      
      return files;
    } catch (error) {
      console.error('❌ Excel fayllar ro\'yxatini olishda xato:', error);
      return [];
    }
  }

  // Excel faylni o'qish
  readExcelFile(fileName) {
    try {
      const filePath = path.join(this.excelDir, fileName);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      const data = {};

      sheetNames.forEach(sheetName => {
        data[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      });

      return data;
    } catch (error) {
      console.error('❌ Excel faylni o\'qishda xato:', error);
      return null;
    }
  }
}

module.exports = ExcelManager;