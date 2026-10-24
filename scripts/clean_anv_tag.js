const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const check = await pool.query(`
    SELECT developer, count(*) as count 
    FROM "Project" 
    WHERE LOWER(developer) LIKE '%anv%' 
       OR LOWER(developer) LIKE '%partner%' 
    GROUP BY developer;
  `);
  console.log('Matching projects in DB:', check.rows);

  const updated = await pool.query(`
    UPDATE "Project"
    SET developer = NULL
    WHERE LOWER(developer) LIKE '%anv%' 
       OR LOWER(developer) LIKE '%partner%';
  `);
  console.log('Updated rows:', updated.rowCount);
}

main()
  .catch(console.error)
  .finally(() => pool.end());
