// Test script to verify the chat API fix
const axios = require('axios');

async function testChatAPI() {
  try {
    console.log('Testing chat API...');
    
    // First, let's log in to get a valid token
    console.log('\n1. Logging in...');
    const loginResponse = await axios.post('http://localhost:3002/api/login', {
      email: 'me@ethanhuang.com',
      password: 'password123' // Replace with actual password
    });
    
    console.log('Login response:', loginResponse.data);
    
    if (!loginResponse.data.success) {
      console.error('Login failed:', loginResponse.data.error);
      return;
    }
    
    // Extract the token from the response or cookies
    const token = loginResponse.data.token;
    console.log('Got token:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.error('No token received from login');
      return;
    }
    
    // Now test the chat API with the token
    console.log('\n2. Testing chat API...');
    const chatResponse = await axios.post('http://localhost:3002/api/chat', {
      messages: [{
        role: 'user',
        content: 'Hello, test message'
      }]
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Chat API response:', chatResponse.data);
    
    if (chatResponse.data.success) {
      console.log('✅ Chat API test passed!');
    } else {
      console.error('❌ Chat API test failed:', chatResponse.data.error);
    }
    
  } catch (error) {
    console.error('Error testing chat API:', error.response ? error.response.data : error.message);
  }
}

testChatAPI();