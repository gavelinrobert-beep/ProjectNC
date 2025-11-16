// Aegis/frontend/src/components/DashboardMap.jsx
import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { BRAND, BASE_COLORS, DEFAULT_MAP_CENTER, getBatteryColor } from '../lib/constants'
import { createAssetIcon } from '../lib/mapIcons'
import { createBaseIcon } from '../lib/baseIcons'

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

export default function DashboardMap({
  assets,
  bases,
  missions,
  inventory,
  baseWeather,
  loadBaseWeather,
  setSelectedAsset
}) {
  console.log('🏭 DashboardMap received bases:', bases?.length, bases)
  return (
    <div style={{
      background: BRAND.card,
      border: `1px solid ${BRAND.primary}44`,
      borderRadius: 8,
      overflow: 'hidden',
      height: '100%'
    }}>
      <MapContainer center={DEFAULT_MAP_CENTER} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />

        {/* Mission Routes */}
        {missions.filter(m => m.status === 'active' && m.waypoints).map(mission => {
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
            </React.Fragment>
          )
        })}

{/* Bases */}
{bases.map(base => (
  <Marker
    key={base.id}
    position={[base.lat, base.lon]}
    icon={createBaseIcon(base)}
    eventHandlers={{ popupopen: () => loadBaseWeather(base) }}
  >
    <Popup>
      <BasePopup base={base} baseWeather={baseWeather} loadBaseWeather={loadBaseWeather} inventory={inventory} />
    </Popup>
  </Marker>
))}

        {/* Assets */}
        {assets.map(asset => {
          const onMission = missions.some(m => m.status === 'active' && m.asset_id === asset.id)
          const mission = missions.find(m => m.status === 'active' && m.asset_id === asset.id)

          return (
            <Marker
              key={asset.id}
              position={[asset.lat, asset.lon]}
              icon={createAssetIcon(asset, onMission)}
              eventHandlers={{ click: () => setSelectedAsset(asset) }}
            >
              <Popup>
                <div style={{ fontSize: 11 }}>
                  <strong style={{ fontSize: 13, color: BRAND.primary }}>{asset.id}</strong><br />

                  <div style={{
                    marginTop: 6,
                    paddingTop: 6,
                    borderTop: '1px solid #333',
                    display: 'grid',
                    gap: 4
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#999' }}>Type:</span>
                      <strong>{asset.type}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#999' }}>Status:</span>
                      <strong style={{
                        color: asset.status === 'in_use' ? BRAND.success : asset.status === 'available' ? BRAND.primary : asset.status === 'maintenance' ? BRAND.warning : '#999'
                      }}>
                        {asset.status}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#999' }}>Speed:</span>
                      <strong>{asset.speed} km/h</strong>
                    </div>

                    {asset.fuel_level !== undefined && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#999' }}>Fuel:</span>
                        <strong style={{
                          color: asset.fuel_level < 20 ? BRAND.danger : asset.fuel_level < 50 ? BRAND.warning : BRAND.success
                        }}>
                          {asset.fuel_level.toFixed(1)}%
                        </strong>
                      </div>
                    )}

                    {asset.has_battery && asset.battery !== undefined && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#999' }}>Battery:</span>
                        <strong style={{ color: getBatteryColor(asset.battery) }}>
                          {asset.battery}%
                        </strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#999' }}>Maintenance:</span>
                      <strong style={{
                        color: asset.maintenance_status === 'operational' ? BRAND.success : BRAND.warning
                      }}>
                        {asset.maintenance_status}
                      </strong>
                    </div>
                  </div>

                  {onMission && (
                    <div style={{
                      marginTop: 8,
                      padding: '6px 8px',
                      background: `${BRAND.success}22`,
                      border: `1px solid ${BRAND.success}`,
                      borderRadius: 4,
                      textAlign: 'center'
                    }}>
                      <span style={{ color: BRAND.success, fontWeight: 'bold' }}>🎯 ON MISSION</span><br />
                      <span style={{ fontSize: 10 }}>{mission.name}</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}