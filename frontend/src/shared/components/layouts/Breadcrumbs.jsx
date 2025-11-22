import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Breadcrumbs() {
  const location = useLocation()
  
  // Map of route paths to readable names
  const routeNames = {
    dashboard: 'Dashboard',
    operations: 'Operations',
    logistics: 'Logistics',
    deliveries: 'Deliveries',
    routes: 'Routes',
    customers: 'Customers',
    fleet: 'Fleet',
    vehicles: 'Vehicles',
    drivers: 'Drivers',
    maintenance: 'Maintenance',
    sites: 'Sites',
    depots: 'Depots',
    inventory: 'Inventory',
    materials: 'Materials',
    works: 'Works',
    projects: 'Projects',
    'work-orders': 'Work Orders',
    'machine-hours': 'Machine Hours',
    'change-orders': 'Change Orders',
  }

  // Build breadcrumb trail from current path
  const pathSegments = location.pathname.split('/').filter(segment => segment)
  
  // Don't show breadcrumbs on dashboard
  if (pathSegments.length === 0 || pathSegments[0] === 'dashboard') {
    return null
  }

  const breadcrumbs = [
    { name: 'Dashboard', path: '/dashboard' }
  ]

  let currentPath = ''
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`
    breadcrumbs.push({
      name: routeNames[segment] || segment,
      path: currentPath
    })
  })

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.875rem',
      marginBottom: '1.5rem',
      padding: '0.75rem 1rem',
      background: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }} aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          {index > 0 && (
            <span style={{ margin: '0 0.5rem', color: '#9CA3AF' }}>/</span>
          )}
          {index === breadcrumbs.length - 1 ? (
            <span style={{ color: '#2D3E50', fontWeight: 600 }}>
              {crumb.name}
            </span>
          ) : (
            <Link
              to={crumb.path}
              style={{
                color: '#4A90E2',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#357ABD'
                e.currentTarget.style.textDecoration = 'underline'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#4A90E2'
                e.currentTarget.style.textDecoration = 'none'
              }}
            >
              {crumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
