import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polygon, Popup, CircleMarker, Marker } from 'react-leaflet'
import { api } from '../lib/api'
import L from 'leaflet'
import AssetDetailModal from './AssetDetailModal'

const defaultCenter = [62.3901, 17.3062]

// Color mapping
const SEVERITY_COLORS = {
  critical: '#b5392f',
  high: '#e24a4a',
  medium: '#d9b945',
  low: '#2196f3',
  info: '#3aa86f'
}

// Battery color based on level
function getBatteryColor(battery) {
  if (battery <= 15) return '#b5392f'
  if (battery <= 30) return '#ff9800'
  if (battery <= 50) return '#d9b945'
  return '#3aa86f'
}

// Base icon colors
const BASE_COLORS = {
  military: '#b5392f',
  airfield: '#4a90e2',
  logistics: '#d9b945',
  storage: '#9c27b0'
}

// Weather popup component
function BaseWeatherPopup({ base, baseWeather, loadBaseWeather }) {
  const bw = baseWeather[base.id] || { loading: false, err: null, data: null }

  return (
    <div style={{ minWidth: 220 }}>
      <strong>🏭 {base.name}</strong><br />
      <span className='muted'>Type: {base.type}</span><br />
      <span className='muted'>Capacity: {base.capacity}</span><br />
      <span className='muted'>Stored: {base.assets_stored?.length || 0} assets</span><br />
      {base.description && <span style={{fontSize: 11, display: 'block', marginTop: 4}}>{base.description}</span>}
      <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #333' }} />

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
          <button onClick={() => loadBaseWeather(base)} style={{ padding: '6px 8px', marginTop: 4 }}>
            Visa väder
          </button>
        </div>
      )}
    </div>
  )
}

