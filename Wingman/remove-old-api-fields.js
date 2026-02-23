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
    console.log('Removing old API fields from users table...');
    
    // Remove apiKey field
    try {
      await pool.execute('ALTER TABLE users DROP COLUMN apiKey');
      console.log('✓ Removed apiKey column from users table');
    } catch (error) {
      console.log('apiKey column already removed or not exists:', error.message);
    }
    
    // Remove apiProvider field
    try {
      await pool.execute('ALTER TABLE users DROP COLUMN apiProvider');
      console.log('✓ Removed apiProvider column from users table');
    } catch (error) {
      console.log('apiProvider column already removed or not exists:', error.message);
    }
    
    // Remove provider_id field
    try {
      // First drop the foreign key constraint if it exists
      try {
        await pool.execute('ALTER TABLE users DROP FOREIGN KEY fk_users_provider');
        console.log('✓ Dropped foreign key constraint fk_users_provider');
      } catch (error) {
        console.log('Foreign key constraint already removed or not exists:', error.message);
      }
      
      // Then drop the column
      await pool.execute('ALTER TABLE users DROP COLUMN provider_id');
      console.log('✓ Removed provider_id column from users table');
    } catch (error) {
      console.log('provider_id column already removed or not exists:', error.message);
    }
    
    console.log('\nUsers table structure after cleanup:');
    const [structure] = await pool.execute('DESCRIBE users');
    structure.forEach(field => {
      console.log(`${field.Field}: ${field.Type} ${field.Null === 'NO' ? 'NOT NULL' : ''} ${field.Default ? `DEFAULT ${field.Default}` : ''}`);
    });
    
    console.log('\nOld API fields removed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
})();
