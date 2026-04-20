const pool = require('../config/db');

// Create a notification
const createNotification = async (userId, type, message, link = null) => {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, message, link)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, type, message, link]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Error creating notification:', err.message);
    throw err;
  }
};

// Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { limit = 20, offset = 0 } = req.query;

    if (!userId) {
       return res.status(400).json({ error: 'User ID is missing from token' });
    }

    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit) || 20, parseInt(offset) || 0]
    );

    return res.status(200).json({ notifications: result.rows });
  } catch (err) {
    console.error('getNotifications error:', err.message);
    return res.status(500).json({ error: 'getNotifications error: ' + err.message });
  }
};

// Get unread notifications count
const getUnreadCount = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const result = await pool.query(
      `SELECT COUNT(*) as unread_count FROM notifications
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );

    return res.status(200).json({ unread_count: parseInt(result.rows[0].unread_count) });
  } catch (err) {
    console.error('getUnreadCount error:', err.message);
    return res.status(500).json({ error: 'getUnreadCount error: ' + err.message });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { notificationId } = req.params;

    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.status(200).json({ notification: result.rows[0] });
  } catch (err) {
    console.error('markAsRead error:', err.message);
    return res.status(500).json({ error: 'markAsRead error: ' + err.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );

    return res.status(200).json({ updated: result.rowCount });
  } catch (err) {
    console.error('markAllAsRead error:', err.message);
    return res.status(500).json({ error: 'markAllAsRead error: ' + err.message });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { notificationId } = req.params;

    const result = await pool.query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('deleteNotification error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
