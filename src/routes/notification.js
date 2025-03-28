const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Apply authentication to all notification routes
router.use(authenticateToken);

// Get current user's notifications
router.get('/', notificationController.getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markNotificationAsRead);

// Routes that require admin privileges
router.post('/send/user', authorize(['bildirim_yonetimi']), notificationController.sendUserNotification);
router.post('/send/role', authorize(['bildirim_yonetimi']), notificationController.sendRoleNotification);

module.exports = router;
