// Simple test script to verify AI database connectivity
const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  console.log('=== Testing AI Database Connectivity ===\n');

  // Create database connection
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'wingman_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    // Test 1: Check if database connection works
    console.log('1. Testing: Database connection...');
    const connection = await pool.getConnection();
    console.log('✓ Successfully connected to database');
    connection.release();

    // Test 2: Fetch all providers from database
    console.log('\n2. Testing: Fetch all providers from database...');
    const [rows] = await pool.execute(`SELECT * FROM ai_providers ORDER BY created_at ASC`);
    
    const providers = (rows).map(row => ({
      ...row,
      base_urls: typeof row.base_urls === 'string' ? JSON.parse(row.base_urls) : row.base_urls
    }));

    console.log(`✓ Successfully fetched ${providers.length} providers from database`);
    console.log('Providers found:');
    providers.forEach((provider, index) => {
      console.log(`\nProvider ${index + 1}:`);
      console.log(`  ID: ${provider.id}`);
      console.log(`  Name: ${provider.name}`);
      console.log(`  Default Model: ${provider.default_model}`);
      console.log(`  Requires Auth: ${provider.requires_auth}`);
      console.log(`  Auth Header: ${provider.auth_header}`);
      console.log(`  Base URLs: ${JSON.stringify(provider.base_urls)}`);
    });

    // Test 3: Test individual provider retrieval
    console.log('\n3. Testing: Individual provider retrieval...');
    if (providers.length > 0) {
      const firstProvider = providers[0];
      const [providerRows] = await pool.execute(`SELECT * FROM ai_providers WHERE id = ?`, [firstProvider.id]);
      
      if (providerRows.length > 0) {
        const provider = providerRows[0];
        console.log(`✓ Successfully fetched provider by ID: ${provider.id}`);
        console.log(`  Name: ${provider.name}`);
      } else {
        console.log(`✗ Failed to fetch provider by ID: ${firstProvider.id}`);
      }
    } else {
      console.log('⚠ No providers found to test fetch by ID');
    }

    console.log('\n=== All tests completed successfully! ===');

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    console.error('Error message:', error.message);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the tests
testDatabaseConnection();
