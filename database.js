// PostgreSQL Database Configuration
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// PostgreSQL ulanish
const sequelize = new Sequelize(
  process.env.DB_NAME || 'dokon_db',
  process.env.DB_USER || 'dokon_user',
  process.env.DB_PASSWORD || 'qwerty123456',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgresql',
    logging: false, // SQL loglarni o'chirish
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

// ==================== MODELS ====================

// Customer Model
const Customer = sequelize.define('Customer', {
  customerId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  chatId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  firstDebtDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalDebt: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'customers',
  timestamps: true
});

// Sale Model
const Sale = sequelize.define('Sale', {
  saleId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Customer,
      key: 'customerId'
    }
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  product: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'sale' // 'sale' yoki 'payment'
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'sales',
  timestamps: true
});

// Product Model
const Product = sequelize.define('Product', {
  productId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'Umumiy'
  },
  buyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  sellPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  minStock: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'dona'
  },
  barcode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'products',
  timestamps: true
});

// Settings Model
const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reminderDays: {
    type: DataTypes.INTEGER,
    defaultValue: 7
  },
  reminderTime: {
    type: DataTypes.STRING,
    defaultValue: '09:00'
  },
  blockDays: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  reminder3days: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  reminder5days: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  reminder7days: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  currencyType: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  currencyPosition: {
    type: DataTypes.STRING,
    defaultValue: 'before'
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'uz'
  },
  theme: {
    type: DataTypes.STRING,
    defaultValue: 'blue'
  },
  soundEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  autoBackup: {
    type: DataTypes.STRING,
    defaultValue: 'weekly'
  },
  autoExcelExport: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'settings',
  timestamps: true
});

// ==================== RELATIONSHIPS ====================

Customer.hasMany(Sale, { foreignKey: 'customerId' });
Sale.belongsTo(Customer, { foreignKey: 'customerId' });

// ==================== DATABASE SYNC ====================

async function initDatabase() {
  try {
    // Ulanishni tekshirish
    await sequelize.authenticate();
    console.log('✅ PostgreSQL ulanish muvaffaqiyatli!');
    
    // Jadvallarni yaratish (agar mavjud bo'lmasa)
    await sequelize.sync({ alter: false });
    console.log('✅ Jadvallar tayyor!');
    
    // Default sozlamalarni yaratish
    const settingsCount = await Settings.count();
    if (settingsCount === 0) {
      await Settings.create({
        reminderDays: 7,
        reminderTime: '09:00',
        blockDays: 10,
        reminder3days: true,
        reminder5days: true,
        reminder7days: true
      });
      console.log('✅ Default sozlamalar yaratildi');
    }
    
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL ulanish xato:', error.message);
    console.error('💡 Iltimos, PostgreSQL ishga tushganligini tekshiring!');
    return false;
  }
}

// ==================== EXPORT ====================

module.exports = {
  sequelize,
  Customer,
  Sale,
  Product,
  Settings,
  initDatabase
};
