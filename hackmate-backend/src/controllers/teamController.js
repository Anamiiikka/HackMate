const pool = require('../config/db');

const createTeam = async (req, res) => {
  const { id: userId } = req.user;
  const { name, hackathon_id } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user is already in a team for this hackathon
    const existingTeam = await client.query(
      `SELECT t.id FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE t.hackathon_id = $1 AND tm.user_id = $2`,
      [hackathon_id, userId]
    );

    if (existingTeam.rows.length > 0) {
      return res.status(409).json({ error: 'You are already in a team for this hackathon.' });
    }

    // Create the new team
    const teamResult = await client.query(
      `INSERT INTO teams (name, hackathon_id, created_by) VALUES ($1, $2, $3) RETURNING *`,
      [name, hackathon_id, userId]
    );
    const newTeam = teamResult.rows[0];

    // Add the creator as the first member
    await client.query(
      `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'leader')`,
      [newTeam.id, userId]
    );

    await client.query('COMMIT');

    res.status(201).json({ message: 'Team created successfully', team: newTeam });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const getTeamById = async (req, res) => {
  const { id } = req.params;

  try {
    const teamResult = await pool.query('SELECT * FROM teams WHERE id = $1', [id]);
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    const team = teamResult.rows[0];

    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.avatar_url, tm.role
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1`,
      [id]
    );
    team.members = membersResult.rows;

    res.status(200).json({ team });
  } catch (error) {
    console.error('Error getting team by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyTeams = async (req, res) => {
  const { id: userId } = req.user;

  try {
    const result = await pool.query(
      `SELECT t.* FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1`,
      [userId]
    );
    res.status(200).json({ teams: result.rows });
  } catch (error) {
    console.error('Error getting my teams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createTeam,
  getTeamById,
  getMyTeams,
};
