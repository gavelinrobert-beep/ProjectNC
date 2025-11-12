// Aegis/frontend/src/components/ReadinessPanel.jsx
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

const ReadinessPanel = ({ assets, missions, bases, inventory }) => {
  // Calculate readiness metrics
  const calculateReadiness = () => {
    const groundAssets = assets.filter(a =>
      ['truck', 'armored_vehicle', 'supply_vehicle', 'command_vehicle'].includes(a.type)
    )
    const airAssets = assets.filter(a =>
      ['fighter_jet', 'cargo_plane', 'helicopter', 'transport_helicopter', 'reconnaissance_plane', 'uav'].includes(a.type)
    )
    const navalAssets = assets.filter(a =>
      ['patrol_boat', 'corvette', 'submarine', 'supply_ship', 'landing_craft'].includes(a.type)
    )

    const calcCategoryReadiness = (categoryAssets) => {
      if (categoryAssets.length === 0) return 0
      const operational = categoryAssets.filter(a =>
        a.maintenance_status === 'operational' &&
        (a.fuel_level || 100) > 20 &&
        a.status !== 'maintenance'
      ).length
      return Math.round((operational / categoryAssets.length) * 100)
    }

    return {
      ground: {
        readiness: calcCategoryReadiness(groundAssets),
        total: groundAssets.length,
        operational: groundAssets.filter(a => a.maintenance_status === 'operational').length,
        onMission: groundAssets.filter(a => missions.some(m => m.asset_id === a.id && m.status === 'active')).length
      },
      air: {
        readiness: calcCategoryReadiness(airAssets),
        total: airAssets.length,
        operational: airAssets.filter(a => a.maintenance_status === 'operational').length,
        onMission: airAssets.filter(a => missions.some(m => m.asset_id === a.id && m.status === 'active')).length
      },
      naval: {
        readiness: calcCategoryReadiness(navalAssets),
        total: navalAssets.length,
        operational: navalAssets.filter(a => a.maintenance_status === 'operational').length,
        onMission: navalAssets.filter(a => missions.some(m => m.asset_id === a.id && m.status === 'active')).length
      }
    }
  }

  const readiness = calculateReadiness()

  // Calculate supply readiness
  const supplyReadiness = () => {
    if (!inventory || inventory.length === 0) return 85
    const totalItems = inventory.length
    const adequateStock = inventory.filter(item => {
      const stockLevel = (item.quantity / item.min_stock_level) * 100
      return stockLevel >= 100
    }).length
    return Math.round((adequateStock / totalItems) * 100)
  }

  const supply = supplyReadiness()

  // Overall readiness score
  const overallReadiness = Math.round(
    (readiness.ground.readiness + readiness.air.readiness + readiness.naval.readiness + supply) / 4
  )

  const getReadinessColor = (value) => {
    if (value >= 80) return COLORS.success
    if (value >= 60) return COLORS.warning
    if (value >= 40) return COLORS.warning
    return COLORS.danger
  }

  const getReadinessLabel = (value) => {
    if (value >= 90) return 'EXCELLENT'
    if (value >= 75) return 'GOOD'
    if (value >= 60) return 'ADEQUATE'
    if (value >= 40) return 'MARGINAL'
    return 'CRITICAL'
  }

  const StatusIndicator = ({ value }) => {
    const color = getReadinessColor(value)
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 8px',
        background: `${color}22`,
        border: `1px solid ${color}`,
        borderRadius: 3,
        fontSize: 9,
        fontWeight: 600,
        color,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 4px ${color}`
        }} />
        {getReadinessLabel(value)}
      </div>
    )
  }

  const ReadinessBar = ({ label, value, total, operational, onMission, icon }) => {
    const color = getReadinessColor(value)
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            color: COLORS.text,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {icon && <span style={{ marginRight: 6, opacity: 0.6 }}>{icon}</span>}
            {label}
          </span>
          <StatusIndicator value={value} />
        </div>
        <div style={{
          height: 8,
          background: '#222',
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid #333',
          position: 'relative'
        }}>
          <div style={{
            width: `${value}%`,
            height: '100%',
            background: color,
            transition: 'width 0.5s ease',
            boxShadow: `inset 0 1px 2px rgba(0,0,0,0.3)`
          }} />
          {/* Threshold markers */}
          <div style={{
            position: 'absolute',
            left: '80%',
            top: 0,
            bottom: 0,
            width: 1,
            background: 'rgba(255,255,255,0.2)'
          }} />
          <div style={{
            position: 'absolute',
            left: '60%',
            top: 0,
            bottom: 0,
            width: 1,
            background: 'rgba(255,255,255,0.1)'
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 5,
          fontSize: 9,
          color: COLORS.textMuted
        }}>
          <span>Total: <strong style={{ color: COLORS.text }}>{total}</strong></span>
          <span>Ready: <strong style={{ color: COLORS.success }}>{operational}</strong></span>
          <span>Deployed: <strong style={{ color: COLORS.primary }}>{onMission}</strong></span>
          <span><strong style={{ color, fontSize: 10 }}>{value}%</strong></span>
        </div>
      </div>
    )
  }

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
            NATO FORCE READINESS
          </h3>
          <div style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 2 }}>
            Swedish Armed Forces • Real-time Status
          </div>
        </div>
        <div style={{ fontSize: 18, opacity: 0.3 }}>🎖️</div>
      </div>

      {/* Overall Readiness Score */}
      <div style={{
        background: `linear-gradient(135deg, ${getReadinessColor(overallReadiness)}15 0%, ${getReadinessColor(overallReadiness)}08 100%)`,
        border: `2px solid ${getReadinessColor(overallReadiness)}`,
        borderRadius: 6,
        padding: 14,
        marginBottom: 16,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background percentage arc */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120%',
          height: '120%',
          opacity: 0.03,
          fontSize: 120,
          fontWeight: 'bold',
          color: getReadinessColor(overallReadiness),
          pointerEvents: 'none'
        }}>
          {overallReadiness}
        </div>

        <div style={{
          fontSize: 9,
          color: COLORS.textMuted,
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          position: 'relative'
        }}>
          Overall Force Readiness
        </div>
        <div style={{
          fontSize: 38,
          fontWeight: 600,
          color: getReadinessColor(overallReadiness),
          lineHeight: 1,
          position: 'relative'
        }}>
          {overallReadiness}%
        </div>
        <div style={{
          marginTop: 8,
          position: 'relative'
        }}>
          <StatusIndicator value={overallReadiness} />
        </div>
        <div style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 8, position: 'relative' }}>
          NATO Article 5 Response: <strong style={{
            color: overallReadiness >= 80 ? COLORS.success : overallReadiness >= 60 ? COLORS.warning : COLORS.danger
          }}>
            {overallReadiness >= 80 ? 'READY' : overallReadiness >= 60 ? 'STANDBY' : 'LIMITED'}
          </strong>
        </div>
      </div>

      {/* Category Readiness */}
      <div>
        <ReadinessBar
          label="Ground Forces"
          icon="🚛"
          value={readiness.ground.readiness}
          total={readiness.ground.total}
          operational={readiness.ground.operational}
          onMission={readiness.ground.onMission}
        />
        <ReadinessBar
          label="Air Forces"
          icon="✈️"
          value={readiness.air.readiness}
          total={readiness.air.total}
          operational={readiness.air.operational}
          onMission={readiness.air.onMission}
        />
        <ReadinessBar
          label="Naval Forces"
          icon="⚓"
          value={readiness.naval.readiness}
          total={readiness.naval.total}
          operational={readiness.naval.operational}
          onMission={readiness.naval.onMission}
        />
        <ReadinessBar
          label="Supply Chain"
          icon="📦"
          value={supply}
          total={inventory.length}
          operational={inventory.filter(i => (i.quantity / i.min_stock_level) >= 1).length}
          onMission={bases.length}
        />
      </div>

      {/* Quick Stats */}
      <div style={{
        marginTop: 14,
        paddingTop: 14,
        borderTop: `1px solid ${COLORS.border}`,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: COLORS.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Deploy Time
          </div>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            color: overallReadiness >= 80 ? COLORS.success : overallReadiness >= 60 ? COLORS.warning : COLORS.danger
          }}>
            {overallReadiness >= 80 ? '< 2h' : overallReadiness >= 60 ? '< 4h' : '< 8h'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: COLORS.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Bases
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.primary }}>
            {bases.length}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: COLORS.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Missions
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.warning }}>
            {missions.filter(m => m.status === 'active').length}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: COLORS.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Status
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: getReadinessColor(overallReadiness) }}>
            {overallReadiness >= 80 ? 'READY' : overallReadiness >= 60 ? 'STANDBY' : 'ALERT'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReadinessPanel