const pool  = require('../config/db');
const cache = require('../services/cacheService');

const getHackathons = async (req, res) => {
  try {
    const { mode } = req.query;
    const cacheKey = `hackathons:${mode || 'all'}`;

    const cached = await cache.get(cacheKey);
    if (cached) return res.status(200).json({ ...cached, cached: true });

    let query  = `SELECT id, name, description, start_date, end_date,
                         mode, location, max_team_size, min_team_size,
                         tech_focus, website_url
                  FROM hackathons WHERE is_active = TRUE`;
    const params = [];

    if (mode) { params.push(mode); query += ` AND mode = $1`; }
    query += ' ORDER BY start_date ASC';

    console.log('📝 Executing query:', query, 'with params:', params);
    const result   = await pool.query(query, params);
    console.log('✅ Query successful, rows:', result.rows.length);
    const response = { hackathons: result.rows };

    await cache.set(cacheKey, response, cache.TTL.HACKATHONS);
    return res.status(200).json(response);

  } catch (err) {
    console.error('❌ getHackathons error:', err.message);
    console.error('   Stack:', err.stack);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

const getSkills = async (req, res) => {
  try {
    const { category } = req.query;
    const cacheKey     = `skills:${category || 'all'}`;

    const cached = await cache.get(cacheKey);
    if (cached) return res.status(200).json({ ...cached, cached: true });

    let query  = 'SELECT id, name, category FROM skills';
    const params = [];
    if (category) { params.push(category); query += ' WHERE category = $1'; }
    query += ' ORDER BY category, name';

    const result   = await pool.query(query, params);
    const response = { skills: result.rows };

    await cache.set(cacheKey, response, cache.TTL.SKILLS);
    return res.status(200).json(response);

  } catch (err) {
    console.error('getSkills error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const joinHackathon = async (req, res) => {
  try {
    const userId      = req.user.id;
    const hackathonId = req.params.id;
    const { preferred_role, seriousness_level, looking_for_skills } = req.body;

    const hackResult = await pool.query(
      'SELECT id FROM hackathons WHERE id = $1 AND is_active = TRUE',
      [hackathonId]
    );
    if (hackResult.rows.length === 0)
      return res.status(404).json({ error: 'Hackathon not found' });

    const result = await pool.query(
      `INSERT INTO user_hackathon_prefs
         (user_id, hackathon_id, preferred_role, seriousness_level, looking_for_skills)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, hackathon_id) DO UPDATE SET
         preferred_role     = EXCLUDED.preferred_role,
         seriousness_level  = EXCLUDED.seriousness_level,
         looking_for_skills = EXCLUDED.looking_for_skills
       RETURNING *`,
      [userId, hackathonId, preferred_role || null,
       seriousness_level || 'serious', looking_for_skills || null]
    );

    // invalidate recommendations cache for this user+hackathon
    await cache.delPattern(`recommendations:${userId}:${hackathonId}:*`);

    return res.status(201).json({
      message: 'Joined hackathon pool',
      preference: result.rows[0]
    });

  } catch (err) {
    console.error('joinHackathon error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getHackathons, getSkills, joinHackathon };
