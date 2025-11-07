// Aegis/frontend/src/lib/mapIcons.js
import L from 'leaflet'
import { BRAND, getBatteryColor } from './constants'

const ICON_MAP = {
  submarine: '/assets/icons/submarine.png',
  patrol_boat: '/assets/icons/navy.png',
  corvette: '/assets/icons/navy.png',
  supply_ship: '/assets/icons/navy.png',
  landing_craft: '/assets/icons/navy.png',
  fighter_jet: '/assets/icons/fighter-jet.png',
  fighter: '/assets/icons/fighter.png',
  reconnaissance_plane: '/assets/icons/fighter-jet.png',
  cargo_plane: '/assets/icons/airplane.png',
  airplane: '/assets/icons/airplane.png',
  helicopter: '/assets/icons/military-helicopter.png',
  transport_helicopter: '/assets/icons/military-helicopter.png',
  military_helicopter: '/assets/icons/military-helicopter.png',
  uav: '/assets/icons/drone.png',
  drone: '/assets/icons/drone.png',
  tank: '/assets/icons/tank.png',
  armored_vehicle: '/assets/icons/tank.png',
  truck: '/assets/icons/military-truck.png',
  supply_vehicle: '/assets/icons/military-truck.png',
  command_vehicle: '/assets/icons/military-truck.png',
  military_truck: '/assets/icons/military-truck.png',
  default: '/assets/icons/military-truck.png'
}

export function createAssetIcon(asset, onMission = false) {
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
    ? '<div style="position: absolute; width: ' + (size + 10) + 'px; height: ' + (size + 10) + 'px; border: 2px solid ' + statusColor + '; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); animation: pulse 2s ease-in-out infinite;"></div>'
    : ''

  const fuelBadge = (asset.fuel_level !== undefined && asset.fuel_level < 30)
    ? '<div style="position: absolute; top: -2px; right: -2px; width: 14px; height: 14px; background: ' + BRAND.danger + '; border: 2px solid #fff; border-radius: 50%; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 10px;">⛽</div>'
    : ''

  const maintenanceBadge = (asset.maintenance_status === 'needs_maintenance')
    ? '<div style="position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; background: ' + BRAND.warning + '; border: 2px solid #fff; border-radius: 50%; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 10px;">🔧</div>'
    : ''

  const pulseKeyframes = '@keyframes pulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; } 50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.3; } }'

  const html =
    '<div style="position: relative; width: ' + size + 'px; height: ' + size + 'px; display: flex; align-items: center; justify-content: center;">' +
      pulseRing +
      '<div style="position: relative; width: ' + size + 'px; height: ' + size + 'px; background: ' + statusColor + 'dd; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1; overflow: hidden;">' +
        '<img src="' + iconPath + '" style="width: ' + iconSize + 'px; height: ' + iconSize + 'px; object-fit: contain; filter: brightness(0) invert(1);" />' +
      '</div>' +
      fuelBadge +
      maintenanceBadge +
      '<style>' + pulseKeyframes + '</style>' +
    '</div>'

  return L.divIcon({
    html: html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    className: 'asset-marker'
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

  const html =
    '<div style="width: ' + size + 'px; height: ' + size + 'px; background: ' + statusColor + 'dd; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">' +
      '<img src="' + iconPath + '" style="width: ' + iconSize + 'px; height: ' + iconSize + 'px; object-fit: contain; filter: brightness(0) invert(1);" />' +
    '</div>'

  return L.divIcon({
    html: html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: 'asset-marker-small'
  })
}

export function createNATOSymbol(asset, size = 36) {
  const iconPath = ICON_MAP[asset.type] || ICON_MAP.default

  const allegianceColors = {
    friendly: BRAND.primary,
    neutral: BRAND.warning,
    hostile: BRAND.danger,
    unknown: '#999'
  }

  const symbolColor = allegianceColors[asset.allegiance || 'friendly']

  const html =
    '<div style="width: ' + size + 'px; height: ' + size + 'px; background: ' + symbolColor + 'cc; border: 3px solid #000; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; position: relative;">' +
      '<img src="' + iconPath + '" style="width: ' + (size - 12) + 'px; height: ' + (size - 12) + 'px; object-fit: contain; filter: brightness(0) invert(1);" />' +
      '<div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: #000; color: #fff; font-size: 8px; padding: 1px 4px; border-radius: 2px; font-weight: bold; white-space: nowrap;">' + asset.id + '</div>' +
    '</div>'

  return L.divIcon({
    html: html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    className: 'nato-symbol'
  })
}