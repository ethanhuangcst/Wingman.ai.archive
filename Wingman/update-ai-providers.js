// Script to update AI providers with multiple base URLs
const mysql = require('mysql2/promise');

async function updateAIProviders() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'password',
      database: 'wingman_db'
    });
    
    console.log('Connected to database');
    
    // Update gpt-5.2-all with multiple base URLs
    await connection.execute(
      `UPDATE ai_providers 
       SET base_urls = ? 
       WHERE id = 'gpt-5.2-all'`,
      [JSON.stringify([
        'https://openaiss.com/v1',
        'https://openaiss.com',
        'https://api.openai.com/v1'
      ])]
    );
    
    console.log('Updated gpt-5.2-all with multiple base URLs');
    
    // Update qwen-plus with multiple base URLs
    await connection.execute(
      `UPDATE ai_providers 
       SET base_urls = ? 
       WHERE id = 'qwen-plus'`,
      [JSON.stringify([
        'https://dashscope.aliyuncs.com/compatible-mode/v1',
        'https://dashscope.aliyuncs.com/v1'
      ])]
    );
    
    console.log('Updated qwen-plus with multiple base URLs');
    
    // Verify the changes
    const [providers] = await connection.execute(
      `SELECT id, name, base_urls FROM ai_providers`
    );
    
    console.log('\nUpdated providers:');
    providers.forEach(provider => {
      console.log(`\n${provider.id} (${provider.name}):`);
      console.log(JSON.parse(provider.base_urls));
    });
    
  } catch (error) {
    console.error('Error updating AI providers:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

// Run the script
updateAIProviders();