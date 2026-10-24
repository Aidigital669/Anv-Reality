const { pool } = require('../src/lib/db');
(async () => {
  try {
    const svCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'crm_site_visits';");
    console.log('crm_site_visits cols:', svCols.rows);
    const leadsCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'crm_leads';");
    console.log('crm_leads count cols:', leadsCols.rows.length);
    const webEnqCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'WebsiteEnquiry';");
    console.log('WebsiteEnquiry count cols:', webEnqCols.rows.length);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
})();
