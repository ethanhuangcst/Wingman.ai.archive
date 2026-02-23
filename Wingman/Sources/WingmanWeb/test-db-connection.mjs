import { db } from './app/lib/database.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test a simple query
    const result = await db.execute('SELECT 1 + 1 as sum');
    console.log('Connection test successful:', result);
    
    // Test getting user data
    console.log('\nTesting user data retrieval...');
    const users = await db.execute('SELECT id, name, email FROM users LIMIT 5');
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
    });
    
    // Test getting AI connections
    console.log('\nTesting AI connections retrieval...');
    if (users.length > 0) {
      const connections = await db.execute('SELECT * FROM ai_connections WHERE user_id = ?', [users[0].id]);
      console.log(`AI connections for user ${users[0].id}:`, connections.length);
      connections.forEach(conn => {
        console.log(`  - ${conn.apiProvider}`);
      });
    }
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
}

testConnection();