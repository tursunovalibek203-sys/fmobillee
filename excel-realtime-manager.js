// ==================== REAL-TIME EXCEL MANAGER ====================
// MongoDB va Excel ga bir vaqtda yozish

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class ExcelRealtimeManager {
  constructor() {
    this.excelDir = path.join(__dirname, 'excel-files');
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.excelDir)) {
      fs.mkdirSync(this.excelDir, { recursive: true });
      console.log('📁 Excel papka yaratildi:', this.excelDir);
    }
  }

  // ==================== FILIALLAR ====================
  
  async saveBranchToExcel(branch) {
    try {
      const fileName = 'Filiallar_Hisobot.xlsx';
      const filePath = path.join(this.excelDir, fileName);
      
      let workbook;
      let worksheet;
      
      // Fayl mavjudligini tekshirish
      if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
        worksheet = workbook.Sheets['Filiallar'] || XLSX.utils.aoa_to_sheet([]);
      } else {
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.aoa_to_sheet([
          ['ID', 'Nomi', 'Manzil', 'Telefon', 'Menejer', 'Jami Savdo', 'Jami Daromad', 'Holat', 'Sana']
        ]);
      }
      
      // Ma'lumotlarni olish
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Yangi qator qo'shish yoki yangilash
      const rowIndex = data.findIndex(row => row[0] === branch.branchId);
      const newRow = [
        branch.branchId,
        branch.name,
        branch.address || '',
        branch.phone || '',
        branch.manager || '',
        branch.totalSales || 0,
        branch.totalRevenue || 0,
        branch.isActive ? 'Faol' : 'Nofaol',
        new Date().toLocaleString('uz-UZ')
      ];
      
      if (rowIndex > 0) {
        data[rowIndex] = newRow;
      } else {
        data.push(newRow);
      }
      
      // Yangi worksheet yaratish
      const newWorksheet = XLSX.utils.aoa_to_sheet(data);
      
      // Ustun kengliklarini sozlash
      newWorksheet['!cols'] = [
        { wch: 8 },  // ID
        { wch: 20 }, // Nomi
        { wch: 30 }, // Manzil
        { wch: 15 }, // Telefon
        { wch: 20 }, // Menejer
        { wch: 12 }, // Jami Savdo
        { wch: 15 }, // Jami Daromad
        { wch: 10 }, // Holat
        { wch: 20 }  // Sana
      ];
      
      // Workbook ga qo'shish
      if (workbook.Sheets['Filiallar']) {
        workbook.Sheets['Filiallar'] = newWorksheet;
      } else {
        XLSX.utils.book_append_sheet(workbook, newWorksheet, 'Filiallar');
      }
      
      // Faylga yozish
      XLSX.writeFile(workbook, filePath);
      console.log('✅ Filial Excel ga yozildi:', branch.name);
      
      return { success: true, file: fileName };
    } catch (error) {
      console.error('❌ Excel ga yozishda xato:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== KASSIRLAR ====================
  
  async saveCashierToExcel(cashier, branchName) {
    try {
      const fileName = 'Kassirlar_Hisobot.xlsx';
      const filePath = path.join(this.excelDir, fileName);
      
      let workbook;
      let worksheet;
      
      if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
        worksheet = workbook.Sheets['Kassirlar'] || XLSX.utils.aoa_to_sheet([]);
      } else {
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.aoa_to_sheet([
          ['ID', 'Filial', 'Ism', 'Username', 'Telefon', 'Balans USD', 'Balans UZS', 'Balans RUB', 'Jami Savdo', 'Topshirgan', 'Holat', 'Sana']
        ]);
      }
      
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const rowIndex = data.findIndex(row => row[0] === cashier.cashierId);
      const newRow = [
        cashier.cashierId,
        branchName,
        cashier.name,
        cashier.username,
        cashier.phone || '',
        (cashier.balanceUSD || 0).toFixed(2),
        (cashier.balanceUZS || 0).toLocaleString('uz-UZ'),
        (cashier.balanceRUB || 0).toLocaleString('ru-RU'),
        cashier.totalSales || 0,
        (cashier.totalHandedOver || 0).toFixed(2),
        cashier.isActive ? 'Faol' : 'Nofaol',
        new Date().toLocaleString('uz-UZ')
      ];
      
      if (rowIndex > 0) {
        data[rowIndex] = newRow;
      } else {
        data.push(newRow);
      }
      
      const newWorksheet = XLSX.utils.aoa_to_sheet(data);
      newWorksheet['!cols'] = [
        { wch: 8 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
        { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
        { wch: 10 }, { wch: 20 }
      ];
      
      if (workbook.Sheets['Kassirlar']) {
        workbook.Sheets['Kassirlar'] = newWorksheet;
      } else {
        XLSX.utils.book_append_sheet(workbook, newWorksheet, 'Kassirlar');
      }
      
      XLSX.writeFile(workbook, filePath);
      console.log('✅ Kassir Excel ga yozildi:', cashier.name);
      
      return { success: true, file: fileName };
    } catch (error) {
      console.error('❌ Excel ga yozishda xato:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== SAVDOLAR ====================
  
  async saveSaleToExcel(sale, branchName, cashierName) {
    try {
      const fileName = `Savdolar_${branchName.replace(/\s+/g, '_')}.xlsx`;
      const filePath = path.join(this.excelDir, fileName);
      
      let workbook;
      let worksheet;
      
      if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
        worksheet = workbook.Sheets['Savdolar'] || XLSX.utils.aoa_to_sheet([]);
      } else {
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.aoa_to_sheet([
          ['Savdo ID', 'Kassir', 'Mijoz ID', 'Mijoz', 'Mahsulot', 'Narx USD', 'To\'lov', 'Valyuta', 'To\'lov USD', 'Qarz USD', 'Sana', 'Vaqt']
        ]);
      }
      
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const newRow = [
        sale.saleId,
        cashierName,
        sale.customerId || '',
        sale.customerName || '',
        sale.product,
        (sale.priceUSD || sale.price || 0).toFixed(2),
        (sale.paymentAmount || sale.paid || 0).toFixed(2),
        sale.paymentCurrency || 'USD',
        (sale.paymentUSD || sale.paid || 0).toFixed(2),
        ((sale.priceUSD || sale.price || 0) - (sale.paymentUSD || sale.paid || 0)).toFixed(2),
        sale.date,
        sale.time
      ];
      
      data.push(newRow);
      
      const newWorksheet = XLSX.utils.aoa_to_sheet(data);
      newWorksheet['!cols'] = [
        { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 25 },
        { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 10 }
      ];
      
      if (workbook.Sheets['Savdolar']) {
        workbook.Sheets['Savdolar'] = newWorksheet;
      } else {
        XLSX.utils.book_append_sheet(workbook, newWorksheet, 'Savdolar');
      }
      
      XLSX.writeFile(workbook, filePath);
      console.log('✅ Savdo Excel ga yozildi:', sale.saleId);
      
      return { success: true, file: fileName };
    } catch (error) {
      console.error('❌ Excel ga yozishda xato:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== KIRIM TOPSHIRISH ====================
  
  async saveHandoverToExcel(handover, branchName, cashierName) {
    try {
      const fileName = 'Kirim_Topshirish_Hisobot.xlsx';
      const filePath = path.join(this.excelDir, fileName);
      
      let workbook;
      let worksheet;
      
      if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
        worksheet = workbook.Sheets['Kirimlar'] || XLSX.utils.aoa_to_sheet([]);
      } else {
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.aoa_to_sheet([
          ['Kirim ID', 'Filial', 'Kassir', 'USD', 'UZS', 'RUB', 'Jami USD', 'Izoh', 'Sana', 'Vaqt', 'Holat']
        ]);
      }
      
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const totalUSD = (handover.amountUSD || 0) + 
                       (handover.amountUZS || 0) / (handover.exchangeRateUZS || 12500) +
                       (handover.amountRUB || 0) / (handover.exchangeRateRUB || 90);
      
      const newRow = [
        handover.handoverId,
        branchName,
        cashierName,
        (handover.amountUSD || 0).toFixed(2),
        (handover.amountUZS || 0).toLocaleString('uz-UZ'),
        (handover.amountRUB || 0).toLocaleString('ru-RU'),
        totalUSD.toFixed(2),
        handover.notes || '',
        handover.date,
        handover.time,
        handover.status || 'Kutilmoqda'
      ];
      
      data.push(newRow);
      
      const newWorksheet = XLSX.utils.aoa_to_sheet(data);
      newWorksheet['!cols'] = [
        { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 },
        { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 12 }, { wch: 10 }, { wch: 12 }
      ];
      
      if (workbook.Sheets['Kirimlar']) {
        workbook.Sheets['Kirimlar'] = newWorksheet;
      } else {
        XLSX.utils.book_append_sheet(workbook, newWorksheet, 'Kirimlar');
      }
      
      XLSX.writeFile(workbook, filePath);
      console.log('✅ Kirim Excel ga yozildi:', handover.handoverId);
      
      return { success: true, file: fileName };
    } catch (error) {
      console.error('❌ Excel ga yozishda xato:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== OMBOR ====================
  
  async saveWarehouseToExcel(product, branchName) {
    try {
      const fileName = `Ombor_${branchName.replace(/\s+/g, '_')}.xlsx`;
      const filePath = path.join(this.excelDir, fileName);
      
      let workbook;
      let worksheet;
      
      if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
        worksheet = workbook.Sheets['Mahsulotlar'] || XLSX.utils.aoa_to_sheet([]);
      } else {
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.aoa_to_sheet([
          ['ID', 'Nomi', 'Kategoriya', 'Miqdor', 'Minimal', 'Birlik', 'Sotib Olish', 'Sotish', 'Jami Qiymat', 'Holat', 'Sana']
        ]);
      }
      
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const rowIndex = data.findIndex(row => row[0] === product.productId);
      const totalValue = (product.stock || 0) * (product.buyPrice || 0);
      const status = (product.stock || 0) <= (product.minStock || 0) ? 'Kam' : 'Yetarli';
      
      const newRow = [
        product.productId,
        product.name,
        product.category || '',
        product.stock || 0,
        product.minStock || 0,
        product.unit || 'dona',
        (product.buyPrice || 0).toFixed(2),
        (product.sellPrice || 0).toFixed(2),
        totalValue.toFixed(2),
        status,
        new Date().toLocaleString('uz-UZ')
      ];
      
      if (rowIndex > 0) {
        data[rowIndex] = newRow;
      } else {
        data.push(newRow);
      }
      
      const newWorksheet = XLSX.utils.aoa_to_sheet(data);
      newWorksheet['!cols'] = [
        { wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 20 }
      ];
      
      if (workbook.Sheets['Mahsulotlar']) {
        workbook.Sheets['Mahsulotlar'] = newWorksheet;
      } else {
        XLSX.utils.book_append_sheet(workbook, newWorksheet, 'Mahsulotlar');
      }
      
      XLSX.writeFile(workbook, filePath);
      console.log('✅ Ombor Excel ga yozildi:', product.name);
      
      return { success: true, file: fileName };
    } catch (error) {
      console.error('❌ Excel ga yozishda xato:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== UTILITY ====================
  
  getExcelFiles() {
    try {
      const files = fs.readdirSync(this.excelDir);
      return files
        .filter(file => file.endsWith('.xlsx'))
        .map(file => {
          const stats = fs.statSync(path.join(this.excelDir, file));
          return {
            name: file,
            size: stats.size,
            modified: stats.mtime
          };
        });
    } catch (error) {
      console.error('❌ Excel fayllarni o\'qishda xato:', error);
      return [];
    }
  }

  getFilePath(fileName) {
    return path.join(this.excelDir, fileName);
  }
}

module.exports = new ExcelRealtimeManager();
