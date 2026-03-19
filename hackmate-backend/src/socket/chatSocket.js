const jwt  = require('jsonwebtoken');
const pool = require('../config/db');

const setupSocket = (io) => {

  // ── Auth middleware for every socket connection ──────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token ||
                    socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const result = await pool.query(
        'SELECT id, name FROM users WHERE id = $1 AND is_active = TRUE',
        [decoded.userId]
      );
      if (result.rows.length === 0) return next(new Error('User not found'));

      socket.user = result.rows[0]; // attach user to socket
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 ${socket.user.name} connected (${socket.id})`);

    // ── join_conversation ────────────────────────────
    socket.on('join_conversation', async ({ conversation_id }) => {
      try {
        // verify user is participant
        const access = await pool.query(
          `SELECT 1 FROM conversation_participants
           WHERE conversation_id = $1 AND user_id = $2`,
          [conversation_id, socket.user.id]
        );
        if (access.rows.length === 0) {
          socket.emit('error', { message: 'Not a participant in this conversation' });
          return;
        }

        socket.join(conversation_id);
        socket.emit('joined_conversation', { conversation_id });
        console.log(`💬 ${socket.user.name} joined conversation ${conversation_id}`);
      } catch (err) {
        socket.emit('error', { message: 'Could not join conversation' });
      }
    });

    // ── send_message ──────────────────────────────────
    socket.on('send_message', async ({ conversation_id, content }) => {
      if (!content?.trim()) {
        socket.emit('error', { message: 'Message content required' });
        return;
      }

      if (content.length > 2000) {
        socket.emit('error', { message: 'Message too long (max 2000 chars)' });
        return;
      }

      try {
        // verify participant
        const access = await pool.query(
          `SELECT 1 FROM conversation_participants
           WHERE conversation_id = $1 AND user_id = $2`,
          [conversation_id, socket.user.id]
        );
        if (access.rows.length === 0) {
          socket.emit('error', { message: 'Not a participant' });
          return;
        }

        // persist message to DB
        const result = await pool.query(
          `INSERT INTO messages (conversation_id, sender_id, content)
           VALUES ($1, $2, $3)
           RETURNING id, conversation_id, sender_id, content, created_at`,
          [conversation_id, socket.user.id, content.trim()]
        );

        const message = {
          ...result.rows[0],
          sender: { id: socket.user.id, name: socket.user.name }
        };

        // broadcast to everyone in the room (including sender)
        io.to(conversation_id).emit('new_message', message);

      } catch (err) {
        console.error('send_message error:', err.message);
        socket.emit('error', { message: 'Could not send message' });
      }
    });

    // ── typing indicators ─────────────────────────────
    socket.on('typing_start', ({ conversation_id }) => {
      socket.to(conversation_id).emit('user_typing', {
        user_id: socket.user.id,
        name:    socket.user.name
      });
    });

    socket.on('typing_stop', ({ conversation_id }) => {
      socket.to(conversation_id).emit('user_stopped_typing', {
        user_id: socket.user.id
      });
    });

    // ── mark messages as read ─────────────────────────
    socket.on('mark_read', async ({ conversation_id }) => {
      try {
        await pool.query(
          `UPDATE messages SET read_at = NOW()
           WHERE conversation_id = $1
             AND sender_id != $2
             AND read_at IS NULL`,
          [conversation_id, socket.user.id]
        );
        // notify others their messages were read
        socket.to(conversation_id).emit('messages_read', {
          conversation_id,
          read_by: socket.user.id
        });
      } catch (err) {
        console.error('mark_read error:', err.message);
      }
    });

    // ── disconnect ────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 ${socket.user.name} disconnected`);
    });
  });
};

module.exports = setupSocket;
