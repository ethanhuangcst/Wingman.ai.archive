#!/bin/bash

echo "Testing login API..."
echo ""

# Test login with sample credentials
response=$(curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword","rememberMe":false}')

echo "Login API Response:"
echo "$response"
echo ""

# Check if response contains success: true
if echo "$response" | grep -q '"success":true'; then
  echo "✅ Login API is working correctly!"
  
  # Extract token
  token=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$token" ]; then
    echo "✅ Token received: ${token:0:50}..."
    
    # Test account API with token
    echo ""
    echo "Testing account API with token..."
    account_response=$(curl -X GET http://localhost:3000/api/account \
      -H "Authorization: Bearer $token" \
      -H "Cookie: auth-token=$token")
    
    echo "Account API Response:"
    echo "$account_response"
    echo ""
    
    if echo "$account_response" | grep -q '"success":true'; then
      echo "✅ Account API is working correctly!"
    else
      echo "❌ Account API returned error"
    fi
  fi
else
  echo "❌ Login API returned error"
fi