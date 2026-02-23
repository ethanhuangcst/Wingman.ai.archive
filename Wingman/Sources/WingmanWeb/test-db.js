// Simple test script to check database connection
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Create connection
    const connection = await mysql.createConnection({
      host: '101.132.156.250',
      port: 33320,
      user: 'wingman_db_usr_8a2Xy',
      password: 'Z8#kP2@vQ7$mE5!tR3&wX9*yB4',
      database: 'wingman_db'
    });
    
    console.log('Connection successful!');
    
    // Check tables
    console.log('\nChecking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables found:', tables.length);
    tables.forEach((table) => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // Check users
    console.log('\nChecking users...');
    const [users] = await connection.execute('SELECT id, name, email FROM users');
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user.id}`);
    });
    
    // Check AI connections
    console.log('\nChecking AI connections...');
    try {
      const [connections] = await connection.execute('SELECT * FROM ai_connections');
      console.log('AI connections found:', connections.length);
      connections.forEach(conn => {
        console.log(`  - User ID: ${conn.user_id}, Provider: ${conn.apiProvider}, API Key: ${conn.apiKey ? 'Set' : 'Not set'}`);
      });
    } catch (error) {
      console.error('Error checking AI connections:', error.message);
    }
    
    // Close connection
    await connection.end();
    console.log('\nConnection closed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testConnection();