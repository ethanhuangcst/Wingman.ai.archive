const mysql = require('mysql2/promise');

async function checkDatabaseSchema(host, port, user, password, database) {
  try {
    const pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const connection = await pool.getConnection();
    console.log(`Connected to ${host}:${port}/${database}`);

    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log('\n=== Tables ===');
    console.log('Tables:', tableNames);

    // Check schema for each table
    for (const table of tableNames) {
      console.log(`\n=== Schema for ${table} ===`);
      const [columns] = await connection.execute(`DESCRIBE ${table}`);
      console.log('Columns:');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? '(NULL)' : ''} ${col.Key ? `[${col.Key}]` : ''}`);
      });
    }

    connection.release();
    await pool.end();
  } catch (error) {
    console.error(`Error connecting to ${host}:${port}/${database}:`, error.message);
  }
}

async function main() {
  console.log('========================================');
  console.log('Checking Local Database Schema (127.0.0.1:3306)');
  console.log('========================================');
  await checkDatabaseSchema('127.0.0.1', 3306, 'root', 'password', 'wingman_db');

  console.log('\n========================================');
  console.log('Checking Alibaba Cloud Database Schema');
  console.log('========================================');
  await checkDatabaseSchema('101.132.156.250', 33320, 'wingman_db_usr_8a2Xy', 'Z8#kP2@vQ7$mE5!tR3&wX9*yB4', 'wingman_db');
}

main().catch(console.error);
