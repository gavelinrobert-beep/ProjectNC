// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { BRAND } from '../lib/constants'
import DashboardStats from '../components/DashboardStats'
import ResourceStatusWidget from '../components/ResourceStatusWidget'
import PerformanceMetricsWidget from '../components/PerformanceMetricsWidget'
import LiveOpsCard from '../components/LiveOpsCard'
import PerformanceChart from '../components/PerformanceChart'
import FuelConsumptionChart from '../components/FuelConsumptionChart'
import FleetUtilizationChart from '../components/FleetUtilizationChart'
import StatCard from '../components/ui/StatCard'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import PieChart from '../components/charts/PieChart'

export default function Dashboard() {
  const [assets, setAssets] = useState([])
  const [bases, setBases] = useState([])
  const [alerts, setAlerts] = useState([])
  const [geofences, setGeofences] = useState([])
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: BRAND.primary }}>Loading...</div>

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

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 mt-6">
        <StatCard title="Total Deliveries" value={245} icon="📦" trend={12.5} color="blue" />
        <StatCard title="Active Vehicles" value={12} icon="🚛" trend={5.2} color="green" />
        <StatCard title="On-Time Rate" value="92%" icon="⏰" trend={-2.3} color="yellow" />
        <StatCard title="Revenue" value="$45.2K" icon="💰" trend={18.7} color="green" />
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