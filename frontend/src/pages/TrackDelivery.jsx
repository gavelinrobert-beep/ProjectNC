// Week 1 Commercial MVP - Public Customer Tracking Page
// Swedish language, mobile-responsive, real-time driver tracking
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom truck icon
const truckIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#4A90E2">
      <path d="M18 18.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5m1.5-9l1.96 2.5H17V9.5M6 18.5a1.5 1.5 0 0 1-1.5-1.5A1.5 1.5 0 0 1 6 15.5A1.5 1.5 0 0 1 7.5 17A1.5 1.5 0 0 1 6 18.5M20 8h-3V4H3c-1.11 0-2 .89-2 2v11h2a3 3 0 0 0 3 3a3 3 0 0 0 3-3h6a3 3 0 0 0 3 3a3 3 0 0 0 3-3h2v-5l-3-4Z"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
})

export default function TrackDelivery() {
  const { deliveryId } = useParams()
  const [delivery, setDelivery] = useState(null)
  const [driverLocation, setDriverLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [eventSource, setEventSource] = useState(null)

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // Fetch delivery details
  useEffect(() => {
    fetchDelivery()
    const interval = setInterval(fetchDelivery, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [deliveryId])

  // Setup SSE for real-time location
  useEffect(() => {
    if (!delivery) return

    const es = new EventSource(`${API_BASE}/track/${deliveryId}/live`)
    
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'location' && data.lat && data.lon) {
          setDriverLocation({
            lat: data.lat,
            lon: data.lon,
            speed: data.speed,
            heading: data.heading,
            timestamp: data.timestamp
          })
        } else if (data.type === 'status_update') {
          // Refresh delivery data on status update
          fetchDelivery()
        }
      } catch (e) {
        console.error('SSE parse error:', e)
      }
    }

    es.onerror = (err) => {
      console.error('SSE error:', err)
      es.close()
    }

    setEventSource(es)

    return () => {
      es.close()
    }
  }, [delivery])

  const fetchDelivery = async () => {
    try {
      const response = await fetch(`${API_BASE}/track/${deliveryId}`)
      if (!response.ok) {
        throw new Error('Leverans hittades inte')
      }
      const data = await response.json()
      setDelivery(data)
      
      // Set initial driver location
      if (data.vehicle && data.vehicle.current_lat) {
        setDriverLocation({
          lat: data.vehicle.current_lat,
          lon: data.vehicle.current_lon
        })
      }
      
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      'planned': 'Planerad',
      'assigned': 'Tilldelad',
      'picked_up': 'Upphämtad',
      'in_transit': 'På väg',
      'in_progress': 'På väg',
      'completed': 'Levererad',
      'delivered': 'Levererad',
      'cancelled': 'Avbruten',
      'failed': 'Misslyckad'
    }
    return labels[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      'planned': '#9CA3AF',
      'assigned': '#60A5FA',
      'picked_up': '#F59E0B',
      'in_transit': '#F59E0B',
      'in_progress': '#F59E0B',
      'completed': '#10B981',
      'delivered': '#10B981',
      'cancelled': '#EF4444',
      'failed': '#EF4444'
    }
    return colors[status] || '#9CA3AF'
  }

  const getStatusIcon = (status) => {
    const icons = {
      'planned': '📋',
      'assigned': '👤',
      'picked_up': '📦',
      'in_transit': '🚚',
      'in_progress': '🚚',
      'completed': '✅',
      'delivered': '✅',
      'cancelled': '❌',
      'failed': '❌'
    }
    return icons[status] || '📋'
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '3rem' }}>📦</div>
        <div style={{ fontSize: '1.2rem', color: '#556B7C' }}>Laddar leveransinformation...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem'
      }}>
        <div style={{ fontSize: '3rem' }}>❌</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#DC2626' }}>Något gick fel</div>
        <div style={{ fontSize: '1rem', color: '#556B7C' }}>{error}</div>
      </div>
    )
  }

  const waypoints = delivery?.waypoints || []
  const startPoint = waypoints.length > 0 ? waypoints[0] : null
  const endPoint = waypoints.length > 1 ? waypoints[waypoints.length - 1] : null
  const mapCenter = driverLocation 
    ? [driverLocation.lat, driverLocation.lon]
    : (startPoint ? [startPoint.lat, startPoint.lon] : [62.3908, 17.3069]) // Sundsvall default

  const routeCoordinates = waypoints.map(wp => [wp.lat, wp.lon])

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#F9FAFB'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '1rem 1.5rem',
        borderBottom: '2px solid #E5E7EB',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1F2937' }}>
            📦 Spåra din leverans
          </h1>
          <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>
            Spårningsnummer: <strong>{deliveryId}</strong>
          </div>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: window.innerWidth > 768 ? 'row' : 'column'
      }}>
        {/* Map Section */}
        <div style={{ 
          flex: window.innerWidth > 768 ? '1' : 'none',
          height: window.innerWidth > 768 ? '100%' : '300px',
          position: 'relative'
        }}>
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            {/* Route polyline */}
            {routeCoordinates.length > 0 && (
              <Polyline positions={routeCoordinates} color="#4A90E2" weight={4} opacity={0.6} />
            )}
            
            {/* Start marker */}
            {startPoint && (
              <Marker position={[startPoint.lat, startPoint.lon]}>
                <Popup>
                  <strong>Upphämtning</strong><br />
                  {startPoint.address || 'Start'}
                </Popup>
              </Marker>
            )}
            
            {/* End marker */}
            {endPoint && (
              <Marker position={[endPoint.lat, endPoint.lon]}>
                <Popup>
                  <strong>Leveransadress</strong><br />
                  {endPoint.address || 'Destination'}
                </Popup>
              </Marker>
            )}
            
            {/* Driver location */}
            {driverLocation && (
              <Marker 
                position={[driverLocation.lat, driverLocation.lon]} 
                icon={truckIcon}
              >
                <Popup>
                  <strong>🚚 Förare</strong><br />
                  {delivery.driver && `${delivery.driver.first_name} ${delivery.driver.last_name}`}<br />
                  {driverLocation.speed && `Hastighet: ${Math.round(driverLocation.speed)} km/h`}
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Live indicator */}
          {driverLocation && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: '#10B981',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              zIndex: 1000
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: 'white',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
              LIVE
            </div>
          )}
        </div>

        {/* Details Section */}
        <div style={{ 
          width: window.innerWidth > 768 ? '400px' : '100%',
          background: 'white',
          padding: '1.5rem',
          overflow: 'auto'
        }}>
          {/* Status Badge */}
          <div style={{
            background: getStatusColor(delivery.status),
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '1.125rem',
            fontWeight: 'bold'
          }}>
            {getStatusIcon(delivery.status)} {getStatusLabel(delivery.status)}
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#374151' }}>
              Status
            </h3>
            <div style={{ position: 'relative', paddingLeft: '2rem' }}>
              {[
                { key: 'created', label: 'Skapad', time: delivery.created_at, active: true },
                { key: 'picked_up', label: 'Upphämtad', time: delivery.picked_up_at, active: delivery.picked_up_at },
                { key: 'in_transit', label: 'På väg', time: null, active: ['in_transit', 'in_progress'].includes(delivery.status) },
                { key: 'delivered', label: 'Levererad', time: delivery.delivered_at, active: delivery.delivered_at }
              ].map((item, index) => (
                <div key={item.key} style={{ marginBottom: '1rem', position: 'relative' }}>
                  {/* Timeline line */}
                  {index < 3 && (
                    <div style={{
                      position: 'absolute',
                      left: '-1.5rem',
                      top: '1.5rem',
                      width: '2px',
                      height: '100%',
                      background: item.active ? '#4A90E2' : '#E5E7EB'
                    }} />
                  )}
                  
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-1.75rem',
                    top: '0.25rem',
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    background: item.active ? '#4A90E2' : '#E5E7EB',
                    border: '2px solid white',
                    boxShadow: '0 0 0 2px ' + (item.active ? '#4A90E2' : '#E5E7EB')
                  }} />
                  
                  <div style={{ fontSize: '0.875rem', fontWeight: item.active ? 'bold' : 'normal', color: item.active ? '#1F2937' : '#9CA3AF' }}>
                    {item.label}
                  </div>
                  {item.time && (
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      {new Date(item.time).toLocaleString('sv-SE')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#374151' }}>
              Leveransinformation
            </h3>
            <div style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#6B7280' }}>
              {delivery.name && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Beskrivning:</strong> {delivery.name}
                </div>
              )}
              {delivery.estimated_duration_minutes && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Beräknad tid:</strong> {delivery.estimated_duration_minutes} min
                </div>
              )}
              {startPoint && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Upphämtning:</strong><br />
                  {startPoint.address || `${startPoint.lat.toFixed(4)}, ${startPoint.lon.toFixed(4)}`}
                </div>
              )}
              {endPoint && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Leverans:</strong><br />
                  {endPoint.address || `${endPoint.lat.toFixed(4)}, ${endPoint.lon.toFixed(4)}`}
                </div>
              )}
            </div>
          </div>

          {/* Vehicle & Driver */}
          {(delivery.vehicle || delivery.driver) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#374151' }}>
                Fordon & Förare
              </h3>
              <div style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#6B7280' }}>
                {delivery.vehicle && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Fordon:</strong> {delivery.vehicle.registration} ({delivery.vehicle.type})
                  </div>
                )}
                {delivery.driver && (
                  <div>
                    <strong>Förare:</strong> {delivery.driver.first_name} {delivery.driver.last_name}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Proof of Delivery */}
          {delivery.delivered_at && (
            <div style={{ 
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#F0FDF4',
              borderRadius: '0.5rem',
              border: '1px solid #BBF7D0'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#15803D' }}>
                ✅ Leveransbevis
              </h3>
              {delivery.delivered_to && (
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#166534' }}>
                  <strong>Mottagare:</strong> {delivery.delivered_to}
                </div>
              )}
              {delivery.delivered_at && (
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#166534' }}>
                  <strong>Levererad:</strong> {new Date(delivery.delivered_at).toLocaleString('sv-SE')}
                </div>
              )}
              {delivery.signature_image && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#166534' }}>
                    Signatur:
                  </div>
                  <img 
                    src={delivery.signature_image} 
                    alt="Signatur" 
                    style={{ 
                      width: '100%', 
                      border: '1px solid #BBF7D0', 
                      borderRadius: '0.25rem',
                      background: 'white'
                    }} 
                  />
                </div>
              )}
              {delivery.driver_notes && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#166534' }}>
                  <strong>Anteckningar:</strong> {delivery.driver_notes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
