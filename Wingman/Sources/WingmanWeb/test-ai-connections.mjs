import { db } from './app/lib/database.js';

async function testAIConnections() {
  try {
    console.log('Testing AI connections...');
    
    // Check if ai_connections table exists
    console.log('\nChecking if ai_connections table exists...');
    try {
      const tableCheck = await db.execute(
        'SHOW TABLES LIKE "ai_connections"'
      );
      console.log('ai_connections table exists:', tableCheck.length > 0);
    } catch (error) {
      console.error('Error checking ai_connections table:', error);
    }
    
    // Check if users table exists
    console.log('\nChecking if users table exists...');
    try {
      const usersTableCheck = await db.execute(
        'SHOW TABLES LIKE "users"'
      );
      console.log('users table exists:', usersTableCheck.length > 0);
    } catch (error) {
      console.error('Error checking users table:', error);
    }
    
    // Check users in the database
    console.log('\nChecking users in the database...');
    try {
      const users = await db.execute('SELECT id, name, email, apiKey, apiProvider FROM users');
      console.log('Users found:', users.length);
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - User ID: ${user.id}`);
        console.log(`    Old API Key: ${user.apiKey ? 'Set' : 'Not set'}`);
        console.log(`    Old API Provider: ${user.apiProvider || 'Not set'}`);
      });
      
      // Check AI connections for each user
      for (const user of users) {
        console.log(`\nChecking AI connections for user ${user.id} (${user.name})...`);
        try {
          const connections = await db.execute(
            'SELECT id, apiKey, apiProvider FROM ai_connections WHERE user_id = ?',
            [user.id]
          );
          console.log(`  AI connections found: ${connections.length}`);
          connections.forEach(conn => {
            console.log(`    - Provider: ${conn.apiProvider}`);
            console.log(`      API Key: ${conn.apiKey ? 'Set' : 'Not set'}`);
          });
        } catch (error) {
          console.error(`  Error checking AI connections:`, error);
        }
      }
    } catch (error) {
      console.error('Error checking users:', error);
    }
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAIConnections();