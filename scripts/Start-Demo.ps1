# Start SYLON demo with ngrok tunnel
param(
    [switch]$SkipNgrok
)

Write-Host "Starting SYLON Demo..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    $null = docker info 2>&1
} catch {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Stop existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker compose down 2>$null

# Start Docker services
Write-Host "Starting Docker containers..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start containers" -ForegroundColor Red
    exit 1
}

# Wait for services to be ready
Write-Host "Waiting for services to start (20 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Health check
Write-Host "Running health check..." -ForegroundColor Yellow
$healthy = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $healthy = $true
            Write-Host "Services are healthy!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "  Health check attempt $i/10..." -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}

if (-not $healthy) {
    Write-Host "ERROR: Services failed to start healthy. Check logs with:" -ForegroundColor Red
    Write-Host "  docker compose logs api" -ForegroundColor Gray
    Write-Host "  docker compose logs frontend" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Start ngrok if not skipped
if (-not $SkipNgrok) {
    # Check if ngrok is installed
    $ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

    if (-not $ngrokInstalled) {
        Write-Host "WARNING: ngrok is not installed" -ForegroundColor Yellow
        Write-Host "Install with: choco install ngrok" -ForegroundColor Gray
        Write-Host "Or download from: https://ngrok.com/download" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Local access available at: http://localhost:8080" -ForegroundColor White
        Write-Host "Admin: admin@aegis.local / admin123" -ForegroundColor White
        exit 0
    }

    # Kill any existing ngrok
    Get-Process ngrok -ErrorAction SilentlyContinue | Stop-Process -Force

    Write-Host "Starting ngrok tunnel..." -ForegroundColor Yellow
    Start-Process "ngrok" -ArgumentList "http", "8080", "--log=stdout" -WindowStyle Hidden
    Start-Sleep -Seconds 5

    # Get ngrok URL
    try {
        $tunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
        $ngrokUrl = $tunnels.tunnels[0].public_url

        Write-Host ""
        Write-Host "===============================================" -ForegroundColor Cyan
        Write-Host " SYLON is LIVE!" -ForegroundColor Green
        Write-Host "===============================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Demo URL:      $ngrokUrl" -ForegroundColor White
        Write-Host "Admin Login:   admin@aegis.local / admin123" -ForegroundColor White
        Write-Host "Driver App:    $ngrokUrl/driver" -ForegroundColor White
        Write-Host "Driver PIN:    123 (Anders Svensson)" -ForegroundColor White
        Write-Host ""
        Write-Host "===============================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "ngrok Dashboard: http://localhost:4040" -ForegroundColor Gray
        Write-Host "API Health:      http://localhost:8080/api/health" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

        # Open browser
        Start-Process $ngrokUrl

    } catch {
        Write-Host "WARNING: Could not get ngrok URL" -ForegroundColor Yellow
        Write-Host "Check ngrok dashboard: http://localhost:4040" -ForegroundColor Gray
    }
} else {
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host " SYLON is LIVE (Local Only)" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Local URL:     http://localhost:8080" -ForegroundColor White
    Write-Host "Admin Login:   admin@aegis.local / admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
}