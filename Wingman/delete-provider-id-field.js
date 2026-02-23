// Script to delete provider_id field from ai_connections table
const mysql = require('mysql2/promise');

async function deleteProviderIdField() {
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
      console.log('Deleting provider_id field from ai_connections table...');
      
      // Check if the field exists
      const [columns] = await connection.execute('DESCRIBE ai_connections');
      const hasProviderId = columns.some(col => col.Field === 'provider_id');
      
      if (hasProviderId) {
        // First, drop the foreign key constraint if it exists
        try {
          await connection.execute('ALTER TABLE ai_connections DROP FOREIGN KEY fk_ai_connections_provider');
          console.log('✅ Successfully dropped foreign key constraint');
        } catch (error) {
          console.log('⚠️  No foreign key constraint found or already dropped');
        }
        
        // Delete the provider_id field
        await connection.execute('ALTER TABLE ai_connections DROP COLUMN provider_id');
        console.log('✅ Successfully deleted provider_id field');
      } else {
        console.log('⚠️  provider_id field does not exist');
      }
      
      // Verify the table structure
      const [updatedColumns] = await connection.execute('DESCRIBE ai_connections');
      console.log('\nUpdated table structure:');
      updatedColumns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? '(NULL)' : ''} ${col.Key ? `[${col.Key}]` : ''}`);
      });
      
    } finally {
      connection.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('Error deleting provider_id field:', error);
  }
}

deleteProviderIdField();
