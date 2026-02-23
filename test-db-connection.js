// Simple test script to verify database connection and API key extraction
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: '101.132.156.250',
  port: 33320,
  user: 'wingman_db_usr_8a2Xy',
  password: 'Z8#kP2@vQ7$mE5!tR3&wX9*yB4',
  database: 'wingman_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function testDatabaseConnection() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');
    
    // Test query to get AI connections for user 1
    console.log('\nTesting AI connections query...');
    const [rows] = await connection.execute(
      'SELECT api_key, api_provider FROM ai_connections WHERE user_id = ? ORDER BY id ASC LIMIT 1',
      [1]
    );
    
    console.log('Query result:', JSON.stringify(rows));
    
    if (Array.isArray(rows) && rows.length > 0) {
      console.log('\nProcessing result...');
      const connectionObj = rows[0];
      console.log('First connection object:', connectionObj);
      
      // Extract API key and provider
      const apiKey = connectionObj.api_key || connectionObj.apiKey;
      const apiProvider = connectionObj.api_provider || connectionObj.apiProvider;
      
      console.log('Extracted API Key:', apiKey ? 'Found' : 'Missing');
      console.log('Extracted API Provider:', apiProvider);
      
      if (apiKey) {
        console.log('✅ Test passed: API key extracted successfully');
      } else {
        console.log('❌ Test failed: API key missing');
      }
    } else {
      console.log('No AI connections found for user 1');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

testDatabaseConnection();