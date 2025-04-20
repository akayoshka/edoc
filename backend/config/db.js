const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'edoc_user',
  password: 'edoc_password',
  database: 'edoc_db'
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};