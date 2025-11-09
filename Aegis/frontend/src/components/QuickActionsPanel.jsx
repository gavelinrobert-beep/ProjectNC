// Aegis/frontend/src/components/QuickActionsPanel.jsx// Aegis/frontend/src/components/QuickActionsPanel.jsx
import React, { useState, useEffect } from 'react'
import { BRAND } from '../lib/constants'
import GlassCard from './GlassCard'
import GradientButton from './GradientButton'

export default function QuickActionsPanel({
  onNewMission,
  onEmergencyAlert,
  onGenerateReport,
  onSyncAssets,
  onBroadcastMessage
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only trigger if Ctrl is pressed
      if (!e.ctrlKey) return

      switch(e.key.toLowerCase()) {
        case 'n':
          e.preventDefault()
          onNewMission && onNewMission()
          break
        case 'e':
          e.preventDefault()
          onEmergencyAlert && onEmergencyAlert()
          break
        case 'r':
          e.preventDefault()
          onGenerateReport && onGenerateReport()
          break
        case 's':
          e.preventDefault()
          onSyncAssets && onSyncAssets()
          break
        case 'b':
          e.preventDefault()
          onBroadcastMessage && onBroadcastMessage()
          break
        case 'k':
          e.preventDefault()
          setShowShortcuts(!showShortcuts)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onNewMission, onEmergencyAlert, onGenerateReport, onSyncAssets, onBroadcastMessage, showShortcuts])

  const actions = [
    {
      icon: '🎯',
      label: 'New Mission',
      shortcut: 'Ctrl+N',
      color: BRAND.primary,
      onClick: onNewMission
    },
    {
      icon: '🚨',
      label: 'Emergency Alert',
      shortcut: 'Ctrl+E',
      color: BRAND.danger,
      onClick: onEmergencyAlert
    },
    {
      icon: '📊',
      label: 'Generate Report',
      shortcut: 'Ctrl+R',
      color: BRAND.success,
      onClick: onGenerateReport
    },
    {
      icon: '🔄',
      label: 'Sync All Assets',
      shortcut: 'Ctrl+S',
      color: BRAND.info,
      onClick: onSyncAssets
    },
    {
      icon: '📡',
      label: 'Broadcast Message',
      shortcut: 'Ctrl+B',
      color: BRAND.warning,
      onClick: onBroadcastMessage
    }
  ]

  return (
    <>
      {/* Main FAB Button */}
      <div
        style={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          zIndex: 9998
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: BRAND.gradientPrimary,
            border: '3px solid ' + BRAND.primary,
            boxShadow: isOpen ? BRAND.shadowGlow : BRAND.shadowLg,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = isOpen ? 'rotate(45deg) scale(1.1)' : 'scale(1.1)'
            e.currentTarget.style.boxShadow = BRAND.shadowGlow
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
            e.currentTarget.style.boxShadow = isOpen ? BRAND.shadowGlow : BRAND.shadowLg
          }}
        >
          {isOpen ? '✕' : '⚡'}
        </button>
      </div>

      {/* Actions Menu */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 150,
            right: 20,
            zIndex: 9997,
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          <GlassCard padding={16} style={{ minWidth: 280 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <h4 style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: BRAND.text,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Quick Actions
              </h4>
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                style={{
                  background: 'transparent',
                  border: '1px solid ' + BRAND.border,
                  borderRadius: 4,
                  padding: '4px 8px',
                  fontSize: 10,
                  color: BRAND.textMuted,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                ⌨️ Shortcuts
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {actions.map((action, idx) => (
                <ActionButton
                  key={idx}
                  icon={action.icon}
                  label={action.label}
                  shortcut={action.shortcut}
                  color={action.color}
                  onClick={() => {
                    action.onClick && action.onClick()
                    setIsOpen(false)
                  }}
                  showShortcut={showShortcuts}
                />
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {showShortcuts && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <GlassCard padding={24} style={{ minWidth: 400 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: BRAND.text
              }}>
                ⌨️ Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 20,
                  color: BRAND.textMuted,
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {actions.map((action, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: BRAND.bgBase,
                    borderRadius: 8,
                    border: '1px solid ' + BRAND.border
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{action.icon}</span>
                    <span style={{ fontSize: 13, color: BRAND.text }}>
                      {action.label}
                    </span>
                  </div>
                  <kbd style={{
                    background: BRAND.bgCard,
                    border: '1px solid ' + action.color,
                    borderRadius: 4,
                    padding: '4px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: action.color,
                    fontFamily: 'monospace'
                  }}>
                    {action.shortcut}
                  </kbd>
                </div>
              ))}

              <div style={{
                marginTop: 12,
                padding: '10px 12px',
                background: 'rgba(0, 217, 255, 0.1)',
                borderRadius: 8,
                border: '1px solid ' + BRAND.primary,
                fontSize: 11,
                color: BRAND.textMuted,
                textAlign: 'center'
              }}>
                💡 Press <kbd style={{
                  background: BRAND.bgCard,
                  padding: '2px 6px',
                  borderRadius: 4,
                  color: BRAND.primary
                }}>Ctrl+K</kbd> to toggle this menu
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Backdrop when shortcuts modal is open */}
      {showShortcuts && (
        <div
          onClick={() => setShowShortcuts(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}

// Action Button Component
function ActionButton({ icon, label, shortcut, color, onClick, showShortcut }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? color + '22' : 'transparent',
        border: '1px solid ' + (isHovered ? color : BRAND.border),
        borderRadius: 8,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateX(4px)' : 'translateX(0)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontSize: 20,
          filter: isHovered ? 'drop-shadow(0 0 8px ' + color + ')' : 'none'
        }}>
          {icon}
        </span>
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: isHovered ? color : BRAND.text
        }}>
          {label}
        </span>
      </div>

      {showShortcut && (
        <kbd style={{
          background: BRAND.bgBase,
          border: '1px solid ' + BRAND.border,
          borderRadius: 4,
          padding: '2px 6px',
          fontSize: 10,
          color: BRAND.textMuted,
          fontFamily: 'monospace'
        }}>
          {shortcut}
        </kbd>
      )}
    </button>
  )
}