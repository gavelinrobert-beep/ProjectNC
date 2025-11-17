import React from 'react'

const SEVERITY_COLORS = {
  low: '#4CAF50',
  medium: '#FFC107',
  high: '#FF9800',
  critical: '#F44336'
}

const STATUS_COLORS = {
  open: '#F44336',
  in_progress: '#FF9800',
  resolved: '#4CAF50',
  closed: '#9E9E9E'
}

const INCIDENT_TYPE_ICONS = {
  breakdown: '🔧',
  accident: '💥',
  delay: '⏰',
  emergency: '🚨',
  weather: '🌧️',
  other: '📋'
}

export default function IncidentList({ incidents, onEdit, onDelete, onSelect }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  if (!incidents || incidents.length === 0) {
    return (
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#666',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Incidents</div>
        <div>All systems operational</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {incidents.map(incident => {
        const severity = incident.severity || 'medium'
        const status = incident.status || 'open'
        const incidentType = incident.incident_type || 'other'

        return (
          <div
            key={incident.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              borderLeft: `4px solid ${SEVERITY_COLORS[severity]}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => onSelect && onSelect(incident)}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {INCIDENT_TYPE_ICONS[incidentType]}
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1a3a4a' }}>
                    {incident.title}
                  </h3>
                </div>
                <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  {incident.description}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: SEVERITY_COLORS[severity] + '20',
                  color: SEVERITY_COLORS[severity],
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {severity}
                </span>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: STATUS_COLORS[status] + '20',
                  color: STATUS_COLORS[status],
                  textTransform: 'capitalize'
                }}>
                  {status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              padding: '1rem',
              background: '#f5f5f5',
              borderRadius: '6px',
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}>
              <div>
                <div style={{ color: '#999', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Reported</div>
                <div style={{ color: '#333', fontWeight: 500 }}>{formatDate(incident.reported_at)}</div>
              </div>
              {incident.location_description && (
                <div>
                  <div style={{ color: '#999', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Location</div>
                  <div style={{ color: '#333', fontWeight: 500 }}>📍 {incident.location_description}</div>
                </div>
              )}
              {incident.vehicle_id && (
                <div>
                  <div style={{ color: '#999', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Vehicle</div>
                  <div style={{ color: '#333', fontWeight: 500 }}>🚛 {incident.vehicle_id}</div>
                </div>
              )}
              {incident.facility_id && (
                <div>
                  <div style={{ color: '#999', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Facility</div>
                  <div style={{ color: '#333', fontWeight: 500 }}>🏢 {incident.facility_id}</div>
                </div>
              )}
            </div>

            {incident.requires_followup && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#fff3cd',
                color: '#856404',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1rem'
              }}>
                ⚠️ Requires Follow-up
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e0e0e0'
            }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit && onEdit(incident)
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1976D2'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#2196F3'}
              >
                ✏️ Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Are you sure you want to delete incident "${incident.title}"?`)) {
                    onDelete && onDelete(incident.id)
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#d32f2f'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f44336'}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
