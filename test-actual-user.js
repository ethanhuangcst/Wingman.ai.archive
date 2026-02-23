// Test script to verify the fix for the actual user
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

async function testActualUser() {
  let connection;
  try {
    console.log('Connecting to remote database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');
    
    // Test the fixed query for the actual user ID
    const userId = 4; // me@ethanhuang.com
    console.log(`\nTesting AI connections for user ID ${userId} (me@ethanhuang.com)...`);
    
    const [connections] = await connection.execute(
      'SELECT apiKey, apiProvider FROM ai_connections WHERE user_id = ? ORDER BY id ASC LIMIT 1',
      [userId]
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
        console.log('API Key starts with:', apiKey.substring(0, 10) + '...');
      } else {
        console.error('❌ Extraction failed: API key missing');
      }
    } else {
      console.log('No connections found for user', userId);
    }
    
    // Test with provider selection
    console.log('\nTesting with provider selection...');
    const [qwenConnection] = await connection.execute(
      'SELECT apiKey, apiProvider FROM ai_connections WHERE user_id = ? AND apiProvider = ?',
      [userId, 'qwen-plus']
    );
    
    console.log('Qwen connection result:', JSON.stringify(qwenConnection));
    
    if (Array.isArray(qwenConnection) && qwenConnection.length > 0) {
      console.log('✅ Provider-specific query successful!');
      console.log('Qwen API Key:', qwenConnection[0].apiKey ? 'Found' : 'Missing');
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

testActualUser();