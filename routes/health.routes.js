// ==================== HEALTH CHECK ROUTES ====================

const express = require('express');
const router = express.Router();
const monitoringService = require('../services/monitoring.service');

// Basic health check
router.get('/', async (req, res) => {
  try {
    const health = await monitoringService.isHealthy();
    
    res.status(health.healthy ? 200 : 503).json({
      status: health.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: health.checks
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health report
router.get('/detailed', async (req, res) => {
  try {
    const report = await monitoringService.getHealthReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// System metrics
router.get('/metrics', (req, res) => {
  try {
    const metrics = monitoringService.getApplicationMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Database status
router.get('/database', async (req, res) => {
  try {
    const dbHealth = await monitoringService.getDatabaseHealth();
    res.json(dbHealth);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// System status
router.get('/system', (req, res) => {
  try {
    const systemHealth = monitoringService.getSystemHealth();
    res.json(systemHealth);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Readiness probe (for Kubernetes/Docker)
router.get('/ready', async (req, res) => {
  try {
    const health = await monitoringService.isHealthy();
    res.status(health.healthy ? 200 : 503).json({
      ready: health.healthy
    });
  } catch (error) {
    res.status(503).json({
      ready: false
    });
  }
});

// Liveness probe (for Kubernetes/Docker)
router.get('/live', (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
