require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const res = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'WebsiteEnquiry';");
    console.log('WebsiteEnquiry columns:', res.rows.map(r => r.column_name).join(', '));
  } catch (err) {
    console.error('DB error:', err);
  } finally {
    await pool.end();
  }
})();
