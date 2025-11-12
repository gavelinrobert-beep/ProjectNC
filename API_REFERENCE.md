# Project SYLON - API Reference

Quick reference for all API endpoints in Project SYLON.

**Base URL**: `http://localhost:8000` (development)

**Authentication**: Bearer token in `Authorization` header
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication

### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "admin@aegis.local",
  "password": "admin123"
}

Response: {
  "access_token": "eyJ...",
  "role": "admin"
}
```

---

## 🚛 Assets (Fleet & Resources)

### List Assets
```http
GET /api/assets
Authorization: Bearer <token>

Response: [
  {
    "id": "ASSET-001",
    "type": "vehicle",
    "lat": 59.3293,
    "lon": 18.0686,
    "status": "mobile",
    "fuel_level": 75.5,
    "fuel_type": "diesel",
    ...
  }
]
```

### Create Asset
```http
POST /api/assets
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "ASSET-NEW",
  "type": "vehicle",
  "lat": 59.3293,
  "lon": 18.0686,
  "fuel_type": "diesel",
  "fuel_level": 100.0,
  "status": "parked"
}
```

### Update Asset
```http
PUT /api/assets/{asset_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "mobile",
  "fuel_level": 85.0,
  "lat": 59.3400,
  "lon": 18.0700
}
```

### Delete Asset
```http
DELETE /api/assets/{asset_id}
Authorization: Bearer <token>
```

---

## 📍 Bases (Locations)

### List Bases
```http
GET /api/bases
Authorization: Bearer <token>

Response: [
  {
    "id": "BASE-01",
    "name": "Main Depot",
    "type": "logistics",
    "lat": 59.3293,
    "lon": 18.0686,
    "capacity": 50
  }
]
```

### Create Base
```http
POST /api/bases
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "North Facility",
  "type": "logistics",
  "lat": 60.1699,
  "lon": 24.9384,
  "capacity": 30
}
```

### Delete Base
```http
DELETE /api/bases/{base_id}
Authorization: Bearer <token>
```

---

## 📋 Missions (Tasks)

### List Missions
```http
GET /api/missions
GET /api/missions?status=active
Authorization: Bearer <token>

Response: [
  {
    "id": "1",
    "name": "Route Inspection",
    "status": "active",
    "asset_id": "ASSET-001",
    "waypoints": [...],
    "priority": "medium"
  }
]
```

### Create Mission
```http
POST /api/missions
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Supply Delivery",
  "mission_type": "transfer",
  "asset_id": "ASSET-001",
  "priority": "high",
  "waypoints": [
    {"lat": 59.3293, "lon": 18.0686, "name": "Start"},
    {"lat": 59.3400, "lon": 18.0700, "name": "Destination"}
  ]
}
```

### Start Mission
```http
POST /api/missions/{mission_id}/start
Authorization: Bearer <token>
```

### Complete Mission
```http
POST /api/missions/{mission_id}/complete
Authorization: Bearer <token>
```

---

## 📦 Inventory

### List Inventory Items
```http
GET /api/inventory/items
GET /api/inventory/items?location_id=BASE-01
Authorization: Bearer <token>

Response: [
  {
    "id": "1",
    "name": "Diesel Fuel",
    "category": "fuel",
    "quantity": 5000,
    "unit": "liters",
    "location_id": "BASE-01"
  }
]
```

### Create Inventory Item
```http
POST /api/inventory/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Spare Parts",
  "category": "equipment",
  "quantity": 50,
  "unit": "units",
  "location_id": "BASE-01",
  "min_stock_level": 10
}
```

### Update Inventory Quantity
```http
PUT /api/inventory/items/{item_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 45
}
```

---

## 📝 Field Reports

### List Field Reports
```http
GET /api/field-reports
GET /api/field-reports?status=open
GET /api/field-reports?report_type=issue
Authorization: Bearer <token>

Response: [
  {
    "id": "uuid",
    "title": "Road Damage",
    "report_type": "issue",
    "severity": "high",
    "status": "open",
    "description": "Large pothole on Main St",
    "location_lat": 59.3293,
    "location_lon": 18.0686,
    "photos": [...],
    "created_at": "2025-01-12T10:30:00Z"
  }
]
```

### Create Field Report
```http
POST /api/field-reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Equipment Malfunction",
  "report_type": "issue",
  "description": "Hydraulic lift not working",
  "severity": "high",
  "asset_id": "ASSET-001",
  "location_name": "Workshop A",
  "photos": ["base64-encoded-image"]
}
```

### Update Field Report Status
```http
PUT /api/field-reports/{report_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved",
  "resolution_notes": "Hydraulic line replaced"
}
```

### Get Field Report Statistics
```http
GET /api/field-reports/statistics/summary
GET /api/field-reports/statistics/summary?days=30
Authorization: Bearer <token>

