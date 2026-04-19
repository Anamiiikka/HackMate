const express = require('express');
const { body, param, validationResult } = require('express-validator');
const {
  getMyProfile,
  updateMyProfile,
  updateMySkills,
  addAvailability,
  deleteAvailability,
  getUserById,
  getPotentialMatches
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

// GET /users/potential-matches
router.get('/potential-matches', authenticateToken, getPotentialMatches);

// GET /users/me
router.get('/me', authenticateToken, getMyProfile);

// PUT /users/me
router.put('/me', authenticateToken, [
  body('experience_level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Must be beginner, intermediate or advanced'),
  body('github_url').optional().isURL().withMessage('Invalid GitHub URL'),
  body('linkedin_url').optional().isURL().withMessage('Invalid LinkedIn URL'),
  validate
], updateMyProfile);

// PUT /users/me/skills
router.put('/me/skills', authenticateToken, [
  body().isArray({ min: 1 }).withMessage('Provide at least one skill'),
  body('*.skill_id').isInt({ min: 1 }).withMessage('Valid skill_id required'),
  body('*.proficiency').isInt({ min: 1, max: 5 }).withMessage('Proficiency must be 1-5'),
  validate
], updateMySkills);

// POST /users/me/availability
router.post('/me/availability', authenticateToken, [
  body('hackathon_id').isUUID().withMessage('Valid hackathon_id required'),
  body('start_time').matches(/^\d{2}:\d{2}$/).withMessage('start_time format: HH:MM'),
  body('end_time').matches(/^\d{2}:\d{2}$/).withMessage('end_time format: HH:MM'),
  validate
], addAvailability);

// DELETE /users/me/availability/:id
router.delete('/me/availability/:id', authenticateToken, [
  param('id').isInt({ min: 1 }).withMessage('Valid slot id required'),
  validate
], deleteAvailability);

// GET /users/:id  (public)
router.get('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Valid user UUID required'),
  validate
], getUserById);

module.exports = router;
