// frontend/src/App.jsx
import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { BRAND } from './lib/constants'
import './modern-override.css'

// Pages
import Dashboard from './pages/Dashboard'
import Operations from './pages/Operations'
import Tasks from './pages/Tasks'  // CHANGED: Was Missions
import Assets from './pages/Assets'
import Inventory from './pages/Inventory'
import Admin from './pages/Admin'
import Login from './pages/Login'

function Sidebar({ isOpen, toggle }) {
  const location = useLocation()

 const navigation = [
  { name: 'Dashboard', icon: '📊', path: '/' },
  { name: 'Live Map', icon: '🗺️', path: '/operations' },
  { name: 'Tasks & Assignments', icon: '📋', path: '/tasks' },  // CHANGED: Was /missions
  { name: 'Fleet & Resources', icon: '🚛', path: '/assets' },
  { name: 'Inventory', icon: '📦', path: '/inventory' },
  { name: 'Administration', icon: '⚙️', path: '/admin' }
]

  return (
    <aside style={{
      width: isOpen ? '250px' : '70px',
      background: '#1a1f2e',
      borderRight: '2px solid #2d3748',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      height: '100%'
    }}>
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {navigation.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.9rem 1.25rem',
                color: isActive ? '#63b3ed' : '#a0aec0',
                textDecoration: 'none',
                background: isActive ? 'rgba(99, 179, 237, 0.15)' : 'transparent',
                borderLeft: `3px solid ${isActive ? '#63b3ed' : 'transparent'}`,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(99, 179, 237, 0.1)'
                  e.currentTarget.style.color = '#63b3ed'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#a0aec0'
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
          )
        })}
      </nav>

      {isOpen && (
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #2d3748',
          background: 'rgba(245, 101, 101, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#fc8181',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '0.75rem'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              background: '#fc8181',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></span>
            <span>DEMO MODE ACTIVE</span>
          </div>
          <button style={{
            width: '100%',
            padding: '0.6rem',
            background: '#742a2a',
            color: '#fc8181',
            border: '1px solid #9b2c2c',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem'
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
      gridTemplateRows: '60px 1fr',
      height: '100vh',
      background: '#0a0e14',
      color: '#e0e0e0',
      transition: 'grid-template-columns 0.3s ease'
    }}>
      {/* Top Bar */}
      <header style={{
        gridArea: 'topbar',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        background: 'linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%)',
        borderBottom: '2px solid #2d3748',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#e0e0e0',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🛡️</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>PROJECT SYLON</span>
          </div>
        </div>

        <span style={{
          color: '#718096',
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Civil Logistics & Situational Awareness Platform
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
  <span style={{
    padding: '0.4rem 0.8rem',
    background: '#2d3748',
    borderRadius: '6px',
    fontSize: '0.9rem'
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
      background: '#742a2a',
      border: '1px solid #9b2c2c',
      borderRadius: '6px',
      color: '#fc8181',
      cursor: 'pointer',
      fontSize: '0.85rem'
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
        background: '#0f1419'
      }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/tasks" element={<Tasks />} />  {/* CHANGED: Was /missions */}
          <Route path="/assets" element={<Assets />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #1a1f2e;
        }

        ::-webkit-scrollbar-thumb {
          background: #2d3748;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #4a5568;
        }
      `}</style>
    </div>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'))

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}