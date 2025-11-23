// DEPRECATED: Use StatusBadge component from shared/components/ui/StatusBadge instead
// This function is kept for backward compatibility only
export function getStatusColor(status) {
  const statusColors = {
    // Delivery statuses
    pending: 'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',

    // Vehicle statuses
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    breakdown: 'bg-red-100 text-red-800',

    // Work order statuses
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    on_hold: 'bg-orange-100 text-orange-800',
    closed: 'bg-gray-100 text-gray-800',
  }

  return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status) {
  if (!status) return 'Unknown'

  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getPriorityColor(priority) {
  const priorityColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600',
  }

  return priorityColors[priority?.toLowerCase()] || 'text-gray-600'
}