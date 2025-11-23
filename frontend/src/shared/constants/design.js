// Design System Constants

// Colors (semantic)
export const COLORS = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  neutral: 'neutral',
}

// Spacing scale (in rem)
export const SPACING = {
  xs: 'px-2 py-1',     // 8px x 4px
  sm: 'px-3 py-2',     // 12px x 8px
  md: 'px-4 py-2',     // 16px x 8px
  lg: 'px-6 py-3',     // 24px x 12px
  xl: 'px-8 py-4',     // 32px x 16px
}

// Border radius
export const RADIUS = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
}

// Shadow levels
export const SHADOW = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
}

// Typography hierarchy
export const TEXT = {
  // Headings
  h1: 'text-4xl font-bold text-neutral-900',
  h2: 'text-3xl font-bold text-neutral-900',
  h3: 'text-2xl font-bold text-neutral-900',
  h4: 'text-xl font-semibold text-neutral-900',
  h5: 'text-lg font-semibold text-neutral-900',
  
  // Body
  body: 'text-base text-neutral-700',
  bodyLarge: 'text-lg text-neutral-700',
  bodySmall: 'text-sm text-neutral-600',
  
  // Misc
  caption: 'text-xs text-neutral-500',
  label: 'text-sm font-medium text-neutral-700',
  link: 'text-primary-600 hover:text-primary-700 focus:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 underline',
}

// Button variants
export const BUTTON_VARIANTS = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
  secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-400',
  success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
  ghost: 'text-primary-600 hover:bg-primary-50 active:bg-primary-100',
}

// Button sizes (touch-friendly with 44px minimum height)
export const BUTTON_SIZES = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-lg min-h-[44px]',
  xl: 'px-8 py-4 text-xl min-h-[48px]',
}

// Status colors (semantic)
export const STATUS_COLORS = {
  pending: 'bg-warning-100 text-warning-800',
  in_progress: 'bg-primary-100 text-primary-800',
  in_transit: 'bg-primary-100 text-primary-800',
  completed: 'bg-success-100 text-success-800',
  delivered: 'bg-success-100 text-success-800',
  cancelled: 'bg-neutral-100 text-neutral-800',
  failed: 'bg-danger-100 text-danger-800',
  active: 'bg-success-100 text-success-800',
  inactive: 'bg-neutral-100 text-neutral-800',
  maintenance: 'bg-warning-100 text-warning-800',
  idle: 'bg-neutral-100 text-neutral-800',
}

// Card styles
export const CARD = {
  base: 'bg-white rounded-lg shadow',
  hover: 'bg-white rounded-lg shadow hover:shadow-md transition-shadow',
  interactive: 'bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition-shadow',
  // Common padding combinations
  p4: 'bg-white rounded-lg shadow p-4',
  p6: 'bg-white rounded-lg shadow p-6',
}

// Input styles (touch-friendly with 44px minimum height)
export const INPUT = {
  base: 'w-full px-4 py-2.5 text-base border border-neutral-300 rounded-md min-h-[44px] focus:ring-2 focus:ring-primary-500 focus:border-transparent',
  error: 'w-full px-4 py-2.5 text-base border border-danger-300 rounded-md min-h-[44px] focus:ring-2 focus:ring-danger-500 focus:border-transparent',
  disabled: 'w-full px-4 py-2.5 text-base border border-neutral-200 rounded-md min-h-[44px] bg-neutral-50 text-neutral-400 cursor-not-allowed',
}
