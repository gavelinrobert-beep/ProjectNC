// frontend/src/App.jsx
import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { BRAND } from './lib/constants'
import './modern-override.css'

// Components
import GlobalSearch from './components/GlobalSearch'

// Pages
import Dashboard from './pages/Dashboard'
import Operations from './pages/Operations'
import Tasks from './pages/Tasks'  // CHANGED: Was Missions
import Assets from './pages/Assets'
import Inventory from './pages/InventoryNew'  // Phase 2: Operation-centric inventory
import Admin from './pages/Admin'
import Login from './pages/Login'
import Shipments from './pages/Shipments'
import Drivers from './pages/Drivers'
import Customers from './pages/Customers'
import Metrics from './pages/Metrics'
import Incidents from './pages/Incidents'
import Resources from './pages/Resources'
import Training from './pages/Training'
// Week 1 Commercial MVP - Public & Driver Pages
import TrackDelivery from './pages/TrackDelivery'
import DriverApp from './pages/DriverApp'

function Sidebar({ isOpen, toggle }) {
  const location = useLocation()

 const navigation = [
  { name: 'Dashboard', icon: '📊', path: '/', section: 'OPERATIONS' },
  { name: 'Live Map', icon: '🗺️', path: '/operations', section: 'OPERATIONS' },
  { name: 'Tasks & Deliveries', icon: '📋', path: '/tasks', section: 'LOGISTICS' },
  { name: 'Fleet & Resources', icon: '🚛', path: '/assets', section: 'LOGISTICS' },
  { name: 'Inventory', icon: '📦', path: '/inventory', section: 'LOGISTICS' },
  { name: 'Incidents', icon: '🚨', path: '/incidents', section: 'MANAGEMENT' },
  { name: 'Reports & Metrics', icon: '📈', path: '/metrics', section: 'MANAGEMENT' },
  { name: 'Administration', icon: '⚙️', path: '/admin', section: 'MANAGEMENT' }
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
      <nav style={{ flex: 1, padding: '1rem 0' }}>
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
                  <>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                    {item.badge && (
                      <span style={{
                        marginLeft: 'auto',
                        background: '#48bb78',
                        color: 'white',
                        fontSize: '0.65rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '10px',
                        fontWeight: 600
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </>
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
          background: 'rgba(255, 152, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#FF9800',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '0.75rem'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              background: '#FF9800',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></span>
            <span>DEMO MODE ACTIVE</span>
          </div>
          <button style={{
            width: '100%',
            padding: '0.6rem',
            background: '#FFFFFF',
            color: '#FF9800',
            border: '2px solid #FF9800',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FF9800'
            e.currentTarget.style.color = '#FFFFFF'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF'
            e.currentTarget.style.color = '#FF9800'
          }}>
            ⏹️ Stop Demo
          </button>
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
      {/* Top Bar - Nordic Blue Gradient */}
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
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🛡️</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#FFFFFF' }}>AEGIS LIGHT</span>
          </div>
        </div>

        <span style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 500
        }}>
          Civil Logistics & Situational Awareness Platform
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
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
      e.currentTarget.style.transform = 'translateY(-1px)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = '#FFFFFF'
      e.currentTarget.style.transform = 'translateY(0)'
    }}
  >
    🚪 Logout
  </button>
</div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <main style={{
        gridArea: 'content',
        padding: '2rem',
        overflowY: 'auto',
        background: '#F5F7FA'
      }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/admin" element={<Admin />} />
          
          {/* Redirects for backward compatibility */}
          <Route path="/shipments" element={<Navigate to="/tasks" replace />} />
          <Route path="/drivers" element={<Navigate to="/assets" replace />} />
          <Route path="/customers" element={<Navigate to="/admin" replace />} />
          
          {/* Keep old routes for now but they're not in navigation */}
          <Route path="/resources" element={<Resources />} />
          <Route path="/training" element={<Training />} />
        </Routes>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #F5F7FA;
        }

        ::-webkit-scrollbar-thumb {
          background: #B8C5D0;
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #4A90E2;
        }
      `}</style>
    </div>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'))

  return (
    <BrowserRouter>
      {/* Global Search Component - Available on all authenticated routes */}
      {isAuthenticated && <GlobalSearch />}
      
      {/* Toast Notifications */}
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
        {/* Public routes - no authentication required */}
        <Route path="/track/:deliveryId" element={<TrackDelivery />} />
        <Route path="/driver" element={<DriverApp />} />
        
        {/* Protected routes - require authentication */}
        <Route path="/*" element={
          isAuthenticated ? (
            <AppLayout />
          ) : (
            <Login onLogin={() => setIsAuthenticated(true)} />
          )
        } />
      </Routes>
    </BrowserRouter>
  )
}