import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, Polyline } from 'react-leaflet'
import { api, fetchInventoryItems } from '../lib/api'
import AssetDetailModal from '../components/AssetDetailModal'
import L from 'leaflet'
import InventoryWidget from '../components/InventoryWidget?v=2'
import AlertBanner from '../components/AlertBanner'
import ReadinessPanel from '../components/ReadinessPanel'
import SupplyChainPanel from '../components/SupplyChainPanel'
import MetricsPanel from '../components/MetricsPanel'
import NATOAlliesPanel from '../components/NATOAlliesPanel'
import DemoControls from '../components/DemoControls'
import { DemoScenario } from '../lib/demoScenario'
import { setupBaseInventory } from '../lib/setupInventory'
const defaultCenter = [62.3901, 17.3062]

const BRAND = {
  primary: '#00BFFF',
  secondary: '#FFD700',
  success: '#00FF88',
  warning: '#FFA500',
  danger: '#FF4444',
  dark: '#0a0a0a',
  card: '#1a1a1a',
  border: '#2a2a2a',
}

const BASE_COLORS = {
  military: '#b5392f',
  airfield: BRAND.primary,
  logistics: BRAND.secondary,
  storage: '#9c27b0'
}

const MISSION_COLORS = {
  planned: BRAND.primary,
  active: BRAND.success,
  completed: '#96a39a',
  cancelled: BRAND.danger
}

function getBatteryColor(battery) {
  if (battery <= 15) return BRAND.danger
  if (battery <= 30) return BRAND.warning
  if (battery <= 50) return BRAND.secondary
  return BRAND.success
}

