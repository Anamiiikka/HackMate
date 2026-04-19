const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { createTeam, getTeamById, getMyTeams } = require('../controllers/teamController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create a new team
router.post('/', authenticateToken, [
    body('name').notEmpty().withMessage('Team name is required'),
    body('hackathon_id').isUUID().withMessage('Valid hackathon ID is required'),
    validate,
  ],
  createTeam
);

// Get all teams for the current user
router.get('/', authenticateToken, getMyTeams);

// Get a specific team by ID
router.get('/:id', authenticateToken, [
    param('id').isUUID().withMessage('Valid team ID is required'),
    validate,
  ],
  getTeamById
);

module.exports = router;
