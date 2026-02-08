require('dotenv').config();
const fetch = require('node-fetch');
const mongoose = require('mongoose');

const BOT_TOKEN = process.env.BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Modellarni import qilish (qayta yaratmaslik uchun)
let Customer, Sale;

function setModels(customerModel, saleModel) {
  Customer = customerModel;
  Sale = saleModel;
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
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 soniya timeout
    
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
      // Timeout - bu normal, faqat debug rejimida ko'rsatamiz
      // console.log('⏱️  Timeout (normal)');
    } else if (error.message.includes('ECONNRESET') || error.message.includes('ETIMEDOUT')) {
      // Ulanish xatolari - faqat debug rejimida
      // console.log('🔌 Ulanish xatosi, qayta ulanilmoqda...');
    } else {
      // Faqat haqiqiy xatolarni ko'rsatamiz
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
        
        // Yangi mijoz yaratish
        let customerId = generateCustomerId();
        
        // ID takrorlanmasligini ta'minlash
        while (await Customer.findOne({ customerId })) {
          customerId = generateCustomerId();
        }
        
        customer = await Customer.create({
          customerId,
          name: fullName,
          chatId: String(chatId),
          totalDebt: 0
        });
        
        console.log(`✅ Yangi mijoz ro'yxatga olindi: ${fullName} (ID: ${customerId})`);
      } else {
        console.log(`👤 Mavjud mijoz topildi: ${customer.name} (ID: ${customer.customerId})`);
      }
      
      const welcomeMsg = `👋 <b>Assalomu alaykum ${customer.name}!</b>

🆔 <b>Sizning mijoz ID raqamingiz:</b>
<code>${customer.customerId}</code>

📝 <b>Bu ID ni do'konga ayting</b> - yangi daftar ochishda kerak bo'ladi.

💡 <b>Buyruqlar:</b>
/balans - Qarzni ko'rish
/id - ID ni qayta ko'rish

📞 <b>Yordam:</b> Agar muammo bo'lsa, do'kon egasiga murojaat qiling.`;

      await sendMessage(chatId, welcomeMsg);
    }
    
    else if (text === '/id') {
      const customer = await Customer.findOne({ chatId: String(chatId) });
      
      if (!customer) {
        await sendMessage(chatId, '❌ Siz tizimda topilmadingiz. /start buyrug\'ini yuboring.');
      } else {
        const idMsg = `🆔 <b>Sizning mijoz ID raqamingiz:</b>

<code>${customer.customerId}</code>

📝 Bu ID ni do'konga ayting - yangi daftar ochishda kerak bo'ladi.`;
        await sendMessage(chatId, idMsg);
      }
    }
    
    else if (text === '/balans') {
      const customer = await Customer.findOne({ chatId: String(chatId) });
      
      // Pul formatini USD ga o'zgartirish
      const formatUSD = (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
      if (!customer) {
        await sendMessage(chatId, '❌ Siz tizimda topilmadingiz.\n\n📝 /start buyrug\'ini yuboring.');
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
        
        const blocked = debtDays >= 10; // 10 kun bloklash
        
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
    
    else {
      // Noma'lum buyruq
      await sendMessage(chatId, `❓ Noma'lum buyruq: "${text}"

💡 <b>Mavjud buyruqlar:</b>
/start - Boshlash
/id - ID ko'rish  
/balans - Qarz ko'rish

📞 Yordam kerak bo'lsa, do'kon egasiga murojaat qiling.`);
    }
  } catch (error) {
    console.error(`❌ Xabar qayta ishlashda xato:`, error);
    await sendMessage(chatId, '❌ Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
  }
}

// Asosiy bot loop
async function startBot() {
  return start();
}

// Bot ishga tushirish
async function start() {
  if (!BOT_TOKEN) {
    console.log('⚠️  BOT_TOKEN topilmadi. Bot ishga tushmaydi.');
    return;
  }
  
  console.log('🤖 Telegram bot ishga tushdi...');
  console.log('📡 Xabarlar kutilmoqda...\n');
  
  let offset = 0;
  let errorCount = 0;
  let maxErrors = 10;
  let lastErrorTime = 0;
  
  while (true) {
    try {
      const updates = await getUpdates(offset);
      
      // Muvaffaqiyatli so'rov - xatolar sonini qayta tiklash
      if (errorCount > 0) {
        errorCount = Math.max(0, errorCount - 1);
      }
      
      for (const update of updates) {
        if (update.message && update.message.text) {
          await processMessage(update.message);
        }
        offset = update.update_id + 1;
      }
      
      // Agar updates bo'sh bo'lsa, biroz kutish
      if (updates.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      const now = Date.now();
      
      // Faqat 5 soniyada bir marta xato xabarini ko'rsatamiz
      if (now - lastErrorTime > 5000) {
        errorCount++;
        console.error(`❌ Bot xatosi (${errorCount}/${maxErrors}):`, error.message);
        lastErrorTime = now;
      }
      
      // Xatolar ko'p bo'lsa, uzoqroq kutish
      const waitTime = Math.min(errorCount * 1000, 5000); // Max 5 soniya
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Juda ko'p xato bo'lsa, ogohlantiramiz
      if (errorCount >= maxErrors) {
        console.error('⚠️  Ko\'p xatolar! Internet ulanishini tekshiring.');
        console.log('⏳ 30 soniya kutilmoqda...\n');
        errorCount = 0; // Qayta boshlash
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 soniya kutish
      }
    }
  }
}

// Export
module.exports = {
  start,
  sendMessage,
  setModels
};

// Agar to'g'ridan-to'g'ri ishga tushirilsa
if (require.main === module) {
  start();
}