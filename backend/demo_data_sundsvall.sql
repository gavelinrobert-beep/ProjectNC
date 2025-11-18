-- ============================================================================
-- Sundsvall Transport Demo Data - Week 1 Commercial MVP
-- Comprehensive Swedish demo data for customer demos starting Nov 19
-- ============================================================================

-- ============================================================================
-- FACILITIES (6 Swedish locations)
-- ============================================================================

INSERT INTO facilities (id, name, type, lat, lon, capacity, description) VALUES
('FAC-SND-HQ', 'Sundsvall Logistics Center', 'warehouse', 62.3908, 17.3069, 500, 'Huvudkontor - Norra Kajen 12'),
('FAC-SND-BIRSTA', 'Birsta Terminal', 'depot', 62.4325, 17.3158, 300, 'Birstagatan, Birsta'),
('FAC-SND-TIMRA', 'Timrå Depot', 'depot', 62.4914, 17.3264, 200, 'Timrå industriområde'),
('FAC-STO-DC', 'Stockholm Distribution Center', 'warehouse', 59.3293, 18.0686, 800, 'Västberga Allé 60'),
('FAC-GBG-HISINGS', 'Göteborg Warehouse', 'warehouse', 57.7384, 11.9575, 600, 'Hisings Backa'),
('FAC-SND-HOSPITAL', 'Sundsvall Hospital', 'customer_location', 62.3877, 17.3114, 0, 'Sundsvalls sjukhus')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DRIVERS (8 Swedish drivers with realistic data)
-- ============================================================================

INSERT INTO drivers (id, first_name, last_name, phone, email, license_number, license_type, license_expiry, employment_status, assigned_vehicle_id) VALUES
('DRV-SND-01', 'Anders', 'Svensson', '070-123-4567', 'anders.svensson@sundsvallexpress.se', 'SE-9876543', 'C', '2026-06-15', 'active', 'VEH-SND-01'),
('DRV-SND-02', 'Maria', 'Andersson', '070-234-5678', 'maria.andersson@sundsvallexpress.se', 'SE-8765432', 'C', '2027-03-20', 'active', 'VEH-SND-02'),
('DRV-SND-03', 'Erik', 'Johansson', '070-345-6789', 'erik.johansson@sundsvallexpress.se', 'SE-7654321', 'CE', '2026-11-10', 'active', 'VEH-SND-03'),
('DRV-SND-04', 'Sofia', 'Bergström', '070-456-7890', 'sofia.bergstrom@sundsvallexpress.se', 'SE-6543210', 'C', '2027-08-05', 'active', 'VEH-SND-04'),
('DRV-SND-05', 'Johan', 'Lundqvist', '070-567-8901', 'johan.lundqvist@sundsvallexpress.se', 'SE-5432109', 'C', '2026-12-15', 'active', 'VEH-SND-05'),
('DRV-SND-06', 'Emma', 'Karlsson', '070-678-9012', 'emma.karlsson@sundsvallexpress.se', 'SE-4321098', 'C', '2027-04-20', 'active', 'VEH-SND-06'),
('DRV-SND-07', 'Lars', 'Nilsson', '070-789-0123', 'lars.nilsson@sundsvallexpress.se', 'SE-3210987', 'CE', '2026-09-30', 'active', 'VEH-SND-07'),
('DRV-SND-08', 'Anna', 'Persson', '070-890-1234', 'anna.persson@sundsvallexpress.se', 'SE-2109876', 'C', '2027-01-15', 'active', 'VEH-SND-08')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VEHICLES (8 with Swedish registration plates)
-- ============================================================================

