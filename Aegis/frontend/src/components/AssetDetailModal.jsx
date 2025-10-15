import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'

const ASSET_TYPE_ICONS = {
  vehicle: '🚗',
  truck: '🚚',
  uav: '🛸',
  helicopter: '🚁',
  plane: '✈️',
  ship: '🚢',
  patrol_boat: '⛵'
}

const STATUS_COLORS = {
  mobile: '#3aa86f',
  parked: '#d9b945',
  airborne: '#4a90e2',
  docked: '#9c27b0'
}

function getBatteryColor(battery) {
  if (battery <= 15) return '#b5392f'
  if (battery <= 30) return '#ff9800'
  if (battery <= 50) return '#d9b945'
  return '#3aa86f'
}

export default function AssetDetailModal({ asset, onClose }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!asset) return

    api.alerts().then(data => {
      const assetAlerts = (data || []).filter(a => a && a.asset_id === asset.id)
      setAlerts(assetAlerts)
      setLoading(false)
    }).catch(err => {
      console.error('Error fetching alerts:', err)
      setAlerts([])
      setLoading(false)
    })
  }, [asset])

  if (!asset) return null

  const icon = ASSET_TYPE_ICONS[asset.type] || '📦'
  const statusColor = STATUS_COLORS[asset.status] || '#666'
  const batteryColor = asset.has_battery && asset.battery !== null ? getBatteryColor(asset.battery) : '#999'

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: 8,
          width: '100%',
          maxWidth: 800,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: 20,
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#222'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>{icon}</span>
            <div>
              <h3 style={{ margin: 0 }}>{asset.id || 'Unknown'}</h3>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                {(asset.type || 'unknown').toUpperCase()}
              </div>
            </div>
          </div>
          <button className='btn' onClick={onClose} style={{ minWidth: 40, padding: '8px 12px' }}>
            ✕
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
            marginBottom: 20
          }}>
            <div className='card' style={{ background: '#222', border: '1px solid #333' }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Status</div>
              <div style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: statusColor,
                textTransform: 'capitalize'
              }}>
                {asset.status || 'Unknown'}
              </div>
            </div>

            <div className='card' style={{ background: '#222', border: '1px solid #333' }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Hastighet</div>
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                {((asset.speed || 0) * 100).toFixed(1)} km/h
              </div>
            </div>

            {asset.has_battery && asset.battery !== null && (
              <div className='card' style={{ background: '#222', border: '1px solid #333' }}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Batteri</div>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: batteryColor }}>
                  {asset.battery.toFixed(1)}%
                </div>
                <div style={{
                  width: '100%',
                  height: 6,
                  background: '#333',
                  borderRadius: 3,
                  marginTop: 8,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(0, asset.battery))}%`,
                    height: '100%',
                    background: batteryColor,
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            )}

            <div className='card' style={{ background: '#222', border: '1px solid #333' }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Bränsle</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize' }}>
                {asset.fuel_type || 'N/A'}
              </div>
            </div>
          </div>

          <div className='card' style={{ background: '#222', border: '1px solid #333', marginBottom: 20 }}>
            <h4 style={{ marginTop: 0 }}>📍 Position</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>Latitud</div>
                <div style={{ fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {(asset.lat || 0).toFixed(6)}°
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>Longitud</div>
                <div style={{ fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {(asset.lon || 0).toFixed(6)}°
                </div>
              </div>
            </div>
          </div>

          <div className='card' style={{ background: '#222', border: '1px solid #333', marginBottom: 20 }}>
            <h4 style={{ marginTop: 0 }}>🚨 Larmhistorik</h4>
            {loading ? (
              <div style={{ padding: 12, textAlign: 'center', color: '#999' }}>Laddar larm...</div>
            ) : alerts.length === 0 ? (
              <div style={{ padding: 12, textAlign: 'center', color: '#3aa86f' }}>✅ Inga larm registrerade</div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                <ul className='list'>
                  {alerts.slice(0, 10).map((alert, index) => {
                    if (!alert || !alert.id) return null
                    return (
                      <li key={alert.id || index} style={{
                        borderLeft: `4px solid ${alert.color || '#666'}`,
                        paddingLeft: 8,
                        marginBottom: 8,
                        opacity: alert.acknowledged ? 0.5 : 1
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 'bold' }}>
                          {alert.rule || 'Unknown Alert'}
                          {alert.acknowledged && <span style={{ marginLeft: 8, color: '#3aa86f' }}>✓</span>}
                        </div>
                        {alert.ts && (
                          <div className='muted' style={{ fontSize: 11 }}>
                            {new Date(alert.ts).toLocaleString('sv-SE')}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className='btn' onClick={onClose}>Stäng</button>
          </div>
        </div>
      </div>
    </div>
  )
}