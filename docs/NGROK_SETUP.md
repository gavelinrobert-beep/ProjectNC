# ngrok Setup Guide for AEGIS Light Demo

This guide provides complete instructions for setting up ngrok tunnels to make your local AEGIS Light demo accessible over the internet. This is essential for remote demonstrations, mobile device testing, and sharing demos with clients.

## 📋 Table of Contents

1. [What is ngrok?](#what-is-ngrok)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Running the Demo](#running-the-demo)
6. [Security Considerations](#security-considerations)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Usage](#advanced-usage)

---

## What is ngrok?

**ngrok** is a tunneling service that creates secure public URLs for your local development servers. It allows you to:

- Share your local demo with remote clients
- Test on real mobile devices without deployment
- Bypass firewall restrictions for demos
- Access your local application from anywhere
- Get automatic HTTPS/SSL certificates

### Why use ngrok for AEGIS Light demos?

- **No deployment needed:** Demo directly from your development machine
- **Real mobile testing:** Test driver app on actual phones/tablets
- **Client demos:** Share links with clients for remote demonstrations
- **HTTPS support:** Required for GPS/location features on mobile devices
- **Simple setup:** Running in minutes with minimal configuration

---

## Installation

### Windows

**Option 1: Using Chocolatey (Recommended)**
```powershell
choco install ngrok
```

**Option 2: Using Scoop**
```powershell
scoop install ngrok
```

**Option 3: Manual Installation**
1. Download from https://ngrok.com/download
2. Extract `ngrok.exe` to a folder in your PATH (e.g., `C:\Program Files\ngrok\`)
3. Or place in project root directory

### macOS

**Option 1: Using Homebrew (Recommended)**
```bash
brew install ngrok/ngrok/ngrok
```

**Option 2: Manual Installation**
```bash
# Download and install
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok
```

### Linux

**Option 1: Using apt (Ubuntu/Debian)**
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok
```

**Option 2: Manual Installation**
```bash
# Download
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz

# Extract
tar xvzf ngrok-v3-stable-linux-amd64.tgz

# Move to /usr/local/bin
sudo mv ngrok /usr/local/bin/

# Verify installation
ngrok version
```

### Verify Installation

```bash
ngrok version
```

Should output something like: `ngrok version 3.x.x`

---

## Quick Start

### 1. Create ngrok Account (Free)

1. Go to https://ngrok.com/signup
2. Sign up for a free account
3. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken

### 2. Configure ngrok

Add your authtoken (only needed once):

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### 3. Start AEGIS Light Demo

**Windows:**
```powershell
.\scripts\Start-Demo.ps1
```

**Linux/Mac:**
```bash
./scripts/start-demo.sh
```

These scripts will:
1. Start Docker containers
2. Wait for services to be healthy
3. Automatically start ngrok tunnel
4. Display the public URL

### 4. Share Demo URL

The script will display your public URL:
```
Public Demo URL:
  https://abc123.ngrok.io
```

Share this URL with:
- Remote clients for demos
- Mobile devices for testing
- Team members for collaboration

---

## Configuration

### Basic ngrok Configuration

Create `~/.ngrok2/ngrok.yml` for custom settings:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN_HERE

tunnels:
  aegis-frontend:
    proto: http
    addr: 5173
    inspect: true
    
  aegis-api:
    proto: http
    addr: 8000
    inspect: false
```

### AEGIS Light Environment Setup

Ensure your `.env` file has proper CORS configuration:

```bash
# Allow all origins for ngrok tunnel access
CORS_ORIGINS=*

# API will be accessed via frontend (empty base)
VITE_API_BASE=""
```

### Frontend API Configuration

The frontend is already configured to use relative paths when `VITE_API_BASE=""`:

```javascript
// frontend/src/lib/api.js
export const API_BASE = ''  // Uses same domain as frontend
```

This ensures API calls work correctly through the ngrok tunnel.

---

## Running the Demo

### Method 1: Using Automated Scripts (Recommended)

**Windows PowerShell:**
```powershell
# Navigate to project root
cd C:\path\to\SYLON

# Run demo script
.\scripts\Start-Demo.ps1
```

**Linux/Mac Bash:**
```bash
# Navigate to project root
cd /path/to/SYLON

# Run demo script
./scripts/start-demo.sh
```

**What the scripts do:**
1. Verify Docker is running
2. Check for ngrok installation
3. Start Docker Compose services
4. Wait for health checks (up to 2 minutes)
5. Start ngrok tunnel
6. Display public URL and credentials
7. Show Swedish test data information

### Method 2: Manual Setup

**Step 1: Start Services**
```bash
# Start Docker containers
docker compose up -d

# Wait for services to be ready
curl http://localhost:8000/health
```

**Step 2: Start ngrok**
```bash
# In a separate terminal
ngrok http 5173
```

**Step 3: Note the URL**
Look for the "Forwarding" line in ngrok output:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:5173
```

---

## Security Considerations

### For Public Demos

When exposing your demo publicly:

1. **Use strong passwords:**
   - Change default admin password
   - Use secure driver PINs

2. **Time-limited access:**
   - Start ngrok only during demo
   - Stop tunnel when demo is complete

3. **Monitor access:**
   - Check ngrok dashboard: http://localhost:4040
   - Review connection logs
   - Watch for suspicious activity

4. **Demo data only:**
   - Never use production data with ngrok
   - Use Swedish test data provided
   - Clear sensitive information before demos

### CORS Configuration

The demo uses `CORS_ORIGINS=*` for ease of access. For production:

```bash
# Production: Restrict to specific domains
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### ngrok Free vs Paid

**Free Account:**
- Random URLs (changes each time)
- 40 connections/minute limit
- Basic inspection
- Good for: demos, testing

**Paid Account ($8-$20/month):**
- Custom subdomains (e.g., `aegis-demo.ngrok.io`)
- Reserved domains
- Higher limits
- IP restrictions
- Good for: frequent demos, professional use

---

## Troubleshooting

### Problem: "ngrok not found"

**Solution:**
- Verify installation: `ngrok version`
- Check PATH includes ngrok location
- Reinstall using instructions above

### Problem: "Failed to start tunnel"

**Solutions:**
1. Check if port 5173 is already in use:
   ```bash
   # Windows
   netstat -ano | findstr :5173
   
   # Linux/Mac
   lsof -i :5173
   ```

2. Verify Docker containers are running:
   ```bash
   docker compose ps
   ```

3. Check ngrok authtoken is configured:
   ```bash
   ngrok config check
   ```

### Problem: "400 Bad Request - OPTIONS /api/login"

**Solution:** Already fixed in this repository!
- Frontend uses `API_BASE = ''` (relative paths)
- Backend CORS allows all origins with `CORS_ORIGINS=*`
- compose.yaml sets `VITE_API_BASE: ""`

### Problem: "Cannot connect to ngrok URL"

**Solutions:**
1. Check firewall isn't blocking ngrok
2. Verify services are healthy:
   ```bash
   curl http://localhost:8000/health
   ```
3. Check ngrok dashboard for errors: http://localhost:4040

### Problem: "Map not loading on mobile"

**Solutions:**
- Ensure mobile has internet connection
- Check browser console for errors
- Verify ngrok URL uses HTTPS (required for GPS)

### Problem: "GPS not working through ngrok"

**Solutions:**
- ngrok provides HTTPS automatically (required for geolocation)
- Check browser location permissions
- Test on actual device (simulators may not work)

### Problem: "Double /api/api/ in requests"

**Solution:** Already fixed in this repository!
- Frontend `API_BASE` is now empty string
- All API routes use `/api/...` paths
- No double path issue

---

## Advanced Usage

### Custom Subdomain (Paid Account)

```bash
ngrok http 5173 --subdomain=aegis-demo
# Creates: https://aegis-demo.ngrok.io
```

### Password Protection

```bash
ngrok http 5173 --basic-auth="user:password"
```

### Custom Domain (Paid Account)

```bash
ngrok http 5173 --hostname=demo.yourdomain.com
```

### Multiple Tunnels

Create `ngrok.yml`:
```yaml
tunnels:
  frontend:
    proto: http
    addr: 5173
  api:
    proto: http
    addr: 8000
```

Start all tunnels:
```bash
ngrok start --all
```

### Inspect Traffic

Access ngrok inspector at: http://localhost:4040

Features:
- View all HTTP requests/responses
- Replay requests
- Debug API calls
- Monitor performance

### Regional Endpoints

```bash
# Europe
ngrok http 5173 --region=eu

# Asia
ngrok http 5173 --region=ap

# Australia
ngrok http 5173 --region=au
```

---

## Demo Workflow

### Pre-Demo Checklist

- [ ] ngrok installed and configured
- [ ] Authtoken added to ngrok
- [ ] Docker Desktop running
- [ ] `.env` file has `CORS_ORIGINS=*`
- [ ] Internet connection stable
- [ ] Mobile devices ready for testing
- [ ] Demo credentials documented

### During Demo

1. **Start demo:**
   ```bash
   ./scripts/start-demo.sh  # or Start-Demo.ps1
   ```

2. **Note the ngrok URL:**
   ```
   https://abc123.ngrok.io
   ```

3. **Share with participants:**
   - Admin: `https://abc123.ngrok.io/`
   - Driver: `https://abc123.ngrok.io/driver`
   - Tracking: `https://abc123.ngrok.io/track/DEL-SND-001`

4. **Monitor in ngrok dashboard:**
   - Open: http://localhost:4040
   - Watch requests in real-time
   - Debug any issues

### Post-Demo Cleanup

```bash
# Stop ngrok
pkill ngrok  # Linux/Mac
Stop-Process -Name ngrok  # Windows

# Stop Docker services
docker compose down
```

---

## Tips for Successful Demos

### 1. Test Before Demo
- Run through demo flow beforehand
- Test on actual mobile devices
- Verify all features work through ngrok
- Check performance over internet

### 2. Have Backup Plan
- Save ngrok URL in case you need to reconnect
- Have localhost URLs ready as backup
- Keep mobile hotspot available
- Prepare offline demo materials

### 3. Professional Presentation
- Use custom subdomain (paid account) for consistent branding
- Shorten URLs with bit.ly for easier sharing
- Test on multiple devices (iOS, Android)
- Prepare screenshots as backup

### 4. Monitor Performance
- Watch ngrok inspector during demo
- Check for slow requests
- Monitor bandwidth usage
- Be ready to explain any delays

---

## Cost Comparison

### Free Account
- **Cost:** $0
- **Features:**
  - Random URLs
  - 1 online ngrok process
  - 4 tunnels/ngrok process
  - 40 connections/minute
- **Best for:** Occasional demos, testing

### Personal Account ($8/month)
- **Cost:** $8/month
- **Features:**
  - Custom subdomains
  - 3 reserved domains
  - No connection limits
  - More regions
- **Best for:** Regular demos, professional use

### Pro Account ($20/month)
- **Cost:** $20/month
- **Features:**
  - IP restrictions
  - Multiple users
  - SSO support
  - Priority support
- **Best for:** Enterprise demos, team use

---

## Alternatives to ngrok

If ngrok doesn't meet your needs:

### 1. localtunnel
```bash
npm install -g localtunnel
lt --port 5173
```
- Free
- No registration required
- Less stable than ngrok

### 2. Cloudflare Tunnel
```bash
cloudflared tunnel --url http://localhost:5173
```
- Free
- Cloudflare infrastructure
- More setup required

### 3. Serveo
```bash
ssh -R 80:localhost:5173 serveo.net
```
- Free
- No installation
- SSH-based

### 4. Production Deployment
For permanent access, consider deploying to:
- DigitalOcean App Platform
- Heroku
- AWS Elastic Beanstalk
- Azure App Service

---

## Support Resources

### ngrok Documentation
- Official docs: https://ngrok.com/docs
- Getting started: https://dashboard.ngrok.com/get-started
- API reference: https://ngrok.com/docs/api

### AEGIS Light Support
- Demo guide: [DEMO_QUICK_START.md](../DEMO_QUICK_START.md)
- Credentials: [DEMO_CREDENTIALS.md](../DEMO_CREDENTIALS.md)
- Deployment: [DEPLOYMENT.md](../DEPLOYMENT.md)

### Community
- ngrok Community: https://ngrok.com/slack
- Stack Overflow: Tag `ngrok`
- GitHub Issues: Project issues page

---

## Frequently Asked Questions

### Q: Do I need a paid ngrok account?
**A:** No, the free account works great for demos. Paid accounts offer custom subdomains and higher limits.

### Q: Will the URL stay the same?
**A:** Free account URLs change each time. Paid accounts get reserved domains.

### Q: Is ngrok secure for demos?
**A:** Yes, ngrok uses HTTPS and is safe for demo data. Don't use production data.

### Q: Can multiple people connect simultaneously?
**A:** Yes, free accounts support 40 connections/minute, enough for most demos.

### Q: Does ngrok work on mobile?
**A:** Yes! That's one of the main benefits. Share the ngrok URL with any mobile device.

### Q: What if ngrok is blocked by corporate firewall?
**A:** Try different regions (`--region=eu/ap/au`) or use alternative tunneling service.

### Q: Can I use ngrok for production?
**A:** Not recommended. Use proper hosting for production. ngrok is for demos and testing.

---

**Last Updated:** November 2024  
**ngrok Version:** 3.x  
**AEGIS Light Version:** 1.0
