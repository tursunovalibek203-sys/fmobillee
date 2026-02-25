// ==================== DUAL DATABASE SERVICE ====================
// MongoDB va PostgreSQL parallel ishlash tizimi

const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');

class DualDatabaseService {
  constructor(mongoModels, pgModels) {
    this.mongo = mongoModels;
    this.pg = pgModels;
    this.syncQueue = [];
    this.isSyncing = false;
  }

  // Ikki bazaga ham yozish (atomic operation)
  async createSale(saleData) {
    let mongoSale = null;
    let pgSale = null;
    let error = null;

    try {
      // 1. MongoDB ga yozish
      mongoSale = await this.mongo.Sale.create(saleData);
      console.log('✅ MongoDB: Savdo saqlandi');

      // 2. PostgreSQL ga yozish
      try {
        pgSale = await this.pg.Sale.create(saleData);
        console.log('✅ PostgreSQL: Savdo saqlandi');
      } catch (pgError) {
        console.error('❌ PostgreSQL xato:', pgError.message);
        error = pgError;
        
        // PostgreSQL xato bo'lsa, MongoDB dan o'chirish (rollback)
        await this.mongo.Sale.findOneAndDelete({ saleId: saleData.saleId });
        console.log('⚠️ MongoDB: Rollback amalga oshirildi');
        
        throw new Error('PostgreSQL ga yozishda xatolik. Tranzaksiya bekor qilindi.');
      }

      return {
        success: true,
        mongoSale,
        pgSale,
        message: 'Savdo ikki bazaga ham saqlandi'
      };

    } catch (err) {
      console.error('❌ Dual database xato:', err.message);
      
      return {
        success: false,
        error: err.message,
        mongoSale,
        pgSale
      };
    }
  }

