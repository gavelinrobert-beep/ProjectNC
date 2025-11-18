import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BRAND } from '../lib/constants'
import GlassCard from './GlassCard'

const StatCard = ({ icon, label, value, color, leftStat, rightStat, onClick }) => (
  <GlassCard 
    hover={true} 
    glow={true} 
    padding={14}
    style={{
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s'
    }}
    onClick={onClick}
  >
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
  const navigate = useNavigate()

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
        onClick={() => navigate('/assets')}
      />

      {/* Only show Uppdrag if there are active missions */}
      {stats.activeMissions > 0 && (
        <StatCard
          icon="🎯"
          label="Uppdrag"
          value={stats.activeMissions}
          color={BRAND.success}
          leftStat="📋 Aktiva"
          rightStat={`✅ Totalt: ${missions.length}`}
          onClick={() => navigate('/missions')}
        />
      )}

      {/* Only show Kritiska Larm if there are critical alerts */}
      {stats.criticalAlerts > 0 && (
        <StatCard
          icon="🚨"
          label="Kritiska Larm"
          value={stats.criticalAlerts}
          color={BRAND.danger}
          leftStat={`⚠️ Aktiva: ${alerts.filter(a => !a.acknowledged).length}`}
          rightStat={`📊 Totalt: ${alerts.length}`}
        />
      )}

      {/* Only show Låg Bränsle if there are low fuel vehicles */}
      {stats.lowFuel > 0 && (
        <StatCard
          icon="⛽"
          label="Låg Bränsle"
          value={stats.lowFuel}
          color={BRAND.warning}
          leftStat="🔴 <20%"
          rightStat="⚠️ Behöver tankning"
          onClick={() => navigate('/assets')}
        />
      )}

      {/* Always show maintenance card */}
      <StatCard
        icon="🔧"
        label="Underhåll"
        value={stats.maintenance}
        color={BRAND.warning}
        leftStat="🛠️ Behöver service"
        rightStat={`Under service: ${assets.filter(a => a.maintenance_status === 'under_maintenance').length}`}
        onClick={() => navigate('/assets')}
      />

      {/* Show Baser card */}
      <StatCard
        icon="🏭"
        label="Baser"
        value={bases.length}
        color={BRAND.primary}
        leftStat={`✈️ Flygfält: ${bases.filter(b => b.type === 'airfield').length}`}
        rightStat={`🔴 Militära: ${bases.filter(b => b.type === 'military').length}`}
      />

      {/* Only show Geofences if there are any */}
      {geofences.length > 0 && (
        <StatCard
          icon="📍"
          label="Geofences"
          value={geofences.length}
          color={BRAND.info}
          leftStat="📋 Aktiva områden"
          rightStat="🔍 Övervakade"
        />
      )}
    </div>
  )
}