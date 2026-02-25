// ==================== TELEGRAM SERVICE ====================

const fetch = require('node-fetch');

class TelegramService {
  constructor(botToken) {
    this.botToken = botToken;
    this.baseUrl = `https://api.telegram.org/bot${botToken}`;
  }

  async sendMessage(chatId, message, options = {}) {
    if (!this.botToken) {
      throw new Error('BOT_TOKEN mavjud emas');
    }

    if (!chatId) {
      throw new Error('Chat ID mavjud emas');
    }

    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: options.parseMode || 'HTML',
          disable_web_page_preview: options.disablePreview || false,
          disable_notification: options.silent || false
        })
      });

      const data = await response.json();

      if (data.ok) {
        console.log(`✅ Telegram xabar yuborildi: ${chatId}`);
        return { 
          success: true, 
          messageId: data.result.message_id 
        };
      } else {
        console.error('❌ Telegram API xato:', data.description);
        return { 
          success: false, 
          error: data.description 
        };
      }
    } catch (error) {
      console.error('❌ Telegram ulanish xato:', error.message);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async sendPhoto(chatId, photoUrl, caption = '') {
    if (!this.botToken) {
      throw new Error('BOT_TOKEN mavjud emas');
    }

    try {
      const response = await fetch(`${this.baseUrl}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
          caption: caption,
          parse_mode: 'HTML'
        })
      });

      const data = await response.json();
      return data.ok ? { success: true } : { success: false, error: data.description };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendDocument(chatId, documentUrl, caption = '') {
    if (!this.botToken) {
      throw new Error('BOT_TOKEN mavjud emas');
    }

    try {
      const response = await fetch(`${this.baseUrl}/sendDocument`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          document: documentUrl,
          caption: caption,
          parse_mode: 'HTML'
        })
      });

      const data = await response.json();
      return data.ok ? { success: true } : { success: false, error: data.description };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getMe() {
    try {
      const response = await fetch(`${this.baseUrl}/getMe`);
      const data = await response.json();
      return data.ok ? data.result : null;
    } catch (error) {
      console.error('❌ Bot ma\'lumotlarini olishda xato:', error.message);
      return null;
    }
  }
}

module.exports = TelegramService;
