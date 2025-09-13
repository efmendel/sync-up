#!/usr/bin/env python3
"""
Test script for the Music Query Parser
Includes sample queries and automated testing
"""

import requests
import json
import sys
import time

# Configuration
BASE_URL = "http://localhost:5001"

# Sample test queries with expected outputs
TEST_QUERIES = [
    {
        "query": "find a female vocalist in brooklyn who rehearses twice a week and sings like amy winehouse",
        "expected_fields": ["instruments", "gender", "location", "availability", "musical_influences"],
        "expected_values": {
            "gender": "female",
            "location": "Brooklyn"
        }
    },
    {
        "query": "looking for a bass player in los angeles for session work, preferably someone who sounds like flea",
        "expected_fields": ["instruments", "collaboration_intent", "location", "musical_influences"],
        "expected_values": {
            "instruments": ["bass"],
            "location": "Los Angeles",
            "collaboration_intent": "session work"
        }
    },
    {
        "query": "drummer needed for indie rock band, must be available 3 times a week, bonham style",
        "expected_fields": ["instruments", "availability", "musical_influences", "collaboration_intent"],
        "expected_values": {
            "instruments": ["drums"]
        }
    },
    {
        "query": "pianist seeking duo partner in nashville, jazz influenced, evening rehearsals",
        "expected_fields": ["instruments", "location", "collaboration_intent"],
        "expected_values": {
            "instruments": ["piano"],
            "location": "Nashville"
        }
    },
    {
        "query": "male guitarist in chicago looking for metal band, available weekends",
        "expected_fields": ["instruments", "gender", "location", "collaboration_intent"],
        "expected_values": {
            "gender": "male",
            "instruments": ["guitar"],
            "location": "Chicago"
        }
    }
]

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            health_data = response.json()
            print("✅ Health check passed")
            print(f"   OpenAI available: {health_data['services']['openai']}")
            print(f"   spaCy available: {health_data['services']['spacy']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_parse_query(query_data):
    """Test parsing a single query"""
    try:
        response = requests.post(
            f"{BASE_URL}/parse",
            json={"query": query_data["query"]},
            headers={"Content-Type": "application/json"}
        )

        if response.status_code != 200:
            print(f"❌ Query failed with status {response.status_code}")
            return False

        result = response.json()

        # Check if required fields are present
        missing_fields = []
        for field in query_data["expected_fields"]:
            if field not in result:
                missing_fields.append(field)

        if missing_fields:
            print(f"❌ Missing fields: {missing_fields}")
            return False

        # Check expected values
        for key, expected_value in query_data["expected_values"].items():
            if key in result and result[key] != expected_value:
                print(f"❌ Field '{key}': expected {expected_value}, got {result[key]}")
                return False

        print("✅ Query parsed successfully")
        print(f"   Parsed by: {result.get('parsed_by', 'unknown')}")
        print(f"   Confidence: {result.get('confidence', 'unknown')}")

        return True

    except Exception as e:
        print(f"❌ Parse error: {e}")
        return False

def test_examples_endpoint():
    """Test examples endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/examples")
        if response.status_code == 200:
            examples_data = response.json()
            print(f"✅ Examples endpoint works ({len(examples_data['examples'])} examples)")
            return True
        else:
            print(f"❌ Examples endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Examples endpoint error: {e}")
        return False

def test_error_handling():
    """Test error handling"""
    error_tests = [
        {"json": {}, "description": "Empty JSON"},
        {"json": {"query": ""}, "description": "Empty query"},
        {"json": {"query": "a" * 1001}, "description": "Query too long"},
        {"json": {"wrong_field": "test"}, "description": "Missing query field"}
    ]

    passed = 0
    for test in error_tests:
        try:
            response = requests.post(
                f"{BASE_URL}/parse",
                json=test["json"],
                headers={"Content-Type": "application/json"}
            )

            if response.status_code == 400:
                print(f"✅ Error handling: {test['description']}")
                passed += 1
            else:
                print(f"❌ Error handling failed: {test['description']} (got {response.status_code})")
        except Exception as e:
            print(f"❌ Error test failed: {test['description']} - {e}")

    return passed == len(error_tests)

def main():
    """Run all tests"""
    print("🎵 Testing Music Query Parser")
    print("=" * 50)

    # Test health endpoint
    if not test_health():
        print("Service is not running. Start with: python app.py")
        sys.exit(1)

    print("\n📝 Testing query parsing...")
    passed_queries = 0

    for i, query_data in enumerate(TEST_QUERIES, 1):
        print(f"\nTest {i}: {query_data['query'][:50]}...")
        if test_parse_query(query_data):
            passed_queries += 1
        time.sleep(0.5)  # Rate limiting

    print(f"\n📊 Query Tests: {passed_queries}/{len(TEST_QUERIES)} passed")

    # Test examples endpoint
    print("\n📚 Testing examples endpoint...")
    examples_ok = test_examples_endpoint()

    # Test error handling
    print("\n🛡️ Testing error handling...")
    errors_ok = test_error_handling()

    # Summary
    print("\n" + "=" * 50)
    print("📈 Test Summary:")
    print(f"   Health: {'✅' if True else '❌'}")
    print(f"   Queries: {passed_queries}/{len(TEST_QUERIES)} ({'✅' if passed_queries == len(TEST_QUERIES) else '❌'})")
    print(f"   Examples: {'✅' if examples_ok else '❌'}")
    print(f"   Error handling: {'✅' if errors_ok else '❌'}")

    if passed_queries == len(TEST_QUERIES) and examples_ok and errors_ok:
        print("\n🎉 All tests passed! Service is ready for deployment.")
        sys.exit(0)
    else:
        print("\n⚠️ Some tests failed. Please check the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()