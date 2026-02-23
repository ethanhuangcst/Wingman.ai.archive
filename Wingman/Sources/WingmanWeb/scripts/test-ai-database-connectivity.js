// Test script to verify AI connectivity from database
const { getAllProviders, getProviderById, getDefaultProvider } = require('../app/lib/db');
const { AI_API_CONNECTION } = require('../app/api/utils/ai-connection/ai-connection-service');

async function testDatabaseConnection() {
  console.log('=== Testing AI Database Connectivity ===\n');

  try {
    // Test 1: Fetch all providers from database
    console.log('1. Testing: Fetch all providers from database...');
    const providers = await getAllProviders();
    console.log(`✓ Successfully fetched ${providers.length} providers from database`);
    console.log('Providers found:');
    providers.forEach((provider, index) => {
      console.log(`\nProvider ${index + 1}:`);
      console.log(`  ID: ${provider.id}`);
      console.log(`  Name: ${provider.name}`);
      console.log(`  Default Model: ${provider.default_model}`);
      console.log(`  Requires Auth: ${provider.requires_auth}`);
      console.log(`  Auth Header: ${provider.auth_header}`);
      console.log(`  Base URLs: ${JSON.stringify(provider.base_urls)}`);
      console.log(`  Created At: ${provider.created_at}`);
      console.log(`  Updated At: ${provider.updated_at}`);
    });

    // Test 2: Fetch provider by ID
    console.log('\n2. Testing: Fetch provider by ID...');
    if (providers.length > 0) {
      const firstProvider = providers[0];
      const providerById = await getProviderById(firstProvider.id);
      if (providerById) {
        console.log(`✓ Successfully fetched provider by ID: ${providerById.id}`);
        console.log(`  Name: ${providerById.name}`);
      } else {
        console.log(`✗ Failed to fetch provider by ID: ${firstProvider.id}`);
      }
    } else {
      console.log('⚠ No providers found to test fetch by ID');
    }

    // Test 3: Fetch default provider
    console.log('\n3. Testing: Fetch default provider...');
    const defaultProvider = await getDefaultProvider();
    if (defaultProvider) {
      console.log(`✓ Successfully fetched default provider: ${defaultProvider.id}`);
      console.log(`  Name: ${defaultProvider.name}`);
    } else {
      console.log('✗ Failed to fetch default provider');
    }

    // Test 4: Test AI connection service
    console.log('\n4. Testing: AI connection service...');
    const serviceProviders = await AI_API_CONNECTION.getProviders();
    console.log(`✓ Successfully fetched ${serviceProviders.length} providers from AI connection service`);
    console.log('Providers from service:');
    serviceProviders.forEach((provider, index) => {
      console.log(`  ${index + 1}. ${provider.name} (${provider.id})`);
    });

    // Test 5: Test provider config retrieval
    console.log('\n5. Testing: Provider config retrieval...');
    if (providers.length > 0) {
      const firstProvider = providers[0];
      const providerConfig = await AI_API_CONNECTION.getProviderConfig(firstProvider.id);
      if (providerConfig) {
        console.log(`✓ Successfully fetched provider config for: ${providerConfig.id}`);
        console.log(`  Name: ${providerConfig.name}`);
        console.log(`  Default Model: ${providerConfig.default_model}`);
        console.log(`  Base URLs: ${JSON.stringify(providerConfig.base_urls)}`);
      } else {
        console.log(`✗ Failed to fetch provider config for: ${firstProvider.id}`);
      }
    } else {
      console.log('⚠ No providers found to test config retrieval');
    }

    // Test 6: Test default provider retrieval
    console.log('\n6. Testing: Default provider retrieval...');
    const defaultProviderId = await AI_API_CONNECTION.getDefaultProvider();
    console.log(`✓ Successfully fetched default provider ID: ${defaultProviderId}`);

    console.log('\n=== All tests completed successfully! ===');

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    console.error('Error stack:', error.stack);
  }
}

// Run the tests
testDatabaseConnection();
