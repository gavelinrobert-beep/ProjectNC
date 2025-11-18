-- ============================================================================
-- AEGIS Light - Civil Logistics Platform Database Schema
-- Updated: 2025-01-12 for commercial logistics deployment
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- FACILITIES (formerly "bases")
-- ============================================================================
CREATE TABLE IF NOT EXISTS facilities (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- warehouse, distribution_center, depot, service_center, office, yard
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    capacity INT,
    description TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    operating_hours TEXT,
    zone_code TEXT,
    assets_stored JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legacy view for backward compatibility
CREATE OR REPLACE VIEW bases AS SELECT * FROM facilities;

-- ============================================================================
-- CUSTOMERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    customer_type TEXT NOT NULL DEFAULT 'business', -- business, individual, government, municipality
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    address_street TEXT NOT NULL,
    address_city TEXT NOT NULL,
    address_postal_code TEXT NOT NULL,
    address_country TEXT DEFAULT 'Sweden',
    delivery_lat FLOAT,
    delivery_lon FLOAT,
    organization_number TEXT,
    billing_account TEXT,
    service_level TEXT DEFAULT 'standard', -- standard, express, same_day, economy
    access_instructions TEXT,
    preferred_delivery_window TEXT,
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_active ON customers(active);
CREATE INDEX idx_customers_postal_code ON customers(address_postal_code);

-- ============================================================================
-- DRIVERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    employee_number TEXT UNIQUE,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    license_number TEXT NOT NULL,
    license_type TEXT NOT NULL, -- B, C, CE, etc.
    license_expiry DATE NOT NULL,
    adr_certified BOOLEAN DEFAULT FALSE,
    adr_expiry DATE,
    forklift_certified BOOLEAN DEFAULT FALSE,
    home_facility_id TEXT REFERENCES facilities(id),
    role TEXT DEFAULT 'driver', -- driver, operator, dispatcher, manager
    employment_status TEXT DEFAULT 'active', -- active, on_leave, inactive
    daily_driving_limit_minutes INT DEFAULT 540, -- 9 hours EU default
    weekly_driving_limit_minutes INT DEFAULT 3360, -- 56 hours EU limit
    assigned_vehicle_id TEXT,
    current_shift_start TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drivers_status ON drivers(employment_status);
CREATE INDEX idx_drivers_license_expiry ON drivers(license_expiry);

-- ============================================================================
-- DRIVER HOURS LOG (EU Compliance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS driver_hours_log (
    id SERIAL PRIMARY KEY,
    driver_id TEXT NOT NULL REFERENCES drivers(id),
    shift_date DATE NOT NULL,
    shift_start TIMESTAMPTZ NOT NULL,
    shift_end TIMESTAMPTZ,
    driving_minutes INT DEFAULT 0,
    break_minutes INT DEFAULT 0,
    other_work_minutes INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(driver_id, shift_date)
);

CREATE INDEX idx_driver_hours_date ON driver_hours_log(shift_date);
CREATE INDEX idx_driver_hours_driver ON driver_hours_log(driver_id);

-- ============================================================================
-- VEHICLES/ASSETS (Updated)
-- ============================================================================
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    type TEXT NOT NULL, -- van, truck, trailer, forklift, cargo_bike, car
    registration_number TEXT,
    vin TEXT,
    make TEXT,
    model TEXT,
    year INT,

    -- Location
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    route TEXT DEFAULT 'stationary',
    route_index FLOAT DEFAULT 0.0,
    speed FLOAT DEFAULT 0.0,
    heading FLOAT DEFAULT 0,
    status TEXT DEFAULT 'available', -- available, in_use, parked, maintenance, out_of_service

    -- Capacity
    cargo_capacity_kg FLOAT,
    cargo_volume_m3 FLOAT,
    pallet_capacity INT,

    -- Fuel/Energy
    fuel_type TEXT DEFAULT 'diesel',
    fuel_level FLOAT DEFAULT 100.0,
    fuel_capacity FLOAT DEFAULT 100.0,
    fuel_consumption_rate FLOAT DEFAULT 8.0, -- liters per 100km
    has_battery BOOLEAN DEFAULT FALSE,
    battery FLOAT,
    battery_capacity_kwh FLOAT,
    battery_drain FLOAT DEFAULT 0.0,

    -- Maintenance
    operating_hours FLOAT DEFAULT 0.0,
    odometer_km FLOAT DEFAULT 0.0,
    maintenance_hours FLOAT DEFAULT 200.0,
    maintenance_km FLOAT DEFAULT 10000.0,
    last_maintenance TIMESTAMPTZ,
    next_maintenance_due DATE,
    maintenance_status TEXT DEFAULT 'operational',

    -- Compliance
    insurance_expiry DATE,
    inspection_expiry DATE,
    tachograph_equipped BOOLEAN DEFAULT FALSE,

    -- Assignment
    home_facility_id TEXT REFERENCES facilities(id),
    current_driver_id TEXT REFERENCES drivers(id),
    assigned_to_customer_id TEXT REFERENCES customers(id),

    -- Features
    refrigerated BOOLEAN DEFAULT FALSE,
    tail_lift BOOLEAN DEFAULT FALSE,
    gps_tracker_id TEXT,

    -- Legacy fields
    in_geofence BOOLEAN DEFAULT FALSE,
    last_alarm_tick INT DEFAULT 0,
    home_base_id TEXT, -- For backward compatibility
    capacity INT,
    assets_stored JSONB,

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_driver ON assets(current_driver_id);
CREATE INDEX idx_assets_facility ON assets(home_facility_id);
CREATE INDEX idx_assets_maintenance ON assets(next_maintenance_due);

-- ============================================================================
-- SHIPMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    tracking_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    customer_reference TEXT,

    -- Origin and destination
    origin_facility_id TEXT NOT NULL REFERENCES facilities(id),
    destination_facility_id TEXT REFERENCES facilities(id),
    destination_customer_id TEXT REFERENCES customers(id),
    delivery_address TEXT,
    delivery_lat FLOAT,
    delivery_lon FLOAT,

    -- Shipment details
    items JSONB NOT NULL, -- Array of ShipmentItem
    total_weight_kg FLOAT,
    total_volume_m3 FLOAT,

    -- Service and timing
    service_level TEXT DEFAULT 'standard',
    requested_pickup_date DATE,
    requested_delivery_date DATE,
    delivery_time_window TEXT,

    -- Status
    status TEXT DEFAULT 'created', -- created, picked_up, in_transit, out_for_delivery, delivered, failed, cancelled, returned
    priority TEXT DEFAULT 'normal', -- low, normal, high, urgent

    -- Assignment
    assigned_vehicle_id TEXT REFERENCES assets(id),
    assigned_driver_id TEXT REFERENCES drivers(id),
    assigned_task_id TEXT,

    -- Special handling
    requires_signature BOOLEAN DEFAULT TRUE,
    requires_photo_proof BOOLEAN DEFAULT FALSE,
    special_instructions TEXT,

    -- Pricing
    estimated_cost FLOAT,
    currency TEXT DEFAULT 'SEK',

    -- Tracking
    actual_pickup_time TIMESTAMPTZ,
    actual_delivery_time TIMESTAMPTZ,
    delivery_attempts INT DEFAULT 0,

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX idx_shipments_customer ON shipments(customer_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_delivery_date ON shipments(requested_delivery_date);
CREATE INDEX idx_shipments_vehicle ON shipments(assigned_vehicle_id);

-- ============================================================================
-- SHIPMENT EVENTS (Tracking History)
-- ============================================================================
CREATE TABLE IF NOT EXISTS shipment_events (
    id SERIAL PRIMARY KEY,
    shipment_id TEXT NOT NULL REFERENCES shipments(id),
    event_type TEXT NOT NULL, -- created, picked_up, in_transit, arrived_at_facility, out_for_delivery, delivered, exception
    status TEXT NOT NULL,
    location_facility_id TEXT REFERENCES facilities(id),
    location_lat FLOAT,
    location_lon FLOAT,
    vehicle_id TEXT REFERENCES assets(id),
    driver_id TEXT REFERENCES drivers(id),
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipment_events_shipment ON shipment_events(shipment_id);
CREATE INDEX idx_shipment_events_timestamp ON shipment_events(timestamp DESC);

-- ============================================================================
-- PROOF OF DELIVERY
-- ============================================================================
CREATE TABLE IF NOT EXISTS proof_of_delivery (
    id SERIAL PRIMARY KEY,
    shipment_id TEXT NOT NULL REFERENCES shipments(id) UNIQUE,
    delivered_at TIMESTAMPTZ NOT NULL,
    delivered_by_driver_id TEXT NOT NULL REFERENCES drivers(id),
    delivery_lat FLOAT NOT NULL,
    delivery_lon FLOAT NOT NULL,
    recipient_name TEXT,
    signature_image_url TEXT,
    photo_urls JSONB, -- Array of photo URLs
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pod_shipment ON proof_of_delivery(shipment_id);

-- ============================================================================
-- TASKS (formerly "missions")
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    description TEXT,

    -- Assignment
    assigned_vehicle_id TEXT REFERENCES assets(id),
    assigned_driver_id TEXT REFERENCES drivers(id),

    -- Route
    waypoints JSONB NOT NULL, -- Array of Waypoint objects
    estimated_duration_minutes INT,
    estimated_distance_km FLOAT,

    -- Status
    status TEXT DEFAULT 'planned', -- planned, assigned, in_progress, completed, cancelled, failed
    priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
    task_type TEXT DEFAULT 'delivery', -- delivery, pickup, transfer, service, inspection, multi_stop

    -- Facilities
    source_facility_id TEXT REFERENCES facilities(id),
    destination_facility_id TEXT REFERENCES facilities(id),

    -- Linked shipments
    shipment_ids JSONB, -- Array of shipment IDs

    -- Timing
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,

    -- Proof of Delivery (Week 1 MVP)
    signature_image TEXT, -- Base64 PNG signature
    delivered_to TEXT, -- Recipient name
    photo_url TEXT, -- Delivery photo URL
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    driver_notes TEXT,

    -- Legacy fields
    asset_id TEXT, -- Same as assigned_vehicle_id
    mission_type TEXT,
    source_base_id TEXT,
    destination_base_id TEXT,
    transfer_items JSONB,

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_vehicle ON tasks(assigned_vehicle_id);
CREATE INDEX idx_tasks_driver ON tasks(assigned_driver_id);
CREATE INDEX idx_tasks_scheduled ON tasks(scheduled_start);

-- Legacy view for backward compatibility
CREATE OR REPLACE VIEW missions AS SELECT * FROM tasks;

-- ============================================================================
-- USERS (Updated)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT DEFAULT 'viewer', -- admin, dispatcher, driver, manager, viewer, customer
    phone TEXT,
    facility_id TEXT REFERENCES facilities(id),
    driver_id TEXT REFERENCES drivers(id),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(active);

-- ============================================================================
-- INVENTORY (Updated)
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- fuel, spare_parts, equipment, consumable, pallet, packaging
    category TEXT NOT NULL,
    quantity FLOAT NOT NULL DEFAULT 0,
    unit TEXT NOT NULL, -- liters, kg, units, boxes, pallets
    weight_per_unit FLOAT,
    volume_per_unit FLOAT,
    location_type TEXT DEFAULT 'facility', -- facility, vehicle
    location_id TEXT NOT NULL,
    zone TEXT, -- Warehouse zone/aisle/bin
    min_stock_level FLOAT DEFAULT 0,
    max_stock_level FLOAT,
    reorder_point FLOAT,
    sku TEXT,
    barcode TEXT,
    supplier TEXT,
    supplier_part_number TEXT,
    batch_number TEXT,
    serial_number TEXT,
    expiration_date DATE,
    unit_cost FLOAT,
    currency TEXT DEFAULT 'SEK',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_inventory_sku ON inventory(sku);
CREATE INDEX idx_inventory_barcode ON inventory(barcode);
CREATE INDEX idx_inventory_expiry ON inventory(expiration_date);

-- ============================================================================
-- INVENTORY TRANSACTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id SERIAL PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES inventory(id),
    transaction_type TEXT NOT NULL, -- add, remove, transfer, adjust, consume, restock, return
    quantity FLOAT NOT NULL,
    from_location_type TEXT,
    from_location_id TEXT,
    to_location_type TEXT,
    to_location_id TEXT,
    vehicle_id TEXT REFERENCES assets(id),
    driver_id TEXT REFERENCES drivers(id),
    shipment_id TEXT REFERENCES shipments(id),
    task_id TEXT REFERENCES tasks(id),
    reason TEXT,
    reference_number TEXT,
    user_email TEXT,
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inv_trans_item ON inventory_transactions(item_id);
CREATE INDEX idx_inv_trans_timestamp ON inventory_transactions(timestamp DESC);

-- ============================================================================
-- INCIDENTS (for MSB compliance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    incident_type TEXT NOT NULL, -- accident, breakdown, delay, theft, damage, safety, security, environmental, customer_complaint, other
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_lat FLOAT,
    location_lon FLOAT,
    location_description TEXT,
    facility_id TEXT REFERENCES facilities(id),
    reported_by_user_id TEXT NOT NULL REFERENCES users(id),
    vehicle_id TEXT REFERENCES assets(id),
    driver_id TEXT REFERENCES drivers(id),
    customer_id TEXT REFERENCES customers(id),
    shipment_ids JSONB, -- Array of shipment IDs
    status TEXT DEFAULT 'reported', -- reported, acknowledged, investigating, resolved, closed
    resolution_notes TEXT,
    photo_urls JSONB,
    document_urls JSONB,
    requires_followup BOOLEAN DEFAULT FALSE,
    assigned_to_user_id TEXT REFERENCES users(id),
    reported_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_reported_at ON incidents(reported_at DESC);

-- ============================================================================
-- GEOFENCES (unchanged)
-- ============================================================================
CREATE TABLE IF NOT EXISTS geofences (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    polygon JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ALERTS (unchanged)
-- ============================================================================
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

CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX idx_alerts_asset ON alerts(asset_id);

-- ============================================================================
-- SAMPLE DATA (Civil/Commercial)
-- ============================================================================

-- Sample facilities
INSERT INTO facilities (id, name, type, lat, lon, capacity, contact_phone, operating_hours) VALUES
    ('FAC-STH-01', 'Stockholm Distribution Center', 'distribution_center', 59.3293, 18.0686, 500, '+46-8-123-4567', '06:00-22:00'),
    ('FAC-GBG-01', 'Göteborg Warehouse', 'warehouse', 57.7089, 11.9746, 300, '+46-31-123-4567', '07:00-19:00'),
    ('FAC-MAL-01', 'Malmö Service Center', 'service_center', 55.6050, 13.0038, 200, '+46-40-123-4567', '08:00-17:00')
ON CONFLICT (id) DO NOTHING;

-- Sample customers
INSERT INTO customers (id, name, customer_type, contact_name, contact_phone, contact_email,
    address_street, address_city, address_postal_code, service_level) VALUES
    ('CUST-001', 'IKEA Sverige AB', 'business', 'Anna Andersson', '+46-70-111-2222', 'anna@ikea.se',
     'Älmhult Center', 'Älmhult', '343 81', 'express'),
    ('CUST-002', 'MSB - Myndigheten för samhällsskydd', 'government', 'Erik Svensson', '+46-10-240-5000', 'erik.svensson@msb.se',
     'Karlavägen 100', 'Stockholm', '115 26', 'urgent'),
    ('CUST-003', 'Stockholm Kommun', 'municipality', 'Maria Johansson', '+46-8-508-290-00', 'maria.johansson@stockholm.se',
     'Hantverkargatan 15', 'Stockholm', '104 20', 'standard')
ON CONFLICT (id) DO NOTHING;

-- Sample drivers
INSERT INTO drivers (id, first_name, last_name, employee_number, phone, email, license_number,
    license_type, license_expiry, home_facility_id) VALUES
    ('DRV-001', 'Johan', 'Karlsson', 'EMP-1001', '+46-70-123-4567', 'johan.k@example.com',
     'SE-12345678', 'CE', '2027-06-15', 'FAC-STH-01'),
    ('DRV-002', 'Sara', 'Lindberg', 'EMP-1002', '+46-70-234-5678', 'sara.l@example.com',
     'SE-23456789', 'C', '2026-12-20', 'FAC-GBG-01')
ON CONFLICT (id) DO NOTHING;

-- Sample admin user (password: admin123)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, facility_id) VALUES
    ('USER-001', 'admin@aegis.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU8zrwjJQOSa',
     'Admin', 'User', 'admin', 'FAC-STH-01')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Auto-update timestamp on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Phase 2 Inventory Enhancements
-- ============================================================================
\i /docker-entrypoint-initdb.d/migrations/001_inventory_phase2.sql
\i /docker-entrypoint-initdb.d/migrations/002_inventory_seed_data.sql