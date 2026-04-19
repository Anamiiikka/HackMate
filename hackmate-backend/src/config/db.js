const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

console.log('🔍 Attempting DB connection to Neon...');

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 30000,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ DB connection failed!');
    console.error('   Reason:', err.message);
    console.error('   Code:  ', err.code);
    process.exit(1);
  }
  release();
  console.log('✅ DB connected → Neon (neondb)');
});

pool.on('error', (err) => {
  console.error('Unexpected DB error:', err.message);
  process.exit(-1);
});

module.exports = pool;
