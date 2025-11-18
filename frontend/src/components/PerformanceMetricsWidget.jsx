import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' }
]

export default function PerformanceMetricsWidget({ refreshInterval = 30000 }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('7days')

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, refreshInterval)
    return () => clearInterval(interval)
  }, [period, refreshInterval])

  const loadData = async () => {
    try {
      const result = await api.performanceMetrics(period)
      setData(result)
      setError(null)
    } catch (err) {
      console.error('Failed to load performance metrics:', err)
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
          Failed to load performance metrics: {error}
        </div>
      </div>
    )
  }

  const getTrendIndicator = (trend) => {
    if (trend === null || trend === undefined) return null
    if (Math.abs(trend) < 5) return { icon: '→', color: '#999', text: '0%' }
    if (trend > 0) return { icon: '↑', color: '#4CAF50', text: `+${trend}%` }
    return { icon: '↓', color: '#f44336', text: `${trend}%` }
  }

  const metrics = [
    {
      icon: '📦',
      label: 'Deliveries',
      value: data?.deliveries_completed || 0,
      suffix: '',
      color: '#2196F3',
      trend: data?.deliveries_trend
    },
    {
      icon: '🛣️',
      label: 'Distance',
      value: data?.total_distance_km || 0,
      suffix: 'km',
      color: '#9C27B0',
      trend: data?.distance_trend
    },
    {
      icon: '⏱️',
      label: 'Avg Delivery Time',
      value: data?.avg_delivery_time_hours || 0,
      suffix: 'hrs',
      color: '#FF9800',
      format: (v) => v.toFixed(1),
      trend: data?.avg_time_trend
    },
    {
      icon: '✅',
      label: 'On-Time Rate',
      value: data?.ontime_delivery_rate || 0,
      suffix: '%',
      color: '#4CAF50',
      format: (v) => v.toFixed(1),
      trend: data?.ontime_trend
    },
    {
      icon: '🚛',
      label: 'Vehicle Utilization',
      value: data?.vehicle_utilization || 0,
      suffix: '%',
      color: '#00BCD4',
      format: (v) => v.toFixed(1),
      trend: null // Current snapshot, no trend
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
          📊 Performance Metrics
        </h3>
        
        {/* Period Selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '2px solid #e0e0e0',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#1a3a4a',
            cursor: 'pointer',
            background: 'white'
          }}
        >
          {PERIOD_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Period Label */}
      <div style={{
        fontSize: '0.85rem',
        color: '#999',
        marginBottom: '1rem',
        fontWeight: 500
      }}>
        Showing data for: {data?.period || 'Last 7 Days'}
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {metrics.map((metric, index) => {
          const displayValue = metric.format 
            ? metric.format(metric.value)
            : Math.round(metric.value)

          return (
            <div
              key={index}
              style={{
                background: '#f5f5f5',
                padding: '1.25rem',
                borderRadius: '8px',
                border: `2px solid ${metric.color}20`,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = metric.color + '10'
                e.currentTarget.style.borderColor = metric.color
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f5f5f5'
                e.currentTarget.style.borderColor = metric.color + '20'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Icon */}
              <div style={{
                fontSize: '2rem',
                marginBottom: '0.5rem'
              }}>
                {metric.icon}
              </div>

              {/* Value and Trend */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: metric.color
                  }}>
                    {displayValue}
                  </span>
                  {metric.suffix && (
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#666'
                    }}>
                      {metric.suffix}
                    </span>
                  )}
                </div>
                {(() => {
                  const trendInfo = getTrendIndicator(metric.trend)
                  return trendInfo && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: trendInfo.color
                    }}>
                      <span>{trendInfo.icon}</span>
                      <span>{trendInfo.text}</span>
                    </div>
                  )
                })()}
              </div>

              {/* Label */}
              <div style={{
                fontSize: '0.85rem',
                color: '#666',
                fontWeight: 600
              }}>
                {metric.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Bar */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#f5f5f5',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: data?.ontime_delivery_rate >= 90 ? '#4CAF50' : 
                       data?.ontime_delivery_rate >= 75 ? '#FF9800' : '#f44336'
          }} />
          <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 600 }}>
            {data?.ontime_delivery_rate >= 90 ? 'Excellent' :
             data?.ontime_delivery_rate >= 75 ? 'Good' : 'Needs Improvement'}
          </span>
        </div>

        <div style={{
          fontSize: '0.85rem',
          color: '#999'
        }}>
          Updated: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString('sv-SE') : 'N/A'}
        </div>
      </div>

      {/* Performance Indicator */}
      {data?.ontime_delivery_rate && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: data.ontime_delivery_rate >= 90 ? '#e8f5e9' : 
                     data.ontime_delivery_rate >= 75 ? '#fff3e0' : '#ffebee',
          borderRadius: '6px',
          borderLeft: `4px solid ${data.ontime_delivery_rate >= 90 ? '#4CAF50' : 
                                     data.ontime_delivery_rate >= 75 ? '#FF9800' : '#f44336'}`,
          fontSize: '0.85rem',
          color: '#333',
          fontWeight: 500
        }}>
          {data.ontime_delivery_rate >= 90 && (
            <span>🎉 Outstanding performance! Keep up the great work.</span>
          )}
          {data.ontime_delivery_rate >= 75 && data.ontime_delivery_rate < 90 && (
            <span>👍 Good performance. Focus on improving on-time deliveries.</span>
          )}
          {data.ontime_delivery_rate < 75 && (
            <span>⚠️ Performance needs attention. Review delivery processes.</span>
          )}
        </div>
      )}
    </div>
  )
}
