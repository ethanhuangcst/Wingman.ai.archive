// Simple test script to verify the chat API fix
const http = require('http');

// Test login and chat API
async function testChatAPI() {
  try {
    console.log('Testing chat API fix...');
    
    // First, let's log in to get a valid token
    console.log('\n1. Logging in...');
    const loginData = JSON.stringify({
      email: 'me@ethanhuang.com',
      password: 'password123' // Replace with actual password
    });
    
    const loginOptions = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };
    
    const loginResponse = await new Promise((resolve, reject) => {
      const req = http.request(loginOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(JSON.parse(data));
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(loginData);
      req.end();
    });
    
    console.log('Login response:', loginResponse);
    
    if (!loginResponse.success) {
      console.error('Login failed:', loginResponse.error);
      return;
    }
    
    // Extract the token from the response
    const token = loginResponse.token;
    console.log('Got token:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.error('No token received from login');
      return;
    }
    
    // Now test the chat API with the token
    console.log('\n2. Testing chat API...');
    const chatData = JSON.stringify({
      messages: [{
        role: 'user',
        content: 'Hello, test message'
      }]
    });
    
    const chatOptions = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': chatData.length,
        'Authorization': `Bearer ${token}`
      }
    };
    
    const chatResponse = await new Promise((resolve, reject) => {
      const req = http.request(chatOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(JSON.parse(data));
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(chatData);
      req.end();
    });
    
    console.log('Chat API response:', chatResponse);
    
    if (chatResponse.success) {
      console.log('✅ Chat API test passed!');
    } else {
      console.error('❌ Chat API test failed:', chatResponse.error);
    }
    
  } catch (error) {
    console.error('Error testing chat API:', error.message);
  }
}

testChatAPI();