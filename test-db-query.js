// Test script to verify the database query fix
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

async function testDBQuery() {
  let connection;
  try {
    console.log('Connecting to remote database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');
    
    // Test 1: Check if ai_connections table exists
    console.log('\n1. Checking if ai_connections table exists...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'ai_connections'"
    );
    
    if (Array.isArray(tables) && tables.length > 0) {
      console.log('✅ ai_connections table exists');
      
      // Test 2: Check the column names in ai_connections table
      console.log('\n2. Checking column names in ai_connections table...');
      const [columns] = await connection.execute(
        'DESCRIBE ai_connections'
      );
      
      console.log('Columns in ai_connections table:');
      columns.forEach((column) => {
        console.log(`- ${column.Field} (${column.Type})`);
      });
      
      // Test 3: Try to get AI connections for user 1
      console.log('\n3. Testing AI connections query...');
      try {
        const [connections] = await connection.execute(
          'SELECT apiKey, apiProvider FROM ai_connections WHERE userId = ? ORDER BY id ASC LIMIT 1',
          [1]
        );
        
        console.log('Query result:', JSON.stringify(connections));
        
        if (Array.isArray(connections) && connections.length > 0) {
          console.log('✅ Query successful, found connections:');
          console.log(connections[0]);
        } else {
          console.log('No connections found for user 1');
        }
      } catch (queryError) {
        console.error('Query error:', queryError.message);
        
        // Try with different column names
        console.log('\n4. Trying with alternative column names...');
        try {
          const [connections] = await connection.execute(
            'SELECT api_key, api_provider FROM ai_connections WHERE user_id = ? ORDER BY id ASC LIMIT 1',
            [1]
          );
          
          console.log('Query result (snake_case):', JSON.stringify(connections));
          
          if (Array.isArray(connections) && connections.length > 0) {
            console.log('✅ Query successful with snake_case, found connections:');
            console.log(connections[0]);
          } else {
            console.log('No connections found for user 1');
          }
        } catch (altQueryError) {
          console.error('Alternative query error:', altQueryError.message);
        }
      }
      
    } else {
      console.error('❌ ai_connections table does not exist');
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

testDBQuery();