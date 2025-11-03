import React from 'react'

export default function AssetDetailModal({ asset, onClose }) {
  if (!asset) return null

  const getFuelColor = (level) => {
    if (level < 15) return '#b5392f'
    if (level < 30) return '#ff9800'
    if (level < 50) return '#d9b945'
    return '#3aa86f'
  }

  const getMaintenanceColor = (status) => {
    if (status === 'under_maintenance') return '#ff9800'
    if (status === 'needs_maintenance') return '#d9b945'
    return '#3aa86f'
  }

  const maintenancePercent = asset.operating_hours && asset.maintenance_hours
    ? Math.min(100, (asset.operating_hours / asset.maintenance_hours) * 100)
    : 0

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#1a1a1a',
        padding: 24,
        borderRadius: 8,
        maxWidth: 600,
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        border: '2px solid #333'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Asset Details: {asset.id}</h3>
          <button onClick={onClose} style={{ padding: '4px 12px' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          {/* Basic Info */}
          <div className='card' style={{ background: '#222' }}>
            <h4>Basic Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
              <div><strong>Type:</strong> {asset.type}</div>
              <div><strong>Status:</strong> {asset.status}</div>
              <div><strong>Speed:</strong> {asset.speed} km/h</div>
              <div><strong>Fuel Type:</strong> {asset.fuel_type}</div>
              <div><strong>Position:</strong> {asset.lat?.toFixed(4)}, {asset.lon?.toFixed(4)}</div>
            </div>
          </div>

          {/* Fuel Status */}
          <div className='card' style={{ background: '#222' }}>
            <h4>⛽ Fuel Status</h4>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Fuel Level</span>
                <span style={{ color: getFuelColor(asset.fuel_level || 100) }}>
                  {(asset.fuel_level || 100).toFixed(1)}%
                </span>
              </div>
              <div style={{
                height: 20,
                background: '#2a2a2a',
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid #444'
              }}>
                <div style={{
                  width: `${asset.fuel_level || 100}%`,
                  height: '100%',
                  background: getFuelColor(asset.fuel_level || 100),
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>
              <div>Capacity: {asset.fuel_capacity || 1000} L</div>
              <div>Consumption: {asset.fuel_consumption_rate || 1.0} L/km</div>
            </div>
          </div>

          {/* Maintenance Status */}
          <div className='card' style={{ background: '#222' }}>
            <h4>🔧 Maintenance Status</h4>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Operating Hours</span>
                <span style={{ color: getMaintenanceColor(asset.maintenance_status) }}>
                  {(asset.operating_hours || 0).toFixed(1)} / {asset.maintenance_hours || 100} hrs
                </span>
              </div>
              <div style={{
                height: 20,
                background: '#2a2a2a',
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid #444'
              }}>
                <div style={{
                  width: `${maintenancePercent}%`,
                  height: '100%',
                  background: maintenancePercent > 80 ? '#b5392f' : maintenancePercent > 60 ? '#d9b945' : '#3aa86f',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
            <div style={{
              padding: 8,
              background: asset.maintenance_status === 'needs_maintenance' ? '#3a2f1f' : '#1f3a2f',
              borderRadius: 4,
              fontSize: 12
            }}>
              <strong>Status:</strong> {
                asset.maintenance_status === 'under_maintenance' ? '🛠️ Under Maintenance' :
                asset.maintenance_status === 'needs_maintenance' ? '⚠️ Maintenance Required' :
                '✅ Operational'
              }
            </div>
          </div>

          {/* Battery (if applicable) */}
          {asset.has_battery && (
            <div className='card' style={{ background: '#222' }}>
              <h4>🔋 Battery Status</h4>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Battery Level</span>
                  <span>{asset.battery}%</span>
                </div>
                <div style={{
                  height: 20,
                  background: '#2a2a2a',
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '1px solid #444'
                }}>
                  <div style={{
                    width: `${asset.battery}%`,
                    height: '100%',
                    background: asset.battery < 15 ? '#b5392f' : asset.battery < 30 ? '#ff9800' : '#3aa86f',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}