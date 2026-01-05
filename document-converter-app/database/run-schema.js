// run-schema.js - Execute SQL schema on Azure SQL Database
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  server: 'docupro.database.windows.net',
  database: 'DocumentConverter',
  user: 'docupro',
  password: '4765Zororo@',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 60000,
  },
};

async function runSchema() {
  let pool;
  try {
    console.log('Connecting to Azure SQL Database...');
    pool = await sql.connect(config);
    console.log('Connected successfully!\n');

    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Split by GO statements for batch execution
    const batches = schemaSQL.split(/\nGO\n/i).filter(batch => batch.trim());

    console.log(`Found ${batches.length} SQL batches to execute...\n`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (!batch) continue;

      // Show first 100 chars of each batch
      const preview = batch.substring(0, 100).replace(/\n/g, ' ');
      console.log(`[${i + 1}/${batches.length}] Executing: ${preview}...`);

      try {
        await pool.request().query(batch);
        console.log(`    ✓ Success\n`);
      } catch (err) {
        console.log(`    ✗ Error: ${err.message}\n`);
        // Continue with other batches
      }
    }

    console.log('\n============================================');
    console.log('Schema execution completed!');
    console.log('============================================\n');

    // Verify tables were created
    console.log('Verifying created tables...');
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);

    console.log('\nTables in database:');
    tablesResult.recordset.forEach(row => {
      console.log(`  - ${row.TABLE_NAME}`);
    });

    // Check admin user
    console.log('\nVerifying admin user...');
    const adminResult = await pool.request().query(`
      SELECT admin_id, email, name, role FROM admin_users WHERE email = 'accounts@drop-it.tech'
    `);

    if (adminResult.recordset.length > 0) {
      const admin = adminResult.recordset[0];
      console.log(`  ✓ Admin user created: ${admin.email} (${admin.role})`);
    } else {
      console.log('  ✗ Admin user not found');
    }

    // Check subscription plans
    console.log('\nVerifying subscription plans...');
    const plansResult = await pool.request().query(`
      SELECT name, slug, plan_type, price_monthly FROM subscription_plans ORDER BY sort_order
    `);

    console.log('Plans created:');
    plansResult.recordset.forEach(plan => {
      console.log(`  - ${plan.name} (${plan.plan_type}) - R${plan.price_monthly}/month`);
    });

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\nDatabase connection closed.');
    }
  }
}

runSchema();
