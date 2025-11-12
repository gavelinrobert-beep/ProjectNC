-- Initialize AEGIS Light Database Schema
-- Civil Logistics & Situational Awareness Platform

-- Geofences table
CREATE TABLE IF NOT EXISTS geofences (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    polygon JSONB NOT NULL
);

-- Alerts table
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

-- Facilities table (locations, depots, distribution centers)
CREATE TABLE IF NOT EXISTS facilities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    capacity INT,
    assets_stored JSONB,
    description TEXT
);

-- Legacy alias for backwards compatibility
CREATE VIEW IF NOT EXISTS bases AS SELECT * FROM facilities;

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
    home_facility_id TEXT,
    heading FLOAT DEFAULT 0
);

-- Tasks table (work orders, assignments)
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    name TEXT,
    task_type TEXT,
    status TEXT DEFAULT 'pending',
    asset_id TEXT,
    waypoints JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legacy alias for backwards compatibility
CREATE VIEW IF NOT EXISTS missions AS SELECT * FROM tasks;

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

-- Insert sample civilian facilities
INSERT INTO facilities (id, name, type, lat, lon, capacity, description) VALUES
    ('FAC-01', 'Stockholm Central Hub', 'distribution_center', 59.3293, 18.0686, 50, 'Main distribution center for Stockholm region'),
    ('FAC-02', 'Gotland Regional Depot', 'warehouse', 57.6348, 18.2948, 30, 'Island distribution warehouse'),
    ('FAC-03', 'Malmö South Warehouse', 'warehouse', 55.6050, 13.0038, 40, 'Southern region logistics warehouse')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_facilities_type ON facilities(type);