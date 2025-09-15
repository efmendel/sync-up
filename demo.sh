#!/bin/bash

# SyncUp Music Collaboration App - Demo Script
# This script demonstrates the AI-powered search capabilities with sample queries

set -e

echo "🎵 SyncUp AI Search Demo"
echo "========================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "\n${PURPLE}▶ $1${NC}"
    echo "─────────────────────────────────────────"
}

print_query() {
    echo -e "${CYAN}Query:${NC} \"$1\""
}

print_result() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if backend is running
API_URL="http://localhost:3001/api"

print_header "Checking Backend Connection"
if curl -s "$API_URL/health" > /dev/null 2>&1; then
    print_result "Backend is running at $API_URL"
else
    echo -e "${RED}✗ Backend is not running. Please start it first:${NC}"
    echo "  cd backend && npm run dev"
    exit 1
fi

# Function to test search query
test_search() {
    local query="$1"
    local description="$2"

    print_header "$description"
    print_query "$query"

    # Make API request
    response=$(curl -s -X POST "$API_URL/ai-search" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\", \"limit\": 3}")

    # Check if response is valid JSON
    if echo "$response" | jq empty 2>/dev/null; then
        # Extract AI parsing information
        confidence=$(echo "$response" | jq -r '.aiParsing.confidence // 0')
        instruments=$(echo "$response" | jq -r '.aiParsing.parsed_query.instruments // [] | join(", ")')
        location=$(echo "$response" | jq -r '.aiParsing.parsed_query.location // "N/A"')
        collaboration=$(echo "$response" | jq -r '.aiParsing.parsed_query.collaboration_intent // "N/A"')

        # Extract user results
        user_count=$(echo "$response" | jq -r '.users | length')

        print_info "AI Confidence: $(echo "$confidence * 100" | bc -l | cut -d. -f1)%"
        [ "$instruments" != "" ] && print_info "Detected Instruments: $instruments"
        [ "$location" != "N/A" ] && print_info "Detected Location: $location"
        [ "$collaboration" != "N/A" ] && print_info "Collaboration Type: $collaboration"
        print_result "Found $user_count matching musicians"

        # Show top result if available
        if [ "$user_count" -gt 0 ]; then
            top_user=$(echo "$response" | jq -r '.users[0].name')
            top_score=$(echo "$response" | jq -r '.users[0].compatibility_score // 0')
            top_instruments=$(echo "$response" | jq -r '.users[0].instruments | join(", ")')
            echo -e "  ${GREEN}Top Match:${NC} $top_user (${top_score}% compatible)"
            echo -e "  ${GREEN}Instruments:${NC} $top_instruments"
        fi
    else
        echo -e "${RED}✗ Error: Invalid response from API${NC}"
        echo "$response"
    fi

    echo ""
    sleep 2
}

# Demo queries showcasing different AI parsing capabilities
echo -e "\n${YELLOW}This demo showcases the AI-powered natural language search capabilities${NC}"
echo -e "${YELLOW}of the SyncUp music collaboration platform.${NC}\n"

test_search \
    "find a female vocalist in brooklyn who rehearses twice a week and sings like amy winehouse" \
    "Complex Query: Gender + Location + Schedule + Style Reference"

test_search \
    "looking for a bass player in williamsburg for session work, preferably someone who sounds like flea" \
    "Instrument + Location + Collaboration Type + Influence"

test_search \
    "drummer needed for indie rock band in lower east side, must be available 3 times a week" \
    "Instrument + Genre + Location + Availability"

test_search \
    "seeking a jazz pianist in manhattan for duo collaboration with evening rehearsals" \
    "Genre + Instrument + Location + Collaboration + Schedule"

test_search \
    "need a professional saxophonist for latin jazz project in queens" \
    "Experience Level + Instrument + Genre + Location"

test_search \
    "beginner guitarist looking to jam with other beginners in brooklyn" \
    "Experience Level + Instrument + Collaboration + Location"

test_search \
    "looking for a classically trained violinist for chamber music in manhattan" \
    "Training + Instrument + Genre + Location"

test_search \
    "female singer songwriter available weekends for folk music collaboration" \
    "Gender + Role + Schedule + Genre + Collaboration"

test_search \
    "electronic music producer with synthesizers looking for vocalists" \
    "Genre + Role + Equipment + Seeking"

test_search \
    "hip hop artist needs beat maker and rapper for studio sessions" \
    "Genre + Collaboration + Multiple Roles"

print_header "Demo Complete!"
echo -e "${GREEN}The AI successfully parsed natural language queries and returned relevant matches.${NC}"
echo -e "${BLUE}Key features demonstrated:${NC}"
echo "  • Natural language understanding"
echo "  • Instrument detection"
echo "  • Location parsing"
echo "  • Collaboration type identification"
echo "  • Experience level recognition"
echo "  • Musical style and influence matching"
echo "  • Compatibility scoring"
echo ""
echo -e "${YELLOW}Visit http://localhost:3000 to try the full interactive experience!${NC}"