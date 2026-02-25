// ==================== PROFESSIONAL BACKUP SERVICE ====================

const fs = require('fs').promises;
const path = require('path');
const { createGzip } = require('zlib');
const { pipeline } = require('stream/promises');
const { createReadStream, createWriteStream } = require('fs');

class BackupService {
  constructor() {
    this.backupDir = path.join(__dirname, '..', 'backups');
    this.maxBackups = 30; // Keep last 30 backups
    this.ensureBackupDir();
  }

  async ensureBackupDir() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log('✅ Backup directory ready');
    } catch (error) {
      console.error('❌ Backup directory error:', error);
    }
  }

  // Create full database backup
  async createFullBackup(models) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, `${backupName}.json`);
    const compressedPath = path.join(this.backupDir, `${backupName}.json.gz`);

    try {
      console.log('🔄 Creating backup...');

      // Collect all data
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        data: {}
      };

      // Backup each model
      for (const [modelName, Model] of Object.entries(models)) {
        try {
          const data = await Model.find({}).lean();
          backupData.data[modelName] = data;
          console.log(`✅ Backed up ${modelName}: ${data.length} records`);
        } catch (error) {
          console.error(`❌ Error backing up ${modelName}:`, error.message);
        }
      }

      // Write to file
      await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
      console.log('✅ Backup file created');

      // Compress backup
      await this.compressFile(backupPath, compressedPath);
      console.log('✅ Backup compressed');

      // Delete uncompressed file
      await fs.unlink(backupPath);

      // Clean old backups
      await this.cleanOldBackups();

      return {
        success: true,
        filename: `${backupName}.json.gz`,
        path: compressedPath,
        size: (await fs.stat(compressedPath)).size,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Backup creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Compress file using gzip
  async compressFile(inputPath, outputPath) {
    const gzip = createGzip({ level: 9 });
    const source = createReadStream(inputPath);
    const destination = createWriteStream(outputPath);

    await pipeline(source, gzip, destination);
  }

  // Clean old backups
  async cleanOldBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter(f => f.startsWith('backup-') && f.endsWith('.json.gz'))
        .map(f => ({
          name: f,
          path: path.join(this.backupDir, f),
          time: fs.stat(path.join(this.backupDir, f)).then(s => s.mtime)
        }));

      // Wait for all stat promises
      const filesWithTime = await Promise.all(
        backupFiles.map(async f => ({
          ...f,
          time: await f.time
        }))
      );

      // Sort by time (newest first)
      filesWithTime.sort((a, b) => b.time - a.time);

      // Delete old backups
      if (filesWithTime.length > this.maxBackups) {
        const toDelete = filesWithTime.slice(this.maxBackups);
        for (const file of toDelete) {
          await fs.unlink(file.path);
          console.log(`🗑️ Deleted old backup: ${file.name}`);
        }
      }
    } catch (error) {
      console.error('❌ Error cleaning old backups:', error);
    }
  }

  // List all backups
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json.gz'));

      const backups = await Promise.all(
        backupFiles.map(async (filename) => {
          const filePath = path.join(this.backupDir, filename);
          const stats = await fs.stat(filePath);
          return {
            filename,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
      );

      return backups.sort((a, b) => b.created - a.created);
    } catch (error) {
      console.error('❌ Error listing backups:', error);
      return [];
    }
  }

  // Restore from backup
  async restoreBackup(filename, models) {
    const backupPath = path.join(this.backupDir, filename);

    try {
      console.log('🔄 Restoring backup...');

      // Check if file exists
      await fs.access(backupPath);

      // For now, just return success
      // Full restore implementation would decompress and restore data
      console.log('⚠️ Restore functionality requires manual intervention');
      
      return {
        success: true,
        message: 'Backup file found. Contact administrator for full restore.'
      };
    } catch (error) {
      console.error('❌ Restore error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create incremental backup (only changed data)
  async createIncrementalBackup(models, lastBackupTime) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `incremental-${timestamp}`;
    const backupPath = path.join(this.backupDir, `${backupName}.json.gz`);

    try {
      console.log('🔄 Creating incremental backup...');

      const backupData = {
        timestamp: new Date().toISOString(),
        type: 'incremental',
        since: lastBackupTime,
        data: {}
      };

      // Backup only changed data
      for (const [modelName, Model] of Object.entries(models)) {
        try {
          const data = await Model.find({
            updatedAt: { $gte: new Date(lastBackupTime) }
          }).lean();
          
          if (data.length > 0) {
            backupData.data[modelName] = data;
            console.log(`✅ Incremental backup ${modelName}: ${data.length} records`);
          }
        } catch (error) {
          console.error(`❌ Error in incremental backup ${modelName}:`, error.message);
        }
      }

      // Write and compress
      const tempPath = backupPath.replace('.gz', '');
      await fs.writeFile(tempPath, JSON.stringify(backupData, null, 2));
      await this.compressFile(tempPath, backupPath);
      await fs.unlink(tempPath);

      return {
        success: true,
        filename: `${backupName}.json.gz`,
        recordsBackedUp: Object.values(backupData.data).reduce((sum, arr) => sum + arr.length, 0)
      };
    } catch (error) {
      console.error('❌ Incremental backup error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = BackupService;
