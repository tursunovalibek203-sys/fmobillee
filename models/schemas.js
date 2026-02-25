// ==================== MONGODB SCHEMAS ====================

const mongoose = require('mongoose');

// Customer Schema
const CustomerSchema = new mongoose.Schema({
  customerId: { type: Number, required: true, unique: true },
  name: String,
  phone: String,
  chatId: String,
  firstDebtDate: Date,
  totalDebt: { type: Number, default: 0 }
}, { timestamps: true });

// Sale Schema
const SaleSchema = new mongoose.Schema({
  saleId: { type: Number, required: true },
  customerId: Number,
  customerName: String,
  product: String,
  price: Number,
  paid: { type: Number, default: 0 },
  paidUSD: { type: Number, default: 0 },
  type: { type: String, default: 'sale' },
  date: String,
  time: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Settings Schema
const SettingsSchema = new mongoose.Schema({
  reminderDays: { type: Number, default: 7 },
  reminderTime: { type: String, default: '09:00' },
  blockDays: { type: Number, default: 10 },
  reminder3days: { type: Boolean, default: true },
  reminder5days: { type: Boolean, default: true },
  reminder7days: { type: Boolean, default: true },
  currencyType: { type: String, default: 'USD' },
  currencyPosition: { type: String, default: 'before' },
  language: { type: String, default: 'uz' },
  theme: { type: String, default: 'blue' },
  soundEnabled: { type: Boolean, default: true },
  autoBackup: { type: String, default: 'weekly' },
  autoExcelExport: { type: Boolean, default: true }
}, { timestamps: true });

// Product Schema
const ProductSchema = new mongoose.Schema({
  productId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, default: 'Umumiy' },
  buyPrice: { type: Number, default: 0 },
  sellPrice: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 5 },
  unit: { type: String, default: 'dona' },
  barcode: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Cashier Schema
const CashierSchema = new mongoose.Schema({
  cashierId: { type: Number, required: true, unique: true },
  branchId: { type: Number, required: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, default: 'cashier' },
  isActive: { type: Boolean, default: true },
  balance: { type: Number, default: 0 }, // USD
  totalSales: { type: Number, default: 0 },
  totalSalesAmount: { type: Number, default: 0 },
  totalHandedOver: { type: Number, default: 0 },
  totalHandovers: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
}, { timestamps: true });

// Cashier Sale Schema
const CashierSaleSchema = new mongoose.Schema({
  saleId: { type: Number, required: true },
  branchId: { type: Number, required: true },
  cashierId: { type: Number, required: true },
  cashierName: String,
  customerId: Number,
  customerName: String,
  product: String,
  price: Number,
  paid: { type: Number, default: 0 }, // USD
  type: { type: String, default: 'sale' },
  date: String,
  time: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Cashier Handover Schema
const CashierHandoverSchema = new mongoose.Schema({
  handoverId: { type: Number, required: true, unique: true },
  branchId: { type: Number, required: true },
  cashierId: { type: Number, required: true },
  cashierName: String,
  amount: { type: Number, required: true },
  balanceBefore: Number,
  balanceAfter: Number,
  notes: String,
  date: String,
  time: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Branch Schema
const BranchSchema = new mongoose.Schema({
  branchId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  address: String,
  phone: String,
  manager: String,
  isActive: { type: Boolean, default: true },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Export schemas
module.exports = {
  CustomerSchema,
  SaleSchema,
  SettingsSchema,
  ProductSchema,
  CashierSchema,
  CashierSaleSchema,
  CashierHandoverSchema,
  BranchSchema
};
