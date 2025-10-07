-- AEGIS PostgreSQL Bootstrap (schema + demo)
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS assets(
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  serial TEXT,
  unit TEXT,
  sensitive_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS telemetry(
  asset_id TEXT REFERENCES assets(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  temp DOUBLE PRECISION,
  battery DOUBLE PRECISION,
  source TEXT,
  rssi INT,
  meta_json JSONB,
  geom GEOGRAPHY(Point, 4326),
  PRIMARY KEY (asset_id, ts)
);

CREATE TABLE IF NOT EXISTS alerts(
  id BIGSERIAL PRIMARY KEY,
  rule TEXT NOT NULL,
  asset_id TEXT,
  severity TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  data_json JSONB
);

CREATE TABLE IF NOT EXISTS geofences(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  polygon JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS geofences_set_updated_at ON geofences;
CREATE TRIGGER geofences_set_updated_at
BEFORE UPDATE ON geofences
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX IF NOT EXISTS telemetry_ts_idx ON telemetry (ts DESC);
CREATE INDEX IF NOT EXISTS telemetry_geom_gix ON telemetry USING GIST(geom);
CREATE INDEX IF NOT EXISTS alerts_ts_idx ON alerts (ts DESC);
CREATE INDEX IF NOT EXISTS alerts_ll_idx ON alerts (lat, lon);

INSERT INTO assets(id, type, serial, unit) VALUES
  ('cont-0001','container','C-001','Unit A'),
  ('dev-0007','device','D-007','Unit B')
ON CONFLICT (id) DO NOTHING;

INSERT INTO geofences(id, name, polygon) VALUES
('zone-alpha','Zon Alpha','[[62.390,17.280],[62.390,17.370],[62.340,17.370],[62.340,17.280]]'::jsonb)
ON CONFLICT (id) DO NOTHING;

WITH pts AS (
  SELECT * FROM (VALUES
    ('cont-0001', now() - interval '120 seconds', 62.39251, 17.31204, 3.2, 0.56, 'edge-mock', -71),
    ('cont-0001', now() - interval '60 seconds',  62.39310, 17.31490, 3.3, 0.55, 'edge-mock', -70),
    ('cont-0001', now(),                          62.39420, 17.31710, 3.5, 0.55, 'edge-mock', -69)
  ) AS t(asset_id, ts, lat, lon, temp, battery, source, rssi)
)
INSERT INTO telemetry(asset_id, ts, lat, lon, temp, battery, source, rssi, geom)
SELECT asset_id, ts, lat, lon, temp, battery, source, rssi,
       ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
FROM pts
ON CONFLICT DO NOTHING;

INSERT INTO alerts(rule, asset_id, severity, ts, lat, lon, data_json) VALUES
('geofence_exit','cont-0001','critical', now() - interval '30 seconds', 62.39512, 17.32741, '{"note":"demo"}'),
('low_battery','dev-0007','warning', now() - interval '10 seconds', 62.39700, 17.30400, '{"battery":0.18}')
ON CONFLICT DO NOTHING;