Response: {
  "total_reports": 45,
  "open_reports": 12,
  "resolved_reports": 30,
  "critical_reports": 3,
  "reports_by_type": {
    "issue": 20,
    "status": 15,
    "maintenance": 10
  }
}
```

---

## 📤 Exports

### Export Assets
```http
GET /api/exports/assets.csv
Authorization: Bearer <token>

Response: CSV file download
```

### Export Missions
```http
GET /api/exports/missions.csv
GET /api/exports/missions.csv?status=completed
Authorization: Bearer <token>

Response: CSV file download
```

### Export Inventory
```http
GET /api/exports/inventory.csv
GET /api/exports/inventory.csv?location_id=BASE-01
Authorization: Bearer <token>

Response: CSV file download
```

### Export Alerts
```http
GET /api/exports/alerts.csv
GET /api/exports/alerts.csv?acknowledged=false
Authorization: Bearer <token>

Response: CSV file download
```

### Export Bases
```http
GET /api/exports/bases.csv
Authorization: Bearer <token>

Response: CSV file download
```

### Export Operations Report
```http
GET /api/exports/operations-report.csv
GET /api/exports/operations-report.csv?start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer <token>

Response: CSV file download with summary statistics
```

---

## 🚨 Alerts

### List Alerts
```http
GET /api/alerts
Authorization: Bearer <token>

Response: [
  {
    "id": 1,
    "asset_id": "ASSET-001",
    "rule": "low_fuel",
    "severity": "warning",
    "message": "Fuel level below 20%",
    "acknowledged": false,
    "ts": "2025-01-12T10:30:00Z"
  }
]
```

### Acknowledge Alert
```http
PUT /api/alerts/{alert_id}/ack
Authorization: Bearer <token>
```

---

## 🔺 Geofences

### List Geofences
```http
GET /api/geofences
Authorization: Bearer <token>

Response: [
  {
    "id": "ZONE-01",
    "name": "City Center",
    "polygon": [[59.32, 18.06], [59.33, 18.07], ...]
  }
]
```

### Create Geofence
```http
POST /api/geofences
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Restricted Area",
  "polygon": [
    [59.3293, 18.0686],
    [59.3300, 18.0700],
    [59.3290, 18.0710]
  ]
}
```

---

## 🌡️ Weather

### Get Weather by Coordinates
```http
GET /api/weather?lat=59.3293&lon=18.0686
Authorization: Bearer <token>

Response: {
  "temperature": 5.2,
  "condition": "cloudy",
  "humidity": 75,
  "wind_speed": 12.5
}
```

### Get Weather by Base
```http
GET /api/weather/{base_id}
Authorization: Bearer <token>
```

---

## 📊 SSE Streams (Real-time Updates)

### Assets Stream
```http
GET /api/streams/assets
Authorization: Bearer <token>

Server-Sent Events stream with real-time asset updates
```

### Alerts Stream
```http
GET /api/streams/alerts
Authorization: Bearer <token>

Server-Sent Events stream with real-time alerts
```

---

## ❤️ Health Check

### Health Status
```http
GET /health

Response: {
  "ok": true
}
```

### API Health
```http
GET /api/health

Response: {
  "status": "healthy",
  "timestamp": "2025-01-12T10:30:00Z"
}
```

---

## 📱 Response Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 204  | No Content (successful deletion) |
| 400  | Bad Request (invalid input) |
| 401  | Unauthorized (missing/invalid token) |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found |
| 422  | Validation Error |
| 500  | Internal Server Error |

---

## 🔒 Authentication Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access - all operations |
| **contractor** | View and update assigned assets, create reports, export data |
| **operator** | Update asset status, submit field reports |
| **viewer** | Read-only access, limited exports |
| **anonymous** | No access (must login) |

---

## 💡 Tips

1. **Interactive Docs**: Visit http://localhost:8000/docs for interactive API testing
2. **Token Expiration**: Default 4 hours, configurable via `JWT_EXP_MIN`
3. **Rate Limiting**: Consider implementing for production
4. **Pagination**: Some endpoints support `page` and `perPage` parameters
5. **Filters**: Many GET endpoints support query parameters for filtering

---

## 🛠️ Example: Complete Workflow

```bash
# 1. Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aegis.local","password":"admin123"}'

# Save the token
TOKEN="eyJ..."

# 2. List assets
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/assets

# 3. Create field report
curl -X POST http://localhost:8000/api/field-reports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Report",
    "report_type": "status",
    "description": "All systems operational",
    "severity": "normal"
  }'

# 4. Export assets
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/exports/assets.csv \
  -o assets.csv
```

---

**Full interactive documentation**: http://localhost:8000/docs

**Version**: 1.0.0  
**Last Updated**: Q1 2025
