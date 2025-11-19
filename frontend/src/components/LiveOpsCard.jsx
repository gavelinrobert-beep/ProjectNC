import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'
import QuickActionButton from './QuickActionButton'
import TrackPackageModal from './TrackPackageModal'

export default function LiveOpsCard({ refreshInterval = 10000 }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTrackModal, setShowTrackModal] = useState(false)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const loadData = async () => {
    try {
      const result = await api.liveOperations()
      setData(result)
      setError(null)
    } catch (err) {
      console.error('Failed to load live operations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !data) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ color: '#f44336', fontSize: '0.9rem' }}>
          Failed to load live operations: {error}
        </div>
      </div>
    )
  }

  const metrics = [
    {
      icon: '👨‍💼',
      label: 'Drivers on Duty',
      value: data?.drivers_on_duty || 0,
      color: '#2196F3'
    },
    {
      icon: '🛣️',
      label: 'Active Routes',
      value: data?.active_routes || 0,
      color: '#9C27B0'
    },
    {
      icon: '📦',
      label: 'Deliveries In-Progress',
      value: data?.deliveries_in_progress || 0,
      color: '#FF9800'
    }
  ]

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#1a3a4a'
        }}>
          🔴 Live Operations
        </h3>
        <div style={{
          fontSize: '0.8rem',
          color: '#999',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#f44336',
            animation: 'pulse 2s infinite'
          }} />
          Live
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {metrics.map((metric, index) => (
          <div
            key={index}
            style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '8px',
              border: `2px solid ${metric.color}20`,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = metric.color + '10'
              e.currentTarget.style.borderColor = metric.color
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f5f5'
              e.currentTarget.style.borderColor = metric.color + '20'
            }}
          >
            <div style={{
              fontSize: '1.5rem',
              marginBottom: '0.5rem'
            }}>
              {metric.icon}
            </div>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: metric.color,
              marginBottom: '0.25rem'
            }}>
              {metric.value}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#666',
              fontWeight: 500
            }}>
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Next Delivery ETA */}
      {data?.next_delivery_eta && (
        <div style={{
          padding: '1rem',
          background: '#e8f5e9',
          borderRadius: '8px',
          borderLeft: '4px solid #4CAF50',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>⏱️</span>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#333'
            }}>
              Next Delivery ETA:
            </span>
          </div>
          <span style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#4CAF50'
          }}>
            {data.next_delivery_eta}
          </span>
        </div>
      )}

      {/* No active deliveries message */}
      {!data?.next_delivery_eta && data?.deliveries_in_progress === 0 && (
        <div style={{
          padding: '1rem',
          background: '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#999',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          No active deliveries at the moment
        </div>
      )}

      {/* Quick Actions */}
      <div style={{
        marginTop: '1.5rem',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <QuickActionButton
          icon="📦"
          label="Track Package"
          variant="primary"
          size="small"
          onClick={() => setShowTrackModal(true)}
        />
        <QuickActionButton
          icon="➕"
          label="Create Delivery"
          variant="secondary"
          size="small"
          onClick={() => alert('Create delivery modal coming soon!')}
        />
      </div>

      {/* Track Package Modal */}
      <TrackPackageModal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
      />

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}
      </style>
    </div>
  )
}
