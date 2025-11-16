import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const STATUS_COLORS = {
  available: '#4CAF50',
  in_use: '#2196F3',
  parked: '#9E9E9E',
  maintenance: '#FF9800',
  out_of_service: '#F44336'
}

const STATUS_ICONS = {
  available: '✅',
  in_use: '🚛',
  parked: '🅿️',
  maintenance: '🔧',
  out_of_service: '⚠️'
}

const STATUS_LABELS = {
  available: 'Available',
  in_use: 'In Use',
  parked: 'Parked',
  maintenance: 'Maintenance',
  out_of_service: 'Out of Service'
}

export default function ResourceStatusWidget({ refreshInterval = 10000 }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const loadData = async () => {
    try {
      const result = await api.resourceStatus()
      setData(result)
      setError(null)
    } catch (err) {
      console.error('Failed to load resource status:', err)
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
          Failed to load resource status: {error}
        </div>
      </div>
    )
  }

  const statusItems = [
    { key: 'available', count: data?.available || 0 },
    { key: 'in_use', count: data?.in_use || 0 },
    { key: 'parked', count: data?.parked || 0 },
    { key: 'maintenance', count: data?.maintenance || 0 },
    { key: 'out_of_service', count: data?.out_of_service || 0 }
  ]

  const utilizationRate = data?.utilization_rate || 0
  const avgResponseTime = data?.avg_response_time_minutes || 0

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
          🚗 Fleet Status
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
            background: '#4CAF50',
            animation: 'pulse 2s infinite'
          }} />
          Live
        </div>
      </div>

      {/* Status Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {statusItems.map(({ key, count }) => (
          <div
            key={key}
            style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '8px',
              border: `2px solid ${STATUS_COLORS[key]}20`,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = STATUS_COLORS[key] + '10'
              e.currentTarget.style.borderColor = STATUS_COLORS[key]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f5f5'
              e.currentTarget.style.borderColor = STATUS_COLORS[key] + '20'
            }}
          >
            <div style={{
              fontSize: '1.5rem',
              marginBottom: '0.5rem'
            }}>
              {STATUS_ICONS[key]}
            </div>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: STATUS_COLORS[key],
              marginBottom: '0.25rem'
            }}>
              {count}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#666',
              fontWeight: 500
            }}>
              {STATUS_LABELS[key]}
            </div>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        padding: '1rem',
        background: '#f5f5f5',
        borderRadius: '8px'
      }}>
        {/* Utilization Rate */}
        <div>
          <div style={{
            fontSize: '0.8rem',
            color: '#666',
            marginBottom: '0.5rem',
            fontWeight: 600
          }}>
            Utilization Rate
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.25rem'
          }}>
            <span style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: utilizationRate > 80 ? '#4CAF50' : utilizationRate > 50 ? '#FF9800' : '#f44336'
            }}>
              {utilizationRate}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#666' }}>%</span>
          </div>
          <div style={{
            height: '6px',
            background: '#e0e0e0',
            borderRadius: '3px',
            overflow: 'hidden',
            marginTop: '0.5rem'
          }}>
            <div style={{
              height: '100%',
              width: `${utilizationRate}%`,
              background: utilizationRate > 80 ? '#4CAF50' : utilizationRate > 50 ? '#FF9800' : '#f44336',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Average Response Time */}
        <div>
          <div style={{
            fontSize: '0.8rem',
            color: '#666',
            marginBottom: '0.5rem',
            fontWeight: 600
          }}>
            Avg Response Time
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.25rem'
          }}>
            <span style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: avgResponseTime < 30 ? '#4CAF50' : avgResponseTime < 60 ? '#FF9800' : '#f44336'
            }}>
              {avgResponseTime}
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#666' }}>min</span>
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#999',
            marginTop: '0.5rem'
          }}>
            Estimated deployment time
          </div>
        </div>
      </div>

      {/* Total Assets */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: '#f5f5f5',
        borderRadius: '6px',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600 }}>
          Total Fleet Size: 
        </span>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a3a4a', marginLeft: '0.5rem' }}>
          {data?.total || 0}
        </span>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  )
}
