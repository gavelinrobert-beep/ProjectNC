import React from 'react'

const BRAND = {
  danger: '#FF4444',
  warning: '#FFA500',
  info: '#00BFFF',
  success: '#00FF88',
}

const AlertBanner = ({ alerts, onDismiss, onAcknowledge }) => {
  if (!alerts || alerts.length === 0) return null

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged)
  const warningAlerts = alerts.filter(a => a.severity === 'warning' && !a.acknowledged)

  return (
    <div style={{
      position: 'fixed',
      top: 60,
      left: 0,
      right: 0,
      zIndex: 9999,
      pointerEvents: 'none'
    }}>
      {/* Critical Alerts - RED BANNER */}
      {criticalAlerts.map((alert, idx) => (
        <div
          key={alert.id || idx}
          style={{
            background: `linear-gradient(90deg, ${BRAND.danger} 0%, #cc0000 100%)`,
            color: '#fff',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(255, 68, 68, 0.5)',
            animation: 'alertPulse 2s ease-in-out infinite',
            borderBottom: '2px solid #fff',
            pointerEvents: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24, animation: 'alertBlink 1s ease-in-out infinite' }}>🚨</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 2 }}>
                CRITICAL ALERT: {alert.rule || alert.type}
              </div>
              <div style={{ fontSize: 11, opacity: 0.9 }}>
                {alert.asset_id} • {alert.message || 'Immediate action required'} • {new Date(alert.ts || alert.timestamp).toLocaleTimeString('sv-SE')}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onAcknowledge && onAcknowledge(alert)}
              style={{
                background: '#fff',
                color: BRAND.danger,
                border: 'none',
                padding: '6px 12px',
                borderRadius: 4,
                fontWeight: 'bold',
                fontSize: 11,
                cursor: 'pointer'
              }}
            >
              ACKNOWLEDGE
            </button>
            <button
              onClick={() => onDismiss && onDismiss(alert)}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid #fff',
                padding: '6px 12px',
                borderRadius: 4,
                fontSize: 11,
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {/* Warning Alerts - ORANGE BANNER */}
      {warningAlerts.slice(0, 2).map((alert, idx) => (
        <div
          key={alert.id || idx}
          style={{
            background: `linear-gradient(90deg, ${BRAND.warning} 0%, #ff8800 100%)`,
            color: '#000',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(255, 165, 0, 0.4)',
            borderBottom: '1px solid rgba(0,0,0,0.2)',
            pointerEvents: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 2 }}>
                WARNING: {alert.rule || alert.type}
              </div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>
                {alert.asset_id} • {alert.message || 'Attention required'} • {new Date(alert.ts || alert.timestamp).toLocaleTimeString('sv-SE')}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onAcknowledge && onAcknowledge(alert)}
              style={{
                background: '#000',
                color: BRAND.warning,
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                fontWeight: 'bold',
                fontSize: 10,
                cursor: 'pointer'
              }}
            >
              ACK
            </button>
            <button
              onClick={() => onDismiss && onDismiss(alert)}
              style={{
                background: 'transparent',
                border: '1px solid #000',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 10,
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes alertPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        @keyframes alertBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

export default AlertBanner