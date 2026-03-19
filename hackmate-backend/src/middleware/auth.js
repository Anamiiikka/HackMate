const jwt  = require('jsonwebtoken');
const pool = require('../config/db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token)
    return res.status(401).json({ error: 'Access token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // confirm user still exists and is active
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1 AND is_active = TRUE',
      [decoded.userId]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'User not found or deactivated' });

    req.user = result.rows[0]; // attach to request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Access token expired' });
    return res.status(401).json({ error: 'Invalid access token' });
  }
};

module.exports = { authenticateToken };
