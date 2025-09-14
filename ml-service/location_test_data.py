"""
Sample location data and test cases for NYC Location Intelligence System
"""

# Sample queries to test location parsing
SAMPLE_QUERIES = [
    # Manhattan neighborhoods
    "looking for musicians in lower east side",
    "need a drummer in the village",
    "guitarist in soho area",
    "vocalist near times square",
    "bassist in upper west side",
    "pianist in harlem",

    # Brooklyn neighborhoods
    "drummer in williamsburg",
    "singer in park slope",
    "guitarist in dumbo",
    "bassist in bed stuy",
    "keyboardist in brooklyn heights",

    # Queens neighborhoods
    "musician in astoria",
    "drummer in long island city",
    "vocalist in flushing",
    "guitarist in jackson heights",

    # Bronx neighborhoods
    "bassist in south bronx",
    "pianist in fordham",
    "drummer in riverdale",

    # Borough-level queries
    "musicians in brooklyn",
    "band members in manhattan",
    "singers in queens",
    "drummers in the bronx",

    # City-level queries
    "musicians in nyc",
    "band in new york city",
    "players in ny",

    # Alias variations
    "musicians in les", # Lower East Side
    "band in bk", # Brooklyn
    "players in lic", # Long Island City
    "singers in ev", # East Village
]

# Expected proximity relationships for testing
PROXIMITY_TEST_CASES = [
    {
        "location1": "lower east side",
        "location2": "east village",
        "expected_score_range": [85, 100],
        "description": "Adjacent Manhattan neighborhoods"
    },
    {
        "location1": "williamsburg",
        "location2": "lower east side",
        "expected_score_range": [75, 90],
        "description": "Brooklyn to Manhattan - close subway connection"
    },
    {
        "location1": "astoria",
        "location2": "long island city",
        "expected_score_range": [85, 100],
        "description": "Adjacent Queens neighborhoods"
    },
    {
        "location1": "brooklyn",
        "location2": "park slope",
        "expected_score_range": [60, 80],
        "description": "Borough to neighborhood within that borough"
    },
    {
        "location1": "manhattan",
        "location2": "queens",
        "expected_score_range": [40, 70],
        "description": "Different boroughs"
    },
    {
        "location1": "bronx",
        "location2": "staten island",
        "expected_score_range": [5, 30],
        "description": "Most distant boroughs"
    },
    {
        "location1": "nyc",
        "location2": "williamsburg",
        "expected_score_range": [30, 60],
        "description": "City to neighborhood"
    }
]

# Sample profile locations for testing integration
SAMPLE_PROFILE_LOCATIONS = [
    "Lower East Side, NY",
    "Williamsburg, Brooklyn",
    "East Village, Manhattan",
    "Astoria, Queens",
    "Park Slope, Brooklyn",
    "SoHo, NY",
    "Long Island City, Queens",
    "DUMBO, Brooklyn",
    "Upper West Side, Manhattan",
    "Greenpoint, Brooklyn",
    "Harlem, NY",
    "Sunnyside, Queens",
    "Brooklyn Heights, Brooklyn",
    "West Village, Manhattan",
    "Jackson Heights, Queens",
    "Prospect Heights, Brooklyn",
    "Midtown Manhattan",
    "Crown Heights, Brooklyn",
    "Flushing, Queens",
    "TriBeCa, Manhattan"
]

# Test musician profiles with NYC locations
TEST_MUSICIAN_PROFILES = [
    {
        "id": "test_001",
        "name": "Jazz Sarah",
        "instruments": ["vocals", "piano"],
        "location": "Lower East Side, NY",
        "genres": ["jazz", "soul"],
        "collaboration_intent": "band formation"
    },
    {
        "id": "test_002",
        "name": "Rock Mike",
        "instruments": ["guitar", "vocals"],
        "location": "Williamsburg, Brooklyn",
        "genres": ["rock", "indie"],
        "collaboration_intent": "band formation"
    },
    {
        "id": "test_003",
        "name": "Electronic Emma",
        "instruments": ["synthesizer", "vocals"],
        "location": "East Village, Manhattan",
        "genres": ["electronic", "ambient"],
        "collaboration_intent": "recording/studio work"
    },
    {
        "id": "test_004",
        "name": "Blues Bobby",
        "instruments": ["bass", "harmonica"],
        "location": "Astoria, Queens",
        "genres": ["blues", "jazz"],
        "collaboration_intent": "one-time gig"
    },
    {
        "id": "test_005",
        "name": "Folk Fiona",
        "instruments": ["acoustic guitar", "vocals"],
        "location": "Park Slope, Brooklyn",
        "genres": ["folk", "indie"],
        "collaboration_intent": "band formation"
    }
]

def run_location_tests():
    """Run basic tests on location intelligence"""
    from location_intelligence import NYCLocationIntelligence

    intel = NYCLocationIntelligence()

    print("🗺️  Running NYC Location Intelligence Tests")
    print("=" * 50)

    # Test 1: Location Parsing
    print("\n1. Testing Location Parsing:")
    test_locations = ["lower east side", "williamsburg", "brooklyn", "nyc", "astoria"]

    for location in test_locations:
        parsed = intel.parse_location(location)
        if parsed:
            print(f"   ✅ '{location}' → {parsed['data']['name']} ({parsed['type']})")
        else:
            print(f"   ❌ '{location}' → Could not parse")

    # Test 2: Proximity Scoring
    print("\n2. Testing Proximity Scoring:")
    for test_case in PROXIMITY_TEST_CASES[:5]:  # Test first 5 cases
        score = intel.get_proximity_score(test_case["location1"], test_case["location2"])
        min_score, max_score = test_case["expected_score_range"]

        if min_score <= score <= max_score:
            print(f"   ✅ {test_case['location1']} ↔ {test_case['location2']}: {score} (expected {min_score}-{max_score})")
        else:
            print(f"   ⚠️ {test_case['location1']} ↔ {test_case['location2']}: {score} (expected {min_score}-{max_score})")

    # Test 3: Nearby Neighborhoods
    print("\n3. Testing Nearby Neighborhoods:")
    test_location = "lower east side"
    nearby = intel.get_nearby_neighborhoods(test_location, min_score=50)

    print(f"   📍 Neighborhoods near '{test_location}':")
    for area in nearby[:5]:  # Show top 5
        print(f"      • {area['neighborhood']} ({area['borough']}) - Score: {area['proximity_score']}")

    # Test 4: System Stats
    print("\n4. System Statistics:")
    stats = intel.get_location_stats()
    print(f"   📊 Total neighborhoods: {stats['total_neighborhoods']}")
    print(f"   📊 Total aliases: {stats['total_aliases']}")
    print(f"   📊 Boroughs covered: {', '.join(stats['boroughs'].keys())}")

    print("\n✅ Location Intelligence Tests Complete!")
    return True

if __name__ == "__main__":
    run_location_tests()