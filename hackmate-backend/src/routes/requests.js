const express = require('express');
const { body, param, validationResult } = require('express-validator');
const {
  sendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  respondToRequest,
  cancelRequest,
  sendConnectionRequest
} = require('../controllers/requestController');
const { authenticateToken } = require('../middleware/auth');
const { requestSendLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

// POST /api/v1/requests/send
router.post('/send', authenticateToken, [
  body('receiverId').isUUID().withMessage('Valid receiverId required'),
  validate
], sendConnectionRequest);

// POST /api/v1/requests
router.post('/', authenticateToken, requestSendLimiter, [
  body('to_user_id').isUUID().withMessage('Valid to_user_id required'),
  body('hackathon_id').isUUID().withMessage('Valid hackathon_id required'),
  body('message').optional().isLength({ max: 300 }).withMessage('Message max 300 chars'),
  validate
], sendRequest);

// GET /api/v1/requests/incoming
router.get('/incoming', authenticateToken, getIncomingRequests);

// GET /api/v1/requests/outgoing
router.get('/outgoing', authenticateToken, getOutgoingRequests);

// PATCH /api/v1/requests/:id
router.patch('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Valid request UUID required'),
  body('status').isIn(['accepted','rejected']).withMessage('Status must be accepted or rejected'),
  validate
], respondToRequest);

// DELETE /api/v1/requests/:id
router.delete('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Valid request UUID required'),
  validate
], cancelRequest);

module.exports = router;
