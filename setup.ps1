# =============================================================================
# Fantasy MMORPG - Automated Setup Script (PowerShell)
# =============================================================================
# This script automates the initial setup process for the MMORPG project
# Run this with: .\setup.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Fantasy MMORPG - Automated Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Function to print colored output
function Print-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Warning {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Print-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Step {
    param($Message)
    Write-Host ""
    Write-Host "➜ $Message" -ForegroundColor Yellow
}

# Check prerequisites
Print-Step "Checking prerequisites..."

# Check Node.js
try {
    $nodeVersion = node --version
    $nodeMajor = [int]($nodeVersion -replace 'v', '' -split '\.')[0]
    if ($nodeMajor -lt 18) {
        Print-Error "Node.js version $nodeVersion is too old. Please install Node.js 18+ (found v$nodeMajor)."
        exit 1
    }
    Print-Success "Node.js found: $nodeVersion"
} catch {
    Print-Error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Print-Success "npm found: v$npmVersion"
} catch {
    Print-Error "npm is not installed. Please install npm first."
    exit 1
}

# Check Go
$goInstalled = $false
try {
    $goVersion = go version
    Print-Success "Go found: $goVersion"
    $goInstalled = $true
} catch {
    Print-Warning "Go is not installed. Game server will not be available."
    Print-Warning "Please install Go 1.21+ to run the game server."
}

# Check PostgreSQL
$pgInstalled = $false
try {
    $null = psql --version
    Print-Success "PostgreSQL client found"
    $pgInstalled = $true
} catch {
    Print-Warning "PostgreSQL client (psql) is not found in PATH."
    Print-Warning "Attempting to locate PostgreSQL installation..."
    
    # Common PostgreSQL installation paths on Windows
    $pgPaths = @(
        "C:\Program Files\PostgreSQL\16\bin",
        "C:\Program Files\PostgreSQL\15\bin",
        "C:\Program Files\PostgreSQL\14\bin",
        "C:\Program Files\PostgreSQL\13\bin",
        "C:\Program Files (x86)\PostgreSQL\16\bin",
        "C:\Program Files (x86)\PostgreSQL\15\bin",
        "C:\Program Files (x86)\PostgreSQL\14\bin",
        "C:\Program Files (x86)\PostgreSQL\13\bin"
    )
    
    $pgFound = $false
    foreach ($pgPath in $pgPaths) {
        if (Test-Path "$pgPath\psql.exe") {
            Print-Success "Found PostgreSQL at: $pgPath"
            $env:PATH += ";$pgPath"
            Print-Success "Added PostgreSQL to PATH for this session"
            $pgFound = $true
            $pgInstalled = $true
            break
        }
    }
    
    if (-not $pgFound) {
        Print-Warning "PostgreSQL installation not found in common locations."
        Print-Warning "Please ensure PostgreSQL 15+ is installed and running."
        Print-Warning "You may need to manually add PostgreSQL bin directory to your PATH:"
        Print-Warning '  $env:PATH += ";C:\Program Files\PostgreSQL\15\bin"'
    }
}

# Step 1: Install root dependencies
Print-Step "Installing root dependencies..."
npm install
Print-Success "Root dependencies installed"

# Step 2: Install API dependencies
Print-Step "Installing API package dependencies..."
if (!(Test-Path "packages\api")) {
    Print-Error "packages\api directory not found. Are you in the correct directory?"
    exit 1
}
Set-Location packages\api
npm install
Print-Success "API dependencies installed"

# Step 3: Setup API environment
Print-Step "Setting up API environment..."
if (!(Test-Path ".env")) {
    Copy-Item .env.example .env
    Print-Success "Created .env file from .env.example"
    Print-Warning "Please edit packages\api\.env with your PostgreSQL connection string"
    Print-Warning "Default: postgresql://postgres:password@localhost:5432/mmorpg?schema=public"
} else {
    Print-Warning ".env file already exists, skipping copy"
}

# Step 4: Generate Prisma Client
Print-Step "Generating Prisma client..."
npx prisma generate
Print-Success "Prisma client generated"

Set-Location ..\..

# Step 5: Install Frontend dependencies
Print-Step "Installing Frontend package dependencies..."
if (!(Test-Path "packages\frontend")) {
    Print-Warning "packages\frontend directory not found, skipping frontend setup"
} else {
    Set-Location packages\frontend
    npm install
    Print-Success "Frontend dependencies installed"
    Set-Location ..\..
}

# Step 6: Install Shared dependencies
Print-Step "Installing Shared package dependencies..."
if (!(Test-Path "packages\shared")) {
    Print-Warning "packages\shared directory not found, skipping shared setup"
} else {
    Set-Location packages\shared
    npm install
    Print-Success "Shared dependencies installed"
    Set-Location ..\..
}

# Step 7: Install Game Server dependencies (if Go is available)
if ($goInstalled) {
    if (!(Test-Path "packages\gameserver")) {
        Print-Warning "packages\gameserver directory not found, skipping game server setup"
    } else {
        Print-Step "Installing Game Server dependencies..."
        Set-Location packages\gameserver
        try {
            go mod download
            Print-Success "Game Server dependencies installed"
        } catch {
            Print-Warning "Failed to download Game Server dependencies. You may need to install them manually."
        }
        Set-Location ..\..
    }
}

# Final instructions
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Print-Success "Setup completed successfully!"
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host ""
Write-Host "1. Configure your database:"
Write-Host "   - Ensure PostgreSQL is running"
Write-Host "   - Create the database (if it doesn't exist):"
Write-Host "     createdb mmorpg"
Write-Host "     OR via psql: CREATE DATABASE mmorpg;"
Write-Host "   - Edit packages\api\.env with your database connection string"
Write-Host "   - Default: postgresql://postgres:password@localhost:5432/mmorpg?schema=public"
Write-Host ""
Write-Host "2. Run database migrations:"
Write-Host "   npm run prisma:migrate"
Write-Host ""
Write-Host "3. Start the services (in 3 separate terminals):"
Write-Host "   Terminal 1: npm run dev:api"
Write-Host "   Terminal 2: npm run dev:frontend"
Write-Host "   Terminal 3: npm run dev:gameserver"
Write-Host ""
Write-Host "4. Access the application:"
Write-Host "   - Frontend: http://localhost:3000"
Write-Host "   - API: http://localhost:4000/api"
Write-Host "   - Game Server: ws://localhost:8080"
Write-Host ""
Write-Host "For more details, see README.md and SETUP.md"
Write-Host ""
