# SYLON Works Module Documentation

## Overview

The SYLON Works module is a comprehensive construction and contracting operations management system integrated into the SYLON Logistics platform. It provides tools for managing projects, work orders, equipment usage, change orders (ÄTA - Ändrings- och Tilläggsarbeten), winter maintenance operations, and documentation.

## Key Features

### 1. Project Management
- Create and manage construction/contracting projects
- Track project status from planning to completion
- Monitor budgets and schedules
- Link projects to customers and facilities
- Assign project managers

### 2. Work Order Management
- Kanban-style work order board for visual task management
- Multiple work order types: construction, maintenance, winter maintenance, emergency
- Priority levels: low, medium, high, urgent
- Status tracking: draft, scheduled, in_progress, completed, cancelled
- Location tracking with coordinates and addresses
- Assignment to team members

### 3. Machine Hours Tracking
- Log equipment usage with start/end times
- Automatic calculation of hours worked
- Cost tracking with hourly rates
- Link to projects and work orders
- Operator assignment

### 4. Change Orders (ÄTA)
- Swedish-specific change order management
- Track scope changes and additional work
- Estimate costs and time impact
- Approval workflow: draft → submitted → approved/rejected → completed
- Link to parent projects

### 5. Winter Maintenance
- Specialized tracking for Swedish winter road maintenance
- Road condition monitoring (dry, wet, snow, ice, black ice)
- Material usage tracking (salt, sand)
- Plowing operations logging
- Distance and route tracking
- Weather condition notes

### 6. Documentation Management
- Store project-related documents
- Multiple document types: photo, report, invoice, contract, permit
- Link documents to projects, work orders, or change orders
- File metadata tracking

## Data Model

### Entity Relationships

```
works_projects
├── works_work_orders (1:N)
│   ├── works_machine_hours (1:N)
│   └── works_winter_maintenance (1:N)
├── works_machine_hours (1:N)
├── works_change_orders (1:N)
└── works_documentation (1:N)

works_work_orders
└── works_documentation (1:N)

works_change_orders
└── works_documentation (1:N)
```

### Core Tables

#### works_projects
Primary project tracking table with the following key fields:
- `id`: Unique identifier
- `project_number`: Human-readable project number (e.g., "PRJ-2025-001")
- `name`: Project name
- `status`: planning, active, on_hold, completed, cancelled
- `customer_id`: Link to customers table
- `site_id`: Link to facilities table
- `budget`: Project budget amount
- `start_date` / `end_date`: Project timeline
- `project_manager_id`: Link to users table

#### works_work_orders
Individual work tasks with:
- `id`: Unique identifier
- `order_number`: Human-readable order number (e.g., "WO-2025-001")
- `project_id`: Optional link to parent project
- `type`: construction, maintenance, winter_maintenance, emergency, other
- `priority`: low, medium, high, urgent
- `status`: draft, scheduled, in_progress, completed, cancelled
- `location_lat` / `location_lng`: GPS coordinates
- `scheduled_start` / `scheduled_end`: Planned times
- `actual_start` / `actual_end`: Actual completion times

#### works_machine_hours
Equipment usage tracking with:
- `id`: Unique identifier
- `asset_id`: Link to assets table (equipment)
- `operator_id`: Link to users table
- `start_time` / `end_time`: Usage period
- `hours`: Auto-calculated duration
- `hourly_rate`: Cost per hour
- `total_cost`: Auto-calculated (hours × hourly_rate)

#### works_change_orders
Change order (ÄTA) management with:
- `id`: Unique identifier
- `change_order_number`: Human-readable ÄTA number (e.g., "ÄTA-2025-001")
- `project_id`: Link to parent project
- `status`: draft, submitted, approved, rejected, completed
- `estimated_cost` / `actual_cost`: Cost tracking
- `estimated_hours`: Time impact
- `impact_on_schedule`: Schedule impact in days
- `submitted_at` / `approved_at`: Workflow timestamps

#### works_winter_maintenance
Winter operations tracking with:
- `id`: Unique identifier
- `work_order_id`: Link to parent work order
- `road_condition`: dry, wet, snow, ice, black_ice
- `salt_used_kg` / `sand_used_kg`: Material usage
- `plowing_performed`: Boolean flag
- `distance_km`: Route distance
- `temperature`: Weather temperature

## API Endpoints

### Projects

