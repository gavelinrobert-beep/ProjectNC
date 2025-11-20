// frontend/src/App.jsx
import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './modern-override.css'

// Components
import GlobalSearch from './components/GlobalSearch'

// Legacy Pages (Keep until fully migrated)
import Dashboard from './pages/Dashboard'
import Operations from './pages/Operations'
import Tasks from './pages/Tasks'
import Assets from './pages/Assets'
import Inventory from './pages/Inventory'

// Works Module (Fully functional - keep as-is)
import WorksDashboard from './pages/Works/WorksDashboard'
import ProjectList from './pages/Works/ProjectList'
import WorkOrderBoard from './pages/Works/WorkOrderBoard'
import MachineHours from './pages/Works/MachineHours'
import ChangeOrders from './pages/Works/ChangeOrders'

// NEW Feature Modules - Logistics
import DeliveriesPage from './features/logistics/pages/DeliveriesPage'
import RoutesPage from './features/logistics/pages/RoutesPage'
import CustomersPage from './features/logistics/pages/CustomersPage'

// NEW Feature Modules - Fleet
import VehiclesPage from './features/fleet/pages/VehiclesPage'
import DriversPage from './features/fleet/pages/DriversPage'
import MaintenancePage from './features/fleet/pages/MaintenancePage'

// NEW Feature Modules - Sites
import DepotsPage from './features/sites/pages/DepotsPage'
import InventoryPageNew from './features/sites/pages/InventoryPage'
import MaterialsPage from './features/sites/pages/MaterialsPage'

// NEW Feature Modules - Field
import FieldApp from './features/field/pages/DriverApp'

