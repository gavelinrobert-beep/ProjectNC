-- ============================================================================
-- Sundsvall Demo Data for Week 1 Commercial MVP
-- Realistic Swedish transport company data for customer demos
-- ============================================================================

-- Clean up existing demo data (optional - use with caution)
-- DELETE FROM tasks WHERE id LIKE 'DEL-SND-%';
-- DELETE FROM assets WHERE id LIKE 'VEH-SND-%';
-- DELETE FROM drivers WHERE id LIKE 'DRV-SND-%';
-- DELETE FROM facilities WHERE id LIKE 'FAC-SND-%';
-- DELETE FROM customers WHERE id LIKE 'CUST-SND-%';

-- ============================================================================
-- FACILITIES (Sundsvall and surrounding areas)
-- ============================================================================

INSERT INTO facilities (id, name, type, lat, lon, capacity, description, contact_phone, contact_email, operating_hours, zone_code) VALUES
('FAC-SND-01', 'Sundsvall HQ', 'warehouse', 62.3908, 17.3069, 5000, 'Huvudkontor och lager vid Norra Kajen', '+46 60 123 4567', 'info@sundsvallexpress.se', '06:00-22:00', '851 70'),
('FAC-SND-02', 'Birsta Terminal', 'distribution_center', 62.4127, 17.3291, 8000, 'Distributionscenter vid Birsta shoppingcenter', '+46 60 123 4568', 'birsta@sundsvallexpress.se', '24/7', '863 41'),
('FAC-SND-03', 'Timrå Depot', 'depot', 62.4813, 17.3247, 3000, 'Godsdepå i Timrå', '+46 60 123 4569', 'timra@sundsvallexpress.se', '07:00-19:00', '861 31'),
('FAC-SND-04', 'Stockholm DC', 'distribution_center', 59.2975, 18.0565, 15000, 'Distributionscenter Västberga, Stockholm', '+46 8 123 4567', 'stockholm@sundsvallexpress.se', '24/7', '126 30'),
('FAC-SND-05', 'Göteborg Warehouse', 'warehouse', 57.7409, 11.9398, 12000, 'Lager Hisings Backa, Göteborg', '+46 31 123 4567', 'goteborg@sundsvallexpress.se', '06:00-22:00', '422 46')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  lat = EXCLUDED.lat,
  lon = EXCLUDED.lon,
  capacity = EXCLUDED.capacity,
  description = EXCLUDED.description,
  contact_phone = EXCLUDED.contact_phone,
  contact_email = EXCLUDED.contact_email,
  operating_hours = EXCLUDED.operating_hours,
  zone_code = EXCLUDED.zone_code;

-- ============================================================================
-- SWEDISH VEHICLES (Skåpbilar och Lastbilar)
-- ============================================================================

INSERT INTO assets (id, type, registration, status, manufacturer, model, current_lat, current_lon, fuel_level, last_update) VALUES
('VEH-SND-01', 'Skåpbil', 'ABC 123', 'in_use', 'Mercedes-Benz', 'Sprinter', 62.3908, 17.3069, 75, NOW()),
('VEH-SND-02', 'Skåpbil', 'DEF 456', 'in_use', 'Volkswagen', 'Crafter', 62.4127, 17.3291, 82, NOW()),
('VEH-SND-03', 'Lastbil', 'GHI 789', 'available', 'Scania', 'R450', 62.3908, 17.3069, 90, NOW()),
('VEH-SND-04', 'Skåpbil', 'JKL 012', 'in_use', 'Ford', 'Transit', 62.4813, 17.3247, 65, NOW()),
('VEH-SND-05', 'Lastbil', 'MNO 345', 'available', 'Volvo', 'FH16', 62.3908, 17.3069, 88, NOW()),
('VEH-SND-06', 'Skåpbil', 'PQR 678', 'in_use', 'Renault', 'Master', 62.3950, 17.2850, 70, NOW()),
('VEH-SND-07', 'Skåpbil', 'STU 901', 'available', 'Peugeot', 'Boxer', 62.3908, 17.3069, 95, NOW()),
('VEH-SND-08', 'Lastbil', 'VWX 234', 'maintenance', 'Mercedes-Benz', 'Actros', 62.3908, 17.3069, 45, NOW()),
('VEH-SND-09', 'Skåpbil', 'YZÅ 567', 'in_use', 'Fiat', 'Ducato', 62.3780, 17.3180, 78, NOW()),
('VEH-SND-10', 'Skåpbil', 'ÄÖÅ 890', 'available', 'Citroën', 'Jumper', 62.3908, 17.3069, 85, NOW())
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  registration = EXCLUDED.registration,
  status = EXCLUDED.status,
  manufacturer = EXCLUDED.manufacturer,
  model = EXCLUDED.model,
  current_lat = EXCLUDED.current_lat,
  current_lon = EXCLUDED.current_lon,
  fuel_level = EXCLUDED.fuel_level,
  last_update = EXCLUDED.last_update;

