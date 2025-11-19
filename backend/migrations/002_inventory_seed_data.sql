-- ============================================================================
-- Inventory System Phase 2 - Seed Data
-- Realistic Swedish Logistics Inventory Data
-- ============================================================================

-- ============================================================================
-- VEHICLE EQUIPMENT INVENTORY
-- GPS devices, radios, safety equipment, tools assigned to vehicles
-- ============================================================================

-- Vehicle ABC 123 (Mercedes Sprinter) Equipment
INSERT INTO inventory (id, name, type, category, category_id, quantity, unit, 
    assigned_to_asset_id, status, last_inspection_date, next_inspection_due, description) VALUES
('INV-VEH-ABC123-GPS', 'GPS Tracker', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-01', 'assigned', '2025-11-10', '2026-05-10', 'Garmin Fleet 790 GPS-enhet'),
('INV-VEH-ABC123-RADIO', 'Communication Radio', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-01', 'assigned', '2025-11-01', '2026-11-01', 'Motorola DP4400e digital radio'),
('INV-VEH-ABC123-EXTINGUISHER', 'Fire Extinguisher', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-01', 'assigned', '2025-10-15', '2026-03-15', '6kg pulversläckare - kontroll 2026-03-15'),
('INV-VEH-ABC123-FIRSTAID', 'First Aid Kit', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-01', 'assigned', '2025-11-01', '2026-11-01', 'Komplett första hjälpen-kit för fordon'),
('INV-VEH-ABC123-TOOLS', 'Basic Tool Kit', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'set',
    'VEH-SND-01', 'assigned', '2025-10-01', NULL, 'Grundläggande verktygsats')
ON CONFLICT (id) DO NOTHING;

-- Vehicle DEF 456 (VW Crafter) Equipment
INSERT INTO inventory (id, name, type, category, category_id, quantity, unit, 
    assigned_to_asset_id, status, last_inspection_date, next_inspection_due, description) VALUES
('INV-VEH-DEF456-GPS', 'GPS Tracker', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-02', 'assigned', '2025-11-08', '2026-05-08', 'Garmin Fleet 790 GPS-enhet'),
('INV-VEH-DEF456-RADIO', 'Communication Radio', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-02', 'needs_replacement', '2025-09-15', '2026-09-15', 'Motorola - kräver service'),
('INV-VEH-DEF456-EXTINGUISHER', 'Fire Extinguisher', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-02', 'assigned', '2025-10-20', '2026-04-20', '6kg pulversläckare'),
('INV-VEH-DEF456-FIRSTAID', 'First Aid Kit', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-02', 'assigned', '2025-11-05', '2026-11-05', 'Komplett första hjälpen-kit för fordon')
ON CONFLICT (id) DO NOTHING;

-- Vehicle GHI 789 (Volvo FH16 Truck) Equipment
INSERT INTO inventory (id, name, type, category, category_id, quantity, unit, 
    assigned_to_asset_id, status, last_inspection_date, next_inspection_due, description) VALUES
('INV-VEH-GHI789-GPS', 'GPS Tracker', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-03', 'assigned', '2025-11-12', '2026-05-12', 'Volvo Connect GPS-system'),
('INV-VEH-GHI789-RADIO', 'Communication Radio', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-03', 'assigned', '2025-11-10', '2026-11-10', 'Motorola DP4400e digital radio'),
('INV-VEH-GHI789-EXTINGUISHER', 'Fire Extinguisher', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 2, 'unit',
    'VEH-SND-03', 'assigned', '2025-10-18', '2026-04-18', '2x 6kg pulversläckare för tung lastbil'),
('INV-VEH-GHI789-FIRSTAID', 'First Aid Kit', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-03', 'assigned', '2025-11-03', '2026-11-03', 'Utökad första hjälpen-kit'),
('INV-VEH-GHI789-CHAINS', 'Snow Chains', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'set',
    'VEH-SND-03', 'assigned', '2025-10-01', NULL, 'Snökedjor för vinterkörning')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CARGO/DELIVERY INVENTORY
-- Packages in transit to customers
-- ============================================================================

INSERT INTO inventory (id, name, type, category, category_id, quantity, unit, 
    tracking_number, assigned_to_shipment_id, assigned_to_asset_id, status,
    weight_kg, dimensions_cm, special_handling, customer_info, description) VALUES
('INV-CARGO-001', 'Medicinsk utrustning', 'cargo', 'cargo_delivery', 'cargo_delivery', 1, 'package',
    'SYL-SND-001', NULL, 'VEH-SND-04', 'in_transit',
    15.5, '{"length": 50, "width": 40, "height": 30}', 'fragile',
    '{"pickup": "Stockholm DC", "delivery": "Sundsvall Hospital", "contact": "Dr. Anders Ek"}'::jsonb,
    'Akut medicinsk leverans - prioriterad'),
('INV-CARGO-002', 'Kontorstillbehör', 'cargo', 'cargo_delivery', 'cargo_delivery', 1, 'package',
    'SYL-SND-002', NULL, 'VEH-SND-02', 'in_transit',
    12.3, '{"length": 60, "width": 40, "height": 35}', NULL,
    '{"pickup": "Stockholm DC", "delivery": "Birsta Shopping", "contact": "Stefan Holm"}'::jsonb,
    'Daglig leverans till Birsta köpcentrum'),
('INV-CARGO-003', 'Industrivaror', 'cargo', 'cargo_delivery', 'cargo_delivery', 3, 'box',
    'SYL-SND-003', NULL, NULL, 'awaiting_pickup',
    45.0, '{"length": 80, "width": 60, "height": 50}', NULL,
    '{"pickup": "Stockholm DC", "delivery": "Timrå Industri", "contact": "Lisa Nyström"}'::jsonb,
    'Leverans till Timrå industriområde'),
('INV-CARGO-004', 'Temperaturkänsligt gods', 'cargo', 'cargo_delivery', 'cargo_delivery', 2, 'package',
    'SYL-SND-004', NULL, 'VEH-SND-02', 'in_transit',
    8.5, '{"length": 40, "width": 30, "height": 25}', 'temperature_controlled',
    '{"pickup": "Stockholm DC", "delivery": "Sundsvall Express AB", "contact": "Per Andersson"}'::jsonb,
    'Kräver temperaturkontroll under transport'),
('INV-CARGO-005', 'Verktyg och reservdelar', 'cargo', 'cargo_delivery', 'cargo_delivery', 1, 'crate',
    'SYL-SND-005', NULL, NULL, 'awaiting_pickup',
    32.0, '{"length": 70, "width": 50, "height": 40}', NULL,
    '{"pickup": "Göteborg Warehouse", "delivery": "Sundsvall Logistics Center", "contact": "Anders Svensson"}'::jsonb,
    'Reservdelar för underhåll')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FACILITY STOCK INVENTORY
-- Parts, fuel, equipment at facilities
-- ============================================================================

-- Sundsvall Logistics Center (FAC-SND-HQ) Stock
INSERT INTO inventory (id, name, type, category, category_id, quantity, unit, 
    assigned_to_facility_id, location_id, status, min_stock_level, max_stock_level,
    unit_cost, currency, description) VALUES
('INV-FAC-SND-DIESEL', 'Diesel Bränsle', 'fuel', 'facility_stock', 'facility_stock', 8000, 'liter',
    'FAC-SND-HQ', 'FAC-SND-HQ', 'available', 2000, 10000,
    18.50, 'SEK', 'Diesel lagertank - Sundsvall HQ'),
('INV-FAC-SND-OIL-FILTER', 'Oljefilter', 'spare_parts', 'facility_stock', 'facility_stock', 25, 'units',
    'FAC-SND-HQ', 'FAC-SND-HQ', 'available', 10, 50,
    145.00, 'SEK', 'Standardfilter för Mercedes/VW/Volvo'),
('INV-FAC-SND-BRAKE-PADS', 'Bromsbelägg', 'spare_parts', 'facility_stock', 'facility_stock', 8, 'sets',
    'FAC-SND-HQ', 'FAC-SND-HQ', 'available', 5, 20,
    850.00, 'SEK', 'Bromsbelägg för lätta lastbilar'),
('INV-FAC-SND-TIRES', 'Vinterdäck', 'spare_parts', 'facility_stock', 'facility_stock', 16, 'units',
    'FAC-SND-HQ', 'FAC-SND-HQ', 'available', 8, 32,
    1200.00, 'SEK', 'Dubbdäck 205/75R16'),
('INV-FAC-SND-COOLANT', 'Kylvätska', 'consumable', 'facility_stock', 'facility_stock', 120, 'liter',
    'FAC-SND-HQ', 'FAC-SND-HQ', 'available', 50, 200,
    35.00, 'SEK', 'Glykol kylvätska -35°C'),
('INV-FAC-SND-ENGINE-OIL', 'Motorolja 5W-30', 'consumable', 'facility_stock', 'facility_stock', 200, 'liter',
    'FAC-SND-HQ', 'FAC-SND-HQ', 'available', 100, 400,
    55.00, 'SEK', 'Syntetisk motorolja för dieselmotorer'),
('INV-FAC-SND-PALLETS', 'EUR-pallar', 'packaging', 'facility_stock', 'facility_stock', 150, 'units',
    'FAC-SND-HQ', 'FAC-SND-HQ', 'available', 50, 300,
    125.00, 'SEK', 'Standardpallar för frakt'),
('INV-FAC-SND-STRAPS', 'Lastspännband', 'equipment', 'facility_stock', 'facility_stock', 45, 'units',
    'FAC-SND-HQ', 'FAC-SND-HQ', 'available', 20, 100,
    95.00, 'SEK', 'Ratchet-spännband 5m x 50mm')
ON CONFLICT (id) DO NOTHING;

-- Birsta Terminal (FAC-SND-BIRSTA) Stock
INSERT INTO inventory (id, name, type, category, category_id, quantity, unit, 
    assigned_to_facility_id, location_id, status, min_stock_level, max_stock_level,
    unit_cost, currency, description) VALUES
('INV-FAC-BIRSTA-DIESEL', 'Diesel Bränsle', 'fuel', 'facility_stock', 'facility_stock', 3500, 'liter',
    'FAC-SND-BIRSTA', 'FAC-SND-BIRSTA', 'available', 1000, 5000,
    18.50, 'SEK', 'Diesel lagertank - Birsta Terminal'),
('INV-FAC-BIRSTA-OIL', 'Motorolja 5W-30', 'consumable', 'facility_stock', 'facility_stock', 80, 'liter',
    'FAC-SND-BIRSTA', 'FAC-SND-BIRSTA', 'available', 40, 150,
    55.00, 'SEK', 'Motorolja för service'),
('INV-FAC-BIRSTA-WASHER', 'Spolarvätska', 'consumable', 'facility_stock', 'facility_stock', 60, 'liter',
    'FAC-SND-BIRSTA', 'FAC-SND-BIRSTA', 'available', 30, 100,
    25.00, 'SEK', 'Vinterspolarvätska -25°C')
ON CONFLICT (id) DO NOTHING;

-- Timrå Depot (FAC-SND-TIMRA) Stock
INSERT INTO inventory (id, name, type, category, category_id, quantity, unit, 
    assigned_to_facility_id, location_id, status, min_stock_level, max_stock_level,
    unit_cost, currency, description) VALUES
('INV-FAC-TIMRA-DIESEL', 'Diesel Bränsle', 'fuel', 'facility_stock', 'facility_stock', 2800, 'liter',
    'FAC-SND-TIMRA', 'FAC-SND-TIMRA', 'available', 800, 4000,
    18.50, 'SEK', 'Diesel lagertank - Timrå Depot'),
('INV-FAC-TIMRA-CHAINS', 'Snökedjor', 'equipment', 'facility_stock', 'facility_stock', 4, 'sets',
    'FAC-SND-TIMRA', 'FAC-SND-TIMRA', 'available', 2, 10,
    950.00, 'SEK', 'Vinterberedskap - snökedjor')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FUEL TRACKING - Recent refueling transactions
-- ============================================================================

INSERT INTO fuel_tracking (id, asset_id, facility_id, quantity_liters, cost_sek, 
    odometer_km, fuel_type, driver_id, timestamp, notes) VALUES
('FUEL-001', 'VEH-SND-01', 'FAC-SND-HQ', 65.0, 1202.50, 45823, 'diesel', 'DRV-SND-01', NOW() - INTERVAL '2 days', 'Tankning efter Stockholmstur'),
('FUEL-002', 'VEH-SND-02', 'FAC-SND-BIRSTA', 55.0, 1017.50, 38456, 'diesel', 'DRV-SND-02', NOW() - INTERVAL '1 day', 'Rutintankning'),
('FUEL-003', 'VEH-SND-03', 'FAC-SND-HQ', 420.0, 7770.00, 128934, 'diesel', 'DRV-SND-03', NOW() - INTERVAL '3 days', 'Full tank långtur'),
('FUEL-004', 'VEH-SND-04', 'FAC-SND-HQ', 58.0, 1073.00, 32187, 'diesel', 'DRV-SND-04', NOW() - INTERVAL '1 day', 'Tankning före akutleverans'),
('FUEL-005', 'VEH-SND-05', 'FAC-SND-HQ', 62.0, 1147.00, 28945, 'diesel', 'DRV-SND-05', NOW() - INTERVAL '4 days', 'Rutintankning'),
('FUEL-006', 'VEH-SND-07', 'FAC-SND-HQ', 70.0, 1295.00, 41234, 'diesel', 'DRV-SND-07', NOW() - INTERVAL '2 days', 'Tankning efter hamnkörning'),
('FUEL-007', 'VEH-SND-08', 'FAC-SND-TIMRA', 60.0, 1110.00, 35678, 'diesel', 'DRV-SND-08', NOW() - INTERVAL '3 days', 'Tankning i Timrå')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED DATA COMPLETE
-- ============================================================================
