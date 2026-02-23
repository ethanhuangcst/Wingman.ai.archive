#!/bin/bash

echo "Testing chat API fix..."
echo ""

# First, login to get a token
echo "1. Testing login..."
login_response=$(curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"me@ethanhuang.com","password":"password123","rememberMe":false}')

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

# Test chat API
echo "2. Testing chat API..."
chat_response=$(curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer $token" \
  -H "Cookie: auth-token=$token" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello, how are you?"}],"provider":"gpt-5.2-all"}')

echo "Chat API Response:"
echo "$chat_response"
echo ""

# Check results
if echo "$chat_response" | grep -q '"success":true'; then
  echo "✅ Chat API test passed!"
elif echo "$chat_response" | grep -q 'API key is missing from connection'; then
  echo "❌ API key still missing from connection"
elif echo "$chat_response" | grep -q '401'; then
  echo "❌ 401 Unauthorized error"
elif echo "$chat_response" | grep -q 'No AI connections found'; then
  echo "❌ No AI connections found"
else
  echo "❌ Chat API returned error"
fi