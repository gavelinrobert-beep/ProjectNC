import React from 'react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

export default function Sidebar({ isOpen, toggle, onClose, isMobile }) {

  const navigation = [
    { name: 'Dashboard', icon: '📊', path: ROUTES.DASHBOARD, section: 'MAIN' },
    { name: 'Live Operations', icon: '🗺️', path: ROUTES.OPERATIONS, section: 'MAIN' },

    { name: 'Deliveries', icon: '📦', path: ROUTES.LOGISTICS.DELIVERIES, section: 'LOGISTICS' },
    { name: 'Routes', icon: '🛣️', path: ROUTES.LOGISTICS.ROUTES, section: 'LOGISTICS' },
    { name: 'Customers', icon: '👥', path: ROUTES.LOGISTICS.CUSTOMERS, section: 'LOGISTICS' },

    { name: 'Vehicles', icon: '🚛', path: ROUTES.FLEET.VEHICLES, section: 'FLEET' },
    { name: 'Drivers', icon: '👤', path: ROUTES.FLEET.DRIVERS, section: 'FLEET' },
    { name: 'Maintenance', icon: '🔧', path: ROUTES.FLEET.MAINTENANCE, section: 'FLEET' },

    { name: 'Depots', icon: '🏭', path: ROUTES.SITES.DEPOTS, section: 'SITES' },
    { name: 'Inventory', icon: '📦', path: ROUTES.SITES.INVENTORY, section: 'SITES' },
    { name: 'Materials', icon: '🧱', path: ROUTES.SITES.MATERIALS, section: 'SITES' },

    { name: 'Works Dashboard', icon: '🏗️', path: ROUTES.WORKS.DASHBOARD, section: 'WORKS' },
    { name: 'Projects', icon: '📁', path: ROUTES.WORKS.PROJECTS, section: 'WORKS' },
    { name: 'Work Orders', icon: '📋', path: ROUTES.WORKS.WORK_ORDERS, section: 'WORKS' },
    { name: 'Machine Hours', icon: '⏱️', path: ROUTES.WORKS.MACHINE_HOURS, section: 'WORKS' },
    { name: 'Change Orders', icon: '📝', path: ROUTES.WORKS.CHANGE_ORDERS, section: 'WORKS' },
  ]

  return (
    <aside style={{
      position: isMobile ? 'fixed' : 'relative',
      top: isMobile ? 64 : 'auto',
      left: 0,
      bottom: isMobile ? 0 : 'auto',
      width: isOpen ? '250px' : (isMobile ? '250px' : '70px'),
      background: '#FFFFFF',
      borderRight: '1px solid #E8EDF2',
      display: 'flex',
      flexDirection: 'column',
      transition: isMobile ? 'transform 0.3s ease' : 'width 0.3s ease',
      transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
      overflow: 'hidden',
      height: isMobile ? 'calc(100vh - 64px)' : '100%',
      boxShadow: '2px 0 8px rgba(45, 62, 80, 0.08)',
      zIndex: isMobile ? 40 : 'auto'
    }}>
      {/* Close button for mobile */}
      {isMobile && isOpen && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: '#556B7C',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            zIndex: 10,
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#4A90E2'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#556B7C'}
        >
          ✕
        </button>
      )}

      <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
        {navigation.map((item, index) => {
          const showSectionHeader = index === 0 || navigation[index - 1].section !== item.section

          return (
            <React.Fragment key={item.path}>
              {showSectionHeader && (isOpen || isMobile) && (
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
              <NavLink
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                style={({ isActive }) => ({
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
                })}
                onMouseEnter={(e) => {
                  const isActive = e.currentTarget.classList.contains('active')
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(74, 144, 226, 0.05)'
                    e.currentTarget.style.color = '#4A90E2'
                  }
                }}
                onMouseLeave={(e) => {
                  const isActive = e.currentTarget.classList.contains('active')
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#556B7C'
                  }
                }}
              >
                <span style={{ fontSize: '1.3rem', minWidth: '1.5rem' }}>
                  {item.icon}
                </span>
                {(isOpen || isMobile) && (
                  <span style={{ fontSize: '0.95rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                )}
              </NavLink>
            </React.Fragment>
          )
        })}
      </nav>

      {(isOpen || isMobile) && (
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
