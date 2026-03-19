const express = require('express');
const { body, param, validationResult } = require('express-validator');
const {
  getConversations,
  getMessages,
  createConversation
} = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

// GET /api/v1/conversations
router.get('/', authenticateToken, getConversations);

// POST /api/v1/conversations
router.post('/', authenticateToken, [
  body('participant_id').isUUID().withMessage('Valid participant_id required'),
  validate
], createConversation);

// GET /api/v1/conversations/:id/messages
router.get('/:id/messages', authenticateToken, [
  param('id').isUUID().withMessage('Valid conversation UUID required'),
  validate
], getMessages);

module.exports = router;
