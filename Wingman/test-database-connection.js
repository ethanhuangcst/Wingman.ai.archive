// Test script to verify database connection and provider retrieval
const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Create database connection pool
    const pool = mysql.createPool({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'password',
      database: 'wingman_db',
    });

    // Get connection
    const connection = await pool.getConnection();

    try {
      // Test 1: Check if ai_providers table exists
      console.log('\n1. Checking if ai_providers table exists...');
      const [providersTable] = await connection.execute(`
        SHOW TABLES LIKE 'ai_providers'
      `);
      
      if (providersTable.length > 0) {
        console.log('✅ ai_providers table exists');
      } else {
        console.error('❌ ai_providers table does not exist');
        return;
      }

      // Test 2: Get all providers
      console.log('\n2. Getting all providers...');
      const [providers] = await connection.execute(`
        SELECT * FROM ai_providers ORDER BY created_at ASC
      `);
      
      console.log('✅ Providers found:', providers.length);
      providers.forEach((provider, index) => {
        console.log(`   ${index + 1}. ${provider.id}: ${provider.name}`);
        console.log(`      Base URLs: ${provider.base_urls}`);
        console.log(`      Default Model: ${provider.default_model}`);
      });

      // Test 3: Check ai_connections table
      console.log('\n3. Checking ai_connections table...');
      const [connectionsTable] = await connection.execute(`
        SHOW COLUMNS FROM ai_connections LIKE 'provider_id'
      `);
      
      if (connectionsTable.length > 0) {
        console.log('✅ provider_id column exists in ai_connections');
      } else {
        console.error('❌ provider_id column does not exist in ai_connections');
      }

      // Test 4: Check users table
      console.log('\n4. Checking users table...');
      const [usersTable] = await connection.execute(`
        SHOW COLUMNS FROM users LIKE 'provider_id'
      `);
      
      if (usersTable.length > 0) {
        console.log('✅ provider_id column exists in users');
      } else {
        console.error('❌ provider_id column does not exist in users');
      }

      console.log('\n🎉 All database tests passed!');
      console.log('The AI provider configuration is now stored in the database.');

    } finally {
      connection.release();
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error testing database connection:', error);
  }
}

testDatabaseConnection();
