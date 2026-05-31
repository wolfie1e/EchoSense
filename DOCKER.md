# 🐳 EchoSense Docker Deployment Guide

This guide covers containerization and deployment of the EchoSense platform using Docker and Docker Compose.

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- Ports 3000, 8000, 5432, 6379 available

### 1. Production Deployment

```bash
# Clone and navigate
git clone <repository-url>
cd SentinelOS

# Build and start all services
./scripts/build.sh

# Or manually
docker-compose up -d --build
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Health Check: http://localhost:3000/health

### 2. Development Mode

```bash
# Start development environment with hot reload
./scripts/dev.sh

# Or manually
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

**Development Access:**
- Frontend (Dev): http://localhost:5173
- Backend API: http://localhost:8000/api

## 📁 Container Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Nginx)       │◄──►│   (Node.js)     │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Redis       │
                    │   (Caching)     │
                    │   Port: 6379    │
                    └─────────────────┘
```

## 🏗️ Docker Images

### Frontend Image (Multi-stage)
- **Stage 1**: Node.js 18 Alpine (Build)
- **Stage 2**: Nginx Alpine (Production)
- **Size**: ~50MB (optimized)
- **Features**: Gzip compression, security headers, SPA routing

### Backend Image
- **Base**: Node.js 18 Alpine
- **Features**: Express API, CORS, security middleware
- **Auto-generated**: Mock API for development

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=EchoSense
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

**Backend (docker-compose.yml)**
```yaml
environment:
  - NODE_ENV=production
  - PORT=8000
  - CORS_ORIGIN=http://localhost:3000
```

### Volume Mounts

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data  # Database persistence
  - redis_data:/data                        # Cache persistence
  - ./echosense-backend:/app               # Development code
```

## 🚀 Deployment Commands

### Basic Operations
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Build Operations
```bash
# Rebuild all images
docker-compose build --no-cache

# Rebuild specific service
docker-compose build frontend

# Pull latest base images
docker-compose pull
```

### Maintenance
```bash
# Remove unused containers/images
docker system prune -a

# View resource usage
docker stats

# Execute commands in container
docker-compose exec frontend sh
docker-compose exec backend sh
```

## 🔍 Health Monitoring

### Health Check Endpoints
- Frontend: `curl http://localhost:3000/health`
- Backend: `curl http://localhost:8000/api/health`
- Database: `docker-compose exec database pg_isready`
- Redis: `docker-compose exec redis redis-cli ping`

### Container Health Status
```bash
# Check all container health
docker-compose ps

# View detailed health info
docker inspect echosense-frontend --format='{{.State.Health.Status}}'
```

## 🐛 Troubleshooting

### Common Issues

**1. Port Conflicts**
```bash
# Check port usage
lsof -i :3000
lsof -i :8000

# Kill processes using ports
sudo kill -9 $(lsof -t -i:3000)
```

**2. Build Failures**
```bash
# Clear Docker cache
docker system prune -a
docker builder prune -a

# Rebuild from scratch
docker-compose build --no-cache --pull
```

**3. Container Won't Start**
```bash
# Check logs
docker-compose logs frontend
docker-compose logs backend

# Check container status
docker-compose ps
```

**4. API Connection Issues**
```bash
# Test backend connectivity
curl http://localhost:8000/api/health

# Check network
docker network ls
docker network inspect echosense-network
```

### Debug Mode

**Enable Debug Logging**
```bash
# Set debug environment
export COMPOSE_LOG_LEVEL=DEBUG

# Start with verbose output
docker-compose up --verbose
```

**Container Shell Access**
```bash
# Access frontend container
docker-compose exec frontend sh

# Access backend container
docker-compose exec backend sh

# Access database
docker-compose exec database psql -U echosense
```

## 🔒 Security

### Container Security
- Non-root user in production containers
- Security headers via Helmet.js
- Minimal base images (Alpine Linux)
- No sensitive data in images

### Network Security
- Internal Docker network isolation
- CORS properly configured
- Rate limiting implemented
- HTTPS ready (add reverse proxy)

## 📊 Performance

### Resource Requirements
- **Minimum**: 2GB RAM, 2 CPU cores
- **Recommended**: 4GB RAM, 4 CPU cores
- **Storage**: 10GB for containers + data

### Optimization
- Multi-stage builds reduce image size
- Nginx gzip compression enabled
- Static asset caching configured
- Database connection pooling

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Create production environment file
cp .env.example .env.production

# Set production values
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_NODE_ENV=production
```

### 2. SSL/TLS Setup
```bash
# Add reverse proxy (Traefik/Nginx)
# Configure SSL certificates
# Update CORS origins
```

### 3. Monitoring Setup
```bash
# Add monitoring stack
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

## 📝 Development Workflow

### 1. Code Changes
```bash
# Start development mode
./scripts/dev.sh

# Make changes to code
# Hot reload automatically applies changes
```

### 2. Testing Changes
```bash
# Run tests in container
docker-compose exec frontend npm test
docker-compose exec backend npm test
```

### 3. Building for Production
```bash
# Test production build locally
docker-compose build
docker-compose up -d

# Verify functionality
curl http://localhost:3000/health
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Build and Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: docker-compose build
      - name: Run tests
        run: docker-compose run --rm frontend npm test
```

---

**EchoSense Docker Setup** - Containerized for scalability and reliability
