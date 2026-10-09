import pg from 'pg';

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const propRes = await pool.query('DELETE FROM "Property"');
    console.log(`Deleted ${propRes.rowCount} properties.`);

    const enqRes = await pool.query('DELETE FROM "WebsiteEnquiry"');
    console.log(`Deleted ${enqRes.rowCount} website enquiries.`);

    try {
      const leadRes = await pool.query('DELETE FROM crm_leads');
      console.log(`Deleted ${leadRes.rowCount} CRM leads.`);
    } catch (e: any) {
      console.log("Note: crm_leads table might not exist or couldn't be deleted:", e.message);
    }

    const projRes = await pool.query('DELETE FROM "Project"');
    console.log(`Deleted ${projRes.rowCount} projects.`);

    console.log("Successfully cleared all dummy data from the database.");
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