  // Ikki bazadan ham o'qish (fallback bilan)
  async getSale(saleId) {
    try {
      // Avval MongoDB dan
      const mongoSale = await this.mongo.Sale.findOne({ saleId });
      
      if (mongoSale) {
        return {
          success: true,
          source: 'MongoDB',
          data: mongoSale
        };
      }

      // Agar MongoDB da yo'q bo'lsa, PostgreSQL dan
      const pgSale = await this.pg.Sale.findOne({ where: { saleId } });
      
      if (pgSale) {
        // PostgreSQL dan topildi, MongoDB ga sinxronlashtirish
        await this.mongo.Sale.create(pgSale.toJSON());
        console.log('🔄 MongoDB ga sinxronlashtirildi');
        
        return {
          success: true,
          source: 'PostgreSQL (recovered)',
          data: pgSale
        };
      }

      return {
        success: false,
        error: 'Savdo topilmadi'
      };

    } catch (error) {
      console.error('❌ getSale xato:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Ikki bazadan ham o'chirish
  async deleteSale(saleId) {
    let mongoDeleted = false;
    let pgDeleted = false;

    try {
      // MongoDB dan o'chirish
      const mongoResult = await this.mongo.Sale.findOneAndDelete({ saleId });
      mongoDeleted = mongoResult !== null;

      // PostgreSQL dan o'chirish
      const pgResult = await this.pg.Sale.destroy({ where: { saleId } });
      pgDeleted = pgResult > 0;

      return {
        success: mongoDeleted || pgDeleted,
        mongoDeleted,
        pgDeleted,
        message: `MongoDB: ${mongoDeleted ? 'O\'chirildi' : 'Topilmadi'}, PostgreSQL: ${pgDeleted ? 'O\'chirildi' : 'Topilmadi'}`
      };

    } catch (error) {
      console.error('❌ deleteSale xato:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Ikki bazani sinxronlashtirish
  async syncDatabases() {
    if (this.isSyncing) {
      console.log('⏳ Sinxronizatsiya allaqachon davom etmoqda...');
      return;
    }

    this.isSyncing = true;
    console.log('🔄 Bazalar sinxronizatsiyasi boshlandi...');

    try {
      // MongoDB ni asosiy manba sifatida ishlatish
      const mongoSales = await this.mongo.Sale.find();
      const pgSales = await this.pg.Sale.findAll();

      const mongoIds = new Set(mongoSales.map(s => s.saleId));
      const pgIds = new Set(pgSales.map(s => s.saleId));

      let added = 0;
      let updated = 0;
      let deleted = 0;

      // MongoDB da bor, PostgreSQL da yo'q
      for (const mongoSale of mongoSales) {
        if (!pgIds.has(mongoSale.saleId)) {
          await this.pg.Sale.create(mongoSale.toObject());
          added++;
        } else {
          // Mavjud, lekin yangilanishi kerak bo'lishi mumkin
          const pgSale = pgSales.find(s => s.saleId === mongoSale.saleId);
          if (pgSale && this.needsUpdate(mongoSale, pgSale)) {
            await this.pg.Sale.update(
              mongoSale.toObject(),
              { where: { saleId: mongoSale.saleId } }
            );
            updated++;
          }
        }
      }

      // PostgreSQL da bor, MongoDB da yo'q (o'chirish)
      for (const pgSale of pgSales) {
        if (!mongoIds.has(pgSale.saleId)) {
          await this.pg.Sale.destroy({ where: { saleId: pgSale.saleId } });
          deleted++;
        }
      }

      console.log(`✅ Sinxronizatsiya tugadi: +${added}, ~${updated}, -${deleted}`);

      return {
        success: true,
        added,
        updated,
        deleted
      };

    } catch (error) {
      console.error('❌ Sinxronizatsiya xato:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      this.isSyncing = false;
    }
  }

  // Yangilanish kerakligini tekshirish
  needsUpdate(mongoDoc, pgDoc) {
    const mongoData = mongoDoc.toObject();
    const pgData = pgDoc.toJSON();

    // Asosiy maydonlarni solishtirish
    return (
      mongoData.price !== pgData.price ||
      mongoData.paid !== pgData.paid ||
      mongoData.product !== pgData.product ||
      mongoData.customerName !== pgData.customerName
    );
  }

  // Health check - ikki baza ham ishlayaptimi
  async healthCheck() {
    const status = {
      mongodb: { connected: false, error: null },
      postgresql: { connected: false, error: null }
    };

    // MongoDB
    try {
      await this.mongo.Sale.findOne().limit(1);
      status.mongodb.connected = true;
    } catch (error) {
      status.mongodb.error = error.message;
    }

    // PostgreSQL
    try {
      await this.pg.Sale.findOne({ limit: 1 });
      status.postgresql.connected = true;
    } catch (error) {
      status.postgresql.error = error.message;
    }

    return {
      healthy: status.mongodb.connected && status.postgresql.connected,
      status
    };
  }

  // Statistika
  async getStatistics() {
    try {
      const mongoCount = await this.mongo.Sale.countDocuments();
      const pgCount = await this.pg.Sale.count();

      return {
        mongodb: {
          sales: mongoCount,
          customers: await this.mongo.Customer.countDocuments(),
          products: await this.mongo.Product.countDocuments()
        },
        postgresql: {
          sales: pgCount,
          customers: await this.pg.Customer.count(),
          products: await this.pg.Product.count()
        },
        synced: mongoCount === pgCount
      };
    } catch (error) {
      console.error('❌ Statistika xato:', error);
      return null;
    }
  }

  // Backup yaratish (ikki bazadan ham)
  async createBackup() {
    try {
      const mongoData = {
        sales: await this.mongo.Sale.find(),
        customers: await this.mongo.Customer.find(),
        products: await this.mongo.Product.find()
      };

      const pgData = {
        sales: await this.pg.Sale.findAll(),
        customers: await this.pg.Customer.findAll(),
        products: await this.pg.Product.findAll()
      };

      return {
        success: true,
        timestamp: new Date().toISOString(),
        mongodb: mongoData,
        postgresql: pgData
      };
    } catch (error) {
      console.error('❌ Backup xato:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = DualDatabaseService;
