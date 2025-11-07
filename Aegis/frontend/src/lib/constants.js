// Aegis/frontend/src/lib/constants.js

export const BRAND = {
  // New Glassmorphism Palette
  primary: '#00D9FF',      // Electric Blue
  secondary: '#FFB800',    // Amber Gold
  success: '#00FFC6',      // Teal Green
  warning: '#FFB800',      // Amber
  danger: '#FF3B5C',       // Coral Red
  info: '#A855F7',         // Purple

  // Background Layers
  bgBase: '#0D1117',       // Navy Black (base)
  bgCard: 'rgba(13, 17, 23, 0.6)',  // Glass card
  bgCardHover: 'rgba(13, 17, 23, 0.8)',  // Glass card hover
  border: 'rgba(0, 217, 255, 0.2)',  // Subtle blue border
  borderHover: 'rgba(0, 217, 255, 0.4)',  // Brighter on hover

  // Text
  text: '#F0F6FC',         // Near-white
  textMuted: '#8B949E',    // Muted gray
  textDim: '#6E7681',      // Dim gray

  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #00D9FF 0%, #00FFC6 100%)',
  gradientDanger: 'linear-gradient(135deg, #FF3B5C 0%, #FF6B88 100%)',
  gradientSuccess: 'linear-gradient(135deg, #00FFC6 0%, #00D9FF 100%)',

  // Shadows
  shadowSm: '0 2px 8px rgba(0, 0, 0, 0.3)',
  shadowMd: '0 4px 16px rgba(0, 0, 0, 0.4)',
  shadowLg: '0 8px 32px rgba(0, 0, 0, 0.5)',
  shadowGlow: '0 0 20px rgba(0, 217, 255, 0.3)',
}

export const BASE_COLORS = {
  military: '#FF3B5C',     // Coral red
  airfield: '#00D9FF',     // Electric blue
  logistics: '#FFB800',    // Amber
  storage: '#A855F7'       // Purple
}

export const MISSION_COLORS = {
  planned: '#00D9FF',      // Electric blue
  active: '#00FFC6',       // Teal green
  completed: '#8B949E',    // Muted gray
  cancelled: '#FF3B5C'     // Coral red
}

export const DEFAULT_MAP_CENTER = [62.3901, 17.3062]

export function getBatteryColor(battery) {
  if (battery <= 15) return BRAND.danger
  if (battery <= 30) return BRAND.warning
  if (battery <= 50) return BRAND.secondary
  return BRAND.success
}