// Aegis/frontend/src/components/MapControlBar.jsx
import React, { useState } from 'react'
import { BRAND } from '../lib/constants'
import GlassCard from './GlassCard'

export default function MapControlBar({
  assets,
  onFilterChange,
  onMapStyleChange,
  onHeatmapToggle
}) {
  const [activeFilters, setActiveFilters] = useState({
    ground: true,
    air: true,
    naval: true,
    critical: true
  })

  const [mapStyle, setMapStyle] = useState('standard')
  const [showHeatmap, setShowHeatmap] = useState(false)

  // Count assets by type
  const counts = {
    ground: assets.filter(a => ['truck', 'armored_vehicle', 'supply_vehicle', 'command_vehicle'].includes(a.type)).length,
    air: assets.filter(a => ['fighter_jet', 'cargo_plane', 'helicopter', 'transport_helicopter', 'uav'].includes(a.type)).length,
    naval: assets.filter(a => ['patrol_boat', 'corvette', 'submarine', 'supply_ship'].includes(a.type)).length,
    critical: assets.filter(a => a.fuel_level < 20 || a.maintenance_status === 'needs_maintenance').length
  }

  const toggleFilter = (filter) => {
    const newFilters = { ...activeFilters, [filter]: !activeFilters[filter] }
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  const changeMapStyle = (style) => {
    setMapStyle(style)
    onMapStyleChange(style)
  }

  const toggleHeatmap = () => {
    const newState = !showHeatmap
    setShowHeatmap(newState)
    onHeatmapToggle(newState)
  }

  const FilterButton = ({ icon, label, count, filter, color }) => {
    const isActive = activeFilters[filter]

    return (
      <button
        onClick={() => toggleFilter(filter)}
        style={{
          background: isActive ? `${color}22` : 'transparent',
          border: `2px solid ${isActive ? color : BRAND.border}`,
          borderRadius: 8,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          opacity: isActive ? 1 : 0.5,
          transform: isActive ? 'scale(1)' : 'scale(0.95)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = `0 4px 12px ${color}44`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isActive ? 'scale(1)' : 'scale(0.95)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            color: isActive ? color : BRAND.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {label}
          </span>
          <span style={{
            fontSize: 14,
            fontWeight: 700,
            color: isActive ? color : BRAND.textDim
          }}>
            {count}
          </span>
        </div>
      </button>
    )
  }

  const MapStyleButton = ({ style: styleName, icon, label }) => {
    const isActive = mapStyle === styleName

    return (
      <button
        onClick={() => changeMapStyle(styleName)}
        style={{
          background: isActive ? `${BRAND.primary}22` : 'transparent',
          border: `1px solid ${isActive ? BRAND.primary : BRAND.border}`,
          borderRadius: 6,
          padding: '6px 10px',
          fontSize: 10,
          fontWeight: 600,
          color: isActive ? BRAND.primary : BRAND.textMuted,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${BRAND.primary}33`
          e.currentTarget.style.borderColor = BRAND.primary
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isActive ? `${BRAND.primary}22` : 'transparent'
          e.currentTarget.style.borderColor = isActive ? BRAND.primary : BRAND.border
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </button>
    )
  }

  return (
    <GlassCard padding={12} style={{ marginBottom: 12 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        {/* Left: Asset Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <FilterButton
            icon="🚛"
            label="Ground"
            count={counts.ground}
            filter="ground"
            color={BRAND.success}
          />
          <FilterButton
            icon="✈️"
            label="Air"
            count={counts.air}
            filter="air"
            color={BRAND.primary}
          />
          <FilterButton
            icon="⚓"
            label="Naval"
            count={counts.naval}
            filter="naval"
            color={BRAND.info}
          />
          <FilterButton
            icon="🚨"
            label="Critical"
            count={counts.critical}
            filter="critical"
            color={BRAND.danger}
          />
        </div>

        {/* Right: Map Controls */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Heatmap Toggle */}
          <button
            onClick={toggleHeatmap}
            style={{
              background: showHeatmap ? `${BRAND.warning}22` : 'transparent',
              border: `1px solid ${showHeatmap ? BRAND.warning : BRAND.border}`,
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 600,
              color: showHeatmap ? BRAND.warning : BRAND.textMuted,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>🔥</span>
            <span>Heatmap</span>
          </button>

          {/* Map Style Switcher */}
          <div style={{
            display: 'flex',
            gap: 6,
            padding: '4px',
            background: BRAND.bgBase,
            borderRadius: 8,
            border: `1px solid ${BRAND.border}`
          }}>
            <MapStyleButton style="standard" icon="🗺️" label="Standard" />
            <MapStyleButton style="satellite" icon="🛰️" label="Satellite" />
            <MapStyleButton style="dark" icon="🌙" label="Dark" />
            <MapStyleButton style="operational" icon="🗺️" label="Operational" />
          </div>
        </div>
      </div>
    </GlassCard>
  )
}