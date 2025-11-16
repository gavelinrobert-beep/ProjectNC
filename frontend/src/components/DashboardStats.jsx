import React from 'react'
import { BRAND } from '../lib/constants'
import GlassCard from './GlassCard'

const StatCard = ({ icon, label, value, color, leftStat, rightStat }) => (
  <GlassCard hover={true} glow={true} padding={14}>
    <div style={{
      borderLeft: `4px solid ${color}`,
      paddingLeft: 12,
      height: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          fontSize: 20,
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
        }}>
          {icon}
        </span>
        <div style={{
          fontSize: 10,
          color: BRAND.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: 600
        }}>
          {label}
        </div>
      </div>
      <div style={{
        fontSize: 32,
        fontWeight: 700,
        background: `linear-gradient(135deg, ${color} 0%, ${color}88 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: 8,
        lineHeight: 1
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 10,
        color: BRAND.textDim,
        display: 'flex',
        justifyContent: 'space-between',
        gap: 8
      }}>
        <span>{leftStat}</span>
        <span>{rightStat}</span>
      </div>
    </div>
  </GlassCard>
)

export default function DashboardStats({ stats, alerts, missions, bases, geofences, assets }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 14,
      marginBottom: 14
    }}>
      <StatCard
        icon="🚗"
        label="Tillgångar"
        value={stats.totalAssets}
        color={BRAND.primary}
        leftStat={`🚗 I bruk: ${stats.inUse || 0}`}
        rightStat={`✅ Tillgängliga: ${stats.available || 0}`}
      />

      <StatCard
        icon="🎯"
        label="Uppdrag"
        value={stats.activeMissions}
        color={BRAND.success}
        leftStat="📋 Aktiva"
        rightStat={`✅ Totalt: ${missions.length}`}
      />

      <StatCard
        icon="🚨"
        label="Kritiska Larm"
        value={stats.criticalAlerts}
        color={BRAND.danger}
        leftStat={`⚠️ Aktiva: ${alerts.filter(a => !a.acknowledged).length}`}
        rightStat={`📊 Totalt: ${alerts.length}`}
      />

      <StatCard
        icon="⛽"
        label="Låg Bränsle"
        value={stats.lowFuel}
        color={BRAND.warning}
        leftStat="🔴 <20%"
        rightStat="⚠️ Behöver tankning"
      />

      <StatCard
        icon="🔧"
        label="Underhåll"
        value={stats.maintenance}
        color={BRAND.warning}
        leftStat="🛠️ Behöver service"
        rightStat={`Under service: ${assets.filter(a => a.maintenance_status === 'under_maintenance').length}`}
      />

      <StatCard
        icon="🏭"
        label="Baser"
        value={bases.length}
        color={BRAND.primary}
        leftStat={`✈️ Flygfält: ${bases.filter(b => b.type === 'airfield').length}`}
        rightStat={`🔴 Militära: ${bases.filter(b => b.type === 'military').length}`}
      />

      <StatCard
        icon="📍"
        label="Geofences"
        value={geofences.length}
        color={BRAND.info}
        leftStat="📋 Aktiva områden"
        rightStat="🔍 Övervakade"
      />
    </div>
  )
}