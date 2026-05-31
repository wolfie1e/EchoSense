#!/bin/bash

# EchoSense Build Script
set -e

echo "🚀 Building EchoSense Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    print_error "docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Build the application
print_status "Building Docker images..."
docker-compose build --no-cache

print_success "Docker images built successfully!"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p echosense-backend

# Start the services
print_status "Starting EchoSense services..."
docker-compose up -d

# Wait for services to be healthy
print_status "Waiting for services to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."

# Check frontend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Frontend is healthy and running on http://localhost:3000"
else
    print_warning "Frontend health check failed, but service may still be starting..."
fi

# Check backend
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    print_success "Backend is healthy and running on http://localhost:8000"
else
    print_warning "Backend health check failed, but service may still be starting..."
fi

print_success "🎉 EchoSense application built and started successfully!"
print_status "Frontend: http://localhost:3000"
print_status "Backend API: http://localhost:8000/api"
print_status ""
print_status "To view logs: docker-compose logs -f"
print_status "To stop: docker-compose down"
print_status "To rebuild: docker-compose build --no-cache"
