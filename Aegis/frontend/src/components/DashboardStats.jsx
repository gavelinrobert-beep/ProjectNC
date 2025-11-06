// Aegis/frontend/src/components/DashboardStats.jsx
import React from 'react'
import { BRAND } from '../lib/constants'

const StatCard = ({ icon, label, value, color, leftStat, rightStat }) => (
  <div style={{
    background: BRAND.card,
    border: `1px solid ${color}44`,
    borderLeft: `4px solid ${color}`,
    borderRadius: 6,
    padding: 12
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 'bold', color: color, marginBottom: 6 }}>
      {value}
    </div>
    <div style={{ fontSize: 10, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
      <span>{leftStat}</span>
      <span>{rightStat}</span>
    </div>
  </div>
)

export default function DashboardStats({ stats, alerts, missions, bases, geofences, assets }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 12,
      marginBottom: 12
    }}>
      <StatCard
        icon="🚗"
        label="Tillgångar"
        value={stats.totalAssets}
        color={BRAND.primary}
        leftStat={`✅ Aktiva: ${stats.mobile}`}
        rightStat={`🅿️ Parkerade: ${stats.totalAssets - stats.mobile}`}
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
        color={BRAND.secondary}
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
        color="#9c27b0"
        leftStat="📋 Aktiva områden"
        rightStat="🔍 Övervakade"
      />
    </div>
  )
}