import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function Intelligence() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dashboard, setDashboard] = useState(null)
  const [reports, setReports] = useState([])
  const [threats, setThreats] = useState([])
  const [sigint, setSigint] = useState([])
  const [loading, setLoading] = useState(true)
  
  // New report form
  const [newReport, setNewReport] = useState({
    report_type: 'SIGINT',
    title: '',
    content: '',
    threat_level: 'low',
    source: ''
  })

  useEffect(() => {
    fetchDashboard()
    fetchReports()
    fetchThreats()
    fetchSigint()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchDashboard()
      fetchThreats()
      fetchSigint()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/intelligence/dashboard')
      const data = await response.json()
      setDashboard(data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch dashboard:', err)
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/intelligence/reports')
      const data = await response.json()
      setReports(data.reports || [])
    } catch (err) {
      console.error('Failed to fetch reports:', err)
    }
  }

  const fetchThreats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/intelligence/threats')
      const data = await response.json()
      setThreats(data.threats || [])
    } catch (err) {
      console.error('Failed to fetch threats:', err)
    }
  }

  const fetchSigint = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/intelligence/sigint')
      const data = await response.json()
      setSigint(data.intercepts || [])
    } catch (err) {
      console.error('Failed to fetch SIGINT:', err)
    }
  }

  const handleCreateReport = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/api/intelligence/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReport,
          created_by: localStorage.getItem('aegis_role') || 'analyst'
        })
      })

      if (response.ok) {
        setNewReport({
          report_type: 'SIGINT',
          title: '',
          content: '',
          threat_level: 'low',
          source: ''
        })
        fetchReports()
        fetchDashboard()
        alert('Report created successfully!')
      }
    } catch (err) {
      console.error('Failed to create report:', err)
      alert('Failed to create report')
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#4a90e2',
      medium: '#ff9800',
      high: '#fc8181',
      critical: '#e53e3e'
    }
    return colors[severity] || colors.low
  }

  const getThreatIcon = (type) => {
    const icons = {
      hostile: '⚔️',
      surveillance: '👁️',
      cyber: '💻',
      aerial: '✈️',
      ground: '🚗',
      naval: '⚓',
      unknown: '❓'
    }
    return icons[type] || icons.unknown
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
          🎯 Intelligence Operations
        </h1>
        <div style={{
          padding: '0.5rem 1rem',
          background: '#22543d',
          border: '1px solid #2f855a',
          borderRadius: '8px',
          color: '#68d391',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          🟢 Intel Systems Online
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
          { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
          { id: 'threats', label: '⚠️ Threats', icon: '⚠️' },
          { id: 'sigint', label: '📡 SIGINT', icon: '📡' },
          { id: 'geoint', label: '🗺️ GEOINT', icon: '🗺️' },
          { id: 'reports', label: '📝 Reports', icon: '📝' }
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
              Loading intelligence data...
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
                  border: '1px solid #2d3748',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {Object.values(dashboard?.reports_by_type || {}).reduce((a, b) => a + b, 0)}
                  </div>
                  <div style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Active Reports</div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #742a2a 0%, #9b2c2c 100%)',
                  border: '1px solid #2d3748',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {Object.values(dashboard?.threats_by_severity || {}).reduce((a, b) => a + b, 0)}
                  </div>
                  <div style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Active Threats</div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
                  border: '1px solid #2d3748',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📡</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {dashboard?.recent_intercepts || 0}
                  </div>
                  <div style={{ color: '#a0aec0', fontSize: '0.9rem' }}>SIGINT (24h)</div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #744210 0%, #975a16 100%)',
                  border: '1px solid #2d3748',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {dashboard?.threats_by_severity?.critical || 0}
                  </div>
                  <div style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Critical Threats</div>
                </div>
              </div>

              {/* Active Threats List */}
              <div style={{
                background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
                border: '1px solid #2d3748',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>
                  🎯 Priority Threats
                </h2>
                {dashboard?.active_threats?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {dashboard.active_threats.map(threat => (
                      <div
                        key={threat.id}
                        style={{
                          background: '#0a0e14',
                          border: `1px solid ${getSeverityColor(threat.severity)}`,
                          borderLeft: `4px solid ${getSeverityColor(threat.severity)}`,
                          borderRadius: '8px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <div style={{ fontSize: '1.5rem' }}>
                            {getThreatIcon(threat.threat_type)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                              {threat.name}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                              {threat.description || 'No description available'}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          padding: '0.25rem 0.75rem',
                          background: getSeverityColor(threat.severity),
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {threat.severity}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                    No active threats detected
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Threats Tab */}
      {activeTab === 'threats' && (
        <div style={{
          background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
          border: '1px solid #2d3748',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>
            ⚠️ Threat Assessment
          </h2>
          {threats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {threats.map(threat => (
                <div
                  key={threat.id}
                  style={{
                    background: '#0a0e14',
                    border: `1px solid ${getSeverityColor(threat.severity)}`,
                    borderLeft: `4px solid ${getSeverityColor(threat.severity)}`,
                    borderRadius: '8px',
                    padding: '1.5rem'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ fontSize: '2rem' }}>
                        {getThreatIcon(threat.threat_type)}
                      </div>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          {threat.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                          Type: {threat.threat_type} • First Detected: {formatTime(threat.first_detected)}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      padding: '0.5rem 1rem',
                      background: getSeverityColor(threat.severity),
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      height: 'fit-content'
                    }}>
                      {threat.severity}
                    </div>
                  </div>
                  <div style={{ color: '#e0e0e0', lineHeight: 1.6 }}>
                    {threat.description || 'No detailed description available'}
                  </div>
                  {threat.location_lat && threat.location_lon && (
                    <div style={{
                      marginTop: '0.75rem',
                      fontSize: '0.85rem',
                      color: '#63b3ed'
                    }}>
                      📍 Location: {threat.location_lat.toFixed(4)}, {threat.location_lon.toFixed(4)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
              No threats currently tracked
            </div>
          )}
        </div>
      )}

      {/* SIGINT Tab */}
      {activeTab === 'sigint' && (
        <div style={{
          background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
          border: '1px solid #2d3748',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>
            📡 Signals Intelligence Intercepts
          </h2>
          {sigint.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sigint.map(intercept => (
                <div
                  key={intercept.id}
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
                    marginBottom: '0.75rem',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {intercept.frequency && (
                        <span style={{ color: '#63b3ed', fontWeight: 600 }}>
                          📻 {intercept.frequency}
                        </span>
                      )}
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        background: '#2d3748',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        {intercept.classification}
                      </span>
                    </div>
                    <span style={{ color: '#718096' }}>
                      {formatTime(intercept.intercept_time)}
                    </span>
                  </div>
                  <div style={{ color: '#e0e0e0', lineHeight: 1.5 }}>
                    {intercept.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
              No signals intelligence intercepts recorded
            </div>
          )}
        </div>
      )}

      {/* GEOINT Tab */}
      {activeTab === 'geoint' && (
        <div style={{
          background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
          border: '1px solid #2d3748',
          borderRadius: '12px',
          padding: '1.5rem',
          height: '600px'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>
            🗺️ Geospatial Intelligence
          </h2>
          <MapContainer
            center={[35.0, 40.0]}
            zoom={6}
            style={{ height: 'calc(100% - 3rem)', borderRadius: '8px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {threats.filter(t => t.location_lat && t.location_lon).map(threat => (
              <Circle
                key={threat.id}
                center={[threat.location_lat, threat.location_lon]}
                radius={5000}
                pathOptions={{
                  color: getSeverityColor(threat.severity),
                  fillColor: getSeverityColor(threat.severity),
                  fillOpacity: 0.3
                }}
              >
                <Popup>
                  <div>
                    <strong>{threat.name}</strong><br/>
                    Type: {threat.threat_type}<br/>
                    Severity: {threat.severity}
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
          {/* Reports List */}
          <div style={{
            background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
            border: '1px solid #2d3748',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>
              📝 Intelligence Reports
            </h2>
            {reports.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reports.map(report => (
                  <div
                    key={report.id}
                    style={{
                      background: '#0a0e14',
                      border: `1px solid ${getSeverityColor(report.threat_level)}`,
                      borderLeft: `4px solid ${getSeverityColor(report.threat_level)}`,
                      borderRadius: '8px',
                      padding: '1rem'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                      fontSize: '0.85rem'
                    }}>
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        background: '#2d3748',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {report.report_type}
                      </span>
                      <span style={{ color: '#718096' }}>
                        {formatTime(report.created_at)}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.05rem' }}>
                      {report.title}
                    </div>
                    <div style={{ color: '#a0aec0', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {report.content}
                    </div>
                    {report.source && (
                      <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.8rem',
                        color: '#718096'
                      }}>
                        Source: {report.source}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                No intelligence reports filed
              </div>
            )}
          </div>

          {/* Create Report Form */}
          <div style={{
            background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
            border: '1px solid #2d3748',
            borderRadius: '12px',
            padding: '1.5rem',
            height: 'fit-content'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>
              ➕ New Report
            </h2>
            <form onSubmit={handleCreateReport}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#a0aec0' }}>
                  Report Type
                </label>
                <select
                  value={newReport.report_type}
                  onChange={(e) => setNewReport({...newReport, report_type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0e14',
                    border: '1px solid #2d3748',
                    borderRadius: '8px',
                    color: '#e0e0e0',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="SIGINT">SIGINT</option>
                  <option value="GEOINT">GEOINT</option>
                  <option value="OSINT">OSINT</option>
                  <option value="HUMINT">HUMINT</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#a0aec0' }}>
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newReport.title}
                  onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                  placeholder="Brief title..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0e14',
                    border: '1px solid #2d3748',
                    borderRadius: '8px',
                    color: '#e0e0e0',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#a0aec0' }}>
                  Content
                </label>
                <textarea
                  required
                  value={newReport.content}
                  onChange={(e) => setNewReport({...newReport, content: e.target.value})}
                  placeholder="Detailed report content..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0e14',
                    border: '1px solid #2d3748',
                    borderRadius: '8px',
                    color: '#e0e0e0',
                    fontSize: '0.95rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#a0aec0' }}>
                  Threat Level
                </label>
                <select
                  value={newReport.threat_level}
                  onChange={(e) => setNewReport({...newReport, threat_level: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0e14',
                    border: '1px solid #2d3748',
                    borderRadius: '8px',
                    color: '#e0e0e0',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#a0aec0' }}>
                  Source (Optional)
                </label>
                <input
                  type="text"
                  value={newReport.source}
                  onChange={(e) => setNewReport({...newReport, source: e.target.value})}
                  placeholder="Intelligence source..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0e14',
                    border: '1px solid #2d3748',
                    borderRadius: '8px',
                    color: '#e0e0e0',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#63b3ed',
                  color: '#0a0e14',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600
                }}
              >
                📤 Submit Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}