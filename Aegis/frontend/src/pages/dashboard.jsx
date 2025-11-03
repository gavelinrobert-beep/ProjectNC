import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, Polyline } from 'react-leaflet'
import { api } from '../lib/api'
import AssetDetailModal from '../components/AssetDetailModal'
import L from 'leaflet'

const defaultCenter = [62.3901, 17.3062]

// Base colors
const BASE_COLORS = {
  military: '#b5392f',
  airfield: '#4a90e2',
  logistics: '#d9b945',
  storage: '#9c27b0'
}

// Mission status colors
const MISSION_COLORS = {
  planned: '#4a90e2',
  active: '#3aa86f',
  completed: '#96a39a',
  cancelled: '#b5392f'
}

function getBatteryColor(battery) {
  if (battery <= 15) return '#b5392f'
  if (battery <= 30) return '#ff9800'
  if (battery <= 50) return '#d9b945'
  return '#3aa86f'
}

// Weather popup component
function BaseWeatherPopup({ base, baseWeather, loadBaseWeather }) {
  const bw = baseWeather[base.id] || { loading: false, err: null, data: null }

  return (
    <div style={{ minWidth: 220 }}>
      <strong>🏭 {base.name}</strong><br />
      <span className='muted'>{base.type}</span><br /><br />

      {bw.loading ? (
        <div>Laddar väder…</div>
      ) : bw.err ? (
        <div style={{ color: 'red' }}>
          Fel vid laddning av väder<br />
          <button onClick={() => loadBaseWeather(base)} style={{ marginTop: 6, padding: '4px 8px' }}>Försök igen</button>
        </div>
      ) : bw.data ? (
        <div style={{ fontSize: 13 }}>
          <strong>{bw.data.condition}</strong> — {bw.data.description}<br />
          Temp: {bw.data.temperature} °C (känns som {bw.data.feels_like})<br />
          Luftfuktighet: {bw.data.humidity}%<br />
          Vind: {bw.data.wind_speed} m/s
        </div>
      ) : (
        <div>
          <button onClick={() => loadBaseWeather(base)} style={{ padding: '6px 8px' }}>
            Visa väder
          </button>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [assets, setAssets] = useState([])
  const [bases, setBases] = useState([])
  const [alerts, setAlerts] = useState([])
  const [geofences, setGeofences] = useState([])
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [baseWeather, setBaseWeather] = useState({})

  // Load weather for a base
  async function loadBaseWeather(base) {
    const id = base.id
    if (baseWeather[id] && baseWeather[id].loading) return

    setBaseWeather(prev => ({ ...prev, [id]: { loading: true, err: null, data: null } }))
    try {
      let data = null
      if (api.weatherByBase) {
        try {
          data = await api.weatherByBase(base.id)
        } catch (e) {
          console.warn('weatherByBase failed, will try coords', e)
        }
      }
      if (!data) {
        data = await api.weather(base.lat, base.lon)
      }
      setBaseWeather(prev => ({ ...prev, [id]: { loading: false, err: null, data } }))
    } catch (err) {
      console.error('Failed loading weather for base', base, err)
      setBaseWeather(prev => ({ ...prev, [id]: { loading: false, err: err, data: null } }))}
  }

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, basesData, alertsData, geofencesData, missionsData] = await Promise.all([
          api.assets(),
          api.bases(),
          api.alerts(),
          api.geofences(),
          api.missions()
        ])
        setAssets(assetsData || [])
        setBases(basesData || [])
        setAlerts(alertsData || [])
        setGeofences(geofencesData || [])
        setMissions(missionsData || [])
        setLoading(false)
      } catch (err) {
        console.error('[Dashboard] Error fetching data:', err)
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  // Calculate statistics
  const stats = {
    totalAssets: assets.length,
    mobileAssets: assets.filter(a => a.status === 'mobile').length,
    parkedAssets: assets.filter(a => a.status === 'parked').length,
    airborneAssets: assets.filter(a => a.status === 'airborne').length,
    dockedAssets: assets.filter(a => a.status === 'docked').length,

    totalBases: bases.length,
    militaryBases: bases.filter(b => b.type === 'military').length,
    airfields: bases.filter(b => b.type === 'airfield').length,
    storageFacilities: bases.filter(b => b.type === 'storage' || b.type === 'logistics').length,

    totalAlerts: alerts.length,
    activeAlerts: alerts.filter(a => !a.acknowledged).length,
    criticalAlerts: alerts.filter(a => !a.acknowledged && a.severity === 'critical').length,

    lowBatteryAssets: assets.filter(a => a.has_battery && a.battery !== null && a.battery < 30).length,
    criticalBatteryAssets: assets.filter(a => a.has_battery && a.battery !== null && a.battery < 15).length,

    lowFuelAssets: assets.filter(a => a.fuel_level && a.fuel_level < 20).length,
    criticalFuelAssets: assets.filter(a => a.fuel_level && a.fuel_level < 10).length,
    maintenanceNeeded: assets.filter(a => a.maintenance_status === 'needs_maintenance').length,
    underMaintenance: assets.filter(a => a.maintenance_status === 'under_maintenance').length,

    totalGeofences: geofences.length,

    // Mission stats
    totalMissions: missions.length,
    activeMissions: missions.filter(m => m.status === 'active').length,
    plannedMissions: missions.filter(m => m.status === 'planned').length,
    completedMissions: missions.filter(m => m.status === 'completed').length,
    completionRate: missions.length > 0
      ? Math.round((missions.filter(m => m.status === 'completed').length / missions.length) * 100)
      : 0
  }

  // Recent alerts (last 5)
  const recentAlerts = alerts.filter(a => !a.acknowledged).slice(0, 5)

  // Active missions for display
  const activeMissionsList = missions.filter(m => m.status === 'active').slice(0, 5)

  // Calculate mission progress
  const calculateMissionProgress = (mission) => {
    if (!mission || !mission.asset_id || mission.status !== 'active') {
      return 0
    }

    const asset = assets.find(a => a.id === mission.asset_id)
    if (!asset || !mission.waypoints || mission.waypoints.length === 0) {
      return 0
    }

    let closestWaypointIndex = 0
    let minDistance = Infinity

    mission.waypoints.forEach((wp, idx) => {
      const distance = Math.sqrt(
        Math.pow(asset.lat - wp.lat, 2) + Math.pow(asset.lon - wp.lon, 2)
      )
      if (distance < minDistance) {
        minDistance = distance
        closestWaypointIndex = idx
      }
    })

    const totalWaypoints = mission.waypoints.length
    return totalWaypoints > 1 ? Math.round((closestWaypointIndex / (totalWaypoints - 1)) * 100) : 0
  }

  if (loading) {
    return (
      <div className='content'>
        <h3>Dashboard</h3>
        <div style={{ padding: 12, background: '#d9b945', color: '#000', marginTop: 12 }}>
          Laddar översikt...
        </div>
      </div>
    )
  }

  return (
    <div className='content'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>Dashboard - Operationsöversikt</h3>
        <div style={{ fontSize: 12, color: '#999' }}>
          Senast uppdaterad: {new Date().toLocaleString('sv-SE')}
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 16
      }}>
        {/* Total Assets Card */}
        <div className='card' style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#4a90e2' }}>
            {stats.totalAssets}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Totalt Tillgångar</div>
          <div style={{ marginTop: 8, fontSize: 11 }}>
            <div>🚗 Mobila: {stats.mobileAssets}</div>
            <div>🅿️ Parkerade: {stats.parkedAssets}</div>
            <div>✈️ I luften: {stats.airborneAssets}</div>
            {stats.dockedAssets > 0 && <div>⚓ Dockade: {stats.dockedAssets}</div>}
          </div>
        </div>

        {/* Missions Card */}
        <div className='card' style={{
          background: '#1a1a1a',
          border: stats.activeMissions > 0 ? '2px solid #3aa86f' : '1px solid #333'
        }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#3aa86f' }}>
            {stats.activeMissions}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Aktiva Uppdrag</div>
          <div style={{ marginTop: 8, fontSize: 11 }}>
            <div>📋 Planerade: {stats.plannedMissions}</div>
            <div>✅ Slutförda: {stats.completedMissions}</div>
            <div>📊 Completion: {stats.completionRate}%</div>
          </div>
        </div>

        {/* NEW: Fuel Status Card */}
        <div className='card' style={{
          background: '#1a1a1a',
          border: stats.criticalFuelAssets > 0 ? '2px solid #b5392f' : '1px solid #333'
        }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: stats.criticalFuelAssets > 0 ? '#b5392f' : '#3aa86f' }}>
            {stats.lowFuelAssets}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Lågt Bränsle</div>
          <div style={{ marginTop: 8, fontSize: 11 }}>
            <div>⛽ Kritiskt (&lt;10%): {stats.criticalFuelAssets}</div>
            <div>⚠️ Varning (&lt;20%): {stats.lowFuelAssets - stats.criticalFuelAssets}</div>
          </div>
        </div>

        {/* NEW: Maintenance Card */}
        <div className='card' style={{
          background: '#1a1a1a',
          border: stats.maintenanceNeeded > 0 ? '2px solid #ff9800' : '1px solid #333'
        }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: stats.maintenanceNeeded > 0 ? '#ff9800' : '#3aa86f' }}>
            {stats.maintenanceNeeded}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Underhåll Krävs</div>
          <div style={{ marginTop: 8, fontSize: 11 }}>
            <div>🔧 Behöver service: {stats.maintenanceNeeded}</div>
            <div>🛠️ Under service: {stats.underMaintenance}</div>
          </div>
        </div>

        {/* Alerts Card */}
        <div className='card' style={{ background: '#1a1a1a', border: stats.criticalAlerts > 0 ? '2px solid #b5392f' : '1px solid #333' }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: stats.activeAlerts > 0 ? '#e24a4a' : '#3aa86f' }}>
            {stats.activeAlerts}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Aktiva Larm</div>
          <div style={{ marginTop: 8, fontSize: 11 }}>
            <div>🚨 Kritiska: {stats.criticalAlerts}</div>
            <div>📋 Totalt: {stats.totalAlerts}</div>
            <div>✅ Kvitterade: {stats.totalAlerts - stats.activeAlerts}</div>
          </div>
        </div>

        {/* Bases Card */}
        <div className='card' style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#d9b945' }}>
            {stats.totalBases}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Baser</div>
          <div style={{ marginTop: 8, fontSize: 11 }}>
            <div>🔴 Militära: {stats.militaryBases}</div>
            <div>🔵 Flygfält: {stats.airfields}</div>
            <div>🟣 Logistik: {stats.storageFacilities}</div>
          </div>
        </div>

        {/* Battery Status Card */}
        <div className='card' style={{ background: '#1a1a1a', border: stats.criticalBatteryAssets > 0 ? '2px solid #b5392f' : '1px solid #333' }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: stats.criticalBatteryAssets > 0 ? '#b5392f' : '#3aa86f' }}>
            {stats.lowBatteryAssets}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Låg Batterinivå</div>
          <div style={{ marginTop: 8, fontSize: 11 }}>
            <div>⚡ Kritisk (&lt;15%): {stats.criticalBatteryAssets}</div>
            <div>🔋 Varning (&lt;30%): {stats.lowBatteryAssets - stats.criticalBatteryAssets}</div>
          </div>
        </div>

        {/* Geofences Card */}
        <div className='card' style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#b89b52' }}>
            {stats.totalGeofences}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Geofences</div>
          <div style={{ marginTop: 8, fontSize: 11 }}>
            <div>Aktiva övervakningsområden</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
        {/* Map Overview */}
        <div className='card'>
          <h4 style={{ marginBottom: 12 }}>Kartöversikt</h4>
          <div style={{ height: '400px', width: '100%', borderRadius: 8, overflow: 'hidden' }}>
            <MapContainer
              center={defaultCenter}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                attribution='&copy; OpenStreetMap contributors'
              />

              {/* Active Mission Routes */}
              {missions.filter(m => m.status === 'active' && m.waypoints).map(mission => (
                <Polyline
                  key={`mission-${mission.id}`}
                  positions={mission.waypoints.map(wp => [wp.lat, wp.lon])}
                  color={MISSION_COLORS.active}
                  weight={2}
                  opacity={0.6}
                  dashArray="5, 10"
                />
              ))}

              {/* Bases with weather */}
              {bases.map(base => {
                const icon = L.divIcon({
                  className: 'base-marker',
                  html: `<div style="background: ${BASE_COLORS[base.type] || '#666'}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>`,
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                })

                return (
                  <Marker
                    key={base.id}
                    position={[base.lat, base.lon]}
                    icon={icon}
                    eventHandlers={{
                      popupopen: () => {
                        loadBaseWeather(base);
                      }
                    }}
                  >
                    <Popup>
                      <BaseWeatherPopup base={base} baseWeather={baseWeather} loadBaseWeather={loadBaseWeather} />
                    </Popup>
                  </Marker>
                )
              })}

              {/* Assets */}
              {assets.map(asset => {
                const color = asset.has_battery && asset.battery !== null
                  ? getBatteryColor(asset.battery)
                  : '#4a90e2'

                const onMission = missions.some(m => m.status === 'active' && m.asset_id === asset.id)

                return (
                  <CircleMarker
                    key={asset.id}
                    center={[asset.lat, asset.lon]}
                    radius={onMission ? 8 : 6}
                    pathOptions={{
                      color: onMission ? '#3aa86f' : color,
                      fillColor: onMission ? '#3aa86f' : color,
                      fillOpacity: onMission ? 1 : 0.8,
                      weight: onMission ? 3 : 2
                    }}
                    eventHandlers={{
                      click: () => setSelectedAsset(asset)
                    }}
                  >
                    <Popup>
                      <b>{asset.id}</b><br />
                      <span className='muted'>{asset.type}</span>
                      {onMission && <><br /><span style={{ color: '#3aa86f' }}>🎯 På uppdrag</span></>}
                    </Popup>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          </div>
        </div>

        {/* Active Missions Panel */}
        <div className='card'>
          <h4 style={{ marginBottom: 12 }}>Aktiva Uppdrag</h4>
          {activeMissionsList.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>
              Inga aktiva uppdrag
            </div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {activeMissionsList.map(mission => {
                const progress = calculateMissionProgress(mission)
                return (
                  <div
                    key={mission.id}
                    style={{
                      padding: 12,
                      marginBottom: 8,
                      background: '#1a1a1a',
                      borderRadius: 4,
                      border: '1px solid #333'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <strong style={{ fontSize: 13 }}>{mission.name}</strong>
                      <span style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        background: '#3aa86f',
                        borderRadius: 3,
                        color: '#fff'
                      }}>
                        {mission.priority}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>
                      {mission.asset_id || 'Unassigned'}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <div style={{
                        height: 8,
                        background: '#2a2a2a',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: '1px solid #444'
                      }}>
                        <div style={{
                          width: `${progress}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #3aa86f 0%, #4fc97f 100%)',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: '#3aa86f', textAlign: 'right' }}>
                      {progress}% complete
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <button
            className='btn'
            onClick={() => window.location.hash = '#/missions'}
            style={{ width: '100%', marginTop: 12, fontSize: 12 }}
          >
            🎯 Alla Uppdrag
          </button>
        </div>
      </div>

      {/* Secondary Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {/* Recent Alerts */}
        <div className='card'>
          <h4 style={{ marginBottom: 12 }}>Senaste Larm</h4>
          {recentAlerts.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: '#3aa86f' }}>
              ✅ Inga aktiva larm
            </div>
          ) : (
            <ul className='list' style={{ maxHeight: 300, overflowY: 'auto' }}>
              {recentAlerts.map(alert => (
                <li
                  key={alert.id}
                  style={{
                    borderLeft: `4px solid ${alert.color || '#666'}`,
                    paddingLeft: 8,
                    marginBottom: 8,
                    fontSize: 11
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{alert.rule}</div>
                  <div className='muted' style={{ fontSize: 10 }}>
                    {alert.asset_id} • {new Date(alert.ts).toLocaleString('sv-SE')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mission Statistics */}
        <div className='card'>
          <h4 style={{ marginBottom: 12 }}>Uppdragsstatistik</h4>
          <div style={{ fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #333' }}>
              <span>📋 Totalt uppdrag</span>
              <span style={{ fontWeight: 'bold' }}>{stats.totalMissions}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #333' }}>
              <span>🎯 Aktiva</span>
              <span style={{ fontWeight: 'bold', color: '#3aa86f' }}>{stats.activeMissions}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #333' }}>
              <span>📝 Planerade</span>
              <span style={{ fontWeight: 'bold', color: '#4a90e2' }}>{stats.plannedMissions}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #333' }}>
              <span>✅ Slutförda</span>
              <span style={{ fontWeight: 'bold', color: '#96a39a' }}>{stats.completedMissions}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>📊 Slutförandehastighet</span>
              <span style={{ fontWeight: 'bold', color: stats.completionRate >= 50 ? '#3aa86f' : '#d9b945' }}>
                {stats.completionRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid - Asset Types */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
        {/* Asset Types */}
        <div className='card'>
          <h4 style={{ marginBottom: 12 }}>Tillgångstyper</h4>
          <div style={{ fontSize: 12 }}>
            {/* Ground Vehicles */}
            {(assets.filter(a => ['truck', 'armored_vehicle', 'supply_vehicle', 'fuel_truck', 'ambulance', 'command_vehicle'].includes(a.type)).length > 0) && (
              <>
                <div style={{ fontWeight: 'bold', color: '#d9b945', marginBottom: 8, paddingBottom: 4, borderBottom: '2px solid #333' }}>
                  🚗 Markfordon
                </div>
                {assets.filter(a => a.type === 'truck').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Lastbilar</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'truck').length}</span>
                  </div>
                )}
                {assets.filter(a => a.type === 'armored_vehicle').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Pansarfordon</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'armored_vehicle').length}</span>
                  </div>
                )}
                {assets.filter(a => a.type === 'supply_vehicle').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Förrådsfordon</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'supply_vehicle').length}</span>
                  </div>
                )}
                {assets.filter(a => a.type === 'fuel_truck').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Bränsletankar</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'fuel_truck').length}</span>
                  </div>
                )}
                {assets.filter(a => a.type === 'ambulance').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Ambulanser</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'ambulance').length}</span>
                  </div>
                )}
                {assets.filter(a => a.type === 'command_vehicle').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Ledningsfordon</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'command_vehicle').length}</span>
                  </div>
                )}
              </>
            )}

            {/* Aircraft */}
            {(assets.filter(a => ['cargo_plane', 'fighter_jet', 'helicopter', 'transport_helicopter', 'reconnaissance_plane', 'uav'].includes(a.type)).length > 0) && (
              <>
                <div style={{ fontWeight: 'bold', color: '#4a90e2', marginTop: 12, marginBottom: 8, paddingBottom: 4, borderBottom: '2px solid #333' }}>
                  ✈️ Flygplan
                </div>
                {assets.filter(a => a.type === 'cargo_plane').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Transportplan</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'cargo_plane').length}</span>
                  </div>
                )}
                {assets.filter(a => a.type === 'fighter_jet').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Stridsflygplan</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'fighter_jet').length}</span>
                  </div>
                )}
                {assets.filter(a => a.type === 'helicopter').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Helikoptrar</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'helicopter').length}</span>
                  </div>
                )}
                {assets.filter(a => a.type === 'transport_helicopter').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Transporthelikoptrar</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'transport_helicopter').length}</span>
                  </div>
                )}
                {assets.filter(a => a.type === 'reconnaissance_plane').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Spaningsplan</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'reconnaissance_plane').length}</span>
                  </div>
                )}
                {assets.filter(a => a.type === 'uav').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Drönare (UAV)</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'uav').length}</span>
                  </div>
                )}
              </>
            )}

            {/* Naval */}
            {(assets.filter(a => ['patrol_boat', 'corvette', 'submarine', 'supply_ship', 'landing_craft'].includes(a.type)).length > 0) && (
              <>
                <div style={{ fontWeight: 'bold', color: '#3aa86f', marginTop: 12, marginBottom: 8, paddingBottom: 4, borderBottom: '2px solid #333' }}>
                  ⚓ Fartyg
                </div>
                {assets.filter(a => a.type === 'patrol_boat').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Patrullbåtar</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'patrol_boat').length}</span>
                  </div>
                )}
                {assets.filter(a => a.type === 'corvette').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Korvetter</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'corvette').length}</span>
                  </div>
                )}
                {assets.filter(a => a.type === 'submarine').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Ubåtar</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'submarine').length}</span>
                  </div>
                )}
                {assets.filter(a => a.type === 'supply_ship').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px', borderBottom: '1px solid #222' }}>
                    <span>Försörjningsfartyg</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'supply_ship').length}</span>
                  </div>
                )}
                {assets.filter(a => a.type === 'landing_craft').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 4px 12px'}}>
                    <span>Landstigning</span>
                    <span style={{ fontWeight: 'bold' }}>{assets.filter(a => a.type === 'landing_craft').length}</span>
                  </div>
                )}
              </>
            )}

            {/* Show message if no assets */}
            {assets.length === 0 && (
              <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>
                Inga tillgångar ännu
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className='card'>
          <h4 style={{ marginBottom: 12 }}>Systemstatus</h4>
          <div style={{ fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #333' }}>
              <span>API Status</span>
              <span style={{ color: '#3aa86f', fontWeight: 'bold' }}>● Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #333' }}>
              <span>Databas</span>
              <span style={{ color: '#3aa86f', fontWeight: 'bold' }}>● Ansluten</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #333' }}>
              <span>Kartdata</span>
              <span style={{ color: '#3aa86f', fontWeight: 'bold' }}>● Laddad</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>Uppdateringsfrekvens</span>
              <span style={{ fontWeight: 'bold' }}>5s</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='card'>
          <h4 style={{ marginBottom: 12 }}>Snabbåtgärder</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className='btn'
              onClick={() => window.location.hash = '#/missions'}
              style={{ width: '100%' }}
            >
              🎯 Uppdrag
            </button>
            <button
              className='btn'
              onClick={() => window.location.hash = '#/operations'}
              style={{ width: '100%' }}
            >
              📍 Karta
            </button>
            <button
              className='btn'
              onClick={() => window.location.hash = '#/alerts'}
              style={{ width: '100%' }}
            >
              🚨 Larm
            </button>
            <button
              className='btn'
              onClick={() => window.location.hash = '#/administration'}
              style={{ width: '100%' }}
            >
              ⚙️ Administration
            </button>
          </div>
        </div>
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  )
}