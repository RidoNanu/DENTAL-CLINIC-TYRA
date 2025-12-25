#!/bin/bash

# REST API Manual Test Script
# Run this after getting a valid JWT token from frontend login

echo "🧪 REST API Manual Test Script"
echo "================================"
echo ""

# Check if JWT token is provided
if [ -z "$1" ]; then
    echo "❌ Error: JWT token required"
    echo ""
    echo "Usage: ./test_api.sh <JWT_TOKEN>"
    echo ""
    echo "To get JWT token:"
    echo "1. Login at http://localhost:5174/admin/login"
    echo "2. Open browser console"
    echo "3. Run: supabase.auth.getSession().then(s => console.log(s.data.session.access_token))"
    echo "4. Copy the token"
    echo "5. Run: ./test_api.sh <TOKEN>"
    exit 1
fi

TOKEN="$1"
API="http://localhost:3001/api/v1"

echo "Using token: ${TOKEN:0:20}..."
echo ""

# Test 1: Health Check
echo "=== TEST 1: Health Check (No Auth) ==="
curl -s "$API/health" | jq
echo ""
echo ""

# Test 2: GET Patients (with Auth)
echo "=== TEST 2: GET /patients (With Valid JWT) ==="
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$API/patients" | jq
echo ""
echo ""

# Test 3: GET Services (No Auth - Public)
echo "=== TEST 3: GET /services (Public - No Auth) ==="
curl -s -w "\nHTTP Status: %{http_code}\n" \
  "$API/services" | jq
echo ""
echo ""

# Test 4: GET Appointments (with Auth)
echo "=== TEST 4: GET /appointments (With Valid JWT) ==="
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$API/appointments" | jq
echo ""
echo ""

# Test 5: POST Patient (with Auth)
echo "=== TEST 5: POST /patients (Create Patient) ==="
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient QA",
    "email": "qa.test@example.com",
    "phone": "+1234567890",
    "date_of_birth": "1990-01-01",
    "gender": "male"
  }' \
  "$API/patients" | jq
echo ""
echo ""

# Test 6: POST Service (with Auth)
echo "=== TEST 6: POST /services (Create Service) ==="
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "QA Test Service",
    "description": "Test service created by QA script",
    "duration_minutes": 30,
    "price": 500,
    "is_active": true
  }' \
  "$API/services" | jq
echo ""
echo ""

# Test 7: Invalid JWT (should fail)
echo "=== TEST 7: GET /patients with INVALID JWT ==="
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer invalid_token_12345" \
  "$API/patients" | jq
echo ""
echo ""

echo "✅ All tests completed!"
echo ""
echo "Summary:"
echo "- Tests 1, 3: Should return 200 OK"
echo "- Tests 2, 4, 5, 6: Should return 2xx if JWT is valid"
echo "- Test 7: Should return 401 Unauthorized"
