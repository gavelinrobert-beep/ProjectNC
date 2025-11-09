// Aegis/frontend/src/lib/mapIcons.js
import L from 'leaflet'
import { BRAND, getBatteryColor } from './constants'

const ICON_MAP = {
  // Naval vessels
  submarine: '/assets/icons/submarine.png',
  patrol_boat: '/assets/icons/patrol_boat.png',
  corvette: '/assets/icons/corvette.png',
  battleship: '/assets/icons/battleship.png',
  aircraft_carrier: '/assets/icons/aircraft-carrier.png',
  supply_ship: '/assets/icons/navalbase.png',
  landing_craft: '/assets/icons/navalbase.png',
  ship: '/assets/icons/battleship.png',

  // Aircraft - Fixed wing
  fighter_jet: '/assets/icons/fighter.png',
  fighter: '/assets/icons/fighter.png',
  reconnaissance_plane: '/assets/icons/aircraft.png',
  cargo_plane: '/assets/icons/airplane.png',
  airplane: '/assets/icons/airplane.png',
  plane: '/assets/icons/airplane.png',
  aircraft: '/assets/icons/aircraft.png',

  // Aircraft - Rotary wing
  helicopter: '/assets/icons/military_helicopter.png',
  transport_helicopter: '/assets/icons/transport_helicopter.png',
  military_helicopter: '/assets/icons/military_helicopter.png',

  // UAVs
  uav: '/assets/icons/drone.png',
  drone: '/assets/icons/drone.png',

  // Ground vehicles - Armored
  tank: '/assets/icons/tank.png',
  armored_vehicle: '/assets/icons/apc.png',
  apc: '/assets/icons/apc.png',

  // Ground vehicles - Wheeled
  truck: '/assets/icons/military-truck.png',
  supply_vehicle: '/assets/icons/military-truck.png',
  command_vehicle: '/assets/icons/military-truck.png',
  military_truck: '/assets/icons/military-truck.png',
  jeep: '/assets/icons/jeep.png',

  // Support
  artillery: '/assets/icons/artillery.png',

  default: '/assets/icons/military-truck.png'
}

export function createAssetIcon(asset, onMission) {
  if (!onMission) onMission = false

  const iconPath = ICON_MAP[asset.type] || ICON_MAP.default

  let statusColor = BRAND.primary
  if (asset.fuel_level !== undefined && asset.fuel_level < 20) {
    statusColor = BRAND.danger
  } else if (asset.fuel_level !== undefined && asset.fuel_level < 50) {
    statusColor = BRAND.warning
  } else if (asset.maintenance_status === 'needs_maintenance') {
    statusColor = BRAND.danger
  } else if (onMission) {
    statusColor = BRAND.success
  }

  const size = 36
  const iconSize = 24

  const pulseRing = onMission
    ? `<div style="position: absolute; width: ${size + 10}px; height: ${size + 10}px; border: 2px solid ${statusColor}; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); animation: pulse 2s ease-in-out infinite;"></div>`
    : ''

  const fuelBadge = (asset.fuel_level !== undefined && asset.fuel_level < 30)
    ? `<div style="position: absolute; top: -2px; right: -2px; width: 14px; height: 14px; background: ${BRAND.danger}; border: 2px solid #fff; border-radius: 50%; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 10px;">⛽</div>`
    : ''

  const maintenanceBadge = (asset.maintenance_status === 'needs_maintenance')
    ? `<div style="position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; background: ${BRAND.warning}; border: 2px solid #fff; border-radius: 50%; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 10px;">🔧</div>`
    : ''

  const htmlIcon = `
    <style>
      @keyframes pulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.4; }
      }
    </style>
    <div style="position: relative; width: ${size}px; height: ${size}px;">
      ${pulseRing}
      <div style="
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${statusColor};
        border: 3px solid #fff;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      ">
        <img src="${iconPath}" style="
          width: ${iconSize}px;
          height: ${iconSize}px;
          filter: brightness(0) invert(1);
        "/>
      </div>
      ${fuelBadge}
      ${maintenanceBadge}
    </div>
  `

  return L.divIcon({
    html: htmlIcon,
    className: 'custom-asset-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

export function createSmallAssetIcon(asset) {
  const iconPath = ICON_MAP[asset.type] || ICON_MAP.default
  const size = 24
  const iconSize = 16

  let statusColor = BRAND.primary
  if (asset.fuel_level !== undefined && asset.fuel_level < 20) {
    statusColor = BRAND.danger
  } else if (asset.maintenance_status === 'needs_maintenance') {
    statusColor = BRAND.warning
  }

  const html = `
    <div style="width: ${size}px; height: ${size}px; background: ${statusColor}dd; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
      <img src="${iconPath}" style="width: ${iconSize}px; height: ${iconSize}px; object-fit: contain; filter: brightness(0) invert(1);" />
    </div>
  `

  return L.divIcon({
    html: html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: 'asset-marker-small'
  })
}