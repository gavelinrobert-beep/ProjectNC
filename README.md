# AEGIS Light — Civil Logistics & Situational Awareness Platform

**Version 1.0.0 (Civil MVP) - Q1 2025**

[![Backend CI](https://github.com/gavelinrobert-beep/SYLON/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/gavelinrobert-beep/SYLON/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/gavelinrobert-beep/SYLON/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/gavelinrobert-beep/SYLON/actions/workflows/frontend-ci.yml)
[![Docker Build](https://github.com/gavelinrobert-beep/SYLON/actions/workflows/docker-build.yml/badge.svg)](https://github.com/gavelinrobert-beep/SYLON/actions/workflows/docker-build.yml)
[![Security Scanning](https://github.com/gavelinrobert-beep/SYLON/actions/workflows/security.yml/badge.svg)](https://github.com/gavelinrobert-beep/SYLON/actions/workflows/security.yml)
[![codecov](https://codecov.io/gh/gavelinrobert-beep/SYLON/branch/master/graph/badge.svg)](https://codecov.io/gh/gavelinrobert-beep/SYLON)

AEGIS Light is a secure, cloud-based logistics and coordination platform designed for:
- 🏛️ **Municipalities** - Track vehicles, equipment, and field personnel for public works
- 🏗️ **Contractors** - Coordinate resources, equipment tracking, and project operations
- 🚨 **Emergency Response** - Civil defense, incident management, resource coordination
- 🚛 **Logistics Companies** - Fleet management, delivery tracking, route optimization
- 🛠️ **Public Works** - Infrastructure maintenance, crew coordination, asset management

> "A platform for real-time coordination and resource management for municipalities, contractors, and emergency response organizations."

This is the **civilian MVP version**, focused on real-time situational awareness, resource tracking, and field coordination without military dependencies or terminology.

---

## ✨ Features

### Core Capabilities
- 📍 **Live Asset Tracking** - Real-time location of vehicles, machines, and staff
- 🗺️ **Map-Based Visualization** - Interactive map with Leaflet/OpenStreetMap
- 📊 **Status Dashboard** - Fuel levels, availability, task progress
- 📋 **Task Management** - Work orders, assignments, route planning
- 📦 **Inventory Management** - Track supplies and equipment
- 📱 **Offline Support** - Field-ready with offline capabilities
- 👥 **Role-Based Access** - Municipality Admin, Contractor, Operator, Viewer
- 📄 **Export Tools** - Generate PDF and CSV reports

### Technical Stack
- **Backend**: FastAPI (Python) with PostgreSQL
- **Frontend**: React + Leaflet for mapping
- **Real-time**: Server-Sent Events (SSE) for live updates
- **Deployment**: Docker Compose for easy setup
- **Security**: JWT authentication with role-based access control

---

## 🚀 Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM (8GB recommended)

### Installation

1. **Clone and navigate**
   ```bash
   cd Aegis
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings (see DEPLOYMENT.md)
   ```

3. **Start the platform**
   ```bash
   docker compose up --build
   ```

4. **Access the application**
   - 🌐 Frontend: http://localhost:5173
   - 📚 API Docs: http://localhost:8000/docs
   - 🔑 Login: `admin@aegis.local` / `admin123`

⚠️ **Change default credentials after first login!**

---

## 📁 Project Structure

```
Aegis/
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── routes/   # API endpoints
│   │   ├── models.py # Data models
│   │   ├── auth.py   # Authentication
│   │   └── main.py   # Application entry
│   ├── init.sql      # Database schema
│   └── Dockerfile
├── frontend/          # React application
│   ├── src/
│   │   ├── pages/    # Main pages
│   │   ├── components/ # Reusable components
│   │   ├── lib/      # API client & utilities
│   │   └── App.jsx   # Root component
│   └── Dockerfile
├── compose.yaml       # Docker Compose configuration
├── .env.example       # Environment template
├── DEPLOYMENT.md      # Deployment guide
└── README.md         # This file
```

---

## 🔧 Configuration

See `.env.example` for all configuration options. Key settings:

```bash
# Security (REQUIRED for production)
JWT_SECRET=your-secret-key-here

# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres

# API Access
CORS_ORIGINS=http://localhost:5173

# Optional Features
OPENWEATHER_API_KEY=your-api-key  # For weather data
VITE_MAPBOX_TOKEN=your-token      # For enhanced maps
```

Full deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📖 Documentation

- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions
- **[API Documentation](http://localhost:8000/docs)** - Interactive API explorer (after starting)
- **[User Guide](./docs/USER_GUIDE.md)** - End-user documentation
- **[Security Guide](./docs/SECURITY.md)** - Security best practices

---

## 🎯 Use Cases

### Municipality Fleet Management
- Track snow plows, garbage trucks, maintenance vehicles
- Monitor fuel levels and maintenance schedules
- Optimize routes and resource allocation

### Emergency Response Coordination
- Real-time positioning of response teams
- Resource tracking during incidents
- Communication and status updates

### Construction & Contractor Operations
- Equipment location and availability
- Project resource management
- Field report submission with photos

### Public Works Infrastructure
- Maintenance crew tracking
- Equipment and supply management
- Work order coordination

---

## 👥 User Roles

1. **Municipality Admin**
   - Full system access and configuration
   - User management
   - Report generation

2. **Contractor**
   - View and update assigned assets
   - Submit field reports
   - Limited mission planning

3. **Field Operator**
   - Mobile access
   - Update asset status
   - Submit reports with photos

4. **Viewer**
   - Read-only dashboard access
   - Export reports

---

## 🔒 Security

AEGIS Light follows security best practices:
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Environment-based configuration
- ✅ HTTPS support (with reverse proxy)
- ✅ No classified or defense dependencies
- ✅ Audit logging ready

**For production deployments**, see our [Security Guide](./docs/SECURITY.md).

---

## 🛠️ Development

### Running in Development Mode

```bash
# Backend (with hot reload)
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (with hot reload)
cd frontend
npm install
npm run dev
```

### Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests  
cd frontend
npm test
```

---

## 🗺️ Roadmap

### Phase 1: Civil MVP (Q1 2025) ✅
- Core asset tracking and mapping
- Mission planning
- Basic inventory management
- User authentication and roles

### Phase 2: Field Companion (Q2 2025)
- Mobile app (React Native/Capacitor)
- Offline-first architecture
- Enhanced field reports with photos
- Push notifications

### Phase 3: Advanced Features (Q3 2025)
- Tactical planner with simulations
- Advanced analytics and reporting
- Integration APIs for third-party systems
- Multi-tenant support

### Phase 4: Enterprise (Q4 2025)
- High-availability deployment
- Advanced security features
- Custom integrations
- SLA support

---

## 💼 Support & Contact

- **Documentation**: https://docs.aegis-light.com
- **Issues**: https://github.com/your-org/aegis-light/issues
- **Email**: support@aegis-light.com
- **Commercial**: enterprise@aegis-light.com

---

## 📜 License

AEGIS Light is released under the MIT License.
See [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with support from municipalities, contractors, and civil defense organizations.
Special thanks to the open-source community.

---

**AEGIS Light** - Professional logistics made simple.
*Civilian deployment. No classified data. Production-ready.*
