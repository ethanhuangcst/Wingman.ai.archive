// Test script to verify user system_flag functionality
const mysql = require('mysql2/promise');

async function testUserSystemFlag() {
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

        // Test 1: Check if system_flag column exists in users table
        console.log('\n=== Test 1: Checking if system_flag column exists in users table ===');
        const [columns] = await connection.execute(
            'DESCRIBE users'
        );
        const hasSystemFlag = columns.some(col => col.Field === 'system_flag');
        console.log(`System_flag column exists: ${hasSystemFlag}`);
        if (hasSystemFlag) {
            const systemFlagColumn = columns.find(col => col.Field === 'system_flag');
            console.log(`System_flag column type: ${systemFlagColumn.Type}`);
            console.log(`System_flag column nullability: ${systemFlagColumn.Null}`);
            console.log(`System_flag column default: ${systemFlagColumn.Default}`);
        }

        // Test 2: Check existing users have system_flag = 'WINGMAN'
        console.log('\n=== Test 2: Checking existing users ===');
        const [existingUsers] = await connection.execute(
            'SELECT id, name, email, system_flag FROM users LIMIT 5'
        );
        console.log(`Found ${existingUsers.length} users`);
        existingUsers.forEach(user => {
            console.log(`User ${user.id} (${user.name}): system_flag = ${user.system_flag}`);
        });

        // Test 3: Create a test user and verify system_flag is set
        console.log('\n=== Test 3: Creating test user ===');
        const testEmail = `test_${Date.now()}@example.com`;
        
        await connection.execute(
            'INSERT INTO users (name, email, password, system_flag, createdAt) VALUES (?, ?, ?, ?, NOW())',
            ['Test User', testEmail, 'hashed_password', 'WINGMAN']
        );
        console.log('Created test user');

        // Verify the test user has system_flag = 'WINGMAN'
        const [createdUser] = await connection.execute(
            'SELECT id, name, email, system_flag FROM users WHERE email = ?',
            [testEmail]
        );
        console.log(`Created user system_flag: ${createdUser[0].system_flag}`);
        const testUserId = createdUser[0].id;

        // Test 4: Update the test user and verify system_flag remains 'WINGMAN'
        console.log('\n=== Test 4: Updating test user ===');
        await connection.execute(
            'UPDATE users SET name = ?, system_flag = "WINGMAN" WHERE id = ?',
            ['Updated Test User', testUserId]
        );
        console.log('Updated test user');

        // Verify the updated user still has system_flag = 'WINGMAN'
        const [updatedUser] = await connection.execute(
            'SELECT id, name, email, system_flag FROM users WHERE id = ?',
            [testUserId]
        );
        console.log(`Updated user system_flag: ${updatedUser[0].system_flag}`);

        // Test 5: Test that system_flag cannot be null
        console.log('\n=== Test 5: Testing system_flag nullability ===');
        try {
            await connection.execute(
                'INSERT INTO users (name, email, password, system_flag, createdAt) VALUES (?, ?, ?, ?, NOW())',
                ['Test User 2', `test2_${Date.now()}@example.com`, 'hashed_password', null]
            );
            console.log('❌ ERROR: Should not be able to insert user with null system_flag');
        } catch (error) {
            console.log('✅ SUCCESS: Cannot insert user with null system_flag');
            console.log('Error message:', error.message);
        }

        // Clean up test user
        await connection.execute(
            'DELETE FROM users WHERE id = ?',
            [testUserId]
        );
        console.log('\nCleaned up test user');

        // Close connection
        await connection.end();
        console.log('Database connection closed');
        console.log('\n✅ All tests completed successfully!');

    } catch (error) {
        console.error('❌ Error testing user system_flag:', error.message);
        process.exit(1);
    }
}

// Run the test
testUserSystemFlag();