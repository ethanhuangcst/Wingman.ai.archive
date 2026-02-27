// Script to modify profileImage column to LONGTEXT
const mysql = require('mysql2/promise');

async function modifyProfileImageColumn() {
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

        // Modify profileImage column to LONGTEXT
        await connection.execute(
            'ALTER TABLE users MODIFY COLUMN profileImage LONGTEXT NULL'
        );
        console.log('Successfully changed profileImage column to LONGTEXT');

        // Close connection
        await connection.end();
        console.log('Database connection closed');

    } catch (error) {
        console.error('❌ Error modifying profileImage column:', error.message);
        process.exit(1);
    }
}

// Run the script
modifyProfileImageColumn();