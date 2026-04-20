const pool = require('../config/db');
const cache = require('../services/cacheService');

// ── GET /users/me ─────────────────────────────────────
const getMyProfile = async (req, res) => {
  try {
    const { id } = req.user;

    const userResult = await pool.query(
      `SELECT id, name, email, bio, github_url, linkedin_url,
              timezone, location, experience_level, avatar_url, created_at
       FROM users WHERE id = $1`,
      [id]
    );

    // fetch skills separately
    const skillsResult = await pool.query(
      `SELECT s.id, s.name, s.category, us.proficiency, us.years_experience
       FROM user_skills us
       JOIN skills s ON s.id = us.skill_id
       WHERE us.user_id = $1
       ORDER BY us.proficiency DESC`,
      [id]
    );

    const user = userResult.rows[0];
    user.skills = skillsResult.rows;

    return res.status(200).json({ user });

  } catch (err) {
    console.error('getMyProfile error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── PUT /users/me ─────────────────────────────────────
const updateMyProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { bio, github_url, linkedin_url, timezone, location, experience_level, avatar_url } = req.body;

    const result = await pool.query(
      `UPDATE users SET
        bio              = COALESCE($1, bio),
        github_url       = COALESCE($2, github_url),
        linkedin_url     = COALESCE($3, linkedin_url),
        timezone         = COALESCE($4, timezone),
        location         = COALESCE($5, location),
        experience_level = COALESCE($6, experience_level),
        avatar_url       = COALESCE($7, avatar_url),
        updated_at       = NOW()
       WHERE id = $8
       RETURNING id, name, email, bio, github_url, linkedin_url,
                 timezone, location, experience_level, avatar_url`,
      [bio, github_url, linkedin_url, timezone, location, experience_level, avatar_url, id]
    );

    await cache.del(`profile:${id}`);

    return res.status(200).json({
      message: 'Profile updated',
      user: result.rows[0]
    });

  } catch (err) {
    console.error('updateMyProfile error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── PUT /users/me/skills ──────────────────────────────
const updateMySkills = async (req, res) => {
  const { id } = req.user;
  const skills = req.body; // array of { skill_id, proficiency, years_experience }

  if (!Array.isArray(skills) || skills.length === 0)
    return res.status(400).json({ error: 'Skills array required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // delete all existing skills for this user
    await client.query('DELETE FROM user_skills WHERE user_id = $1', [id]);

    // insert new skills
    for (const skill of skills) {
      await client.query(
        `INSERT INTO user_skills (user_id, skill_id, proficiency, years_experience)
         VALUES ($1, $2, $3, $4)`,
        [id, skill.skill_id, skill.proficiency || 1, skill.years_experience || 0]
      );
    }

    await client.query('COMMIT');

    // invalidate all recommendations involving this user
    await cache.delPattern(`recommendations:${id}:*`);
    await cache.del(`profile:${id}`);

    // return updated skills list
    const result = await pool.query(
      `SELECT s.id, s.name, s.category, us.proficiency, us.years_experience
       FROM user_skills us
       JOIN skills s ON s.id = us.skill_id
       WHERE us.user_id = $1
       ORDER BY us.proficiency DESC`,
      [id]
    );

    return res.status(200).json({
      message: 'Skills updated',
      skills: result.rows
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('updateMySkills error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// ── POST /users/me/availability ───────────────────────
const addAvailability = async (req, res) => {
  try {
    const { id } = req.user;
    const { hackathon_id, day_of_week, specific_date, start_time, end_time } = req.body;

    // exactly one of day_of_week or specific_date must be provided
    if (
      (day_of_week === undefined && !specific_date) ||
      (day_of_week !== undefined && specific_date)
    ) {
      return res.status(400).json({
        error: 'Provide either day_of_week (0-6) OR specific_date, not both'
      });
    }

    const result = await pool.query(
      `INSERT INTO availability_slots
         (user_id, hackathon_id, day_of_week, specific_date, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, hackathon_id, day_of_week ?? null, specific_date ?? null, start_time, end_time]
    );

    return res.status(201).json({
      message: 'Availability slot added',
      slot: result.rows[0]
    });

  } catch (err) {
    console.error('addAvailability error:', err.message);
    if (err.code === '23514') // check constraint violation
      return res.status(400).json({ error: 'end_time must be after start_time' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── DELETE /users/me/availability/:id ────────────────
const deleteAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const slotId = parseInt(req.params.id);

    const result = await pool.query(
      `DELETE FROM availability_slots
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [slotId, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Slot not found or not yours' });

    return res.status(200).json({ message: 'Availability slot deleted' });

  } catch (err) {
    console.error('deleteAvailability error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── GET /users/:id (public profile) ──────────────────
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(
      `SELECT id, name, bio, github_url, linkedin_url,
              timezone, location, experience_level, avatar_url
       FROM users
       WHERE id = $1 AND is_active = TRUE`,
      [id]
    );

    if (userResult.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });

    const skillsResult = await pool.query(
      `SELECT s.id, s.name, s.category, us.proficiency
       FROM user_skills us
       JOIN skills s ON s.id = us.skill_id
       WHERE us.user_id = $1
       ORDER BY us.proficiency DESC`,
      [id]
    );

    const user = userResult.rows[0];
    user.skills = skillsResult.rows;

    return res.status(200).json({ user });

  } catch (err) {
    console.error('getUserById error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getPotentialMatches = async (req, res) => {
  try {
    const { id } = req.user;
    const { skills } = req.query; // e.g., "react,node.js"

    // Find users that the current user has already interacted with
    const sentRequests = await pool.query(
      `SELECT to_user_id FROM match_requests WHERE from_user_id = $1`,
      [id]
    );
    const receivedRequests = await pool.query(
      `SELECT from_user_id FROM match_requests WHERE to_user_id = $1`,
      [id]
    );

    const sentIds = sentRequests.rows.map(r => r.to_user_id);
    const receivedIds = receivedRequests.rows.map(r => r.from_user_id);
    const excludedIds = [...new Set([...sentIds, ...receivedIds, id])]; // Exclude self and interacted users

    // Only surface users who share at least one hackathon with the requester.
    // This keeps match-accept from hitting "user has not joined any hackathon pool yet".
    const myHackathons = await pool.query(
      `SELECT hackathon_id FROM user_hackathon_prefs WHERE user_id = $1`,
      [id]
    );
    const myHackathonIds = myHackathons.rows.map(r => r.hackathon_id);

    if (myHackathonIds.length === 0) {
      return res.status(200).json({
        data: [],
        message:
          'Join at least one hackathon to see potential teammates.',
      });
    }

    let usersQuery = `
      SELECT DISTINCT u.id, u.name, u.email, u.bio, u.avatar_url, u.experience_level
      FROM users u
      JOIN user_hackathon_prefs uhp ON uhp.user_id = u.id AND uhp.hackathon_id = ANY($2)
    `;
    const queryParams = [excludedIds, myHackathonIds];
    let paramIndex = 3;

    if (skills) {
      const skillList = skills.split(',').map(s => s.trim().toLowerCase());
      usersQuery += `
        JOIN user_skills us ON u.id = us.user_id
        JOIN skills s ON us.skill_id = s.id
        WHERE u.id != ANY($1)
        AND LOWER(s.name) = ANY($${paramIndex++})
        GROUP BY u.id
        HAVING COUNT(DISTINCT LOWER(s.name)) = $${paramIndex++}
      `;
      queryParams.push(skillList);
      queryParams.push(skillList.length);
    } else {
      usersQuery += ` WHERE u.id != ANY($1)`;
    }

    const usersResult = await pool.query(usersQuery, queryParams);

    // For each user, fetch their skills
    const usersWithSkills = await Promise.all(usersResult.rows.map(async (user) => {
      const skillsResult = await pool.query(
        `SELECT s.name
         FROM user_skills us
         JOIN skills s ON s.id = us.skill_id
         WHERE us.user_id = $1`,
        [user.id]
      );
      return {
        ...user,
        skills: skillsResult.rows.map(s => s.name),
      };
    }));

    return res.status(200).json({ data: usersWithSkills });

  } catch (err) {
    console.error('getPotentialMatches error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  updateMySkills,
  addAvailability,
  deleteAvailability,
  getUserById,
  getPotentialMatches
};
