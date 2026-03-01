require('dotenv').config();
const fetch = require('node-fetch');
const mongoose = require('mongoose');

const BOT_TOKEN = process.env.BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Modellarni import qilish (qayta yaratmaslik uchun)
let Customer, Sale, Branch, CashierSale;

function setModels(customerModel, saleModel, branchModel, cashierSaleModel) {
  Customer = customerModel;
  Sale = saleModel;
  Branch = branchModel;
  CashierSale = cashierSaleModel || saleModel;
}

// Telegram API functions
async function sendMessage(chatId, text) {
  try {
    console.log(`📤 Xabar yuborilmoqda: ${chatId}`);
    
    const response = await fetch(`${API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log(`✅ Xabar yuborildi: ${chatId}`);
      return true;
    } else {
      console.error(`❌ Xabar yuborish xatosi:`, data);
      return false;
    }
  } catch (error) {
    console.error('❌ Xabar yuborish xatosi:', error.message);
    return false;
  }
}

async function getUpdates(offset = 0) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(`${API_URL}/getUpdates?offset=${offset}&timeout=25`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.ok ? data.result : [];
  } catch (error) {
    if (error.name === 'AbortError') {
      // Timeout - normal
    } else if (error.message.includes('ECONNRESET') || error.message.includes('ETIMEDOUT')) {
      // Ulanish xatolari
    } else {
      console.error('❌ Telegram API xatosi:', error.message);
    }
    return [];
  }
}

// Mijoz ID generatsiya
function generateCustomerId() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Xabar qayta ishlash
async function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text;
  const userName = message.from.first_name || 'Mijoz';
  const userLastName = message.from.last_name || '';
  const fullName = `${userName} ${userLastName}`.trim();
  
  console.log(`📨 Xabar keldi: ${fullName} (${chatId}): ${text}`);
  
  try {
    if (text === '/start') {
      console.log(`🔄 /start buyrug'i qayta ishlanmoqda...`);
      
      // Mijoz mavjudligini tekshirish
      let customer = await Customer.findOne({ chatId: String(chatId) });
      
      if (!customer) {
        console.log(`👤 Yangi mijoz yaratilmoqda: ${fullName}`);
        
        // Filiallarni olish
        const branches = await Branch.find({ isActive: true });
        
        if (branches.length === 0) {
          // Filial yo'q bo'lsa, umumiy mijoz sifatida qo'shish
          let customerId = generateCustomerId();
          while (await Customer.findOne({ customerId })) {
            customerId = generateCustomerId();
          }
          
          customer = await Customer.create({
            customerId,
            name: fullName,
            chatId: String(chatId),
            branchId: 0,
            totalDebt: 0
          });
          
          console.log(`✅ Yangi mijoz ro'yxatga olindi: ${fullName} (ID: ${customerId})`);
          
          const welcomeMsg = `👋 <b>Assalomu alaykum ${customer.name}!</b>

🆔 <b>Sizning mijoz ID raqamingiz:</b>
<code>${customer.customerId}</code>

📝 <b>Bu ID ni do'konga ayting</b> - yangi daftar ochishda kerak bo'ladi.

💡 <b>Buyruqlar:</b>
/balans - Qarzni ko'rish
/savdolar - Savdolar tarixi
/id - ID ni qayta ko'rish
/filial - Filialni o'zgartirish

📞 <b>Yordam:</b> Agar muammo bo'lsa, do'kon egasiga murojaat qiling.`;

          await sendMessage(chatId, welcomeMsg);
        } else {
          // Filial tanlash
          let branchMsg = `👋 <b>Assalomu alaykum ${fullName}!</b>

🏢 <b>Qaysi filialdan xarid qilasiz?</b>

Filial raqamini yuboring:\n\n`;
          
          branches.forEach((branch, index) => {
            branchMsg += `${index + 1}. ${branch.name}\n`;
            if (branch.address) branchMsg += `   📍 ${branch.address}\n`;
            branchMsg += `\n`;
          });
          
          branchMsg += `\n💡 Masalan: <code>1</code> yoki <code>2</code> deb yuboring`;
          
          await sendMessage(chatId, branchMsg);
          
          // Vaqtinchalik mijoz yaratish (filial tanlanmagan)
          let customerId = generateCustomerId();
          while (await Customer.findOne({ customerId })) {
            customerId = generateCustomerId();
          }
          
          await Customer.create({
            customerId,
            name: fullName,
            chatId: String(chatId),
            branchId: -1, // Filial tanlanmagan
            totalDebt: 0
          });
        }
      } else {
        console.log(`👤 Mavjud mijoz topildi: ${customer.name} (ID: ${customer.customerId})`);
        
        if (customer.branchId === -1) {
          // Filial hali tanlanmagan
          const branches = await Branch.find({ isActive: true });
          
          let branchMsg = `🏢 <b>Qaysi filialdan xarid qilasiz?</b>

Filial raqamini yuboring:\n\n`;
          
          branches.forEach((branch, index) => {
            branchMsg += `${index + 1}. ${branch.name}\n`;
            if (branch.address) branchMsg += `   📍 ${branch.address}\n`;
            branchMsg += `\n`;
          });
          
          branchMsg += `\n💡 Masalan: <code>1</code> yoki <code>2</code> deb yuboring`;
          
          await sendMessage(chatId, branchMsg);
        } else {
          const welcomeMsg = `👋 <b>Xush kelibsiz ${customer.name}!</b>

🆔 <b>Sizning mijoz ID raqamingiz:</b>
<code>${customer.customerId}</code>

📝 <b>Bu ID ni do'konga ayting</b> - yangi daftar ochishda kerak bo'ladi.

💡 <b>Buyruqlar:</b>
/balans - Qarzni ko'rish
/savdolar - Savdolar tarixi
/id - ID ni qayta ko'rish
/filial - Filialni o'zgartirish

📞 <b>Yordam:</b> Agar muammo bo'lsa, do'kon egasiga murojaat qiling.`;

          await sendMessage(chatId, welcomeMsg);
        }
      }
    }
    
    else if (text === '/filial') {
      const customer = await Customer.findOne({ chatId: String(chatId) });
      
      if (!customer) {
        await sendMessage(chatId, '❌ Siz tizimda topilmadingiz. /start buyrug\'ini yuboring.');
        return;
      }
      
      const branches = await Branch.find({ isActive: true });
      
      if (branches.length === 0) {
        await sendMessage(chatId, '❌ Hozircha filiallar mavjud emas.');
        return;
      }
      
      let branchMsg = `🏢 <b>Filialni tanlang:</b>

Filial raqamini yuboring:\n\n`;
      
      branches.forEach((branch, index) => {
        const current = customer.branchId === branch.branchId ? ' ✅' : '';
        branchMsg += `${index + 1}. ${branch.name}${current}\n`;
        if (branch.address) branchMsg += `   📍 ${branch.address}\n`;
        branchMsg += `\n`;
      });
      
      branchMsg += `\n💡 Masalan: <code>1</code> yoki <code>2</code> deb yuboring`;
      
      await sendMessage(chatId, branchMsg);
    }
    
    else if (text === '/id') {
      const customer = await Customer.findOne({ chatId: String(chatId) });
      
      if (!customer) {
        await sendMessage(chatId, '❌ Siz tizimda topilmadingiz. /start buyrug\'ini yuboring.');
      } else if (customer.branchId === -1) {
        await sendMessage(chatId, '⚠️ Avval filialni tanlang!\n\n/filial buyrug\'ini yuboring.');
      } else {
        const branch = await Branch.findOne({ branchId: customer.branchId });
        const branchName = branch ? branch.name : 'Umumiy';
        
        const idMsg = `🆔 <b>Sizning mijoz ID raqamingiz:</b>

<code>${customer.customerId}</code>

🏢 <b>Filial:</b> ${branchName}

📝 Bu ID ni do'konga ayting - yangi daftar ochishda kerak bo'ladi.`;
        await sendMessage(chatId, idMsg);
      }
    }
    
    else if (text === '/balans') {
      const customer = await Customer.findOne({ chatId: String(chatId) });
      
      const formatUSD = (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
      if (!customer) {
        await sendMessage(chatId, '❌ Siz tizimda topilmadingiz.\n\n📝 /start buyrug\'ini yuboring.');
      } else if (customer.branchId === -1) {
        await sendMessage(chatId, '⚠️ Avval filialni tanlang!\n\n/filial buyrug\'ini yuboring.');
      } else if (customer.totalDebt <= 0) {
        const balanceMsg = customer.totalDebt < 0 
          ? `✅ <b>Sizning balansingiz</b>

💰 Ortiqcha to'langan: <b>${formatUSD(Math.abs(customer.totalDebt))}</b>

😊 Rahmat!`
          : `✅ <b>Sizning qarzingiz yo'q!</b>

😊 Rahmat!`;
        await sendMessage(chatId, balanceMsg);
      } else {
        const sales = await Sale.find({ 
          customerId: customer.customerId,
          type: 'sale',
          $expr: { $gt: ['$price', '$paid'] }
        });
        
        const debtDays = customer.firstDebtDate 
          ? Math.floor((new Date() - customer.firstDebtDate) / (1000 * 60 * 60 * 24))
          : 0;
        
        const blocked = debtDays >= 10;
        
        let balanceMsg = blocked ? '🚫 <b>SIZ BLOKLANGANSIZ!</b>\n\n' : '💰 <b>Sizning balansingiz</b>\n\n';
        balanceMsg += `🆔 Mijoz ID: <code>${customer.customerId}</code>\n`;
        balanceMsg += `📊 Jami qarz: <b>${formatUSD(customer.totalDebt)}</b>\n`;
        balanceMsg += `📆 Qarz kunlari: ${debtDays} kun\n\n`;
        
        if (sales.length > 0) {
          balanceMsg += `📋 Qarz tafsilotlari:\n`;
          sales.forEach((sale, index) => {
            const saleDebt = sale.price - sale.paid;
            balanceMsg += `${index + 1}. ${sale.product} - ${formatUSD(saleDebt)} (${sale.date})\n`;
          });
        }
        
        if (blocked) {
          balanceMsg += `\n🚫 Qarzni to'laguncha yangi mahsulot ololmaysiz!\n\nIltimos, tezroq to'lang!`;
        }
        
        await sendMessage(chatId, balanceMsg);
      }
    }
    
    else if (text === '/savdolar') {
      const customer = await Customer.findOne({ chatId: String(chatId) });
      
      const formatUSD = (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
      if (!customer) {
        await sendMessage(chatId, '❌ Siz tizimda topilmadingiz.\n\n📝 /start buyrug\'ini yuboring.');
      } else if (customer.branchId === -1) {
        await sendMessage(chatId, '⚠️ Avval filialni tanlang!\n\n/filial buyrug\'ini yuboring.');
      } else {
        // CashierSale dan qidirish
        const salesModel = CashierSale || Sale;
        const sales = await salesModel.find({ 
          customerId: customer.customerId,
          type: 'sale'
        }).sort({ createdAt: -1 }).limit(10);
        
        if (sales.length === 0) {
          await sendMessage(chatId, '📋 <b>Sizning savdolaringiz yo\'q</b>\n\n😊 Birinchi xaridingizni qiling!');
        } else {
          let salesMsg = `📋 <b>SAVDOLAR TARIXI</b>\n\n`;
          salesMsg += `👤 Mijoz: ${customer.name}\n`;
          salesMsg += `🆔 ID: <code>${customer.customerId}</code>\n\n`;
          salesMsg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
          
          let totalAmount = 0;
          let totalPaid = 0;
          
          sales.forEach((sale, index) => {
            const debt = sale.price - sale.paid;
            const status = debt > 0 ? '⚠️ Qarz' : '✅ To\'liq';
            
            salesMsg += `${index + 1}. <b>${sale.product}</b>\n`;
            salesMsg += `   💰 Narx: ${formatUSD(sale.price)}\n`;
            salesMsg += `   💵 To'landi: ${formatUSD(sale.paid)}\n`;
            
            if (debt > 0) {
              salesMsg += `   📊 Qarz: ${formatUSD(debt)}\n`;
            }
            
            salesMsg += `   ${status}\n`;
            salesMsg += `   📅 ${sale.date} ${sale.time || ''}\n\n`;
            
            totalAmount += sale.price;
            totalPaid += sale.paid;
          });
          
          const totalDebt = totalAmount - totalPaid;
          
          salesMsg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
          salesMsg += `📊 <b>JAMI:</b>\n`;
          salesMsg += `💰 Umumiy summa: ${formatUSD(totalAmount)}\n`;
          salesMsg += `💵 To'langan: ${formatUSD(totalPaid)}\n`;
          
          if (totalDebt > 0) {
            salesMsg += `⚠️ Qarz: <b>${formatUSD(totalDebt)}</b>\n`;
          } else {
            salesMsg += `✅ Qarz yo'q\n`;
          }
          
          if (sales.length === 10) {
            salesMsg += `\n💡 Oxirgi 10 ta savdo ko'rsatildi`;
          }
          
          await sendMessage(chatId, salesMsg);
        }
      }
    }
    
    // Filial raqami yuborilgan bo'lsa
    else if (/^\d+$/.test(text)) {
      const customer = await Customer.findOne({ chatId: String(chatId) });
      
      if (!customer) {
        await sendMessage(chatId, '❌ Siz tizimda topilmadingiz. /start buyrug\'ini yuboring.');
        return;
      }
      
      if (customer.branchId !== -1) {
        // Filial allaqachon tanlangan
        return;
      }
      
      const branches = await Branch.find({ isActive: true });
      const branchIndex = parseInt(text) - 1;
      
      if (branchIndex < 0 || branchIndex >= branches.length) {
        await sendMessage(chatId, `❌ Noto'g'ri filial raqami!\n\n1 dan ${branches.length} gacha raqam kiriting.`);
        return;
      }
      
      const selectedBranch = branches[branchIndex];
      
      // Mijozga filialni biriktirish
      customer.branchId = selectedBranch.branchId;
      await customer.save();
      
      console.log(`✅ Mijoz ${customer.name} filialni tanladi: ${selectedBranch.name}`);
      
      const successMsg = `✅ <b>Filial tanlandi!</b>

🏢 <b>Sizning filialingiz:</b> ${selectedBranch.name}
${selectedBranch.address ? `📍 ${selectedBranch.address}` : ''}

🆔 <b>Sizning mijoz ID raqamingiz:</b>
<code>${customer.customerId}</code>

📝 <b>Bu ID ni do'konga ayting</b> - yangi daftar ochishda kerak bo'ladi.

💡 <b>Buyruqlar:</b>
/balans - Qarzni ko'rish
/id - ID ni qayta ko'rish
/filial - Filialni o'zgartirish

😊 Xaridlaringiz baxtiyor bo'lsin!`;
      
      await sendMessage(chatId, successMsg);
    }
    
    else {
      // Noma'lum buyruq
      await sendMessage(chatId, `❓ Noma'lum buyruq: "${text}"

💡 <b>Mavjud buyruqlar:</b>
/start - Boshlash
/id - ID ko'rish  
/balans - Qarz ko'rish
/savdolar - Savdolar tarixi
/filial - Filialni o'zgartirish

📞 Yordam kerak bo'lsa, do'kon egasiga murojaat qiling.`);
    }
  } catch (error) {
    console.error(`❌ Xabar qayta ishlashda xato:`, error);
    await sendMessage(chatId, '❌ Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
  }
}

// Bot ishga tushirish
async function start() {
  if (!BOT_TOKEN) {
    console.log('⚠️  BOT_TOKEN topilmadi. Bot ishga tushmaydi.');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/getMe`);
    const data = await response.json();
    
    if (!data.ok) {
      console.error('❌ Telegram bot token noto\'g\'ri!');
      return;
    }
    
    console.log('✅ Telegram bot ulandi:', data.result.username);
  } catch (error) {
    console.error('❌ Telegram API ga ulanib bo\'lmadi:', error.message);
    return;
  }
  
  console.log('📡 Xabarlar kutilmoqda...\n');
  
  let offset = 0;
  let errorCount = 0;
  
  while (true) {
    try {
      const updates = await getUpdates(offset);
      
      if (errorCount > 0) {
        errorCount = Math.max(0, errorCount - 1);
      }
      
      for (const update of updates) {
        if (update.message && update.message.text) {
          await processMessage(update.message);
        }
        offset = update.update_id + 1;
      }
      
      if (updates.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      errorCount++;
      if (errorCount % 5 === 0) {
        console.error(`❌ Bot xatosi (${errorCount}):`, error.message);
      }
      
      const waitTime = Math.min(errorCount * 1000, 5000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      if (errorCount >= 10) {
        console.error('⚠️  Ko\'p xatolar! 30 soniya kutilmoqda...\n');
        errorCount = 0;
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
  }
}

module.exports = {
  start,
  sendMessage,
  setModels
};

if (require.main === module) {
  start();
}
