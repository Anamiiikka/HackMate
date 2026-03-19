const express  = require('express');
const { body, validationResult } = require('express-validator');
const { authLimiter } = require('../middleware/rateLimiter');
const { register, login, refresh, logout } = require('../controllers/authController');

const router = express.Router();

// validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

// POST /api/v1/auth/register
router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 characters'),
  validate
], register);

// POST /api/v1/auth/login
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  validate
], login);

// POST /api/v1/auth/refresh
router.post('/refresh', [
  body('refresh_token').notEmpty().withMessage('Refresh token required'),
  validate
], refresh);

// POST /api/v1/auth/logout
router.post('/logout', [
  body('refresh_token').notEmpty().withMessage('Refresh token required'),
  validate
], logout);

module.exports = router;