```
GET    /api/v1/works/projects                    # List all projects
POST   /api/v1/works/projects                    # Create new project
GET    /api/v1/works/projects/{id}               # Get project details
PUT    /api/v1/works/projects/{id}               # Update project
DELETE /api/v1/works/projects/{id}               # Delete project
GET    /api/v1/works/projects/{id}/statistics    # Get project statistics
```

#### Query Parameters (List)
- `status`: Filter by status (planning, active, on_hold, completed, cancelled)
- `customer_id`: Filter by customer
- `project_manager_id`: Filter by project manager

### Work Orders

```
GET    /api/v1/works/work-orders                 # List all work orders
POST   /api/v1/works/work-orders                 # Create new work order
GET    /api/v1/works/work-orders/{id}            # Get work order details
PUT    /api/v1/works/work-orders/{id}            # Update work order
DELETE /api/v1/works/work-orders/{id}            # Delete work order
POST   /api/v1/works/work-orders/{id}/start      # Start work order
POST   /api/v1/works/work-orders/{id}/complete   # Complete work order
```

#### Query Parameters (List)
- `project_id`: Filter by project
- `status`: Filter by status
- `assigned_to`: Filter by assignee
- `type`: Filter by type

### Machine Hours

```
GET    /api/v1/works/machine-hours               # List all machine hours
POST   /api/v1/works/machine-hours               # Log machine hours
GET    /api/v1/works/machine-hours/{id}          # Get entry details
PUT    /api/v1/works/machine-hours/{id}          # Update entry
GET    /api/v1/works/projects/{id}/machine-hours # Get project machine hours
```

#### Query Parameters (List)
- `project_id`: Filter by project
- `work_order_id`: Filter by work order
- `asset_id`: Filter by asset
- `operator_id`: Filter by operator

### Change Orders

```
GET    /api/v1/works/change-orders               # List all change orders
POST   /api/v1/works/change-orders               # Create new change order
GET    /api/v1/works/change-orders/{id}          # Get change order details
PUT    /api/v1/works/change-orders/{id}          # Update change order
POST   /api/v1/works/change-orders/{id}/submit   # Submit for approval
POST   /api/v1/works/change-orders/{id}/approve  # Approve change order
POST   /api/v1/works/change-orders/{id}/reject   # Reject change order
```

#### Query Parameters (List)
- `project_id`: Filter by project
- `status`: Filter by status

### Winter Maintenance

```
GET    /api/v1/works/winter-maintenance          # List all entries
POST   /api/v1/works/winter-maintenance          # Create new entry
GET    /api/v1/works/winter-maintenance/{id}     # Get entry details
PUT    /api/v1/works/winter-maintenance/{id}     # Update entry
```

#### Query Parameters (List)
- `work_order_id`: Filter by work order
- `route_name`: Search by route name

### Documentation

```
GET    /api/v1/works/documentation               # List all documents
POST   /api/v1/works/documentation               # Upload document
GET    /api/v1/works/documentation/{id}          # Get document details
DELETE /api/v1/works/documentation/{id}          # Delete document
```

#### Query Parameters (List)
- `project_id`: Filter by project
- `work_order_id`: Filter by work order
- `change_order_id`: Filter by change order
- `document_type`: Filter by type

## Frontend Pages

### Dashboard (`/works`)
- Overview statistics cards (active projects, work orders, machine hours, pending ÄTA)
- Recent projects list
- Recent work orders list
- Quick action buttons

### Project List (`/works/projects`)
- Searchable and filterable project list
- Status badges
- Budget and date information
- Create new project button

### Work Order Board (`/works/work-orders`)
- Kanban-style board with columns: Draft, Scheduled, In Progress, Completed
- Drag-and-drop functionality for status changes
- Priority and type badges
- Filter by project

### Machine Hours (`/works/machine-hours`)
- Summary statistics (total hours, total cost, entry count)
- Detailed table view with asset, times, hours, and costs
- Create new entry

### Change Orders (`/works/change-orders`)
- List view with status filtering
- Estimated/actual cost display
- Submit/approve/reject actions
- Link to parent projects

## Integration Points

### Existing SYLON Systems

1. **Assets Module**
   - Machine hours link to assets (equipment/vehicles)
   - Asset availability can be checked for work order scheduling

2. **Users Module**
   - Project managers, operators, and approvers are users
   - Authentication and authorization using existing JWT system

3. **Facilities Module**
   - Projects can be linked to facility sites
   - Work orders can reference facility locations

