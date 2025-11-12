# Project SYLON - Quick Start Guide

Get up and running with Project SYLON in under 5 minutes.

---

## 🚀 1. Prerequisites

- Docker Engine 20.10+ and Docker Compose 2.0+
- 4GB RAM minimum (8GB recommended)
- 10GB disk space

---

## ⚡ 2. Install & Run

```bash
# Clone repository (if not already cloned)
cd aegis2.0/Sylon

# Copy environment template
cp .env.example .env

# Start all services
docker compose up --build
```

**Wait for startup** (~2-3 minutes on first run)

---

## 🌐 3. Access the Application

Open your browser to:

- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs

**Login with**:
- Email: `admin@aegis.local`
- Password: `admin123`

⚠️ **Change password immediately after first login!**

---

## 📱 4. Key Features to Try

### Dashboard
- View operational overview
- Check asset statistics
- Monitor alerts and missions

### Live Map
- See real-time asset positions
- Click markers for details
- Toggle layers (assets, bases, geofences)

### Fleet & Resources
- View all vehicles and equipment
- Update asset status
- Check fuel levels and maintenance

### Tasks & Missions
- Create new missions
- Assign assets
- Track progress on map

### Field Reports
- Submit status updates
- Add photos from field
- Works offline!

### Export Data
- Go to Administration → Exports
- Download CSV for any entity
- Generate operations reports

---

## 🔧 5. Quick Configuration

Edit `.env` for basic configuration:

```bash
# Change JWT secret (REQUIRED for production!)
JWT_SECRET=your-secure-random-key-here

# Set your domain
CORS_ORIGINS=https://yourdomain.com
VITE_API_BASE=https://yourdomain.com

# Optional: Add weather API key
OPENWEATHER_API_KEY=your-api-key
```

---

## 📱 6. Install as Mobile App

### iOS (Safari)
1. Open http://localhost:5173 in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)
1. Open http://localhost:5173 in Chrome
2. Tap menu (⋮)
3. Select "Add to Home Screen"
4. Tap "Add"

---

## 🛑 7. Stop & Clean Up

```bash
# Stop services
docker compose down

# Stop and remove volumes (deletes data!)
docker compose down -v
```

---

## 📚 8. Next Steps

- **[Full Deployment Guide](./DEPLOYMENT.md)** - Production setup
- **[User Guide](./docs/USER_GUIDE.md)** - Feature documentation
- **[Security Guide](./docs/SECURITY.md)** - Best practices
- **[API Docs](http://localhost:8000/docs)** - Interactive API reference

---

## 🆘 Troubleshooting

### Can't connect to database?
```bash
# Check database logs
docker compose logs db

# Restart services
docker compose restart
```

### Frontend not loading?
```bash
# Rebuild frontend
docker compose up --build frontend

# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### Port already in use?
Edit `.env` and change ports:
```bash
API_PORT=8001
FRONTEND_PORT=5174
DB_PORT=5433
```

Then restart:
```bash
docker compose down
docker compose up
```

---

## 💡 Pro Tips

1. **Use Docker Dashboard** - Visual interface for container management
2. **Enable Auto-Start** - Add to Docker Desktop startup applications
3. **Bookmark Frontend** - Quick access to http://localhost:5173
4. **Try Offline Mode** - Disconnect internet and test functionality
5. **Export Regularly** - Download data backups via Administration → Exports

---

## 🎯 Common Tasks

### Add a New Asset
1. Go to **Fleet & Resources**
2. Click **+ Add Asset**
3. Fill in details (name, type, fuel type)
4. Click **Create**

### Create a Mission
1. Go to **Tasks & Missions**
2. Click **+ New Mission**
3. Add waypoints on map
4. Assign asset
5. Click **Create Mission**

### Submit Field Report
1. Go to **Situation Reports**
2. Click **+ New Report**
3. Fill in details
4. Attach photo (optional)
5. Click **Submit**

### Export Data
1. Go to **Administration** → **Exports**
2. Select entity to export
3. Click **Export CSV**
4. File downloads automatically

---

## 🔗 Quick Links

- Frontend: http://localhost:5173
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

---

## 📞 Support

- **Documentation**: Check `/docs` folder
- **Issues**: Create GitHub issue
- **Email**: support@sylon.com (if configured)

---

**Ready to go?** Start with `docker compose up --build` and visit http://localhost:5173 🚀
