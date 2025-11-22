export function formatDate(date) {
  if (!date) return 'N/A'
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return 'Invalid date'
  
  return dateObj.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export function formatDateTime(date) {
  if (!date) return 'N/A'
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return 'Invalid date'
  
  return dateObj.toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTime(date) {
  if (!date) return 'N/A'
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return 'Invalid date'
  
  return dateObj.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatRelativeTime(date) {
  if (!date) return 'N/A'
  const now = new Date()
  const then = new Date(date)
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just nu'
  if (diffMins < 60) return `${diffMins} min sedan`
  if (diffHours < 24) return `${diffHours} tim sedan`
  return `${diffDays} dag${diffDays !== 1 ? 'ar' : ''} sedan`
}

export function isToday(dateString) {
  if (!dateString) return false

  const date = new Date(dateString)
  const today = new Date()

  return date.toDateString() === today.toDateString()
}

export function isPast(dateString) {
  if (!dateString) return false

  return new Date(dateString) < new Date()
}
