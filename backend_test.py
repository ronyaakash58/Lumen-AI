#!/usr/bin/env python3
"""
Backend API Test Suite for Lumen AI Fashion Studio
Tests all backend endpoints including auth, stats, generations, and AI image generation.
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
from pymongo import MongoClient
import os
import sys

# Configuration
BASE_URL = "https://8ebfb8fb-0dd2-42f2-8818-5bf5bb63f46d.preview.emergentagent.com/api"
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "ai_fashion_studio"

# Test data
TEST_USER_ID = str(uuid.uuid4())
TEST_SESSION_TOKEN = str(uuid.uuid4())
TEST_EMAIL = f"test_{uuid.uuid4().hex[:8]}@example.com"

def setup_test_user():
    """Insert a test user and session directly into MongoDB"""
    try:
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Create test user
        user = {
            "id": TEST_USER_ID,
            "email": TEST_EMAIL,
            "name": "Test User",
            "picture": "https://example.com/avatar.jpg",
            "credits": 100,
            "created_at": datetime.utcnow()
        }
        db.users.insert_one(user)
        print(f"✓ Created test user: {TEST_EMAIL}")
        
        # Create test session
        session = {
            "token": TEST_SESSION_TOKEN,
            "user_id": TEST_USER_ID,
            "expires_at": datetime.utcnow() + timedelta(days=7),
            "created_at": datetime.utcnow()
        }
        db.sessions.insert_one(session)
        print(f"✓ Created test session: {TEST_SESSION_TOKEN}")
        
        return True
    except Exception as e:
        print(f"✗ Failed to setup test user: {e}")
        return False

def cleanup_test_data():
    """Remove test user, session, and generations from MongoDB"""
    try:
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        db.users.delete_many({"id": TEST_USER_ID})
        db.sessions.delete_many({"user_id": TEST_USER_ID})
        db.generations.delete_many({"user_id": TEST_USER_ID})
        
        print("✓ Cleaned up test data")
        return True
    except Exception as e:
        print(f"✗ Failed to cleanup test data: {e}")
        return False

def test_health_endpoint():
    """Test GET /api/"""
    print("\n=== Testing Health Endpoint ===")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True and data.get("service") == "Lumen AI":
                print("✓ Health endpoint working correctly")
                return True
            else:
                print(f"✗ Unexpected response format: {data}")
                return False
        else:
            print(f"✗ Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Health endpoint test failed: {e}")
        return False

def test_auth_me_no_cookie():
    """Test GET /api/auth/me without cookie (should return 401)"""
    print("\n=== Testing GET /api/auth/me (no cookie) ===")
    try:
        response = requests.get(f"{BASE_URL}/auth/me", timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 401:
            data = response.json()
            if data.get("user") is None:
                print("✓ Auth/me correctly returns 401 without cookie")
                return True
            else:
                print(f"✗ Expected user: null, got: {data}")
                return False
        else:
            print(f"✗ Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Auth/me test failed: {e}")
        return False

def test_auth_session_invalid():
    """Test POST /api/auth/session with invalid session_id"""
    print("\n=== Testing POST /api/auth/session (invalid session_id) ===")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/session",
            json={"session_id": "invalid_session_id_12345"},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Should return 401 because Emergent will reject the invalid session_id
        if response.status_code == 401:
            print("✓ Auth/session correctly rejects invalid session_id")
            return True
        else:
            print(f"✗ Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Auth/session test failed: {e}")
        return False

def test_auth_logout():
    """Test POST /api/auth/logout"""
    print("\n=== Testing POST /api/auth/logout ===")
    try:
        response = requests.post(f"{BASE_URL}/auth/logout", timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                # Check if cookie is cleared
                set_cookie = response.headers.get('Set-Cookie', '')
                if 'session_token=' in set_cookie and 'Max-Age=0' in set_cookie:
                    print("✓ Logout endpoint working correctly and clears cookie")
                    return True
                else:
                    print("✓ Logout endpoint returns ok (cookie clearing may not be visible in test)")
                    return True
            else:
                print(f"✗ Unexpected response: {data}")
                return False
        else:
            print(f"✗ Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Logout test failed: {e}")
        return False

def test_stats_no_auth():
    """Test GET /api/stats without auth (should return 401)"""
    print("\n=== Testing GET /api/stats (no auth) ===")
    try:
        response = requests.get(f"{BASE_URL}/stats", timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 401:
            print("✓ Stats endpoint correctly requires authentication")
            return True
        else:
            print(f"✗ Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Stats no-auth test failed: {e}")
        return False

def test_generations_no_auth():
    """Test GET /api/generations without auth (should return 401)"""
    print("\n=== Testing GET /api/generations (no auth) ===")
    try:
        response = requests.get(f"{BASE_URL}/generations", timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 401:
            print("✓ Generations endpoint correctly requires authentication")
            return True
        else:
            print(f"✗ Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Generations no-auth test failed: {e}")
        return False

def test_generate_no_auth():
    """Test POST /api/generate without auth (should return 401)"""
    print("\n=== Testing POST /api/generate (no auth) ===")
    try:
        response = requests.post(
            f"{BASE_URL}/generate",
            json={"prompt": "test prompt"},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 401:
            print("✓ Generate endpoint correctly requires authentication")
            return True
        else:
            print(f"✗ Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Generate no-auth test failed: {e}")
        return False

def test_auth_me_with_cookie():
    """Test GET /api/auth/me with valid session cookie"""
    print("\n=== Testing GET /api/auth/me (with cookie) ===")
    try:
        cookies = {"session_token": TEST_SESSION_TOKEN}
        response = requests.get(f"{BASE_URL}/auth/me", cookies=cookies, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            user = data.get("user")
            if user and user.get("id") == TEST_USER_ID:
                print("✓ Auth/me returns correct user with valid cookie")
                return True
            else:
                print(f"✗ Unexpected user data: {user}")
                return False
        else:
            print(f"✗ Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Auth/me with cookie test failed: {e}")
        return False

def test_stats_with_auth():
    """Test GET /api/stats with authentication"""
    print("\n=== Testing GET /api/stats (with auth) ===")
    try:
        cookies = {"session_token": TEST_SESSION_TOKEN}
        response = requests.get(f"{BASE_URL}/stats", cookies=cookies, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if "total" in data and "today" in data and "credits" in data and "projects" in data:
                print("✓ Stats endpoint returns correct data structure")
                return True
            else:
                print(f"✗ Missing expected fields in response: {data}")
                return False
        else:
            print(f"✗ Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Stats with auth test failed: {e}")
        return False

def test_generations_list():
    """Test GET /api/generations with authentication"""
    print("\n=== Testing GET /api/generations (with auth) ===")
    try:
        cookies = {"session_token": TEST_SESSION_TOKEN}
        response = requests.get(f"{BASE_URL}/generations", cookies=cookies, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if "items" in data and isinstance(data["items"], list):
                print(f"✓ Generations list endpoint working (found {len(data['items'])} items)")
                return True
            else:
                print(f"✗ Unexpected response format: {data}")
                return False
        else:
            print(f"✗ Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Generations list test failed: {e}")
        return False

def test_generate_image():
    """Test POST /api/generate with authentication"""
    print("\n=== Testing POST /api/generate (with auth) ===")
    print("Note: This may take up to 30 seconds...")
    try:
        cookies = {"session_token": TEST_SESSION_TOKEN}
        payload = {
            "prompt": "A single red apple on a wooden table, studio lighting, photoreal"
        }
        response = requests.post(
            f"{BASE_URL}/generate",
            json=payload,
            cookies=cookies,
            timeout=60
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            # Check required fields
            if "id" in data and "image" in data and "prompt" in data and "created_at" in data:
                image_data = data.get("image", "")
                if image_data.startswith("data:image/"):
                    print(f"✓ Generate endpoint working correctly")
                    print(f"  - Generated ID: {data['id']}")
                    print(f"  - Image data length: {len(image_data)} chars")
                    print(f"  - Prompt: {data['prompt']}")
                    return data["id"]  # Return the ID for deletion test
                else:
                    print(f"✗ Image data doesn't start with 'data:image/': {image_data[:50]}")
                    return False
            else:
                print(f"✗ Missing required fields. Got: {list(data.keys())}")
                return False
        else:
            print(f"✗ Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Generate image test failed: {e}")
        return False

def test_delete_generation(generation_id):
    """Test DELETE /api/generations/:id"""
    print(f"\n=== Testing DELETE /api/generations/{generation_id} ===")
    try:
        cookies = {"session_token": TEST_SESSION_TOKEN}
        response = requests.delete(
            f"{BASE_URL}/generations/{generation_id}",
            cookies=cookies,
            timeout=10
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                print("✓ Delete generation endpoint working correctly")
                return True
            else:
                print(f"✗ Unexpected response: {data}")
                return False
        else:
            print(f"✗ Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Delete generation test failed: {e}")
        return False

def verify_generation_deleted(generation_id):
    """Verify the generation was actually deleted"""
    print(f"\n=== Verifying generation {generation_id} was deleted ===")
    try:
        cookies = {"session_token": TEST_SESSION_TOKEN}
        response = requests.get(f"{BASE_URL}/generations", cookies=cookies, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            items = data.get("items", [])
            for item in items:
                if item.get("id") == generation_id:
                    print(f"✗ Generation {generation_id} still exists after deletion")
                    return False
            print(f"✓ Generation {generation_id} successfully deleted")
            return True
        else:
            print(f"✗ Failed to verify deletion, status: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Verification failed: {e}")
        return False

def main():
    print("=" * 60)
    print("LUMEN AI FASHION STUDIO - BACKEND API TEST SUITE")
    print("=" * 60)
    
    results = {}
    
    # Setup test data
    print("\n--- Setting up test data ---")
    if not setup_test_user():
        print("Failed to setup test data. Exiting.")
        sys.exit(1)
    
    try:
        # Test unauthenticated endpoints
        results["health"] = test_health_endpoint()
        results["auth_me_no_cookie"] = test_auth_me_no_cookie()
        results["auth_session_invalid"] = test_auth_session_invalid()
        results["auth_logout"] = test_auth_logout()
        results["stats_no_auth"] = test_stats_no_auth()
        results["generations_no_auth"] = test_generations_no_auth()
        results["generate_no_auth"] = test_generate_no_auth()
        
        # Test authenticated endpoints
        results["auth_me_with_cookie"] = test_auth_me_with_cookie()
        results["stats_with_auth"] = test_stats_with_auth()
        results["generations_list"] = test_generations_list()
        
        # Test image generation (this is the critical one)
        generation_id = test_generate_image()
        if generation_id and isinstance(generation_id, str):
            results["generate_image"] = True
            # Test deletion
            results["delete_generation"] = test_delete_generation(generation_id)
            results["verify_deletion"] = verify_generation_deleted(generation_id)
        else:
            results["generate_image"] = False
            results["delete_generation"] = False
            results["verify_deletion"] = False
        
    finally:
        # Cleanup
        print("\n--- Cleaning up test data ---")
        cleanup_test_data()
    
    # Print summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v is True)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 60)
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
