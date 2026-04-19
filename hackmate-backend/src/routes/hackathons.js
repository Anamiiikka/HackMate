const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { getHackathons, getSkills, joinHackathon, getHackathonById, createHackathon } = require('../controllers/hackathonController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

// POST /hackathons - create new hackathon
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').isISO8601().withMessage('Valid end date is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('mode').isIn(['online', 'offline', 'hybrid']).withMessage('Invalid mode'),
  validate
], createHackathon);

// GET /skills - get all skills
router.get('/skills', getSkills);

// POST /hackathons/:id/join - join a hackathon
router.post('/:id/join', authenticateToken, [
  body('seriousness_level')
    .optional()
    .isIn(['casual', 'serious', 'win_focused'])
    .withMessage('Must be casual, serious or win_focused'),
  validate
], joinHackathon);

// GET /hackathons/:id - get specific hackathon
router.get('/:id', [
  param('id').isUUID().withMessage('Valid hackathon ID required'),
  validate
], getHackathonById);

// GET /hackathons - get all hackathons
router.get('/', getHackathons);

module.exports = router;
