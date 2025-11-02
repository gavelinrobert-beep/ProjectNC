import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { api } from '../lib/api'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icon for new asset marker
const newAssetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component to handle map clicks
function MapClickHandler({ onLocationSelect, enabled }) {
  useMapEvents({
    click(e) {
      if (enabled) {
        onLocationSelect(e.latlng)
      }
    },
  })
  return null
}

// Small popup component that loads weather on demand (keeps internal state)
function BaseWeatherPopup({ base, baseWeather, loadBaseWeather }) {
  const bw = baseWeather[base.id] || { loading: false, err: null, data: null }

  return (
    <div style={{ minWidth: 220 }}>
      <strong>🏭 {base.name}</strong><br />
      Base - {base.type}<br /><br />

      {bw.loading ? (
        <div>Loading weather…</div>
      ) : bw.err ? (
        <div style={{ color: 'red' }}>
          Error loading weather<br />
          <button onClick={() => loadBaseWeather(base)} style={{ marginTop: 6 }}>Retry</button>
        </div>
      ) : bw.data ? (
        <div style={{ fontSize: 13 }}>
          <strong>{bw.data.condition}</strong> — {bw.data.description}<br />
          Temp: {bw.data.temperature} °C (feels like {bw.data.feels_like})<br />
          Humidity: {bw.data.humidity}%<br />
          Wind: {bw.data.wind_speed} m/s
        </div>
      ) : (
        <div>
          <button onClick={() => loadBaseWeather(base)} style={{ padding: '6px 8px' }}>
            Show weather
          </button>
        </div>
      )}
    </div>
  )
}

