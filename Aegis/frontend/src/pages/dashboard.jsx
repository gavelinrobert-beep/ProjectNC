import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from 'react-leaflet'
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

function getBatteryColor(battery) {
  if (battery <= 15) return '#b5392f'
  if (battery <= 30) return '#ff9800'
  if (battery <= 50) return '#d9b945'
  return '#3aa86f'
}

export default function Dashboard() {
  const [assets, setAssets] = useState([])
  const [bases, setBases] = useState([])
  const [alerts, setAlerts] = useState([])
  const [geofences, setGeofences] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState(null)

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, basesData, alertsData, geofencesData] = await Promise.all([
          api.assets(),
          api.bases(),
          api.alerts(),
          api.geofences()
        ])
        setAssets(assetsData || [])
        setBases(basesData || [])
        setAlerts(alertsData || [])
        setGeofences(geofencesData || [])
        setLoading(false)
      } catch (err) {
        console.error('[Dashboard] Error fetching data:', err)
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)
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

    totalGeofences: geofences.length
  }

  // Asset types breakdown
  const assetTypes = {
    vehicles: assets.filter(a => a.type === 'vehicle').length,
    trucks: assets.filter(a => a.type === 'truck').length,
    uavs: assets.filter(a => a.type === 'uav').length,
    helicopters: assets.filter(a => a.type === 'helicopter').length,
    planes: assets.filter(a => a.type === 'plane').length,
    ships: assets.filter(a => a.type === 'ship').length,
    patrolBoats: assets.filter(a => a.type === 'patrol_boat').length
  }

  // Recent alerts (last 5)
  const recentAlerts = alerts.filter(a => !a.acknowledged).slice(0, 5)

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

              {/* Bases */}
              {bases.map(base => {
                const icon = L.divIcon({
                  className: 'base-marker',
                  html: `<div style="background: ${BASE_COLORS[base.type] || '#666'}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>`,
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                })

                return (
                  <Marker key={base.id} position={[base.lat, base.lon]} icon={icon}>
                    <Popup>
                      <b>{base.name}</b><br />
                      <span className='muted'>{base.type}</span>
                    </Popup>
                  </Marker>
                )
              })}

              {/* Assets */}
              {assets.map(asset => {
                const color = asset.has_battery && asset.battery !== null
                  ? getBatteryColor(asset.battery)
                  : '#4a90e2'

                return (
                  <CircleMarker
                    key={asset.id}
                    center={[asset.lat, asset.lon]}
                    radius={6}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.8,
                      weight: 2
                    }}
                    eventHandlers={{
                      click: () => setSelectedAsset(asset)
                    }}
                  >
                    <Popup>
                      <b>{asset.id}</b><br />
                      <span className='muted'>{asset.type}</span>
                    </Popup>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className='card'>
          <h4 style={{ marginBottom: 12 }}>Senaste Larm</h4>
          {recentAlerts.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: '#3aa86f' }}>
              ✅ Inga aktiva larm
            </div>
          ) : (
            <ul className='list' style={{ maxHeight: 400, overflowY: 'auto' }}>
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
      </div>

      {/* Asset Type Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
        {/* Asset Types */}
        <div className='card'>
          <h4 style={{ marginBottom: 12 }}>Tillgångstyper</h4>
          <div style={{ fontSize: 12 }}>
            {assetTypes.vehicles > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #333' }}>
                <span>🚗 Fordon</span>
                <span style={{ fontWeight: 'bold' }}>{assetTypes.vehicles}</span>
              </div>
            )}
            {assetTypes.trucks > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #333' }}>
                <span>🚚 Lastbilar</span>
                <span style={{ fontWeight: 'bold' }}>{assetTypes.trucks}</span>
              </div>
            )}
            {assetTypes.uavs > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #333' }}>
                <span>🛸 UAV</span>
                <span style={{ fontWeight: 'bold' }}>{assetTypes.uavs}</span>
              </div>
            )}
            {assetTypes.helicopters > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #333' }}>
                <span>🚁 Helikoptrar</span>
                <span style={{ fontWeight: 'bold' }}>{assetTypes.helicopters}</span>
              </div>
            )}
            {assetTypes.planes > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #333' }}>
                <span>✈️ Flygplan</span>
                <span style={{ fontWeight: 'bold' }}>{assetTypes.planes}</span>
              </div>
            )}
            {assetTypes.ships > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #333' }}>
                <span>🚢 Fartyg</span>
                <span style={{ fontWeight: 'bold' }}>{assetTypes.ships}</span>
              </div>
            )}
            {assetTypes.patrolBoats > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>⛵ Patrullbåtar</span>
                <span style={{ fontWeight: 'bold' }}>{assetTypes.patrolBoats}</span>
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
              <span style={{ fontWeight: 'bold' }}>10s</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='card'>
          <h4 style={{ marginBottom: 12 }}>Snabbåtgärder</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className='btn'
              onClick={() => window.location.href = '#/operations'}
              style={{ width: '100%' }}
            >
              📍 Öppna Karta
            </button>
            <button
              className='btn'
              onClick={() => window.location.href = '#/administration'}
              style={{ width: '100%' }}
            >
              ⚙️ Administration
            </button>
            <button
              className='btn'
              onClick={() => api.alerts().then(data => {
                const unacked = data.filter(a => !a.acknowledged)
                alert(`${unacked.length} ohanterade larm`)
              })}
              style={{ width: '100%' }}
            >
              🚨 Visa Larm
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