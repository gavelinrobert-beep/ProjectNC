// frontend/src/pages/Incidents.jsx
import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'
import IncidentForm from '../components/IncidentForm'
import IncidentList from '../components/IncidentList'

const SEVERITY_COLORS = {
  low: '#4CAF50',
  medium: '#FFC107',
  high: '#FF9800',
  critical: '#F44336'
}

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingIncident, setEditingIncident] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    loadIncidents()
  }, [statusFilter, severityFilter, typeFilter])

  const loadIncidents = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (severityFilter !== 'all') params.severity = severityFilter
      if (typeFilter !== 'all') params.incident_type = typeFilter
      
      const data = await api.incidents(params)
      setIncidents(data || [])
    } catch (error) {
      console.error('Failed to load incidents:', error)
      setIncidents([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIncident = () => {
    setEditingIncident(null)
    setShowForm(true)
  }

  const handleEditIncident = (incident) => {
    setEditingIncident(incident)
    setShowForm(true)
  }

  const handleDeleteIncident = async (incidentId) => {
    try {
      await api.deleteIncident(incidentId)
      await loadIncidents()
    } catch (error) {
      console.error('Failed to delete incident:', error)
      alert('Failed to delete incident: ' + error.message)
    }
  }

  const handleSaveIncident = () => {
    loadIncidents()
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingIncident(null)
  }

  // Stats calculation
  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    inProgress: incidents.filter(i => i.status === 'in_progress').length,
    critical: incidents.filter(i => i.severity === 'critical').length
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#1a3a4a', fontSize: '1.75rem', fontWeight: 600 }}>
            🚨 Incident Management
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
            Report and track incidents - MSB compliance ready
          </p>
        </div>
        <button
          onClick={handleCreateIncident}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#F44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#d32f2f'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#F44336'}
        >
          🆘 Report Incident
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.25rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          borderLeft: '4px solid #2196F3'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 600 }}>
            Total Incidents
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a3a4a' }}>
            {stats.total}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.25rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          borderLeft: '4px solid #F44336'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 600 }}>
            Open
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F44336' }}>
            {stats.open}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.25rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          borderLeft: '4px solid #FF9800'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 600 }}>
            In Progress
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FF9800' }}>
            {stats.inProgress}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.25rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          borderLeft: '4px solid #9C27B0'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 600 }}>
            Critical
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#9C27B0' }}>
            {stats.critical}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ marginBottom: '1rem', fontWeight: 600, color: '#333' }}>Filters</div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
              Severity
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">All</option>
              <option value="breakdown">Breakdown</option>
              <option value="accident">Accident</option>
              <option value="delay">Delay</option>
              <option value="emergency">Emergency</option>
              <option value="weather">Weather</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            onClick={() => {
              setStatusFilter('all')
              setSeverityFilter('all')
              setTypeFilter('all')
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#f5f5f5',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginTop: 'auto'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Incidents List */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#666',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          Loading incidents...
        </div>
      ) : (
        <IncidentList
          incidents={incidents}
          onEdit={handleEditIncident}
          onDelete={handleDeleteIncident}
          onSelect={setSelectedIncident}
        />
      )}

      {/* Incident Form Modal */}
      {showForm && (
        <IncidentForm
          incident={editingIncident}
          onClose={handleCloseForm}
          onSave={handleSaveIncident}
        />
      )}
    </div>
  )
}
