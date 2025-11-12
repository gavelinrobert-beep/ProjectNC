// Aegis/frontend/src/components/DashboardSidebar.jsx
import React from 'react'
import { BRAND } from '../lib/constants'
import ReadinessPanel from './ReadinessPanel'
import SupplyChainPanel from './SupplyChainPanel'
import MetricsPanel from './MetricsPanel'
import NATOAlliesPanel from './NATOAlliesPanel'
import InventoryWidget from './InventoryWidget?v=2'
import CollapsibleSection from './CollapsibleSection'

export default function DashboardSidebar({
  assets,
  missions,
  bases,
  inventory,
  alerts,
  stats
}) {
  const activeMissionsList = missions.filter(m => m.status === 'active').slice(0, 4)
  const recentAlerts = alerts.filter(a => !a.acknowledged).slice(0, 5)

  const calculateProgress = (mission) => {
    if (!mission?.asset_id || mission.status !== 'active') return 0
    const asset = assets.find(a => a.id === mission.asset_id)
    if (!asset || !mission.waypoints?.length) return 0
    let closest = 0, minDist = Infinity
    mission.waypoints.forEach((wp, i) => {
      const d = Math.sqrt(Math.pow(asset.lat - wp.lat, 2) + Math.pow(asset.lon - wp.lon, 2))
      if (d < minDist) { minDist = d; closest = i }
    })
    return mission.waypoints.length > 1 ? Math.round((closest / (mission.waypoints.length - 1)) * 100) : 0
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflowY: 'auto', paddingRight: 4 }}>
      <CollapsibleSection title="NATO Force Readiness" defaultOpen={true}>
        <div style={{ padding: 0 }}>
          <ReadinessPanel
            assets={assets}
            missions={missions}
            bases={bases}
            inventory={inventory}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Supply Chain Status" defaultOpen={false}>
        <div style={{ padding: 0 }}>
          <SupplyChainPanel
            inventory={inventory}
            bases={bases}
            missions={missions}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="System Metrics" defaultOpen={false}>
        <div style={{ padding: 0 }}>
          <MetricsPanel
            missions={missions}
            alerts={alerts}
            assets={assets}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="NATO Allied Forces" defaultOpen={false}>
        <div style={{ padding: 0 }}>
          <NATOAlliesPanel
            assets={assets}
            bases={bases}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Aktiva Uppdrag" count={stats.activeMissions} defaultOpen={true}>
        {activeMissionsList.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: 12 }}>Inga aktiva uppdrag</div>
        ) : (
          activeMissionsList.map(m => {
            const prog = calculateProgress(m)
            const asset = assets.find(a => a.id === m.asset_id)

            let eta = null
            let distanceRemaining = 0
            if (asset && m.waypoints && asset.speed > 0) {
              const routeIndex = asset.route_index || 0
              const currentWpIndex = Math.floor(routeIndex)

              for (let i = currentWpIndex; i < m.waypoints.length - 1; i++) {
                const wp1 = m.waypoints[i]
                const wp2 = m.waypoints[i + 1]
                const dist = Math.sqrt(
                  Math.pow((wp2.lat - wp1.lat) * 111, 2) +
                  Math.pow((wp2.lon - wp1.lon) * 111 * Math.cos(wp1.lat * Math.PI / 180), 2)
                )
                distanceRemaining += dist
              }

              const hoursRemaining = distanceRemaining / asset.speed
              const minutesRemaining = Math.round(hoursRemaining * 60)
              eta = minutesRemaining
            }

            return (
              <div key={m.id} style={{
                background: 'rgba(0,191,255,0.05)',
                border: `1px solid ${BRAND.primary}33`,
                borderRadius: 4,
                padding: 10,
                marginBottom: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong style={{ fontSize: 12, color: BRAND.primary }}>{m.name}</strong>
                  <span style={{
                    fontSize: 8,
                    background: m.priority === 'critical' ? BRAND.danger : m.priority === 'high' ? BRAND.warning : BRAND.secondary,
                    color: '#000',
                    padding: '2px 6px',
                    borderRadius: 3,
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {m.priority}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 10 }}>
                  <span style={{ color: '#999' }}>
                    🚗 {m.asset_id || 'Unassigned'}
                  </span>
                  {asset && (
                    <span style={{ color: BRAND.success, fontWeight: 'bold' }}>
                      {asset.status === 'mobile' ? '🚗 Moving' : asset.status === 'airborne' ? '✈️ Airborne' : '⏸️ Paused'}
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: 6 }}>
                  <div style={{ height: 8, background: '#222', borderRadius: 4, overflow: 'hidden', border: '1px solid #333' }}>
                    <div style={{
                      width: `${prog}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${BRAND.success} 0%, #4fc97f 100%)`,
                      transition: 'width 0.5s ease',
                      boxShadow: `0 0 8px ${BRAND.success}88`
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
                  <span style={{ color: BRAND.success, fontWeight: 'bold' }}>
                    {prog}% Complete
                  </span>
                  {eta !== null && (
                    <span style={{ color: BRAND.secondary }}>
                      ⏱️ ETA: {eta < 60 ? `${eta}m` : `${Math.floor(eta / 60)}h ${eta % 60}m`}
                      {distanceRemaining > 0 && ` • ${distanceRemaining.toFixed(1)} km`}
                    </span>
                  )}
                </div>

                {m.mission_type === 'transfer' && (
                  <div style={{
                    marginTop: 6,
                    padding: '4px 8px',
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: `1px solid ${BRAND.secondary}44`,
                    borderRadius: 3,
                    fontSize: 9,
                    color: BRAND.secondary
                  }}>
                    📦 Transfer Mission: {m.source_base_id} → {m.destination_base_id}
                  </div>
                )}
              </div>
            )
          })
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Senaste Larm" count={recentAlerts.length} defaultOpen={true}>
        {recentAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', color: BRAND.success, padding: 12 }}>✅ Inga aktiva larm</div>
        ) : (
          recentAlerts.map((a, i) => (
            <div key={i} style={{
              borderLeft: `3px solid ${BRAND.danger}`,
              paddingLeft: 6,
              marginBottom: 6,
              fontSize: 10
            }}>
              <div style={{ fontWeight: 'bold' }}>{a.rule}</div>
              <div style={{ fontSize: 9, color: '#999' }}>{a.asset_id} • {new Date(a.ts).toLocaleTimeString('sv-SE')}</div>
            </div>
          ))
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Systemstatus" defaultOpen={false}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span>API Status</span>
          <span style={{ color: BRAND.success }}>● Online</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span>Databas</span>
          <span style={{ color: BRAND.success }}>● Ansluten</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Uppdatering</span>
          <span style={{ color: BRAND.primary }}>5s</span>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Inventory" count={inventory.length} defaultOpen={false}>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          <InventoryWidget />
        </div>
      </CollapsibleSection>
    </div>
  )
}