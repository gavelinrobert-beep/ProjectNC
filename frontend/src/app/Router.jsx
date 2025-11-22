import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../shared/components/layouts/MainLayout'
import { ROUTES } from '../shared/constants/routes'

// Dashboard
import DashboardPage from '../modules/dashboard/pages/DashboardPage'

// Operations
import OperationsPage from '../modules/operations/pages/OperationsPage'

// Logistics
import DeliveriesPage from '../modules/logistics/pages/DeliveriesPage'
import RoutesPage from '../modules/logistics/pages/RoutesPage'
import CustomersPage from '../modules/logistics/pages/CustomersPage'

// Fleet
import VehiclesPage from '../modules/fleet/pages/VehiclesPage'
import DriversPage from '../modules/fleet/pages/DriversPage'
import MaintenancePage from '../modules/fleet/pages/MaintenancePage'

// Sites
import DepotsPage from '../modules/sites/pages/DepotsPage'
import InventoryPage from '../modules/sites/pages/InventoryPage'
import MaterialsPage from '../modules/sites/pages/MaterialsPage'

// Works
import WorksDashboardPage from '../modules/works/pages/WorksDashboardPage'
import ProjectsPage from '../modules/works/pages/ProjectsPage'
import WorkOrdersPage from '../modules/works/pages/WorkOrdersPage'
import MachineHoursPage from '../modules/works/pages/MachineHoursPage'
import ChangeOrdersPage from '../modules/works/pages/ChangeOrdersPage'

// Field (stays separate)
import FieldApp from '../features/field/pages/DriverApp'

export default function Router() {
  return (
    <Routes>
      {/* Field app has its own layout */}
      <Route path="/field" element={<FieldApp />} />

      {/* Main app routes with shared layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.OPERATIONS} element={<OperationsPage />} />
        
        {/* Logistics */}
        <Route path={ROUTES.LOGISTICS.DELIVERIES} element={<DeliveriesPage />} />
        <Route path={ROUTES.LOGISTICS.ROUTES} element={<RoutesPage />} />
        <Route path={ROUTES.LOGISTICS.CUSTOMERS} element={<CustomersPage />} />
        
        {/* Fleet */}
        <Route path={ROUTES.FLEET.VEHICLES} element={<VehiclesPage />} />
        <Route path={ROUTES.FLEET.DRIVERS} element={<DriversPage />} />
        <Route path={ROUTES.FLEET.MAINTENANCE} element={<MaintenancePage />} />
        
        {/* Sites */}
        <Route path={ROUTES.SITES.DEPOTS} element={<DepotsPage />} />
        <Route path={ROUTES.SITES.INVENTORY} element={<InventoryPage />} />
        <Route path={ROUTES.SITES.MATERIALS} element={<MaterialsPage />} />
        
        {/* Works */}
        <Route path={ROUTES.WORKS.DASHBOARD} element={<WorksDashboardPage />} />
        <Route path={ROUTES.WORKS.PROJECTS} element={<ProjectsPage />} />
        <Route path={ROUTES.WORKS.WORK_ORDERS} element={<WorkOrdersPage />} />
        <Route path={ROUTES.WORKS.MACHINE_HOURS} element={<MachineHoursPage />} />
        <Route path={ROUTES.WORKS.CHANGE_ORDERS} element={<ChangeOrdersPage />} />

        {/* Legacy redirects */}
        <Route path="/inventory" element={<Navigate to={ROUTES.SITES.INVENTORY} replace />} />
        <Route path="/drivers" element={<Navigate to={ROUTES.FLEET.DRIVERS} replace />} />
        <Route path="/shipments" element={<Navigate to={ROUTES.LOGISTICS.DELIVERIES} replace />} />
      </Route>
    </Routes>
  )
}
