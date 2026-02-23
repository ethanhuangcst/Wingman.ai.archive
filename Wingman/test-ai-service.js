// Test script to verify AI connection service with database
const { AI_API_CONNECTION } = require('./Sources/WingmanWeb/app/api/utils/ai-connection/ai-connection-service.ts');

async function testAIService() {
  try {
    console.log('Testing AI connection service with database...');
    
    // Test 1: Get all providers
    console.log('\n1. Testing getProviders():');
    try {
      const providers = await AI_API_CONNECTION.getProviders();
      console.log('✅ Providers found:', providers);
    } catch (error) {
      console.error('❌ Error getting providers:', error);
    }
    
    // Test 2: Get default provider
    console.log('\n2. Testing getDefaultProvider():');
    try {
      const defaultProvider = await AI_API_CONNECTION.getDefaultProvider();
      console.log('✅ Default provider:', defaultProvider);
    } catch (error) {
      console.error('❌ Error getting default provider:', error);
    }
    
    // Test 3: Get provider config
    console.log('\n3. Testing getProviderConfig():');
    try {
      const qwenConfig = await AI_API_CONNECTION.getProviderConfig('qwen-plus');
      console.log('✅ Qwen config:', qwenConfig);
    } catch (error) {
      console.error('❌ Error getting Qwen config:', error);
    }
    
    console.log('\n🎉 All AI service tests completed!');
    
  } catch (error) {
    console.error('❌ Error testing AI service:', error);
  }
}

testAIService();
