// AEGIS Light - Export Manager Component
// Provides CSV and PDF export functionality for all major entities

import React, { useState } from 'react'
import { API_BASE } from '../lib/api'
import { authHeader } from '../lib/auth'

const EXPORT_OPTIONS = [
  { id: 'assets', name: 'Fleet & Resources', icon: '🚛', endpoint: '/api/exports/assets.csv' },
  { id: 'missions', name: 'Tasks & Missions', icon: '📋', endpoint: '/api/exports/missions.csv' },
  { id: 'inventory', name: 'Inventory', icon: '📦', endpoint: '/api/exports/inventory.csv' },
  { id: 'alerts', name: 'Alerts', icon: '🚨', endpoint: '/api/exports/alerts.csv' },
  { id: 'bases', name: 'Locations', icon: '📍', endpoint: '/api/exports/bases.csv' },
  { id: 'operations', name: 'Operations Report', icon: '📊', endpoint: '/api/exports/operations-report.csv' },
]

export default function ExportManager({ compact = false }) {
  const [exporting, setExporting] = useState(null)
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })

  const handleExport = async (option) => {
    setExporting(option.id)
    
    try {
      let url = API_BASE + option.endpoint
      
      // Add date range for operations report
      if (option.id === 'operations' && (dateRange.start || dateRange.end)) {
        const params = new URLSearchParams()
        if (dateRange.start) params.append('start_date', dateRange.start)
        if (dateRange.end) params.append('end_date', dateRange.end)
        url += '?' + params.toString()
      }
      
      const response = await fetch(url, {
        headers: authHeader()
      })
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }
      
      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `aegis_${option.id}_${new Date().toISOString().split('T')[0]}.csv`
      
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="?(.+)"?/)
        if (matches && matches[1]) {
          filename = matches[1]
        }
      }
      
      // Download the file
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      console.log(`Successfully exported ${option.name}`)
    } catch (error) {
      console.error('Export error:', error)
      alert(`Failed to export ${option.name}: ${error.message}`)
    } finally {
      setExporting(null)
    }
  }

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {EXPORT_OPTIONS.map(option => (
          <button
            key={option.id}
            onClick={() => handleExport(option)}
            disabled={exporting === option.id}
            style={{
              padding: '0.5rem 1rem',
              background: exporting === option.id ? '#2d3748' : '#1a1f2e',
              color: exporting === option.id ? '#718096' : '#63b3ed',
              border: '1px solid #2d3748',
              borderRadius: '6px',
              cursor: exporting === option.id ? 'wait' : 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{option.icon}</span>
            {exporting === option.id ? 'Exporting...' : option.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📤 Export Data</h2>
        <p style={{ color: '#718096', fontSize: '0.95rem' }}>
          Download reports and data in CSV format for analysis and record-keeping.
        </p>
      </div>

      {/* Date Range for Operations Report */}
      <div style={{
        background: '#1a1f2e',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #2d3748',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>
          📅 Date Range (for Operations Report)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#718096' }}>
          Leave empty for default range (last 7 days)
        </div>
      </div>

      {/* Export Options Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem'
      }}>
        {EXPORT_OPTIONS.map(option => (
          <ExportCard
            key={option.id}
            option={option}
            exporting={exporting === option.id}
            onExport={() => handleExport(option)}
          />
        ))}
      </div>

      {/* Export Information */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'rgba(99, 179, 237, 0.1)',
        border: '1px solid #63b3ed',
        borderRadius: '12px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#63b3ed' }}>
          ℹ️ About Exports
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#e0e0e0', lineHeight: 1.8 }}>
          <li>All exports are in CSV format, compatible with Excel and Google Sheets</li>
          <li>Data reflects the current state at time of export</li>
          <li>Operations Report includes summary statistics for the selected date range</li>
          <li>Exports require authentication and log all download activity</li>
          <li>Large datasets may take a few seconds to generate</li>
        </ul>
      </div>
    </div>
  )
}

function ExportCard({ option, exporting, onExport }) {
  return (
    <div style={{
      background: '#1a1f2e',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid #2d3748',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#63b3ed'
      e.currentTarget.style.transform = 'translateY(-2px)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#2d3748'
      e.currentTarget.style.transform = 'translateY(0)'
    }}
    >
      <div>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          {option.icon}
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
          {option.name}
        </h3>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>
          Export all {option.name.toLowerCase()} data to CSV
        </p>
      </div>
      
      <button
        onClick={onExport}
        disabled={exporting}
        style={{
          marginTop: '1.5rem',
          padding: '0.75rem',
          background: exporting ? '#2d3748' : '#63b3ed',
          color: exporting ? '#718096' : '#0a0e14',
          border: 'none',
          borderRadius: '8px',
          cursor: exporting ? 'wait' : 'pointer',
          fontWeight: 600,
          fontSize: '0.95rem',
          width: '100%'
        }}
      >
        {exporting ? 'Exporting...' : '📥 Export CSV'}
      </button>
    </div>
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
