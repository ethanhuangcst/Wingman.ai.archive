// Node.js script to create ai_providers table and update existing tables
const mysql = require('mysql2/promise');

async function createTables() {
  try {
    // Create database connection pool
    const pool = mysql.createPool({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'password',
      database: 'wingman_db',
    });

    // Get connection
    const connection = await pool.getConnection();

    try {
      // Create ai_providers table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS ai_providers (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          base_urls JSON NOT NULL,
          default_model VARCHAR(100) NOT NULL,
          requires_auth BOOLEAN NOT NULL DEFAULT TRUE,
          auth_header VARCHAR(100) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Created ai_providers table');

      // Insert initial providers
      await connection.execute(`
        INSERT INTO ai_providers (id, name, base_urls, default_model, requires_auth, auth_header)
        VALUES
          ('qwen-plus', 'qwen-plus', '["https://dashscope.aliyuncs.com/compatible-mode/v1"]', 'qwen-plus', TRUE, 'Authorization'),
          ('gpt-5.2-all', 'gpt-5.2-all', '["https://openaiss.com/v1"]', 'gpt-5.2-all', TRUE, 'Authorization')
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          base_urls = VALUES(base_urls),
          default_model = VALUES(default_model),
          requires_auth = VALUES(requires_auth),
          auth_header = VALUES(auth_header),
          updated_at = CURRENT_TIMESTAMP;
      `);
      console.log('✅ Inserted initial providers');

      // Check if provider_id column exists in ai_connections
      const [aiConnectionsColumns] = await connection.execute(`
        SHOW COLUMNS FROM ai_connections LIKE 'provider_id';
      `);
      
      if (aiConnectionsColumns.length === 0) {
        // Add provider_id to ai_connections
        await connection.execute(`
          ALTER TABLE ai_connections ADD COLUMN provider_id VARCHAR(50) NULL;
        `);
        console.log('✅ Added provider_id column to ai_connections');

        // Add foreign key to ai_connections
        try {
          await connection.execute(`
            ALTER TABLE ai_connections ADD CONSTRAINT fk_ai_connections_provider
              FOREIGN KEY (provider_id) REFERENCES ai_providers(id)
              ON DELETE SET NULL;
          `);
          console.log('✅ Added foreign key to ai_connections');
        } catch (error) {
          console.warn('⚠️  Foreign key constraint may already exist:', error.message);
        }

        // Update existing ai_connections
        await connection.execute(`
          UPDATE ai_connections
          SET provider_id = CASE
            WHEN apiProvider = 'Qwen' THEN 'qwen-plus'
            WHEN apiProvider = 'PlanB' THEN 'gpt-5.2-all'
            ELSE apiProvider
          END;
        `);
        console.log('✅ Updated ai_connections with provider_id');
      } else {
        console.log('⚠️  provider_id column already exists in ai_connections');
      }

      // Check if provider_id column exists in users
      const [usersColumns] = await connection.execute(`
        SHOW COLUMNS FROM users LIKE 'provider_id';
      `);
      
      if (usersColumns.length === 0) {
        // Add provider_id to users
        await connection.execute(`
          ALTER TABLE users ADD COLUMN provider_id VARCHAR(50) NULL;
        `);
        console.log('✅ Added provider_id column to users');

        // Add foreign key to users
        try {
          await connection.execute(`
            ALTER TABLE users ADD CONSTRAINT fk_users_provider
              FOREIGN KEY (provider_id) REFERENCES ai_providers(id)
              ON DELETE SET NULL;
          `);
          console.log('✅ Added foreign key to users');
        } catch (error) {
          console.warn('⚠️  Foreign key constraint may already exist:', error.message);
        }

        // Update existing users
        await connection.execute(`
          UPDATE users
          SET provider_id = CASE
            WHEN apiProvider = 'Qwen' THEN 'qwen-plus'
            WHEN apiProvider = 'PlanB' THEN 'gpt-5.2-all'
            ELSE apiProvider
          END;
        `);
        console.log('✅ Updated users with provider_id');
      } else {
        console.log('⚠️  provider_id column already exists in users');
      }

    } finally {
      connection.release();
      await pool.end();
    }

    console.log('\n🎉 All tables created and updated successfully!');
    console.log('The AI provider configuration is now stored in the database.');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createTables();
