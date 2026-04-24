const express = require('express');
const { body, param, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

// Protect all admin routes
router.use(authenticateToken, requireAdmin);

// ── GET /admin/users ─────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, is_admin, is_premium, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error('GET /admin/users error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── PATCH /admin/users/:id/premium ─────────────────────────
router.patch('/users/:id/premium', [
  param('id').isUUID().withMessage('Valid user UUID required'),
  body('is_premium').isBoolean().withMessage('is_premium must be a boolean'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;
    const { is_premium } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET is_premium = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, name, email, is_admin, is_premium`,
      [is_premium, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User premium status updated', user: result.rows[0] });
  } catch (error) {
    console.error('PATCH /admin/users/:id/premium error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /admin/hackathons ────────────────────────────────
router.post('/hackathons', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional(),
  body('start_date').isISO8601().withMessage('Valid start_date required'),
  body('end_date').isISO8601().withMessage('Valid end_date required'),
  body('mode').isIn(['online', 'offline', 'hybrid']).withMessage('Mode must be online, offline, or hybrid'),
  body('location').optional(),
  body('max_team_size').optional().isInt({ min: 1 }),
  body('min_team_size').optional().isInt({ min: 1 }),
  body('tech_focus').optional().isArray(),
  body('website_url').optional().isURL().withMessage('Valid website_url required'),
  validate
], async (req, res) => {
  try {
    const {
      name, description, start_date, end_date, mode, location,
      max_team_size, min_team_size, tech_focus, website_url
    } = req.body;

    const result = await pool.query(
      `INSERT INTO hackathons (
        name, description, start_date, end_date, mode, location, 
        max_team_size, min_team_size, tech_focus, website_url
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        name, description, start_date, end_date, mode || 'online', location,
        max_team_size || 4, min_team_size || 2, tech_focus || [], website_url
      ]
    );

    res.status(201).json({ message: 'Hackathon created successfully', hackathon: result.rows[0] });
  } catch (error) {
    console.error('POST /admin/hackathons error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
