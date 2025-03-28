const notificationService = require('../services/notificationservice');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

// Send notification to a specific user
exports.sendUserNotification = asyncHandler(async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    
    const notification = await notificationService.sendUserNotification(userId, title, message, type);
    
    return res.status(201).json({
      success: true,
      message: 'Bildirim başarıyla gönderildi',
      notification
    });
  } catch (error) {
    console.error('Bildirim gönderme hatası:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Bildirim gönderilirken bir hata oluştu'
    });
  }
});

// Send notification to all users with a specific role
exports.sendRoleNotification = asyncHandler(async (req, res) => {
  try {
    const { role, title, message, type } = req.body;
    
    const notifications = await notificationService.sendRoleNotification(role, title, message, type);
    
    return res.status(201).json({
      success: true,
      message: `Bildirim ${notifications.length} kullanıcıya başarıyla gönderildi`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Rol bildirimi gönderme hatası:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Rol bildirimi gönderilirken bir hata oluştu'
    });
  }
});

// Get notifications for current user
exports.getUserNotifications = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.personel_id;
    const onlyUnread = req.query.unread === 'true';
    
    const notifications = await notificationService.getUserNotifications(userId, onlyUnread);
    
    return res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Bildirim getirme hatası:', error);
    return res.status(500).json({
      success: false,
      error: 'Bildirimler getirilirken bir hata oluştu'
    });
  }
});

// Mark notification as read
exports.markNotificationAsRead = asyncHandler(async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.personel_id;
    
    const notification = await notificationService.markAsRead(notificationId, userId);
    
    return res.status(200).json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi',
      notification
    });
  } catch (error) {
    console.error('Bildirim işaretleme hatası:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Bildirim okundu olarak işaretlenirken bir hata oluştu'
    });
  }
});
