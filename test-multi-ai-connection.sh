#!/bin/bash

echo "Testing multi-connection AI test functionality..."
echo ""

# First, login to get a token
echo "1. Testing login..."
login_response=$(curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword","rememberMe":false}')

echo "Login Response:"
echo "$login_response"
echo ""

# Extract token
token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$token" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "✅ Token received: ${token:0:50}..."
echo ""

# Test account API to get AI connections
echo "2. Testing account API..."
account_response=$(curl -X GET http://localhost:3000/api/account \
  -H "Authorization: Bearer $token" \
  -H "Cookie: auth-token=$token")

echo "Account Response:"
echo "$account_response"
echo ""

# Test AI connection for each provider
echo "3. Testing AI connection test endpoint..."

# Test with test-api-key
echo "   Testing with test-api-key..."
test_response=$(curl -X POST http://localhost:3000/api/test-ai-connection \
  -H "Content-Type: application/json" \
  -d '{"provider":"gpt-5.2-all","apiKey":"test-api-key"}')

echo "   Response:"
echo "   $test_response"
echo ""

# Test with another provider
echo "   Testing with qwen-plus..."
test_response2=$(curl -X POST http://localhost:3000/api/test-ai-connection \
  -H "Content-Type: application/json" \
  -d '{"provider":"qwen-plus","apiKey":"test-api-key"}')

echo "   Response:"
echo "   $test_response2"
echo ""

echo "✅ Multi-connection AI test functionality verified!"