INSERT INTO assets (id, type, registration_number, make, model, year, lat, lon, status, fuel_type, fuel_level, fuel_capacity, cargo_capacity_kg, home_facility_id, current_driver_id) VALUES
('VEH-SND-01', 'van', 'ABC 123', 'Mercedes-Benz', 'Sprinter', 2022, 62.3908, 17.3069, 'available', 'diesel', 85.0, 80.0, 1200, 'FAC-SND-HQ', 'DRV-SND-01'),
('VEH-SND-02', 'van', 'DEF 456', 'Volkswagen', 'Crafter', 2021, 62.4325, 17.3158, 'in_use', 'diesel', 60.0, 75.0, 1100, 'FAC-SND-BIRSTA', 'DRV-SND-02'),
('VEH-SND-03', 'truck', 'GHI 789', 'Volvo', 'FH16', 2020, 62.4914, 17.3264, 'available', 'diesel', 450.0, 600.0, 12000, 'FAC-SND-TIMRA', 'DRV-SND-03'),
('VEH-SND-04', 'van', 'JKL 012', 'Ford', 'Transit', 2023, 62.3908, 17.3069, 'in_use', 'diesel', 70.0, 80.0, 1300, 'FAC-SND-HQ', 'DRV-SND-04'),
('VEH-SND-05', 'van', 'MNO 345', 'Renault', 'Master', 2022, 62.3908, 17.3069, 'available', 'diesel', 90.0, 70.0, 1000, 'FAC-SND-HQ', 'DRV-SND-05'),
('VEH-SND-06', 'truck', 'PQR 678', 'Scania', 'R450', 2021, 62.4325, 17.3158, 'maintenance', 'diesel', 200.0, 500.0, 15000, 'FAC-SND-BIRSTA', 'DRV-SND-06'),
('VEH-SND-07', 'van', 'STU 901', 'Mercedes-Benz', 'Sprinter', 2023, 62.3908, 17.3069, 'available', 'diesel', 75.0, 80.0, 1200, 'FAC-SND-HQ', 'DRV-SND-07'),
('VEH-SND-08', 'van', 'VWX 234', 'Volkswagen', 'Crafter', 2022, 62.4914, 17.3264, 'available', 'diesel', 80.0, 75.0, 1100, 'FAC-SND-TIMRA', 'DRV-SND-08')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CUSTOMERS (5 Swedish companies)
-- ============================================================================

INSERT INTO customers (id, name, customer_type, contact_name, contact_phone, contact_email, address_street, address_city, address_postal_code, address_country) VALUES
('CUST-SND-01', 'Sundsvall Express AB', 'business', 'Per Andersson', '060-12-34-56', 'info@sundsvallexpress.se', 'Norra Kajen 12', 'Sundsvall', '85230', 'Sverige'),
('CUST-SND-02', 'Medelpad Transport', 'business', 'Karin Berg', '060-23-45-67', 'kontakt@medelpadtransport.se', 'E4 Sundsvall', 'Sundsvall', '85632', 'Sverige'),
('CUST-SND-03', 'Birsta Shopping', 'business', 'Stefan Holm', '060-34-56-78', 'info@birsta.se', 'Gesällvägen 4', 'Sundsvall', '86353', 'Sverige'),
('CUST-SND-04', 'Timrå Industri AB', 'business', 'Lisa Nyström', '060-45-67-89', 'lisa@timraindustri.se', 'Industrivägen 1', 'Timrå', '86133', 'Sverige'),
('CUST-SND-05', 'Sundsvalls Sjukhus', 'government', 'Dr. Anders Ek', '060-18-10-00', 'leveranser@lvn.se', 'Sjukhusvägen', 'Sundsvall', '85643', 'Sverige')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ACTIVE DELIVERIES (5 tasks with recent timestamps)
-- 2 in_progress, 2 assigned, 1 picked_up
-- ============================================================================

INSERT INTO tasks (id, name, description, assigned_vehicle_id, assigned_driver_id, waypoints, status, priority, task_type, source_facility_id, estimated_duration_minutes, estimated_distance_km, scheduled_start, actual_start, notes) VALUES
('DEL-SND-ACT-01', 'Express leverans Birsta Shopping', 'Dagliga leveranser till Birsta köpcentrum', 'VEH-SND-02', 'DRV-SND-02',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.4325,"lon":17.3158,"address":"Birsta Shopping, Gesällvägen 4"}]'::jsonb,
 'in_progress', 'high', 'delivery', 'FAC-SND-HQ', 30, 5.2, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '45 minutes', 'Temperaturkänsligt gods'),

('DEL-SND-ACT-02', 'Akut medicintransport Sundsvalls sjukhus', 'Medicinsk utrustning', 'VEH-SND-04', 'DRV-SND-04',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.3877,"lon":17.3114,"address":"Sundsvalls sjukhus"}]'::jsonb,
 'picked_up', 'urgent', 'delivery', 'FAC-SND-HQ', 20, 2.5, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '15 minutes', 'Prioriterad leverans - ring vid ankomst'),

