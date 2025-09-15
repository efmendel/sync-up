#!/bin/bash

# SyncUp Music Collaboration App - Deployment Script
# This script builds and deploys both frontend and backend for production

set -e  # Exit on any error

echo "🎵 Starting SyncUp deployment..."

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

# Check if we're in the right directory
if [ ! -f "deploy.sh" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check for required environment files
if [ ! -f "frontend/.env.local" ]; then
    print_warning "Frontend environment file not found. Creating template..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:5000
NEXT_PUBLIC_ENABLE_CACHING=true
NEXT_PUBLIC_CACHE_TTL=300000
NEXT_PUBLIC_DEBOUNCE_DELAY=300
NEXT_PUBLIC_ENV=production
EOF
fi

if [ ! -f "backend/.env" ]; then
    print_warning "Backend environment file not found. Creating template..."
    cat > backend/.env << EOF
PORT=3001
CORS_ORIGIN=http://localhost:3000
ML_SERVICE_URL=http://localhost:5000
CACHE_TTL=300
DATABASE_URL="file:./dev.db"
EOF
fi

# Install dependencies
print_status "Installing dependencies..."

# Backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
print_success "Backend dependencies installed"

# Frontend dependencies
print_status "Installing frontend dependencies..."
cd ../frontend
npm install
print_success "Frontend dependencies installed"

# Return to root
cd ..

# Type checking
print_status "Running type checks..."

# Backend type check
print_status "Type checking backend..."
cd backend
npm run type-check
print_success "Backend type check passed"

# Frontend type check
print_status "Type checking frontend..."
cd ../frontend
npm run type-check
print_success "Frontend type check passed"

# Return to root
cd ..

# Build backend
print_status "Building backend..."
cd backend
npm run build:clean
print_success "Backend built successfully"

# Setup database
print_status "Setting up database..."
npm run db:push
npm run db:seed
print_success "Database setup complete"

# Build frontend
print_status "Building frontend..."
cd ../frontend
npm run build:check
print_success "Frontend built successfully"

# Return to root
cd ..

print_success "🎵 SyncUp deployment completed successfully!"
print_status "To start the application:"
echo "  Backend:  cd backend && npm start"
echo "  Frontend: cd frontend && npm start"
echo ""
print_status "The application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
print_warning "Make sure to configure your environment variables for production use!"