// Test script to verify AI API endpoints
const fetch = require('node-fetch');

async function testApiEndpoints() {
  console.log('=== Testing AI API Endpoints ===\n');

  const baseUrl = 'http://localhost:3000';

  try {
    // Test 1: Test providers endpoint
    console.log('1. Testing: Providers API endpoint...');
    const providersResponse = await fetch(`${baseUrl}/api/providers`);
    const providersData = await providersResponse.json();
    
    if (providersResponse.ok) {
      console.log(`✓ Successfully fetched providers from API endpoint`);
      console.log(`  Total providers: ${providersData.providers.length}`);
      console.log(`  Default provider: ${providersData.defaultProvider?.id || 'None'}`);
      
      // Display providers
      console.log('\nProviders found:');
      providersData.providers.forEach((provider, index) => {
        console.log(`\nProvider ${index + 1}:`);
        console.log(`  ID: ${provider.id}`);
        console.log(`  Name: ${provider.name}`);
        console.log(`  Default Model: ${provider.default_model}`);
        console.log(`  Base URLs: ${JSON.stringify(provider.base_urls)}`);
        console.log(`  Requires Auth: ${provider.requires_auth}`);
        console.log(`  Auth Header: ${provider.auth_header}`);
      });
    } else {
      console.log(`✗ Failed to fetch providers from API endpoint`);
      console.log(`  Status: ${providersResponse.status}`);
      console.log(`  Error: ${providersData.error}`);
    }

    // Test 2: Test login endpoint (simulate a login to test AI provider setup)
    console.log('\n2. Testing: Login API endpoint...');
    try {
      const loginResponse = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false
        })
      });
      
      const loginData = await loginResponse.json();
      console.log(`  Login Status: ${loginResponse.status}`);
      if (loginData.success) {
        console.log('✓ Login successful (test account)');
        console.log(`  User: ${loginData.user?.name}`);
        if (loginData.apiTest) {
          console.log(`  API Test Result: ${loginData.apiTest.testResult}`);
          if (loginData.apiTest.testError) {
            console.log(`  API Test Error: ${loginData.apiTest.testError}`);
          }
        }
      } else {
        console.log('⚠ Login failed (expected for test account)');
        console.log(`  Error: ${loginData.error}`);
      }
    } catch (error) {
      console.log(`⚠ Login test failed with error: ${error.message}`);
    }

    console.log('\n=== All API endpoint tests completed! ===');

  } catch (error) {
    console.error('\n❌ Error during API endpoint testing:', error);
    console.error('Error message:', error.message);
  }
}

// Run the tests
testApiEndpoints();
