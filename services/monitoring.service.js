// ==================== MONITORING & HEALTH CHECK SERVICE ====================

const os = require('os');
const mongoose = require('mongoose');

class MonitoringService {
  constructor() {
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.lastErrors = [];
    this.maxErrorHistory = 100;
  }

  // Get system health
  getSystemHealth() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    return {
      status: 'healthy',
      uptime: {
        seconds: Math.floor(uptime),
        formatted: this.formatUptime(uptime)
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0].model,
        loadAverage: os.loadavg()
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
        freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024) + ' GB'
      }
    };
  }

  // Get database health
  async getDatabaseHealth() {
    try {
      const state = mongoose.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };

      const dbStats = await mongoose.connection.db.stats();

      return {
        status: state === 1 ? 'healthy' : 'unhealthy',
        state: states[state],
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: dbStats.collections,
        dataSize: Math.round(dbStats.dataSize / 1024 / 1024) + ' MB',
        indexSize: Math.round(dbStats.indexSize / 1024 / 1024) + ' MB'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  // Get application metrics
  getApplicationMetrics() {
    return {
      requests: {
        total: this.requestCount,
        errors: this.errorCount,
        successRate: this.requestCount > 0 
          ? ((this.requestCount - this.errorCount) / this.requestCount * 100).toFixed(2) + '%'
          : '100%'
      },
      errors: {
        count: this.errorCount,
        recent: this.lastErrors.slice(-10)
      },
      startTime: new Date(this.startTime).toISOString(),
      uptime: this.formatUptime(process.uptime())
    };
  }

  // Record request
  recordRequest() {
    this.requestCount++;
  }

  // Record error
  recordError(error, context = {}) {
    this.errorCount++;
    
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context
    };

    this.lastErrors.push(errorLog);

    // Keep only last N errors
    if (this.lastErrors.length > this.maxErrorHistory) {
      this.lastErrors.shift();
    }

    // Log critical errors
    if (this.errorCount % 10 === 0) {
      console.error(`⚠️ Error count reached: ${this.errorCount}`);
    }
  }

  // Format uptime
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }

  // Check if system is healthy
  async isHealthy() {
    try {
      const dbHealth = await this.getDatabaseHealth();
      const systemHealth = this.getSystemHealth();

      return {
        healthy: dbHealth.status === 'healthy' && systemHealth.status === 'healthy',
        checks: {
          database: dbHealth.status === 'healthy',
          system: systemHealth.status === 'healthy',
          memory: systemHealth.memory.percentage < 90
        }
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  // Get full health report
  async getHealthReport() {
    return {
      timestamp: new Date().toISOString(),
      system: this.getSystemHealth(),
      database: await this.getDatabaseHealth(),
      application: this.getApplicationMetrics(),
      overall: await this.isHealthy()
    };
  }

  // Reset metrics
  resetMetrics() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.lastErrors = [];
    console.log('📊 Metrics reset');
  }
}

module.exports = new MonitoringService();
