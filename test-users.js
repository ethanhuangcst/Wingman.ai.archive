// Test script to check what users exist in the database
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

async function testUsers() {
  let connection;
  try {
    console.log('Connecting to remote database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');
    
    // Check what users exist
    console.log('\nChecking users...');
    const [users] = await connection.execute(
      'SELECT id, email, username FROM users'
    );
    
    console.log('Users found:', JSON.stringify(users));
    
    if (Array.isArray(users) && users.length > 0) {
      console.log('\nTesting AI connections for each user...');
      
      for (const user of users) {
        console.log(`\nUser: ${user.email} (ID: ${user.id})`);
        
        const [connections] = await connection.execute(
          'SELECT apiKey, apiProvider FROM ai_connections WHERE user_id = ?',
          [user.id]
        );
        
        console.log('AI connections:', JSON.stringify(connections));
        
        if (Array.isArray(connections) && connections.length > 0) {
          console.log(`Found ${connections.length} connections for this user`);
        } else {
          console.log('No AI connections found for this user');
        }
      }
    } else {
      console.log('No users found');
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

testUsers();