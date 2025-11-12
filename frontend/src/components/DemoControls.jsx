import React, { useState, useEffect } from 'react'

const BRAND = {
  primary: '#00BFFF',
  secondary: '#FFD700',
  success: '#00FF88',
  warning: '#FFA500',
  danger: '#FF4444',
  card: '#1a1a1a',
  border: '#2a2a2a',
}

const DemoControls = ({ onSpeedChange, onDemoToggle, isDemoActive, stats }) => {
  const [speed, setSpeed] = useState(1)
  const [isExpanded, setIsExpanded] = useState(true)
  const [demoTime, setDemoTime] = useState(0)

  const speeds = [
    { value: 0.5, label: '0.5x', icon: '🐌' },
    { value: 1, label: '1x', icon: '▶️' },
    { value: 2, label: '2x', icon: '⏩' },
    { value: 5, label: '5x', icon: '⚡' },
    { value: 10, label: '10x', icon: '🚀' }
  ]

  useEffect(() => {
    if (!isDemoActive) {
      setDemoTime(0)
      return
    }

    const interval = setInterval(() => {
      setDemoTime(prev => prev + (1 * speed))
    }, 1000)

    return () => clearInterval(interval)
  }, [isDemoActive, speed])

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed)
    onSpeedChange(newSpeed)
  }

  const handleDemoToggle = () => {
    onDemoToggle(!isDemoActive)
    if (isDemoActive) {
      setDemoTime(0)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 10000,
      transition: 'all 0.3s ease'
    }}>
      {/* Collapsed Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
            color: '#000',
            border: 'none',
            padding: '12px 20px',
            borderRadius: 25,
            fontSize: 14,
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 191, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: isDemoActive ? 'pulse 2s ease-in-out infinite' : 'none'
          }}
        >
          <span style={{ fontSize: 20 }}>🎬</span>
          DEMO {isDemoActive ? 'ACTIVE' : 'CONTROLS'}
        </button>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <div style={{
          background: BRAND.card,
          border: `2px solid ${isDemoActive ? BRAND.success : BRAND.primary}`,
          borderRadius: 12,
          padding: 16,
          minWidth: 320,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px ${isDemoActive ? BRAND.success + '44' : 'transparent'}`
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: `1px solid ${BRAND.border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🎬</span>
              <div>
                <h3 style={{ margin: 0, color: BRAND.primary, fontSize: 14 }}>DEMO MODE</h3>
                {isDemoActive && (
                  <div style={{ fontSize: 9, color: BRAND.success, marginTop: 2 }}>
                    ⏱️ Runtime: {formatTime(demoTime)}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: 16
              }}
            >
              ✕
            </button>
          </div>

          {/* Demo Toggle */}
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={handleDemoToggle}
              style={{
                width: '100%',
                background: isDemoActive
                  ? `linear-gradient(135deg, ${BRAND.danger} 0%, ${BRAND.warning} 100%)`
                  : `linear-gradient(135deg, ${BRAND.success} 0%, ${BRAND.primary} 100%)`,
                color: '#000',
                border: 'none',
                padding: '14px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: isDemoActive
                  ? `0 4px 15px ${BRAND.danger}88`
                  : `0 4px 15px ${BRAND.success}88`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'all 0.3s ease',
                animation: isDemoActive ? 'pulse 2s ease-in-out infinite' : 'none'
              }}
            >
              <span style={{ fontSize: 20 }}>{isDemoActive ? '⏹️' : '▶️'}</span>
              {isDemoActive ? 'STOP DEMO' : 'START DEMO'}
            </button>
          </div>

          {/* Live Stats - Only show when active */}
          {isDemoActive && stats && (
            <div style={{
              background: 'rgba(0, 191, 255, 0.1)',
              border: `1px solid ${BRAND.primary}44`,
              borderRadius: 6,
              padding: 10,
              marginBottom: 12
            }}>
              <div style={{ fontSize: 10, color: '#999', marginBottom: 6, textTransform: 'uppercase' }}>
                Live System Status
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10 }}>
                <div>
                  <div style={{ color: '#666' }}>Active Missions</div>
                  <div style={{ color: BRAND.success, fontWeight: 'bold', fontSize: 16 }}>
                    {stats.activeMissions || 0}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666' }}>Assets Mobile</div>
                  <div style={{ color: BRAND.primary, fontWeight: 'bold', fontSize: 16 }}>
                    {stats.mobile || 0}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666' }}>Critical Alerts</div>
                  <div style={{ color: stats.criticalAlerts > 0 ? BRAND.danger : BRAND.success, fontWeight: 'bold', fontSize: 16 }}>
                    {stats.criticalAlerts || 0}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666' }}>Total Assets</div>
                  <div style={{ color: BRAND.secondary, fontWeight: 'bold', fontSize: 16 }}>
                    {stats.totalAssets || 0}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Speed Controls */}
          <div>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Simulation Speed
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {speeds.map(s => (
                <button
                  key={s.value}
                  onClick={() => handleSpeedChange(s.value)}
                  disabled={!isDemoActive}
                  style={{
                    background: speed === s.value
                      ? `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`
                      : BRAND.border,
                    color: speed === s.value ? '#000' : '#666',
                    border: speed === s.value ? `2px solid ${BRAND.primary}` : '1px solid #333',
                    padding: '8px 4px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 'bold',
                    cursor: isDemoActive ? 'pointer' : 'not-allowed',
                    opacity: isDemoActive ? 1 : 0.5,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    transform: speed === s.value ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Indicator */}
          {isDemoActive && (
            <div style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: `1px solid ${BRAND.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: BRAND.success,
                boxShadow: `0 0 10px ${BRAND.success}`,
                animation: 'pulse 2s ease-in-out infinite'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 'bold', color: BRAND.success }}>DEMO ACTIVE</div>
                <div style={{ fontSize: 8, color: '#666' }}>
                  Speed: {speed}x • Auto-simulation running • Runtime: {formatTime(demoTime)}
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div style={{
            marginTop: 12,
            padding: 10,
            background: 'rgba(0, 191, 255, 0.1)',
            border: '1px solid rgba(0, 191, 255, 0.3)',
            borderRadius: 6,
            fontSize: 9,
            color: '#999'
          }}>
            💡 Demo mode simulates realistic military operations with automatic asset movement, mission execution, and event generation.
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
      `}</style>
    </div>
  )
}

export default DemoControls