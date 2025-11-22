import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { formatDateTime } from '../shared/utils'

const SEVERITY_COLORS = {
  critical: '#b5392f',
  high: '#e24a4a',
  medium: '#d9b945',
  low: '#2196f3',
  info: '#3aa86f'
}

const SEVERITY_LEVELS = ['critical', 'high', 'medium', 'low', 'info']

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [showAcknowledged, setShowAcknowledged] = useState(false)
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, severity

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = () => {
    api.alerts()
      .then(data => {
        setAlerts(data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching alerts:', err)
        setLoading(false)
      })
  }

  const handleAckAlert = (alertId) => {
    api.ackAlert(alertId)
      .then(() => fetchAlerts())
      .catch(err => console.error('Error acknowledging alert:', err))
  }

  // Filter and sort alerts
  const filteredAlerts = alerts
    .filter(alert => {
      // Search filter
      if (searchTerm && !alert.asset_id?.toLowerCase().includes(searchTerm.toLowerCase())
          && !alert.rule?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Severity filter
      if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) {
        return false
      }

      // Acknowledged filter
      if (!showAcknowledged && alert.acknowledged) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.ts) - new Date(a.ts)
      } else if (sortBy === 'oldest') {
        return new Date(a.ts) - new Date(b.ts)
      } else if (sortBy === 'severity') {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
        return (severityOrder[a.severity] || 5) - (severityOrder[b.severity] || 5)
      }
      return 0
    })

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => !a.acknowledged).length,
    acknowledged: alerts.filter(a => a.acknowledged).length,
    critical: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
    high: alerts.filter(a => a.severity === 'high' && !a.acknowledged).length,
    medium: alerts.filter(a => a.severity === 'medium' && !a.acknowledged).length,
    low: alerts.filter(a => a.severity === 'low' && !a.acknowledged).length
  }

  if (loading) {
    return (
      <div className='content'>
        <h3>Larmhantering</h3>
        <div style={{ padding: 12, background: '#d9b945', color: '#000', marginTop: 12 }}>
          Laddar larm...
        </div>
      </div>
    )
  }

  return (
    <div className='content'>
      <h3>Larmhantering</h3>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12,
        marginBottom: 16
      }}>
        <div className='card' style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4a90e2' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: 11, color: '#999' }}>Totalt Larm</div>
        </div>

        <div className='card' style={{
          background: '#1a1a1a',
          border: stats.active > 0 ? '2px solid #e24a4a' : '1px solid #333'
        }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: stats.active > 0 ? '#e24a4a' : '#3aa86f' }}>
            {stats.active}
          </div>
          <div style={{ fontSize: 11, color: '#999' }}>Aktiva</div>
        </div>

        <div className='card' style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#3aa86f' }}>
            {stats.acknowledged}
          </div>
          <div style={{ fontSize: 11, color: '#999' }}>Kvitterade</div>
        </div>

        {stats.critical > 0 && (
          <div className='card' style={{ background: '#1a1a1a', border: '2px solid #b5392f' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#b5392f' }}>
              {stats.critical}
            </div>
            <div style={{ fontSize: 11, color: '#999' }}>Kritiska</div>
          </div>
        )}

        {stats.high > 0 && (
          <div className='card' style={{ background: '#1a1a1a', border: '1px solid #e24a4a' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#e24a4a' }}>
              {stats.high}
            </div>
            <div style={{ fontSize: 11, color: '#999' }}>Höga</div>
          </div>
        )}

        {stats.medium > 0 && (
          <div className='card' style={{ background: '#1a1a1a', border: '1px solid #d9b945' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#d9b945' }}>
              {stats.medium}
            </div>
            <div style={{ fontSize: 11, color: '#999' }}>Medel</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className='card' style={{ marginBottom: 16 }}>
        <h4 style={{ marginTop: 0, marginBottom: 12 }}>🔍 Filter & Sök</h4>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          {/* Search */}
          <div>
            <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
              Sök (Asset ID eller Regel)
            </label>
            <input
              type='text'
              placeholder='Sök efter asset eller regel...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#222',
                border: '1px solid #333',
                borderRadius: 4,
                color: '#fff',
                fontSize: 13
              }}
            />
          </div>

          {/* Severity Filter */}
          <div>
            <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
              Allvarlighetsgrad
            </label>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#222',
                border: '1px solid #333',
                borderRadius: 4,
                color: '#fff',
                fontSize: 13
              }}
            >
              <option value='all'>Alla</option>
              <option value='critical'>Kritisk</option>
              <option value='high'>Hög</option>
              <option value='medium'>Medel</option>
              <option value='low'>Låg</option>
              <option value='info'>Info</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
              Sortera
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#222',
                border: '1px solid #333',
                borderRadius: 4,
                color: '#fff',
                fontSize: 13
              }}
            >
              <option value='newest'>Nyaste först</option>
              <option value='oldest'>Äldste först</option>
              <option value='severity'>Allvarlighetsgrad</option>
            </select>
          </div>
        </div>

        {/* Show Acknowledged Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type='checkbox'
            id='showAcknowledged'
            checked={showAcknowledged}
            onChange={e => setShowAcknowledged(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <label
            htmlFor='showAcknowledged'
            style={{ fontSize: 13, cursor: 'pointer', userSelect: 'none' }}
          >
            Visa kvitterade larm
          </label>
        </div>

        {/* Results count */}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #333', fontSize: 12, color: '#999' }}>
          Visar {filteredAlerts.length} av {alerts.length} larm
        </div>
      </div>

      {/* Alerts List */}
      <div className='card'>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4 style={{ margin: 0 }}>Larm ({filteredAlerts.length})</h4>
          {stats.active > 0 && (
            <button
              className='btn'
              onClick={() => {
                if (confirm(`Vill du kvittera alla ${stats.active} aktiva larm?`)) {
                  Promise.all(
                    alerts
                      .filter(a => !a.acknowledged)
                      .map(a => api.ackAlert(a.id))
                  ).then(() => fetchAlerts())
                }
              }}
              style={{ fontSize: 12, padding: '6px 12px' }}
            >
              Kvittera Alla Aktiva
            </button>
          )}
        </div>

        {filteredAlerts.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#3aa86f' }}>
            ✅ Inga larm matchar filtret
          </div>
        ) : (
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <ul className='list'>
              {filteredAlerts.map(alert => (
                <li
                  key={alert.id}
                  style={{
                    borderLeft: `4px solid ${alert.color || SEVERITY_COLORS[alert.severity] || '#666'}`,
                    paddingLeft: 12,
                    marginBottom: 12,
                    opacity: alert.acknowledged ? 0.5 : 1,
                    background: alert.acknowledged ? 'transparent' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      {/* Title */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 'bold', fontSize: 14 }}>
                          {alert.rule}
                        </span>
                        {alert.acknowledged && (
                          <span style={{
                            fontSize: 11,
                            padding: '2px 6px',
                            background: '#3aa86f',
                            borderRadius: 3,
                            color: '#fff'
                          }}>
                            ✓ Kvitterad
                          </span>
                        )}
                      </div>

                      {/* Asset & Geofence */}
                      <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                        <span style={{ fontWeight: 'bold', color: '#4a90e2' }}>
                          {alert.asset_id}
                        </span>
                        {alert.geofence_id && (
                          <span> • Geofence: {alert.geofence_id}</span>
                        )}
                      </div>

                      {/* Severity & Timestamp */}
                      <div style={{ fontSize: 11, color: '#666', display: 'flex', gap: 12 }}>
                        {alert.severity && (
                          <span style={{
                            color: SEVERITY_COLORS[alert.severity] || '#999',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }}>
                            {alert.severity}
                          </span>
                        )}
                        <span>
                          {formatDateTime(alert.ts)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {!alert.acknowledged && (
                      <button
                        className='btn'
                        onClick={() => handleAckAlert(alert.id)}
                        style={{
                          fontSize: 11,
                          padding: '6px 12px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Kvittera
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}