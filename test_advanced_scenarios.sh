#!/bin/bash
# Comprehensive Custom Shift Times Validation
# Tests: Normal Days, One-Shift Exceptions, Boundary Times

echo "════════════════════════════════════════════════════════════════"
echo "  CUSTOM SHIFT TIMES - COMPREHENSIVE VALIDATION SUITE"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fetch current schedule
echo -e "${BLUE}[INFO]${NC} Fetching global schedule settings..."
SCHEDULE=$(curl -s http://localhost:3001/api/v1/public/schedule)
echo "$SCHEDULE" | jq '.'
echo ""

MORNING_START=$(echo "$SCHEDULE" | jq -r '.data.morning_start // "07:00:00"')
MORNING_END=$(echo "$SCHEDULE" | jq -r '.data.morning_end // "13:00:00"')
EVENING_START=$(echo "$SCHEDULE" | jq -r '.data.evening_start // "16:00:00"')
EVENING_END=$(echo "$SCHEDULE" | jq -r '.data.evening_end // "20:00:00"')

echo -e "${BLUE}[INFO]${NC} Global Schedule Times:"
echo "  Morning: $MORNING_START - $MORNING_END"
echo "  Evening: $EVENING_START - $EVENING_END"
echo ""

# Fetch current exceptions
echo -e "${BLUE}[INFO]${NC} Fetching current exceptions..."
EXCEPTIONS=$(curl -s http://localhost:3001/api/v1/public/schedule-exceptions)
echo "$EXCEPTIONS" | jq '.'
echo ""

# Test Scenario 1: Normal Day (No Exception)
echo "════════════════════════════════════════════════════════════════"
echo -e "${YELLOW}SCENARIO 1: Normal Day (No Exception)${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Testing date: 2025-12-30 (should have NO exception)"
echo ""
echo "Expected Behavior:"
echo "  - Should fall back to GLOBAL schedule times"
echo "  - Morning: $MORNING_START - $MORNING_END"
echo "  - Evening: $EVENING_START - $EVENING_END"
echo ""

HAS_DEC30=$(echo "$EXCEPTIONS" | jq '.data[] | select(.date == "2025-12-30")')
if [ -z "$HAS_DEC30" ]; then
    echo -e "${GREEN}✓ PASS${NC} - No exception found for Dec 30 (expected)"
    echo -e "${YELLOW}→ MANUAL TEST REQUIRED:${NC}"
    echo "  1. Go to Book Appointment page"
    echo "  2. Select Dec 30, 2025"
    echo "  3. Verify Morning shows: $MORNING_START - $MORNING_END"
    echo "  4. Verify Evening shows: $EVENING_START - $EVENING_END"
else
    echo -e "${RED}✗ FAIL${NC} - Found unexpected exception for Dec 30"
    echo "$HAS_DEC30"
fi
echo ""

# Test Scenario 2: One-Shift Exception
echo "════════════════════════════════════════════════════════════════"
echo -e "${YELLOW}SCENARIO 2: One-Shift Exception (Evening Only)${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Test Case: Morning OFF, Evening Custom (17:00 - 20:00)"
echo ""
echo "Expected API Payload:"
cat << 'EOF'
{
  "date": "2025-12-27",
  "is_morning_open": false,
  "is_evening_open": true,
  "morning_start_time": null,
  "morning_end_time": null,
  "evening_start_time": "17:00:00",
  "evening_end_time": "20:00:00"
}
EOF
echo ""

HAS_DEC27=$(echo "$EXCEPTIONS" | jq '.data[] | select(.date == "2025-12-27")')
if [ -z "$HAS_DEC27" ]; then
    echo -e "${YELLOW}⏳ PENDING${NC} - No exception for Dec 27 yet"
    echo -e "${YELLOW}→ MANUAL SETUP REQUIRED:${NC}"
    echo "  1. Go to Admin Settings"
    echo "  2. Create exception for Dec 27:"
    echo "     - Morning: OFF"
    echo "     - Evening: ON, 5:00 PM - 8:00 PM"
else
    echo -e "${BLUE}[INFO]${NC} Found exception for Dec 27:"
    echo "$HAS_DEC27" | jq '.'
    
    IS_MORNING_OPEN=$(echo "$HAS_DEC27" | jq -r '.is_morning_open')
    IS_EVENING_OPEN=$(echo "$HAS_DEC27" | jq -r '.is_evening_open')
    EVENING_START_TIME=$(echo "$HAS_DEC27" | jq -r '.evening_start_time')
    EVENING_END_TIME=$(echo "$HAS_DEC27" | jq -r '.evening_end_time')
    
    if [ "$IS_MORNING_OPEN" == "false" ] && [ "$IS_EVENING_OPEN" == "true" ] && 
       [ "$EVENING_START_TIME" == "17:00:00" ] && [ "$EVENING_END_TIME" == "20:00:00" ]; then
        echo -e "${GREEN}✓ PASS${NC} - Exception data correct in API"
        echo -e "${YELLOW}→ MANUAL VERIFICATION:${NC}"
        echo "  1. Go to Book Appointment"
        echo "  2. Select Dec 27, 2025"
        echo "  3. Verify Morning shows: Not Available"
        echo "  4. Verify Evening shows: 5:00 PM - 8:00 PM"
    else
        echo -e "${RED}✗ FAIL${NC} - Exception data incorrect"
    fi
fi
echo ""

# Test Scenario 3: Boundary Times (12:00 PM/AM)
echo "════════════════════════════════════════════════════════════════"
echo -e "${YELLOW}SCENARIO 3: Boundary Time Test (12:00 PM/AM)${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Critical Times to Test:"
echo "  - 12:00 AM (00:00:00) → Should display as '12:00 AM'"
echo "  - 12:30 AM (00:30:00) → Should display as '12:30 AM'"
echo "  - 11:59 AM (11:59:00) → Should display as '11:59 AM'"
echo "  - 12:00 PM (12:00:00) → Should display as '12:00 PM'"
echo "  - 12:30 PM (12:30:00) → Should display as '12:30 PM'"
echo "  - 1:00 PM (13:00:00) → Should display as '1:00 PM'"
echo ""
echo "Test Exception Suggestion:"
cat << 'EOF'
{
  "date": "2025-12-28",
  "is_morning_open": true,
  "is_evening_open": false,
  "morning_start_time": "00:00:00",  ← Midnight
  "morning_end_time": "12:30:00",    ← 12:30 PM
  "evening_start_time": null,
  "evening_end_time": null
}
EOF
echo ""

HAS_DEC28=$(echo "$EXCEPTIONS" | jq '.data[] | select(.date == "2025-12-28")')
if [ -z "$HAS_DEC28" ]; then
    echo -e "${YELLOW}⏳ PENDING${NC} - No exception for Dec 28 yet"
    echo -e "${YELLOW}→ MANUAL SETUP REQUIRED:${NC}"
    echo "  1. Go to Admin Settings"
    echo "  2. Create exception for Dec 28:"
    echo "     - Morning: ON, 12:00 AM - 12:30 PM"
    echo "     - Evening: OFF"
    echo "  3. Verify no JS errors in console"
    echo "  4. Verify times display correctly"
else
    echo -e "${BLUE}[INFO]${NC} Found exception for Dec 28:"
    echo "$HAS_DEC28" | jq '.'
    
    MORNING_START_TIME=$(echo "$HAS_DEC28" | jq -r '.morning_start_time')
    MORNING_END_TIME=$(echo "$HAS_DEC28" | jq -r '.morning_end_time')
    
    if [ "$MORNING_START_TIME" == "00:00:00" ] && [ "$MORNING_END_TIME" == "12:30:00" ]; then
        echo -e "${GREEN}✓ PASS${NC} - Boundary times stored correctly in DB"
        echo -e "${YELLOW}→ MANUAL VERIFICATION:${NC}"
        echo "  1. Check Admin Settings exception list shows: 12:00 AM - 12:30 PM"
        echo "  2. Go to Book Appointment, select Dec 28"
        echo "  3. Verify Morning shows: 12:00 AM - 12:30 PM (NOT 0:00 AM)"
    else
        echo -e "${RED}✗ FAIL${NC} - Boundary times incorrect: $MORNING_START_TIME - $MORNING_END_TIME"
    fi
fi
echo ""

# Summary
echo "════════════════════════════════════════════════════════════════"
echo "  VALIDATION SUMMARY"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Run this script AFTER creating the test exceptions via UI."
echo ""
echo "Quick Setup Commands (copy to Supabase SQL Editor):"
echo ""
echo "-- Test Scenario 2: One-Shift Exception"
echo "-- (Or create via Admin UI)"
echo ""
echo "-- Test Scenario 3: Boundary Times"
echo "-- (Or create via Admin UI)  "
echo ""
echo "Re-run: ./test_advanced_scenarios.sh"
echo "════════════════════════════════════════════════════════════════"
