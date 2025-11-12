// Aegis/frontend/src/lib/baseIcons.js
import L from 'leaflet'
import { BASE_COLORS } from './constants'

const BASE_ICON_MAP = {
  naval_base: '/assets/icons/navalbase.png',
  air_base: '/assets/icons/airport.png',
  army_base: '/assets/icons/military-base.png',
  command_center: '/assets/icons/military-base.png',
  support_base: '/assets/icons/barracks.png',
  headquarters: '/assets/icons/military-base.png',
  forward_base: '/assets/icons/barracks.png',
  training: '/assets/icons/barracks.png',
  logistics: '/assets/icons/barracks.png',
  default: '/assets/icons/military-base.png'
}

export function createBaseIcon(base) {
  console.log('🏭 createBaseIcon called for:', base.type, base.name)

  const iconPath = BASE_ICON_MAP[base.type] || BASE_ICON_MAP.default
  const color = BASE_COLORS[base.type] || '#FFB800'

  console.log('🏭 Using icon path:', iconPath, 'color:', color)

  const size = 40  // Make it bigger for visibility
  const iconSize = 24

  const htmlIcon = `
    <div style="position: relative; width: ${size}px; height: ${size}px;">
      <div style="
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid #fff;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
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
        " onerror="console.error('Failed to load base icon:', '${iconPath}')" />
      </div>
    </div>
  `

  return L.divIcon({
    html: htmlIcon,
    className: 'custom-base-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  })
}