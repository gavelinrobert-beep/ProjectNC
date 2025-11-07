// Aegis/frontend/src/components/AssetContextToolbar.jsx
import React from 'react'
import { BRAND } from '../lib/constants'
import GlassCard from './GlassCard'
import GradientButton from './GradientButton'

export default function AssetContextToolbar({
  asset,
  onClose,
  onViewDetails,
  onAssignMission,
  onReturnToBase,
  onRefuelRequest,
  onMaintenance
}) {
  if (!asset) return null

  const actions = [
    { icon: '📋', label: 'Details', onClick: onViewDetails, variant: 'primary' },
    { icon: '🎯', label: 'Assign Mission', onClick: () => onAssignMission(asset), variant: 'primary' },
    { icon: '🏠', label: 'RTB', onClick: () => onReturnToBase(asset), variant: 'success' },
    { icon: '⛽', label: 'Refuel', onClick: () => onRefuelRequest(asset), variant: 'primary' },
    { icon: '🔧', label: 'Maintenance', onClick: () => onMaintenance(asset), variant: 'primary' }
  ]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9998,
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <GlassCard padding={16} style={{ minWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Asset Info */}
          <div style={{
            flex: 1,
            paddingRight: 16,
            borderRight: '1px solid ' + BRAND.border
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>🚛</span>
              <div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: BRAND.primary
                }}>
                  {asset.id}
                </div>
                <div style={{
                  fontSize: 11,
                  color: BRAND.textMuted
                }}>
                  {asset.type} • {asset.status}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {actions.map((action, idx) => (
              <GradientButton
                key={idx}
                icon={action.icon}
                onClick={action.onClick}
                size="small"
                variant={action.variant}
              >
                {action.label}
              </GradientButton>
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid ' + BRAND.border,
              borderRadius: 6,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 16,
              color: BRAND.textMuted,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = BRAND.danger
              e.currentTarget.style.color = BRAND.danger
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = BRAND.border
              e.currentTarget.style.color = BRAND.textMuted
            }}
          >
            ✕
          </button>
        </div>
      </GlassCard>
    </div>
  )
}