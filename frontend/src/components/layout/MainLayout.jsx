import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function MainLayout() {
  const location = useLocation()
  const [expandedModule, setExpandedModule] = useState(null)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    {
      name: 'Logistics',
      icon: '🚚',
      module: 'logistics',
      children: [
        { name: 'Deliveries', href: '/logistics/deliveries' },
        { name: 'Routes', href: '/logistics/routes' },
        { name: 'Customers', href: '/logistics/customers' },
      ]
    },
    {
      name: 'Fleet',
      icon: '🚗',
      module: 'fleet',
      children: [
        { name: 'Vehicles', href: '/fleet/vehicles' },
        { name: 'Drivers', href: '/fleet/drivers' },
        { name: 'Maintenance', href: '/fleet/maintenance' },
      ]
    },
    {
      name: 'Works',
      icon: '⚒️',
      module: 'works',
      children: [
        { name: 'Projects', href: '/works/projects' },
        { name: 'Work Orders', href: '/works/work-orders' },
        { name: 'Machine Hours', href: '/works/machine-hours' },
      ]
    },
    {
      name: 'Sites',
      icon: '🏭',
      module: 'sites',
      children: [
        { name: 'Depots', href: '/sites/depots' },
        { name: 'Inventory', href: '/sites/inventory' },
        { name: 'Materials', href: '/sites/materials' },
      ]
    },
    { name: 'Field App', href: '/field', icon: '📱' },
  ]

  const toggleModule = (module) => {
    setExpandedModule(expandedModule === module ? null : module)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold">SYLON Systems</h1>
          <p className="text-xs text-gray-400 mt-1">Logistics Platform</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {navigation.map((item) => (
            <div key={item.name} className="mb-2">
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleModule(item.module)}
                    className="w-full px-3 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 rounded-md flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedModule === item.module ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedModule === item.module && (
                    <div className="ml-4 mt-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={`block px-3 py-2 text-sm rounded-md ${
                            location.pathname === child.href
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.href}
                  className={`block px-3 py-2 text-sm rounded-md flex items-center ${
                    location.pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            <p>Logged in as Admin</p>
            <p className="mt-1">admin@sylon.local</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}