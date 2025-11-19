-- ============================================================================
-- SYLON Logistics - Sample Data Seed Script
-- Populates database with realistic sample data for immediate usability
-- ============================================================================

-- Sample Facilities
INSERT INTO facilities (id, name, type, lat, lon, capacity, description, contact_phone, contact_email, operating_hours, zone_code) VALUES
    ('FAC-STH-MAIN', 'SYLON Huvudlager Stockholm', 'warehouse', 59.3293, 18.0686, 5000, 'Main warehouse and distribution center', '+46 8 123 4500', 'stockholm@sylon.se', '06:00-22:00', 'STH-01'),
    ('FAC-GBG-DEP', 'SYLON Depot Göteborg', 'depot', 57.7089, 11.9746, 3000, 'Regional depot and service center', '+46 31 234 5600', 'goteborg@sylon.se', '07:00-20:00', 'GBG-01'),
    ('FAC-UPP-SVC', 'SYLON Servicestation Uppsala', 'service_center', 59.8586, 17.6389, 500, 'Vehicle maintenance and service', '+46 18 345 6700', 'uppsala@sylon.se', '08:00-17:00', 'UPP-01'),
    ('FAC-MAL-DEP', 'SYLON Depot Malmö', 'depot', 55.6050, 13.0038, 2500, 'Southern regional hub', '+46 40 456 7800', 'malmo@sylon.se', '07:00-20:00', 'MAL-01')
ON CONFLICT (id) DO NOTHING;

-- Sample Customers
INSERT INTO customers (id, name, customer_type, contact_name, contact_phone, contact_email, address_street, address_city, address_postal_code, delivery_lat, delivery_lon, service_level) VALUES
    ('CUST-001', 'Nordiska Byggvaror AB', 'business', 'Erik Andersson', '+46 70 123 4567', 'erik.andersson@nordiskab.se', 'Industrivägen 15', 'Stockholm', '11525', 59.3320, 18.0710, 'standard'),
    ('CUST-002', 'Västkust Handel AB', 'business', 'Anna Karlsson', '+46 70 234 5678', 'anna.karlsson@vastkust.se', 'Hamnvägen 22', 'Göteborg', '41701', 57.7120, 11.9680, 'express'),
    ('CUST-003', 'Uppsala Logistik & Co', 'business', 'Mikael Berg', '+46 70 345 6789', 'mikael.berg@uppsalalog.se', 'Verkstadsgatan 8', 'Uppsala', '75320', 59.8600, 17.6410, 'standard'),
    ('CUST-004', 'Sundsvall Distribution', 'business', 'Sofia Lundqvist', '+46 70 456 7890', 'sofia@sundsvall.se', 'Norra vägen 45', 'Sundsvall', '85230', 62.3908, 17.3068, 'same_day'),
    ('CUST-005', 'Malmö Transport AB', 'business', 'Lars Svensson', '+46 70 567 8901', 'lars@malmotransport.se', 'Södra Förstadsgatan 12', 'Malmö', '21143', 55.6070, 13.0050, 'standard')
ON CONFLICT (id) DO NOTHING;

-- Sample Drivers
INSERT INTO drivers (id, first_name, last_name, employee_number, phone, email, license_number, license_type, license_expiry, adr_certified, home_facility_id, role, employment_status) VALUES
    ('DRV-001', 'Erik', 'Andersson', 'EMP-1001', '+46 70 111 2222', 'erik.andersson@sylon.se', 'SE-123456789', 'CE', '2026-12-31', true, 'FAC-STH-MAIN', 'driver', 'active'),
    ('DRV-002', 'Anna', 'Karlsson', 'EMP-1002', '+46 70 222 3333', 'anna.karlsson@sylon.se', 'SE-234567890', 'C', '2027-06-30', false, 'FAC-STH-MAIN', 'driver', 'active'),
    ('DRV-003', 'Mikael', 'Berg', 'EMP-1003', '+46 70 333 4444', 'mikael.berg@sylon.se', 'SE-345678901', 'CE', '2026-09-15', true, 'FAC-GBG-DEP', 'driver', 'active'),
    ('DRV-004', 'Sofia', 'Lundqvist', 'EMP-1004', '+46 70 444 5555', 'sofia.lundqvist@sylon.se', 'SE-456789012', 'C', '2027-03-20', false, 'FAC-UPP-SVC', 'driver', 'active'),
    ('DRV-005', 'Lars', 'Svensson', 'EMP-1005', '+46 70 555 6666', 'lars.svensson@sylon.se', 'SE-567890123', 'CE', '2026-11-10', true, 'FAC-MAL-DEP', 'driver', 'active')
ON CONFLICT (id) DO NOTHING;

