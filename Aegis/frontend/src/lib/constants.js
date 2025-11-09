// Aegis/frontend/src/lib/constants.js

export const BRAND = {
  primary: '#00BFFF',
  secondary: '#FFD700',
  success: '#00FF88',
  warning: '#FFA500',
  danger: '#FF4444',
  dark: '#0a0a0a',
  card: '#1a1a1a',
  border: '#2a2a2a',
}

export const BASE_COLORS = {
  military: '#FF3B5C',     // Coral red
  airfield: '#00D9FF',     // Electric blue
  logistics: '#FFB800',    // Amber
  storage: '#A855F7',      // Purple


  air_base: '#00D9FF',     // Electric blue (same as airfield)
  naval_base: '#3B82F6',   // Navy blue
  army_base: '#FF3B5C',    // Coral red (same as military)
  command_center: '#A855F7', // Purple
  support_base: '#FFB800'  // Amber (same as logistics)
}

export const MISSION_COLORS = {
  planned: BRAND.primary,
  active: BRAND.success,
  completed: '#96a39a',
  cancelled: BRAND.danger
}

export const DEFAULT_MAP_CENTER = [62.3901, 17.3062]

export function getBatteryColor(battery) {
  if (battery <= 15) return BRAND.danger
  if (battery <= 30) return BRAND.warning
  if (battery <= 50) return BRAND.secondary
  return BRAND.success
}