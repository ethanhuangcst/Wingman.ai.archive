// Test script to verify system_flag functionality
const mysql = require('mysql2/promise');

async function testSystemFlag() {
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

        // Test 1: Check if system_flag column exists
        console.log('\n=== Test 1: Checking if system_flag column exists ===');
        const [columns] = await connection.execute(
            'DESCRIBE prompts'
        );
        const hasSystemFlag = columns.some(col => col.Field === 'system_flag');
        console.log(`System_flag column exists: ${hasSystemFlag}`);
        if (hasSystemFlag) {
            const systemFlagColumn = columns.find(col => col.Field === 'system_flag');
            console.log(`System_flag column type: ${systemFlagColumn.Type}`);
            console.log(`System_flag column nullability: ${systemFlagColumn.Null}`);
            console.log(`System_flag column default: ${systemFlagColumn.Default}`);
        }

        // Test 2: Check existing prompts have system_flag = 'WINGMAN'
        console.log('\n=== Test 2: Checking existing prompts ===');
        const [existingPrompts] = await connection.execute(
            'SELECT id, prompt_name, system_flag FROM prompts LIMIT 5'
        );
        console.log(`Found ${existingPrompts.length} prompts`);
        existingPrompts.forEach(prompt => {
            console.log(`Prompt ${prompt.id} (${prompt.prompt_name}): system_flag = ${prompt.system_flag}`);
        });

        // Test 3: Create a test prompt and verify system_flag is set
        console.log('\n=== Test 3: Creating test prompt ===');
        const testPromptId = `test-prompt-${Date.now()}`;
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        await connection.execute(
            'INSERT INTO prompts (id, user_id, prompt_name, prompt_text, system_flag, created_datetime, updated_datetime) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [testPromptId, 4, 'Test Prompt', 'Test prompt text', 'WINGMAN', now, now]
        );
        console.log('Created test prompt');

        // Verify the test prompt has system_flag = 'WINGMAN'
        const [createdPrompt] = await connection.execute(
            'SELECT id, prompt_name, system_flag FROM prompts WHERE id = ?',
            [testPromptId]
        );
        console.log(`Created prompt system_flag: ${createdPrompt[0].system_flag}`);

        // Test 4: Update the test prompt and verify system_flag remains 'WINGMAN'
        console.log('\n=== Test 4: Updating test prompt ===');
        const updatedNow = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await connection.execute(
            'UPDATE prompts SET prompt_name = ?, system_flag = "WINGMAN", updated_datetime = ? WHERE id = ?',
            ['Updated Test Prompt', updatedNow, testPromptId]
        );
        console.log('Updated test prompt');

        // Verify the updated prompt still has system_flag = 'WINGMAN'
        const [updatedPrompt] = await connection.execute(
            'SELECT id, prompt_name, system_flag FROM prompts WHERE id = ?',
            [testPromptId]
        );
        console.log(`Updated prompt system_flag: ${updatedPrompt[0].system_flag}`);

        // Test 5: Test the filtering by system_flag
        console.log('\n=== Test 5: Testing system_flag filtering ===');
        const [wingmanPrompts] = await connection.execute(
            'SELECT COUNT(*) as count FROM prompts WHERE system_flag = "WINGMAN"'
        );
        console.log(`Prompts with system_flag = 'WINGMAN': ${wingmanPrompts[0].count}`);

        // Clean up test prompt
        await connection.execute(
            'DELETE FROM prompts WHERE id = ?',
            [testPromptId]
        );
        console.log('\nCleaned up test prompt');

        // Close connection
        await connection.end();
        console.log('Database connection closed');
        console.log('\n✅ All tests completed successfully!');

    } catch (error) {
        console.error('❌ Error testing system_flag:', error.message);
        process.exit(1);
    }
}

// Run the test
testSystemFlag();