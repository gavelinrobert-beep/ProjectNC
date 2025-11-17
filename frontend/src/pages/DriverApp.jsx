// Week 1 Commercial MVP - Driver Mobile App
// Swedish language, mobile-optimized, signature capture, GPS tracking
import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function DriverApp() {
  const [screen, setScreen] = useState('login') // login, deliveries, detail, signature
  const [pin, setPin] = useState('')
  const [driver, setDriver] = useState(null)
  const [deliveries, setDeliveries] = useState([])
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [signature, setSignature] = useState(null)
  const [deliveredTo, setDeliveredTo] = useState('')
  const [driverNotes, setDriverNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [locationTracking, setLocationTracking] = useState(null)
  
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // Start GPS tracking when logged in
  useEffect(() => {
    if (!driver || !selectedDelivery) return

    const watchId = navigator.geolocation?.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
          accuracy: position.coords.accuracy
        }
        setLocationTracking(location)
        
        // Send location update every 30 seconds
        sendLocationUpdate(location)
      },
      (error) => {
        console.error('GPS error:', error)
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    )

    return () => {
      if (watchId) navigator.geolocation?.clearWatch(watchId)
    }
  }, [driver, selectedDelivery])

  const sendLocationUpdate = async (location) => {
    if (!selectedDelivery) return
    
    try {
      await fetch(`${API_BASE}/api/driver/update-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_id: selectedDelivery.id,
          ...location
        })
      })
    } catch (err) {
      console.error('Location update failed:', err)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/driver/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        setError(data.message || 'Inloggning misslyckades')
        setLoading(false)
        return
      }

      setDriver(data)
      await fetchDeliveries(data.vehicle_id)
      setScreen('deliveries')
    } catch (err) {
      setError('Anslutningsfel. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  const fetchDeliveries = async (vehicleId) => {
    try {
      const response = await fetch(`${API_BASE}/api/driver/deliveries/${vehicleId}`)
      const data = await response.json()
      setDeliveries(data.deliveries || [])
    } catch (err) {
      console.error('Failed to fetch deliveries:', err)
    }
  }

  const handleUpdateStatus = async (status) => {
    setLoading(true)
    setError(null)

    try {
      const payload = {
        delivery_id: selectedDelivery.id,
        status,
        driver_notes: driverNotes || null
      }

      if (status === 'delivered') {
        payload.signature_image = signature
        payload.delivered_to = deliveredTo
      }

      const response = await fetch(`${API_BASE}/api/driver/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        // Refresh deliveries
        await fetchDeliveries(driver.vehicle_id)
        setScreen('deliveries')
        setSelectedDelivery(null)
        setSignature(null)
        setDeliveredTo('')
        setDriverNotes('')
      } else {
        setError('Statusuppdatering misslyckades')
      }
    } catch (err) {
      setError('Anslutningsfel. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  // Signature canvas handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const y = (e.clientY || e.touches[0].clientY) - rect.top
    
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
    isDrawing.current = true
  }

  const draw = (e) => {
    if (!isDrawing.current) return
    e.preventDefault()
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const y = (e.clientY || e.touches[0].clientY) - rect.top
    
    const ctx = canvas.getContext('2d')
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    isDrawing.current = false
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignature(null)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/png')
    setSignature(dataUrl)
    setScreen('detail')
  }

  const getStatusColor = (status) => {
    const colors = {
      'planned': '#9CA3AF',
      'assigned': '#60A5FA',
      'picked_up': '#F59E0B',
      'in_transit': '#F59E0B',
      'in_progress': '#F59E0B',
      'completed': '#10B981'
    }
    return colors[status] || '#9CA3AF'
  }

  const getStatusLabel = (status) => {
    const labels = {
      'planned': 'Planerad',
      'assigned': 'Tilldelad',
      'picked_up': 'Upphämtad',
      'in_transit': 'På väg',
      'in_progress': 'Pågår',
      'completed': 'Klar'
    }
    return labels[status] || status
  }

  // LOGIN SCREEN
  if (screen === 'login') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚚</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>
              Förare App
            </h1>
            <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>
              Logga in med din PIN-kod
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 'bold', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                PIN-kod (4 siffror)
              </label>
              <input
                type="text"
                inputMode="text"
                maxLength={10}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="0000"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  border: '2px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  letterSpacing: '0.5rem'
                }}
                autoFocus
                required
              />
            </div>

            {error && (
              <div style={{
                padding: '0.75rem',
                background: '#FEE2E2',
                color: '#DC2626',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || pin.length === 0}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                color: 'white',
                background: pin.length > 0 ? '#4A90E2' : '#9CA3AF',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: pin.length > 0 ? 'pointer' : 'not-allowed',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Loggar in...' : 'Logga in'}
            </button>
          </form>

          <div style={{ 
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#F9FAFB',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            color: '#6B7280',
            textAlign: 'center'
          }}>
            💡 Demo: Använd sista 4 siffrorna i fordonets ID<br />
            (t.ex. "0001" för VEH-SND-01)
          </div>
        </div>
      </div>
    )
  }

  // DELIVERIES LIST SCREEN
  if (screen === 'deliveries') {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
        {/* Header */}
        <div style={{ 
          background: '#4A90E2',
          color: 'white',
          padding: '1rem 1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                👋 Hej {driver.driver_name}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                {driver.vehicle_registration}
              </div>
            </div>
            <button
              onClick={() => {
                setDriver(null)
                setScreen('login')
              }}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Logga ut
            </button>
          </div>
        </div>

        {/* Deliveries */}
        <div style={{ padding: '1rem' }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>
              Dagens leveranser
            </h2>
            <button
              onClick={() => fetchDeliveries(driver.vehicle_id)}
              style={{
                padding: '0.5rem 1rem',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              🔄 Uppdatera
            </button>
          </div>

          {deliveries.length === 0 ? (
            <div style={{
              background: 'white',
              padding: '3rem 2rem',
              borderRadius: '0.5rem',
              textAlign: 'center',
              color: '#6B7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Inga leveranser
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                Du har inga leveranser tilldelade idag
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {deliveries.map(delivery => (
                <button
                  key={delivery.id}
                  onClick={() => {
                    setSelectedDelivery(delivery)
                    setScreen('detail')
                  }}
                  style={{
                    background: 'white',
                    border: '2px solid #E5E7EB',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4A90E2'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(74,144,226,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ 
                      fontSize: '1rem', 
                      fontWeight: 'bold',
                      color: '#1F2937'
                    }}>
                      {delivery.name || `Leverans ${delivery.id.slice(0, 8)}`}
                    </div>
                    <div style={{
                      padding: '0.25rem 0.75rem',
                      background: getStatusColor(delivery.status),
                      color: 'white',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {getStatusLabel(delivery.status)}
                    </div>
                  </div>
                  
                  {delivery.description && (
                    <div style={{ 
                      fontSize: '0.875rem',
                      color: '#6B7280',
                      marginBottom: '0.5rem'
                    }}>
                      {delivery.description}
                    </div>
                  )}
                  
                  {delivery.scheduled_start && (
                    <div style={{ 
                      fontSize: '0.875rem',
                      color: '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🕐 {new Date(delivery.scheduled_start).toLocaleString('sv-SE', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // DELIVERY DETAIL SCREEN
  if (screen === 'detail' && selectedDelivery) {
    const waypoints = selectedDelivery.waypoints || []
    const startPoint = waypoints[0]
    const endPoint = waypoints[waypoints.length - 1]
    const mapCenter = startPoint ? [startPoint.lat, startPoint.lon] : [62.3908, 17.3069]

    const canPickup = ['planned', 'assigned'].includes(selectedDelivery.status)
    const canDeliver = ['picked_up', 'in_transit', 'in_progress'].includes(selectedDelivery.status)
    const isCompleted = selectedDelivery.status === 'completed'

    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ 
          background: '#4A90E2',
          color: 'white',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <button
            onClick={() => {
              setSelectedDelivery(null)
              setScreen('deliveries')
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            ←
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
              {selectedDelivery.name || 'Leveransdetaljer'}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              {selectedDelivery.id.slice(0, 12)}
            </div>
          </div>
        </div>

        {/* Map */}
        <div style={{ height: '250px', position: 'relative' }}>
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {waypoints.map((wp, idx) => (
              <Marker key={idx} position={[wp.lat, wp.lon]}>
                <Popup>{wp.address || `Punkt ${idx + 1}`}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Details */}
        <div style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
              Status
            </h3>
            <div style={{
              padding: '0.75rem',
              background: getStatusColor(selectedDelivery.status),
              color: 'white',
              borderRadius: '0.5rem',
              textAlign: 'center',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}>
              {getStatusLabel(selectedDelivery.status)}
            </div>
          </div>

          {startPoint && (
            <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                📍 Upphämtning
              </h3>
              <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                {startPoint.address || `${startPoint.lat.toFixed(4)}, ${startPoint.lon.toFixed(4)}`}
              </div>
            </div>
          )}

          {endPoint && (
            <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                🏁 Leverans
              </h3>
              <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                {endPoint.address || `${endPoint.lat.toFixed(4)}, ${endPoint.lon.toFixed(4)}`}
              </div>
            </div>
          )}

          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Anteckningar
            </label>
            <textarea
              value={driverNotes}
              onChange={(e) => setDriverNotes(e.target.value)}
              placeholder="Lägg till anteckningar..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '0.75rem',
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                resize: 'vertical'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '1rem',
              background: '#FEE2E2',
              color: '#DC2626',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          {!isCompleted && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {canPickup && (
                <button
                  onClick={() => handleUpdateStatus('picked_up')}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    color: 'white',
                    background: '#F59E0B',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  📦 Markera som upphämtad
                </button>
              )}

              {canDeliver && !signature && (
                <button
                  onClick={() => setScreen('signature')}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    color: 'white',
                    background: '#10B981',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  ✅ Markera som levererad
                </button>
              )}

              {canDeliver && signature && (
                <button
                  onClick={() => handleUpdateStatus('delivered')}
                  disabled={loading || !deliveredTo}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    color: 'white',
                    background: deliveredTo ? '#10B981' : '#9CA3AF',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: deliveredTo ? 'pointer' : 'not-allowed',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Sparar...' : '✅ Bekräfta leverans med signatur'}
                </button>
              )}
            </div>
          )}

          {isCompleted && (
            <div style={{
              padding: '1.5rem',
              background: '#F0FDF4',
              borderRadius: '0.75rem',
              textAlign: 'center',
              color: '#15803D',
              fontSize: '1.125rem',
              fontWeight: 'bold'
            }}>
              ✅ Leverans slutförd
            </div>
          )}
        </div>
      </div>
    )
  }

  // SIGNATURE CAPTURE SCREEN
  if (screen === 'signature') {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          background: '#4A90E2',
          color: 'white',
          padding: '1rem 1.5rem'
        }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
            Signatur krävs
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            Be mottagaren signera nedan
          </div>
        </div>

        <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Mottagarens namn *
            </label>
            <input
              type="text"
              value={deliveredTo}
              onChange={(e) => setDeliveredTo(e.target.value)}
              placeholder="Ange mottagarens namn"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                Signatur *
              </div>
              <button
                onClick={clearSignature}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Rensa
              </button>
            </div>
            
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{
                border: '2px dashed #E5E7EB',
                borderRadius: '0.5rem',
                width: '100%',
                height: '200px',
                cursor: 'crosshair',
                touchAction: 'none'
              }}
            />
            
            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.5rem', textAlign: 'center' }}>
              Skriv mottagarens signatur här
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setScreen('detail')}
              style={{
                flex: 1,
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#374151',
                background: 'white',
                border: '2px solid #E5E7EB',
                borderRadius: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Avbryt
            </button>
            <button
              onClick={saveSignature}
              disabled={!deliveredTo}
              style={{
                flex: 1,
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'white',
                background: deliveredTo ? '#10B981' : '#9CA3AF',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: deliveredTo ? 'pointer' : 'not-allowed'
              }}
            >
              Spara signatur
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
