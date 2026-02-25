// ==================== TRANSACTION SERVICE ====================
// 1C darajasida tranzaksiya xavfsizligi

const fs = require('fs').promises;
const path = require('path');

class TransactionService {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'transaction-logs');
    this.initLogDir();
  }

  async initLogDir() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('❌ Transaction log papka xato:', error);
    }
  }

  // Tranzaksiya boshlash
  async beginTransaction(type, data) {
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction = {
      id: transactionId,
      type, // 'sale', 'payment', 'product_update', etc.
      status: 'PENDING',
      data,
      steps: [],
      startTime: new Date().toISOString(),
      endTime: null,
      error: null
    };

    await this.logTransaction(transaction);
    return transaction;
  }

  // Tranzaksiya qadamini yozish
  async logStep(transactionId, step, status, details = null) {
    const logFile = path.join(this.logDir, `${transactionId}.json`);
    
    try {
      const content = await fs.readFile(logFile, 'utf8');
      const transaction = JSON.parse(content);
      
      transaction.steps.push({
        step,
        status, // 'SUCCESS', 'FAILED', 'SKIPPED'
        details,
        timestamp: new Date().toISOString()
      });

      await fs.writeFile(logFile, JSON.stringify(transaction, null, 2));
      return true;
    } catch (error) {
      console.error('❌ Transaction step log xato:', error);
      return false;
    }
  }

  // Tranzaksiyani yakunlash
  async commitTransaction(transactionId, finalStatus = 'COMMITTED') {
    const logFile = path.join(this.logDir, `${transactionId}.json`);
    
    try {
      const content = await fs.readFile(logFile, 'utf8');
      const transaction = JSON.parse(content);
      
      transaction.status = finalStatus;
      transaction.endTime = new Date().toISOString();
      
      await fs.writeFile(logFile, JSON.stringify(transaction, null, 2));
      
      console.log(`✅ Transaction ${transactionId} - ${finalStatus}`);
      return true;
    } catch (error) {
      console.error('❌ Transaction commit xato:', error);
      return false;
    }
  }

  // Tranzaksiyani bekor qilish (rollback)
  async rollbackTransaction(transactionId, error) {
    const logFile = path.join(this.logDir, `${transactionId}.json`);
    
    try {
      const content = await fs.readFile(logFile, 'utf8');
      const transaction = JSON.parse(content);
      
      transaction.status = 'ROLLED_BACK';
      transaction.error = error.message || error;
      transaction.endTime = new Date().toISOString();
      
      await fs.writeFile(logFile, JSON.stringify(transaction, null, 2));
      
      console.log(`⚠️ Transaction ${transactionId} - ROLLED BACK`);
      return true;
    } catch (err) {
      console.error('❌ Transaction rollback xato:', err);
      return false;
    }
  }

  // Tranzaksiyani yozish
  async logTransaction(transaction) {
    const logFile = path.join(this.logDir, `${transaction.id}.json`);
    
    try {
      await fs.writeFile(logFile, JSON.stringify(transaction, null, 2));
      return true;
    } catch (error) {
      console.error('❌ Transaction log yozish xato:', error);
      return false;
    }
  }

  // Barcha tranzaksiyalarni olish
  async getAllTransactions(limit = 100) {
    try {
      const files = await fs.readdir(this.logDir);
      const transactions = [];

      for (const file of files.slice(-limit)) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(this.logDir, file), 'utf8');
          transactions.push(JSON.parse(content));
        }
      }

      return transactions.sort((a, b) => 
        new Date(b.startTime) - new Date(a.startTime)
      );
    } catch (error) {
      console.error('❌ Tranzaksiyalarni o\'qish xato:', error);
      return [];
    }
  }

  // Muayyan tranzaksiyani olish
  async getTransaction(transactionId) {
    const logFile = path.join(this.logDir, `${transactionId}.json`);
    
    try {
      const content = await fs.readFile(logFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Tranzaksiya topilmadi:', transactionId);
      return null;
    }
  }

  // Muvaffaqiyatsiz tranzaksiyalarni topish
  async getFailedTransactions() {
    try {
      const allTransactions = await this.getAllTransactions(1000);
      return allTransactions.filter(t => 
        t.status === 'ROLLED_BACK' || t.status === 'FAILED'
      );
    } catch (error) {
      console.error('❌ Failed tranzaksiyalar xato:', error);
      return [];
    }
  }

  // Statistika
  async getStatistics(days = 7) {
    try {
      const allTransactions = await this.getAllTransactions(10000);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentTransactions = allTransactions.filter(t => 
        new Date(t.startTime) >= cutoffDate
      );

      return {
        total: recentTransactions.length,
        committed: recentTransactions.filter(t => t.status === 'COMMITTED').length,
        rolledBack: recentTransactions.filter(t => t.status === 'ROLLED_BACK').length,
        pending: recentTransactions.filter(t => t.status === 'PENDING').length,
        successRate: (recentTransactions.filter(t => t.status === 'COMMITTED').length / recentTransactions.length * 100).toFixed(2) + '%'
      };
    } catch (error) {
      console.error('❌ Statistika xato:', error);
      return null;
    }
  }

  // Eski loglarni tozalash (30 kundan eski)
  async cleanOldLogs(days = 30) {
    try {
      const files = await fs.readdir(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      let deletedCount = 0;

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.logDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const transaction = JSON.parse(content);
          
          if (new Date(transaction.startTime) < cutoffDate) {
            await fs.unlink(filePath);
            deletedCount++;
          }
        }
      }

      console.log(`🧹 ${deletedCount} ta eski transaction log o'chirildi`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Log tozalash xato:', error);
      return 0;
    }
  }
}

module.exports = TransactionService;
