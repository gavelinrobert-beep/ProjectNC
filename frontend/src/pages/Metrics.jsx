// frontend/src/pages/Metrics.jsx
import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function Metrics() {
  const [shipments, setShipments] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week') // week, month, quarter

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [shipmentsData, driversData] = await Promise.all([
        api.get('/api/shipments'),
        api.get('/api/drivers')
      ])
      setShipments(shipmentsData)
      setDrivers(driversData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics
  const calculateMetrics = () => {
    const now = new Date()
    const timeRangeMs = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      quarter: 90 * 24 * 60 * 60 * 1000
    }[timeRange]

    const cutoffDate = new Date(now - timeRangeMs)

    // Filter shipments by time range
    const recentShipments = shipments.filter(s => {
      const createdAt = new Date(s.created_at)
      return createdAt >= cutoffDate
    })

    const deliveredShipments = recentShipments.filter(s => s.status === 'delivered')
    const totalShipments = recentShipments.length

    // On-time delivery rate
    const onTimeDeliveries = deliveredShipments.filter(s => {
      if (!s.requested_delivery_date || !s.actual_delivery_time) return false
      const requested = new Date(s.requested_delivery_date)
      const actual = new Date(s.actual_delivery_time)
      return actual <= requested
    }).length

    const onTimeRate = deliveredShipments.length > 0 
      ? (onTimeDeliveries / deliveredShipments.length * 100).toFixed(1)
      : 0

    // Average delivery time
    const deliveryTimes = deliveredShipments
      .filter(s => s.actual_pickup_time && s.actual_delivery_time)
      .map(s => {
        const pickup = new Date(s.actual_pickup_time)
        const delivery = new Date(s.actual_delivery_time)
        return (delivery - pickup) / (1000 * 60 * 60) // hours
      })

    const avgDeliveryTime = deliveryTimes.length > 0
      ? (deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length).toFixed(1)
      : 0

    // Shipment status breakdown
    const statusBreakdown = recentShipments.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1
      return acc
    }, {})

    // Cost metrics (if available)
    const totalCost = deliveredShipments
      .filter(s => s.estimated_cost)
      .reduce((sum, s) => sum + (s.estimated_cost || 0), 0)

    const avgCostPerDelivery = deliveredShipments.length > 0
      ? (totalCost / deliveredShipments.length).toFixed(2)
      : 0

    // Driver utilization
    const activeDrivers = drivers.filter(d => d.employment_status === 'active').length
    const driversWithAssignments = new Set(
      recentShipments.filter(s => s.assigned_driver_id).map(s => s.assigned_driver_id)
    ).size

    const driverUtilization = activeDrivers > 0
      ? (driversWithAssignments / activeDrivers * 100).toFixed(1)
      : 0

    return {
      totalShipments,
      deliveredShipments: deliveredShipments.length,
      onTimeRate,
      avgDeliveryTime,
      statusBreakdown,
      totalCost,
      avgCostPerDelivery,
      activeDrivers,
      driverUtilization
    }
  }

  const metrics = loading ? null : calculateMetrics()

  const MetricCard = ({ title, value, subtitle, icon, color = 'var(--nordic-blue-primary)' }) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', fontWeight: 600 }}>
          {title}
        </div>
        <div style={{ fontSize: '2rem' }}>{icon}</div>
      </div>
      <div style={{ fontSize: '2.5rem', fontWeight: 700, color }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
          {subtitle}
        </div>
      )}
    </div>
  )

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
            📊 Performance Metrics
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--dark-gray)' }}>
            Track delivery performance, costs, and operational efficiency
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['week', 'month', 'quarter'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '0.5rem 1rem',
                background: timeRange === range ? 'var(--nordic-blue-primary)' : 'white',
                color: timeRange === range ? 'white' : 'var(--dark-gray)',
                border: `2px solid ${timeRange === range ? 'var(--nordic-blue-primary)' : 'var(--light-gray)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                textTransform: 'capitalize'
              }}
            >
              {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
          Loading metrics...
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <MetricCard
              title="On-Time Delivery Rate"
              value={`${metrics.onTimeRate}%`}
              subtitle={`${metrics.deliveredShipments} delivered`}
              icon="✅"
              color={metrics.onTimeRate >= 95 ? 'var(--success)' : metrics.onTimeRate >= 85 ? 'var(--warning)' : 'var(--error)'}
            />
            <MetricCard
              title="Avg Delivery Time"
              value={`${metrics.avgDeliveryTime}h`}
              subtitle="From pickup to delivery"
              icon="⏱️"
              color="var(--nordic-blue-primary)"
            />
            <MetricCard
              title="Total Shipments"
              value={metrics.totalShipments}
              subtitle={`${timeRange === 'week' ? '7' : timeRange === 'month' ? '30' : '90'} days`}
              icon="📦"
              color="var(--nordic-blue-accent)"
            />
            <MetricCard
              title="Driver Utilization"
              value={`${metrics.driverUtilization}%`}
              subtitle={`${metrics.activeDrivers} active drivers`}
              icon="👷"
              color={metrics.driverUtilization >= 80 ? 'var(--success)' : 'var(--warning)'}
            />
          </div>

          {/* Cost Metrics */}
          {metrics.totalCost > 0 && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)',
              marginBottom: '2rem'
            }}>
              <h2 style={{ marginTop: 0, color: 'var(--charcoal)', fontSize: '1.2rem' }}>
                💰 Cost Analysis
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--gray)', marginBottom: '0.5rem' }}>
                    Total Delivery Cost
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--nordic-blue-primary)' }}>
                    {metrics.totalCost.toLocaleString()} SEK
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--gray)', marginBottom: '0.5rem' }}>
                    Average Cost per Delivery
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--nordic-blue-primary)' }}>
                    {metrics.avgCostPerDelivery} SEK
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Breakdown */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)'
          }}>
            <h2 style={{ marginTop: 0, color: 'var(--charcoal)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              📋 Shipment Status Breakdown
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {Object.entries(metrics.statusBreakdown).map(([status, count]) => {
                const statusColors = {
                  created: 'var(--gray)',
                  picked_up: 'var(--nordic-blue-light)',
                  in_transit: 'var(--nordic-blue-primary)',
                  out_for_delivery: 'var(--warning)',
                  delivered: 'var(--success)',
                  failed: 'var(--error)',
                  cancelled: 'var(--dark-gray)'
                }
                return (
                  <div
                    key={status}
                    style={{
                      padding: '1rem',
                      background: 'var(--off-white)',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      color: statusColors[status] || 'var(--charcoal)',
                      marginBottom: '0.5rem'
                    }}>
                      {count}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: 'var(--dark-gray)',
                      textTransform: 'capitalize'
                    }}>
                      {status.replace('_', ' ')}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
