const pool = require('./src/config/db');
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications'")
  .then(r => console.log('Columns:', r.rows))
  .catch(e => console.error(e))
  .finally(() => process.exit());