('DEL-SND-ACT-03', 'Timrå industriområde leverans', 'Industrivaror till Timrå', 'VEH-SND-01', 'DRV-SND-01',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.4914,"lon":17.3264,"address":"Timrå industriområde"}]'::jsonb,
 'assigned', 'normal', 'delivery', 'FAC-SND-HQ', 40, 12.5, NOW() + INTERVAL '30 minutes', NULL, 'Leverans kontorstid 08:00-16:00'),

('DEL-SND-ACT-04', 'E4:an pickup', 'Hämtning på E4 rastplats', 'VEH-SND-05', 'DRV-SND-05',
 '[{"lat":62.4325,"lon":17.3158,"address":"Birsta Terminal"},{"lat":62.5123,"lon":17.3456,"address":"E4 Rastplats Njurunda"}]'::jsonb,
 'assigned', 'normal', 'pickup', 'FAC-SND-BIRSTA', 50, 18.0, NOW() + INTERVAL '1 hour', NULL, 'Hämta paket från lastbilschaufför'),

('DEL-SND-ACT-05', 'Norra kajen hamntransport', 'Transport från hamnområdet', 'VEH-SND-07', 'DRV-SND-07',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.4325,"lon":17.3158,"address":"Birsta Terminal"}]'::jsonb,
 'in_progress', 'high', 'delivery', 'FAC-SND-HQ', 25, 5.0, NOW() - INTERVAL '1 hour 30 minutes', NOW() - INTERVAL '1 hour 15 minutes', 'Tung last, använd lift')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COMPLETED DELIVERIES (20 from last 7 days)
-- ============================================================================

INSERT INTO tasks (id, name, description, assigned_vehicle_id, assigned_driver_id, waypoints, status, priority, task_type, source_facility_id, estimated_duration_minutes, estimated_distance_km, scheduled_start, actual_start, actual_end, delivered_at, delivered_to, notes) VALUES
-- Day 1 (yesterday)
('DEL-SND-C01', 'Birsta Shopping morgonleverans', 'Daglig rutin leverans', 'VEH-SND-01', 'DRV-SND-01',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.4325,"lon":17.3158,"address":"Birsta Shopping"}]'::jsonb,
 'completed', 'normal', 'delivery', 'FAC-SND-HQ', 30, 5.2, NOW() - INTERVAL '1 day 2 hours', NOW() - INTERVAL '1 day 2 hours', NOW() - INTERVAL '1 day 1 hour 30 minutes', NOW() - INTERVAL '1 day 1 hour 30 minutes', 'Stefan Holm', 'Leverans klar'),

('DEL-SND-C02', 'Sjukhuset medicin', 'Medicintransport', 'VEH-SND-02', 'DRV-SND-02',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.3877,"lon":17.3114,"address":"Sundsvalls sjukhus"}]'::jsonb,
 'completed', 'urgent', 'delivery', 'FAC-SND-HQ', 20, 2.5, NOW() - INTERVAL '1 day 3 hours', NOW() - INTERVAL '1 day 3 hours', NOW() - INTERVAL '1 day 2 hours 40 minutes', NOW() - INTERVAL '1 day 2 hours 40 minutes', 'Dr. Anders Ek', 'Prioriterad leverans klar'),

('DEL-SND-C03', 'Timrå industri', 'Reservdelar', 'VEH-SND-03', 'DRV-SND-03',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.4914,"lon":17.3264,"address":"Timrå industriområde"}]'::jsonb,
 'completed', 'normal', 'delivery', 'FAC-SND-HQ', 40, 12.5, NOW() - INTERVAL '1 day 5 hours', NOW() - INTERVAL '1 day 5 hours', NOW() - INTERVAL '1 day 4 hours 20 minutes', NOW() - INTERVAL '1 day 4 hours 20 minutes', 'Lisa Nyström', 'Allt OK'),

('DEL-SND-C04', 'E4 pickup', 'Paketupphämtning', 'VEH-SND-04', 'DRV-SND-04',
 '[{"lat":62.4325,"lon":17.3158,"address":"Birsta Terminal"},{"lat":62.5123,"lon":17.3456,"address":"E4 Rastplats"}]'::jsonb,
 'completed', 'normal', 'pickup', 'FAC-SND-BIRSTA', 50, 18.0, NOW() - INTERVAL '1 day 6 hours', NOW() - INTERVAL '1 day 6 hours', NOW() - INTERVAL '1 day 5 hours 10 minutes', NOW() - INTERVAL '1 day 5 hours 10 minutes', 'Transport AB', 'Hämtat utan problem'),

