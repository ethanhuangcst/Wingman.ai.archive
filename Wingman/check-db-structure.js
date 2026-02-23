const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'wingman_db'
  });

  try {
    console.log('Checking ai_connections table structure...');
    const [structure] = await pool.execute('DESCRIBE ai_connections');
    console.log('ai_connections table structure:');
    structure.forEach(field => {
      console.log(`${field.Field}: ${field.Type} ${field.Null === 'NO' ? 'NOT NULL' : ''} ${field.Default ? `DEFAULT ${field.Default}` : ''}`);
    });

    console.log('\nChecking users table structure...');
    const [usersStructure] = await pool.execute('DESCRIBE users');
    console.log('users table structure:');
    usersStructure.forEach(field => {
      console.log(`${field.Field}: ${field.Type} ${field.Null === 'NO' ? 'NOT NULL' : ''} ${field.Default ? `DEFAULT ${field.Default}` : ''}`);
    });

    console.log('\nChecking ai_providers table structure...');
    const [providersStructure] = await pool.execute('DESCRIBE ai_providers');
    console.log('ai_providers table structure:');
    providersStructure.forEach(field => {
      console.log(`${field.Field}: ${field.Type} ${field.Null === 'NO' ? 'NOT NULL' : ''} ${field.Default ? `DEFAULT ${field.Default}` : ''}`);
    });

    console.log('\nChecking ai_connections for user me@ethanhuang.com...');
    const [user] = await pool.execute('SELECT id FROM users WHERE email = ?', ['me@ethanhuang.com']);
    if (user.length > 0) {
      const userId = user[0].id;
      const [connections] = await pool.execute('SELECT * FROM ai_connections WHERE user_id = ?', [userId]);
      console.log('AI connections for user:', connections);
    } else {
      console.log('User not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
})();
