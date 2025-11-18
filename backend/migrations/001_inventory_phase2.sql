-- ============================================================================
-- Inventory System Phase 2 Migration
-- Operation-Centric Design with Categories, Transfers, and Fuel Tracking
-- ============================================================================

-- ============================================================================
-- INVENTORY CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,  -- 'vehicle_equipment', 'cargo_delivery', 'facility_stock'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO inventory_categories (id, name, description) VALUES
    ('vehicle_equipment', 'Vehicle Equipment', 'Items permanently or semi-permanently assigned to vehicles (GPS, radios, safety equipment, tools)'),
    ('cargo_delivery', 'Cargo & Deliveries', 'Packages and items being delivered to customers'),
    ('facility_stock', 'Facility Stock', 'Items stored at warehouses/depots (maintenance parts, fuel reserves, equipment)')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ENHANCE INVENTORY TABLE
-- Add new fields for operational context
-- ============================================================================

-- Add category_id reference
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS category_id TEXT REFERENCES inventory_categories(id);

-- Add assignment fields
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS assigned_to_asset_id TEXT REFERENCES assets(id);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS assigned_to_facility_id TEXT REFERENCES facilities(id);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS assigned_to_shipment_id TEXT REFERENCES shipments(id);

-- Add status fields
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';
-- Status values: 'available', 'in_transit', 'assigned', 'needs_replacement', 'missing', 'delivered', 'returned', 'awaiting_pickup'

-- Add cargo/delivery specific fields
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10,2);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS dimensions_cm TEXT;  -- JSON: {"length": 50, "width": 30, "height": 20}
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS special_handling TEXT;  -- 'fragile', 'hazardous', 'temperature_controlled'
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS customer_info JSONB;  -- Pickup/delivery details
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS tracking_number TEXT UNIQUE;

-- Add maintenance tracking fields for vehicle equipment
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS last_inspection_date DATE;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS next_inspection_due DATE;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_asset ON inventory(assigned_to_asset_id);
CREATE INDEX IF NOT EXISTS idx_inventory_facility ON inventory(assigned_to_facility_id);
CREATE INDEX IF NOT EXISTS idx_inventory_shipment ON inventory(assigned_to_shipment_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_tracking ON inventory(tracking_number);

-- ============================================================================
-- INVENTORY TRANSFERS
-- Track movement of inventory between locations
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory_transfers (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    item_id TEXT REFERENCES inventory(id),
    from_location_type TEXT,  -- 'facility', 'vehicle'
    from_location_id TEXT,
    to_location_type TEXT,
    to_location_id TEXT,
    transfer_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending',  -- 'pending', 'in_transit', 'completed', 'failed'
    initiated_by TEXT,  -- User who initiated
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_transfer_item ON inventory_transfers(item_id);
CREATE INDEX IF NOT EXISTS idx_inv_transfer_status ON inventory_transfers(status);
CREATE INDEX IF NOT EXISTS idx_inv_transfer_date ON inventory_transfers(transfer_date DESC);

-- ============================================================================
-- FUEL TRACKING
-- Detailed fuel consumption and refueling tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS fuel_tracking (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    asset_id TEXT REFERENCES assets(id),
    facility_id TEXT REFERENCES facilities(id),
    quantity_liters DECIMAL(10,2) NOT NULL,
    cost_sek DECIMAL(10,2),
    odometer_km INTEGER,
    fuel_type TEXT DEFAULT 'diesel',  -- 'diesel', 'gasoline', 'electric'
    driver_id TEXT REFERENCES drivers(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_fuel_asset ON fuel_tracking(asset_id);
CREATE INDEX IF NOT EXISTS idx_fuel_facility ON fuel_tracking(facility_id);
CREATE INDEX IF NOT EXISTS idx_fuel_timestamp ON fuel_tracking(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_fuel_driver ON fuel_tracking(driver_id);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================
CREATE TRIGGER update_inventory_transfers_updated_at 
    BEFORE UPDATE ON inventory_transfers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
