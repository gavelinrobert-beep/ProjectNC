// Aegis/frontend/src/lib/mapUtils.js
import L from 'leaflet'
import { BRAND } from './constants'

/**
 * Cluster nearby assets based on zoom level and distance
 */
export function clusterAssets(assets, zoom, maxDistance = 50) {
  // Don't cluster if zoomed in close
  if (zoom >= 8) return assets.map(a => ({ ...a, clustered: false, clusterCount: 1 }))

  const clusters = []
  const used = new Set()

  assets.forEach((asset, i) => {
    if (used.has(i)) return

    const cluster = {
      ...asset,
      clustered: true,
      clusterMembers: [asset],
      clusterCount: 1
    }

    // Find nearby assets to cluster
    assets.forEach((other, j) => {
      if (i === j || used.has(j)) return

      const distance = calculateDistance(
        asset.lat, asset.lon,
        other.lat, other.lon
      )

      // If within distance, add to cluster
      if (distance < maxDistance / Math.pow(2, zoom - 5)) {
        cluster.clusterMembers.push(other)
        cluster.clusterCount++
        used.add(j)
      }
    })

    used.add(i)
    clusters.push(cluster)
  })

  return clusters
}

/**
 * Calculate distance between two coordinates in km
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Create cluster icon with count badge
 */
export function createClusterIcon(count, status = 'normal') {
  const colors = {
    normal: BRAND.primary,
    warning: BRAND.warning,
    critical: BRAND.danger
  }

  const color = colors[status] || colors.normal
  const size = Math.min(60, 30 + count * 2)

  const pulseKeyframes = '@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.15); opacity: 0.3; } }'

  return L.divIcon({
    html: '<div style="position: relative; width: ' + size + 'px; height: ' + size + 'px; display: flex; align-items: center; justify-content: center;">' +
      '<div style="position: absolute; width: 100%; height: 100%; background: ' + color + '44; border-radius: 50%; animation: pulse 2s ease-in-out infinite;"></div>' +
      '<div style="position: relative; width: ' + (size - 10) + 'px; height: ' + (size - 10) + 'px; background: ' + color + 'dd; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1;">' +
        '<span style="font-size: ' + (size / 3) + 'px; font-weight: 700; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">' + count + '</span>' +
        '<span style="font-size: ' + (size / 6) + 'px; font-weight: 600; color: #fff; opacity: 0.9; text-transform: uppercase;">assets</span>' +
      '</div>' +
      '<style>' + pulseKeyframes + '</style>' +
    '</div>',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: 'cluster-marker'
  })
}

/**
 * Determine cluster status based on assets
 */
export function getClusterStatus(assets) {
  const criticalCount = assets.filter(a =>
    a.fuel_level < 15 || a.maintenance_status === 'needs_maintenance'
  ).length

  const warningCount = assets.filter(a =>
    a.fuel_level < 30 || a.maintenance_status === 'needs_attention'
  ).length

  if (criticalCount > 0) return 'critical'
  if (warningCount > 0) return 'warning'
  return 'normal'
}