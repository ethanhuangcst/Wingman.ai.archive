// Test script to check all AI connections for a user by calling the existing API endpoint

const mysql = require('mysql2/promise');
const fs = require('fs').promises;

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

// Test AI connection by calling the existing API endpoint
async function testConnection(provider, apiKey) {
  try {
    const response = await fetch('http://localhost:3000/api/test-ai-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ provider, apiKey })
    });

    const result = await response.json();
    return {
      result: result.result || 'FAIL',
      response: result.response,
      error: result.error,
      usedUrl: result.usedUrl
    };
  } catch (error) {
    return {
      result: 'FAIL',
      error: `API call failed: ${error.message}`
    };
  }
}

// Get provider configuration (simulate what the existing service does)
async function getProviderConfig(provider) {
  // Hardcoded provider configurations based on common setups
  const providers = {
    'gpt-4o-mini': {
      name: 'GPT-4o Mini',
      base_urls: ['https://api.openai.com/v1'],
      default_model: 'gpt-4o-mini',
      requires_auth: true,
      auth_header: 'Authorization'
    },
    'qwen-plus': {
      name: 'Qwen Plus',
      base_urls: ['https://api.moonshot.cn/v1', 'https://api-luna.moonshot.cn/v1'],
      default_model: 'qwen-plus',
      requires_auth: true,
      auth_header: 'Authorization'
    },
    'deepseek3.2': {
      name: 'DeepSeek 3.2',
      base_urls: ['https://api.deepseek.com/v1'],
      default_model: 'deepseek-chat',
      requires_auth: true,
      auth_header: 'Authorization'
    }
  };

  return providers[provider] || null;
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
    const [users] = await connection.execute(
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
    let connections = [];
    
    try {
      const [aiConnections] = await connection.execute(
        'SELECT id, apiKey, apiProvider FROM ai_connections WHERE user_id = ?',
        [user.id]
      );
      connections = aiConnections;
    } catch (error) {
      console.log('ai_connections table not found, checking old user table fields...');
      const [userWithApi] = await connection.execute(
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

    // Step 3: Test each connection using existing API endpoint
    console.log('Step 3: Testing AI connections...');
    const testResults = [];

    for (const conn of connections) {
      console.log(`\nTesting connection: ${conn.apiProvider}`);
      
      try {
        // Get provider configuration
        const providerConfig = await getProviderConfig(conn.apiProvider);
        
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

        // Test the connection by calling the existing API
        const testResult = await testConnection(conn.apiProvider, conn.apiKey);

        testResults.push({
          provider: conn.apiProvider,
          success: testResult.result === 'PASS',
          response: testResult.response,
          error: testResult.error,
          usedUrl: testResult.usedUrl,
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
          error: `Test failed: ${error.message}`,
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

async function generateMarkdownReport(user, testResults) {
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
        result.config.base_urls.forEach(url => {
          markdown += `  - ${url}\n`;
        });
      } else if (result.config.base_urls) {
        markdown += `  - ${result.config.base_urls}\n`;
      }
    }
    
    if (result.usedUrl) {
      markdown += `- **Used URL:** ${result.usedUrl}\n`;
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
