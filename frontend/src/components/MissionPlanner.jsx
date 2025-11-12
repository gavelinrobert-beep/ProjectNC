import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { api } from '../lib/api'
import 'leaflet/dist/leaflet.css'

const defaultCenter = [62.3901, 17.3062]

// Custom waypoint icon
const waypointIcon = (number) => L.divIcon({
  className: 'waypoint-marker',
  html: `<div style="
    background: #d2b48c;
    color: #0b1110;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 3px solid #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.5);
  ">${number}</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
})

// Map click handler component
function WaypointSelector({ enabled, onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (enabled) {
        onLocationSelect(e.latlng)
      }
    }
  })
  return null
}

export default function MissionPlanner() {
  const [missions, setMissions] = useState([])
  const [assets, setAssets] = useState([])
  const [selectedMission, setSelectedMission] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [addingWaypoints, setAddingWaypoints] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    asset_id: '',
    priority: 'medium',
    status: 'planned',
    waypoints: []
  })

  useEffect(() => {
    fetchMissions()
    fetchAssets()

    // Auto-refresh missions every 2 seconds to show progress
    const interval = setInterval(() => {
      fetchMissions()
      fetchAssets()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const fetchMissions = async () => {
    try {
      const data = await api.missions()
      setMissions(data || [])
    } catch (err) {
      console.error('Error fetching missions:', err)
    }
  }

  const fetchAssets = async () => {
    try {
      const data = await api.assets()
      setAssets(data || [])
    } catch (err) {
      console.error('Error fetching assets:', err)
    }
  }

  const handleAddWaypoint = (latlng) => {
    const newWaypoint = {
      lat: latlng.lat,
      lon: latlng.lng,
      name: `Waypoint ${form.waypoints.length + 1}`,
      action: 'patrol'
    }
    setForm(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, newWaypoint]
    }))
    alert(`Waypoint ${form.waypoints.length + 1} added: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`)
  }

  const handleRemoveWaypoint = (index) => {
    setForm(prev => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index)
    }))
  }

  const handleCreateMission = async (e) => {
    e.preventDefault()

    if (form.waypoints.length < 2) {
      alert('Mission must have at least 2 waypoints!')
      return
    }

    try {
      await api.createMission(form)
      alert('Mission created successfully!')
      resetForm()
      fetchMissions()
    } catch (err) {
      console.error('Error creating mission:', err)
      alert('Failed to create mission')
    }
  }

  const handleDeleteMission = async (id) => {
    if (!confirm('Delete this mission?')) return

    try {
      await api.deleteMission(id)
      alert('Mission deleted!')
      fetchMissions()
    } catch (err) {
      console.error('Error deleting mission:', err)
      alert('Failed to delete mission')
    }
  }

  const handleStartMission = async (id) => {
    try {
      await api.startMission(id)
      alert('Mission started!')
      fetchMissions()
    } catch (err) {
      console.error('Error starting mission:', err)
      alert('Failed to start mission')
    }
  }

  const handleCompleteMission = async (id) => {
    try {
      await api.completeMission(id)
      alert('Mission completed!')
      fetchMissions()
    } catch (err) {
      console.error('Error completing mission:', err)
      alert('Failed to complete mission')
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      asset_id: '',
      priority: 'medium',
      status: 'planned',
      waypoints: []
    })
    setIsCreating(false)
    setAddingWaypoints(false)
    setSelectedMission(null)
  }

  const getStatusColor = (status) => {
    const colors = {
      planned: '#4a90e2',
      active: '#3aa86f',
      completed: '#96a39a',
      cancelled: '#b5392f'
    }
    return colors[status] || '#666'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4a90e2',
      medium: '#d9b945',
      high: '#ff9800',
      critical: '#b5392f'
    }
    return colors[priority] || '#666'
  }

  // Calculate mission progress based on asset position
  const calculateMissionProgress = (mission) => {
    if (!mission || !mission.asset_id || mission.status !== 'active') {
      return { percent: 0, currentWaypoint: 0, totalWaypoints: mission?.waypoints?.length || 0 }
    }

    const asset = assets.find(a => a.id === mission.asset_id)
    if (!asset || !mission.waypoints || mission.waypoints.length === 0) {
      return { percent: 0, currentWaypoint: 0, totalWaypoints: mission.waypoints?.length || 0 }
    }

    // Calculate which waypoint the asset is closest to
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
    const percent = totalWaypoints > 1 ? (closestWaypointIndex / (totalWaypoints - 1)) * 100 : 0

    return {
      percent: Math.round(percent),
      currentWaypoint: closestWaypointIndex + 1,
      totalWaypoints: totalWaypoints
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Mission Planning & Routing</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Mission Form */}
        <div className="card">
          <h3>{isCreating ? 'Create New Mission' : 'Mission Planner'}</h3>

          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="btn"
              style={{ width: '100%', padding: 12, fontSize: 16 }}
            >
              ➕ Create New Mission
            </button>
          ) : (
            <form onSubmit={handleCreateMission}>
              <div style={{ marginBottom: 12 }}>
                <label>Mission Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g., Supply Run Alpha"
                  style={{ width: '100%', padding: 8 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Mission objectives and notes..."
                  style={{ width: '100%', padding: 8, minHeight: 60 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Assign Asset</label>
                <select
                  value={form.asset_id}
                  onChange={e => setForm({...form, asset_id: e.target.value})}
                  style={{ width: '100%', padding: 8 }}
                >
                  <option value="">-- No asset assigned --</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.id} ({asset.type})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label>Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({...form, priority: e.target.value})}
                    style={{ width: '100%', padding: 8 }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({...form, status: e.target.value})}
                    style={{ width: '100%', padding: 8 }}
                  >
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Waypoints ({form.waypoints.length})</label>
                <button
                  type="button"
                  onClick={() => setAddingWaypoints(!addingWaypoints)}
                  style={{
                    width: '100%',
                    padding: 10,
                    marginTop: 4,
                    background: addingWaypoints ? '#d9b945' : '#3498db',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {addingWaypoints ? '📍 Click map to add waypoints...' : '🗺️ Add Waypoints'}
                </button>

                {form.waypoints.length > 0 && (
                  <div style={{ marginTop: 8, maxHeight: 150, overflowY: 'auto' }}>
                    {form.waypoints.map((wp, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '4px 8px',
                          background: '#1a1a1a',
                          marginBottom: 4,
                          borderRadius: 4,
                          fontSize: 12
                        }}
                      >
                        <span>
                          {idx + 1}. {wp.name || 'Waypoint'} ({wp.lat.toFixed(4)}, {wp.lon.toFixed(4)})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveWaypoint(idx)}
                          style={{
                            padding: '2px 6px',
                            background: '#e74c3c',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 3,
                            cursor: 'pointer',
                            fontSize: 11
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn" style={{ flex: 1, background: '#3aa86f' }}>
                  Create Mission
                </button>
                <button type="button" onClick={resetForm} className="btn" style={{ background: '#95a5a6' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Map */}
        <div className="card">
          <h3>Mission Map</h3>
          <div style={{ height: 500, border: '2px solid #3498db', borderRadius: 4, overflow: 'hidden' }}>
            <MapContainer
              center={defaultCenter}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              <WaypointSelector enabled={addingWaypoints} onLocationSelect={handleAddWaypoint} />

              {/* Display waypoints for mission being created */}
              {form.waypoints.map((wp, idx) => (
                <Marker
                  key={`new-wp-${idx}`}
                  position={[wp.lat, wp.lon]}
                  icon={waypointIcon(idx + 1)}
                >
                  <Popup>
                    <strong>{wp.name || `Waypoint ${idx + 1}`}</strong><br />
                    Lat: {wp.lat.toFixed(6)}<br />
                    Lon: {wp.lon.toFixed(6)}
                  </Popup>
                </Marker>
              ))}

              {/* Display route line for new mission */}
              {form.waypoints.length > 1 && (
                <Polyline
                  positions={form.waypoints.map(wp => [wp.lat, wp.lon])}
                  color="#d2b48c"
                  weight={3}
                  opacity={0.7}
                  dashArray="10, 10"
                />
              )}

              {/* Display selected mission route */}
              {selectedMission && selectedMission.waypoints && (
                <>
                  {selectedMission.waypoints.map((wp, idx) => (
                    <Marker
                      key={`mission-wp-${idx}`}
                      position={[wp.lat, wp.lon]}
                      icon={waypointIcon(idx + 1)}
                    >
                      <Popup>
                        <strong>{wp.name || `Waypoint ${idx + 1}`}</strong><br />
                        Lat: {wp.lat.toFixed(6)}<br />
                        Lon: {wp.lon.toFixed(6)}
                      </Popup>
                    </Marker>
                  ))}
                  <Polyline
                    positions={selectedMission.waypoints.map(wp => [wp.lat, wp.lon])}
                    color={getStatusColor(selectedMission.status)}
                    weight={4}
                    opacity={0.8}
                  />
                </>
              )}

              {/* Display asset positions for active missions */}
              {assets.filter(a => missions.some(m => m.status === 'active' && m.asset_id === a.id)).map(asset => (
                <Marker
                  key={`asset-${asset.id}`}
                  position={[asset.lat, asset.lon]}
                  icon={L.divIcon({
                    className: 'asset-marker',
                    html: `<div style="
                      background: #3aa86f;
                      color: #fff;
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      border: 2px solid #fff;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-weight: bold;
                      font-size: 12px;
                      box-shadow: 0 2px 6px rgba(0,0,0,0.5);
                    ">${asset.type === 'plane' ? '✈️' : asset.type === 'helicopter' ? '🚁' : '🚗'}</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                  })}
                >
                  <Popup>
                    <strong>{asset.id}</strong><br />
                    Type: {asset.type}<br />
                    Status: {asset.status}<br />
                    Speed: {asset.speed} km/h
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#7f8c8d' }}>
            {addingWaypoints ? (
              <span style={{ color: '#d9b945', fontWeight: 'bold' }}>
                ⚡ Click anywhere on the map to add waypoints
              </span>
            ) : (
              <span>
                Click "Add Waypoints" button, then click on map to add mission waypoints
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Missions List */}
      <div className="card">
        <h3>All Missions ({missions.length})</h3>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#1a1a1a' }}>
              <tr style={{ borderBottom: '1px solid #444' }}>
                <th style={{ padding: 8, textAlign: 'left' }}>Name</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Asset</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Priority</th>
                <th style={{ padding: 8, textAlign: 'left', minWidth: 200 }}>Progress</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Distance</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Duration</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Fuel Est.</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {missions.map(mission => {
                const progress = calculateMissionProgress(mission)
                return (
                  <tr
                    key={mission.id}
                    style={{
                      borderBottom: '1px solid #333',
                      cursor: 'pointer',
                      background: selectedMission?.id === mission.id ? '#1e2a25' : 'transparent'
                    }}
                    onClick={() => setSelectedMission(mission)}
                  >
                    <td style={{ padding: 8 }}>
                      <strong>{mission.name}</strong>
                      {mission.description && (
                        <div style={{ fontSize: 10, color: '#96a39a' }}>
                          {mission.description.substring(0, 50)}...
                        </div>
                      )}
                    </td>
                    <td style={{ padding: 8, fontSize: 11 }}>{mission.asset_id || 'Unassigned'}</td>
                    <td style={{ padding: 8 }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: 3,
                        fontSize: 11,
                        background: getStatusColor(mission.status),
                        color: '#fff'
                      }}>
                        {mission.status}
                      </span>
                    </td>
                    <td style={{ padding: 8 }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: 3,
                        fontSize: 11,
                        background: getPriorityColor(mission.priority),
                        color: '#fff'
                      }}>
                        {mission.priority}
                      </span>
                    </td>
                    <td style={{ padding: 8 }}>
                      {mission.status === 'active' ? (
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 4
                          }}>
                            <div style={{
                              flex: 1,
                              height: 16,
                              background: '#2a2a2a',
                              borderRadius: 8,
                              overflow: 'hidden',
                              border: '1px solid #444'
                            }}>
                              <div style={{
                                width: `${progress.percent}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #3aa86f 0%, #4fc97f 100%)',
                                transition: 'width 0.5s ease',
                                borderRadius: 8
                              }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 'bold', color: '#3aa86f', minWidth: 40 }}>
                              {progress.percent}%
                            </span>
                          </div>
                          <div style={{ fontSize: 10, color: '#96a39a' }}>
                            Waypoint {progress.currentWaypoint}/{progress.totalWaypoints}
                          </div>
                        </div>
                      ) : mission.status === 'completed' ? (
                        <span style={{ fontSize: 11, color: '#96a39a' }}>✓ Complete</span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#666' }}>Not started</span>
                      )}
                    </td>
                    <td style={{ padding: 8 }}>{mission.total_distance_km ? `${mission.total_distance_km} km` : '-'}</td>
                    <td style={{ padding: 8 }}>{mission.estimated_duration_minutes ? `${mission.estimated_duration_minutes} min` : '-'}</td>
                    <td style={{ padding: 8 }}>{mission.estimated_fuel_consumption ? `${mission.estimated_fuel_consumption} L` : '-'}</td>
                    <td style={{ padding: 8 }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {mission.status === 'planned' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartMission(mission.id)
                            }}
                            style={{
                              padding: '4px 8px',
                              background: '#3aa86f',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 11
                            }}
                          >
                            Start
                          </button>
                        )}
                        {mission.status === 'active' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCompleteMission(mission.id)
                            }}
                            style={{
                              padding: '4px 8px',
                              background: '#4a90e2',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 11
                            }}
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteMission(mission.id)
                          }}
                          style={{
                            padding: '4px 8px',
                            background: '#e74c3c',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 11
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}