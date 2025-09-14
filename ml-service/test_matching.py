#!/usr/bin/env python3
"""
Test script for the music profile matching system
Tests functionality, performance, and accuracy
"""

import requests
import json
import time
from datetime import datetime
import statistics

# Configuration
BASE_URL = "http://localhost:5004"
PERFORMANCE_TARGET_MS = 500  # Target under 500ms

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/health")

    if response.status_code == 200:
        data = response.json()
        print(f"✅ Health check passed")
        print(f"   - Profile count: {data.get('profile_count', 0)}")
        print(f"   - Services: {data.get('services', {})}")
        return True
    else:
        print(f"❌ Health check failed: {response.status_code}")
        return False

def test_quick_match_performance():
    """Test the /match/quick endpoint for performance"""
    print("\nTesting quick match performance...")

    test_queries = [
        "find a female vocalist in brooklyn who rehearses twice a week and sings like amy winehouse",
        "looking for a bass player in los angeles for session work, preferably someone who sounds like flea",
        "drummer needed for indie rock band, must be available 3 times a week, bonham style",
        "pianist seeking duo partner in nashville, jazz influenced, evening rehearsals",
        "guitar player in seattle for weekend gigs, blues rock style"
    ]

    processing_times = []

    for i, query in enumerate(test_queries, 1):
        print(f"  Query {i}: {query[:50]}...")

        start_time = time.time()
        response = requests.post(f"{BASE_URL}/match/quick", json={
            "query": query,
            "min_compatibility": 0.6,
            "max_results": 10
        })
        end_time = time.time()

        total_time_ms = (end_time - start_time) * 1000
        processing_times.append(total_time_ms)

        if response.status_code == 200:
            data = response.json()
            matches_found = data.get('total_found', 0)
            reported_time = data.get('processing_time', {}).get('total_ms', 0)

            print(f"    ✅ Response time: {total_time_ms:.1f}ms (reported: {reported_time:.1f}ms)")
            print(f"    📊 Matches found: {matches_found}")

            if total_time_ms <= PERFORMANCE_TARGET_MS:
                print(f"    🎯 Performance target met!")
            else:
                print(f"    ⚠️  Above {PERFORMANCE_TARGET_MS}ms target")
        else:
            print(f"    ❌ Request failed: {response.status_code}")

    if processing_times:
        avg_time = statistics.mean(processing_times)
        min_time = min(processing_times)
        max_time = max(processing_times)

        print(f"\n📈 Performance Summary:")
        print(f"   Average: {avg_time:.1f}ms")
        print(f"   Min: {min_time:.1f}ms")
        print(f"   Max: {max_time:.1f}ms")
        print(f"   Target: {PERFORMANCE_TARGET_MS}ms")

        if avg_time <= PERFORMANCE_TARGET_MS:
            print(f"   🎯 Average performance target MET!")
        else:
            print(f"   ❌ Average performance target MISSED")

    return processing_times

def test_compatibility_scoring():
    """Test the compatibility scoring algorithm"""
    print("\nTesting compatibility scoring...")

    # Test high compatibility case
    high_compat_query = {
        "query": "looking for a female vocalist in brooklyn who rehearses twice a week and sings like amy winehouse",
        "min_compatibility": 0.5,
        "max_results": 5
    }

    response = requests.post(f"{BASE_URL}/match/quick", json=high_compat_query)

    if response.status_code == 200:
        data = response.json()
        matches = data.get('matches', [])

        if matches:
            best_match = matches[0]
            compatibility = best_match.get('compatibility_score', 0)
            profile = best_match.get('profile', {})
            explanation = best_match.get('explanation', '')

            print(f"✅ Best match found:")
            print(f"   - Name: {profile.get('name', 'Unknown')}")
            print(f"   - Compatibility: {compatibility:.3f}")
            print(f"   - Location: {profile.get('location', 'Unknown')}")
            print(f"   - Instruments: {', '.join(profile.get('instruments', []))}")
            print(f"   - Explanation: {explanation}")

            # Check if we found someone with Amy Winehouse influence
            influences = [inf.lower() for inf in profile.get('musical_influences', [])]
            if 'amy winehouse' in influences:
                print(f"   🎯 Found exact influence match!")

            return compatibility >= 0.7
        else:
            print("❌ No matches found for high compatibility test")
            return False
    else:
        print(f"❌ Compatibility test failed: {response.status_code}")
        return False

def test_geographic_filtering():
    """Test geographic distance calculation"""
    print("\nTesting geographic filtering...")

    # Test location-specific query
    brooklyn_query = {
        "query": "drummer in brooklyn",
        "min_compatibility": 0.4,
        "max_results": 10
    }

    response = requests.post(f"{BASE_URL}/match/quick", json=brooklyn_query)

    if response.status_code == 200:
        data = response.json()
        matches = data.get('matches', [])

        brooklyn_matches = 0
        ny_matches = 0

        for match in matches:
            location = match.get('profile', {}).get('location', '').lower()
            if 'brooklyn' in location:
                brooklyn_matches += 1
            elif 'ny' in location or 'new york' in location:
                ny_matches += 1

        print(f"✅ Location filtering results:")
        print(f"   - Total matches: {len(matches)}")
        print(f"   - Brooklyn matches: {brooklyn_matches}")
        print(f"   - NY area matches: {ny_matches}")

        return brooklyn_matches > 0 or ny_matches > 0
    else:
        print(f"❌ Geographic test failed: {response.status_code}")
        return False

