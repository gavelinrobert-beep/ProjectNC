// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { BRAND } from '../lib/constants'
import DashboardStats from '../components/DashboardStats'

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
          api.assets(), api.bases(), api.alerts(), api.geofences(), api.missions()
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