-- Day 2 (2 days ago)
('DEL-SND-C05', 'Norra kajen hamn', 'Containerleverans', 'VEH-SND-05', 'DRV-SND-05',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.3920,"lon":17.3050,"address":"Hamnområde"}]'::jsonb,
 'completed', 'high', 'delivery', 'FAC-SND-HQ', 25, 1.0, NOW() - INTERVAL '2 days 2 hours', NOW() - INTERVAL '2 days 2 hours', NOW() - INTERVAL '2 days 1 hour 35 minutes', NOW() - INTERVAL '2 days 1 hour 35 minutes', 'Hamn personal', 'Leverans OK'),

('DEL-SND-C06', 'Birsta återleverans', 'Returgods', 'VEH-SND-01', 'DRV-SND-01',
 '[{"lat":62.4325,"lon":17.3158,"address":"Birsta Shopping"},{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"}]'::jsonb,
 'completed', 'normal', 'pickup', 'FAC-SND-BIRSTA', 30, 5.2, NOW() - INTERVAL '2 days 4 hours', NOW() - INTERVAL '2 days 4 hours', NOW() - INTERVAL '2 days 3 hours 30 minutes', NOW() - INTERVAL '2 days 3 hours 30 minutes', 'Stefan Holm', 'Retur hämtad'),

('DEL-SND-C07', 'Medelpad Transport', 'Samarbetsleverans', 'VEH-SND-02', 'DRV-SND-02',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.4100,"lon":17.3200,"address":"E4 Sundsvall"}]'::jsonb,
 'completed', 'normal', 'delivery', 'FAC-SND-HQ', 35, 7.5, NOW() - INTERVAL '2 days 5 hours', NOW() - INTERVAL '2 days 5 hours', NOW() - INTERVAL '2 days 4 hours 25 minutes', NOW() - INTERVAL '2 days 4 hours 25 minutes', 'Karin Berg', 'Leverans slutförd'),

('DEL-SND-C08', 'Sjukhus extra leverans', 'Akut behov', 'VEH-SND-04', 'DRV-SND-04',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.3877,"lon":17.3114,"address":"Sundsvalls sjukhus"}]'::jsonb,
 'completed', 'urgent', 'delivery', 'FAC-SND-HQ', 20, 2.5, NOW() - INTERVAL '2 days 7 hours', NOW() - INTERVAL '2 days 7 hours', NOW() - INTERVAL '2 days 6 hours 40 minutes', NOW() - INTERVAL '2 days 6 hours 40 minutes', 'Dr. Anders Ek', 'Akut leverans klar'),

-- Day 3 (3 days ago)
('DEL-SND-C09', 'Timrå morgon', 'Morgonleverans', 'VEH-SND-03', 'DRV-SND-03',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.4914,"lon":17.3264,"address":"Timrå industriområde"}]'::jsonb,
 'completed', 'normal', 'delivery', 'FAC-SND-HQ', 40, 12.5, NOW() - INTERVAL '3 days 2 hours', NOW() - INTERVAL '3 days 2 hours', NOW() - INTERVAL '3 days 1 hour 20 minutes', NOW() - INTERVAL '3 days 1 hour 20 minutes', 'Lisa Nyström', 'OK'),

('DEL-SND-C10', 'Birsta Shopping eftermiddag', 'Komplettering', 'VEH-SND-01', 'DRV-SND-01',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.4325,"lon":17.3158,"address":"Birsta Shopping"}]'::jsonb,
 'completed', 'normal', 'delivery', 'FAC-SND-HQ', 30, 5.2, NOW() - INTERVAL '3 days 5 hours', NOW() - INTERVAL '3 days 5 hours', NOW() - INTERVAL '3 days 4 hours 30 minutes', NOW() - INTERVAL '3 days 4 hours 30 minutes', 'Stefan Holm', 'Leverans OK'),

('DEL-SND-C11', 'E4 snabbleverans', 'Express', 'VEH-SND-05', 'DRV-SND-05',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.5123,"lon":17.3456,"address":"E4 Rastplats"}]'::jsonb,
 'completed', 'high', 'delivery', 'FAC-SND-HQ', 45, 15.0, NOW() - INTERVAL '3 days 6 hours', NOW() - INTERVAL '3 days 6 hours', NOW() - INTERVAL '3 days 5 hours 15 minutes', NOW() - INTERVAL '3 days 5 hours 15 minutes', 'Transport AB', 'Snabbt och säkert'),

