import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
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

// Custom icon for new base marker
const newBaseIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
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

export default function BasesAdmin() {
  const [bases, setBases] = useState([])
  const [form, setForm] = useState({ name: '', type: 'logistics', lat: '', lon: '', capacity: 0 })
  const [editing, setEditing] = useState(null)
  const [mapClickMode, setMapClickMode] = useState(false)
  const [tempMarker, setTempMarker] = useState(null)
  const mapRef = useRef()

  useEffect(() => {
    fetchBases()
  }, [])

  const fetchBases = () => {
    api.facilities()
      .then(setBases)
      .catch(err => {
        console.error('Error fetching bases:', err)
        alert('Failed to load bases')
      })
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
    
    const baseData = {
      name: form.name,
      type: form.type,
      lat: parseFloat(form.lat),
      lon: parseFloat(form.lon),
      capacity: parseInt(form.capacity) || 0,
    }

    try {
      if (editing) {
        alert('Update functionality not available yet')
      } else {
        await api.createBase(baseData)
        alert('Base created!')
        resetForm()
        fetchBases()
      }
    } catch (err) {
      console.error('Error creating base:', err)
      alert(`Error: ${err.message}`)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this base?')) return
    try {
      await api.deleteBase(id)
      alert('Base deleted!')
      fetchBases()
    } catch (err) {
      console.error('Error deleting base:', err)
      alert(`Error: ${err.message}`)
    }
  }

  const resetForm = () => {
    setForm({ name: '', type: 'logistics', lat: '', lon: '', capacity: 0 })
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
      <h2>Bases Administration</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Form */}
        <div className="card">
          <h3>{editing ? 'Edit Base' : 'Create New Base'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label>Name</label>
              <input
                required
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Base name"
                style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
  <label>Type</label>
  <select
    value={form.type}
    onChange={e => setForm({...form, type: e.target.value})}
    style={{ width: '100%', padding: 8 }}
  >
    <option value="air_base">Air Base</option>
    <option value="naval_base">Naval Base</option>
    <option value="army_base">Army Base</option>
    <option value="command_center">Command Center</option>
    <option value="support_base">Support Base</option>
    <option value="logistics">Logistics</option>
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

            <div style={{ marginBottom: 12 }}>
              <label>Capacity</label>
              <input
                type="number"
                value={form.capacity}
                onChange={e => setForm({...form, capacity: e.target.value})}
                placeholder="0"
                style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn" style={{ flex: 1 }}>
                {editing ? 'Update' : 'Create'} Base
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
          <div style={{ height: 400, border: '2px solid #3498db', borderRadius: 4, overflow: 'hidden' }}>
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
              
              {/* Existing bases */}
              {bases.map(base => (
                <Marker key={base.id} position={[base.lat, base.lon]}>
                  <Popup>
                    <strong>{base.name}</strong><br />
                    Type: {base.type}<br />
                    Capacity: {base.capacity}
                  </Popup>
                </Marker>
              ))}

              {/* Temporary marker for new location */}
              {tempMarker && (
                <Marker position={[tempMarker.lat, tempMarker.lng]} icon={newBaseIcon}>
                  <Popup>
                    <strong>New Base Location</strong><br />
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
              <span>Click "Pick Location from Map" button, then click on map</span>
            )}
          </div>
        </div>
      </div>

      {/* Bases List */}
      <div className="card">
        <h3>Existing Bases ({bases.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>Name</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Type</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Location</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Capacity</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bases.map(base => (
              <tr key={base.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: 8 }}>{base.name}</td>
                <td style={{ padding: 8 }}>{base.type}</td>
                <td style={{ padding: 8, fontSize: 11 }}>{base.lat.toFixed(4)}, {base.lon.toFixed(4)}</td>
                <td style={{ padding: 8 }}>{base.capacity}</td>
                <td style={{ padding: 8 }}>
                  <button
                    onClick={() => handleDelete(base.id)}
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
  )
}
