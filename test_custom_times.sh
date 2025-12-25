#!/bin/bash
# Custom Shift Times - End-to-End Validation Test
# Run this script to validate the feature works correctly

echo "════════════════════════════════════════════════════════════════"
echo "  CUSTOM SHIFT TIMES - VALIDATION TEST"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check public API returns exception data
echo "Test 1: Fetching current exceptions from API..."
response=$(curl -s http://localhost:3001/api/v1/public/schedule-exceptions)
echo "$response" | jq '.'

exceptions_count=$(echo "$response" | jq '.data | length')
echo ""
echo "Found $exceptions_count exception(s)"
echo ""

# Test 2: Check if custom time fields exist
echo "Test 2: Verifying custom time fields are included in API response..."
has_time_fields=$(echo "$response" | jq '.data[0] | has("morning_start_time")')

if [ "$has_time_fields" = "true" ]; then
    echo -e "${GREEN}✓ PASS${NC} - Custom time fields present in API response"
else
    echo -e "${RED}✗ FAIL${NC} - Custom time fields missing from API response"
fi
echo ""

# Test 3: Display each exception with details
echo "Test 3: Exception Details:"
echo "────────────────────────────────────────────────────────"
echo "$response" | jq -r '.data[] | 
"Date: \(.date)
Morning: \(if .is_morning_open then 
    if .morning_start_time and .morning_end_time then 
        "OPEN - \(.morning_start_time) to \(.morning_end_time)" 
    else 
        "OPEN (global times)" 
    end 
else 
    "CLOSED" 
end)
Evening: \(if .is_evening_open then 
    if .evening_start_time and .evening_end_time then 
        "OPEN - \(.evening_start_time) to \(.evening_end_time)" 
    else 
        "OPEN (global times)" 
    end 
else 
    "CLOSED" 
end)
────────────────────────────────────────────────────────────"'

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  MANUAL TESTING STEPS"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "1. Go to: http://localhost:5173/admin/settings"
echo "   - Scroll to 'Date-Specific Exceptions'"
echo "   - Delete Dec 25 exception (click trash icon)"
echo ""
echo "2. Create NEW exception for Dec 26:"
echo "   - Date: 12/26/2025"
echo "   - Morning Shift: ON"
echo "     └─ Start Time: 10 : 00 AM"
echo "     └─ End Time: 12 : 30 PM"
echo "   - Evening Shift: OFF"
echo "   - Click 'Add Exception'"
echo ""
echo "3. Verify in exception list:"
echo "   - Shows 'Thursday 26 December 2025'"
echo "   - Morning: 10:00 AM - 12:30 PM (with orange dot)"
echo "   - Evening: Closed"
echo ""
echo "4. Go to: http://localhost:5173/book-appointment"
echo "   - Select Service"
echo "   - Select Date: Dec 26, 2025"
echo "   - Verify Morning shows: 10:00 AM - 12:30 PM"
echo "   - Verify Evening shows: Not Available"
echo ""
echo "5. Re-run this script to verify API captured the changes"
echo ""
echo "════════════════════════════════════════════════════════════════"
