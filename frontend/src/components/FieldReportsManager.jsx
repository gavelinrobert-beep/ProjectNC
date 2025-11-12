// AEGIS Light - Field Reports Manager Component
// Allows field operators to submit and view field reports with photo attachments

import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const REPORT_TYPES = [
  { value: 'status', label: 'Status Update', icon: '📝' },
  { value: 'issue', label: 'Issue Report', icon: '⚠️' },
  { value: 'completion', label: 'Task Completion', icon: '✅' },
  { value: 'incident', label: 'Incident Report', icon: '🚨' },
  { value: 'maintenance', label: 'Maintenance Required', icon: '🔧' },
]

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#4CAF50' },
  { value: 'normal', label: 'Normal', color: '#2196F3' },
  { value: 'high', label: 'High', color: '#FF9800' },
  { value: 'critical', label: 'Critical', color: '#F44336' },
]

export default function FieldReportsManager() {
  const [reports, setReports] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    report_type: 'status',
    description: '',
    severity: 'normal',
    location_name: '',
    asset_id: '',
    photos: []
  })

  useEffect(() => {
    loadReports()
    loadStatistics()
  }, [])

  const loadReports = async () => {
    try {
      const response = await fetch(`${api.API_BASE || 'http://localhost:8000'}/api/field-reports`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
      setLoading(false)
    } catch (err) {
      console.error('Error loading reports:', err)
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const response = await fetch(`${api.API_BASE || 'http://localhost:8000'}/api/field-reports/statistics/summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setStatistics(data)
      }
    } catch (err) {
      console.error('Error loading statistics:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Get current location if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const reportData = {
            ...formData,
            location_lat: position.coords.latitude,
            location_lon: position.coords.longitude,
            tags: []
          }
          
          await submitReport(reportData)
        }, async () => {
          // Location not available, submit without it
          await submitReport({ ...formData, tags: [] })
        })
      } else {
        await submitReport({ ...formData, tags: [] })
      }
    } catch (err) {
      console.error('Error submitting report:', err)
      alert('Failed to submit report: ' + err.message)
    }
  }

  const submitReport = async (reportData) => {
    const response = await fetch(`${api.API_BASE || 'http://localhost:8000'}/api/field-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(reportData)
    })

    if (!response.ok) {
      throw new Error('Failed to submit report')
    }

    // Reset form and reload
    setFormData({
      title: '',
      report_type: 'status',
      description: '',
      severity: 'normal',
      location_name: '',
      asset_id: '',
      photos: []
    })
    setShowForm(false)
    loadReports()
    loadStatistics()
    alert('Report submitted successfully!')
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, base64]
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Loading reports...</div>
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>📋 Field Reports</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#63b3ed',
            color: '#0a0e14',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem'
          }}
        >
          {showForm ? '✕ Cancel' : '+ New Report'}
        </button>
      </div>

      {/* Statistics Dashboard */}
      {statistics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <StatCard title="Total Reports" value={statistics.total_reports} icon="📊" color="#2196F3" />
          <StatCard title="Open" value={statistics.open_reports} icon="📝" color="#FF9800" />
          <StatCard title="Resolved" value={statistics.resolved_reports} icon="✅" color="#4CAF50" />
          <StatCard title="Critical" value={statistics.critical_reports} icon="🚨" color="#F44336" />
        </div>
      )}

      {/* New Report Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: '#1a1f2e',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #2d3748',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#63b3ed' }}>New Field Report</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={inputStyle}
              placeholder="Brief description"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Report Type *</label>
              <select
                value={formData.report_type}
                onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                style={inputStyle}
              >
                {REPORT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Severity *</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                style={inputStyle}
              >
                {SEVERITY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={5}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Detailed description of the report..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Location Name</label>
              <input
                type="text"
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                style={inputStyle}
                placeholder="e.g., Main Street & 5th Ave"
              />
            </div>

            <div>
              <label style={labelStyle}>Related Asset ID</label>
              <input
                type="text"
                value={formData.asset_id}
                onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                style={inputStyle}
                placeholder="Optional"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Add Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={inputStyle}
            />
            {formData.photos.length > 0 && (
              <div style={{ marginTop: '0.5rem', color: '#4CAF50', fontSize: '0.9rem' }}>
                ✓ {formData.photos.length} photo(s) attached
              </div>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '1rem',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem'
            }}
          >
            Submit Report
          </button>
        </form>
      )}

      {/* Reports List */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {reports.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: '#1a1f2e',
            borderRadius: '12px',
            color: '#718096'
          }}>
            No field reports yet. Create your first report above.
          </div>
        ) : (
          reports.map(report => (
            <ReportCard key={report.id} report={report} onUpdate={loadReports} />
          ))
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <div style={{
      background: '#1a1f2e',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid #2d3748',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{ fontSize: '2rem' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color }}>{value}</div>
      </div>
    </div>
  )
}

function ReportCard({ report, onUpdate }) {
  const typeInfo = REPORT_TYPES.find(t => t.value === report.report_type) || REPORT_TYPES[0]
  const severityInfo = SEVERITY_LEVELS.find(s => s.value === report.severity) || SEVERITY_LEVELS[1]
  
  return (
    <div style={{
      background: '#1a1f2e',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid #2d3748',
      borderLeft: `4px solid ${severityInfo.color}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>{typeInfo.icon}</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{report.title}</h3>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#718096' }}>
            {new Date(report.created_at).toLocaleString()}
            {report.location_name && ` • 📍 ${report.location_name}`}
          </div>
        </div>
        <div style={{
          padding: '0.5rem 1rem',
          background: severityInfo.color + '20',
          color: severityInfo.color,
          borderRadius: '6px',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {severityInfo.label}
        </div>
      </div>

      <p style={{ margin: '1rem 0', color: '#e0e0e0', lineHeight: 1.6 }}>
        {report.description}
      </p>

      {report.asset_id && (
        <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#718096' }}>
          🚛 Asset: {report.asset_id}
        </div>
      )}

      {report.photos && report.photos.length > 0 && (
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#63b3ed' }}>
          📷 {report.photos.length} photo(s) attached
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #2d3748'
      }}>
        <StatusBadge status={report.status} />
        {report.submitted_by && (
          <span style={{ fontSize: '0.85rem', color: '#718096' }}>
            By: {report.submitted_by}
          </span>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const statusColors = {
    open: '#FF9800',
    in_progress: '#2196F3',
    resolved: '#4CAF50',
    closed: '#9E9E9E'
  }

  return (
    <span style={{
      padding: '0.25rem 0.75rem',
      background: (statusColors[status] || '#9E9E9E') + '20',
      color: statusColors[status] || '#9E9E9E',
      borderRadius: '4px',
      fontSize: '0.85rem',
      fontWeight: 600
    }}>
      {(status || 'open').toUpperCase()}
    </span>
  )
}

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontSize: '0.9rem',
  color: '#a0aec0',
  fontWeight: 500
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  background: '#0a0e14',
  border: '1px solid #2d3748',
  borderRadius: '8px',
  color: '#e0e0e0',
  fontSize: '1rem',
  boxSizing: 'border-box'
}
