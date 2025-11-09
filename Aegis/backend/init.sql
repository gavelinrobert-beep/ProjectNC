-- Initialize Aegis Database Schema

-- Geofences table
CREATE TABLE IF NOT EXISTS geofences (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    polygon JSONB NOT NULL
);

-- Alerts table (with message and severity columns!)
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    asset_id TEXT NOT NULL,
    geofence_id TEXT,
    rule TEXT NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    ts TIMESTAMPTZ DEFAULT NOW(),
    severity TEXT DEFAULT 'warning',
    message TEXT DEFAULT '',
    color TEXT DEFAULT '#ff9800'
);

-- Bases table
CREATE TABLE IF NOT EXISTS bases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    capacity INT,
    assets_stored JSONB,
    description TEXT
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    route TEXT DEFAULT 'stationary',
    route_index FLOAT DEFAULT 0.0,
    speed FLOAT DEFAULT 0.0,
    status TEXT DEFAULT 'parked',
    battery FLOAT,
    battery_drain FLOAT DEFAULT 0.0,
    has_battery BOOLEAN DEFAULT FALSE,
    fuel_type TEXT DEFAULT 'diesel',
    in_geofence BOOLEAN DEFAULT FALSE,
    last_alarm_tick INT DEFAULT 0,
    fuel_level FLOAT DEFAULT 100.0,
    fuel_capacity FLOAT DEFAULT 100.0,
    fuel_consumption FLOAT DEFAULT 1.0,
    maintenance_status TEXT DEFAULT 'operational',
    last_maintenance TIMESTAMPTZ DEFAULT NOW(),
    home_base_id TEXT,
    heading FLOAT DEFAULT 0
);

-- Missions table
CREATE TABLE IF NOT EXISTS missions (
    id SERIAL PRIMARY KEY,
    name TEXT,
    mission_type TEXT,
    status TEXT DEFAULT 'pending',
    asset_id TEXT,
    waypoints JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    name TEXT,
    location_id TEXT,
    quantity INTEGER DEFAULT 0,
    unit TEXT,
    min_stock_level INTEGER DEFAULT 0
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample bases
INSERT INTO bases (id, name, type, lat, lon, capacity) VALUES
    ('BASE-01', 'Stockholm HQ', 'headquarters', 59.3293, 18.0686, 50),
    ('BASE-02', 'Gotland Forward Base', 'forward_base', 57.6348, 18.2948, 30),
    ('BASE-03', 'Malmö Supply Depot', 'supply_depot', 55.6050, 13.0038, 40)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);