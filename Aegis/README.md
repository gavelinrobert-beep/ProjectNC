# AEGIS — Komplett startpaket

Detta paket innehåller backend (FastAPI), frontend (React/Leaflet), SQL-bootstrap och Docker Compose.

## Snabbstart
```bash
cd Aegis
docker compose build
docker compose up
```
Öppna:
- API: http://localhost:8000/docs
- Frontend: http://localhost:5173/


```

## Struktur
- `backend/` – FastAPI API (SSE, alerts, geofences, trail)
- `frontend/` – React + Leaflet karta, paneler och ikoner
- `sql/` – `aegis_postgres_bootstrap.sql` (körs automatiskt första gången DB startas)
- `compose.yaml` – startar db, api, frontend
- `.env.sample` – ändra portar/CORS
- `tools/cli/` – litet script för att posta alerts


