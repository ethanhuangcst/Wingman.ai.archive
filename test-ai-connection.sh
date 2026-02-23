#!/bin/bash

echo "Testing AI connection test endpoint..."
echo ""

# Test AI connection with test API key
response=$(curl -X POST http://localhost:3000/api/test-ai-connection \
  -H "Content-Type: application/json" \
  -d '{"provider":"gpt-5.2-all","apiKey":"test-api-key"}')

echo "AI Connection Test Response:"
echo "$response"
echo ""

# Check if response contains success: true
if echo "$response" | grep -q '"success":true'; then
  echo "✅ AI connection test is working correctly!"
else
  echo "❌ AI connection test returned error"
fi