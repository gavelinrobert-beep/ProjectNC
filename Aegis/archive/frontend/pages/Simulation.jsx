import React, { useState, useEffect } from 'react'

export default function Simulation() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dashboard, setDashboard] = useState(null)
  const [events, setEvents] = useState([])
  const [config, setConfig] = useState({})
  const [maintenance, setMaintenance] = useState([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)

  useEffect(() => {
    fetchDashboard()
    fetchEvents()

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchDashboard()
      if (activeTab === 'events') {
        fetchEvents()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [activeTab])

  const fetchDashboard = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/simulation/dashboard')
      const data = await response.json()
      setDashboard(data)
      setConfig(data.config || {})
      setMaintenance(data.pending_maintenance || [])
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch dashboard:', err)
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/simulation/events')
      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      console.error('Failed to fetch events:', err)
    }
  }

  const triggerEvent = async (type) => {
    setTriggering(true)
    try {
      const response = await fetch(`http://localhost:8000/api/simulation/trigger/${type}`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchDashboard()
        fetchEvents()
        // Show notification
        const notification = document.createElement('div')
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #22543d;
          border: 1px solid #2f855a;
          color: #68d391;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          z-index: 9999;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        `
        notification.textContent = `✅ ${type.charAt(0).toUpperCase() + type.slice(1)} event triggered!`
        document.body.appendChild(notification)

        setTimeout(() => {
          notification.remove()
        }, 3000)
      }
    } catch (err) {
      console.error('Failed to trigger event:', err)
    }
    setTriggering(false)
  }

  const resolveEvent = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/simulation/events/${eventId}/resolve`, {
        method: 'PUT'
      })

      if (response.ok) {
        fetchDashboard()
        fetchEvents()
      }
    } catch (err) {
      console.error('Failed to resolve event:', err)
    }
  }

  const updateConfig = async (key, value) => {
    try {
      await fetch('http://localhost:8000/api/simulation/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_key: key,
          config_value: value
        })
      })

      fetchDashboard()
    } catch (err) {
      console.error('Failed to update config:', err)
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      info: '#4a90e2',
      low: '#68d391',
      medium: '#ff9800',
      high: '#fc8181',
      critical: '#e53e3e'
    }
    return colors[severity] || colors.info
  }

  const getCategoryIcon = (category) => {
    const icons = {
      weather: '🌪️',
      supply: '📦',
      maintenance: '🔧',
      operational: '⚙️',
      security: '🛡️',
      personnel: '👥'
    }
    return icons[category] || '📋'
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleString('sv-SE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSimulationSpeed = () => {
    return parseFloat(config.simulation_speed || '1.0')
  }

  return (
    <div style={{
      padding: '2rem',
      background: 'linear-gradient(135deg, #0a0e14 0%, #1a1f2e 100%)',
      minHeight: '100vh'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          🎮 Advanced Simulations
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            padding: '0.5rem 1rem',
            background: '#1a365d',
            border: '1px solid #2c5282',
            borderRadius: '8px',
            color: '#63b3ed',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            ⚡ Speed: {getSimulationSpeed()}x
          </div>
          <div style={{
            padding: '0.5rem 1rem',
            background: '#22543d',
            border: '1px solid #2f855a',
            borderRadius: '8px',
            color: '#68d391',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            🟢 Simulation Active
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #2d3748',
        paddingBottom: '0.5rem'
      }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'events', label: '📋 Event Log' },
          { id: 'triggers', label: '⚡ Triggers' },
          { id: 'maintenance', label: '🔧 Maintenance' },
          { id: 'settings', label: '⚙️ Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === tab.id ? '#2c5282' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #63b3ed' : '3px solid transparent',
              color: activeTab === tab.id ? '#63b3ed' : '#718096',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
              Loading simulation data...
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {Object.entries(dashboard?.event_counts || {}).map(([category, count]) => (
                  <div
                    key={category}
                    style={{
                      background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
                      border: '1px solid #2d3748',
                      borderRadius: '12px',
                      padding: '1.5rem'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                      {getCategoryIcon(category)}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {count}
                    </div>
                    <div style={{ color: '#a0aec0', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                      {category} Events (24h)
                    </div>
                  </div>
                ))}
              </div>

              {/* Unresolved Events */}
              <div style={{
                background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
                border: '1px solid #2d3748',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>
                  🚨 Active Events Requiring Attention
                </h2>
                {dashboard?.unresolved_events?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {dashboard.unresolved_events.map(event => (
                      <div
                        key={event.id}
                        style={{
                          background: '#0a0e14',
                          border: `1px solid ${getSeverityColor(event.severity)}`,
                          borderLeft: `4px solid ${getSeverityColor(event.severity)}`,
                          borderRadius: '8px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>
                              {getCategoryIcon(event.event_category)}
                            </span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                                {event.title}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                                {formatTime(event.occurred_at)}
                              </div>
                            </div>
                          </div>
                          <div style={{ color: '#a0aec0', fontSize: '0.9rem', lineHeight: 1.5, paddingLeft: '3rem' }}>
                            {event.description}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <div style={{
                            padding: '0.25rem 0.75rem',
                            background: getSeverityColor(event.severity),
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {event.severity}
                          </div>
                          <button
                            onClick={() => resolveEvent(event.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#22543d',
                              color: '#68d391',
                              border: '1px solid #2f855a',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 600
                            }}
                          >
                            ✓ Resolve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                    No unresolved events
                  </div>
                )}
              </div>

              {/* Recent Events Timeline */}
              <div style={{
                background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
                border: '1px solid #2d3748',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>
                  📋 Recent Event Timeline
                </h2>
                {dashboard?.recent_events?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {dashboard.recent_events.map(event => (
                      <div
                        key={event.id}
                        style={{
                          background: '#0a0e14',
                          border: '1px solid #2d3748',
                          borderRadius: '8px',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          opacity: event.resolved ? 0.6 : 1
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>
                          {getCategoryIcon(event.event_category)}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                            {event.title}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                          {formatTime(event.occurred_at)}
                        </div>
                        <div style={{
                          padding: '0.2rem 0.6rem',
                          background: getSeverityColor(event.severity),
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {event.severity}
                        </div>
                        {event.resolved && (
                          <div style={{
                            padding: '0.2rem 0.6rem',
                            background: '#22543d',
                            color: '#68d391',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}>
                            ✓ RESOLVED
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                    No recent events
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div style={{
          background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
          border: '1px solid #2d3748',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>
            📋 Complete Event Log
          </h2>
          {events.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.map(event => (
                <div
                  key={event.id}
                  style={{
                    background: '#0a0e14',
                    border: `1px solid ${getSeverityColor(event.severity)}`,
                    borderLeft: `4px solid ${getSeverityColor(event.severity)}`,
                    borderRadius: '8px',
                    padding: '1rem',
                    opacity: event.resolved ? 0.7 : 1
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {getCategoryIcon(event.event_category)}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                          {event.title}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                          {event.event_category} • {formatTime(event.occurred_at)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{
                        padding: '0.25rem 0.75rem',
                        background: getSeverityColor(event.severity),
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        {event.severity}
                      </div>
                      {event.resolved ? (
                        <div style={{
                          padding: '0.25rem 0.75rem',
                          background: '#22543d',
                          color: '#68d391',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          ✓ RESOLVED
                        </div>
                      ) : (
                        <button
                          onClick={() => resolveEvent(event.id)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#2d3748',
                            color: '#e0e0e0',
                            border: '1px solid #4a5568',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                  {event.description && (
                    <div style={{ color: '#a0aec0', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '3rem' }}>
                      {event.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
              No events logged
            </div>
          )}
        </div>
      )}

      {/* Triggers Tab */}
      {activeTab === 'triggers' && (
        <div>
          <div style={{
            background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
            border: '1px solid #2d3748',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>
              ⚡ Manual Event Triggers
            </h2>
            <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Manually trigger simulation events to test system response and training scenarios.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <button
                onClick={() => triggerEvent('weather')}
                disabled={triggering}
                style={{
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
                  border: '2px solid #2d3748',
                  borderRadius: '12px',
                  color: '#e0e0e0',
                  cursor: triggering ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: triggering ? 0.6 : 1
                }}
                onMouseEnter={(e) => !triggering && (e.target.style.borderColor = '#63b3ed')}
                onMouseLeave={(e) => e.target.style.borderColor = '#2d3748'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌪️</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Weather Event
                </div>
                <div style={{ fontSize: '0.85rem', color: '#a0aec0' }}>
                  Sandstorms, fog, extreme heat
                </div>
              </button>

              <button
                onClick={() => triggerEvent('supply')}
                disabled={triggering}
                style={{
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #744210 0%, #975a16 100%)',
                  border: '2px solid #2d3748',
                  borderRadius: '12px',
                  color: '#e0e0e0',
                  cursor: triggering ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: triggering ? 0.6 : 1
                }}
                onMouseEnter={(e) => !triggering && (e.target.style.borderColor = '#ff9800')}
                onMouseLeave={(e) => e.target.style.borderColor = '#2d3748'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Supply Event
                </div>
                <div style={{ fontSize: '0.85rem', color: '#a0aec0' }}>
                  Shortages, resupply arrivals
                </div>
              </button>

              <button
                onClick={() => triggerEvent('maintenance')}
                disabled={triggering}
                style={{
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
                  border: '2px solid #2d3748',
                  borderRadius: '12px',
                  color: '#e0e0e0',
                  cursor: triggering ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: triggering ? 0.6 : 1
                }}
                onMouseEnter={(e) => !triggering && (e.target.style.borderColor = '#68d391')}
                onMouseLeave={(e) => e.target.style.borderColor = '#2d3748'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔧</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Maintenance Event
                </div>
                <div style={{ fontSize: '0.85rem', color: '#a0aec0' }}>
                  Repairs, inspections, failures
                </div>
              </button>

              <button
                onClick={() => triggerEvent('random')}
                disabled={triggering}
                style={{
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #742a2a 0%, #9b2c2c 100%)',
                  border: '2px solid #2d3748',
                  borderRadius: '12px',
                  color: '#e0e0e0',
                  cursor: triggering ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: triggering ? 0.6 : 1
                }}
                onMouseEnter={(e) => !triggering && (e.target.style.borderColor = '#fc8181')}
                onMouseLeave={(e) => e.target.style.borderColor = '#2d3748'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎲</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Random Event
                </div>
                <div style={{ fontSize: '0.85rem', color: '#a0aec0' }}>
                  Surprise simulation event
                </div>
              </button>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
            border: '1px solid #2d3748',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>
              ℹ️ Event Types
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#a0aec0' }}>
              <div><strong style={{ color: '#63b3ed' }}>Weather:</strong> Environmental conditions affecting operations</div>
              <div><strong style={{ color: '#ff9800' }}>Supply:</strong> Resource management and logistics events</div>
              <div><strong style={{ color: '#68d391' }}>Maintenance:</strong> Asset serviceability and repair needs</div>
              <div><strong style={{ color: '#fc8181' }}>Random:</strong> Unexpected operational events</div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div style={{
          background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
          border: '1px solid #2d3748',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>
            🔧 Maintenance Schedule
          </h2>
          {maintenance.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {maintenance.map(maint => (
                <div
                  key={maint.id}
                  style={{
                    background: '#0a0e14',
                    border: '1px solid #2d3748',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                        {maint.asset_name || 'Unknown Asset'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                        Type: {maint.maintenance_type} • Scheduled: {formatTime(maint.scheduled_date)}
                      </div>
                    </div>
                    <div style={{
                      padding: '0.25rem 0.75rem',
                      background: '#744210',
                      color: '#f6ad55',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      height: 'fit-content'
                    }}>
                      PENDING
                    </div>
                  </div>
                  {maint.notes && (
                    <div style={{ color: '#a0aec0', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {maint.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
              No pending maintenance
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div style={{
          background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
          border: '1px solid #2d3748',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>
            ⚙️ Simulation Settings
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 600
              }}>
                Simulation Speed
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {['0.5', '1.0', '2.0', '5.0'].map(speed => (
                  <button
                    key={speed}
                    onClick={() => updateConfig('simulation_speed', speed)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: getSimulationSpeed() === parseFloat(speed) ? '#2c5282' : '#0a0e14',
                      border: getSimulationSpeed() === parseFloat(speed) ? '2px solid #63b3ed' : '1px solid #2d3748',
                      borderRadius: '8px',
                      color: '#e0e0e0',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                padding: '1rem',
                background: '#0a0e14',
                border: '1px solid #2d3748',
                borderRadius: '8px'
              }}>
                <input
                  type="checkbox"
                  checked={config.weather_enabled === 'true'}
                  onChange={(e) => updateConfig('weather_enabled', e.target.checked ? 'true' : 'false')}
                  style={{ width: '20px', height: '20px' }}
                />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Weather Events</div>
                  <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                    Enable automatic weather simulation events
                  </div>
                </div>
              </label>
            </div>

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                padding: '1rem',
                background: '#0a0e14',
                border: '1px solid #2d3748',
                borderRadius: '8px'
              }}>
                <input
                  type="checkbox"
                  checked={config.supply_consumption_enabled === 'true'}
                  onChange={(e) => updateConfig('supply_consumption_enabled', e.target.checked ? 'true' : 'false')}
                  style={{ width: '20px', height: '20px' }}
                />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Supply Consumption</div>
                  <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                    Simulate realistic resource consumption over time
                  </div>
                </div>
              </label>
            </div>

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                padding: '1rem',
                background: '#0a0e14',
                border: '1px solid #2d3748',
                borderRadius: '8px'
              }}>
                <input
                  type="checkbox"
                  checked={config.maintenance_enabled === 'true'}
                  onChange={(e) => updateConfig('maintenance_enabled', e.target.checked ? 'true' : 'false')}
                  style={{ width: '20px', height: '20px' }}
                />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Maintenance Events</div>
                  <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                    Enable automatic maintenance scheduling and asset degradation
                  </div>
                </div>
              </label>
            </div>

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                padding: '1rem',
                background: '#0a0e14',
                border: '1px solid #2d3748',
                borderRadius: '8px'
              }}>
                <input
                  type="checkbox"
                  checked={config.random_events_enabled === 'true'}
                  onChange={(e) => updateConfig('random_events_enabled', e.target.checked ? 'true' : 'false')}
                  style={{ width: '20px', height: '20px' }}
                />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Random Events</div>
                  <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                    Allow unpredictable operational events to occur
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}