-- Day 4 (4 days ago)
('DEL-SND-C12', 'Hamntransport morgon', 'Containerhämtning', 'VEH-SND-07', 'DRV-SND-07',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.4325,"lon":17.3158,"address":"Birsta Terminal"}]'::jsonb,
 'completed', 'normal', 'delivery', 'FAC-SND-HQ', 25, 5.0, NOW() - INTERVAL '4 days 2 hours', NOW() - INTERVAL '4 days 2 hours', NOW() - INTERVAL '4 days 1 hour 35 minutes', NOW() - INTERVAL '4 days 1 hour 35 minutes', 'Terminal chef', 'Klar'),

('DEL-SND-C13', 'Sundsvall sjukhus rutin', 'Veckoleverans', 'VEH-SND-02', 'DRV-SND-02',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.3877,"lon":17.3114,"address":"Sundsvalls sjukhus"}]'::jsonb,
 'completed', 'normal', 'delivery', 'FAC-SND-HQ', 20, 2.5, NOW() - INTERVAL '4 days 4 hours', NOW() - INTERVAL '4 days 4 hours', NOW() - INTERVAL '4 days 3 hours 40 minutes', NOW() - INTERVAL '4 days 3 hours 40 minutes', 'Leveransmottagning', 'Allt i sin ordning'),

('DEL-SND-C14', 'Timrå kvällsleverans', 'Sena leveranser', 'VEH-SND-03', 'DRV-SND-03',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.4914,"lon":17.3264,"address":"Timrå industriområde"}]'::jsonb,
 'completed', 'normal', 'delivery', 'FAC-SND-HQ', 40, 12.5, NOW() - INTERVAL '4 days 7 hours', NOW() - INTERVAL '4 days 7 hours', NOW() - INTERVAL '4 days 6 hours 20 minutes', NOW() - INTERVAL '4 days 6 hours 20 minutes', 'Lisa Nyström', 'Sen men OK'),

-- Day 5 (5 days ago)
('DEL-SND-C15', 'Birsta stor leverans', 'Veckoslut påfyllning', 'VEH-SND-01', 'DRV-SND-01',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.4325,"lon":17.3158,"address":"Birsta Shopping"}]'::jsonb,
 'completed', 'high', 'delivery', 'FAC-SND-HQ', 30, 5.2, NOW() - INTERVAL '5 days 3 hours', NOW() - INTERVAL '5 days 3 hours', NOW() - INTERVAL '5 days 2 hours 30 minutes', NOW() - INTERVAL '5 days 2 hours 30 minutes', 'Stefan Holm', 'Stor leverans OK'),

('DEL-SND-C16', 'E4 kombinerad tur', 'Flera stopp', 'VEH-SND-04', 'DRV-SND-04',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.5123,"lon":17.3456,"address":"E4 Rastplats"}]'::jsonb,
 'completed', 'normal', 'delivery', 'FAC-SND-HQ', 50, 18.0, NOW() - INTERVAL '5 days 5 hours', NOW() - INTERVAL '5 days 5 hours', NOW() - INTERVAL '5 days 4 hours 10 minutes', NOW() - INTERVAL '5 days 4 hours 10 minutes', 'Transport AB', 'Flera leveranser'),

-- Day 6 (6 days ago)
('DEL-SND-C17', 'Medelpad samarbete', 'Partner leverans', 'VEH-SND-05', 'DRV-SND-05',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.4100,"lon":17.3200,"address":"E4 Sundsvall"}]'::jsonb,
 'completed', 'normal', 'delivery', 'FAC-SND-HQ', 35, 7.5, NOW() - INTERVAL '6 days 2 hours', NOW() - INTERVAL '6 days 2 hours', NOW() - INTERVAL '6 days 1 hour 25 minutes', NOW() - INTERVAL '6 days 1 hour 25 minutes', 'Karin Berg', 'Samarbete funkar bra'),

('DEL-SND-C18', 'Hamn containrar', 'Import gods', 'VEH-SND-07', 'DRV-SND-07',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.3920,"lon":17.3050,"address":"Hamnområde"}]'::jsonb,
 'completed', 'normal', 'delivery', 'FAC-SND-HQ', 25, 1.0, NOW() - INTERVAL '6 days 4 hours', NOW() - INTERVAL '6 days 4 hours', NOW() - INTERVAL '6 days 3 hours 35 minutes', NOW() - INTERVAL '6 days 3 hours 35 minutes', 'Hamn personal', 'Gods hämtat'),