export default function Operations() {
  const [geofences, setGeofences] = useState([])
  const [assets, setAssets] = useState([])
  const [bases, setBases] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [baseWeather, setBaseWeather] = useState({}) // { [baseId]: {loading, err, data} }

  // Load weather for a base
  async function loadBaseWeather(base) {
    const id = base.id
    // avoid duplicate loads
    if (baseWeather[id] && baseWeather[id].loading) return

    setBaseWeather(prev => ({ ...prev, [id]: { loading: true, err: null, data: null } }))
    try {
      let data = null
      // try dedicated endpoint first
      if (api.weatherByBase) {
        try {
          data = await api.weatherByBase(base.id)
          console.log('weatherByBase result', data)
        } catch (e) {
          console.warn('weatherByBase failed, will try coords', e)
        }
      }
      if (!data) {
        data = await api.weather(base.lat, base.lon)
        console.log('weather by coords result', data)
      }
      setBaseWeather(prev => ({ ...prev, [id]: { loading: false, err: null, data } }))
    } catch (err) {
      console.error('Failed loading weather for base', base, err)
      setBaseWeather(prev => ({ ...prev, [id]: { loading: false, err: err, data: null } }))
    }
  }

  // Fetch geofences
  useEffect(() => {
    api.geofences()
      .then(data => {
        const parsed = (data || []).map(g => {
          let polygon = g.polygon
          if (typeof polygon === 'string') {
            try { polygon = JSON.parse(polygon) } catch { polygon = [] }
          }
          if (!Array.isArray(polygon)) polygon = []
          return { ...g, polygon }
        })
        setGeofences(parsed)
        setLoading(false)
      })
      .catch(err => {
        console.error('[Operations] Error fetching geofences:', err)
        setLoading(false)
      })
  }, [])

  // Poll for assets
  useEffect(() => {
    const fetchAssets = () => {
      api.assets().then(data => {
        console.log('[Operations] Assets received:', data)
        setAssets(data || [])
      })
        .catch(err => console.error('[Operations] Error fetching assets:', err))
    }
    fetchAssets()
    const interval = setInterval(fetchAssets, 5000)
    return () => clearInterval(interval)
  }, [])

  // Fetch bases
  useEffect(() => {
    console.log('[Operations] Fetching bases...')
    api.facilities()
      .then(data => {
        console.log('[Operations] Bases received:', data)
        setBases(data || [])
      })
      .catch(err => console.error('[Operations] Error fetching bases:', err))
  }, [])

  // Poll for alerts
  useEffect(() => {
    const fetchAlerts = () => {
      api.alerts().then(data => setAlerts(data || []))
        .catch(err => console.error('[Operations] Error fetching alerts:', err))
    }
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleAckAlert = (alertId) => {
    api.ackAlert(alertId)
      .then(() => api.alerts().then(data => setAlerts(data || [])))
      .catch(err => console.error('[Operations] Error acknowledging alert:', err))
  }

  const recentAlerts = alerts.filter(a => !a.acknowledged).slice(0, 10)

  console.log('[Operations] Rendering - bases:', bases.length, 'assets:', assets.length, 'geofences:', geofences.length)

  return (
    <div className='content'>
      <h3>Operationer</h3>

      {loading && <div style={{ padding: 12, background: '#d9b945', color: '#000', marginBottom: 12 }}>Laddar...</div>}

      <div style={{ height: '70vh', width: '100%', marginTop: 12 }}>
        <MapContainer
          center={defaultCenter}
          zoom={6}
          style={{ height: '100%', width: '100%', borderRadius: 12, zIndex: 1 }}
        >
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Render geofences */}
          {geofences.map(g => (
            Array.isArray(g.polygon) && g.polygon.length >= 3 && (
              <Polygon
                key={g.id}
                positions={g.polygon}
                pathOptions={{ color: '#b89b52', fillOpacity: 0.3, weight: 2 }}
              >
                <Popup>
                  <b>{g.name}</b><br />
                  <span className='muted'>ID: {g.id}</span>
                </Popup>
              </Polygon>
            )
          ))}

          {/* Render bases as markers with weather */}
          {bases.map(base => {
            console.log('[Operations] Rendering base:', base.id, base.lat, base.lon)
            const icon = L.divIcon({
              className: 'base-marker',
              html: `<div style="background: ${BASE_COLORS[base.type] || '#666'}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.5);"></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })

            return (
              <Marker
                key={base.id}
                position={[base.lat, base.lon]}
                icon={icon}
                eventHandlers={{
                  popupopen: () => {
                    console.log('popup opened for base', base.id);
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

          {/* Render assets */}
          {assets.map((a) => {
            const color = a.has_battery && a.battery !== null
              ? getBatteryColor(a.battery)
              : '#4a90e2'

            return (
              <CircleMarker
                key={a.id}
                center={[a.lat, a.lon]}
                radius={6}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.8,
                  weight: 2
                }}
                eventHandlers={{
                  click: () => setSelectedAsset(a)
                }}
              >
                <Popup>
                  <div>
                    <b>{a.id}</b><br />
                    <span className='muted'>{a.type}</span><br />
                    <span className='muted'>Status: {a.status}</span>
                    {a.has_battery && a.battery !== null && (
                      <>
                        <br />
                        <span style={{ color: color }}>
                          Batteri: {a.battery.toFixed(1)}%
                        </span>
                      </>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {/* Assets */}
        <div className='card'>
          <h4>Tillgångar ({assets.length})</h4>
          <ul className='list' style={{ maxHeight: 300, overflowY: 'auto' }}>
            {assets.length === 0 && <li className='muted'>Inga tillgångar ännu</li>}
            {assets.map(a => (
              <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span><b>{a.id}</b> — {a.type}</span><br />
                  <span className='muted' style={{ fontSize: 10 }}>{a.fuel_type}</span>
                </div>
                {a.has_battery && a.battery !== null && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: getBatteryColor(a.battery),
                      color: '#fff',
                      fontWeight: 'bold'
                    }}
                  >
                    🔋 {a.battery.toFixed(0)}%
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Bases */}
        <div className='card'>
          <h4>Baser ({bases.length})</h4>
          <ul className='list' style={{ maxHeight: 300, overflowY: 'auto' }}>
            {bases.length === 0 && <li className='muted'>Inga baser ännu</li>}
            {bases.map(b => (
              <li key={b.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: BASE_COLORS[b.type] || '#666',
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <span><b>{b.name}</b></span><br />
                    <span className='muted' style={{ fontSize: 10 }}>
                      {b.type} • {b.assets_stored?.length || 0}/{b.capacity}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Geofences */}
        <div className='card'>
          <h4>Geofences ({geofences.length})</h4>
          <ul className='list' style={{ maxHeight: 300, overflowY: 'auto' }}>
            {geofences.length === 0 && <li className='muted'>Inga geofences ännu</li>}
            {geofences.map(g => (
              <li key={g.id}>
                <span><b>{g.id}</b> — {g.name}</span>
                <span className='muted' style={{ fontSize: 12 }}>
                  {(g.polygon || []).length} punkter
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Alerts */}
        <div className='card'>
          <h4>
            Aktiva Larm ({recentAlerts.length})
            {recentAlerts.length > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 12,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: '#b5392f',
                  color: '#fff'
                }}
              >
                !
              </span>
            )}
          </h4>
          <ul className='list' style={{ maxHeight: 300, overflowY: 'auto' }}>
            {recentAlerts.length === 0 && <li className='muted'>✅ Inga aktiva larm</li>}
            {recentAlerts.map(alert => (
              <li
                key={alert.id}
                style={{
                  borderLeft: `4px solid ${alert.color || SEVERITY_COLORS[alert.severity] || '#666'}`,
                  paddingLeft: 8,
                  marginBottom: 8
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 13 }}>
                      {alert.rule}
                    </div>
                    <div className='muted' style={{ fontSize: 11, marginTop: 4 }}>
                      {alert.asset_id}
                      {alert.geofence_id && ` • ${alert.geofence_id}`}
                    </div>
                    <div className='muted' style={{ fontSize: 10, marginTop: 2 }}>
                      {new Date(alert.ts).toLocaleString('sv-SE')}
                    </div>
                  </div>
                  <button
                    className='btn'
                    style={{
                      fontSize: 11,
                      padding: '4px 8px',
                      marginLeft: 8
                    }}
                    onClick={() => handleAckAlert(alert.id)}
                  >
                    Kvittera
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {alerts.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #333' }}>
              <div className='muted' style={{ fontSize: 11 }}>
                Totalt: {alerts.length} •
                Kvitterade: {alerts.filter(a => a.acknowledged).length} •
                Ohanterade: {alerts.filter(a => !a.acknowledged).length}
              </div>
            </div>
          )}
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