# AEGIS — Komplett startpaket

Detta paket innehåller backend (FastAPI), frontend (React/Leaflet), SQL-bootstrap och Docker Compose.

## Snabbstart
```bash
cd Aegis
cp .env.sample .env
docker compose up --build
```
Öppna:
- API: http://localhost:8000/docs
- Frontend: http://localhost:5173

## Skicka in ett demo-larm
```bash
cd tools/cli
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python aegis_mock_cli.py --post-url http://localhost:8000/alerts
```

## Struktur
- `backend/` – FastAPI API (SSE, alerts, geofences, trail)
- `frontend/` – React + Leaflet karta, paneler och ikoner
- `sql/` – `aegis_postgres_bootstrap.sql` (körs automatiskt första gången DB startas)
- `compose.yaml` – startar db, api, frontend
- `.env.sample` – ändra portar/CORS
- `tools/cli/` – litet script för att posta alerts

admin login
Email: admin@aegis.local
Password: admin123