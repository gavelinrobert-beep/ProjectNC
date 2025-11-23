// Legacy status configuration - deprecated
// Use StatusBadge component directly instead
export const STATUS_CONFIG = {
  // Delivery statuses
  delivered: { label: 'Delivered', color: 'green', icon: '✓' },
  in_transit: { label: 'In Transit', color: 'blue', icon: '🚚' },
  pending: { label: 'Pending', color: 'yellow', icon: '⏳' },
  failed: { label: 'Failed', color: 'red', icon: '✗' },
  
  // Vehicle statuses
  active: { label: 'Active', color: 'green', icon: '✓' },
  maintenance: { label: 'Maintenance', color: 'orange', icon: '🔧' },
  idle: { label: 'Idle', color: 'gray', icon: '⏸' },
  out_of_service: { label: 'Out of Service', color: 'red', icon: '✗' },
  inactive: { label: 'Inactive', color: 'gray', icon: '⏸' },
  breakdown: { label: 'Breakdown', color: 'red', icon: '✗' },
  
  // Driver statuses
  available: { label: 'Available', color: 'green', icon: '✓' },
  on_duty: { label: 'On Duty', color: 'blue', icon: '🚗' },
  off_duty: { label: 'Off Duty', color: 'gray', icon: '⏸' },
  on_break: { label: 'On Break', color: 'yellow', icon: '☕' },
  
  // Generic statuses
  completed: { label: 'Completed', color: 'green', icon: '✓' },
  scheduled: { label: 'Scheduled', color: 'blue', icon: '📅' },
  cancelled: { label: 'Cancelled', color: 'red', icon: '✗' },
  open: { label: 'Open', color: 'blue', icon: '📂' },
  in_progress: { label: 'In Progress', color: 'yellow', icon: '⏳' },
  on_hold: { label: 'On Hold', color: 'orange', icon: '⏸' },
  closed: { label: 'Closed', color: 'gray', icon: '✓' }
}

// Legacy function - deprecated
// Use StatusBadge component directly instead
export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || { label: status, color: 'gray', icon: '•' }
}
