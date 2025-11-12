# AEGIS Light — Civil Logistics & Situational Awareness Platform

**Version 1.0.0 (Civil MVP) - Q1 2025**

A secure, cloud-based logistics and coordination platform designed for municipalities, contractors, and civil defense organizations.

## 🚀 Quick Start

```bash
cd Aegis
cp .env.example .env
docker compose up --build
```

**Access the application:**
- 🌐 Frontend: http://localhost:5173
- 📚 API Documentation: http://localhost:8000/docs
- 🔑 Default Login: `admin@aegis.local` / `admin123`

⚠️ **Change default credentials immediately!**

## ✨ Features

### Core Capabilities
- 📍 **Live Asset Tracking** - Real-time location of vehicles and equipment
- 🗺️ **Interactive Map** - Leaflet-based visualization with offline support
- 📊 **Dashboard** - Overview of operations and key metrics
- 📋 **Mission Planning** - Route planning and task assignment
- 📦 **Inventory Management** - Track supplies and equipment
- 📝 **Field Reports** - Submit status updates with photos (offline-capable)
- 📤 **Export Tools** - Generate CSV reports for all entities
- 👥 **Role-Based Access** - Admin, Contractor, Operator, Viewer roles
- 🔒 **Security** - JWT authentication with RBAC

### Technical Stack
- **Backend**: FastAPI (Python) with PostgreSQL
- **Frontend**: React + Leaflet + TypeScript
- **Real-time**: Server-Sent Events (SSE)
- **Deployment**: Docker Compose
- **PWA**: Service workers for offline support

## 📁 Project Structure

```
Aegis/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── routes/      # API endpoints (assets, missions, exports, field_reports)
│   │   ├── models.py    # Pydantic data models
│   │   ├── auth.py      # JWT authentication
│   │   └── main.py      # Application entry point
│   ├── init.sql         # Database schema
│   └── requirements.txt
├── frontend/            # React application
│   ├── src/
│   │   ├── pages/      # Main pages (Dashboard, Operations, etc.)
│   │   ├── components/ # Reusable components
│   │   ├── lib/        # API client & utilities
│   │   └── App.jsx     # Root component
│   ├── tsconfig.json   # TypeScript configuration
│   └── public/
│       ├── service-worker.js  # Offline support
│       └── manifest.json      # PWA configuration
├── docs/                # Documentation
│   ├── USER_GUIDE.md   # End-user guide
│   └── SECURITY.md     # Security best practices
├── compose.yaml         # Docker Compose configuration
├── .env.example         # Environment template
├── DEPLOYMENT.md        # Production deployment guide
└── README.md           # This file
```

## 📖 Documentation

- **[Deployment Guide](./Aegis/DEPLOYMENT.md)** - Production deployment instructions
- **[API Documentation](http://localhost:8000/docs)** - Interactive API explorer
- **[User Guide](./Aegis/docs/USER_GUIDE.md)** - End-user documentation
- **[Security Guide](./Aegis/docs/SECURITY.md)** - Security best practices

## 🎯 Use Cases

- **Municipality Fleet Management**: Track vehicles, monitor fuel, optimize routes
- **Emergency Response**: Real-time team positioning and resource tracking
- **Construction Operations**: Equipment tracking and field reporting
- **Public Works**: Maintenance crew coordination and inventory management

## 🔒 Security Features

- ✅ JWT-based authentication with configurable expiration
- ✅ Role-based access control (RBAC)
- ✅ Environment-based configuration (no hardcoded secrets)
- ✅ HTTPS/TLS ready
- ✅ Audit logging capability
- ✅ No classified or defense dependencies

## 📱 Progressive Web App

- Install as native app on iOS/Android
- Offline functionality for field operations
- Service worker caching for maps and data
- Background sync for queued requests
- Push notification support

## 🛠️ Development

See [DEPLOYMENT.md](./Aegis/DEPLOYMENT.md) for detailed setup instructions.

**Quick development mode:**
```bash
# Backend
cd Aegis/backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd Aegis/frontend
npm install
npm run dev
```

## 🗺️ Roadmap

- **Phase 1: Civil MVP (Q1 2025)** ✅ Current
- **Phase 2: Mobile App (Q2 2025)** - React Native companion app
- **Phase 3: Advanced Features (Q3 2025)** - Analytics and integrations
- **Phase 4: Enterprise (Q4 2025)** - High availability and SLA support

## 📜 License

AEGIS Light is released under the MIT License.

## 💼 Support

- **Documentation**: Full guides available in `/docs`
- **Issues**: Report on GitHub Issues
- **Commercial Support**: enterprise@aegis-light.com

---

**AEGIS Light** - Professional logistics made simple.
*Civilian deployment. No classified data. Production-ready.*
