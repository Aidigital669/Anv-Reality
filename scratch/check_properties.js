const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const total = await pool.query('SELECT count(*) FROM "Property"');
    const published = await pool.query('SELECT count(*) FROM "Property" WHERE "publishStatus" = $1', ['Published']);
    const statusBreakdown = await pool.query('SELECT "publishStatus", count(*) FROM "Property" GROUP BY "publishStatus"');
    const typeBreakdown = await pool.query(`
      SELECT COALESCE(pt.name, 'Uncategorized') as type, count(p.id) 
      FROM "Property" p 
      LEFT JOIN "PropertyType" pt ON p."propertyTypeId" = pt.id 
      GROUP BY pt.name
    `);
    const localityBreakdown = await pool.query(`
      SELECT COALESCE(loc.name, 'Unknown') as locality, count(p.id) 
      FROM "Property" p 
      LEFT JOIN "Location" loc ON p."locationId" = loc.id 
      GROUP BY loc.name 
      ORDER BY count(p.id) DESC
    `);
    const sampleProperties = await pool.query(`
      SELECT p.id, p.title, p.price, p."publishStatus", p.configuration, loc.name as locality
      FROM "Property" p
      LEFT JOIN "Location" loc ON p."locationId" = loc.id
      ORDER BY p."createdAt" DESC
      LIMIT 10
    `);

    console.log("=== PROPERTY STATS ===");
    console.log("Total Properties in DB:", total.rows[0].count);
    console.log("Published Properties (visible on website):", published.rows[0].count);
    console.log("\nStatus Breakdown:", statusBreakdown.rows);
    console.log("\nType Breakdown:", typeBreakdown.rows);
    console.log("\nTop Localities:", localityBreakdown.rows);
    console.log("\nSample Properties:", sampleProperties.rows);
  } catch (err) {
    console.error("Error connecting to DB:", err);
  } finally {
    await pool.end();
  }
}

main();
