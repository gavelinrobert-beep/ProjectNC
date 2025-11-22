/**
 * Format date to Swedish format (YYYY-MM-DD)
 */
export function formatDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('sv-SE') // 2025-01-15
}

/**
 * Format date and time to Swedish format (YYYY-MM-DD HH:MM)
 */
export function formatDateTime(date) {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }) // 2025-01-15 14:30
}

/**
 * Format time only (HH:MM)
 */
export function formatTime(date) {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit'
  }) // 14:30
}

/**
 * Format relative date ("2 days ago", "Just now", etc.)
 * Note: Uses approximate values (7 days = week, 30 days = month, 365 days = year)
 * for simplicity and readability in relative time displays
 */
export function formatRelativeDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  
  const now = new Date()
  const diffMs = now - d
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  
  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
  
  if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7)
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  }
  
  if (diffDay < 365) {
    const months = Math.floor(diffDay / 30)
    return `${months} month${months !== 1 ? 's' : ''} ago`
  }
  
  const years = Math.floor(diffDay / 365)
  return `${years} year${years !== 1 ? 's' : ''} ago`
}

/**
 * Alias for backwards compatibility
 */
export function formatRelativeTime(date) {
  return formatRelativeDate(date)
}

/**
 * Format date for chart display (short month)
 */
export function formatChartDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  }) // Jan 15
}

/**
 * Parse date safely
 */
export function parseDate(date) {
  if (!date) return null
  const d = new Date(date)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Check if date is today
 */
export function isToday(date) {
  if (!date) return false
  const d = new Date(date)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date) {
  if (!date) return false
  const d = new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return d.toDateString() === yesterday.toDateString()
}

/**
 * Check if date is in the past
 */
export function isPast(dateString) {
  if (!dateString) return false
  return new Date(dateString) < new Date()
}

/**
 * Get date range for filters (e.g., "Last 7 days")
 */
export function getDateRange(range) {
  const now = new Date()
  const start = new Date()
  
  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case 'yesterday':
      start.setDate(start.getDate() - 1)
      start.setHours(0, 0, 0, 0)
      now.setDate(now.getDate() - 1)
      now.setHours(23, 59, 59, 999)
      break
    case 'last7days':
      start.setDate(start.getDate() - 7)
      break
    case 'last30days':
      start.setDate(start.getDate() - 30)
      break
    case 'thisMonth':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
    case 'lastMonth':
      start.setMonth(start.getMonth() - 1)
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      now.setDate(0)
      now.setHours(23, 59, 59, 999)
      break
    default:
      start.setDate(start.getDate() - 7)
  }
  
  return { start, end: now }
}
