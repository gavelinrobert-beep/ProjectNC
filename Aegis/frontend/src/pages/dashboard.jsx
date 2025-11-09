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
import GlassCard from '../components/GlassCard'
import GradientButton from '../components/GradientButton'
import QuickActionsPanel from '../components/QuickActionsPanel'
import AssetContextToolbar from '../components/AssetContextToolbar'

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
  const [showAssetToolbar, setShowAssetToolbar] = useState(false)

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

  const selectAsset = (asset) => {
    setSelectedAsset(asset)
    setShowAssetToolbar(true)
  }

  const handleNewMission = () => {
    console.log('[QUICK ACTION] New Mission')
    alert('🎯 New Mission dialog would open here!')
  }

  const handleEmergencyAlert = () => {
    console.log('[QUICK ACTION] Emergency Alert')
    alert('🚨 Emergency Alert broadcast initiated!')
  }

  const handleGenerateReport = () => {
    console.log('[QUICK ACTION] Generate Report')
    alert('📊 Generating operational report...')
  }

  const handleSyncAssets = async () => {
    console.log('[QUICK ACTION] Sync Assets')
    alert('🔄 Syncing all assets...')
    const assetsData = await api.assets()
    setAssets(assetsData || [])
  }

  const handleBroadcastMessage = () => {
    console.log('[QUICK ACTION] Broadcast Message')
    alert('📡 Broadcast message dialog would open here!')
  }

  const handleAssetContextAction = (action, asset) => {
    console.log('[ASSET ACTION]', action, asset)
    alert(`${action} for ${asset.id}`)
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
    <div
      className='content'
      style={{
        height: 'calc(100vh - 80px)',
        overflow: 'hidden',
        padding: 12,
        background: BRAND.bgBase,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <AlertBanner
        alerts={alerts}
        onAcknowledge={handleAcknowledgeAlert}
        onDismiss={handleDismissAlert}
      />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
        padding: '16px 20px',
        background: BRAND.bgCard,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${BRAND.border}`,
        borderRadius: 12,
        boxShadow: BRAND.shadowMd
      }}>
        <h3 style={{
          margin: 0,
          background: BRAND.gradientPrimary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.5px'
        }}>
          Dashboard - Operationsöversikt
        </h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <GradientButton
            icon="📦"
            onClick={handleSetupInventory}
            size="small"
            variant="primary"
          >
            Setup Inventory
          </GradientButton>
          <div style={{
            fontSize: 11,
            color: BRAND.textMuted,
            padding: '6px 12px',
            background: 'rgba(0, 217, 255, 0.1)',
            borderRadius: 6,
            border: `1px solid ${BRAND.border}`
          }}>
            ⏱️ Uppdaterad: {new Date().toLocaleTimeString('sv-SE')}
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: 12,
        height: 'calc(100% - 180px)'
      }}>
        {/* LEFT: Map */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minHeight: 0
        }}>
          <DashboardMap
            assets={assets}
            bases={bases}
            missions={missions}
            inventory={inventory}
            baseWeather={baseWeather}
            loadBaseWeather={loadBaseWeather}
            setSelectedAsset={selectAsset}
          />
        </div>

        {/* RIGHT: Sidebar */}
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

      {/* Quick Actions Panel */}
      <QuickActionsPanel
        onNewMission={handleNewMission}
        onEmergencyAlert={handleEmergencyAlert}
        onGenerateReport={handleGenerateReport}
        onSyncAssets={handleSyncAssets}
        onBroadcastMessage={handleBroadcastMessage}
      />

      {/* Asset Context Toolbar */}
      {showAssetToolbar && selectedAsset && (
        <AssetContextToolbar
          asset={selectedAsset}
          onClose={() => {
            setShowAssetToolbar(false)
            setSelectedAsset(null)
          }}
          onViewDetails={() => handleAssetContextAction('View Details', selectedAsset)}
          onAssignMission={(asset) => handleAssetContextAction('Assign Mission', asset)}
          onReturnToBase={(asset) => handleAssetContextAction('Return to Base', asset)}
          onRefuelRequest={(asset) => handleAssetContextAction('Refuel Request', asset)}
          onMaintenance={(asset) => handleAssetContextAction('Maintenance', asset)}
        />
      )}

      <AccessibilitySettings />

      <style>{`
        /* Smooth scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${BRAND.bgBase};
        }

        ::-webkit-scrollbar-thumb {
          background: ${BRAND.border};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${BRAND.borderHover};
        }

        /* Smooth transitions globally */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Animations */
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

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Glass effect helpers */
        .glass {
          background: ${BRAND.bgCard};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${BRAND.border};
          border-radius: 12px;
        }

        .glass-hover:hover {
          background: ${BRAND.bgCardHover};
          border-color: ${BRAND.borderHover};
          box-shadow: ${BRAND.shadowGlow};
        }

        /* Gradient text */
        .gradient-text {
          background: ${BRAND.gradientPrimary};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  )
}