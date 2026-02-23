// Script to check AI connections for the user
const mysql = require('mysql2/promise');

async function checkAIConnections() {
  try {
    console.log('Connecting to database...');
    
    // Create database connection pool
    const pool = mysql.createPool({
      host: '101.132.156.250',
      port: 33320,
      user: 'wingman_db_usr_8a2Xy',
      password: 'Z8#kP2@vQ7$mE5!tR3&wX9*yB4',
      database: 'wingman_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Get connection
    const connection = await pool.getConnection();

    try {
      console.log('Checking users table...');
      // Get users
      const [users] = await connection.execute('SELECT id, name, email FROM users');
      console.log('Users found:', users.length);
      users.forEach(user => {
        console.log(`  - User: ${user.name} (${user.email}) - ID: ${user.id}`);
      });
      
      if (users.length > 0) {
        const userId = users[0].id;
        console.log(`\nChecking AI connections for user ID ${userId}...`);
        
        // Get AI connections for the first user
        const [connections] = await connection.execute(
          'SELECT id, user_id, apiKey, apiProvider, createdAt FROM ai_connections WHERE user_id = ?',
          [userId]
        );
        
        console.log(`AI connections found: ${connections.length}`);
        connections.forEach(conn => {
          console.log(`  - Connection ID: ${conn.id}`);
          console.log(`    Provider: ${conn.apiProvider}`);
          console.log(`    API Key: ${conn.apiKey ? '***' : 'EMPTY'}`);
          console.log(`    Created: ${conn.createdAt}`);
        });
        
        if (connections.length === 0) {
          console.log('⚠️  No AI connections found for this user');
        }
      }
      
    } finally {
      connection.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('Error checking AI connections:', error);
  }
}

checkAIConnections();
