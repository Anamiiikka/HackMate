const express = require('express');
const { body, validationResult } = require('express-validator');
const { getHackathons, getSkills, joinHackathon } = require('../controllers/hackathonController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

// GET /hackathons?mode=online
router.get('/', getHackathons);

// GET /skills?category=backend
router.get('/skills', getSkills);

// POST /hackathons/:id/join
router.post('/:id/join', authenticateToken, [
  body('seriousness_level')
    .optional()
    .isIn(['casual', 'serious', 'win_focused'])
    .withMessage('Must be casual, serious or win_focused'),
  validate
], joinHackathon);

module.exports = router;