def test_instrument_compatibility():
    """Test instrument compatibility matching"""
    print("\nTesting instrument compatibility...")

    # Test for complementary instruments
    rhythm_query = {
        "query": "looking for a bassist to complete our band, we have guitar and drums",
        "min_compatibility": 0.5,
        "max_results": 10
    }

    response = requests.post(f"{BASE_URL}/match/quick", json=rhythm_query)

    if response.status_code == 200:
        data = response.json()
        matches = data.get('matches', [])

        bass_players = 0
        for match in matches:
            instruments = match.get('profile', {}).get('instruments', [])
            if any('bass' in inst.lower() for inst in instruments):
                bass_players += 1

        print(f"✅ Instrument compatibility results:")
        print(f"   - Total matches: {len(matches)}")
        print(f"   - Bass players found: {bass_players}")

        return bass_players > 0
    else:
        print(f"❌ Instrument compatibility test failed: {response.status_code}")
        return False

def test_profiles_endpoint():
    """Test the profiles browsing endpoint"""
    print("\nTesting profiles endpoint...")

    # Test basic profiles fetch
    response = requests.get(f"{BASE_URL}/profiles?limit=10")

    if response.status_code == 200:
        data = response.json()
        profiles = data.get('profiles', [])

        print(f"✅ Profiles endpoint working:")
        print(f"   - Retrieved: {len(profiles)} profiles")

        # Test filtering
        response = requests.get(f"{BASE_URL}/profiles?instrument=guitar&limit=5")
        if response.status_code == 200:
            guitar_data = response.json()
            guitar_profiles = guitar_data.get('profiles', [])
            print(f"   - Guitar players: {len(guitar_profiles)}")

            # Verify filtering worked
            for profile in guitar_profiles:
                instruments = profile.get('instruments', [])
                has_guitar = any('guitar' in inst.lower() for inst in instruments)
                if not has_guitar:
                    print(f"   ⚠️  Non-guitar player found in filtered results")
                    return False

            return True
        else:
            print(f"❌ Filtering test failed: {response.status_code}")
            return False
    else:
        print(f"❌ Profiles endpoint failed: {response.status_code}")
        return False

def run_comprehensive_test():
    """Run all tests and provide summary"""
    print("🎵 Starting Comprehensive Music Profile Matching System Test")
    print("=" * 70)

    test_results = []

    # Run all tests
    test_results.append(("Health Check", test_health_check()))

    performance_times = test_quick_match_performance()
    test_results.append(("Performance", len(performance_times) > 0 and statistics.mean(performance_times) <= PERFORMANCE_TARGET_MS))

    test_results.append(("Compatibility Scoring", test_compatibility_scoring()))
    test_results.append(("Geographic Filtering", test_geographic_filtering()))
    test_results.append(("Instrument Compatibility", test_instrument_compatibility()))
    test_results.append(("Profiles Endpoint", test_profiles_endpoint()))

    # Summary
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)

    passed = 0
    total = len(test_results)

    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:.<40} {status}")
        if result:
            passed += 1

    print("-" * 70)
    print(f"Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")

    if passed == total:
        print("🎉 ALL TESTS PASSED! System ready for production.")
    else:
        print("⚠️  Some tests failed. Review implementation.")

    return passed == total

def test_edge_cases():
    """Test edge cases and error handling"""
    print("\nTesting edge cases...")

    # Empty query
    response = requests.post(f"{BASE_URL}/match/quick", json={"query": ""})
    print(f"Empty query: {response.status_code} (should be 400)")

    # Very long query
    long_query = "a" * 1001
    response = requests.post(f"{BASE_URL}/match/quick", json={"query": long_query})
    print(f"Long query: {response.status_code} (should be 400)")

    # Invalid min_compatibility
    response = requests.post(f"{BASE_URL}/match", json={
        "instruments": ["guitar"],
        "min_compatibility": 1.5
    })
    print(f"Invalid min_compatibility: {response.status_code} (should be 400)")

    # Non-existent profile
    response = requests.get(f"{BASE_URL}/profiles/nonexistent")
    print(f"Non-existent profile: {response.status_code} (should be 404)")

if __name__ == "__main__":
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print("❌ Server not responding properly. Please start the Flask app first:")
            print("   cd ml-service && python app.py")
            exit(1)
    except requests.RequestException:
        print("❌ Cannot connect to server. Please start the Flask app first:")
        print("   cd ml-service && python app.py")
        exit(1)

    # Run all tests
    success = run_comprehensive_test()

    # Run edge case tests
    test_edge_cases()

    exit(0 if success else 1)