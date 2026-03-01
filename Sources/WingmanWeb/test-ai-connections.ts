// Test script to check all AI connections for a user using existing WingmanWeb AI service

import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import { AI_API_CONNECTION } from './app/api/utils/ai-connection/ai-connection-service.ts';

// Database connection configuration
const dbConfig = {
  host: '101.132.156.250',
  port: 33320,
  user: 'wingman_db_usr_8a2Xy',
  password: 'Z8#kP2@vQ7$mE5!tR3&wX9*yB4',
  database: 'wingman_db',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 3000,
  charset: 'utf8mb4',
  multipleStatements: false,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000
};

// User email to test
const USER_EMAIL = 'me@ethanhuang.com';

// Output file path
const OUTPUT_FILE = '/Users/ethanhuang/code/Wingman.ai/Wingman/Documentation/ai_diagnose.md';

// Create database connection pool
const pool = mysql.createPool(dbConfig);

interface AIConnection {
  id: string;
  apiKey: string;
  apiProvider: string;
}

interface TestResult {
  provider: string;
  success: boolean;
  response?: string;
  error?: string;
  usedUrl?: string;
  attempts?: number;
  config: any;
}

async function main() {
  let connection;
  try {
    console.log('=== AI Connection Diagnostic Test ===');
    console.log(`Testing connections for user: ${USER_EMAIL}`);
    console.log('====================================');

    // Get database connection
    connection = await pool.getConnection();

    // Step 1: Get user ID from email
    console.log('Step 1: Finding user by email...');
    const [users] = await connection.execute<any>(
      'SELECT id, name, email FROM users WHERE email = ?',
      [USER_EMAIL]
    );

    if (users.length === 0) {
      console.error('Error: User not found');
      return;
    }

    const user = users[0];
    console.log(`Found user: ${user.name} (ID: ${user.id})`);

    // Step 2: Get AI connections for the user
    console.log('Step 2: Getting AI connections...');
    let connections: AIConnection[] = [];
    
    try {
      const [aiConnections] = await connection.execute<any>(
        'SELECT id, apiKey, apiProvider FROM ai_connections WHERE user_id = ?',
        [user.id]
      );
      connections = aiConnections;
    } catch (error) {
      console.log('ai_connections table not found, checking old user table fields...');
      const [userWithApi] = await connection.execute<any>(
        'SELECT apiKey, apiProvider FROM users WHERE id = ?',
        [user.id]
      );
      
      if (userWithApi.length > 0 && userWithApi[0].apiKey) {
        connections = [{
          id: '1',
          apiKey: userWithApi[0].apiKey,
          apiProvider: userWithApi[0].apiProvider || 'qwen-plus'
        }];
      }
    }

    if (connections.length === 0) {
      console.log('No AI connections found for this user');
      return;
    }

    console.log(`Found ${connections.length} AI connection(s)`);

    // Step 3: Test each connection using existing AI service
    console.log('Step 3: Testing AI connections...');
    const testResults: TestResult[] = [];

    for (const conn of connections) {
      console.log(`\nTesting connection: ${conn.apiProvider}`);
      
      try {
        // Get provider configuration
        const providerConfig = await AI_API_CONNECTION.getProviderConfig(conn.apiProvider);
        
        if (!providerConfig) {
          testResults.push({
            provider: conn.apiProvider,
            success: false,
            error: `Provider ${conn.apiProvider} is not configured`,
            config: null
          });
          console.log('Result: FAIL - Provider not configured');
          continue;
        }

        // Test the connection using existing service
        const testResult = await AI_API_CONNECTION.testConnection(conn.apiProvider, conn.apiKey);

        testResults.push({
          provider: conn.apiProvider,
          success: testResult.result === 'PASS',
          response: testResult.response,
          error: testResult.error,
          usedUrl: testResult.usedUrl,
          attempts: testResult.attempts,
          config: providerConfig
        });

        console.log(`Result: ${testResult.result}`);
        if (testResult.result === 'FAIL') {
          console.log(`Error: ${testResult.error}`);
        }

      } catch (error) {
        console.error(`Error testing connection ${conn.apiProvider}:`, error);
        testResults.push({
          provider: conn.apiProvider,
          success: false,
          error: `Test failed: ${(error as Error).message}`,
          config: null
        });
        console.log('Result: FAIL - Exception occurred');
      }
    }

    // Step 4: Generate markdown report
    console.log('\nStep 4: Generating diagnostic report...');
    await generateMarkdownReport(user, testResults);

    console.log('\n=== Diagnostic Test Complete ===');
    console.log(`Report generated at: ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

async function generateMarkdownReport(user: any, testResults: TestResult[]) {
  let markdown = `# AI Connection Diagnostic Report\n\n`;
  markdown += `## User Information\n`;
  markdown += `- **Name:** ${user.name}\n`;
  markdown += `- **Email:** ${user.email}\n`;
  markdown += `- **User ID:** ${user.id}\n`;
  markdown += `- **Test Date:** ${new Date().toISOString()}\n\n`;

  markdown += `## Connection Summary\n`;
  const totalConnections = testResults.length;
  const successfulConnections = testResults.filter(r => r.success).length;
  markdown += `- **Total Connections:** ${totalConnections}\n`;
  markdown += `- **Successful Connections:** ${successfulConnections}\n`;
  markdown += `- **Failed Connections:** ${totalConnections - successfulConnections}\n\n`;

  markdown += `## Detailed Connection Results\n`;

  testResults.forEach((result, index) => {
    markdown += `### Connection ${index + 1}: ${result.provider}\n`;
    markdown += `- **Status:** ${result.success ? '✅ PASS' : '❌ FAIL'}\n`;
    
    if (result.config) {
      markdown += `- **Provider Name:** ${result.config.name}\n`;
      markdown += `- **Default Model:** ${result.config.default_model}\n`;
      markdown += `- **Requires Auth:** ${result.config.requires_auth ? 'Yes' : 'No'}\n`;
      if (result.config.auth_header) {
        markdown += `- **Auth Header:** ${result.config.auth_header}\n`;
      }
      markdown += `- **Base URLs:**\n`;
      if (Array.isArray(result.config.base_urls)) {
        result.config.base_urls.forEach((url: string) => {
          markdown += `  - ${url}\n`;
        });
      } else if (result.config.base_urls) {
        markdown += `  - ${result.config.base_urls}\n`;
      }
    }
    
    if (result.usedUrl) {
      markdown += `- **Used URL:** ${result.usedUrl}\n`;
    }
    
    if (result.attempts) {
      markdown += `- **Attempts:** ${result.attempts}\n`;
    }
    
    if (result.success && result.response) {
      markdown += `- **Response:** ${result.response.substring(0, 100)}${result.response.length > 100 ? '...' : ''}\n`;
    }
    
    if (!result.success && result.error) {
      markdown += `- **Error:** ${result.error}\n`;
    }
    
    markdown += `\n`;
  });

  markdown += `## Conclusion\n`;
  if (successfulConnections === totalConnections) {
    markdown += `All ${totalConnections} AI connections are working properly.\n`;
  } else if (successfulConnections > 0) {
    markdown += `${successfulConnections} out of ${totalConnections} AI connections are working. ${totalConnections - successfulConnections} connection(s) failed.\n`;
  } else {
    markdown += `All ${totalConnections} AI connections failed. Please check your API keys and network connectivity.\n`;
  }

  // Write the markdown file
  await fs.writeFile(OUTPUT_FILE, markdown);
}

// Run the script
main();
