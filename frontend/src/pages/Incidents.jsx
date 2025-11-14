// frontend/src/pages/Incidents.jsx
import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const PRIORITY_COLORS = {
  P1: '#F44336', // Critical - life-threatening
  P2: '#FF9800', // High - major incident
  P3: '#FFC107', // Medium - significant
  P4: '#4CAF50', // Low - minor
}

const PRIORITY_LABELS = {
  P1: 'P1 - Critical',
  P2: 'P2 - High',
  P3: 'P3 - Medium',
  P4: 'P4 - Low',
}

const STATUS_COLORS = {
  active: '#F44336',
  responding: '#FF9800',
  contained: '#FFC107',
  resolved: '#4CAF50',
  closed: '#9E9E9E'
}

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('active')

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      // For now, use alerts as incidents proxy since incidents API might not exist yet
      const [incidentsData, assetsData] = await Promise.all([
        api.get('/api/alerts' + (statusFilter !== 'all' ? `?status=${statusFilter}` : '')),
        api.get('/api/assets')
      ])
      setIncidents(incidentsData)
      setAssets(assetsData)
    } catch (error) {
      console.error('Failed to load data:', error)
      // Initialize with empty data if API fails
      setIncidents([])
      setAssets([])
    } finally {
      setLoading(false)
    }
  }

  const createIncident = () => {
    setShowCreateForm(true)
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--charcoal)', fontSize: '1.75rem', fontWeight: 600 }}>
            🚨 Incident Management
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--dark-gray)' }}>
            Civil contingency incident tracking and resource allocation
          </p>
        </div>
        <button
          onClick={createIncident}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--error)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          🆘 Create Incident
        </button>
      </div>

      {/* Priority Legend */}
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ fontWeight: 600, color: 'var(--dark-gray)' }}>Priority Levels:</div>
        {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: PRIORITY_COLORS[key]
            }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--dark-gray)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'active', 'responding', 'contained', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.5rem 1rem',
                background: statusFilter === status ? 'var(--nordic-blue-primary)' : 'white',
                color: statusFilter === status ? 'white' : 'var(--dark-gray)',
                border: `2px solid ${statusFilter === status ? 'var(--nordic-blue-primary)' : 'var(--light-gray)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                textTransform: 'capitalize'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
          Loading incidents...
        </div>
      ) : incidents.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'var(--gray)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Active Incidents</div>
          <div>All systems operational</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {incidents.map(incident => {
            const priority = incident.priority || 'P4'
            const status = incident.status || 'active'
            
            return (
              <div
                key={incident.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)',
                  borderLeft: `4px solid ${PRIORITY_COLORS[priority] || 'var(--gray)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedIncident(incident)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 62, 80, 0.15)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(45, 62, 80, 0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{
                        padding: '0.25rem 0.75rem',
                        background: PRIORITY_COLORS[priority],
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        {PRIORITY_LABELS[priority]}
                      </div>
                      <div style={{
                        padding: '0.25rem 0.75rem',
                        background: STATUS_COLORS[status] || 'var(--gray)',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}>
                        {status}
                      </div>
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--charcoal)', fontSize: '1.2rem' }}>
                      {incident.type || 'Incident'}: {incident.message || 'No description'}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', lineHeight: '1.6' }}>
                      {incident.asset_id && (
                        <div><strong>Asset:</strong> {incident.asset_id}</div>
                      )}
                      {incident.timestamp && (
                        <div><strong>Reported:</strong> {new Date(incident.timestamp).toLocaleString()}</div>
                      )}
                      {incident.location && (
                        <div><strong>Location:</strong> Lat: {incident.location.lat?.toFixed(4)}, Lon: {incident.location.lon?.toFixed(4)}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedIncident(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, color: 'var(--charcoal)' }}>Incident Details</h2>
            <div style={{ fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--dark-gray)' }}>
              <p><strong>Type:</strong> {selectedIncident.type}</p>
              <p><strong>Priority:</strong> <span style={{
                padding: '0.25rem 0.5rem',
                background: PRIORITY_COLORS[selectedIncident.priority || 'P4'],
                color: 'white',
                borderRadius: '4px'
              }}>{PRIORITY_LABELS[selectedIncident.priority || 'P4']}</span></p>
              <p><strong>Status:</strong> <span style={{
                padding: '0.25rem 0.5rem',
                background: STATUS_COLORS[selectedIncident.status || 'active'],
                color: 'white',
                borderRadius: '4px'
              }}>{selectedIncident.status}</span></p>
              <p><strong>Description:</strong> {selectedIncident.message}</p>
              {selectedIncident.timestamp && (
                <p><strong>Reported:</strong> {new Date(selectedIncident.timestamp).toLocaleString()}</p>
              )}
              {selectedIncident.asset_id && (
                <p><strong>Asset ID:</strong> {selectedIncident.asset_id}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setSelectedIncident(null)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'var(--nordic-blue-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Incident Form (placeholder) */}
      {showCreateForm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowCreateForm(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Create New Incident</h2>
            <p style={{ color: 'var(--gray)' }}>Incident creation form - Integration with backend API required</p>
            <button
              onClick={() => setShowCreateForm(false)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--nordic-blue-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
