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

const NATOAlliesPanel = ({ assets, bases }) => {
  // NATO ally nations with realistic military data
  const allies = [
    {
      code: 'SE',
      name: 'Sweden',
      flag: '🇸🇪',
      status: 'active',
      forces: assets.length,
      bases: bases.length,
      readiness: 98,
      contribution: 'Host Nation'
    },
    {
      code: 'NO',
      name: 'Norway',
      flag: '🇳🇴',
      status: 'active',
      forces: 45,
      bases: 8,
      readiness: 95,
      contribution: 'Air Support'
    },
    {
      code: 'FI',
      name: 'Finland',
      flag: '🇫🇮',
      status: 'active',
      forces: 38,
      bases: 6,
      readiness: 97,
      contribution: 'Ground Forces'
    },
    {
      code: 'DK',
      name: 'Denmark',
      flag: '🇩🇰',
      status: 'active',
      forces: 32,
      bases: 5,
      readiness: 93,
      contribution: 'Naval Support'
    },
    {
      code: 'DE',
      name: 'Germany',
      flag: '🇩🇪',
      status: 'active',
      forces: 67,
      bases: 12,
      readiness: 91,
      contribution: 'Logistics Hub'
    },
    {
      code: 'UK',
      name: 'United Kingdom',
      flag: '🇬🇧',
      status: 'active',
      forces: 55,
      bases: 9,
      readiness: 94,
      contribution: 'Air/Naval'
    },
    {
      code: 'US',
      name: 'United States',
      flag: '🇺🇸',
      status: 'standby',
      forces: 120,
      bases: 15,
      readiness: 96,
      contribution: 'Strategic Reserve'
    },
    {
      code: 'PL',
      name: 'Poland',
      flag: '🇵🇱',
      status: 'active',
      forces: 42,
      bases: 7,
      readiness: 92,
      contribution: 'Ground Support'
    }
  ]

  const getStatusColor = (status) => {
    if (status === 'active') return BRAND.success
    if (status === 'standby') return BRAND.secondary
    return BRAND.warning
  }

  const getReadinessColor = (readiness) => {
    if (readiness >= 95) return BRAND.success
    if (readiness >= 85) return BRAND.secondary
    if (readiness >= 70) return BRAND.warning
    return BRAND.danger
  }

  const AllyCard = ({ ally }) => (
    <div style={{
      background: `linear-gradient(135deg, ${getStatusColor(ally.status)}11 0%, ${getStatusColor(ally.status)}05 100%)`,
      border: `1px solid ${getStatusColor(ally.status)}44`,
      borderRadius: 6,
      padding: 10,
      marginBottom: 8,
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>{ally.flag}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 'bold', color: BRAND.primary }}>{ally.name}</div>
            <div style={{ fontSize: 8, color: '#666' }}>{ally.contribution}</div>
          </div>
        </div>
        <div style={{
          background: getStatusColor(ally.status),
          color: '#000',
          padding: '2px 8px',
          borderRadius: 10,
          fontSize: 8,
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {ally.status}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 9 }}>
        <div>
          <div style={{ color: '#666' }}>Forces</div>
          <div style={{ fontWeight: 'bold', color: BRAND.primary }}>{ally.forces}</div>
        </div>
        <div>
          <div style={{ color: '#666' }}>Bases</div>
          <div style={{ fontWeight: 'bold', color: BRAND.secondary }}>{ally.bases}</div>
        </div>
        <div>
          <div style={{ color: '#666' }}>Readiness</div>
          <div style={{ fontWeight: 'bold', color: getReadinessColor(ally.readiness) }}>{ally.readiness}%</div>
        </div>
      </div>

      {/* Mini readiness bar */}
      <div style={{
        height: 4,
        background: '#222',
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 6
      }}>
        <div style={{
          width: `${ally.readiness}%`,
          height: '100%',
          background: getReadinessColor(ally.readiness),
          transition: 'width 0.5s ease'
        }} />
      </div>
    </div>
  )

  // Calculate coalition stats
  const totalForces = allies.reduce((sum, a) => sum + a.forces, 0)
  const totalBases = allies.reduce((sum, a) => sum + a.bases, 0)
  const avgReadiness = Math.round(allies.reduce((sum, a) => sum + a.readiness, 0) / allies.length)
  const activeNations = allies.filter(a => a.status === 'active').length

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
        <span style={{ fontSize: 20 }}>🌍</span>
        <div>
          <h3 style={{ margin: 0, color: BRAND.primary, fontSize: 14 }}>NATO ALLIED FORCES</h3>
          <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>
            Nordic & Baltic Coalition • Article 5 Ready
          </div>
        </div>
      </div>

      {/* Coalition Summary */}
      <div style={{
        background: `linear-gradient(135deg, ${BRAND.success}22 0%, ${BRAND.primary}22 100%)`,
        border: `2px solid ${BRAND.success}`,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 10, color: '#999', marginBottom: 4 }}>COALITION STRENGTH</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 8 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: BRAND.success }}>{activeNations}</div>
            <div style={{ fontSize: 8, color: '#666' }}>Active Nations</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: BRAND.primary }}>{totalForces}</div>
            <div style={{ fontSize: 8, color: '#666' }}>Total Forces</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: BRAND.secondary }}>{avgReadiness}%</div>
            <div style={{ fontSize: 8, color: '#666' }}>Avg Readiness</div>
          </div>
        </div>
      </div>

      {/* Communication Status */}
      <div style={{
        background: 'rgba(0, 191, 255, 0.1)',
        border: '1px solid rgba(0, 191, 255, 0.3)',
        borderRadius: 6,
        padding: 10,
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <span style={{ fontSize: 16 }}>📡</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 'bold', color: BRAND.primary }}>SECURE COMMS: ACTIVE</div>
          <div style={{ fontSize: 8, color: '#666' }}>All allied command centers linked • Latency: 12ms</div>
        </div>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: BRAND.success,
          boxShadow: `0 0 10px ${BRAND.success}`,
          animation: 'pulse 2s ease-in-out infinite'
        }} />
      </div>

      {/* Allied Nations List */}
      <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
        {allies.map(ally => (
          <AllyCard key={ally.code} ally={ally} />
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        marginTop: 12,
        paddingTop: 12,
        borderTop: `1px solid ${BRAND.border}`,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8
      }}>
        <button style={{
          background: BRAND.primary,
          color: '#000',
          border: 'none',
          padding: '8px 12px',
          borderRadius: 4,
          fontSize: 9,
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          📞 JOINT COMMAND
        </button>
        <button style={{
          background: BRAND.secondary,
          color: '#000',
          border: 'none',
          padding: '8px 12px',
          borderRadius: 4,
          fontSize: 9,
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          🎯 COORDINATE
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default NATOAlliesPanel