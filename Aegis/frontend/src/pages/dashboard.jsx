// Aegis/frontend/src/pages/dashboard.jsx
import React, { useEffect, useState } from 'react'
import { api, fetchInventoryItems } from '../lib/api'
import { BRAND } from '../lib/constants'
import { setupBaseInventory } from '../lib/setupInventory'
import { DemoScenario } from '../lib/demoScenario'
import { useDemoMode } from '../hooks/useDemoMode'

// Components
import AlertBanner from '../components/AlertBanner'
import DashboardStats from '../components/DashboardStats'
import DashboardMap from '../components/DashboardMap'
import DashboardSidebar from '../components/DashboardSidebar'
import AssetDetailModal from '../components/AssetDetailModal'
import DemoControls from '../components/DemoControls'
import AccessibilitySettings from '../components/AccessibilitySettings'

export default function Dashboard() {
  // State
  const [assets, setAssets] = useState([])
  const [bases, setBases] = useState([])
  const [alerts, setAlerts] = useState([])
  const [geofences, setGeofences] = useState([])
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [baseWeather, setBaseWeather] = useState({})
  const [inventory, setInventory] = useState([])
  const [isDemoActive, setIsDemoActive] = useState(false)
  const [demoSpeed, setDemoSpeed] = useState(1)
  const [demoScenario] = useState(() => new DemoScenario())
  const [demoMessages, setDemoMessages] = useState([])

  // Custom hook for demo mode
  useDemoMode(
    isDemoActive,
    demoScenario,
    assets,
    bases,
    missions,
    inventory,
    demoSpeed,
    setMissions,
    setDemoMessages
  )

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, basesData, alertsData, geofencesData, missionsData, inventoryData] = await Promise.all([
          api.assets(), api.bases(), api.alerts(), api.geofences(), api.missions(), fetchInventoryItems()
        ])
        setAssets(assetsData || [])
        setBases(basesData || [])
        setAlerts(alertsData || [])
        setGeofences(geofencesData || [])
        setMissions(missionsData || [])
        setInventory(inventoryData || [])
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

  // Handlers
  const loadBaseWeather = async (base) => {
    const id = base.id
    if (baseWeather[id]?.loading) return
    setBaseWeather(prev => ({ ...prev, [id]: { loading: true, err: null, data: null } }))
    try {
      let data = null
      if (api.weatherByBase) {
        try { data = await api.weatherByBase(base.id) } catch (e) { console.warn(e) }
      }
      if (!data) data = await api.weather(base.lat, base.lon)
      setBaseWeather(prev => ({ ...prev, [id]: { loading: false, err: null, data } }))
    } catch (err) {
      setBaseWeather(prev => ({ ...prev, [id]: { loading: false, err, data: null } }))
    }
  }

  const handleAcknowledgeAlert = async (alert) => {
    try {
      await api.ackAlert(alert.id)
      const alertsData = await api.alerts()
      setAlerts(alertsData || [])
      console.log('[DASHBOARD] Alert acknowledged:', alert.id)
    } catch (err) {
      console.error('Failed to acknowledge alert:', err)
    }
  }

  const handleDismissAlert = (alert) => {
    setAlerts(prev => prev.filter(a => a.id !== alert.id))
  }

  const handleDemoToggle = (active) => {
    setIsDemoActive(active)
    if (active) {
      if (inventory.length === 0) {
        console.warn('[DEMO] Inventory not loaded yet, waiting...')
        setTimeout(() => {
          demoScenario.start(demoSpeed, assets, bases, missions)
        }, 1000)
      } else {
        demoScenario.start(demoSpeed, assets, bases, missions)
      }
    } else {
      demoScenario.stop()
      setDemoMessages([])
    }
  }

  const handleSpeedChange = (speed) => {
    setDemoSpeed(speed)
    demoScenario.setSpeed(speed)
  }

  const handleSetupInventory = async () => {
    if (confirm('This will add inventory items to your bases. Continue?')) {
      console.log('[DASHBOARD] Setting up inventory...')
      const success = await setupBaseInventory()
      if (success) {
        alert('✅ Inventory setup complete! Check console for details.')
        const inventoryData = await fetchInventoryItems()
        setInventory(inventoryData || [])
      } else {
        alert('❌ Inventory setup failed. Check console for errors.')
      }
    }
  }

  // Calculate stats
  const stats = {
    totalAssets: assets.length,
    mobile: assets.filter(a => ['mobile', 'airborne'].includes(a.status)).length,
    activeMissions: missions.filter(m => m.status === 'active').length,
    criticalAlerts: alerts.filter(a => !a.acknowledged && a.severity === 'critical').length,
    lowFuel: assets.filter(a => a.fuel_level && a.fuel_level < 20).length,
    maintenance: assets.filter(a => a.maintenance_status === 'needs_maintenance').length,
  }

  if (loading) {
    return (
      <div className='content'>
        <div style={{ padding: 20, textAlign: 'center', color: BRAND.primary }}>
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className='content' style={{ height: 'calc(100vh - 80px)', overflow: 'hidden', padding: 12 }}>
      <AlertBanner
        alerts={alerts}
        onAcknowledge={handleAcknowledgeAlert}
        onDismiss={handleDismissAlert}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: BRAND.primary, fontSize: 18 }}>Dashboard - Operationsöversikt</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={handleSetupInventory}
            style={{
              background: BRAND.secondary,
              color: '#000',
              border: 'none',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📦 Setup Inventory
          </button>
          <div style={{ fontSize: 9, color: '#666' }}>
            Uppdaterad: {new Date().toLocaleTimeString('sv-SE')}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats
        stats={stats}
        alerts={alerts}
        missions={missions}
        bases={bases}
        geofences={geofences}
        assets={assets}
      />

      {/* Main Content: Map + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 12, height: 'calc(100% - 240px)' }}>
        <DashboardMap
          assets={assets}
          bases={bases}
          missions={missions}
          inventory={inventory}
          baseWeather={baseWeather}
          loadBaseWeather={loadBaseWeather}
          setSelectedAsset={setSelectedAsset}
        />

        <DashboardSidebar
          assets={assets}
          missions={missions}
          bases={bases}
          inventory={inventory}
          alerts={alerts}
          stats={stats}
        />
      </div>

      {/* Modals & Controls */}
      {selectedAsset && <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}

      <DemoControls
        isDemoActive={isDemoActive}
        onDemoToggle={handleDemoToggle}
        onSpeedChange={handleSpeedChange}
        stats={stats}
      />

      {/* Demo Messages */}
      {demoMessages.length > 0 && (
        <div style={{
          position: 'fixed',
          top: 80,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxWidth: 400
        }}>
          {demoMessages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(0, 0, 0, 0.9)',
                border: `2px solid ${msg.type === 'alert' ? '#FF4444' : msg.type === 'mission_complete' ? '#00FF88' : '#00BFFF'}`,
                borderRadius: 8,
                padding: 12,
                color: '#fff',
                fontSize: 12,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
                animation: 'slideIn 0.3s ease-out'
              }}
            >
              {msg.message}
            </div>
          ))}
        </div>
      )}

      <AccessibilitySettings />

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}