-- ============================================================================
-- DRIVERS (Swedish names and licenses)
-- ============================================================================

INSERT INTO drivers (id, first_name, last_name, employee_number, phone, email, license_number, license_type, license_expiry, home_facility_id, role, employment_status, assigned_vehicle_id) VALUES
('DRV-SND-01', 'Erik', 'Andersson', 'EMP-001', '+46 70 123 4501', 'erik.andersson@sundsvallexpress.se', 'SE-12345678', 'CE', '2028-12-31', 'FAC-SND-01', 'driver', 'active', 'VEH-SND-01'),
('DRV-SND-02', 'Anna', 'Bergström', 'EMP-002', '+46 70 123 4502', 'anna.bergstrom@sundsvallexpress.se', 'SE-23456789', 'C', '2027-06-30', 'FAC-SND-01', 'driver', 'active', 'VEH-SND-02'),
('DRV-SND-03', 'Lars', 'Carlsson', 'EMP-003', '+46 70 123 4503', 'lars.carlsson@sundsvallexpress.se', 'SE-34567890', 'CE', '2029-03-15', 'FAC-SND-02', 'driver', 'active', 'VEH-SND-04'),
('DRV-SND-04', 'Maria', 'Danielsson', 'EMP-004', '+46 70 123 4504', 'maria.danielsson@sundsvallexpress.se', 'SE-45678901', 'C', '2028-09-20', 'FAC-SND-01', 'driver', 'active', 'VEH-SND-06'),
('DRV-SND-05', 'Johan', 'Eriksson', 'EMP-005', '+46 70 123 4505', 'johan.eriksson@sundsvallexpress.se', 'SE-56789012', 'B', '2026-11-10', 'FAC-SND-03', 'driver', 'active', 'VEH-SND-09'),
('DRV-SND-06', 'Sofia', 'Fredriksson', 'EMP-006', '+46 70 123 4506', 'sofia.fredriksson@sundsvallexpress.se', 'SE-67890123', 'CE', '2030-01-25', 'FAC-SND-01', 'driver', 'active', NULL),
('DRV-SND-07', 'Anders', 'Gustafsson', 'EMP-007', '+46 70 123 4507', 'anders.gustafsson@sundsvallexpress.se', 'SE-78901234', 'C', '2027-08-14', 'FAC-SND-02', 'driver', 'active', NULL),
('DRV-SND-08', 'Emma', 'Hansson', 'EMP-008', '+46 70 123 4508', 'emma.hansson@sundsvallexpress.se', 'SE-89012345', 'C', '2029-05-30', 'FAC-SND-01', 'dispatcher', 'active', NULL)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  employee_number = EXCLUDED.employee_number,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  license_number = EXCLUDED.license_number,
  license_type = EXCLUDED.license_type,
  license_expiry = EXCLUDED.license_expiry,
  home_facility_id = EXCLUDED.home_facility_id,
  role = EXCLUDED.role,
  employment_status = EXCLUDED.employment_status,
  assigned_vehicle_id = EXCLUDED.assigned_vehicle_id;

-- ============================================================================
-- CUSTOMERS (Sundsvall area businesses and locations)
-- ============================================================================

