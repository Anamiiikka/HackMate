const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool   = require('../config/db');

// ── helpers ──────────────────────────────────────────
const generateAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  });

// ── REGISTER ─────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. check duplicate email
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1', [email]
    );
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'Email already registered' });

    // 2. hash password
    const password_hash = await bcrypt.hash(password, 12);

    // 3. insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, is_admin, is_premium, created_at`,
      [name, email, password_hash]
    );
    const user = result.rows[0];

    // 4. generate tokens
    const access_token  = generateAccessToken(user.id);
    const refresh_token = generateRefreshToken(user.id);

    // 5. store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refresh_token, expiresAt]
    );

    return res.status(201).json({
      message: 'Account created successfully',
      user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin || false, is_premium: user.is_premium || false },
      access_token,
      refresh_token
    });

  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── LOGIN ─────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = TRUE',
      [email]
    );
    const user = result.rows[0];
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password' });

    // 2. compare password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' });

    // 3. generate tokens
    const access_token  = generateAccessToken(user.id);
    const refresh_token = generateRefreshToken(user.id);

    // 4. store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refresh_token, expiresAt]
    );

    return res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin, is_premium: user.is_premium },
      access_token,
      refresh_token
    });

  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── REFRESH TOKEN ─────────────────────────────────────
const refresh = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token)
    return res.status(400).json({ error: 'Refresh token required' });

  try {
    // 1. verify JWT signature
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);

    // 2. check token exists in DB and not expired
    const result = await pool.query(
      `SELECT * FROM refresh_tokens
       WHERE token = $1 AND expires_at > NOW()`,
      [refresh_token]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Invalid or expired refresh token' });

    // 3. issue new access token
    const access_token = generateAccessToken(decoded.userId);

    return res.status(200).json({ access_token });

  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

// ── LOGOUT ────────────────────────────────────────────
const logout = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token)
    return res.status(400).json({ error: 'Refresh token required' });

  try {
    await pool.query(
      'DELETE FROM refresh_tokens WHERE token = $1',
      [refresh_token]
    );
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { register, login, refresh, logout };
