// Database setup script
const mysql = require('mysql2/promise');

async function setupDatabase() {
    try {
        // Connect to MySQL
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password'
        });

        // Create database if it doesn't exist
        await connection.execute('CREATE DATABASE IF NOT EXISTS wingman_dev');
        await connection.execute('USE wingman_dev');

        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create ai_providers table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS ai_providers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                url VARCHAR(255) NOT NULL,
                api_key VARCHAR(255),
                is_default BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create chats table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS chats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                title VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Create messages table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                chat_id INT,
                user_id INT,
                content TEXT NOT NULL,
                role ENUM('user', 'assistant') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (chat_id) REFERENCES chats(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Insert default AI providers
        await connection.execute(
            'INSERT IGNORE INTO ai_providers (name, url, is_default) VALUES (?, ?, ?)',
            ['OpenAI', 'https://api.openai.com/v1/chat/completions', true]
        );

        await connection.execute(
            'INSERT IGNORE INTO ai_providers (name, url) VALUES (?, ?)',
            ['Anthropic', 'https://api.anthropic.com/v1/messages']
        );

        console.log('✅ Database setup completed successfully!');
        await connection.end();
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
    }
}

setupDatabase();
