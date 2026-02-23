#!/bin/bash

echo "Testing chat API functionality..."
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

# Test chat API with gpt-5.2-all
echo "2. Testing chat API with gpt-5.2-all..."
gpt_response=$(curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer $token" \
  -H "Cookie: auth-token=$token" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello, how are you?"}],"provider":"gpt-5.2-all"}')

echo "GPT Response:"
echo "$gpt_response"
echo ""

# Test chat API with qwen-plus
echo "3. Testing chat API with qwen-plus..."
qwen_response=$(curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer $token" \
  -H "Cookie: auth-token=$token" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello, how are you?"}],"provider":"qwen-plus"}')

echo "Qwen Response:"
echo "$qwen_response"
echo ""

# Check results
if echo "$gpt_response" | grep -q '"success":true'; then
  echo "✅ GPT chat test passed!"
else
  echo "❌ GPT chat test failed"
fi

if echo "$qwen_response" | grep -q '"success":true'; then
  echo "✅ Qwen chat test passed!"
else
  echo "❌ Qwen chat test failed"
fi

if echo "$gpt_response" | grep -q '"success":true' && echo "$qwen_response" | grep -q '"success":true'; then
  echo ""
  echo "🎉 All chat API tests passed!"
else
  echo ""
  echo "❌ Some chat API tests failed"
fi