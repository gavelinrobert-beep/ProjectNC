// Aegis/frontend/src/components/AlertBanner.jsx
import React from 'react'
import { formatTime } from '../shared/utils'

// NATO Standard Alert Colors
const ALERT_COLORS = {
  critical: '#D32F2F',    // NATO Red
  warning: '#F57C00',     // NATO Amber
  info: '#1976D2',        // NATO Blue
  success: '#388E3C',     // NATO Green
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
      pointerEvents: 'none',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Critical Alerts - Highest Priority */}
      {criticalAlerts.map((alert, idx) => (
        <div
          key={alert.id || idx}
          style={{
            background: ALERT_COLORS.critical,
            color: '#fff',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            borderLeft: '4px solid #fff',
            animation: 'criticalPulse 2s ease-in-out infinite',
            pointerEvents: 'auto',
            fontWeight: 500
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#fff',
              animation: 'indicatorPulse 1.5s ease-in-out infinite'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: '0.5px',
                marginBottom: 4,
                textTransform: 'uppercase'
              }}>
                CRITICAL: {alert.rule || alert.type}
              </div>
              <div style={{
                fontSize: 12,
                opacity: 0.95,
                lineHeight: 1.4
              }}>
                {alert.asset_id} • {alert.message || 'Immediate action required'}
                <span style={{ marginLeft: 12, opacity: 0.8 }}>
                  {formatTime(alert.ts || alert.timestamp)}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
            <button
              onClick={() => onAcknowledge && onAcknowledge(alert)}
              style={{
                background: '#fff',
                color: ALERT_COLORS.critical,
                border: 'none',
                padding: '8px 16px',
                borderRadius: 3,
                fontWeight: 600,
                fontSize: 11,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              ACKNOWLEDGE
            </button>
            <button
              onClick={() => onDismiss && onDismiss(alert)}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                padding: '8px 12px',
                borderRadius: 3,
                fontSize: 16,
                lineHeight: 1,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = '#fff'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)'
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}

      {/* Warning Alerts - Medium Priority */}
      {warningAlerts.slice(0, 3).map((alert, idx) => (
        <div
          key={alert.id || idx}
          style={{
            background: ALERT_COLORS.warning,
            color: '#fff',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            borderLeft: '4px solid rgba(255, 255, 255, 0.4)',
            pointerEvents: 'auto',
            marginTop: 1
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#fff',
              opacity: 0.8
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: '0.3px',
                marginBottom: 3,
                textTransform: 'uppercase'
              }}>
                WARNING: {alert.rule || alert.type}
              </div>
              <div style={{
                fontSize: 11,
                opacity: 0.9,
                lineHeight: 1.3
              }}>
                {alert.asset_id} • {alert.message || 'Attention required'}
                <span style={{ marginLeft: 12, opacity: 0.75 }}>
                  {formatTime(alert.ts || alert.timestamp)}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
            <button
              onClick={() => onAcknowledge && onAcknowledge(alert)}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: ALERT_COLORS.warning,
                border: 'none',
                padding: '6px 12px',
                borderRadius: 3,
                fontWeight: 600,
                fontSize: 10,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'}
            >
              ACK
            </button>
            <button
              onClick={() => onDismiss && onDismiss(alert)}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                padding: '6px 10px',
                borderRadius: 3,
                fontSize: 14,
                lineHeight: 1,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = '#fff'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes criticalPulse {
          0%, 100% {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
          50% {
            box-shadow: 0 2px 12px rgba(211, 47, 47, 0.6);
          }
        }
        @keyframes indicatorPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  )
}

export default AlertBanner