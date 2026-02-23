const mysql = require('mysql2/promise');

// Create database connection pool
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'wingman_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function checkProviders() {
  try {
    console.log('Checking ai_providers table...');
    
    // Check table structure
    const [structure] = await pool.execute('DESCRIBE ai_providers');
    console.log('\nTable structure:');
    structure.forEach(field => {
      console.log(`${field.Field}: ${field.Type} ${field.Null === 'NO' ? 'NOT NULL' : ''} ${field.Default ? `DEFAULT ${field.Default}` : ''}`);
    });
    
    // Check table content
    const [providers] = await pool.execute('SELECT * FROM ai_providers');
    console.log('\nTable content:');
    providers.forEach(provider => {
      console.log(`\nProvider: ${provider.id} (${provider.name})`);
      console.log(`Base URLs: ${provider.base_urls}`);
      console.log(`Type of base_urls: ${typeof provider.base_urls}`);
      try {
        const parsedUrls = JSON.parse(provider.base_urls);
        console.log(`Parsed base URLs: ${JSON.stringify(parsedUrls)}`);
      } catch (error) {
        console.log(`Error parsing base_urls: ${error.message}`);
      }
    });
    
  } catch (error) {
    console.error('Error checking providers:', error);
  } finally {
    await pool.end();
  }
}

checkProviders();
