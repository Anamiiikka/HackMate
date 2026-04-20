const pool = require('./src/config/db');

async function testApiCall() {
  const userId = '123e4567-e89b-12d3-a456-426614174000'; // Arjun
  const limit = 5;
  const offset = 0;

  try {
    console.log('--- Simulating getNotifications ---');
    // Using EXACT parseInt logic from controller
    const res1 = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );
    console.log('Result 1 success. Rows:', res1.rows.length);

    console.log('--- Simulating getUnreadCount ---');
    const res2 = await pool.query(
      `SELECT COUNT(*) as unread_count FROM notifications
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    console.log('Result 2 success. Count:', res2.rows[0].unread_count);
  } catch (err) {
    console.error('❌ API SIMULATION FAILED');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Stack:', err.stack);
  } finally {
    process.exit();
  }
}

testApiCall();
