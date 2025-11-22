// frontend/src/modules/dashboard/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../../lib/api'
import { BRAND } from '../../../lib/constants'
import DashboardStats from '../../../components/DashboardStats'
import ResourceStatusWidget from '../../../components/ResourceStatusWidget'
import PerformanceMetricsWidget from '../../../components/PerformanceMetricsWidget'
import LiveOpsCard from '../../../components/LiveOpsCard'
import PerformanceChart from '../../../components/PerformanceChart'
import FuelConsumptionChart from '../../../components/FuelConsumptionChart'
import FleetUtilizationChart from '../../../components/FleetUtilizationChart'
import StatCard from '../../../components/ui/StatCard'
import LineChart from '../../../components/charts/LineChart'
import BarChart from '../../../components/charts/BarChart'
import PieChart from '../../../components/charts/PieChart'
import { useDeliveries } from '../../logistics/hooks/useDeliveries'
import { useRoutes } from '../../logistics/hooks/useRoutes'
import { useVehicles } from '../../fleet/hooks/useVehicles'
import { useDepots } from '../../sites/hooks/useDepots'
import { formatDateTime } from '../../../shared/utils'

export default function DashboardPage() {
  const [assets, setAssets] = useState([])
  const [bases, setBases] = useState([])
  const [alerts, setAlerts] = useState([])
  const [geofences, setGeofences] = useState([])
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)

  // Cross-module data hooks
  const { data: deliveries, isLoading: deliveriesLoading } = useDeliveries()
  const { data: routes, isLoading: routesLoading } = useRoutes()
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles()
  const { data: depots, isLoading: depotsLoading } = useDepots()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, basesData, alertsData, geofencesData, missionsData] = await Promise.all([
          api.assets(), api.facilities(), api.alerts(), api.geofences(), api.missions()
        ])
        setAssets(assetsData || [])
        setBases(basesData || [])
        setAlerts(alertsData || [])
        setGeofences(geofencesData || [])
        setMissions(missionsData || [])
        setLoading(false)
      } catch (err) {
        console.error('[Dashboard] Error:', err)
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const stats = {
    totalAssets: assets.length,
    inUse: assets.filter(a => a.status === 'in_use').length,
    available: assets.filter(a => a.status === 'available').length,
    activeMissions: missions.filter(m => m.status === 'active').length,
    criticalAlerts: alerts.filter(a => !a.acknowledged && a.severity === 'critical').length,
    lowFuel: assets.filter(a => a.fuel_level && a.fuel_level < 20).length,
    maintenance: assets.filter(a => a.maintenance_status === 'needs_maintenance' || a.status === 'maintenance').length,
  }

  // Cross-module metrics
  const activeDeliveries = deliveries?.filter(d => d.status === 'in_transit' || d.status === 'pending').length || 0
  const vehiclesInUse = vehicles?.filter(v => v.status === 'in_use' || v.status === 'active').length || 0
  const activeRoutes = routes?.filter(r => r.status === 'active' || r.status === 'in_progress').length || 0
  const operationalDepots = depots?.filter(d => d.is_active !== false).length || 0

  // Generate recent activity feed
  const recentActivity = []
  
  // Add delivery activities
  if (deliveries) {
    deliveries.slice(0, 3).forEach(d => {
      recentActivity.push({
        type: 'delivery',
        icon: '📦',
        title: `Delivery #${d.id}`,
        description: `${d.customer_name} - ${d.status}`,
        time: d.updated_at || d.created_at,
        status: d.status
      })
    })
  }
  
  // Add route activities
  if (routes) {
    routes.slice(0, 2).forEach(r => {
      recentActivity.push({
        type: 'route',
        icon: '🛣️',
        title: r.name || `Route #${r.id}`,
        description: `${r.stops?.length || 0} stops - ${r.status}`,
        time: r.updated_at || r.start_time,
        status: r.status
      })
    })
  }
  
  // Add vehicle activities
  if (vehicles) {
    vehicles.filter(v => v.status === 'in_use').slice(0, 2).forEach(v => {
      recentActivity.push({
        type: 'vehicle',
        icon: '🚛',
        title: v.registration_number || `Vehicle #${v.id}`,
        description: `Driver: ${v.driver_name || 'Assigned'}`,
        time: v.updated_at,
        status: v.status
      })
    })
  }
  
  // Sort by time descending
  recentActivity.sort((a, b) => {
    const timeA = new Date(a.time || 0)
    const timeB = new Date(b.time || 0)
    return timeB - timeA
  })

  // Mock data for new charts
  const deliveryTrend = [
    { date: 'Mon', deliveries: 12 },
    { date: 'Tue', deliveries: 15 },
    { date: 'Wed', deliveries: 18 },
    { date: 'Thu', deliveries: 14 },
    { date: 'Fri', deliveries: 20 },
    { date: 'Sat', deliveries: 8 },
    { date: 'Sun', deliveries: 5 },
  ]

  const fleetUtilization = [
    { vehicle: 'Truck 01', hours: 8.5 },
    { vehicle: 'Van 02', hours: 6.2 },
    { vehicle: 'Truck 03', hours: 4.0 },
  ]

  const statusDistribution = [
    { name: 'Delivered', value: 45 },
    { name: 'In Transit', value: 12 },
    { name: 'Pending', value: 8 },
    { name: 'Failed', value: 2 },
  ]

  const isLoading = loading || deliveriesLoading || routesLoading || vehiclesLoading || depotsLoading
  
  if (isLoading) return <div style={{ padding: 20, textAlign: 'center', color: BRAND.primary }}>Loading...</div>

  return (
    <div style={{ maxWidth: '1400px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#e0e0e0' }}>
          📊 Dashboard - Executive Overview
        </h1>
        <p style={{ color: '#718096', fontSize: '1rem' }}>
          Real-time resource status and system overview
        </p>
      </div>

      <DashboardStats
        stats={stats}
        alerts={alerts}
        missions={missions}
        bases={bases}
        geofences={geofences}
        assets={assets}
      />

      {/* Cross-Module Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 mt-6">
        <Link to="/logistics/deliveries" style={{ textDecoration: 'none' }}>
          <StatCard 
            title="Active Deliveries" 
            value={activeDeliveries} 
            icon="📦" 
            color="blue"
            subtitle={`${deliveries?.length || 0} total`}
          />
        </Link>
        <Link to="/fleet/vehicles" style={{ textDecoration: 'none' }}>
          <StatCard 
            title="Vehicles In Use" 
            value={vehiclesInUse} 
            icon="🚛" 
            color="green"
            subtitle={`${vehicles?.length || 0} total`}
          />
        </Link>
        <Link to="/logistics/routes" style={{ textDecoration: 'none' }}>
          <StatCard 
            title="Active Routes" 
            value={activeRoutes} 
            icon="🛣️" 
            color="purple"
            subtitle={`${routes?.length || 0} total`}
          />
        </Link>
        <Link to="/sites/depots" style={{ textDecoration: 'none' }}>
          <StatCard 
            title="Operational Depots" 
            value={operationalDepots} 
            icon="🏢" 
            color="yellow"
            subtitle={`${depots?.length || 0} total`}
          />
        </Link>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LineChart 
          data={deliveryTrend}
          xKey="date"
          yKey="deliveries"
          title="Delivery Trend (Last 7 Days)"
          color="#4A90E2"
        />
        
        <BarChart
          data={fleetUtilization}
          xKey="vehicle"
          yKey="hours"
          title="Fleet Utilization (Today)"
          color="#10B981"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <PieChart
          data={statusDistribution}
          nameKey="name"
          valueKey="value"
          title="Delivery Status Distribution"
        />
        
        {/* Existing widgets */}
        <ResourceStatusWidget />
        <PerformanceMetricsWidget />
      </div>

      {/* Live Operations Card */}
      <div style={{ marginTop: '1.5rem' }}>
        <LiveOpsCard />
      </div>

      {/* Performance Charts */}
      <div style={{ marginTop: '2rem' }}>
        <PerformanceChart />
      </div>

      {/* Fleet Utilization and Fuel Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        <FleetUtilizationChart />
        <FuelConsumptionChart />
      </div>

      {/* Recent Activity Feed */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{
          background: '#1a1f2e',
          border: '2px solid #2d3748',
          borderRadius: '10px',
          padding: '1.5rem'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1rem', 
            color: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>📋</span>
            Recent Activity
          </h2>
          <div style={{ 
            display: 'grid', 
            gap: '0.75rem',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 10).map((activity, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: '#252d3d',
                    border: '1px solid #2d3748',
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{activity.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: '#e0e0e0',
                      marginBottom: '0.25rem'
                    }}>
                      {activity.title}
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#a0aec0'
                    }}>
                      {activity.description}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#718096',
                    textAlign: 'right',
                    minWidth: '100px'
                  }}>
                    {activity.time ? formatDateTime(activity.time) : 'Just now'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                color: '#718096' 
              }}>
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <Link to="/operations" style={quickLinkStyle}>
          <span style={{ fontSize: '2.5rem' }}>🗺️</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>View Resource Map</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#718096' }}>
              Track all resources and locations
            </p>
          </div>
        </Link>

        <Link to="/missions" style={quickLinkStyle}>
          <span style={{ fontSize: '2.5rem' }}>📋</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Manage Tasks</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#718096' }}>
              Plan and coordinate work assignments
            </p>
          </div>
        </Link>

        <Link to="/assets" style={quickLinkStyle}>
          <span style={{ fontSize: '2.5rem' }}>🚛</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Assets & Logistics</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#718096' }}>
              Track fleet and supplies
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}

const quickLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1.25rem',
  background: '#1a1f2e',
  border: '2px solid #2d3748',
  borderRadius: '10px',
  textDecoration: 'none',
  color: '#e0e0e0',
  transition: 'all 0.2s'
}