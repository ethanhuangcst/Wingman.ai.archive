const mysql = require('mysql2/promise');

async function checkDatabase(host, port, user, password, database) {
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
    console.log('\n=== Tables ===');
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log('Tables:', tableNames);

    // Check data counts for each table
    console.log('\n=== Data Counts ===');
    for (const table of tableNames) {
      const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      const count = countResult[0].count;
      console.log(`${table}: ${count} rows`);

      // For users table, show some data
      if (table === 'users') {
        console.log('\n=== Users Data ===');
        const [users] = await connection.execute('SELECT id, name, email, createdAt FROM users LIMIT 5');
        console.table(users);
      }

      // For ai_providers table, show data
      if (table === 'ai_providers') {
        console.log('\n=== AI Providers ===');
        const [providers] = await connection.execute('SELECT * FROM ai_providers');
        console.table(providers);
      }

      // For ai_connections table, show data
      if (table === 'ai_connections') {
        console.log('\n=== AI Connections ===');
        const [connections] = await connection.execute('SELECT id, user_id, apiProvider FROM ai_connections LIMIT 5');
        console.table(connections);
      }
    }

    connection.release();
    await pool.end();
    return { success: true, tables: tableNames };
  } catch (error) {
    console.error(`Error connecting to ${host}:${port}/${database}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('========================================');
  console.log('Checking Local Database (127.0.0.1:3306)');
  console.log('========================================');
  const localResult = await checkDatabase('127.0.0.1', 3306, 'root', 'password', 'wingman_db');

  console.log('\n========================================');
  console.log('Checking Alibaba Cloud Database');
  console.log('========================================');
  const cloudResult = await checkDatabase('101.132.156.250', 33320, 'wingman_db_usr_8a2Xy', 'Z8#kP2@vQ7$mE5!tR3&wX9*yB4', 'wingman_db');

  console.log('\n========================================');
  console.log('Comparison Result');
  console.log('========================================');
  if (localResult.success && cloudResult.success) {
    // Compare tables
    const localTables = localResult.tables;
    const cloudTables = cloudResult.tables;

    console.log('\n=== Table Comparison ===');
    console.log('Local tables:', localTables);
    console.log('Cloud tables:', cloudTables);

    // Check for missing tables
    const missingInCloud = localTables.filter(table => !cloudTables.includes(table));
    if (missingInCloud.length > 0) {
      console.log('\n❌ Tables missing in cloud:', missingInCloud);
    } else {
      console.log('\n✅ All tables present in both databases');
    }

    console.log('\n=== Data Comparison Summary ===');
    console.log('(Detailed data counts shown above)');
  } else {
    console.log('\n❌ Failed to check one or both databases');
  }
}

main().catch(console.error);