export default function AssetsAdmin() {
  const [assets, setAssets] = useState([])
  const [bases, setBases] = useState([])
  const [form, setForm] = useState({
    type: 'truck',
    lat: '',
    lon: '',
    // route must be a string for backend validation
    route: '',
    route_index: 0,
    speed: 50,
    // allowed statuses: 'mobile', 'parked', 'airborne'
    status: 'mobile',
    battery: 100,
    battery_drain: 1,
    has_battery: false,
    fuel_type: 'diesel'
  })
  const [editing, setEditing] = useState(null)
  const [mapClickMode, setMapClickMode] = useState(false)
  const [tempMarker, setTempMarker] = useState(null)
  const [baseWeather, setBaseWeather] = useState({}) // { [baseId]: {loading, err, data} }
  const mapRef = useRef()

  useEffect(() => {
    fetchAssets()
    fetchBases()
  }, [])

  const fetchAssets = () => {
    api.assets()
      .then(setAssets)
      .catch(err => {
        console.error('Error fetching assets:', err)
        alert('Failed to load assets')
      })
  }

  const fetchBases = () => {
    api.bases()
      .then(setBases)
      .catch(err => console.error('Error fetching bases:', err))
  }

  // Load weather for a base (stores result in parent state)
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

  const handleLocationSelect = (latlng) => {
    setForm(prev => ({
      ...prev,
      lat: latlng.lat.toFixed(6),
      lon: latlng.lng.toFixed(6)
    }))
    setTempMarker(latlng)
    setMapClickMode(false)
    alert(`Location selected: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`)
  }

  const normalizeStatus = (s) => {
    // Map legacy/UX values to backend allowed literals
    if (!s) return 'mobile'
    const v = s.toString().toLowerCase()
    if (['mobile', 'moving'].includes(v)) return 'mobile'
    if (['parked', 'idle', 'stationary'].includes(v)) return 'parked'
    if (['airborne', 'air'].includes(v)) return 'airborne'
    // fallback
    return 'mobile'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Normalize route -> string (backend expects a string)
    let routeValue = form.route
    if (Array.isArray(routeValue)) {
      routeValue = routeValue.join(', ')
    }
    if (routeValue === null || typeof routeValue === 'undefined') {
      routeValue = ''
    }
    routeValue = String(routeValue)

    const assetData = {
      type: form.type,
      lat: parseFloat(form.lat),
      lon: parseFloat(form.lon),
      route: routeValue,
      route_index: parseInt(form.route_index) || 0,
      speed: parseFloat(form.speed) || 50,
      status: normalizeStatus(form.status),
      battery: parseFloat(form.battery) || 100,
      battery_drain: parseFloat(form.battery_drain) || 1,
      has_battery: !!form.has_battery,
      fuel_type: form.fuel_type
    }

    try {
      if (editing) {
        await api.updateAsset(editing, assetData)
        alert('Asset updated!')
      } else {
        await api.createAsset(assetData)
        alert('Asset created!')
      }
      resetForm()
      fetchAssets()
    } catch (err) {
      console.error('Error saving asset:', err)
      // show server JSON error if present
      if (err && err.detail) {
        alert(`Error: ${JSON.stringify(err.detail)}`)
      } else {
        alert(`Error: ${err.message || err}`)
      }
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this asset?')) return
    try {
      await api.deleteAsset(id)
      alert('Asset deleted!')
      fetchAssets()
    } catch (err) {
      console.error('Error deleting asset:', err)
      alert(`Error: ${err.message}`)
    }
  }

  const resetForm = () => {
    setForm({
      type: 'truck',
      lat: '',
      lon: '',
      route: '',
      route_index: 0,
      speed: 50,
      status: 'mobile',
      battery: 100,
      battery_drain: 1,
      has_battery: false,
      fuel_type: 'diesel'
    })
    setEditing(null)
    setTempMarker(null)
    setMapClickMode(false)
  }

  const enableMapClickMode = () => {
    setMapClickMode(true)
    alert('Click anywhere on the map to select location!')
  }

  const getAssetIcon = (type) => {
    const colors = {
      truck: 'blue',
      drone: 'green',
      helicopter: 'red',
      boat: 'violet',
      tank: 'grey',
      apc: 'orange'
    }
    return colors[type] || 'blue'
  }

  const centerMap = [62.0, 15.0]

  return (
    <div style={{ padding: 20 }}>
      <h2>Assets Administration</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Form */}
        <div className="card">
          <h3>{editing ? 'Edit Asset' : 'Create New Asset'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label>Type</label>
              <select
                value={form.type}
                onChange={e => setForm({...form, type: e.target.value})}
                style={{ width: '100%', padding: 8 }}
              >
                <option value="truck">🚚 Truck</option>
                <option value="drone">🚁 Drone</option>
                <option value="helicopter">🚁 Helicopter</option>
                <option value="boat">⛵ Boat</option>
                <option value="tank">🎖️ Tank</option>
                <option value="apc">🎖️ APC</option>
              </select>
            </div>

            <div style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label>Latitude</label>
                <input
                  required
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={e => setForm({...form, lat: e.target.value})}
                  placeholder="59.3293"
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label>Longitude</label>
                <input
                  required
                  type="number"
                  step="any"
                  value={form.lon}
                  onChange={e => setForm({...form, lon: e.target.value})}
                  placeholder="18.0686"
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={enableMapClickMode}
              style={{
                width: '100%',
                padding: 10,
                marginBottom: 12,
                background: mapClickMode ? '#f39c12' : '#3498db',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {mapClickMode ? '📍 Click on map to select location...' : '🗺️ Pick Location from Map'}
            </button>

            <div style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label>Speed (km/h)</label>
                <input
                  type="number"
                  value={form.speed}
                  onChange={e => setForm({...form, speed: e.target.value})}
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({...form, status: e.target.value})}
                  style={{ width: '100%', padding: 8 }}
                >
                  {/* show UX-friendly options but use allowed backend values */}
                  <option value="mobile">Mobile</option>
                  <option value="parked">Parked</option>
                  <option value="airborne">Airborne</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label>Battery %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.battery}
                  onChange={e => setForm({...form, battery: e.target.value})}
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label>Fuel Type</label>
                <select
                  value={form.fuel_type}
                  onChange={e => setForm({...form, fuel_type: e.target.value})}
                  style={{ width: '100%', padding: 8 }}
                >
                  <option value="diesel">Diesel</option>
                  <option value="gasoline">Gasoline</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>
                <input
                  type="checkbox"
                  checked={form.has_battery}
                  onChange={e => setForm({...form, has_battery: e.target.checked})}
                />
                {' '}Has Battery
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn" style={{ flex: 1 }}>
                {editing ? 'Update' : 'Create'} Asset
              </button>
              {editing && (
                <button type="button" onClick={resetForm} className="btn" style={{ background: '#95a5a6' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Map for location picking */}
        <div className="card">
          <h3>Location Picker</h3>
          <div style={{ height: 500, border: '2px solid #3498db', borderRadius: 4, overflow: 'hidden' }}>
            <MapContainer
              center={centerMap}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <MapClickHandler onLocationSelect={handleLocationSelect} enabled={mapClickMode} />

              {/* Existing bases (gray markers) */}
              {bases.map(base => {
                const bw = baseWeather[base.id] || { loading: false, err: null, data: null }
                return (
                  <Marker
                    key={`base-${base.id}`}
                    position={[base.lat, base.lon]}
                    eventHandlers={{
                      // load weather when the marker is clicked (before popup opens)
                      click: () => loadBaseWeather(base)
                    }}
                  >
                    <Popup>
                      <BaseWeatherPopup base={base} baseWeather={baseWeather} loadBaseWeather={loadBaseWeather} />
                    </Popup>
                  </Marker>
                )
              })}

              {/* Existing assets */}
              {assets.map(asset => (
                <Marker key={`asset-${asset.id}`} position={[asset.lat, asset.lon]}>
                  <Popup>
                    <strong>{asset.type}</strong><br />
                    Status: {asset.status}<br />
                    Speed: {asset.speed} km/h<br />
                    Battery: {asset.battery}%
                  </Popup>
                </Marker>
              ))}

              {/* Temporary marker for new location */}
              {tempMarker && (
                <Marker position={[tempMarker.lat, tempMarker.lng]} icon={newAssetIcon}>
                  <Popup>
                    <strong>New Asset Location</strong><br />
                    Lat: {tempMarker.lat.toFixed(6)}<br />
                    Lon: {tempMarker.lng.toFixed(6)}
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#7f8c8d' }}>
            {mapClickMode ? (
              <span style={{ color: '#f39c12', fontWeight: 'bold' }}>
                ⚡ Map click mode active - Click anywhere to select location
              </span>
            ) : (
              <span>
                Gray markers = Bases | Colored markers = Assets<br />
                Click "Pick Location from Map" button, then click on map
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Assets List */}
      <div className="card">
        <h3>Existing Assets ({assets.length})</h3>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#1a1a1a' }}>
              <tr style={{ borderBottom: '1px solid #444' }}>
                <th style={{ padding: 8, textAlign: 'left' }}>Type</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Location</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Speed</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Battery</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Fuel</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: 8 }}>{asset.type}</td>
                  <td style={{ padding: 8, fontSize: 11 }}>{Number(asset.lat).toFixed(4)}, {Number(asset.lon).toFixed(4)}</td>
                  <td style={{ padding: 8 }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: 3,
                      fontSize: 11,
                      background: asset.status === 'mobile' ? '#2ecc71' : asset.status === 'emergency' ? '#e74c3c' : '#95a5a6'
                    }}>
                      {asset.status}
                    </span>
                  </td>
                  <td style={{ padding: 8 }}>{asset.speed} km/h</td>
                  <td style={{ padding: 8 }}>{asset.battery}%</td>
                  <td style={{ padding: 8 }}>{asset.fuel_type}</td>
                  <td style={{ padding: 8 }}>
                    <button
                      onClick={() => {
                        setEditing(asset.id)
                        setForm({
                          type: asset.type,
                          lat: asset.lat,
                          lon: asset.lon,
                          route: asset.route || '',
                          route_index: asset.route_index || 0,
                          speed: asset.speed,
                          status: asset.status,
                          battery: asset.battery,
                          battery_drain: asset.battery_drain || 1,
                          has_battery: asset.has_battery,
                          fuel_type: asset.fuel_type
                        })
                        setTempMarker({ lat: asset.lat, lng: asset.lon })
                      }}
                      style={{
                        padding: '4px 8px',
                        background: '#3498db',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        marginRight: 4
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      style={{
                        padding: '4px 8px',
                        background: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}