-- Sample Vehicles (Assets)
INSERT INTO assets (id, name, registration, make, model, asset_type, status, lat, lon, fuel_level, odometer, maintenance_due_km, last_maintenance, facility_id) VALUES
    ('VEH-001', 'Volvo FH16 #1', 'ABC123', 'Volvo', 'FH16', 'truck', 'in_use', 59.3293, 18.0686, 75.5, 145230, 155000, '2025-01-10', 'FAC-STH-MAIN'),
    ('VEH-002', 'Scania R450 #2', 'DEF456', 'Scania', 'R450', 'truck', 'in_use', 57.7089, 11.9746, 62.3, 98450, 110000, '2025-01-05', 'FAC-GBG-DEP'),
    ('VEH-003', 'Mercedes Sprinter #3', 'GHI789', 'Mercedes', 'Sprinter', 'van', 'in_use', 59.8586, 17.6389, 88.1, 67890, 80000, '2024-12-20', 'FAC-UPP-SVC'),
    ('VEH-004', 'Volvo FMX #4', 'JKL012', 'Volvo', 'FMX', 'truck', 'maintenance', 59.3293, 18.0686, 45.0, 203450, 205000, '2024-11-15', 'FAC-STH-MAIN'),
    ('VEH-005', 'Ford Transit #5', 'MNO345', 'Ford', 'Transit', 'van', 'in_use', 55.6050, 13.0038, 91.2, 45678, 60000, '2025-01-08', 'FAC-MAL-DEP'),
    ('VEH-006', 'Scania P320 #6', 'PQR678', 'Scania', 'P320', 'truck', 'available', 59.3293, 18.0686, 100.0, 78230, 90000, '2024-12-15', 'FAC-STH-MAIN'),
    ('VEH-007', 'Mercedes Actros #7', 'STU901', 'Mercedes', 'Actros', 'truck', 'available', 57.7089, 11.9746, 95.0, 112340, 125000, '2024-12-28', 'FAC-GBG-DEP'),
    ('VEH-008', 'Volvo FL #8', 'VWX234', 'Volvo', 'FL', 'truck', 'parked', 59.8586, 17.6389, 100.0, 56780, 70000, '2025-01-03', 'FAC-UPP-SVC')
ON CONFLICT (id) DO NOTHING;

-- Sample Shipments
INSERT INTO shipments (tracking_number, customer_id, origin_facility_id, destination_address_street, destination_address_city, destination_address_postal_code, destination_lat, destination_lon, assigned_vehicle_id, assigned_driver_id, status, service_level, priority, weight_kg, dimensions_cm, description, scheduled_pickup, scheduled_delivery, estimated_delivery) VALUES
    ('SYL-2025001', 'CUST-001', 'FAC-STH-MAIN', 'Industrivägen 15', 'Stockholm', '11525', 59.3320, 18.0710, 'VEH-001', 'DRV-001', 'in_transit', 'standard', 'normal', 450.5, '120x80x100', 'Byggmaterial - Plankor och cement', '2025-11-19 08:00:00', '2025-11-19 14:00:00', '2025-11-19 14:00:00'),
    ('SYL-2025002', 'CUST-002', 'FAC-STH-MAIN', 'Hamnvägen 22', 'Göteborg', '41701', 57.7120, 11.9680, 'VEH-002', 'DRV-003', 'in_transit', 'express', 'high', 320.0, '100x60x80', 'Elektronik och komponenter', '2025-11-19 07:00:00', '2025-11-19 12:00:00', '2025-11-19 12:00:00'),
    ('SYL-2025003', 'CUST-003', 'FAC-UPP-SVC', 'Verkstadsgatan 8', 'Uppsala', '75320', 59.8600, 17.6410, 'VEH-003', 'DRV-002', 'out_for_delivery', 'standard', 'normal', 125.3, '80x50x60', 'Kontorsmöbler', '2025-11-19 09:00:00', '2025-11-19 15:00:00', '2025-11-19 15:00:00'),
    ('SYL-2025004', 'CUST-004', 'FAC-STH-MAIN', 'Norra vägen 45', 'Sundsvall', '85230', 62.3908, 17.3068, NULL, NULL, 'created', 'same_day', 'urgent', 85.0, '60x40x50', 'Medicinskt material - brådskande', '2025-11-20 06:00:00', '2025-11-20 10:00:00', '2025-11-20 10:00:00'),
    ('SYL-2025005', 'CUST-005', 'FAC-MAL-DEP', 'Södra Förstadsgatan 12', 'Malmö', '21143', 55.6070, 13.0050, 'VEH-005', 'DRV-005', 'picked_up', 'standard', 'normal', 280.0, '100x70x90', 'Industrimaskiner delar', '2025-11-19 08:30:00', '2025-11-19 16:00:00', '2025-11-19 16:00:00'),
    ('SYL-2025006', 'CUST-001', 'FAC-STH-MAIN', 'Industrivägen 15', 'Stockholm', '11525', 59.3320, 18.0710, 'VEH-001', 'DRV-001', 'delivered', 'standard', 'normal', 200.0, '80x60x70', 'Verktyg och utrustning', '2025-11-18 08:00:00', '2025-11-18 14:00:00', '2025-11-18 13:45:00'),
    ('SYL-2025007', 'CUST-002', 'FAC-GBG-DEP', 'Hamnvägen 22', 'Göteborg', '41701', 57.7120, 11.9680, 'VEH-002', 'DRV-003', 'delivered', 'express', 'high', 150.0, '70x50x60', 'IT-utrustning', '2025-11-18 07:00:00', '2025-11-18 11:00:00', '2025-11-18 10:30:00')
