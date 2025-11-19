# ============================================
# AEGIS Light - Demo Startup Script (Windows)
# ============================================
# Starts Docker Compose, waits for health checks,
# then starts ngrok tunnel and displays access URL

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "  AEGIS Light - Demo Startup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "`n[1/4] Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green

# Check if ngrok is installed
Write-Host "`n[2/4] Checking ngrok..." -ForegroundColor Yellow
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokInstalled) {
    Write-Host "WARNING: ngrok not found. Please install from https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "The demo will start without ngrok tunnel." -ForegroundColor Yellow
    $useNgrok = $false
} else {
    Write-Host "✓ ngrok is installed" -ForegroundColor Green
    $useNgrok = $true
}

# Start Docker Compose
Write-Host "`n[3/4] Starting Docker services..." -ForegroundColor Yellow
Write-Host "This may take a few minutes on first run..." -ForegroundColor Gray

docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start Docker services" -ForegroundColor Red
    exit 1
}

# Wait for services to be healthy
Write-Host "`n[4/4] Waiting for services to be ready..." -ForegroundColor Yellow
$maxWait = 120
$waited = 0
$healthy = $false

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 5
    $waited += 5
    
    # Check API health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2 2>$null
        if ($response.StatusCode -eq 200) {
            $healthy = $true
            break
        }
    } catch {
        # Service not ready yet
    }
    
    Write-Host "  Waiting... ($waited/$maxWait seconds)" -ForegroundColor Gray
}

if (-not $healthy) {
    Write-Host "WARNING: Services may not be fully ready yet" -ForegroundColor Yellow
    Write-Host "You can check status with: docker compose logs" -ForegroundColor Gray
} else {
    Write-Host "✓ Services are healthy" -ForegroundColor Green
}

# Display local URLs
Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "  Local Access URLs" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "API:       http://localhost:8000" -ForegroundColor White
Write-Host "API Docs:  http://localhost:8000/docs" -ForegroundColor White

# Start ngrok if available
if ($useNgrok) {
    Write-Host "`n==================================" -ForegroundColor Cyan
    Write-Host "  Starting ngrok tunnel..." -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    
    # Kill any existing ngrok processes
    Stop-Process -Name ngrok -Force -ErrorAction SilentlyContinue
    
    # Start ngrok in background
    Start-Process -FilePath "ngrok" -ArgumentList "http 5173 --log=stdout" -WindowStyle Hidden
    
    # Wait for ngrok to start
    Start-Sleep -Seconds 3
    
    # Get ngrok URL
    try {
        $ngrokApi = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -UseBasicParsing
        $publicUrl = $ngrokApi.tunnels[0].public_url
        
        if ($publicUrl) {
            Write-Host "`n✓ ngrok tunnel established!" -ForegroundColor Green
            Write-Host "`nPublic Demo URL:" -ForegroundColor Cyan
            Write-Host "  $publicUrl" -ForegroundColor Yellow -BackgroundColor DarkGray
            Write-Host "`nShare this URL with demo participants!" -ForegroundColor White
        }
    } catch {
        Write-Host "WARNING: Could not retrieve ngrok URL" -ForegroundColor Yellow
        Write-Host "Check ngrok status at: http://localhost:4040" -ForegroundColor Gray
    }
}

# Display demo credentials
Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "  Demo Credentials" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "`nADMIN LOGIN:" -ForegroundColor White
Write-Host "  Email:    admin@sundsvall.se" -ForegroundColor Gray
Write-Host "  Password: admin123" -ForegroundColor Gray

Write-Host "`nDRIVER LOGIN (Mobile App):" -ForegroundColor White
Write-Host "  Driver:   Erik Andersson" -ForegroundColor Gray
Write-Host "  PIN:      0001" -ForegroundColor Gray
Write-Host "  Vehicle:  ABC 123" -ForegroundColor Gray

Write-Host "`nPUBLIC TRACKING (No Login):" -ForegroundColor White
Write-Host "  Tracking: DEL-SND-001" -ForegroundColor Gray
Write-Host "  URL:      /track/DEL-SND-001" -ForegroundColor Gray

# Display Swedish test data
Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "  Swedish Test Data" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Drivers:   Anders Svensson, Erik Andersson" -ForegroundColor Gray
Write-Host "Vehicles:  ABC 123, DEF 456, GHI 789" -ForegroundColor Gray
Write-Host "Location:  Sundsvall, Sweden" -ForegroundColor Gray

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "  Controls" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Stop demo:     docker compose down" -ForegroundColor White
Write-Host "View logs:     docker compose logs -f" -ForegroundColor White
Write-Host "Stop ngrok:    Stop-Process -Name ngrok" -ForegroundColor White
Write-Host "ngrok status:  http://localhost:4040" -ForegroundColor White

Write-Host "`n✓ Demo is ready!" -ForegroundColor Green
Write-Host ""