const StatCard = ({ value, label, icon, color, subtitle, mini = false }) => (
  <div style={{
    background: BRAND.card,
    border: `1px solid ${color}22`,
    borderLeft: `3px solid ${color}`,
    borderRadius: 6,
    padding: mini ? 8 : 12,
    minWidth: mini ? 100 : 140,
    transition: 'all 0.2s',
    cursor: 'default'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <span style={{ fontSize: mini ? 12 : 14 }}>{icon}</span>
      <div style={{ fontSize: mini ? 9 : 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
    </div>
    <div style={{ fontSize: mini ? 20 : 24, fontWeight: 'bold', color: color, marginBottom: 2 }}>
      {value}
    </div>
    {subtitle && (
      <div style={{ fontSize: mini ? 8 : 9, color: '#666' }}>
        {subtitle}
      </div>
    )}
  </div>
)

const CollapsibleSection = ({ title, children, defaultOpen = false, count }) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 6, marginBottom: 8, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '10px 12px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: open ? 'rgba(0,191,255,0.05)' : 'transparent',
          transition: 'background 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 'bold', color: BRAND.primary }}>{title}</span>
          {count !== undefined && (
            <span style={{
              background: BRAND.primary,
              color: '#000',
              padding: '2px 6px',
              borderRadius: 10,
              fontSize: 9,
              fontWeight: 'bold'
            }}>
              {count}
            </span>
          )}
        </div>
        <span style={{
          color: BRAND.primary,
          fontSize: 12,
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.3s',
          display: 'inline-block'
        }}>
          ▼
        </span>
      </div>
      {open && (
        <div style={{ padding: '8px 12px', maxHeight: 280, overflowY: 'auto', fontSize: 11 }}>
          {children}
        </div>
      )}
    </div>
  )
}

function BasePopup({ base, baseWeather, loadBaseWeather, inventory }) {
  const bw = baseWeather[base.id] || { loading: false, err: null, data: null }
  const baseInventory = (inventory || []).filter(item => item.location_id === base.id)
  const totalItems = baseInventory.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockItems = baseInventory.filter(item => (item.quantity / item.min_stock_level) * 100 <= 100)

  return (
    <div style={{ minWidth: 280, fontSize: 11 }}>
      <strong style={{ fontSize: 13 }}>🏭 {base.name}</strong><br />
      <span style={{ color: '#999', fontSize: 10 }}>{base.type}</span><br /><br />

      <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #333' }}>
        <strong style={{ fontSize: 11 }}>🌤️ Weather</strong><br />
        {bw.loading ? (
          <div style={{ fontSize: 10 }}>Loading...</div>
        ) : bw.err ? (
          <div style={{ color: BRAND.danger, fontSize: 10 }}>
            Unavailable
            <button onClick={() => loadBaseWeather(base)} style={{ marginLeft: 6, padding: '2px 6px', fontSize: 9 }}>Retry</button>
          </div>
        ) : bw.data ? (
          <div style={{ fontSize: 10, marginTop: 4 }}>
            <strong>{bw.data.condition}</strong> — {bw.data.description}<br />
            {bw.data.temperature}°C (feels {bw.data.feels_like}°C) | {bw.data.humidity}% | {bw.data.wind_speed} m/s
          </div>
        ) : (
          <button onClick={() => loadBaseWeather(base)} style={{ padding: '2px 6px', fontSize: 9, marginTop: 4 }}>Load</button>
        )}
      </div>

      <div>
        <strong style={{ fontSize: 11 }}>📦 Inventory</strong><br />
        {baseInventory.length === 0 ? (
          <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>No inventory</div>
        ) : (
          <div style={{ fontSize: 10, marginTop: 4 }}>
            <div style={{ marginBottom: 6 }}>
              {baseInventory.length} types | {totalItems.toLocaleString()} units
              {lowStockItems.length > 0 && <span style={{ color: BRAND.warning, marginLeft: 6 }}>⚠️ {lowStockItems.length} low</span>}
            </div>
            <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid #333', borderRadius: 4, padding: 4 }}>
              {baseInventory.map(item => {
                const pct = (item.quantity / item.min_stock_level) * 100
                const color = pct <= 50 ? BRAND.danger : pct <= 100 ? BRAND.warning : BRAND.success
                return (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #222' }}>
                    <span>{item.name}</span>
                    <span style={{ fontWeight: 'bold', color }}>{item.quantity} {item.unit}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  // All state declarations
  const [assets, setAssets] = useState([])
  const [bases, setBases] = useState([])
  const [alerts, setAlerts] = useState([])
  const [geofences, setGeofences] = useState([])
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [baseWeather, setBaseWeather] = useState({})
  const [showInventory, setShowInventory] = useState(false)
  const [inventory, setInventory] = useState([])
  const [isDemoActive, setIsDemoActive] = useState(false)
  const [demoSpeed, setDemoSpeed] = useState(1)
  const [demoScenario] = useState(() => new DemoScenario())
  const [demoMessages, setDemoMessages] = useState([])

  // Helper functions
  async function loadBaseWeather(base) {
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

  const calculateProgress = (mission) => {
    if (!mission?.asset_id || mission.status !== 'active') return 0
    const asset = assets.find(a => a.id === mission.asset_id)
    if (!asset || !mission.waypoints?.length) return 0
    let closest = 0, minDist = Infinity
    mission.waypoints.forEach((wp, i) => {
      const d = Math.sqrt(Math.pow(asset.lat - wp.lat, 2) + Math.pow(asset.lon - wp.lon, 2))
      if (d < minDist) { minDist = d; closest = i }
    })
    return mission.waypoints.length > 1 ? Math.round((closest / (mission.waypoints.length - 1)) * 100) : 0
  }

  // useEffect hooks
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

  useEffect(() => {
  if (!isDemoActive) return

  // Register action callbacks
  demoScenario.registerCallback('createMission', async (data) => {
  if (!data?.asset?.id || !data?.sourceBase || !data?.destBase) {
    console.warn('[DEMO] Missing data for mission creation', data)
    return
  }

  try {
    const mission = {
      name: `DEMO ${data.type === 'transfer' ? 'Supply' : 'Patrol'} - ${data.asset.id}`,
      asset_id: data.asset.id,
      mission_type: data.type || 'patrol',
      priority: data.priority || 'high',
      status: 'planned',
      waypoints: [
        {
          lat: data.sourceBase.lat,
          lon: data.sourceBase.lon,
          name: data.sourceBase.name
        },
        {
          lat: data.destBase.lat,
          lon: data.destBase.lon,
          name: data.destBase.name
        }
      ]
    }

    // For transfer missions, find real inventory items at the source base
    if (data.type === 'transfer') {
      mission.source_base_id = data.sourceBase.id
      mission.destination_base_id = data.destBase.id

      // Get inventory items at source base
      const sourceInventory = inventory.filter(item => item.location_id === data.sourceBase.id)

      if (sourceInventory.length > 0) {
        // Use the first available ammo item
        const ammoItem = sourceInventory.find(item =>
          item.name.toLowerCase().includes('ammunition') ||
          item.category === 'ammunition'
        )

        if (ammoItem && ammoItem.quantity >= 100) {
          mission.items = [{
            item_id: ammoItem.id,  // Use REAL item ID (UUID)
            quantity: 100
          }]
          console.log('[DEMO] Using item:', ammoItem.name, ammoItem.id)
        } else {
          // Fallback to any item with enough quantity
          const anyItem = sourceInventory.find(item => item.quantity >= 100)
          if (anyItem) {
            mission.items = [{
              item_id: anyItem.id,
              quantity: 100
            }]
            console.log('[DEMO] Using fallback item:', anyItem.name, anyItem.id)
          } else {
            console.warn('[DEMO] No items with sufficient quantity, using patrol instead')
            mission.mission_type = 'patrol'
            delete mission.source_base_id
            delete mission.destination_base_id
          }
        }
      } else {
        console.warn('[DEMO] No inventory at source base, converting to patrol')
        mission.mission_type = 'patrol'
        delete mission.source_base_id
        delete mission.destination_base_id
      }
    }

    console.log('[DEMO] Creating mission:', mission)
    const created = await api.createMission(mission)
    console.log('[DEMO] Mission created:', created.id)

    // Start the mission
    await api.startMission(created.id)
    console.log('[DEMO] Mission started:', created.id)

    // Force refresh
    const missionsData = await api.missions()
    setMissions(missionsData || [])

  } catch (err) {
    console.error('[DEMO] Failed to create/start mission:', err)
  }
})

  demoScenario.registerCallback('createLowFuelAlert', async (data) => {
    if (!data.assetId) return
    console.log('[DEMO] Low fuel alert for:', data.assetId)
    // Alert would be created by backend simulation
  })

  demoScenario.registerCallback('restart', () => {
    // Restart the scenario
    setTimeout(() => {
      if (isDemoActive) {
        demoScenario.start(demoSpeed, assets, bases, missions)
      }
    }, 2000)
  })

  const interval = setInterval(() => {
    const events = demoScenario.getTriggeredEvents()
    events.forEach(event => {
      console.log('[DEMO EVENT]', event.message)
      setDemoMessages(prev => [...prev.slice(-4), { ...event, timestamp: Date.now() }])
    })
  }, 100)

  return () => clearInterval(interval)
}, [isDemoActive, demoScenario, assets, bases, missions, demoSpeed])

  // Event handlers
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
    // Make sure we have fresh data
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
      // Refresh inventory
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

  const activeMissionsList = missions.filter(m => m.status === 'active').slice(0, 4)
  const recentAlerts = alerts.filter(a => !a.acknowledged).slice(0, 5)

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: BRAND.primary, fontSize: 18 }}>Dashboard - Operationsöversikt</h3>
        <div style={{ fontSize: 9, color: '#666' }}>
          Uppdaterad: {new Date().toLocaleTimeString('sv-SE')}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 12
      }}>
        <div style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.primary}44`,
          borderLeft: `4px solid ${BRAND.primary}`,
          borderRadius: 6,
          padding: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>🚗</span>
            <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Tillgångar
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: BRAND.primary, marginBottom: 6 }}>
            {stats.totalAssets}
          </div>
          <div style={{ fontSize: 10, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
            <span>✅ Aktiva: {stats.mobile}</span>
            <span>🅿️ Parkerade: {stats.totalAssets - stats.mobile}</span>
          </div>
        </div>

        <div style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.success}44`,
          borderLeft: `4px solid ${BRAND.success}`,
          borderRadius: 6,
          padding: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>🎯</span>
            <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Uppdrag
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: BRAND.success, marginBottom: 6 }}>
            {stats.activeMissions}
          </div>
          <div style={{ fontSize: 10, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
            <span>📋 Aktiva</span>
            <span>✅ Totalt: {missions.length}</span>
          </div>
        </div>

        <div style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.danger}44`,
          borderLeft: `4px solid ${BRAND.danger}`,
          borderRadius: 6,
          padding: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>🚨</span>
            <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Kritiska Larm
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: BRAND.danger, marginBottom: 6 }}>
            {stats.criticalAlerts}
          </div>
          <div style={{ fontSize: 10, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
            <span>⚠️ Aktiva: {alerts.filter(a => !a.acknowledged).length}</span>
            <span>📊 Totalt: {alerts.length}</span>
          </div>
        </div>

        <div style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.warning}44`,
          borderLeft: `4px solid ${BRAND.warning}`,
          borderRadius: 6,
          padding: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>⛽</span>
            <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Låg Bränsle
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: BRAND.warning, marginBottom: 6 }}>
            {stats.lowFuel}
          </div>
          <div style={{ fontSize: 10, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
            <span>🔴 &lt;20%</span>
            <span>⚠️ Behöver tankning</span>
          </div>
        </div>

        <div style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.secondary}44`,
          borderLeft: `4px solid ${BRAND.secondary}`,
          borderRadius: 6,
          padding: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>🔧</span>
            <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Underhåll
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: BRAND.secondary, marginBottom: 6 }}>
            {stats.maintenance}
          </div>
          <div style={{ fontSize: 10, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
            <span>🛠️ Behöver service</span>
            <span>Under service: {assets.filter(a => a.maintenance_status === 'under_maintenance').length}</span>
          </div>
        </div>

        <div style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.primary}44`,
          borderLeft: `4px solid ${BRAND.primary}`,
          borderRadius: 6,
          padding: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>🏭</span>
            <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Baser
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: BRAND.primary, marginBottom: 6 }}>
            {bases.length}
          </div>
          <div style={{ fontSize: 10, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
            <span>✈️ Flygfält: {bases.filter(b => b.type === 'airfield').length}</span>
            <span>🔴 Militära: {bases.filter(b => b.type === 'military').length}</span>
          </div>
        </div>

        <div style={{
          background: BRAND.card,
          border: `1px solid #9c27b044`,
          borderLeft: `4px solid #9c27b0`,
          borderRadius: 6,
          padding: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>📍</span>
            <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Geofences
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#9c27b0', marginBottom: 6 }}>
            {geofences.length}
          </div>
          <div style={{ fontSize: 10, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
            <span>📋 Aktiva områden</span>
            <span>🔍 Övervakade</span>
          </div>
        </div>
      </div>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
  <h3 style={{ margin: 0, color: BRAND.primary, fontSize: 18 }}>Dashboard - Operationsöversikt</h3>
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    {/* Setup Inventory Button */}
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
      <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 12, height: 'calc(100% - 240px)' }}>
        <div style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.primary}44`,
          borderRadius: 8,
          overflow: 'hidden',
          height: '100%'
        }}>
          <MapContainer center={defaultCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />

            {missions.filter(m => m.status === 'active' && m.waypoints).map(mission => {
              const asset = assets.find(a => a.id === mission.asset_id)
              const routeColor = mission.mission_type === 'transfer' ? BRAND.secondary : BRAND.success

              return (
                <React.Fragment key={`mission-${mission.id}`}>
                  <Polyline
                    positions={mission.waypoints.map(wp => [wp.lat, wp.lon])}
                    color={routeColor}
                    weight={3}
                    opacity={0.7}
                    dashArray="10, 5"
                  />

                  {mission.waypoints.map((wp, idx) => (
                    <CircleMarker
                      key={`wp-${mission.id}-${idx}`}
                      center={[wp.lat, wp.lon]}
                      radius={4}
                      pathOptions={{
                        color: '#fff',
                        fillColor: routeColor,
                        fillOpacity: 1,
                        weight: 2
                      }}
                    >
                      <Popup>
                        <div style={{ fontSize: 11 }}>
                          <strong>Waypoint {idx + 1}</strong><br />
                          {wp.name || `${wp.lat.toFixed(4)}, ${wp.lon.toFixed(4)}`}<br />
                          {idx === 0 && <span style={{ color: BRAND.success }}>📍 Start</span>}
                          {idx === mission.waypoints.length - 1 && <span style={{ color: BRAND.danger }}>🎯 Destination</span>}
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}

                  {asset && asset.route && asset.route !== 'stationary' && (
                    <Polyline
                      positions={asset.route.split(' ')
                        .slice(0, Math.floor(asset.route_index || 0) + 1)
                        .map(coord => {
                          const [lat, lon] = coord.split(',').map(Number)
                          return [lat, lon]
                        })}
                      color={BRAND.primary}
                      weight={2}
                      opacity={0.5}
                      dashArray="2, 4"
                    >
                      <Popup>
                        <strong>{asset.id}</strong><br />
                        Trail: Completed path
                      </Popup>
                    </Polyline>
                  )}

                  {mission.mission_type === 'transfer' && mission.source_base_id && (
                    <>
                      {(() => {
                        const sourceBase = bases.find(b => b.id === mission.source_base_id)
                        const destBase = bases.find(b => b.id === mission.destination_base_id)
                        return (
                          <>
                            {sourceBase && (
                              <CircleMarker
                                center={[sourceBase.lat, sourceBase.lon]}
                                radius={8}
                                pathOptions={{
                                  color: BRAND.primary,
                                  fillColor: BRAND.primary,
                                  fillOpacity: 0.3,
                                  weight: 2
                                }}
                              >
                                <Popup>
                                  <strong>📍 Source: {sourceBase.name}</strong>
                                </Popup>
                              </CircleMarker>
                            )}
                            {destBase && (
                              <CircleMarker
                                center={[destBase.lat, destBase.lon]}
                                radius={8}
                                pathOptions={{
                                  color: BRAND.secondary,
                                  fillColor: BRAND.secondary,
                                  fillOpacity: 0.3,
                                  weight: 2
                                }}
                              >
                                <Popup>
                                  <strong>🎯 Destination: {destBase.name}</strong>
                                </Popup>
                              </CircleMarker>
                            )}
                          </>
                        )
                      })()}
                    </>
                  )}
                </React.Fragment>
              )
            })}

            {bases.map(base => (
              <Marker
                key={base.id}
                position={[base.lat, base.lon]}
                icon={L.divIcon({
                  html: `<div style="background: ${BASE_COLORS[base.type]}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 4px #00000080;"></div>`,
                  iconSize: [14, 14],
                  iconAnchor: [7, 7]
                })}
                eventHandlers={{ popupopen: () => loadBaseWeather(base) }}
              >
                <Popup>
                  <BasePopup base={base} baseWeather={baseWeather} loadBaseWeather={loadBaseWeather} inventory={inventory} />
                </Popup>
              </Marker>
            ))}

            {assets.map(asset => {
              const color = asset.has_battery && asset.battery != null ? getBatteryColor(asset.battery) : BRAND.primary
              const onMission = missions.some(m => m.status === 'active' && m.asset_id === asset.id)
              const mission = missions.find(m => m.status === 'active' && m.asset_id === asset.id)

              return (
                <CircleMarker
                  key={asset.id}
                  center={[asset.lat, asset.lon]}
                  radius={onMission ? 8 : 5}
                  pathOptions={{
                    color: onMission ? BRAND.success : color,
                    fillColor: onMission ? BRAND.success : color,
                    fillOpacity: onMission ? 1 : 0.8,
                    weight: onMission ? 3 : 2
                  }}
                  eventHandlers={{ click: () => setSelectedAsset(asset) }}
                >
                  <Popup>
                    <div style={{ fontSize: 11 }}>
                      <strong>{asset.id}</strong><br />
                      Type: {asset.type}<br />
                      Status: {asset.status}<br />
                      Speed: {asset.speed} km/h<br />
                      {asset.fuel_level && `Fuel: ${asset.fuel_level.toFixed(1)}%`}<br />
                      {onMission && (
                        <>
                          <span style={{ color: BRAND.success, fontWeight: 'bold' }}>🎯 On Mission</span><br />
                          Mission: {mission.name}
                        </>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflowY: 'auto', paddingRight: 4 }}>
          <CollapsibleSection title="NATO Force Readiness" defaultOpen={true}>
            <div style={{ padding: 0 }}>
              <ReadinessPanel
                assets={assets}
                missions={missions}
                bases={bases}
                inventory={inventory}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Supply Chain Status" defaultOpen={false}>
            <div style={{ padding: 0 }}>
              <SupplyChainPanel
                inventory={inventory}
                bases={bases}
                missions={missions}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Operational Metrics" defaultOpen={false}>
            <div style={{ padding: 0 }}>
              <MetricsPanel
                missions={missions}
                alerts={alerts}
                assets={assets}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="NATO Allied Forces" defaultOpen={false}>
            <div style={{ padding: 0 }}>
              <NATOAlliesPanel
                assets={assets}
                bases={bases}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Aktiva Uppdrag" count={stats.activeMissions} defaultOpen={true}>
            {activeMissionsList.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: 12 }}>Inga aktiva uppdrag</div>
            ) : (
              activeMissionsList.map(m => {
                const prog = calculateProgress(m)
                const asset = assets.find(a => a.id === m.asset_id)

                let eta = null
                let distanceRemaining = 0
                if (asset && m.waypoints && asset.speed > 0) {
                  const routeIndex = asset.route_index || 0
                  const currentWpIndex = Math.floor(routeIndex)

                  for (let i = currentWpIndex; i < m.waypoints.length - 1; i++) {
                    const wp1 = m.waypoints[i]
                    const wp2 = m.waypoints[i + 1]
                    const dist = Math.sqrt(
                      Math.pow((wp2.lat - wp1.lat) * 111, 2) +
                      Math.pow((wp2.lon - wp1.lon) * 111 * Math.cos(wp1.lat * Math.PI / 180), 2)
                    )
                    distanceRemaining += dist
                  }

                  const hoursRemaining = distanceRemaining / asset.speed
                  const minutesRemaining = Math.round(hoursRemaining * 60)
                  eta = minutesRemaining
                }

                return (
                  <div key={m.id} style={{
                    background: 'rgba(0,191,255,0.05)',
                    border: `1px solid ${BRAND.primary}33`,
                    borderRadius: 4,
                    padding: 10,
                    marginBottom: 8
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong style={{ fontSize: 12, color: BRAND.primary }}>{m.name}</strong>
                      <span style={{
                        fontSize: 8,
                        background: m.priority === 'critical' ? BRAND.danger : m.priority === 'high' ? BRAND.warning : BRAND.secondary,
                        color: '#000',
                        padding: '2px 6px',
                        borderRadius: 3,
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {m.priority}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 10 }}>
                      <span style={{ color: '#999' }}>
                        🚗 {m.asset_id || 'Unassigned'}
                      </span>
                      {asset && (
                        <span style={{ color: BRAND.success, fontWeight: 'bold' }}>
                          {asset.status === 'mobile' ? '🚗 Moving' : asset.status === 'airborne' ? '✈️ Airborne' : '⏸️ Paused'}
                        </span>
                      )}
                    </div>

                    <div style={{ marginBottom: 6 }}>
                      <div style={{ height: 8, background: '#222', borderRadius: 4, overflow: 'hidden', border: '1px solid #333' }}>
                        <div style={{
                          width: `${prog}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${BRAND.success} 0%, #4fc97f 100%)`,
                          transition: 'width 0.5s ease',
                          boxShadow: `0 0 8px ${BRAND.success}88`
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
                      <span style={{ color: BRAND.success, fontWeight: 'bold' }}>
                        {prog}% Complete
                      </span>
                      {eta !== null && (
                        <span style={{ color: BRAND.secondary }}>
                          ⏱️ ETA: {eta < 60 ? `${eta}m` : `${Math.floor(eta / 60)}h ${eta % 60}m`}
                          {distanceRemaining > 0 && ` • ${distanceRemaining.toFixed(1)} km`}
                        </span>
                      )}
                    </div>

                    {m.mission_type === 'transfer' && (
                      <div style={{
                        marginTop: 6,
                        padding: '4px 8px',
                        background: 'rgba(255, 215, 0, 0.1)',
                        border: `1px solid ${BRAND.secondary}44`,
                        borderRadius: 3,
                        fontSize: 9,
                        color: BRAND.secondary
                      }}>
                        📦 Transfer Mission: {m.source_base_id} → {m.destination_base_id}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Senaste Larm" count={recentAlerts.length} defaultOpen={true}>
            {recentAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', color: BRAND.success, padding: 12 }}>✅ Inga aktiva larm</div>
            ) : (
              recentAlerts.map((a, i) => (
                <div key={i} style={{
                  borderLeft: `3px solid ${BRAND.danger}`,
                  paddingLeft: 6,
                  marginBottom: 6,
                  fontSize: 10
                }}>
                  <div style={{ fontWeight: 'bold' }}>{a.rule}</div>
                  <div style={{ fontSize: 9, color: '#999' }}>{a.asset_id} • {new Date(a.ts).toLocaleTimeString('sv-SE')}</div>
                </div>
              ))
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Systemstatus" defaultOpen={false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>API Status</span>
              <span style={{ color: BRAND.success }}>● Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Databas</span>
              <span style={{ color: BRAND.success }}>● Ansluten</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Uppdatering</span>
              <span style={{ color: BRAND.primary }}>5s</span>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Inventory" count={inventory.length} defaultOpen={false}>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              <InventoryWidget />
            </div>
          </CollapsibleSection>
        </div>
      </div>

      {selectedAsset && <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}

      <DemoControls
        isDemoActive={isDemoActive}
        onDemoToggle={handleDemoToggle}
        onSpeedChange={handleSpeedChange}
        stats={stats}
      />

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