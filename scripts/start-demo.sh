#!/bin/bash
# ============================================
# AEGIS Light - Demo Startup Script (Linux/Mac)
# ============================================
# Starts Docker Compose, waits for health checks,
# then starts ngrok tunnel and displays access URL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "\n${CYAN}=================================="
echo -e "  AEGIS Light - Demo Startup"
echo -e "==================================${NC}"

# Check if Docker is running
echo -e "\n${YELLOW}[1/4] Checking Docker...${NC}"
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker is not running. Please start Docker.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check if ngrok is installed
echo -e "\n${YELLOW}[2/4] Checking ngrok...${NC}"
if ! command -v ngrok &> /dev/null; then
    echo -e "${YELLOW}WARNING: ngrok not found. Please install from https://ngrok.com/download${NC}"
    echo -e "${YELLOW}The demo will start without ngrok tunnel.${NC}"
    USE_NGROK=false
else
    echo -e "${GREEN}✓ ngrok is installed${NC}"
    USE_NGROK=true
fi

# Start Docker Compose
echo -e "\n${YELLOW}[3/4] Starting Docker services...${NC}"
echo -e "${GRAY}This may take a few minutes on first run...${NC}"

docker compose up -d

# Wait for services to be healthy
echo -e "\n${YELLOW}[4/4] Waiting for services to be ready...${NC}"
MAX_WAIT=120
WAITED=0
HEALTHY=false

while [ $WAITED -lt $MAX_WAIT ]; do
    sleep 5
    WAITED=$((WAITED + 5))
    
    # Check API health
    if curl -s -f http://localhost:8000/health >/dev/null 2>&1; then
        HEALTHY=true
        break
    fi
    
    echo -e "${GRAY}  Waiting... ($WAITED/$MAX_WAIT seconds)${NC}"
done

if [ "$HEALTHY" = false ]; then
    echo -e "${YELLOW}WARNING: Services may not be fully ready yet${NC}"
    echo -e "${GRAY}You can check status with: docker compose logs${NC}"
else
    echo -e "${GREEN}✓ Services are healthy${NC}"
fi

# Display local URLs
echo -e "\n${CYAN}=================================="
echo -e "  Local Access URLs"
echo -e "==================================${NC}"
echo -e "${WHITE}Frontend:  http://localhost:5173${NC}"
echo -e "${WHITE}API:       http://localhost:8000${NC}"
echo -e "${WHITE}API Docs:  http://localhost:8000/docs${NC}"

# Start ngrok if available
if [ "$USE_NGROK" = true ]; then
    echo -e "\n${CYAN}=================================="
    echo -e "  Starting ngrok tunnel..."
    echo -e "==================================${NC}"
    
    # Kill any existing ngrok processes
    pkill -f ngrok || true
    
    # Start ngrok in background
    nohup ngrok http 5173 --log=stdout > /tmp/ngrok.log 2>&1 &
    NGROK_PID=$!
    
    # Wait for ngrok to start
    sleep 3
    
    # Get ngrok URL
    if command -v curl &> /dev/null; then
        NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)
        
        if [ -n "$NGROK_URL" ]; then
            echo -e "\n${GREEN}✓ ngrok tunnel established!${NC}"
            echo -e "\n${CYAN}Public Demo URL:${NC}"
            echo -e "  ${YELLOW}${NGROK_URL}${NC}"
            echo -e "\n${WHITE}Share this URL with demo participants!${NC}"
            echo -e "${GRAY}ngrok PID: $NGROK_PID${NC}"
        fi
    else
        echo -e "${YELLOW}WARNING: Could not retrieve ngrok URL (curl not found)${NC}"
        echo -e "${GRAY}Check ngrok status at: http://localhost:4040${NC}"
    fi
fi

# Display demo credentials
echo -e "\n${CYAN}=================================="
echo -e "  Demo Credentials"
echo -e "==================================${NC}"
echo -e "\n${WHITE}ADMIN LOGIN:${NC}"
echo -e "${GRAY}  Email:    admin@sundsvall.se${NC}"
echo -e "${GRAY}  Password: admin123${NC}"

echo -e "\n${WHITE}DRIVER LOGIN (Mobile App):${NC}"
echo -e "${GRAY}  Driver:   Erik Andersson${NC}"
echo -e "${GRAY}  PIN:      0001${NC}"
echo -e "${GRAY}  Vehicle:  ABC 123${NC}"

echo -e "\n${WHITE}PUBLIC TRACKING (No Login):${NC}"
echo -e "${GRAY}  Tracking: DEL-SND-001${NC}"
echo -e "${GRAY}  URL:      /track/DEL-SND-001${NC}"

# Display Swedish test data
echo -e "\n${CYAN}=================================="
echo -e "  Swedish Test Data"
echo -e "==================================${NC}"
echo -e "${GRAY}Drivers:   Anders Svensson, Erik Andersson${NC}"
echo -e "${GRAY}Vehicles:  ABC 123, DEF 456, GHI 789${NC}"
echo -e "${GRAY}Location:  Sundsvall, Sweden${NC}"

# Display controls
echo -e "\n${CYAN}=================================="
echo -e "  Controls"
echo -e "==================================${NC}"
echo -e "${WHITE}Stop demo:     docker compose down${NC}"
echo -e "${WHITE}View logs:     docker compose logs -f${NC}"
echo -e "${WHITE}Stop ngrok:    pkill -f ngrok${NC}"
echo -e "${WHITE}ngrok status:  http://localhost:4040${NC}"

echo -e "\n${GREEN}✓ Demo is ready!${NC}\n"