-- Day 7 (7 days ago)
('DEL-SND-C19', 'Timrå veckostart', 'Måndagsleverans', 'VEH-SND-03', 'DRV-SND-03',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.4914,"lon":17.3264,"address":"Timrå industriområde"}]'::jsonb,
 'completed', 'normal', 'delivery', 'FAC-SND-HQ', 40, 12.5, NOW() - INTERVAL '7 days 2 hours', NOW() - INTERVAL '7 days 2 hours', NOW() - INTERVAL '7 days 1 hour 20 minutes', NOW() - INTERVAL '7 days 1 hour 20 minutes', 'Lisa Nyström', 'Bra veckostart'),

('DEL-SND-C20', 'Sjukhus brådskande', 'Akut medicin', 'VEH-SND-02', 'DRV-SND-02',
 '[{"lat":62.3908,"lon":17.3069,"address":"Norra Kajen 12, Sundsvall"},{"lat":62.3877,"lon":17.3114,"address":"Sundsvalls sjukhus"}]'::jsonb,
 'completed', 'urgent', 'delivery', 'FAC-SND-HQ', 20, 2.5, NOW() - INTERVAL '7 days 5 hours', NOW() - INTERVAL '7 days 5 hours', NOW() - INTERVAL '7 days 4 hours 40 minutes', NOW() - INTERVAL '7 days 4 hours 40 minutes', 'Dr. Anders Ek', 'Akut leverans genomförd')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Facilities: 6 (Sundsvall HQ, Birsta, Timrå, Stockholm, Göteborg, Hospital)
-- Drivers: 8 (Swedish names with proper licenses)
-- Vehicles: 8 (Swedish plates: ABC 123, DEF 456, etc.)
-- Customers: 5 (Swedish companies and institutions)
-- Active Deliveries: 5 (2 in_progress, 2 assigned, 1 picked_up)
-- Completed Deliveries: 20 (last 7 days with realistic timestamps)
-- ============================================================================

-- Demo PIN codes for driver app testing:
-- Vehicle VEH-SND-01 (ABC 123) -> PIN: 0001 -> Anders Svensson
-- Vehicle VEH-SND-02 (DEF 456) -> PIN: 0002 -> Maria Andersson
-- Vehicle VEH-SND-03 (GHI 789) -> PIN: 0003 -> Erik Johansson
-- Vehicle VEH-SND-04 (JKL 012) -> PIN: 0004 -> Sofia Bergström

-- ============================================================================
-- PHASE 2 INVENTORY DATA
-- Vehicle Equipment, Cargo, Facility Stock, Fuel Tracking
-- ============================================================================

-- Vehicle equipment for VEH-SND-01 (ABC 123)
INSERT INTO inventory (id, name, type, category, category_id, quantity, unit, 
    assigned_to_asset_id, status, last_inspection_date, next_inspection_due, description, location_id) VALUES
