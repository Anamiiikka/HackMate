const pool = require('./src/config/db');
pool.query("SELECT * FROM notifications LIMIT 1")
  .then(res => {
    if (res.rows.length > 0) {
      console.log('Notification found:', res.rows[0]);
    } else {
      console.log('No notifications found, checking columns...');
      pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications'")
        .then(cols => console.log('Columns:', cols.rows.map(c => c.column_name)))
        .catch(e => console.error(e));
    }
  })
  .catch(err => console.error('DB ERROR:', err.message))
  .finally(() => process.exit());