INSERT INTO customers (id, name, customer_type, contact_name, contact_phone, contact_email, address_street, address_city, address_postal_code, delivery_lat, delivery_lon, service_level, access_instructions) VALUES
('CUST-SND-01', 'ICA Maxi Birsta', 'business', 'Per Svensson', '+46 60 111 1111', 'per.svensson@ica.se', 'Gesällvägen 3', 'Sundsvall', '863 41', 62.4127, 17.3291, 'express', 'Leverans till varumottagning baksidan'),
('CUST-SND-02', 'Sundsvalls Sjukhus', 'government', 'Karin Nilsson', '+46 60 181 000', 'karin.nilsson@lvn.se', 'Sjukhusvägen 1', 'Sundsvall', '851 86', 62.3982, 17.2936, 'express', 'Leverans till godsmottagning port 3'),
('CUST-SND-03', 'Länsförsäkringar Västernorrland', 'business', 'Thomas Berg', '+46 60 181 500', 'thomas.berg@lansforsakringar.se', 'Storgatan 45', 'Sundsvall', '851 70', 62.3911, 17.3067, 'standard', 'Kontorstid 08:00-17:00'),
('CUST-SND-04', 'Mittuniversitetet Campus', 'government', 'Linda Holm', '+46 10 142 8000', 'linda.holm@miun.se', 'Holmgatan 10', 'Sundsvall', '851 70', 62.3905, 17.3003, 'standard', 'Leverans till Expedition hus A'),
('CUST-SND-05', 'Timrå Golfklubb', 'business', 'Magnus Lind', '+46 60 571 000', 'magnus.lind@timragk.se', 'Golfvägen 1', 'Timrå', '861 95', 62.4936, 17.3325, 'economy', 'Ring vid ankomst'),
('CUST-SND-06', 'Nordichallen Sportkomplex', 'business', 'Sara Öberg', '+46 60 693 000', 'sara.oberg@nordichallen.se', 'Södra Järnvägsgatan 11', 'Sundsvall', '852 30', 62.3780, 17.3180, 'standard', 'Leverans vid huvudentré'),
('CUST-SND-07', 'Sundsvall Energi AB', 'business', 'Peter Åström', '+46 60 192 000', 'peter.astrom@sundsvallenergi.se', 'Norra Järnvägsgatan 9', 'Sundsvall', '851 72', 62.3950, 17.2850, 'express', 'Godsmottagning vänster sida'),
('CUST-SND-08', 'Norra Berget Friluftsmuseum', 'government', 'Åsa Lindström', '+46 60 191 850', 'asa.lindstrom@sundsvall.se', 'Norra Berget', 'Sundsvall', '851 93', 62.4086, 17.2942, 'standard', 'Leverans till museibutiken')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  customer_type = EXCLUDED.customer_type,
  contact_name = EXCLUDED.contact_name,
  contact_phone = EXCLUDED.contact_phone,
  contact_email = EXCLUDED.contact_email,
  address_street = EXCLUDED.address_street,
  address_city = EXCLUDED.address_city,
  address_postal_code = EXCLUDED.address_postal_code,
  delivery_lat = EXCLUDED.delivery_lat,
  delivery_lon = EXCLUDED.delivery_lon,
  service_level = EXCLUDED.service_level,
  access_instructions = EXCLUDED.access_instructions;

-- ============================================================================
-- ACTIVE DELIVERIES (5 in progress - for live demo)
-- ============================================================================

