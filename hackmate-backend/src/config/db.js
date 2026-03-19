const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Attempting DB connection with:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD ? '***set***' : '***MISSING***'
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ DB connection failed!');
    console.error('   Reason:', err.message);
    console.error('   Code:  ', err.code);
    process.exit(1);
  }
  release();
  console.log(`✅ DB connected → ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});

pool.on('error', (err) => {
  console.error('Unexpected DB error:', err.message);
  process.exit(-1);
});

module.exports = pool;