4. **Customers Module**
   - Projects are linked to customers
   - Customer contact information available for project communication

## Workflows

### Project Lifecycle
1. Create project in "planning" status
2. Add project details (customer, site, budget, dates)
3. Activate project (status → "active")
4. Create work orders for project tasks
5. Log machine hours as work progresses
6. Handle change requests via ÄTA process
7. Complete work orders
8. Mark project as "completed"

### Work Order Lifecycle
1. Create work order (draft)
2. Schedule work (add times, assign to operator)
3. Start work order (status → "in_progress", log actual_start)
4. Log machine hours during work
5. Complete work order (status → "completed", log actual_end)

### ÄTA (Change Order) Workflow
1. Create change order in "draft" status
2. Add details (description, reason, estimates)
3. Submit for approval (status → "submitted")
4. Manager approves or rejects
5. If approved, implement changes
6. Mark as "completed" when work done

### Winter Maintenance Workflow
1. Create work order for winter maintenance route
2. Log winter maintenance entry
3. Record road conditions and weather
4. Track material usage (salt, sand)
5. Record distance and plowing operations
6. Complete work order

## Automatic Calculations

### Machine Hours
- **Hours**: Automatically calculated from `end_time - start_time`
- **Total Cost**: Automatically calculated as `hours × hourly_rate`
- Trigger function runs on INSERT/UPDATE

### Timestamps
- `updated_at` fields automatically updated on record changes
- Trigger functions ensure data consistency

## Security

- All endpoints require authentication (JWT tokens)
- Role-based access control inherited from existing SYLON system
- User actions tracked via `created_by` and `uploaded_by` fields
- Approval workflows require appropriate permissions

## Future Enhancements

### Planned Features
1. **Advanced Reporting**
   - Project profitability analysis
   - Equipment utilization reports
   - Cost variance tracking
   - Timeline analysis

2. **PDF Export**
   - Project reports
   - Change order documents
   - Machine hour summaries
   - Winter maintenance logs

3. **Mobile App**
   - Field operator app for work order management
   - Mobile machine hour logging
   - Photo capture for documentation
   - Offline capability

4. **Real-time Collaboration**
   - Live updates via WebSockets
   - Team notifications
   - Comment threads on work orders
   - Activity feeds

5. **Advanced Scheduling**
   - Resource conflict detection
   - Automatic scheduling algorithms
   - Calendar integrations
   - Critical path analysis

6. **External Integrations**
   - Accounting system integration
   - Time tracking systems
   - Weather API for winter maintenance
   - Equipment telematics

### Technical Improvements
- GraphQL API for flexible data queries
- Improved caching strategies
- Real-time dashboard updates
- Advanced search with Elasticsearch
- Bulk operations support
- Export to Excel/CSV

## Database Migration

To apply the Works module to an existing SYLON installation:

```bash
# Connect to PostgreSQL
psql -U postgres -d sylon_db

# Run migration
\i backend/migrations/003_works_module.sql
```

The migration is idempotent and safe to run multiple times.

## Testing

Run the Works module tests:

```bash
cd backend
source venv/bin/activate
pytest tests/test_works.py -v
```

Tests cover:
- CRUD operations for all entities
- Workflow transitions (start, complete, submit, approve)
- Authentication requirements
- Automatic calculations
- Data validation

## Troubleshooting

### Common Issues

1. **Tables not created**
   - Ensure migration 003 has been applied
   - Check database logs for errors
   - Verify UUID extension is enabled

2. **Foreign key violations**
   - Ensure referenced records exist (users, assets, facilities, customers)
   - Check cascade delete settings

3. **Calculation not working**
   - Verify trigger functions are installed
   - Check PostgreSQL trigger status
   - Ensure end_time > start_time for machine hours

4. **Authentication errors**
   - Verify JWT token is valid
   - Check user has appropriate role
   - Ensure Authorization header is set

## Support

For issues or questions about the Works module:
- Check this documentation
- Review API documentation at `/docs` (FastAPI Swagger UI)
- Examine test cases in `backend/tests/test_works.py`
- Contact: SYLON support team

## Version History

- **v1.0.0** (2025-01-20): Initial release
  - Complete project, work order, machine hours, ÄTA, winter maintenance, and documentation functionality
  - Full REST API implementation
  - React frontend with dashboard, Kanban board, and list views
  - Database schema with automatic calculations
  - Comprehensive test suite
