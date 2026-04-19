const express = require('express');
const { param, validationResult } = require('express-validator');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all notifications for the user
router.get('/', authenticateToken, getNotifications);

// Get unread notification count
router.get('/count/unread', authenticateToken, getUnreadCount);

// Mark a specific notification as read
router.patch('/:notificationId/read', authenticateToken, [
  param('notificationId').isUUID().withMessage('Valid notification ID required'),
  validate,
], markAsRead);

// Mark all notifications as read
router.patch('/read/all', authenticateToken, markAllAsRead);

// Delete a notification
router.delete('/:notificationId', authenticateToken, [
  param('notificationId').isUUID().withMessage('Valid notification ID required'),
  validate,
], deleteNotification);

module.exports = router;
