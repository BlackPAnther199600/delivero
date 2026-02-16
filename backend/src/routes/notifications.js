import express from 'express';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

// Notification Service class
class NotificationService {
  static async sendPushNotification(userId, title, body, data = {}) {
    try {
      // Get user's push token
      const userResult = await db.query(
        'SELECT push_token FROM users WHERE id = $1',
        [userId]
      );

      if (!userResult.rows[0]?.push_token) {
        console.log('No push token found for user:', userId);
        return { success: false, message: 'No push token available' };
      }

      const pushToken = userResult.rows[0].push_token;

      // Create notification record
      const notificationResult = await db.query(`
        INSERT INTO notifications (user_id, title, body, data, type, created_at, read)
        VALUES ($1, $2, $3, $4, NOW(), false)
        RETURNING id
      `, [userId, title, body, JSON.stringify(data), 'push']);

      const notificationId = notificationResult.rows[0].id;

      // Here you would integrate with FCM, APNs, or other push services
      console.log(`Push notification sent to user ${userId}:`, { title, body, data });

      // Mock push notification (in production, use actual push service)
      return {
        success: true,
        notificationId: notificationId,
        message: 'Push notification sent successfully'
      };

    } catch (error) {
      console.error('Failed to send push notification:', error);
      return { success: false, error: error.message };
    }
  }

  static async getNotifications(userId, unreadOnly = false) {
    try {
      let query = `
        SELECT id, title, body, data, type, created_at, read
        FROM notifications 
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;

      if (unreadOnly) {
        query += ' AND read = false';
      }

      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  static async markAsRead(notificationId, userId) {
    try {
      await db.query(`
        UPDATE notifications 
        SET read = true, read_at = NOW()
        WHERE id = $1 AND user_id = $2
      `, [notificationId, userId]);

      return { success: true };
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  static async createOrderNotification(userId, orderId, status) {
    const statusMessages = {
      'pending': 'Il tuo ordine è in attesa',
      'confirmed': 'Ordine confermato dal ristorante',
      'preparing': 'Il rider sta preparando il tuo ordine',
      'ready': 'Il tuo ordine è pronto per il ritiro',
      'picked_up': 'Il rider ha ritirato il tuo ordine',
      'in_transit': 'Il tuo ordine è in consegna',
      'delivered': 'Ordine consegnato con successo!'
    };

    return this.sendPushNotification(
      userId,
      `Aggiornamento Ordine #${orderId}`,
      statusMessages[status] || 'Il tuo ordine è stato aggiornato',
      {
        orderId,
        status,
        type: 'order_update'
      }
    );
  }

  static async createPromotionNotification(userId, promotion) {
    return this.sendPushNotification(
      userId,
      '🎉 Offerta Speciale!',
      promotion.title,
      {
        promotionId: promotion.id,
        type: 'promotion',
        discount: promotion.discount
      }
    );
  }

  static async createSystemNotification(title, body, data = {}) {
    try {
      const result = await db.query(`
        INSERT INTO notifications (user_id, title, body, data, type, created_at, read)
        VALUES (NULL, $1, $2, $3, 'system', NOW(), false)
        RETURNING id
      `, [title, JSON.stringify(data), 'system']);

      console.log('System notification created:', { title, body, data });
      return result.rows[0];
    } catch (error) {
      console.error('Failed to create system notification:', error);
      return null;
    }
  }
}

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { unread_only = false } = req.query;

    const notifications = await NotificationService.getNotifications(userId, unread_only);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get notifications', error: error.message });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const result = await NotificationService.markAsRead(notificationId, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    await db.query(`
      UPDATE notifications 
      SET read = true, read_at = NOW()
      WHERE user_id = $1 AND read = false
    `, [userId]);

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
  }
});

// Send push notification
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    // Admin can send notifications to any user
    if (req.user.role !== 'admin' && req.user.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await NotificationService.sendPushNotification(userId, title, body, data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send notification', error: error.message });
  }
});

// Update notification settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;
    const userId = req.user.userId;

    for (const [key, value] of Object.entries(settings)) {
      await db.query(`
        INSERT INTO notification_settings (user_id, setting_key, setting_value)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, setting_key) 
        DO UPDATE SET setting_value = EXCLUDED.setting_value
      `, [userId, key, value]);
    }

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings', error: error.message });
  }
});

// Get notification settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(`
      SELECT setting_key, setting_value 
      FROM notification_settings 
      WHERE user_id = $1
    `, [userId]);

    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get settings', error: error.message });
  }
});

export default router;
