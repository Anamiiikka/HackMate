const pool = require('./src/config/db');

async function test() {
  const userId = '123e4567-e89b-12d3-a456-426614174000'; // Arjun's ID from SEED_DATA.md
  try {
    console.log('Testing getNotifications...');
    const res1 = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5 OFFSET 0`,
      [userId]
    );
    console.log('getNotifications success:', res1.rows.length);

    console.log('Testing getUnreadCount...');
    const res2 = await pool.query(
      `SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    console.log('getUnreadCount success:', res2.rows[0].unread_count);
  } catch (err) {
    console.error('❌ TEST FAILED:', err.message);
    console.error('Full Error:', err);
  } finally {
    process.exit();
  }
}

test();