function Sidebar({ isOpen, toggle }) {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', icon: '📊', path: '/', section: 'MAIN' },
    { name: 'Live Operations', icon: '🗺️', path: '/operations', section: 'MAIN' },

    { name: 'Deliveries', icon: '📦', path: '/logistics/deliveries', section: 'LOGISTICS' },
    { name: 'Routes', icon: '🛣️', path: '/logistics/routes', section: 'LOGISTICS' },
    { name: 'Customers', icon: '👥', path: '/logistics/customers', section: 'LOGISTICS' },
    { name: 'Tasks', icon: '📋', path: '/tasks', section: 'LOGISTICS' },

    { name: 'Vehicles', icon: '🚛', path: '/fleet/vehicles', section: 'FLEET' },
    { name: 'Drivers', icon: '👤', path: '/fleet/drivers', section: 'FLEET' },
    { name: 'Maintenance', icon: '🔧', path: '/fleet/maintenance', section: 'FLEET' },

    { name: 'Depots', icon: '🏭', path: '/sites/depots', section: 'SITES' },
    { name: 'Inventory', icon: '📦', path: '/sites/inventory', section: 'SITES' },
    { name: 'Materials', icon: '🧱', path: '/sites/materials', section: 'SITES' },

    { name: 'Works Dashboard', icon: '🏗️', path: '/works', section: 'WORKS' },
    { name: 'Projects', icon: '📁', path: '/works/projects', section: 'WORKS' },
    { name: 'Work Orders', icon: '📋', path: '/works/work-orders', section: 'WORKS' },
    { name: 'Machine Hours', icon: '⏱️', path: '/works/machine-hours', section: 'WORKS' },
    { name: 'Change Orders', icon: '📝', path: '/works/change-orders', section: 'WORKS' },
  ]

  return (
    <aside style={{
      width: isOpen ? '250px' : '70px',
      background: '#FFFFFF',
      borderRight: '1px solid #E8EDF2',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      height: '100%',
      boxShadow: '2px 0 8px rgba(45, 62, 80, 0.08)'
    }}>
      <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.path
          const showSectionHeader = index === 0 || navigation[index - 1].section !== item.section

          return (
            <React.Fragment key={item.path}>
              {showSectionHeader && isOpen && (
                <div style={{
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: index === 0 ? '0' : '1rem'
                }}>
                  {item.section}
                </div>
              )}
              <Link
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.9rem 1.25rem',
                  color: isActive ? '#4A90E2' : '#556B7C',
                  textDecoration: 'none',
                  background: isActive ? 'rgba(74, 144, 226, 0.08)' : 'transparent',
                  borderLeft: `3px solid ${isActive ? '#4A90E2' : 'transparent'}`,
                  transition: 'all 0.2s ease',
                  fontWeight: isActive ? 600 : 500
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(74, 144, 226, 0.05)'
                    e.currentTarget.style.color = '#4A90E2'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#556B7C'
                  }
                }}
              >
                <span style={{ fontSize: '1.3rem', minWidth: '1.5rem' }}>
                  {item.icon}
                </span>
                {isOpen && (
                  <span style={{ fontSize: '0.95rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                )}
              </Link>
            </React.Fragment>
          )
        })}
      </nav>

      {isOpen && (
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #E8EDF2',
          background: 'rgba(74, 144, 226, 0.05)'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#4A90E2', fontWeight: 600, marginBottom: '0.5rem' }}>
            ✨ SYLON Systems v2.0
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
            Modular Architecture
          </div>
        </div>
      )}
    </aside>
  )
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div style={{
      display: 'grid',
      gridTemplateAreas: '"topbar topbar" "sidebar content"',
      gridTemplateColumns: sidebarOpen ? '250px 1fr' : '70px 1fr',
      gridTemplateRows: '64px 1fr',
      height: '100vh',
      background: '#F5F7FA',
      color: '#2D3E50',
      transition: 'grid-template-columns 0.3s ease'
    }}>
      <header style={{
        gridArea: 'topbar',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        background: 'linear-gradient(135deg, #4A90E2 0%, #5B9BD5 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 2px 8px rgba(74, 144, 226, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              transition: 'opacity 0.2s'
            }}
          >
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🚛</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#FFFFFF' }}>SYLON Systems</span>
          </div>
        </div>

        <span style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 500
        }}>
          Logistics & Fleet Management Platform
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            padding: '0.4rem 0.8rem',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#FFFFFF',
            fontWeight: 500
          }}>
            👤 {localStorage.getItem('user') || 'admin'}
          </span>
          <button
            onClick={() => {
              localStorage.clear()
              sessionStorage.clear()
              window.location.reload()
            }}
            style={{
              padding: '0.4rem 0.8rem',
              background: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              color: '#4A90E2',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />

      <main style={{
        gridArea: 'content',
        padding: '2rem',
        overflowY: 'auto',
        background: '#F5F7FA'
      }}>
        <Routes>
          {/* Main Dashboard */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/assets" element={<Assets />} />

          {/* Logistics Module */}
          <Route path="/logistics/deliveries" element={<DeliveriesPage />} />
          <Route path="/logistics/routes" element={<RoutesPage />} />
          <Route path="/logistics/customers" element={<CustomersPage />} />

          {/* Fleet Module */}
          <Route path="/fleet/vehicles" element={<VehiclesPage />} />
          <Route path="/fleet/drivers" element={<DriversPage />} />
          <Route path="/fleet/maintenance" element={<MaintenancePage />} />

          {/* Sites Module */}
          <Route path="/sites/depots" element={<DepotsPage />} />
          <Route path="/sites/inventory" element={<InventoryPageNew />} />
          <Route path="/sites/materials" element={<MaterialsPage />} />

          {/* Works Module */}
          <Route path="/works" element={<WorksDashboard />} />
          <Route path="/works/projects" element={<ProjectList />} />
          <Route path="/works/work-orders" element={<WorkOrderBoard />} />
          <Route path="/works/machine-hours" element={<MachineHours />} />
          <Route path="/works/change-orders" element={<ChangeOrders />} />

          {/* Legacy redirects */}
          <Route path="/inventory" element={<Navigate to="/sites/inventory" replace />} />
          <Route path="/drivers" element={<Navigate to="/fleet/drivers" replace />} />
          <Route path="/shipments" element={<Navigate to="/logistics/deliveries" replace />} />
        </Routes>
      </main>

      <style>{`
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #F5F7FA; }
        ::-webkit-scrollbar-thumb { background: #B8C5D0; border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: #4A90E2; }
      `}</style>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBzeWxvbi5sb2NhbCIsInJvbGUiOiJhZG1pbiJ9.fake')
    localStorage.setItem('userRole', 'admin')
  }, [])

  return (
    <BrowserRouter>
      <GlobalSearch />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#e0e0e0',
            border: '1px solid #333',
          },
        }}
      />

      <Routes>
        <Route path="/field" element={<FieldApp />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  )
}