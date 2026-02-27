// Script to add system_flag column to users table
const mysql = require('mysql2/promise');

async function addUserSystemFlagColumn() {
    try {
        // Database connection configuration
        const dbConfig = {
            host: '101.132.156.250',
            port: 33320,
            user: 'wingman_db_usr_8a2Xy',
            password: 'Z8#kP2@vQ7$mE5!tR3&wX9*yB4',
            database: 'wingman_db'
        };

        // Connect to database
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Add system_flag column to users table
        await connection.execute(
            'ALTER TABLE users ADD COLUMN system_flag VARCHAR(20) NOT NULL DEFAULT "WINGMAN"'
        );
        console.log('Added system_flag column to users table');

        // Close connection
        await connection.end();
        console.log('Database connection closed');
        console.log('✅ Successfully added system_flag column to users table');

    } catch (error) {
        console.error('❌ Error adding system_flag column:', error.message);
        process.exit(1);
    }
}

// Run the script
addUserSystemFlagColumn();