const pool = require('../config/db');

const requireAdmin = async (req, res, next) => {
  try {
    // req.user is set by authenticateToken middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.user;

    const userResult = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    if (!user.is_admin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
  } catch (error) {
    console.error('requireAdmin error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { requireAdmin };
