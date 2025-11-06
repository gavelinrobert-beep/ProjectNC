// Aegis/frontend/src/lib/mapIcons.js
import L from 'leaflet'
import { BRAND, getBatteryColor } from './constants'

export function createAssetIcon(asset, onMission) {
  const getAssetSymbol = (type) => {
    const symbols = {
      // Ground vehicles
      'truck': '🚛',
      'armored_vehicle': '🚜',
      'supply_vehicle': '🚚',
      'command_vehicle': '🚐',
      // Air assets
      'fighter_jet': '✈',
      'cargo_plane': '🛩',
      'helicopter': '🚁',
      'transport_helicopter': '🚁',
      'reconnaissance_plane': '🛫',
      'uav': '🛸',
      // Naval assets
      'patrol_boat': '⛵',
      'corvette': '🚢',
      'submarine': '🛥',
      'supply_ship': '🚢',
      'landing_craft': '⛴'
    }
    return symbols[type] || '📍'
  }

  const getStatusColor = () => {
    if (onMission) return BRAND.success
    if (asset.fuel_level && asset.fuel_level < 20) return BRAND.danger
    if (asset.maintenance_status === 'needs_maintenance') return BRAND.warning
    if (asset.has_battery && asset.battery != null) return getBatteryColor(asset.battery)
    return BRAND.primary
  }

  const isCritical = asset.fuel_level && asset.fuel_level < 15
  const needsMaintenance = asset.maintenance_status === 'needs_maintenance'

  const color = getStatusColor()
  const symbol = getAssetSymbol(asset.type)
  const size = onMission ? 32 : 28
  const pulse = isCritical ? 'animation: pulse 1.5s ease-in-out infinite;' : ''

  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        ${pulse}
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 2px solid #fff;
          border-radius: 6px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${size * 0.5}px;
        ">
          ${symbol}
        </div>

        ${onMission ? `
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 10px;
            height: 10px;
            background: ${BRAND.success};
            border: 1px solid #fff;
            border-radius: 50%;
            box-shadow: 0 0 4px ${BRAND.success};
          "></div>
        ` : ''}

        ${isCritical ? `
          <div style="
            position: absolute;
            bottom: -2px;
            left: -2px;
            width: 10px;
            height: 10px;
            background: ${BRAND.danger};
            border: 1px solid #fff;
            border-radius: 50%;
            box-shadow: 0 0 4px ${BRAND.danger};
          "></div>
        ` : ''}

        ${needsMaintenance ? `
          <div style="
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 10px;
            height: 10px;
            background: ${BRAND.warning};
            border: 1px solid #fff;
            border-radius: 50%;
          "></div>
        ` : ''}
      </div>

      <style>
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.85;
          }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: 'asset-marker'
  })
}