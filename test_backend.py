#!/usr/bin/env python3
"""
Simple test script to verify backend imports and basic functionality.
"""

import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

def test_imports():
    """Test if all backend modules can be imported."""
    print("Testing backend imports...")
    
    try:
        from backend.config import settings
        print("✓ Config module imported successfully")
        print(f"  - Backend port: {settings.backend_port}")
        print(f"  - Environment: {settings.environment}")
        print(f"  - Demo mode: {settings.demo_mode}")
    except Exception as e:
        print(f"✗ Config import failed: {e}")
        return False
    
    try:
        from backend.data_ingestion import DataIngestionService
        print("✓ Data ingestion module imported successfully")
    except Exception as e:
        print(f"✗ Data ingestion import failed: {e}")
        return False
    
    try:
        from backend.sentiment_analysis import SentimentAnalysisService
        print("✓ Sentiment analysis module imported successfully")
    except Exception as e:
        print(f"✗ Sentiment analysis import failed: {e}")
        return False
    
    try:
        from backend.forecasting import ForecastingService
        print("✓ Forecasting module imported successfully")
    except Exception as e:
        print(f"✗ Forecasting import failed: {e}")
        return False
    
    try:
        from backend.ai_agent import AIAgentService
        print("✓ AI agent module imported successfully")
    except Exception as e:
        print(f"✗ AI agent import failed: {e}")
        return False
    
    try:
        from backend.main import app
        print("✓ Main FastAPI app imported successfully")
    except Exception as e:
        print(f"✗ Main app import failed: {e}")
        return False
    
    return True

def main():
    """Main test function."""
    print("EchoSense Backend Test")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        print("\n❌ Backend import tests failed!")
        sys.exit(1)
    
    print("\n✅ All backend modules imported successfully!")
    print("\nBackend is ready to run. Use 'python run_backend.py' to start the server.")

if __name__ == "__main__":
    main()