ON CONFLICT (tracking_number) DO NOTHING;

-- Sample Shipment Events (tracking history)
INSERT INTO shipment_events (shipment_id, event_type, status, location, lat, lon, description, created_by) VALUES
    ((SELECT id FROM shipments WHERE tracking_number = 'SYL-2025001'), 'status_change', 'picked_up', 'SYLON Huvudlager Stockholm', 59.3293, 18.0686, 'Paket upphämtat från lager', 'DRV-001'),
    ((SELECT id FROM shipments WHERE tracking_number = 'SYL-2025001'), 'status_change', 'in_transit', 'E4 Stockholm Syd', 59.2800, 18.0500, 'Paket på väg till destination', 'DRV-001'),
    ((SELECT id FROM shipments WHERE tracking_number = 'SYL-2025006'), 'status_change', 'delivered', 'Industrivägen 15, Stockholm', 59.3320, 18.0710, 'Levererat - signerat av Erik Andersson', 'DRV-001'),
    ((SELECT id FROM shipments WHERE tracking_number = 'SYL-2025007'), 'status_change', 'delivered', 'Hamnvägen 22, Göteborg', 57.7120, 11.9680, 'Levererat - signerat av Anna Karlsson', 'DRV-003')
ON CONFLICT DO NOTHING;

-- Sample Geofences
INSERT INTO geofences (id, name, geofence_type, lat, lon, radius_meters, geometry, description, active) VALUES
    ('GEO-STH-CTR', 'Stockholm Centrum', 'delivery_zone', 59.3293, 18.0686, 5000, NULL, 'Central Stockholm delivery zone', true),
    ('GEO-GBG-PORT', 'Göteborg Hamn', 'pickup_zone', 57.7089, 11.9746, 3000, NULL, 'Gothenburg port pickup area', true),
    ('GEO-UPP-IND', 'Uppsala Industriområde', 'delivery_zone', 59.8586, 17.6389, 2000, NULL, 'Uppsala industrial delivery zone', true),
    ('GEO-MAL-SYD', 'Malmö Södra', 'delivery_zone', 55.5850, 13.0038, 4000, NULL, 'Southern Malmö delivery zone', true)
ON CONFLICT (id) DO NOTHING;

-- Sample Alerts
INSERT INTO alerts (id, alert_type, severity, message, vehicle_id, driver_id, facility_id, acknowledged, resolved) VALUES
    ('ALERT-001', 'maintenance_due', 'warning', 'Vehicle JKL012 requires scheduled maintenance within 1500 km', 'VEH-004', NULL, 'FAC-STH-MAIN', false, false),
    ('ALERT-002', 'low_fuel', 'info', 'Vehicle JKL012 fuel level below 50%', 'VEH-004', NULL, NULL, false, false),
    ('ALERT-003', 'speeding', 'warning', 'Vehicle ABC123 exceeded speed limit on E4 (recorded at 95 km/h in 80 km/h zone)', 'VEH-001', 'DRV-001', NULL, true, true),
    ('ALERT-004', 'delivery_delay', 'info', 'Shipment SYL-2025001 may be delayed due to traffic', 'VEH-001', 'DRV-001', NULL, true, false)
ON CONFLICT (id) DO NOTHING;

