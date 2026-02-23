// Test script to verify the fixed SQL query
const mysql = require('mysql2/promise');

// Database configuration (remote)
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

async function testFixedQuery() {
  let connection;
  try {
    console.log('Connecting to remote database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');
    
    // Test the fixed query
    console.log('\nTesting fixed AI connections query...');
    const [connections] = await connection.execute(
      'SELECT apiKey, apiProvider FROM ai_connections WHERE user_id = ? ORDER BY id ASC LIMIT 1',
      [1]
    );
    
    console.log('Query result:', JSON.stringify(connections));
    
    if (Array.isArray(connections) && connections.length > 0) {
      console.log('✅ Query successful, found connections:');
      console.log('API Key:', connections[0].apiKey ? 'Found' : 'Missing');
      console.log('API Provider:', connections[0].apiProvider);
      
      // Test the exact logic from our getUserAPIInfo function
      console.log('\nTesting extraction logic...');
      const connectionObj = connections[0];
      const apiKey = connectionObj.apiKey;
      const apiProvider = connectionObj.apiProvider;
      
      console.log('Extracted API Key:', apiKey ? 'Found' : 'Missing');
      console.log('Extracted API Provider:', apiProvider);
      
      if (apiKey) {
        console.log('✅ Extraction successful!');
      } else {
        console.error('❌ Extraction failed: API key missing');
      }
    } else {
      console.log('No connections found for user 1');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

testFixedQuery();