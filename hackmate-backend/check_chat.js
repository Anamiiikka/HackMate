const pool = require('./src/config/db');

async function check() {
  try {
    // Check if tables exist
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('=== Tables ===');
    console.log(tables.rows.map(r => r.table_name).join('\n'));

    // Check conversations table
    const convos = await pool.query('SELECT COUNT(*) FROM conversations');
    console.log('\n=== conversations count:', convos.rows[0].count);

    // Check messages table
    const msgs = await pool.query('SELECT COUNT(*) FROM messages');
    console.log('=== messages count:', msgs.rows[0].count);

    // Check conversation_participants table
    const parts = await pool.query('SELECT COUNT(*) FROM conversation_participants');
    console.log('=== conversation_participants count:', parts.rows[0].count);

    // Check a specific conversation if it exists
    const specificConvo = await pool.query(
      "SELECT * FROM conversations WHERE id = '94357da1-009e-4095-9c9f-1bf9255e2edd'"
    );
    console.log('\n=== Specific conversation (94357da1...) ===');
    console.log(specificConvo.rows);

    if (specificConvo.rows.length > 0) {
      const participants = await pool.query(
        "SELECT cp.*, u.name FROM conversation_participants cp JOIN users u ON u.id = cp.user_id WHERE cp.conversation_id = '94357da1-009e-4095-9c9f-1bf9255e2edd'"
      );
      console.log('\n=== Participants ===');
      console.log(participants.rows);

      // Try running the exact getMessages query
      const messages = await pool.query(
        `SELECT
          m.id,
          m.conversation_id,
          m.sender_id,
          m.content,
          m.created_at,
          m.read_at,
          json_build_object(
            'id',         u.id,
            'name',       u.name,
            'avatar_url', u.avatar_url
          ) AS sender
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.conversation_id = '94357da1-009e-4095-9c9f-1bf9255e2edd'
        ORDER BY m.created_at DESC LIMIT 50`
      );
      console.log('\n=== Messages in conversation ===');
      console.log('Count:', messages.rows.length);
      if (messages.rows.length > 0) {
        console.log('First message:', JSON.stringify(messages.rows[0], null, 2));
      }
    }

  } catch (err) {
    console.error('ERROR:', err.message);
    console.error('STACK:', err.stack);
  } finally {
    process.exit(0);
  }
}

check();
