// frontend/src/pages/Admin.jsx
import React, { useState } from 'react'
import { BRAND } from '../lib/constants'
import AdminGeofences from '../components/AdminGeofences'
import ExportManager from '../components/ExportManager'

export default function Admin() {
  const [selectedTab, setSelectedTab] = useState('geofences')

  return (
    <div style={{ maxWidth: '1400px' }}>
      <h1 style={{ fontSize: '1.5rem', color: '#e0e0e0', marginBottom: '2rem' }}>
        ⚙️ Administration
      </h1>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #2d3748',
        paddingBottom: '0.5rem'
      }}>
        {['geofences', 'users', 'exports', 'settings', 'logs'].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              color: selectedTab === tab ? '#63b3ed' : '#718096',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderBottom: selectedTab === tab ? '3px solid #63b3ed' : '3px solid transparent',
              textTransform: 'capitalize',
              fontWeight: selectedTab === tab ? 600 : 400
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {selectedTab === 'geofences' && <AdminGeofences />}
      {selectedTab === 'users' && <PlaceholderTab icon="👥" title="User Management" />}
      {selectedTab === 'exports' && <ExportManager />}
      {selectedTab === 'settings' && <PlaceholderTab icon="⚙️" title="System Settings" />}
      {selectedTab === 'logs' && <PlaceholderTab icon="📜" title="System Logs" />}
    </div>
  )
}

function PlaceholderTab({ icon, title }) {
  return (
    <div style={{
      background: '#1a1f2e',
      border: '1px solid #2d3748',
      borderRadius: '12px',
      padding: '3rem',
      textAlign: 'center',
      color: '#718096'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h2 style={{ marginBottom: '0.5rem' }}>{title}</h2>
      <p>Coming soon...</p>
    </div>
  )
}