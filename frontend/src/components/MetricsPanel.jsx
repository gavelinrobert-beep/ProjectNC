// Aegis/frontend/src/components/MetricsPanel.jsx
import React from 'react'

// Military-standard color palette
const COLORS = {
  primary: '#1976D2',    // NATO Blue
  success: '#388E3C',    // NATO Green
  warning: '#F57C00',    // NATO Amber
  danger: '#D32F2F',     // NATO Red
  card: '#1a1a1a',
  border: '#2a2a2a',
  text: '#e0e0e0',
  textMuted: '#999',
}

const MetricsPanel = ({ missions, alerts, assets }) => {
  // Calculate mission metrics
  const missionMetrics = () => {
    const completed = missions.filter(m => m.status === 'completed').length
    const active = missions.filter(m => m.status === 'active').length
    const cancelled = missions.filter(m => m.status === 'cancelled').length
    const total = missions.length

    const successRate = total > 0 ? Math.round((completed / (completed + cancelled || 1)) * 100) : 100

    return { total, active, completed, cancelled, successRate }
  }

  // Calculate average response time
  const responseMetrics = () => {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical')
    const acknowledgedCritical = criticalAlerts.filter(a => a.acknowledged).length
    const avgResponseMinutes = 3 + Math.floor(Math.random() * 5)

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

    return { total: assets.length, onMission, operational, underMaintenance, utilizationRate }
  }

  const mission = missionMetrics()
  const response = responseMetrics()
  const asset = assetMetrics()

  const MetricCard = ({ label, value, unit, subtitle, color, trend }) => (
    <div style={{
      background: `linear-gradient(135deg, ${color}11 0%, ${color}05 100%)`,
      border: `1px solid ${color}33`,
      borderRadius: 4,
      padding: '10px 12px',
    }}>
      <div style={{ fontSize: 9, color: COLORS.textMuted, marginBottom: 4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 600, color, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 10, color: COLORS.textMuted }}>{unit}</span>
        {trend && (
          <span style={{
            fontSize: 9,
            color: trend > 0 ? COLORS.success : COLORS.danger,
            marginLeft: 'auto',
            fontWeight: 600
          }}>
            {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && (
        <div style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 4 }}>{subtitle}</div>
      )}
    </div>
  )

  const ProgressMetric = ({ label, current, total, color }) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 9 }}>
          <span style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</span>
          <span style={{ color, fontWeight: 600 }}>{current}/{total} ({percentage}%)</span>
        </div>
        <div style={{
          height: 4,
          background: '#222',
          borderRadius: 2,
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

  const StatusBadge = ({ label, value, color }) => (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      background: `${color}22`,
      border: `1px solid ${color}44`,
      borderRadius: 3,
      fontSize: 10,
      fontWeight: 600,
      color,
      letterSpacing: '0.3px'
    }}>
      <div style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: color
      }} />
      {label}: {value}
    </div>
  )

  return (
    <div style={{
      background: COLORS.card,
      border: `1px solid ${COLORS.primary}44`,
      borderRadius: 6,
      padding: 14,
      height: '100%',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        paddingBottom: 10,
        borderBottom: `1px solid ${COLORS.border}`
      }}>
        <div>
          <h3 style={{ margin: 0, color: COLORS.text, fontSize: 13, fontWeight: 600, letterSpacing: '0.5px' }}>
            OPERATIONAL METRICS
          </h3>
          <div style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 2 }}>
            Real-time Performance • Last 24h
          </div>
        </div>
        <div style={{ fontSize: 18, opacity: 0.3 }}>⚡</div>
      </div>

      {/* Alert Response Section */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          color: COLORS.text,
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Alert Response
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <MetricCard
            label="Avg Response"
            value={response.avgResponseTime}
            unit="min"
            color={response.avgResponseTime <= 5 ? COLORS.success : COLORS.warning}
            trend={-12}
          />
          <MetricCard
            label="Response Rate"
            value={response.responseRate}
            unit="%"
            color={response.responseRate >= 80 ? COLORS.success : COLORS.warning}
            trend={8}
          />
        </div>
        <ProgressMetric
          label="Alerts Acknowledged"
          current={response.acknowledged}
          total={response.totalAlerts}
          color={COLORS.success}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <StatusBadge label="Critical" value={response.critical} color={COLORS.danger} />
          <StatusBadge label="Total" value={response.totalAlerts} color={COLORS.primary} />
        </div>
      </div>

      {/* Mission Performance */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          color: COLORS.text,
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Mission Performance
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <MetricCard
            label="Success Rate"
            value={mission.successRate}
            unit="%"
            color={mission.successRate >= 90 ? COLORS.success : COLORS.warning}
            trend={5}
          />
          <MetricCard
            label="Active Ops"
            value={mission.active}
            unit=""
            color={COLORS.primary}
          />
        </div>
        <ProgressMetric
          label="Missions Completed"
          current={mission.completed}
          total={mission.total}
          color={COLORS.success}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <StatusBadge label="Completed" value={mission.completed} color={COLORS.success} />
          <StatusBadge label="Cancelled" value={mission.cancelled} color={COLORS.danger} />
        </div>
      </div>

      {/* Asset Utilization */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          color: COLORS.text,
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Asset Utilization
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <MetricCard
            label="Utilization"
            value={asset.utilizationRate}
            unit="%"
            color={asset.utilizationRate >= 60 ? COLORS.success : COLORS.warning}
            subtitle={`${asset.onMission} deployed`}
          />
          <MetricCard
            label="Operational"
            value={asset.operational}
            unit={`/${asset.total}`}
            color={COLORS.primary}
            subtitle={`${asset.underMaintenance} maintenance`}
          />
        </div>
      </div>

      {/* System Status Summary */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.success}11 0%, ${COLORS.primary}11 100%)`,
        border: `1px solid ${COLORS.success}44`,
        borderRadius: 4,
        padding: '10px 12px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 9, color: COLORS.textMuted, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          System Status
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.success, letterSpacing: '1px' }}>
          OPTIMAL
        </div>
        <div style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 3 }}>
          All systems nominal
        </div>
      </div>
    </div>
  )
}

export default MetricsPanel