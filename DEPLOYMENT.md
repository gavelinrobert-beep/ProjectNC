# AEGIS Light - Deployment Guide

## 🎯 Overview

AEGIS Light is a **civilian logistics and situational awareness platform** designed for:
- **Municipalities**: Track vehicles, equipment, and field personnel
- **Contractors**: Coordinate resources and operations
- **Civil Defense**: Emergency response and resource management
- **Public Works**: Infrastructure maintenance tracking

This guide will help you deploy AEGIS Light in your organization.

---

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum (8GB recommended)
- 10GB disk space

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/aegis-light.git
   cd aegis-light/Aegis
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit configuration
   ```

3. **Start the platform**
   ```bash
   docker compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - API Documentation: http://localhost:8000/docs
   - Database: localhost:5432

5. **Login with default credentials**
   - Email: `admin@aegis.local`
   - Password: `admin123`
   
   ⚠️ **Change these immediately after first login!**

---

## 🔧 Configuration

### Essential Settings

Edit your `.env` file before deployment:

```bash
# 1. Change the JWT secret (REQUIRED for production)
JWT_SECRET=$(openssl rand -hex 32)

# 2. Set your domain/IP
CORS_ORIGINS=https://yourdomain.com
VITE_API_BASE=https://yourdomain.com/api

# 3. Configure database (if using external DB)
DATABASE_URL=postgresql://user:pass@db-host:5432/aegis

# 4. Add weather API key (optional)
OPENWEATHER_API_KEY=your_api_key_here
```

### Map Configuration

**Option 1: OpenStreetMap (Default - Free)**
- No configuration needed
- Works offline with cached tiles
- Good for most use cases

**Option 2: Mapbox (Enhanced)**
- Register at https://www.mapbox.com/
- Add token to `.env`: `VITE_MAPBOX_TOKEN=your_token`
- Provides satellite imagery and enhanced features

---

## 🏢 Production Deployment

### Docker Compose (Recommended)

Create a `docker-compose.prod.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: aegis
    volumes:
      - aegis_data:/var/lib/postgresql/data
    restart: always

  api:
    build: ./backend
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGINS: ${CORS_ORIGINS}
    depends_on:
      - db
    restart: always

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_BASE: ${VITE_API_BASE}
    ports:
      - "80:80"
    restart: always
    
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "443:443"
    depends_on:
      - frontend
      - api
    restart: always

volumes:
  aegis_data:
```

Run with:
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Kubernetes (Enterprise)

Kubernetes manifests are available in `/k8s/` directory.

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change default JWT_SECRET
- [ ] Change default admin password
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable audit logging
- [ ] Review CORS origins
- [ ] Disable debug mode
- [ ] Set up monitoring/alerts
- [ ] Document disaster recovery plan

---

## 👥 User Management

### Roles

1. **Municipality Admin**
   - Full system access
   - User management
   - Configuration changes
   - Export/report generation

2. **Contractor**
   - View and update assigned assets
   - Submit field reports
   - Limited mission planning

3. **Field Operator**
   - Mobile access
   - Update asset status
   - Submit reports with photos
   - Offline capabilities

4. **Viewer**
   - Read-only access
   - View dashboards
   - Export reports

### Creating Users

1. Login as admin
2. Navigate to **Administration** → **Users**
3. Click **Add User**
4. Fill in details and assign role
5. Send credentials securely

---

## 📊 Data Management

### Backup Strategy

**Automated Backups** (Recommended)
```bash
# Add to crontab
0 2 * * * docker exec aegis-db pg_dump -U postgres aegis > /backups/aegis_$(date +\%Y\%m\%d).sql
```

**Manual Backup**
```bash
docker exec aegis-db pg_dump -U postgres aegis > aegis_backup.sql
```

**Restore from Backup**
```bash
docker exec -i aegis-db psql -U postgres aegis < aegis_backup.sql
```

### Data Retention

Configure in `.env`:
```bash
DATA_RETENTION_DAYS=90  # Keep data for 90 days
```

Historical data older than this will be archived automatically.

---

## 🌐 Network Configuration

### Ports

- `5173`: Frontend (HTTP)
- `8000`: API (HTTP)
- `5432`: PostgreSQL (Internal)

### Firewall Rules

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow API (if external)
sudo ufw allow 8000/tcp

# Block database from external access
sudo ufw deny 5432/tcp
```

---

## 📱 Mobile/Tablet Access

### Field Operator App

The web interface is responsive and works on:
- iPads and Android tablets
- Modern smartphones
- Offline-capable with service workers

**For best experience:**
- Add to home screen for app-like experience
- Enable location services
- Allow camera access for field reports

---

## 🧪 Testing Your Deployment

Run health checks:

```bash
# API health
curl http://localhost:8000/health

# Database connection
docker exec aegis-db pg_isready -U postgres

# Frontend
curl http://localhost:5173
```

---

## 🆘 Troubleshooting

### Common Issues

**Problem: Can't connect to database**
```bash
# Check database logs
docker logs aegis-db

# Verify connection
docker exec aegis-db psql -U postgres -c "SELECT 1"
```

**Problem: Frontend can't reach API**
```bash
# Check CORS settings in .env
CORS_ORIGINS=http://localhost:5173

# Verify API is running
curl http://localhost:8000/health
```

**Problem: Authentication fails**
```bash
# Reset admin password
docker exec aegis-db psql -U postgres aegis -c "UPDATE users SET password_hash = '<new_hash>' WHERE username = 'admin'"
```

### Getting Help

- Documentation: https://docs.aegis-light.com
- Support: support@aegis-light.com
- Community Forum: https://community.aegis-light.com
- GitHub Issues: https://github.com/your-org/aegis-light/issues

---

## 📈 Monitoring & Maintenance

### Health Monitoring

Monitor these endpoints:
- `GET /health` - API health status
- `GET /api/metrics` - System metrics

### Log Management

```bash
# View logs
docker compose logs -f

# API logs only
docker compose logs -f api

# Save logs
docker compose logs > aegis_logs.txt
```

### Performance Tuning

For high-traffic deployments:
```yaml
# docker-compose.yml
services:
  db:
    environment:
      postgres_max_connections: 200
      postgres_shared_buffers: 256MB
```

---

## 🔄 Updates & Upgrades

### Minor Updates
```bash
git pull origin main
docker compose pull
docker compose up -d
```

### Major Upgrades
1. Backup database
2. Read CHANGELOG.md
3. Test in staging environment
4. Update production
5. Verify functionality

---

## 💼 Commercial Support

For municipalities and organizations requiring:
- Professional installation
- Custom integrations
- 24/7 support
- Training sessions
- SLA agreements

Contact: enterprise@aegis-light.com

---

## 📝 License

AEGIS Light is released under the MIT License.
See LICENSE file for details.

---

**Last Updated**: Q1 2025
**Version**: 1.0.0 (Civil MVP)
