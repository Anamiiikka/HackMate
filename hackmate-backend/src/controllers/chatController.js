const pool = require('../config/db');

// ── GET /conversations ────────────────────────────────
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
         c.id,
         c.type,
         c.team_id,
         c.created_at,
         -- last message (subquery for precision)
         (SELECT json_build_object(
            'id',         m.id,
            'content',    m.content,
            'sender_id',  m.sender_id,
            'created_at', m.created_at
          )
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
         ) AS last_message,
         -- participants (excluding self)
         (SELECT COALESCE(json_agg(
            json_build_object(
              'id',         u.id,
              'name',       u.name,
              'avatar_url', u.avatar_url
            )
          ), '[]')
          FROM conversation_participants cp_inner
          JOIN users u ON u.id = cp_inner.user_id
          WHERE cp_inner.conversation_id = c.id
            AND u.id != $1
         ) AS participants,
         -- unread count (subquery to avoid join fan-out)
         (SELECT COUNT(*)::int
          FROM messages
          WHERE conversation_id = c.id
            AND sender_id != $1
            AND read_at IS NULL
         ) AS unread_count
       FROM conversations c
       JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = $1
       ORDER BY
         (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) DESC NULLS LAST,
         c.created_at DESC`,
      [userId]
    );

    return res.status(200).json({ conversations: result.rows });

  } catch (err) {
    console.error('getConversations error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── GET /conversations/:id/messages ───────────────────
const getMessages = async (req, res) => {
  try {
    const userId         = req.user.id;
    const conversationId = req.params.id;
    const limit          = Math.min(parseInt(req.query.limit) || 50, 100);
    const before         = req.query.before; // ISO timestamp cursor

    // verify user is a participant
    const access = await pool.query(
      `SELECT 1 FROM conversation_participants
       WHERE conversation_id = $1 AND user_id = $2`,
      [conversationId, userId]
    );
    if (access.rows.length === 0)
      return res.status(403).json({ error: 'Not a participant in this conversation' });

    let query = `
      SELECT
        m.id, m.content, m.created_at, m.read_at,
        json_build_object(
          'id',         u.id,
          'name',       u.name,
          'avatar_url', u.avatar_url
        ) AS sender
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = $1`;

    const params = [conversationId];

    if (before) {
      params.push(before);
      query += ` AND m.created_at < $${params.length}`;
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);

    // mark fetched messages as read
    await pool.query(
      `UPDATE messages SET read_at = NOW()
       WHERE conversation_id = $1
         AND sender_id != $2
         AND read_at IS NULL`,
      [conversationId, userId]
    );

    return res.status(200).json({
      messages: result.rows.reverse() // oldest first
    });

  } catch (err) {
    console.error('getMessages error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── POST /conversations — create direct conversation ──
const createConversation = async (req, res) => {
  const userId              = req.user.id;
  const { participant_id }  = req.body;

  if (userId === participant_id)
    return res.status(400).json({ error: 'Cannot create conversation with yourself' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // check if direct conversation already exists between these two
    const existing = await client.query(
      `SELECT c.id FROM conversations c
       JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = $1
       JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = $2
       WHERE c.type = 'direct'`,
      [userId, participant_id]
    );

    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(200).json({
        message: 'Conversation already exists',
        conversation_id: existing.rows[0].id
      });
    }

    // create conversation
    const convResult = await client.query(
      `INSERT INTO conversations (type) VALUES ('direct') RETURNING id`
    );
    const conversationId = convResult.rows[0].id;

    // add both participants
    await client.query(
      `INSERT INTO conversation_participants (conversation_id, user_id)
       VALUES ($1, $2), ($1, $3)`,
      [conversationId, userId, participant_id]
    );

    await client.query('COMMIT');
    return res.status(201).json({
      message: 'Conversation created',
      conversation_id: conversationId
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createConversation error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

module.exports = { getConversations, getMessages, createConversation };
