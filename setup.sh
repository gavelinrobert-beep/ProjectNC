#!/bin/bash

# =============================================================================
# Fantasy MMORPG - Automated Setup Script
# =============================================================================
# This script automates the initial setup process for the MMORPG project
# =============================================================================

set -e  # Exit on error

echo "================================================"
echo "Fantasy MMORPG - Automated Setup"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_step() {
    echo -e "\n${YELLOW}➜ $1${NC}"
}

# Check prerequisites
print_step "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js found: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm found: v$NPM_VERSION"

# Check Go
if ! command -v go &> /dev/null; then
    print_warning "Go is not installed. Game server will not be available."
    print_warning "Please install Go 1.21+ to run the game server."
    GO_INSTALLED=false
else
    GO_VERSION=$(go version)
    print_success "Go found: $GO_VERSION"
    GO_INSTALLED=true
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL client (psql) is not found."
    print_warning "Please ensure PostgreSQL 15+ is installed and running."
else
    print_success "PostgreSQL client found"
fi

# Step 1: Install root dependencies
print_step "Installing root dependencies..."
npm install
print_success "Root dependencies installed"

# Step 2: Install API dependencies
print_step "Installing API package dependencies..."
cd packages/api
npm install
print_success "API dependencies installed"

# Step 3: Setup API environment
print_step "Setting up API environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_success "Created .env file from .env.example"
    print_warning "Please edit packages/api/.env with your PostgreSQL connection string"
    print_warning "Default: postgresql://postgres:password@localhost:5432/mmorpg?schema=public"
else
    print_warning ".env file already exists, skipping copy"
fi

# Step 4: Generate Prisma Client
print_step "Generating Prisma client..."
npx prisma generate
print_success "Prisma client generated"

cd ../..

# Step 5: Install Frontend dependencies
print_step "Installing Frontend package dependencies..."
cd packages/frontend
npm install
print_success "Frontend dependencies installed"
cd ../..

# Step 6: Install Shared dependencies
print_step "Installing Shared package dependencies..."
cd packages/shared
npm install
print_success "Shared dependencies installed"
cd ../..

# Step 7: Install Game Server dependencies (if Go is available)
if [ "$GO_INSTALLED" = true ]; then
    print_step "Installing Game Server dependencies..."
    cd packages/gameserver
    go mod download
    print_success "Game Server dependencies installed"
    cd ../..
fi

# Final instructions
echo ""
echo "================================================"
print_success "Setup completed successfully!"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your database:"
echo "   - Ensure PostgreSQL is running"
echo "   - Edit packages/api/.env with your database connection string"
echo "   - Default: postgresql://postgres:password@localhost:5432/mmorpg?schema=public"
echo ""
echo "2. Run database migrations:"
echo "   npm run prisma:migrate"
echo ""
echo "3. Start the services (in 3 separate terminals):"
echo "   Terminal 1: npm run dev:api"
echo "   Terminal 2: npm run dev:frontend"
echo "   Terminal 3: npm run dev:gameserver"
echo ""
echo "4. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - API: http://localhost:4000/api"
echo "   - Game Server: ws://localhost:8080"
echo ""
echo "For more details, see README.md and SETUP.md"
echo ""
