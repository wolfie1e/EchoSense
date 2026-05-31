#!/usr/bin/env python3
"""
Test script to verify EchoSense API endpoints are working correctly.
"""

import asyncio
import aiohttp
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

async def test_endpoint(session, endpoint, method="GET", data=None):
    """Test a single API endpoint."""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            async with session.get(url) as response:
                status = response.status
                content = await response.json()
        elif method == "POST":
            async with session.post(url, json=data) as response:
                status = response.status
                content = await response.json()
        
        if status == 200:
            print(f"✅ {method} {endpoint} - Status: {status}")
            return True, content
        else:
            print(f"❌ {method} {endpoint} - Status: {status}")
            return False, content
            
    except Exception as e:
        print(f"❌ {method} {endpoint} - Error: {e}")
        return False, None

async def main():
    """Main test function."""
    print("EchoSense API Test Suite")
    print("=" * 50)
    print(f"Testing API at: {BASE_URL}")
    print(f"Test started at: {datetime.now()}")
    print()
    
    async with aiohttp.ClientSession() as session:
        # Test endpoints
        endpoints = [
            ("/", "GET"),
            ("/api/health", "GET"),
            ("/api/stats", "GET"),
            ("/api/feed", "GET"),
            ("/api/trends", "GET"),
            ("/api/forecast", "GET"),
            ("/api/ai-responses", "GET"),
        ]
        
        results = []
        
        for endpoint, method in endpoints:
            success, content = await test_endpoint(session, endpoint, method)
            results.append((endpoint, success))
            
            # Show sample data for key endpoints
            if success and content and endpoint in ["/api/health", "/api/stats"]:
                print(f"   Sample data: {json.dumps(content, indent=2, default=str)[:200]}...")
            
            print()
        
        # Test POST endpoint
        print("Testing POST endpoint...")
        success, content = await test_endpoint(
            session, 
            "/api/ai-responses/generate", 
            "POST"
        )
        results.append(("/api/ai-responses/generate", success))
        
        if success:
            print(f"   Response: {content}")
        
        print()
        
        # Summary
        successful = sum(1 for _, success in results if success)
        total = len(results)
        
        print("Test Summary")
        print("-" * 30)
        print(f"Total endpoints tested: {total}")
        print(f"Successful: {successful}")
        print(f"Failed: {total - successful}")
        print(f"Success rate: {(successful/total)*100:.1f}%")
        
        if successful == total:
            print("\n🎉 All API endpoints are working correctly!")
        else:
            print(f"\n⚠️  {total - successful} endpoint(s) failed. Check the backend logs.")

if __name__ == "__main__":
    asyncio.run(main())
