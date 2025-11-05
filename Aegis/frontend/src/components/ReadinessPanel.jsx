import React from 'react'

const BRAND = {
  primary: '#00BFFF',
  secondary: '#FFD700',
  success: '#00FF88',
  warning: '#FFA500',
  danger: '#FF4444',
  dark: '#0a0a0a',
  card: '#1a1a1a',
  border: '#2a2a2a',
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
    if (!inventory || inventory.length === 0) return 85 // Default if no inventory
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
    if (value >= 80) return BRAND.success
    if (value >= 60) return BRAND.secondary
    if (value >= 40) return BRAND.warning
    return BRAND.danger
  }

  const getReadinessLabel = (value) => {
    if (value >= 80) return 'EXCELLENT'
    if (value >= 60) return 'GOOD'
    if (value >= 40) return 'ADEQUATE'
    return 'CRITICAL'
  }

  const ReadinessBar = ({ label, value, total, operational, onMission }) => {
    const color = getReadinessColor(value)
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 'bold', color: BRAND.primary }}>{label}</span>
          <span style={{ fontSize: 10, color: color, fontWeight: 'bold' }}>
            {value}% {getReadinessLabel(value)}
          </span>
        </div>
        <div style={{
          height: 12,
          background: '#222',
          borderRadius: 6,
          overflow: 'hidden',
          border: '1px solid #333',
          position: 'relative'
        }}>
          <div style={{
            width: `${value}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
            transition: 'width 0.5s ease',
            boxShadow: `0 0 10px ${color}88`
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: '#666' }}>
          <span>Total: {total}</span>
          <span>Operational: {operational}</span>
          <span>On Mission: {onMission}</span>
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
        <span style={{ fontSize: 20 }}>🎖️</span>
        <div>
          <h3 style={{ margin: 0, color: BRAND.primary, fontSize: 14 }}>NATO FORCE READINESS</h3>
          <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>
            Swedish Armed Forces • Real-time Status
          </div>
        </div>
      </div>

      {/* Overall Readiness Score */}
      <div style={{
        background: `linear-gradient(135deg, ${getReadinessColor(overallReadiness)}22 0%, ${getReadinessColor(overallReadiness)}11 100%)`,
        border: `2px solid ${getReadinessColor(overallReadiness)}`,
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 10, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
          Overall Force Readiness
        </div>
        <div style={{ fontSize: 42, fontWeight: 'bold', color: getReadinessColor(overallReadiness), lineHeight: 1 }}>
          {overallReadiness}%
        </div>
        <div style={{ fontSize: 12, fontWeight: 'bold', color: getReadinessColor(overallReadiness), marginTop: 4 }}>
          {getReadinessLabel(overallReadiness)}
        </div>
        <div style={{ fontSize: 9, color: '#666', marginTop: 8 }}>
          NATO Article 5 Response Capability: {overallReadiness >= 80 ? 'READY' : overallReadiness >= 60 ? 'STANDBY' : 'LIMITED'}
        </div>
      </div>

      {/* Category Readiness */}
      <div>
        <ReadinessBar
          label="🚛 GROUND FORCES"
          value={readiness.ground.readiness}
          total={readiness.ground.total}
          operational={readiness.ground.operational}
          onMission={readiness.ground.onMission}
        />
        <ReadinessBar
          label="✈️ AIR FORCES"
          value={readiness.air.readiness}
          total={readiness.air.total}
          operational={readiness.air.operational}
          onMission={readiness.air.onMission}
        />
        <ReadinessBar
          label="⚓ NAVAL FORCES"
          value={readiness.naval.readiness}
          total={readiness.naval.total}
          operational={readiness.naval.operational}
          onMission={readiness.naval.onMission}
        />
        <ReadinessBar
          label="📦 SUPPLY CHAIN"
          value={supply}
          total={inventory.length}
          operational={inventory.filter(i => (i.quantity / i.min_stock_level) >= 1).length}
          onMission={bases.length}
        />
      </div>

      {/* Quick Stats */}
      <div style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: `1px solid ${BRAND.border}`,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#666', marginBottom: 4 }}>DEPLOYMENT TIME</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: BRAND.success }}>
            {overallReadiness >= 80 ? '< 2h' : overallReadiness >= 60 ? '< 4h' : '< 8h'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#666', marginBottom: 4 }}>ACTIVE BASES</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: BRAND.primary }}>
            {bases.length}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#666', marginBottom: 4 }}>MISSIONS ACTIVE</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: BRAND.secondary }}>
            {missions.filter(m => m.status === 'active').length}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#666', marginBottom: 4 }}>RESPONSE STATUS</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: getReadinessColor(overallReadiness) }}>
            {overallReadiness >= 80 ? 'READY' : overallReadiness >= 60 ? 'STANDBY' : 'ALERT'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReadinessPanel