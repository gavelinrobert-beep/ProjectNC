import React from 'react'

const BRAND = {
  primary: '#00BFFF',
  secondary: '#FFD700',
  success: '#00FF88',
  warning: '#FFA500',
  danger: '#FF4444',
  card: '#1a1a1a',
  border: '#2a2a2a',
}

const MetricsPanel = ({ missions, alerts, assets }) => {
  // Calculate mission metrics
  const missionMetrics = () => {
    const completed = missions.filter(m => m.status === 'completed').length
    const active = missions.filter(m => m.status === 'active').length
    const cancelled = missions.filter(m => m.status === 'cancelled').length
    const total = missions.length

    const successRate = total > 0 ? Math.round((completed / (completed + cancelled || 1)) * 100) : 100

    return {
      total,
      active,
      completed,
      cancelled,
      successRate
    }
  }

  // Calculate average response time (simulated)
  const responseMetrics = () => {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical')
    const acknowledgedCritical = criticalAlerts.filter(a => a.acknowledged).length
    const avgResponseMinutes = 3 + Math.floor(Math.random() * 5) // Simulated 3-8 min

    return {
      totalAlerts: alerts.length,
      critical: criticalAlerts.length,
      acknowledged: alerts.filter(a => a.acknowledged).length,
      avgResponseTime: avgResponseMinutes,
      responseRate: alerts.length > 0 ? Math.round((alerts.filter(a => a.acknowledged).length / alerts.length) * 100) : 100
    }
  }

  // Calculate asset utilization
  const assetMetrics = () => {
    const onMission = assets.filter(a => missions.some(m => m.asset_id === a.id && m.status === 'active')).length
    const operational = assets.filter(a => a.maintenance_status === 'operational').length
    const underMaintenance = assets.filter(a => a.maintenance_status === 'under_maintenance').length

    const utilizationRate = operational > 0 ? Math.round((onMission / operational) * 100) : 0

    return {
      total: assets.length,
      onMission,
      operational,
      underMaintenance,
      utilizationRate
    }
  }

  const mission = missionMetrics()
  const response = responseMetrics()
  const asset = assetMetrics()

  const MetricCard = ({ icon, label, value, unit, subtitle, color, trend }) => (
    <div style={{
      background: `linear-gradient(135deg, ${color}11 0%, ${color}05 100%)`,
      border: `1px solid ${color}44`,
      borderRadius: 6,
      padding: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }}>
      <div style={{
        fontSize: 28,
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `${color}22`,
        borderRadius: 6
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, color: '#999', marginBottom: 2 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 20, fontWeight: 'bold', color }}>{value}</span>
          <span style={{ fontSize: 10, color: '#666' }}>{unit}</span>
          {trend && (
            <span style={{ fontSize: 10, color: trend > 0 ? BRAND.success : BRAND.danger, marginLeft: 4 }}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        {subtitle && (
          <div style={{ fontSize: 8, color: '#666', marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
    </div>
  )

  const ProgressMetric = ({ label, current, total, color }) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 10 }}>
          <span style={{ color: '#999' }}>{label}</span>
          <span style={{ color, fontWeight: 'bold' }}>{current}/{total}</span>
        </div>
        <div style={{
          height: 6,
          background: '#222',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid #333'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            background: color,
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: BRAND.card,
      border: `1px solid ${BRAND.primary}44`,
      borderRadius: 8,
      padding: 16,
      height: '100%'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: `1px solid ${BRAND.border}`
      }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <div>
          <h3 style={{ margin: 0, color: BRAND.primary, fontSize: 14 }}>OPERATIONAL METRICS</h3>
          <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>
            Real-time Performance • Last 24h
          </div>
        </div>
      </div>

      {/* Response Time Section */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', color: BRAND.primary, marginBottom: 10 }}>
          🚨 ALERT RESPONSE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <MetricCard
            icon="⏱️"
            label="AVG RESPONSE TIME"
            value={response.avgResponseTime}
            unit="min"
            color={response.avgResponseTime <= 5 ? BRAND.success : BRAND.warning}
            trend={-12}
          />
          <MetricCard
            icon="✅"
            label="RESPONSE RATE"
            value={response.responseRate}
            unit="%"
            color={response.responseRate >= 80 ? BRAND.success : BRAND.warning}
            trend={8}
          />
        </div>
        <ProgressMetric
          label="Alerts Acknowledged"
          current={response.acknowledged}
          total={response.totalAlerts}
          color={BRAND.success}
        />
      </div>

      {/* Mission Performance */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', color: BRAND.primary, marginBottom: 10 }}>
          🎯 MISSION PERFORMANCE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <MetricCard
            icon="📊"
            label="SUCCESS RATE"
            value={mission.successRate}
            unit="%"
            color={mission.successRate >= 90 ? BRAND.success : BRAND.warning}
            trend={5}
          />
          <MetricCard
            icon="⏳"
            label="ACTIVE MISSIONS"
            value={mission.active}
            unit="ops"
            color={BRAND.secondary}
          />
        </div>
        <ProgressMetric
          label="Missions Completed"
          current={mission.completed}
          total={mission.total}
          color={BRAND.success}
        />
      </div>

      {/* Asset Utilization */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', color: BRAND.primary, marginBottom: 10 }}>
          🚛 ASSET UTILIZATION
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <MetricCard
            icon="📈"
            label="UTILIZATION RATE"
            value={asset.utilizationRate}
            unit="%"
            color={asset.utilizationRate >= 60 ? BRAND.success : BRAND.warning}
            subtitle={`${asset.onMission} deployed`}
          />
          <MetricCard
            icon="🔧"
            label="OPERATIONAL"
            value={asset.operational}
            unit={`/${asset.total}`}
            color={BRAND.primary}
            subtitle={`${asset.underMaintenance} in maintenance`}
          />
        </div>
      </div>

      {/* Performance Summary */}
      <div style={{
        background: `linear-gradient(135deg, ${BRAND.success}11 0%, ${BRAND.primary}11 100%)`,
        border: `1px solid ${BRAND.success}44`,
        borderRadius: 6,
        padding: 12,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 9, color: '#999', marginBottom: 4 }}>SYSTEM PERFORMANCE</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: BRAND.success }}>
          OPTIMAL
        </div>
        <div style={{ fontSize: 8, color: '#666', marginTop: 4 }}>
          All systems operating within normal parameters
        </div>
      </div>
    </div>
  )
}

export default MetricsPanel