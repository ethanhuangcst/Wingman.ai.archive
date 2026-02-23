// Test script to verify AI connection using database configurations
const { getAllProviders } = require('../app/lib/db');
const { AI_API_CONNECTION } = require('../app/api/utils/ai-connection/ai-connection-service');

async function testAIConnections() {
  console.log('=== Testing AI Connections Using Database Configurations ===\n');

  try {
    // Fetch all providers from database
    const providers = await getAllProviders();
    console.log(`✓ Successfully fetched ${providers.length} providers from database`);

    // Test each provider
    for (const provider of providers) {
      console.log(`\n=== Testing Provider: ${provider.name} (${provider.id}) ===`);
      console.log(`  Default Model: ${provider.default_model}`);
      console.log(`  Base URLs: ${JSON.stringify(provider.base_urls)}`);
      console.log(`  Requires Auth: ${provider.requires_auth}`);
      console.log(`  Auth Header: ${provider.auth_header}`);

      // Test 1: Get provider config from AI connection service
      console.log('\n1. Testing: Get provider config from AI connection service...');
      const providerConfig = await AI_API_CONNECTION.getProviderConfig(provider.id);
      if (providerConfig) {
        console.log('✓ Successfully fetched provider config from AI connection service');
        console.log(`  Config ID: ${providerConfig.id}`);
        console.log(`  Config Name: ${providerConfig.name}`);
      } else {
        console.log('✗ Failed to fetch provider config from AI connection service');
        continue;
      }

      // Test 2: Test connection (using dummy API key for testing)
      console.log('\n2. Testing: AI connection test...');
      try {
        // Use a dummy API key for testing - this will fail but should not crash
        const testResult = await AI_API_CONNECTION.testConnection(provider.id, 'dummy-api-key');
        console.log(`  Test Result: ${testResult.result}`);
        if (testResult.error) {
          console.log(`  Error Message: ${testResult.error}`);
          // This is expected with a dummy API key
          console.log('⚠ Note: Error is expected with dummy API key - this test verifies the configuration is loaded correctly');
        }
        console.log('✓ AI connection test completed (configuration loaded correctly)');
      } catch (error) {
        console.log(`✗ AI connection test failed with error: ${error.message}`);
      }

      console.log(`\n=== Test completed for provider: ${provider.name} ===`);
    }

    // Test 3: Test default provider
    console.log('\n=== Testing Default Provider ===');
    const defaultProviderId = await AI_API_CONNECTION.getDefaultProvider();
    console.log(`✓ Successfully fetched default provider ID: ${defaultProviderId}`);

    // Test 4: Test getProviders method
    console.log('\n=== Testing Get Providers Method ===');
    const serviceProviders = await AI_API_CONNECTION.getProviders();
    console.log(`✓ Successfully fetched ${serviceProviders.length} providers from AI connection service`);
    console.log('Providers from service:');
    serviceProviders.forEach((p, index) => {
      console.log(`  ${index + 1}. ${p.name} (${p.id})`);
    });

    console.log('\n=== All AI connection tests completed! ===');

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    console.error('Error stack:', error.stack);
  }
}

// Run the tests
testAIConnections();
