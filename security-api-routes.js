// 🔐 Security API Routes
const express = require('express');
const router = express.Router();
const {
  authenticateSession,
  requireRole,
  activityLogger,
  createSession,
  destroySession,
  trackFailedLogin,
  isUserBlocked,
  clearFailedLogins,
  hashPassword,
  Session,
  ActivityLog,
  FailedLogin,
  SecuritySettings
} = require('./security-middleware');

// ==================== SECURITY ENDPOINTS ====================

// Get security statistics
router.get('/stats', authenticateSession, requireRole('admin'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [activeSessions, todayLogins, failedAttempts, blockedUsers] = await Promise.all([
      Session.countDocuments({ isActive: true, expiresAt: { $gt: new Date() } }),
      ActivityLog.countDocuments({ action: 'login', timestamp: { $gte: today } }),
      FailedLogin.countDocuments(),
      FailedLogin.countDocuments({ blockedUntil: { $gt: new Date() } })
    ]);
    
    res.json({
      success: true,
      stats: {
        activeSessions,
        todayLogins,
        failedAttempts,
        blockedUsers
      }
    });
  } catch (error) {
    console.error('Security stats xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get security settings
router.get('/settings', authenticateSession, requireRole('admin'), async (req, res) => {
  try {
    let settings = await SecuritySettings.findOne();
    
    if (!settings) {
      settings = await SecuritySettings.create({
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        sessionTimeout: 24,
        requireStrongPassword: true,
        enable2FA: false
      });
    }
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Get security settings xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update security settings
router.post('/settings', authenticateSession, requireRole('admin'), activityLogger('update', 'security_settings'), async (req, res) => {
  try {
    const { maxLoginAttempts, lockoutDuration, sessionTimeout, requireStrongPassword, enable2FA } = req.body;
    
    let settings = await SecuritySettings.findOne();
    
    if (!settings) {
      settings = await SecuritySettings.create({
        maxLoginAttempts,
        lockoutDuration,
        sessionTimeout,
        requireStrongPassword,
        enable2FA
      });
    } else {
      settings.maxLoginAttempts = maxLoginAttempts;
      settings.lockoutDuration = lockoutDuration;
      settings.sessionTimeout = sessionTimeout;
      settings.requireStrongPassword = requireStrongPassword;
      settings.enable2FA = enable2FA;
      await settings.save();
    }
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Update security settings xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get active sessions
router.get('/sessions', authenticateSession, requireRole('admin'), async (req, res) => {
  try {
    const sessions = await Session.find({
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ lastActivity: -1 });
    
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Get sessions xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Terminate session
router.delete('/sessions/:sessionId', authenticateSession, requireRole('admin'), activityLogger('terminate', 'session'), async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session topilmadi' });
    }
    
    session.isActive = false;
    await session.save();
    
    res.json({ success: true, message: 'Session tugatildi' });
  } catch (error) {
    console.error('Terminate session xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get activity log
router.get('/activity-log', authenticateSession, requireRole('admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const logs = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.json({ success: true, logs });
  } catch (error) {
    console.error('Get activity log xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get failed login attempts
router.get('/failed-logins', authenticateSession, requireRole('admin'), async (req, res) => {
  try {
    const failedLogins = await FailedLogin.find().sort({ lastAttempt: -1 });
    
    res.json({ success: true, failedLogins });
  } catch (error) {
    console.error('Get failed logins xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear failed login attempts
router.post('/failed-logins/clear', authenticateSession, requireRole('admin'), activityLogger('clear', 'failed_login'), async (req, res) => {
  try {
    const { username, ipAddress } = req.body;
    
    await clearFailedLogins(username, ipAddress);
    
    res.json({ success: true, message: 'Failed login tozalandi' });
  } catch (error) {
    console.error('Clear failed login xato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
