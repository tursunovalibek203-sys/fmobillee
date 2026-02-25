// ==================== SALE SERVICE ====================

const Validators = require('../utils/validators');
const { ErrorHandler } = require('../middleware/error-handler');
const { HTTP_STATUS, ERRORS } = require('../config/constants');

class SaleService {
  constructor(Sale, Customer, excelManager, telegramService) {
    this.Sale = Sale;
    this.Customer = Customer;
    this.excelManager = excelManager;
    this.telegramService = telegramService;
  }

  async getAllSales(filters = {}) {
    const query = {};
    
    if (filters.customerId) {
      query.customerId = Number(filters.customerId);
    }
    
    if (filters.type) {
      query.type = filters.type;
    }
    
    if (filters.date) {
      query.date = filters.date;
    }

    return await this.Sale.find(query).sort({ createdAt: -1 });
  }

  async createSale(data) {
    const validation = Validators.validateSaleData(data);
    
    if (!validation.isValid) {
      throw new ErrorHandler(validation.errors.join(', '), HTTP_STATUS.BAD_REQUEST);
    }

    // Check if customer exists
    const customer = await this.Customer.findOne({ customerId: data.customerId });
    if (!customer) {
      throw new ErrorHandler(ERRORS.CUSTOMER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Try to add to Excel first
    try {
      await this.excelManager.addToExcel(data, customer.name);
    } catch (error) {
      console.error('Excel xato:', error.message);
      throw new ErrorHandler(
        'Excel faylga yozishda xatolik. Savdo saqlanmadi!',
        HTTP_STATUS.INTERNAL_ERROR
      );
    }

    // Create sale in database
    const sale = await this.Sale.create({
      saleId: data.saleId,
      customerId: data.customerId,
      customerName: customer.name,
      product: data.product,
      price: data.price,
      paid: data.paid,
      paidUSD: data.paidUSD || data.paid,
      type: data.type || 'sale',
      date: data.date,
      time: data.time
    });

    // Recalculate customer debt
    await this.recalculateCustomerDebt(data.customerId);

    // Send Telegram receipt if chatId exists
    let telegramSuccess = true;
    if (customer.chatId) {
      try {
        const receipt = this.generateReceipt(sale, customer);
        await this.telegramService.sendMessage(customer.chatId, receipt);
      } catch (error) {
        console.error('Telegram xato:', error.message);
        telegramSuccess = false;
      }
    }

    return {
      sale,
      telegramSuccess,
      excelSuccess: true
    };
  }

  async updateSale(saleId, data) {
    const sale = await this.Sale.findOne({ saleId: Number(saleId) });
    
    if (!sale) {
      throw new ErrorHandler('Savdo topilmadi', HTTP_STATUS.NOT_FOUND);
    }

    // Update fields
    if (data.product) sale.product = data.product;
    if (data.price !== undefined) sale.price = data.price;
    if (data.paid !== undefined) sale.paid = data.paid;
    if (data.paidUSD !== undefined) sale.paidUSD = data.paidUSD;

    await sale.save();

    // Recalculate customer debt
    await this.recalculateCustomerDebt(sale.customerId);

    return sale;
  }

  async deleteSale(saleId) {
    const sale = await this.Sale.findOneAndDelete({ saleId: Number(saleId) });
    
    if (!sale) {
      throw new ErrorHandler('Savdo topilmadi', HTTP_STATUS.NOT_FOUND);
    }

    // Recalculate customer debt
    await this.recalculateCustomerDebt(sale.customerId);

    return { message: 'Savdo o\'chirildi' };
  }

  async recalculateCustomerDebt(customerId) {
    const customer = await this.Customer.findOne({ customerId });
    if (!customer) return;

    const sales = await this.Sale.find({ customerId });
    
    const totalPrice = sales
      .filter(s => s.type === 'sale')
      .reduce((sum, s) => sum + s.price, 0);
    
    const totalPaid = sales.reduce((sum, s) => sum + s.paid, 0);
    
    customer.totalDebt = totalPrice - totalPaid;

    if (customer.totalDebt > 0 && !customer.firstDebtDate) {
      customer.firstDebtDate = new Date();
    } else if (customer.totalDebt <= 0) {
      customer.firstDebtDate = null;
    }

    await customer.save();
    return customer;
  }

  generateReceipt(sale, customer) {
    const formatUSD = (amount) => 
      `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const debt = sale.price - sale.paid;
    const debtDays = customer.firstDebtDate 
      ? Math.floor((new Date() - customer.firstDebtDate) / (1000 * 60 * 60 * 24))
      : 0;

    if (sale.type === 'payment') {
      return `💵 <b>TO'LOV CHEKI</b>

📅 Sana: ${sale.date}
🕐 Vaqt: ${sale.time}

👤 Mijoz: ${customer.name}
📱 Telefon: ${customer.phone || 'Kiritilmagan'}

━━━━━━━━━━━━━━━━━━━━
💰 To'lov: ${formatUSD(sale.paid)}
━━━━━━━━━━━━━━━━━━━━

${customer.totalDebt > 0 ? `📊 Qolgan qarz: ${formatUSD(customer.totalDebt)}` : '✅ Qarz to\'liq to\'landi'}

Rahmat! 🙏`;
    }

    return `🧾 <b>SAVDO CHEKI</b>

📅 Sana: ${sale.date}
🕐 Vaqt: ${sale.time}

👤 Mijoz: ${customer.name}
📱 Telefon: ${customer.phone || 'Kiritilmagan'}

━━━━━━━━━━━━━━━━━━━━
📦 Mahsulot: ${sale.product}
💰 Narxi: ${formatUSD(sale.price)}
💵 To'landi: ${formatUSD(sale.paid)}
━━━━━━━━━━━━━━━━━━━━

${debt > 0 ? `⚠️ Bu savdo qarzi: ${formatUSD(debt)}` : '✅ To\'liq to\'landi'}
${customer.totalDebt > 0 ? `\n📊 Jami qarz: ${formatUSD(customer.totalDebt)}` : ''}
${debtDays > 0 ? `\n📆 Qarz kunlari: ${debtDays} kun` : ''}

Rahmat! 🙏`;
  }

  async getDailyReport(date) {
    const sales = await this.Sale.find({ date });
    
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.paid, 0);
    const totalSalesAmount = sales
      .filter(s => s.type === 'sale')
      .reduce((sum, s) => sum + s.price, 0);

    return {
      date,
      totalSales: sales.length,
      totalRevenue,
      totalSalesAmount,
      sales
    };
  }

  async getWeeklyReport(startDate, endDate) {
    const sales = await this.Sale.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.paid, 0);
    const totalSalesAmount = sales
      .filter(s => s.type === 'sale')
      .reduce((sum, s) => sum + s.price, 0);

    return {
      startDate,
      endDate,
      totalSales: sales.length,
      totalRevenue,
      totalSalesAmount,
      sales
    };
  }
}

module.exports = SaleService;
