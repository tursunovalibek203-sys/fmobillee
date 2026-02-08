#!/usr/bin/env node

/**
 * DO'KON BOSHQARUV TIZIMI - STARTER
 * 
 * Bu fayl server va telegram botni birgalikda ishga tushiradi
 */

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║     🏪 DO\'KON BOSHQARUV TIZIMI - PROFESSIONAL        ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Server ni ishga tushirish
console.log('🚀 Server ishga tushirilmoqda...\n');

const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Avtomatik backup tizimini ishga tushirish
console.log('💾 Avtomatik backup tizimi ishga tushirilmoqda...\n');

const backup = spawn('node', ['auto-backup.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

backup.on('error', (error) => {
  console.error('❌ Backup tizimi xato:', error);
});

server.on('error', (error) => {
  console.error('❌ Server xato:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`\n⚠️  Server to'xtadi (kod: ${code})`);
  backup.kill();
  process.exit(code);
});

// Ctrl+C ni ushlash
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Tizim to\'xtatilmoqda...');
  server.kill('SIGINT');
  backup.kill('SIGINT');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  backup.kill('SIGTERM');
  process.exit(0);
});