('INV-VEH-ABC123-GPS', 'GPS Tracker', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-01', 'assigned', '2025-11-10', '2026-05-10', 'Garmin Fleet 790 GPS-enhet', 'VEH-SND-01'),
('INV-VEH-ABC123-RADIO', 'Communication Radio', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-01', 'assigned', '2025-11-01', '2026-11-01', 'Motorola DP4400e digital radio', 'VEH-SND-01'),
('INV-VEH-ABC123-EXTINGUISHER', 'Fire Extinguisher', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-01', 'assigned', '2025-10-15', '2026-03-15', '6kg pulversläckare', 'VEH-SND-01'),
('INV-VEH-DEF456-GPS', 'GPS Tracker', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-02', 'assigned', '2025-11-08', '2026-05-08', 'Garmin Fleet 790 GPS-enhet', 'VEH-SND-02'),
('INV-VEH-DEF456-RADIO', 'Communication Radio', 'equipment', 'vehicle_equipment', 'vehicle_equipment', 1, 'unit',
    'VEH-SND-02', 'needs_replacement', '2025-09-15', '2026-09-15', 'Motorola - kräver service', 'VEH-SND-02')
ON CONFLICT (id) DO NOTHING;

-- Cargo in transit
INSERT INTO inventory (id, name, type, category, category_id, quantity, unit, 
    tracking_number, assigned_to_asset_id, status, weight_kg, special_handling, 
    customer_info, location_id) VALUES
('INV-CARGO-001', 'Medicinsk utrustning', 'cargo', 'cargo_delivery', 'cargo_delivery', 1, 'package',
    'AEGIS-SND-001', 'VEH-SND-04', 'in_transit', 15.5, 'fragile',
    '{"pickup": "Stockholm DC", "delivery": "Sundsvalls sjukhus", "contact": "Dr. Anders Ek"}'::jsonb, 'VEH-SND-04'),
('INV-CARGO-002', 'Kontorstillbehör', 'cargo', 'cargo_delivery', 'cargo_delivery', 1, 'package',
    'AEGIS-SND-002', 'VEH-SND-02', 'in_transit', 12.3, NULL,
    '{"pickup": "Stockholm DC", "delivery": "Birsta Shopping", "contact": "Stefan Holm"}'::jsonb, 'VEH-SND-02'),
('INV-CARGO-003', 'Industrivaror', 'cargo', 'cargo_delivery', 'cargo_delivery', 3, 'box',
    'AEGIS-SND-003', NULL, 'awaiting_pickup', 45.0, NULL,
    '{"pickup": "Stockholm DC", "delivery": "Timrå Industri", "contact": "Lisa Nyström"}'::jsonb, 'FAC-STO-DC')
ON CONFLICT (id) DO NOTHING;

-- Facility stock at Sundsvall HQ
INSERT INTO inventory (id, name, type, category, category_id, quantity, unit, 
    assigned_to_facility_id, location_id, status, min_stock_level, max_stock_level,
    unit_cost, currency, description) VALUES
('INV-FAC-SND-DIESEL', 'Diesel Bränsle', 'fuel', 'facility_stock', 'facility_stock', 8000, 'liter',
    'FAC-SND-HQ', 'FAC-SND-HQ', 'available', 2000, 10000, 18.50, 'SEK', 'Diesel lagertank'),
('INV-FAC-SND-OIL-FILTER', 'Oljefilter', 'spare_parts', 'facility_stock', 'facility_stock', 25, 'units',
    'FAC-SND-HQ', 'FAC-SND-HQ', 'available', 10, 50, 145.00, 'SEK', 'Standardfilter Mercedes/VW/Volvo'),
('INV-FAC-SND-BRAKE-PADS', 'Bromsbelägg', 'spare_parts', 'facility_stock', 'facility_stock', 8, 'sets',
    'FAC-SND-HQ', 'FAC-SND-HQ', 'available', 5, 20, 850.00, 'SEK', 'Bromsbelägg lätta lastbilar'),
('INV-FAC-SND-PALLETS', 'EUR-pallar', 'packaging', 'facility_stock', 'facility_stock', 150, 'units',
    'FAC-SND-HQ', 'FAC-SND-HQ', 'available', 50, 300, 125.00, 'SEK', 'Standardpallar för frakt')
ON CONFLICT (id) DO NOTHING;

-- Fuel tracking history
INSERT INTO fuel_tracking (id, asset_id, facility_id, quantity_liters, cost_sek, 
    odometer_km, fuel_type, driver_id, timestamp, notes) VALUES
('FUEL-001', 'VEH-SND-01', 'FAC-SND-HQ', 65.0, 1202.50, 45823, 'diesel', 'DRV-SND-01', NOW() - INTERVAL '2 days', 'Tankning efter Stockholmstur'),
('FUEL-002', 'VEH-SND-02', 'FAC-SND-BIRSTA', 55.0, 1017.50, 38456, 'diesel', 'DRV-SND-02', NOW() - INTERVAL '1 day', 'Rutintankning'),
('FUEL-003', 'VEH-SND-03', 'FAC-SND-HQ', 420.0, 7770.00, 128934, 'diesel', 'DRV-SND-03', NOW() - INTERVAL '3 days', 'Full tank långtur'),
('FUEL-004', 'VEH-SND-04', 'FAC-SND-HQ', 58.0, 1073.00, 32187, 'diesel', 'DRV-SND-04', NOW() - INTERVAL '1 day', 'Tankning före akutleverans')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Updated demo summary
-- ============================================================================
-- Facilities: 6 
-- Drivers: 8
-- Vehicles: 8 
-- Customers: 5
-- Active Deliveries: 5
-- Completed Deliveries: 20
-- NEW: Vehicle Equipment Items: 5
-- NEW: Cargo Items: 3
-- NEW: Facility Stock Items: 4
-- NEW: Fuel Records: 4
-- ============================================================================
