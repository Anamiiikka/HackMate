const jwt  = require('jsonwebtoken');
const pool = require('../config/db');
const redis = require('../config/redis');

const userRoom = (userId) => `user:${userId}`;

const setupSocket = (io) => {

  // ── Auth middleware for every socket connection ──────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token ||
                    socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const result = await pool.query(
        'SELECT id, name, avatar_url FROM users WHERE id = $1 AND is_active = TRUE',
        [decoded.userId]
      );
      if (result.rows.length === 0) return next(new Error('User not found'));

      socket.user = result.rows[0];
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 ${socket.user.name} connected (${socket.id})`);

    // Personal room used to push conversation-list updates even when the
    // user isn't currently "inside" the conversation.
    socket.join(userRoom(socket.user.id));

    // ── join_conversation ────────────────────────────
    socket.on('join_conversation', async ({ conversation_id }, ack) => {
      try {
        const access = await pool.query(
          `SELECT 1 FROM conversation_participants
           WHERE conversation_id = $1 AND user_id = $2`,
          [conversation_id, socket.user.id]
        );
        if (access.rows.length === 0) {
          socket.emit('error', { message: 'Not a participant in this conversation' });
          if (typeof ack === 'function') ack({ ok: false });
          return;
        }

        socket.join(conversation_id);
        socket.emit('joined_conversation', { conversation_id });
        if (typeof ack === 'function') ack({ ok: true });
      } catch {
        socket.emit('error', { message: 'Could not join conversation' });
        if (typeof ack === 'function') ack({ ok: false });
      }
    });

    // ── leave_conversation ────────────────────────────
    socket.on('leave_conversation', ({ conversation_id }) => {
      if (conversation_id) socket.leave(conversation_id);
    });

    // ── send_message ──────────────────────────────────
    socket.on('send_message', async ({ conversation_id, content, client_id }, ack) => {
      const respond = (payload) => { if (typeof ack === 'function') ack(payload); };

      if (!content?.trim()) {
        socket.emit('error', { message: 'Message content required' });
        return respond({ ok: false, error: 'empty' });
      }

      if (content.length > 2000) {
        socket.emit('error', { message: 'Message too long (max 2000 chars)' });
        return respond({ ok: false, error: 'too_long' });
      }

      // Redis-backed per-user message rate limit (60 msg/min)
      const msgKey   = `ratelimit:message:${socket.user.id}`;
      const msgCount = await redis.incr(msgKey);
      if (msgCount === 1) await redis.expire(msgKey, 60);
      if (msgCount > 60) {
        socket.emit('error', { message: 'Slow down! Max 60 messages per minute.' });
        return respond({ ok: false, error: 'rate_limited' });
      }

      try {
        const access = await pool.query(
          `SELECT user_id FROM conversation_participants WHERE conversation_id = $1`,
          [conversation_id]
        );
        const participantIds = access.rows.map((r) => r.user_id);
        if (!participantIds.includes(socket.user.id)) {
          socket.emit('error', { message: 'Not a participant' });
          return respond({ ok: false, error: 'forbidden' });
        }

        const result = await pool.query(
          `INSERT INTO messages (conversation_id, sender_id, content)
           VALUES ($1, $2, $3)
           RETURNING id, conversation_id, sender_id, content, created_at, read_at`,
          [conversation_id, socket.user.id, content.trim()]
        );

        const row = result.rows[0];
        const message = {
          id:              row.id,
          conversation_id: row.conversation_id,
          content:         row.content,
          created_at:      row.created_at,
          read_at:         row.read_at,
          client_id:       client_id || null,
          sender: {
            id:         socket.user.id,
            name:       socket.user.name,
            avatar_url: socket.user.avatar_url || null,
          },
        };

        // Broadcast to anyone currently viewing the conversation.
        io.to(conversation_id).emit('new_message', message);

        // Push a lightweight "last message" update to every participant's
        // personal room so the conversation list can re-sort / bump unread.
        for (const pid of participantIds) {
          io.to(userRoom(pid)).emit('conversation_updated', {
            conversation_id,
            last_message: message,
            // The sender's own unread for this convo stays 0, everyone else +1.
            increment_unread: pid !== socket.user.id,
          });
        }

        respond({ ok: true, message });
      } catch (err) {
        console.error('send_message error:', err.message);
        socket.emit('error', { message: 'Could not send message' });
        respond({ ok: false, error: 'server' });
      }
    });

    // ── typing indicators ─────────────────────────────
    socket.on('typing_start', ({ conversation_id }) => {
      if (!conversation_id) return;
      socket.to(conversation_id).emit('user_typing', {
        conversation_id,
        user_id: socket.user.id,
        name:    socket.user.name,
      });
    });

    socket.on('typing_stop', ({ conversation_id }) => {
      if (!conversation_id) return;
      socket.to(conversation_id).emit('user_stopped_typing', {
        conversation_id,
        user_id: socket.user.id,
      });
    });

    // ── mark messages as read ─────────────────────────
    socket.on('mark_read', async ({ conversation_id }) => {
      try {
        const result = await pool.query(
          `UPDATE messages SET read_at = NOW()
           WHERE conversation_id = $1
             AND sender_id != $2
             AND read_at IS NULL
           RETURNING id`,
          [conversation_id, socket.user.id]
        );

        const readIds = result.rows.map((r) => r.id);

        // Tell others their messages were seen
        socket.to(conversation_id).emit('messages_read', {
          conversation_id,
          read_by: socket.user.id,
          message_ids: readIds,
          read_at: new Date().toISOString(),
        });

        // Zero-out unread for the reader in their conversation list
        io.to(userRoom(socket.user.id)).emit('conversation_read', {
          conversation_id,
        });
      } catch (err) {
        console.error('mark_read error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 ${socket.user.name} disconnected`);
    });
  });
};

module.exports = setupSocket;