INSERT INTO tasks (id, name, description, assigned_vehicle_id, assigned_driver_id, waypoints, status, priority, task_type, source_facility_id, estimated_duration_minutes, estimated_distance_km, scheduled_start, actual_start, notes) VALUES
('DEL-SND-001', 'Express leverans ICA Maxi', 'Dagliga matvaror och färskvaror', 'VEH-SND-01', 'DRV-SND-01', 
 '[{"lat":62.3908,"lon":17.3069,"address":"Sundsvall HQ, Norra Kajen 12"},{"lat":62.4127,"lon":17.3291,"address":"ICA Maxi Birsta, Gesällvägen 3"}]'::jsonb,
 'in_transit', 'high', 'delivery', 'FAC-SND-01', 25, 4.5, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes', 'Temperaturkänsligt gods'),

('DEL-SND-002', 'Medicinsk utrustning till sjukhus', 'Akut medicinsk utrustning', 'VEH-SND-02', 'DRV-SND-02',
 '[{"lat":62.4127,"lon":17.3291,"address":"Birsta Terminal"},{"lat":62.3982,"lon":17.2936,"address":"Sundsvalls Sjukhus, Sjukhusvägen 1"}]'::jsonb,
 'picked_up', 'urgent', 'delivery', 'FAC-SND-02', 20, 3.8, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '10 minutes', 'Prioriterad leverans'),

('DEL-SND-003', 'Kontorsmaterial Länsförsäkringar', 'Papper, kuvert och kontorsutrustning', 'VEH-SND-04', 'DRV-SND-03',
 '[{"lat":62.3908,"lon":17.3069,"address":"Sundsvall HQ"},{"lat":62.3911,"lon":17.3067,"address":"Länsförsäkringar, Storgatan 45"}]'::jsonb,
 'assigned', 'normal', 'delivery', 'FAC-SND-01', 15, 0.5, NOW() + INTERVAL '30 minutes', NULL, 'Leverans under kontorstid'),

('DEL-SND-004', 'IT-utrustning Mittuniversitetet', 'Datorer och skrivare', 'VEH-SND-06', 'DRV-SND-04',
 '[{"lat":62.3908,"lon":17.3069,"address":"Sundsvall HQ"},{"lat":62.3905,"lon":17.3003,"address":"Mittuniversitetet, Holmgatan 10"}]'::jsonb,
 'in_transit', 'normal', 'delivery', 'FAC-SND-01', 20, 1.2, NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '18 minutes', 'Leverans till campus expedition'),

('DEL-SND-005', 'Sportutrustning Nordichallen', 'Nya redskap till gym', 'VEH-SND-09', 'DRV-SND-05',
 '[{"lat":62.4813,"lon":17.3247,"address":"Timrå Depot"},{"lat":62.3780,"lon":17.3180,"address":"Nordichallen, Södra Järnvägsgatan 11"}]'::jsonb,
 'planned', 'low', 'delivery', 'FAC-SND-03', 35, 12.5, NOW() + INTERVAL '1 hour', NULL, 'Tung utrustning, hjälp behövs vid lossning')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  assigned_vehicle_id = EXCLUDED.assigned_vehicle_id,
  assigned_driver_id = EXCLUDED.assigned_driver_id,
  waypoints = EXCLUDED.waypoints,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  task_type = EXCLUDED.task_type,
  source_facility_id = EXCLUDED.source_facility_id,
  estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
  estimated_distance_km = EXCLUDED.estimated_distance_km,
  scheduled_start = EXCLUDED.scheduled_start,
  actual_start = EXCLUDED.actual_start,
  notes = EXCLUDED.notes;

-- ============================================================================
-- COMPLETED DELIVERIES (Last 7 days - shows history)
-- ============================================================================

INSERT INTO tasks (id, name, description, assigned_vehicle_id, assigned_driver_id, waypoints, status, priority, task_type, source_facility_id, estimated_duration_minutes, estimated_distance_km, scheduled_start, actual_start, actual_end, delivered_at, delivered_to, signature_image, notes) VALUES
('DEL-SND-101', 'Daglig leverans Sundsvall Energi', 'Kontorsmaterial och dokument', 'VEH-SND-01', 'DRV-SND-01',
 '[{"lat":62.3908,"lon":17.3069,"address":"Sundsvall HQ"},{"lat":62.3950,"lon":17.2850,"address":"Sundsvall Energi, Norra Järnvägsgatan 9"}]'::jsonb,
 'completed', 'normal', 'delivery', 'FAC-SND-01', 15, 1.8, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours 45 minutes', NOW() - INTERVAL '23 hours 45 minutes', 'Peter Åström', NULL, 'Leverans klar'),

('DEL-SND-102', 'Veckoleverans Norra Berget', 'Museibutikens varor', 'VEH-SND-02', 'DRV-SND-02',
 '[{"lat":62.3908,"lon":17.3069,"address":"Sundsvall HQ"},{"lat":62.4086,"lon":17.2942,"address":"Norra Berget Friluftsmuseum"}]'::jsonb,
 'completed', 'low', 'delivery', 'FAC-SND-01', 30, 4.2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 23 hours 30 minutes', NOW() - INTERVAL '1 day 23 hours 30 minutes', 'Åsa Lindström', NULL, 'Allt OK'),

('DEL-SND-103', 'Golfutrustning Timrå GK', 'Nya golbutrustningar', 'VEH-SND-04', 'DRV-SND-03',
 '[{"lat":62.3908,"lon":17.3069,"address":"Sundsvall HQ"},{"lat":62.4936,"lon":17.3325,"address":"Timrå Golfklubb"}]'::jsonb,
 'completed', 'normal', 'delivery', 'FAC-SND-01', 40, 14.5, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 23 hours 20 minutes', NOW() - INTERVAL '2 days 23 hours 20 minutes', 'Magnus Lind', NULL, 'Leverans slutförd utan problem')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  assigned_vehicle_id = EXCLUDED.assigned_vehicle_id,
  assigned_driver_id = EXCLUDED.assigned_driver_id,
  waypoints = EXCLUDED.waypoints,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  task_type = EXCLUDED.task_type,
  source_facility_id = EXCLUDED.source_facility_id,
  estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
  estimated_distance_km = EXCLUDED.estimated_distance_km,
  scheduled_start = EXCLUDED.scheduled_start,
  actual_start = EXCLUDED.actual_start,
  actual_end = EXCLUDED.actual_end,
  delivered_at = EXCLUDED.delivered_at,
  delivered_to = EXCLUDED.delivered_to,
  signature_image = EXCLUDED.signature_image,
  notes = EXCLUDED.notes;

-- ============================================================================
-- Summary
-- ============================================================================
-- Facilities: 5 (Sundsvall HQ, Birsta, Timrå, Stockholm, Göteborg)
-- Vehicles: 10 Swedish plates (ABC 123, DEF 456, etc.)
-- Drivers: 8 with Swedish names and licenses
-- Customers: 8 Sundsvall area businesses
-- Active Deliveries: 5 (for live demo)
-- Completed Deliveries: 3 (showing history)
-- ============================================================================

-- Demo PIN codes for drivers:
-- VEH-SND-01 (ABC 123) -> PIN: 0001 -> Erik Andersson
-- VEH-SND-02 (DEF 456) -> PIN: 0002 -> Anna Bergström
-- VEH-SND-04 (JKL 012) -> PIN: 0004 -> Lars Carlsson
-- VEH-SND-06 (PQR 678) -> PIN: 0006 -> Maria Danielsson
-- VEH-SND-09 (YZÅ 567) -> PIN: 0009 -> Johan Eriksson
