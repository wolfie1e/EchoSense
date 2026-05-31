#!/usr/bin/env python3
"""
EchoSense Backend Runner
Main entry point for the EchoSense backend application.
"""

import asyncio
import logging
import sys
from pathlib import Path

import uvicorn
from dotenv import load_dotenv

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Load environment variables
load_dotenv()

from backend.config import settings
from backend.main import app

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("echosense.log")
    ]
)

logger = logging.getLogger(__name__)


async def main():
    """Main entry point for the application."""
    logger.info("Starting EchoSense Backend Server...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Backend Port: {settings.backend_port}")
    logger.info(f"Demo Mode: {settings.demo_mode}")
    
    # Configure uvicorn
    config = uvicorn.Config(
        app=app,
        host="0.0.0.0",
        port=settings.backend_port,
        log_level=settings.log_level.lower(),
        reload=settings.environment == "development",
        access_log=True,
    )
    
    server = uvicorn.Server(config)
    
    try:
        await server.serve()
    except KeyboardInterrupt:
        logger.info("Shutting down EchoSense Backend Server...")
    except Exception as e:
        logger.error(f"Server error: {e}")
        raise


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Application interrupted by user")
    except Exception as e:
        logger.error(f"Application failed to start: {e}")
        sys.exit(1)
