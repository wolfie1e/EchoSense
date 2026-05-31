#!/bin/bash

# EchoSense Development Script
set -e

echo "🚀 Starting EchoSense in Development Mode..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Build development images
print_status "Building development images..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

# Start development services
print_status "Starting development services..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Wait for services
print_status "Waiting for services to start..."
sleep 5

print_success "🎉 EchoSense development environment started!"
print_status "Frontend (Dev): http://localhost:5173"
print_status "Backend API: http://localhost:8000/api"
print_status ""
print_status "To view logs: docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f"
print_status "To stop: docker-compose -f docker-compose.yml -f docker-compose.dev.yml down"
