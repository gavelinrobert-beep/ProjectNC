-- ============================================================================
-- SYLON Works Module - Construction/Contracting Operations
-- Entreprenadmodul för projektledning, arbetsorder, maskintimmar, ÄTA, och vinterdrift
-- ============================================================================

-- ============================================================================
-- WORKS PROJECTS
-- Project management for construction and contracting work
-- ============================================================================
CREATE TABLE IF NOT EXISTS works_projects (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    project_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    customer_id TEXT REFERENCES customers(id),
    site_id TEXT REFERENCES facilities(id),
    status TEXT NOT NULL DEFAULT 'planning',
    -- Status values: 'planning', 'active', 'on_hold', 'completed', 'cancelled'
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    project_manager_id TEXT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT REFERENCES users(id),
    
    CONSTRAINT works_projects_status_check CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled'))
);

CREATE INDEX idx_works_projects_status ON works_projects(status);
CREATE INDEX idx_works_projects_customer ON works_projects(customer_id);
CREATE INDEX idx_works_projects_site ON works_projects(site_id);
CREATE INDEX idx_works_projects_manager ON works_projects(project_manager_id);
CREATE INDEX idx_works_projects_dates ON works_projects(start_date, end_date);

-- ============================================================================
-- WORKS WORK ORDERS
-- Individual work assignments and tasks within projects
-- ============================================================================
CREATE TABLE IF NOT EXISTS works_work_orders (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    order_number TEXT UNIQUE NOT NULL,
    project_id TEXT REFERENCES works_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'other',
    -- Type values: 'construction', 'maintenance', 'winter_maintenance', 'emergency', 'other'
    priority TEXT NOT NULL DEFAULT 'medium',
    -- Priority values: 'low', 'medium', 'high', 'urgent'
    status TEXT NOT NULL DEFAULT 'draft',
    -- Status values: 'draft', 'scheduled', 'in_progress', 'completed', 'cancelled'
    assigned_to TEXT REFERENCES users(id),
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    location_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT REFERENCES users(id),
    
    CONSTRAINT works_work_orders_type_check CHECK (type IN ('construction', 'maintenance', 'winter_maintenance', 'emergency', 'other')),
    CONSTRAINT works_work_orders_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT works_work_orders_status_check CHECK (status IN ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled'))
);

CREATE INDEX idx_works_work_orders_project ON works_work_orders(project_id);
CREATE INDEX idx_works_work_orders_status ON works_work_orders(status);
CREATE INDEX idx_works_work_orders_assigned ON works_work_orders(assigned_to);
CREATE INDEX idx_works_work_orders_type ON works_work_orders(type);
CREATE INDEX idx_works_work_orders_scheduled ON works_work_orders(scheduled_start, scheduled_end);

-- ============================================================================
-- WORKS MACHINE HOURS
-- Track machine/equipment usage hours and costs
-- ============================================================================
CREATE TABLE IF NOT EXISTS works_machine_hours (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    work_order_id TEXT REFERENCES works_work_orders(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES works_projects(id) ON DELETE CASCADE,
    asset_id TEXT REFERENCES assets(id),
    operator_id TEXT REFERENCES users(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    hours DECIMAL(10,2),
    hourly_rate DECIMAL(10,2),
    total_cost DECIMAL(15,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT REFERENCES users(id)
);

CREATE INDEX idx_works_machine_hours_work_order ON works_machine_hours(work_order_id);
CREATE INDEX idx_works_machine_hours_project ON works_machine_hours(project_id);
CREATE INDEX idx_works_machine_hours_asset ON works_machine_hours(asset_id);
CREATE INDEX idx_works_machine_hours_operator ON works_machine_hours(operator_id);
CREATE INDEX idx_works_machine_hours_time ON works_machine_hours(start_time, end_time);

-- ============================================================================
-- WORKS CHANGE ORDERS (ÄTA - Ändrings- och Tilläggsarbeten)
-- Track changes and additional work requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS works_change_orders (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    change_order_number TEXT UNIQUE NOT NULL,
    project_id TEXT REFERENCES works_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    -- Status values: 'draft', 'submitted', 'approved', 'rejected', 'completed'
    requested_by TEXT REFERENCES users(id),
    approved_by TEXT REFERENCES users(id),
    estimated_cost DECIMAL(15,2),
    actual_cost DECIMAL(15,2),
    estimated_hours DECIMAL(10,2),
    impact_on_schedule INTEGER, -- days
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT works_change_orders_status_check CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'completed'))
);

CREATE INDEX idx_works_change_orders_project ON works_change_orders(project_id);
CREATE INDEX idx_works_change_orders_status ON works_change_orders(status);
CREATE INDEX idx_works_change_orders_requested ON works_change_orders(requested_by);
CREATE INDEX idx_works_change_orders_approved ON works_change_orders(approved_by);

-- ============================================================================
-- WORKS WINTER MAINTENANCE
-- Track winter road maintenance operations (Swedish specific)
-- ============================================================================
CREATE TABLE IF NOT EXISTS works_winter_maintenance (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    work_order_id TEXT REFERENCES works_work_orders(id) ON DELETE CASCADE,
    route_name TEXT,
    road_condition TEXT NOT NULL DEFAULT 'dry',
    -- Road condition values: 'dry', 'wet', 'snow', 'ice', 'black_ice'
    weather_condition TEXT,
    temperature DECIMAL(5,2),
    salt_used_kg DECIMAL(10,2),
    sand_used_kg DECIMAL(10,2),
    plowing_performed BOOLEAN DEFAULT FALSE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    distance_km DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT REFERENCES users(id),
    
    CONSTRAINT works_winter_maintenance_condition_check CHECK (road_condition IN ('dry', 'wet', 'snow', 'ice', 'black_ice'))
);

CREATE INDEX idx_works_winter_maintenance_work_order ON works_winter_maintenance(work_order_id);
CREATE INDEX idx_works_winter_maintenance_time ON works_winter_maintenance(start_time, end_time);
CREATE INDEX idx_works_winter_maintenance_route ON works_winter_maintenance(route_name);

-- ============================================================================
-- WORKS DOCUMENTATION
-- Store project documents, photos, reports, contracts, permits
-- ============================================================================
CREATE TABLE IF NOT EXISTS works_documentation (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    project_id TEXT REFERENCES works_projects(id) ON DELETE CASCADE,
    work_order_id TEXT REFERENCES works_work_orders(id) ON DELETE CASCADE,
    change_order_id TEXT REFERENCES works_change_orders(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL DEFAULT 'other',
    -- Document types: 'photo', 'report', 'invoice', 'contract', 'permit', 'other'
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by TEXT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT works_documentation_type_check CHECK (document_type IN ('photo', 'report', 'invoice', 'contract', 'permit', 'other'))
);

CREATE INDEX idx_works_documentation_project ON works_documentation(project_id);
CREATE INDEX idx_works_documentation_work_order ON works_documentation(work_order_id);
CREATE INDEX idx_works_documentation_change_order ON works_documentation(change_order_id);
CREATE INDEX idx_works_documentation_type ON works_documentation(document_type);
CREATE INDEX idx_works_documentation_uploaded ON works_documentation(uploaded_by);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically calculate machine hours
CREATE OR REPLACE FUNCTION calculate_machine_hours()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.hours := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600.0;
        IF NEW.hourly_rate IS NOT NULL THEN
            NEW.total_cost := NEW.hours * NEW.hourly_rate;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate machine hours
DROP TRIGGER IF EXISTS trigger_calculate_machine_hours ON works_machine_hours;
CREATE TRIGGER trigger_calculate_machine_hours
    BEFORE INSERT OR UPDATE ON works_machine_hours
    FOR EACH ROW
    EXECUTE FUNCTION calculate_machine_hours();

-- Function to update project updated_at timestamp
CREATE OR REPLACE FUNCTION update_works_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
DROP TRIGGER IF EXISTS trigger_works_projects_updated ON works_projects;
CREATE TRIGGER trigger_works_projects_updated
    BEFORE UPDATE ON works_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_works_updated_at();

DROP TRIGGER IF EXISTS trigger_works_work_orders_updated ON works_work_orders;
CREATE TRIGGER trigger_works_work_orders_updated
    BEFORE UPDATE ON works_work_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_works_updated_at();

DROP TRIGGER IF EXISTS trigger_works_change_orders_updated ON works_change_orders;
CREATE TRIGGER trigger_works_change_orders_updated
    BEFORE UPDATE ON works_change_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_works_updated_at();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE works_projects IS 'Construction and contracting projects';
COMMENT ON TABLE works_work_orders IS 'Individual work assignments within projects';
COMMENT ON TABLE works_machine_hours IS 'Machine/equipment usage tracking with cost calculation';
COMMENT ON TABLE works_change_orders IS 'ÄTA - Ändrings- och Tilläggsarbeten (Change Orders)';
COMMENT ON TABLE works_winter_maintenance IS 'Swedish winter road maintenance operations tracking';
COMMENT ON TABLE works_documentation IS 'Project documentation storage (photos, reports, contracts, etc.)';
