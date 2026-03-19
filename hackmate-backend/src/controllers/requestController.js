const pool = require('../config/db');

// ── POST /requests — send a request ──────────────────
const sendRequest = async (req, res) => {
  const fromUserId              = req.user.id;
  const { to_user_id, hackathon_id, message } = req.body;

  // can't send to yourself
  if (fromUserId === to_user_id)
    return res.status(400).json({ error: 'You cannot send a request to yourself' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. verify both users joined this hackathon pool
    const poolCheck = await client.query(
      `SELECT user_id FROM user_hackathon_prefs
       WHERE hackathon_id = $1 AND user_id = ANY($2::uuid[])`,
      [hackathon_id, [fromUserId, to_user_id]]
    );
    if (poolCheck.rows.length < 2)
      return res.status(400).json({ error: 'Both users must have joined this hackathon pool' });

    // 2. check recipient exists and is active
    const userCheck = await client.query(
      'SELECT id FROM users WHERE id = $1 AND is_active = TRUE',
      [to_user_id]
    );
    if (userCheck.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });

    // 3. check no existing pending/accepted request between this pair
    const existing = await client.query(
      `SELECT id, status FROM match_requests
       WHERE hackathon_id = $1
         AND status IN ('pending','accepted')
         AND (
           (from_user_id = $2 AND to_user_id = $3) OR
           (from_user_id = $3 AND to_user_id = $2)
         )`,
      [hackathon_id, fromUserId, to_user_id]
    );
    if (existing.rows.length > 0)
      return res.status(409).json({
        error: `A ${existing.rows[0].status} request already exists between you two`
      });

    // 4. check recipient's team isn't already full
    const teamCheck = await client.query(
      `SELECT t.id, COUNT(tm.user_id) as member_count, h.max_team_size
       FROM teams t
       JOIN team_members tm ON tm.team_id = t.id
       JOIN hackathons h ON h.id = t.hackathon_id
       WHERE t.hackathon_id = $1
         AND t.status != 'disbanded'
         AND tm.user_id = $2
       GROUP BY t.id, h.max_team_size`,
      [hackathon_id, to_user_id]
    );
    if (teamCheck.rows.length > 0) {
      const team = teamCheck.rows[0];
      if (parseInt(team.member_count) >= parseInt(team.max_team_size))
        return res.status(400).json({ error: 'This user\'s team is already full' });
    }

    // 5. insert request
    const result = await client.query(
      `INSERT INTO match_requests
         (from_user_id, to_user_id, hackathon_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [fromUserId, to_user_id, hackathon_id, message || null]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Request sent successfully',
      request: result.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') // unique constraint (from, to, hackathon)
      return res.status(409).json({ error: 'Request already exists' });
    console.error('sendRequest error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// ── GET /requests/incoming ────────────────────────────
const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
         mr.*,
         json_build_object(
           'id',               u.id,
           'name',             u.name,
           'bio',              u.bio,
           'experience_level', u.experience_level,
           'avatar_url',       u.avatar_url,
           'github_url',       u.github_url
         ) AS from_user,
         json_build_object(
           'id',         h.id,
           'name',       h.name,
           'start_date', h.start_date,
           'end_date',   h.end_date,
           'mode',       h.mode
         ) AS hackathon
       FROM match_requests mr
       JOIN users     u ON u.id = mr.from_user_id
       JOIN hackathons h ON h.id = mr.hackathon_id
       WHERE mr.to_user_id = $1
       ORDER BY
         CASE mr.status WHEN 'pending' THEN 0 ELSE 1 END,
         mr.created_at DESC`,
      [userId]
    );

    return res.status(200).json({ requests: result.rows });

  } catch (err) {
    console.error('getIncomingRequests error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── GET /requests/outgoing ────────────────────────────
const getOutgoingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
         mr.*,
         json_build_object(
           'id',               u.id,
           'name',             u.name,
           'bio',              u.bio,
           'experience_level', u.experience_level,
           'avatar_url',       u.avatar_url
         ) AS to_user,
         json_build_object(
           'id',   h.id,
           'name', h.name,
           'mode', h.mode
         ) AS hackathon
       FROM match_requests mr
       JOIN users      u ON u.id = mr.to_user_id
       JOIN hackathons h ON h.id = mr.hackathon_id
       WHERE mr.from_user_id = $1
       ORDER BY mr.created_at DESC`,
      [userId]
    );

    return res.status(200).json({ requests: result.rows });

  } catch (err) {
    console.error('getOutgoingRequests error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── PATCH /requests/:id — accept or reject ────────────
const respondToRequest = async (req, res) => {
  const userId    = req.user.id;
  const requestId = req.params.id;
  const { status } = req.body; // 'accepted' or 'rejected'

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. fetch request — must be directed to this user and pending
    const reqResult = await client.query(
      `SELECT * FROM match_requests
       WHERE id = $1 AND to_user_id = $2 AND status = 'pending'`,
      [requestId, userId]
    );
    if (reqResult.rows.length === 0)
      return res.status(404).json({ error: 'Request not found or already responded to' });

    const matchReq = reqResult.rows[0];

    // 2. update request status
    await client.query(
      `UPDATE match_requests
       SET status = $1, updated_at = NOW()
       WHERE id = $2`,
      [status, requestId]
    );

    // 3. if accepted → create team or add to existing team
    if (status === 'accepted') {
      // check if accepting user already has a team for this hackathon
      const myTeam = await client.query(
        `SELECT t.id, COUNT(tm.user_id) as member_count, h.max_team_size
         FROM teams t
         JOIN team_members tm ON tm.team_id = t.id
         JOIN hackathons h ON h.id = t.hackathon_id
         WHERE t.hackathon_id = $1
           AND t.status = 'forming'
           AND tm.user_id = $2
         GROUP BY t.id, h.max_team_size`,
        [matchReq.hackathon_id, userId]
      );

      let teamId;

      if (myTeam.rows.length > 0) {
        // add sender to existing team
        teamId = myTeam.rows[0].id;
        const memberCount = parseInt(myTeam.rows[0].member_count);
        const maxSize     = parseInt(myTeam.rows[0].max_team_size);

        if (memberCount >= maxSize) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Your team is already full' });
        }

        // check sender isn't already in team
        const alreadyIn = await client.query(
          'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
          [teamId, matchReq.from_user_id]
        );
        if (alreadyIn.rows.length === 0) {
          await client.query(
            'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)',
            [teamId, matchReq.from_user_id]
          );
        }
      } else {
        // create new team
        const teamResult = await client.query(
          `INSERT INTO teams (hackathon_id, created_by)
           VALUES ($1, $2)
           RETURNING id`,
          [matchReq.hackathon_id, userId]
        );
        teamId = teamResult.rows[0].id;

        // add both users to team
        await client.query(
          `INSERT INTO team_members (team_id, user_id)
           VALUES ($1, $2), ($1, $3)`,
          [teamId, userId, matchReq.from_user_id]
        );
      }

      // link team to request
      await client.query(
        'UPDATE match_requests SET team_id = $1 WHERE id = $2',
        [teamId, requestId]
      );

      // update team status if full
      const finalCount = await client.query(
        `SELECT COUNT(*) as cnt, h.max_team_size
         FROM team_members tm
         JOIN teams t ON t.id = tm.team_id
         JOIN hackathons h ON h.id = t.hackathon_id
         WHERE tm.team_id = $1
         GROUP BY h.max_team_size`,
        [teamId]
      );
      if (finalCount.rows.length > 0) {
        const { cnt, max_team_size } = finalCount.rows[0];
        if (parseInt(cnt) >= parseInt(max_team_size)) {
          await client.query(
            "UPDATE teams SET status = 'full' WHERE id = $1",
            [teamId]
          );
        }
      }

      await client.query('COMMIT');
      return res.status(200).json({
        message: 'Request accepted — team formed!',
        team_id: teamId
      });
    }

    await client.query('COMMIT');
    return res.status(200).json({ message: 'Request rejected' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('respondToRequest error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// ── DELETE /requests/:id — cancel own request ─────────
const cancelRequest = async (req, res) => {
  try {
    const userId    = req.user.id;
    const requestId = req.params.id;

    const result = await pool.query(
      `DELETE FROM match_requests
       WHERE id = $1 AND from_user_id = $2 AND status = 'pending'
       RETURNING id`,
      [requestId, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Request not found or cannot be cancelled' });

    return res.status(200).json({ message: 'Request cancelled' });

  } catch (err) {
    console.error('cancelRequest error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  sendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  respondToRequest,
  cancelRequest
};
