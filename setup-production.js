#!/usr/bin/env node

// ==================== PRODUCTION SETUP SCRIPT ====================
// Automatically configure production environment

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

async function setup() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔒 PRODUCTION SETUP - DO\'KON BOSHQARUV TIZIMI');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('Bu script sizning tizimingizni production uchun sozlaydi.\n');

  // Check if .env exists
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');

  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env fayl mavjud. Qayta yozilsinmi? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('\n❌ Setup bekor qilindi.');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Iltimos, quyidagi ma\'lumotlarni kiriting:\n');

  // Collect information
  const port = await question('Port (default: 3000): ') || '3000';
  const mongoUri = await question('MongoDB URI (default: mongodb://localhost:27017/dokon): ') || 'mongodb://localhost:27017/dokon';
  const adminUsername = await question('Admin username (default: admin): ') || 'admin';
  const adminPassword = await question('Admin password (minimum 8 characters): ');

  if (!adminPassword || adminPassword.length < 8) {
    console.log('\n❌ Parol kamida 8 ta belgidan iborat bo\'lishi kerak!');
    rl.close();
    return;
  }

  const botToken = await question('Telegram Bot Token (optional, Enter to skip): ');
  const allowedOrigins = await question('Allowed Origins (comma separated, default: *): ') || '*';

  console.log('\n🔐 Xavfsiz kalitlar generatsiya qilinmoqda...\n');

  // Generate secure keys
  const jwtSecret = generateSecureKey(32);
  const sessionSecret = generateSecureKey(32);
  const encryptionKey = generateSecureKey(32);

  console.log('✅ JWT Secret: ' + jwtSecret.substring(0, 16) + '...');
  console.log('✅ Session Secret: ' + sessionSecret.substring(0, 16) + '...');
  console.log('✅ Encryption Key: ' + encryptionKey.substring(0, 16) + '...\n');

  // Create .env content
  const envContent = `# ==================== PRODUCTION ENVIRONMENT ====================
# Generated: ${new Date().toISOString()}

# Server Configuration
PORT=${port}
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=${mongoUri}

# Admin Credentials
ADMIN_USERNAME=${adminUsername}
ADMIN_PASSWORD=${adminPassword}

# Telegram Bot
BOT_TOKEN=${botToken}

# Security Keys (GENERATED - DO NOT SHARE!)
JWT_SECRET=${jwtSecret}
SESSION_SECRET=${sessionSecret}
ENCRYPTION_KEY=${encryptionKey}

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_ENCRYPTION=true

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# CORS
ALLOWED_ORIGINS=${allowedOrigins}

# Monitoring
HEALTH_CHECK_ENABLED=true
LOG_LEVEL=info
`;

  // Write .env file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env fayl yaratildi!\n');

  // Create necessary directories
  const dirs = ['backups', 'logs', 'excel-files'];
  console.log('📁 Papkalar yaratilmoqda...\n');

  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ ${dir}/ yaratildi`);
    } else {
      console.log(`ℹ️  ${dir}/ allaqachon mavjud`);
    }
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ SETUP MUVAFFAQIYATLI YAKUNLANDI!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📋 KEYINGI QADAMLAR:\n');
  console.log('1. Dependencies o\'rnatish:');
  console.log('   npm install\n');
  console.log('2. Development muhitida test qilish:');
  console.log('   npm run dev:secure\n');
  console.log('3. Production muhitida ishga tushirish:');
  console.log('   npm run start:secure\n');
  console.log('4. PM2 bilan ishga tushirish (tavsiya etiladi):');
  console.log('   npm install -g pm2');
  console.log('   pm2 start ecosystem.config.js\n');
  console.log('5. Health check:');
  console.log(`   curl http://localhost:${port}/health\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('⚠️  MUHIM ESLATMALAR:\n');
  console.log('• .env faylni hech kimga ko\'rsatmang!');
  console.log('• .env faylni git ga commit qilmang!');
  console.log('• Admin parolni xavfsiz joyda saqlang!');
  console.log('• Production serverda firewall sozlang!');
  console.log('• MongoDB ni xavfsiz sozlang!\n');

  console.log('📚 Batafsil ma\'lumot uchun PRODUCTION_DEPLOYMENT.md ni o\'qing.\n');

  rl.close();
}

// Run setup
setup().catch(error => {
  console.error('\n❌ Setup xatosi:', error.message);
  rl.close();
  process.exit(1);
});
