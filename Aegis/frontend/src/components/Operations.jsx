import React, { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Polygon, Popup, CircleMarker } from 'react-leaflet'
import { api } from '../lib/api'
import { useSSE } from '../hooks/useSSE'

const defaultCenter = [62.3901, 17.3062]

export default function Operations() {
  const [geofences, setGeofences] = useState([])
  const [assets, setAssets] = useState([])

  // Memoize the callback to prevent useSSE from re-running on every render
  const handleAssetUpdate = useCallback((data) => {
    if (data && Array.isArray(data)) {
      setAssets(data)
    }
  }, [])

  useSSE('/stream/assets', handleAssetUpdate)

  useEffect(() => {
    console.log('[Operations] Fetching geofences...')
    api.geofences()
      .then(data => {
        console.log('[Operations] Geofences received:', data)
        setGeofences(data || [])
      })
      .catch(err => {
        console.error('[Operations] Error fetching geofences:', err)
        setGeofences([])
      })
  }, [])

  const parsedGeofences = geofences.map(g => {
    let polygon = []
    try {
      if (Array.isArray(g.polygon)) {
        polygon = g.polygon
      } else if (typeof g.polygon === 'string') {
        polygon = JSON.parse(g.polygon)
      }
    } catch (err) {
      console.error(`[Operations] Error parsing polygon for geofence ${g.id}:`, err)
    }
    return { ...g, polygon }
  })

  console.log('[Operations] Parsed geofences:', parsedGeofences)
  console.log('[Operations] Assets:', assets)

  return (
    <div className='content'>
      <h3>Operationer</h3>
      <div style={{ height: '70vh', width: '100%', marginTop: 12 }}>
        <MapContainer
          center={defaultCenter}
          zoom={11}
          style={{ height: '100%', width: '100%', borderRadius: 12, zIndex: 1 }}
        >
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Render geofences */}
          {parsedGeofences.map(g => (
            Array.isArray(g.polygon) && g.polygon.length > 2 ? (
              <Polygon
                key={g.id}
                positions={g.polygon}
                pathOptions={{ color: '#b89b52', fillOpacity: 0.2 }}
              >
                <Popup>
                  <b>{g.name}</b><br />
                  <span className='muted'>{g.id}</span>
                </Popup>
              </Polygon>
            ) : null
          ))}

          {/* Render assets */}
          {assets.map(asset => (
            <CircleMarker
              key={asset.id}
              center={[asset.lat, asset.lon]}
              radius={8}
              pathOptions={{
                color: asset.type === 'uav' ? '#3aa86f' : asset.type === 'vehicle' ? '#4a90e2' : '#e24a4a',
                fillColor: asset.type === 'uav' ? '#3aa86f' : asset.type === 'vehicle' ? '#4a90e2' : '#e24a4a',
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <b>{asset.id}</b><br />
                <span className='muted'>Type: {asset.type}</span><br />
                <span className='muted'>Lat: {asset.lat.toFixed(4)}, Lon: {asset.lon.toFixed(4)}</span>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
        <div className='card'>
          <h4>Tillgångar ({assets.length})</h4>
          <ul className='list'>
            {assets.map(a => (
              <li key={a.id}>
                <span><b>{a.id}</b> — {a.type}</span>
                <span className='muted' style={{ fontSize: 12 }}>
                  {a.lat.toFixed(4)}, {a.lon.toFixed(4)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className='card'>
          <h4>Geofences ({parsedGeofences.length})</h4>
          <ul className='list'>
            {parsedGeofences.map(g => (
              <li key={g.id}>
                <span><b>{g.id}</b> — {g.name}</span>
                <span className='muted' style={{ fontSize: 12 }}>
                  {g.polygon.length} punkter
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
