const { db, admin } = require('../config/firebase');

/**
 * Notification service for sending system notifications
 */
class NotificationService {
  /**
   * Send a notification to a specific user
   * @param {string} userId - User ID to notify
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type (info, warning, error)
   * @return {Object} - Created notification
   */
  async sendUserNotification(userId, title, message, type = 'info') {
    if (!userId || !title || !message) {
      throw new Error('User ID, title and message are required');
    }
    
    // Check if user exists
    const userDoc = await db.collection('personel').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    // Create notification
    const notificationRef = db.collection('notifications').doc();
    const notification_id = notificationRef.id;
    
    const notificationData = {
      notification_id,
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await notificationRef.set(notificationData);
    return notificationData;
  }
  
  /**
   * Send a notification to all users with a specific role
   * @param {string} role - User role to notify
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type (info, warning, error)
   * @return {Array} - Created notifications
   */
  async sendRoleNotification(role, title, message, type = 'info') {
    if (!role || !title || !message) {
      throw new Error('Role, title and message are required');
    }
    
    // Get all users with the specified role
    const usersSnapshot = await db.collection('personel')
      .where('rol', '==', role)
      .get();
    
    const notifications = [];
    
    // Create a notification for each user
    const batch = db.batch();
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const notificationRef = db.collection('notifications').doc();
      const notification_id = notificationRef.id;
      
      const notificationData = {
        notification_id,
        user_id: userData.personel_id,
        title,
        message,
        type,
        is_read: false,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      };
      
      batch.set(notificationRef, notificationData);
      notifications.push(notificationData);
    });
    
    await batch.commit();
    return notifications;
  }
  
  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {boolean} onlyUnread - Get only unread notifications
   * @return {Array} - User notifications
   */
  async getUserNotifications(userId, onlyUnread = false) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    let query = db.collection('notifications')
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc');
    
    if (onlyUnread) {
      query = query.where('is_read', '==', false);
    }
    
    const notificationsSnapshot = await query.get();
    
    const notifications = [];
    notificationsSnapshot.forEach(doc => {
      notifications.push(doc.data());
    });
    
    return notifications;
  }
  
  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID
   * @return {Object} - Updated notification
   */
  async markAsRead(notificationId, userId) {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }
    
    const notificationDoc = await db.collection('notifications').doc(notificationId).get();
    
    if (!notificationDoc.exists) {
      throw new Error('Notification not found');
    }
    
    const notificationData = notificationDoc.data();
    
    // Ensure user owns this notification
    if (userId && notificationData.user_id !== userId) {
      throw new Error('Access denied: Notification does not belong to this user');
    }
    
    // Update notification
    await db.collection('notifications').doc(notificationId).update({
      is_read: true,
      read_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Return updated notification
    const updatedDoc = await db.collection('notifications').doc(notificationId).get();
    return updatedDoc.data();
  }
}

module.exports = new NotificationService();
