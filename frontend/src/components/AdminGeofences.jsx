import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, FeatureGroup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import { api } from '../lib/api'
import BasesAdmin from './BasesAdmin'
import AssetsAdmin from './AssetsAdmin'

const defaultCenter = [62.3901, 17.3062]

export default function AdminGeofences() {
  const [geofences, setGeofences] = useState([])
  const [loading, setLoading] = useState(true)
  const [newGeofenceName, setNewGeofenceName] = useState('')
  const [newGeofencePoints, setNewGeofencePoints] = useState([])
  const [adminTab, setAdminTab] = useState('geofences')

  useEffect(() => {
    fetchGeofences()
  }, [])

  const fetchGeofences = () => {
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
        console.error('[AdminGeofences] Error fetching geofences:', err)
        setLoading(false)
      })
  }

  const handleCreateGeofence = () => {
    if (!newGeofenceName.trim()) {
      alert('Please enter a geofence name')
      return
    }
    if (newGeofencePoints.length < 3) {
      alert('A geofence needs at least 3 points')
      return
    }

    const payload = {
      id: `geofence-${Date.now()}`,
      name: newGeofenceName,
      polygon: newGeofencePoints
    }

    api.createGeofence(payload)
      .then(() => {
        alert('Geofence created!')
        setNewGeofenceName('')
        setNewGeofencePoints([])
        fetchGeofences()
      })
      .catch(err => {
        console.error('[AdminGeofences] Error creating geofence:', err)
        alert('Error creating geofence: ' + err.message)
      })
  }

  const handleDeleteGeofence = (id) => {
    if (!confirm(`Delete geofence ${id}?`)) return

    api.deleteGeofence(id)
      .then(() => {
        alert('Geofence deleted')
        fetchGeofences()
      })
      .catch(err => {
        console.error('[AdminGeofences] Error deleting geofence:', err)
        alert('Error deleting geofence: ' + err.message)
      })
  }

  const addPoint = () => {
    const lat = parseFloat(prompt('Enter latitude:'))
    const lon = parseFloat(prompt('Enter longitude:'))
    if (!isNaN(lat) && !isNaN(lon)) {
      setNewGeofencePoints([...newGeofencePoints, [lat, lon]])
    }
  }

  const removePoint = (index) => {
    setNewGeofencePoints(newGeofencePoints.filter((_, i) => i !== index))
  }

  const handleCreated = (e) => {
    const { layerType, layer } = e
    if (layerType === 'polygon') {
      const coords = layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng])
      setNewGeofencePoints(coords)
    }
  }

  if (loading) {
    return (
      <div className='content'>
        <h3>Administration</h3>
        <div style={{ padding: 12, background: '#d9b945', color: '#000', marginTop: 12 }}>
          Laddar...
        </div>
      </div>
    )
  }

  return (
    <div className='content'>
      <h3>Administration</h3>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className='btn'
          onClick={() => setAdminTab('geofences')}
          style={{
            backgroundColor: adminTab === 'geofences' ? '#3aa86f' : undefined,
            color: adminTab === 'geofences' ? '#fff' : undefined
          }}
        >
          📐 Geofences
        </button>
        <button
          className='btn'
          onClick={() => setAdminTab('bases')}
          style={{
            backgroundColor: adminTab === 'bases' ? '#3aa86f' : undefined,
            color: adminTab === 'bases' ? '#fff' : undefined
          }}
        >
          🏢 Baser
        </button>
        <button
          className='btn'
          onClick={() => setAdminTab('assets')}
          style={{
            backgroundColor: adminTab === 'assets' ? '#3aa86f' : undefined,
            color: adminTab === 'assets' ? '#fff' : undefined
          }}
        >
          📦 Tillgångar
        </button>
      </div>

      {/* Tab Content */}
      {adminTab === 'geofences' ? (
        <>
          {/* Geofence Creation */}
          <div className='card' style={{ marginBottom: 12 }}>
            <h4>Skapa Ny Geofence</h4>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
                Geofence Name:
              </label>
              <input
                type='text'
                placeholder='e.g. Stockholm Area'
                value={newGeofenceName}
                onChange={e => setNewGeofenceName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#222',
                  border: '1px solid #333',
                  borderRadius: 4,
                  color: '#fff'
                }}
              />
            </div>

            {/* Map with Drawing Controls */}
            <div style={{ height: '400px', width: '100%', marginBottom: 12, borderRadius: 8, overflow: 'hidden' }}>
              <MapContainer
                center={defaultCenter}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  attribution='&copy; OpenStreetMap contributors'
                />

                <FeatureGroup>
                  <EditControl
                    position='topright'
                    onCreated={handleCreated}
                    draw={{
                      rectangle: false,
                      circle: false,
                      circlemarker: false,
                      marker: false,
                      polyline: false,
                      polygon: {
                        allowIntersection: false,
                        shapeOptions: {
                          color: '#b89b52',
                          fillOpacity: 0.3
                        }
                      }
                    }}
                    edit={{
                      edit: false,
                      remove: false
                    }}
                  />
                </FeatureGroup>

                {/* Show existing geofences */}
                {geofences.map(g => (
                  Array.isArray(g.polygon) && g.polygon.length >= 3 && (
                    <Polygon
                      key={g.id}
                      positions={g.polygon}
                      pathOptions={{ color: '#b89b52', fillOpacity: 0.2, weight: 2 }}
                    />
                  )
                ))}

                {/* Show new geofence being created */}
                {newGeofencePoints.length >= 3 && (
                  <Polygon
                    positions={newGeofencePoints}
                    pathOptions={{ color: '#3aa86f', fillOpacity: 0.3, weight: 2 }}
                  />
                )}
              </MapContainer>
            </div>

            {/* Manual Point Entry (backup option) */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h5 style={{ margin: 0 }}>Points ({newGeofencePoints.length})</h5>
                <button className='btn' onClick={addPoint} style={{ fontSize: 12, padding: '6px 12px' }}>
                  Add Point Manually
                </button>
              </div>
              {newGeofencePoints.length > 0 && (
                <ul className='list' style={{ maxHeight: 150, overflowY: 'auto' }}>
                  {newGeofencePoints.map((pt, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace' }}>
                        [{pt[0].toFixed(6)}, {pt[1].toFixed(6)}]
                      </span>
                      <button
                        className='btn'
                        onClick={() => removePoint(i)}
                        style={{ fontSize: 11, padding: '4px 8px', background: '#b5392f' }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              className='btn'
              onClick={handleCreateGeofence}
              style={{ width: '100%', background: '#3aa86f' }}
              disabled={newGeofencePoints.length < 3 || !newGeofenceName.trim()}
            >
              Create Geofence
            </button>
          </div>

          {/* Existing Geofences */}
          <div className='card'>
            <h4>Existing Geofences ({geofences.length})</h4>
            {geofences.length === 0 ? (
              <div style={{ padding: 12, color: '#999', textAlign: 'center' }}>
                No geofences yet. Create one above!
              </div>
            ) : (
              <ul className='list'>
                {geofences.map(g => (
                  <li key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{g.name}</div>
                      <div className='muted' style={{ fontSize: 11 }}>
                        ID: {g.id} • {(g.polygon || []).length} points
                      </div>
                    </div>
                    <button
                      className='btn'
                      onClick={() => handleDeleteGeofence(g.id)}
                      style={{ fontSize: 11, padding: '6px 12px', background: '#b5392f' }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : adminTab === 'bases' ? (
        <BasesAdmin />
      ) : (
        <AssetsAdmin />
      )}
    </div>
  )
}
