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

// Realistic military asset types
const ASSET_TYPES = [
  // Ground Vehicles
  { value: 'truck', label: '🚚 Lastbil (Cargo Truck)', category: 'ground' },
  { value: 'armored_vehicle', label: '🛡️ Pansarfordon (Armored Vehicle)', category: 'ground' },
  { value: 'supply_vehicle', label: '📦 Förrådsfordon (Supply Vehicle)', category: 'ground' },
  { value: 'fuel_truck', label: '⛽ Bränsletank (Fuel Truck)', category: 'ground' },
  { value: 'ambulance', label: '🚑 Ambulans (Ambulance)', category: 'ground' },
  { value: 'command_vehicle', label: '🎖️ Ledningsfordon (Command Vehicle)', category: 'ground' },

  // Aircraft
  { value: 'cargo_plane', label: '✈️ Transportplan (Cargo Plane)', category: 'air' },
  { value: 'fighter_jet', label: '🛩️ Stridsflygplan (Fighter Jet)', category: 'air' },
  { value: 'helicopter', label: '🚁 Helikopter (Helicopter)', category: 'air' },
  { value: 'transport_helicopter', label: '🚁 Transporthelikopter (Transport Helicopter)', category: 'air' },
  { value: 'reconnaissance_plane', label: '🔭 Spaningsplan (Reconnaissance Plane)', category: 'air' },
  { value: 'uav', label: '🛸 Drönare (UAV/Drone)', category: 'air' },

  // Naval
  { value: 'patrol_boat', label: '⛴️ Patrullbåt (Patrol Boat)', category: 'naval' },
  { value: 'corvette', label: '🚢 Korvett (Corvette)', category: 'naval' },
  { value: 'submarine', label: '🔱 Ubåt (Submarine)', category: 'naval' },
  { value: 'supply_ship', label: '🚢 Försörjningsfartyg (Supply Ship)', category: 'naval' },
  { value: 'landing_craft', label: '⚓ Landstigning (Landing Craft)', category: 'naval' }
]

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
  const [facilities, setFacilities] = useState([])
  const [drivers, setDrivers] = useState([])
  const [form, setForm] = useState({
    type: 'truck',
    registration_number: '',
    vin: '',
    make: '',
    model: '',
    year: 2024,
    lat: '',
    lon: '',
    route: '',
    route_index: 0,
    speed: 50,
    status: 'available',
    battery: 100,
    battery_drain: 1,
    has_battery: false,
    fuel_type: 'diesel',
    cargo_capacity_kg: 0,
    pallet_capacity: 0,
    home_facility_id: '',
    current_driver_id: ''
  })
  const [editing, setEditing] = useState(null)
  const [mapClickMode, setMapClickMode] = useState(false)
  const [tempMarker, setTempMarker] = useState(null)
  const [baseWeather, setBaseWeather] = useState({})
  const mapRef = useRef()

  useEffect(() => {
    fetchAssets()
    fetchBases()
    fetchFacilities()
    fetchDrivers()
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
    api.facilities()
      .then(setBases)
      .catch(err => console.error('Error fetching bases:', err))
  }

  const fetchFacilities = () => {
    api.facilities()
      .then(setFacilities)
      .catch(err => console.error('Error fetching facilities:', err))
  }

  const fetchDrivers = () => {
    api.drivers()
      .then(setDrivers)
      .catch(err => console.error('Error fetching drivers:', err))
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()

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
      registration_number: form.registration_number || null,
      vin: form.vin || null,
      make: form.make || null,
      model: form.model || null,
      year: form.year ? parseInt(form.year) : null,
      lat: parseFloat(form.lat),
      lon: parseFloat(form.lon),
      route: routeValue,
      route_index: parseInt(form.route_index) || 0,
      speed: parseFloat(form.speed) || 50,
      status: form.status,
      battery: parseFloat(form.battery) || 100,
      battery_drain: parseFloat(form.battery_drain) || 1,
      has_battery: !!form.has_battery,
      fuel_type: form.fuel_type,
      cargo_capacity_kg: form.cargo_capacity_kg ? parseFloat(form.cargo_capacity_kg) : null,
      pallet_capacity: form.pallet_capacity ? parseInt(form.pallet_capacity) : null,
      home_facility_id: form.home_facility_id || null,
      current_driver_id: form.current_driver_id || null
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
      registration_number: '',
      vin: '',
      make: '',
      model: '',
      year: 2024,
      lat: '',
      lon: '',
      route: '',
      route_index: 0,
      speed: 50,
      status: 'available',
      battery: 100,
      battery_drain: 1,
      has_battery: false,
      fuel_type: 'diesel',
      cargo_capacity_kg: 0,
      pallet_capacity: 0,
      home_facility_id: '',
      current_driver_id: ''
    })
    setEditing(null)
    setTempMarker(null)
    setMapClickMode(false)
  }

  const enableMapClickMode = () => {
    setMapClickMode(true)
    alert('Click anywhere on the map to select location!')
  }

  const centerMap = [62.0, 15.0]

  return (
    <div style={{ padding: 20 }}>
      <h2>Assets Administration</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h3>{editing ? 'Edit Asset' : 'Create New Asset'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label>Fordonstyp / Asset Type *</label>
              <select
                value={form.type}
                onChange={e => setForm({...form, type: e.target.value})}
                style={{ width: '100%', padding: 8 }}
                required
              >
                <optgroup label="🚗 Markfordon (Ground Vehicles)">
                  {ASSET_TYPES.filter(t => t.category === 'ground').map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </optgroup>
                <optgroup label="✈️ Flygplan (Aircraft)">
                  {ASSET_TYPES.filter(t => t.category === 'air').map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </optgroup>
                <optgroup label="⚓ Fartyg (Naval)">
                  {ASSET_TYPES.filter(t => t.category === 'naval').map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Registreringsnummer / Registration Number *</label>
              <input
                type="text"
                value={form.registration_number || ''}
                onChange={e => setForm({...form, registration_number: e.target.value})}
                placeholder="ABC 123"
                style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                required
              />
            </div>

            <div style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label>VIN</label>
                <input
                  type="text"
                  value={form.vin || ''}
                  onChange={e => setForm({...form, vin: e.target.value})}
                  placeholder="YV1CZ59H471234567"
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label>År / Year</label>
                <input
                  type="number"
                  value={form.year || 2024}
                  onChange={e => setForm({...form, year: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label>Märke / Make</label>
                <input
                  type="text"
                  value={form.make || ''}
                  onChange={e => setForm({...form, make: e.target.value})}
                  placeholder="Volvo"
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label>Modell / Model</label>
                <input
                  type="text"
                  value={form.model || ''}
                  onChange={e => setForm({...form, model: e.target.value})}
                  placeholder="FH16"
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label>Lastkapacitet / Cargo Capacity (kg)</label>
                <input
                  type="number"
                  value={form.cargo_capacity_kg || 0}
                  onChange={e => setForm({...form, cargo_capacity_kg: parseFloat(e.target.value)})}
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label>Pallkapacitet / Pallet Capacity</label>
                <input
                  type="number"
                  value={form.pallet_capacity || 0}
                  onChange={e => setForm({...form, pallet_capacity: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label>Hemstation / Home Facility</label>
                <select
                  value={form.home_facility_id || ''}
                  onChange={e => setForm({...form, home_facility_id: e.target.value})}
                  style={{ width: '100%', padding: 8 }}
                >
                  <option value="">Välj facility...</option>
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Tilldelad Förare / Assigned Driver</label>
                <select
                  value={form.current_driver_id || ''}
                  onChange={e => setForm({...form, current_driver_id: e.target.value})}
                  style={{ width: '100%', padding: 8 }}
                >
                  <option value="">Ingen förare...</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
                  ))}
                </select>
              </div>
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
                  <option value="available">Available (Tillgänglig)</option>
                  <option value="in_use">In Use (I bruk)</option>
                  <option value="parked">Parked (Parkerad)</option>
                  <option value="maintenance">Maintenance (Underhåll)</option>
                  <option value="out_of_service">Out of Service (Ur drift)</option>
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

              {bases.map(base => (
                <Marker
                  key={`base-${base.id}`}
                  position={[base.lat, base.lon]}
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
              ))}

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

      <div className="card">
        <h3>Existing Assets ({assets.length})</h3>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#1a1a1a' }}>
              <tr style={{ borderBottom: '1px solid #444' }}>
                <th style={{ padding: 8, textAlign: 'left' }}>Reg. No.</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Type</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Make/Model</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Location</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: 8, fontWeight: 'bold' }}>{asset.registration_number || 'N/A'}</td>
                  <td style={{ padding: 8 }}>{asset.type}</td>
                  <td style={{ padding: 8, fontSize: 11 }}>
                    {asset.make && asset.model ? `${asset.make} ${asset.model}` : asset.make || asset.model || 'N/A'}
                  </td>
                  <td style={{ padding: 8, fontSize: 11 }}>{Number(asset.lat).toFixed(4)}, {Number(asset.lon).toFixed(4)}</td>
                  <td style={{ padding: 8 }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: 3,
                      fontSize: 11,
                      background: asset.status === 'in_use' ? '#2ecc71' : asset.status === 'available' ? '#3498db' : asset.status === 'maintenance' ? '#f39c12' : asset.status === 'out_of_service' ? '#e74c3c' : '#95a5a6'
                    }}>
                      {asset.status}
                    </span>
                  </td>
                  <td style={{ padding: 8 }}>
                    <button
                      onClick={() => {
                        setEditing(asset.id)
                        setForm({
                          type: asset.type,
                          registration_number: asset.registration_number || '',
                          vin: asset.vin || '',
                          make: asset.make || '',
                          model: asset.model || '',
                          year: asset.year || 2024,
                          lat: asset.lat,
                          lon: asset.lon,
                          route: asset.route || '',
                          route_index: asset.route_index || 0,
                          speed: asset.speed,
                          status: asset.status,
                          battery: asset.battery,
                          battery_drain: asset.battery_drain || 1,
                          has_battery: asset.has_battery,
                          fuel_type: asset.fuel_type,
                          cargo_capacity_kg: asset.cargo_capacity_kg || 0,
                          pallet_capacity: asset.pallet_capacity || 0,
                          home_facility_id: asset.home_facility_id || '',
                          current_driver_id: asset.current_driver_id || ''
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