// Script to check users table structure
const mysql = require('mysql2/promise');

async function checkUsersTable() {
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

        // Check users table structure
        console.log('=== Users Table Structure ===');
        const [columns] = await connection.execute(
            'DESCRIBE users'
        );
        columns.forEach(col => {
            console.log(`${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
        });

        // Check if created_at column exists
        const hasCreatedAt = columns.some(col => col.Field === 'created_at');
        console.log(`\nHas created_at column: ${hasCreatedAt}`);

        // Close connection
        await connection.end();
        console.log('\nDatabase connection closed');

    } catch (error) {
        console.error('❌ Error checking users table:', error.message);
        process.exit(1);
    }
}

// Run the script
checkUsersTable();