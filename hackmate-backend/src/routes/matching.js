const express = require('express');
const { param, validationResult } = require('express-validator');
const { getRecommendationsHandler } = require('../controllers/matchingController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

// GET /api/v1/hackathons/:id/recommendations
router.get('/:id/recommendations', authenticateToken, [
  param('id').isUUID().withMessage('Valid hackathon UUID required'),
  validate
], getRecommendationsHandler);

module.exports = router;