-- Sample Inventory Items
INSERT INTO inventory (id, name, sku, category, quantity, unit, location_type, location_id, reorder_point, unit_cost, notes) VALUES
    ('INV-001', 'Diesel Euro 6', 'FUEL-DIE-E6', 'fuel', 15000.0, 'liters', 'facility', 'FAC-STH-MAIN', 5000.0, 18.50, 'Standard diesel fuel'),
    ('INV-002', 'AdBlue DEF', 'FUEL-ADBLUE', 'fuel', 2000.0, 'liters', 'facility', 'FAC-STH-MAIN', 500.0, 12.00, 'Diesel exhaust fluid'),
    ('INV-003', 'Motor Oil 15W-40', 'MAINT-OIL-15W40', 'maintenance', 500.0, 'liters', 'facility', 'FAC-UPP-SVC', 100.0, 45.00, 'Heavy duty engine oil'),
    ('INV-004', 'Truck Tires 315/80R22.5', 'PARTS-TIRE-315', 'parts', 24.0, 'units', 'facility', 'FAC-UPP-SVC', 8.0, 3500.00, 'Heavy truck tires'),
    ('INV-005', 'Pallet Wrapping Film', 'PACK-WRAP-50CM', 'packaging', 150.0, 'rolls', 'facility', 'FAC-STH-MAIN', 50.0, 85.00, 'Stretch wrap 50cm x 300m'),
    ('INV-006', 'Cardboard Boxes Large', 'PACK-BOX-L', 'packaging', 500.0, 'units', 'facility', 'FAC-STH-MAIN', 100.0, 15.00, '60x40x40cm shipping boxes'),
    ('INV-007', 'Loading Straps 5m', 'EQUIP-STRAP-5M', 'equipment', 80.0, 'units', 'facility', 'FAC-STH-MAIN', 20.0, 120.00, 'Heavy duty cargo straps')
ON CONFLICT (id) DO NOTHING;

-- Sample Tasks
INSERT INTO tasks (id, title, description, task_type, status, priority, assigned_to, facility_id, vehicle_id, due_date, lat, lon) VALUES
    ('TASK-001', 'Rutinunderhåll VEH-004', 'Genomför 10 000 km service på Volvo FMX', 'maintenance', 'in_progress', 'high', 'DRV-004', 'FAC-UPP-SVC', 'VEH-004', '2025-11-20', 59.8586, 17.6389),
    ('TASK-002', 'Inventering lager Stockholm', 'Kvartalsvis inventering av huvudlager', 'logistics', 'assigned', 'normal', 'EMP-1001', 'FAC-STH-MAIN', NULL, '2025-11-22', 59.3293, 18.0686),
    ('TASK-003', 'Ruttplanering vecka 48', 'Planera leveransrutter för vecka 48', 'logistics', 'completed', 'normal', 'EMP-1002', 'FAC-STH-MAIN', NULL, '2025-11-18', 59.3293, 18.0686),
    ('TASK-004', 'Dokumentation leverans SYL-2025007', 'Arkivera leveransdokumentation', 'documentation', 'completed', 'low', 'DRV-003', 'FAC-GBG-DEP', 'VEH-002', '2025-11-18', 57.7089, 11.9746)
ON CONFLICT (id) DO NOTHING;

-- Sample Users (additional to admin)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, facility_id, active) VALUES
    ('USER-002', 'erik.andersson@sylon.local', '$2b$12$3rJDfgleoavrJYLd477EIOMCzOtXS1mhxet7PmukI19xUAjuapEFa', 'Erik', 'Andersson', 'driver', 'FAC-STH-MAIN', true),
    ('USER-003', 'anna.karlsson@sylon.local', '$2b$12$3rJDfgleoavrJYLd477EIOMCzOtXS1mhxet7PmukI19xUAjuapEFa', 'Anna', 'Karlsson', 'driver', 'FAC-STH-MAIN', true),
    ('USER-004', 'mikael.berg@sylon.local', '$2b$12$3rJDfgleoavrJYLd477EIOMCzOtXS1mhxet7PmukI19xUAjuapEFa', 'Mikael', 'Berg', 'driver', 'FAC-GBG-DEP', true),
    ('USER-005', 'dispatcher@sylon.local', '$2b$12$3rJDfgleoavrJYLd477EIOMCzOtXS1mhxet7PmukI19xUAjuapEFa', 'Lisa', 'Johansson', 'dispatcher', 'FAC-STH-MAIN', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (for testing)
-- ============================================================================

-- SELECT 'Facilities:', COUNT(*) FROM facilities;
-- SELECT 'Customers:', COUNT(*) FROM customers;
-- SELECT 'Drivers:', COUNT(*) FROM drivers;
-- SELECT 'Vehicles:', COUNT(*) FROM assets;
-- SELECT 'Shipments:', COUNT(*) FROM shipments;
-- SELECT 'Geofences:', COUNT(*) FROM geofences;
-- SELECT 'Alerts:', COUNT(*) FROM alerts;
-- SELECT 'Inventory:', COUNT(*) FROM inventory;
-- SELECT 'Tasks:', COUNT(*) FROM tasks;
-- SELECT 'Users:', COUNT(*) FROM users;
