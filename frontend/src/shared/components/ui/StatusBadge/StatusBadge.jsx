import React from 'react'

export default function StatusBadge({ status, size = 'md' }) {
  if (!status) return null

  const statusLower = status.toLowerCase()

  // Status color mapping - single source of truth
  const statusStyles = {
    // Delivery statuses
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
    'in_transit': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'completed': 'bg-green-100 text-green-800 border-green-200',
    'delivered': 'bg-green-100 text-green-800 border-green-200',
    'cancelled': 'bg-gray-100 text-gray-800 border-gray-200',
    'failed': 'bg-red-100 text-red-800 border-red-200',
    
    // Vehicle statuses
    'active': 'bg-green-100 text-green-800 border-green-200',
    'inactive': 'bg-gray-100 text-gray-800 border-gray-200',
    'maintenance': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'out_of_service': 'bg-red-100 text-red-800 border-red-200',
    'breakdown': 'bg-red-100 text-red-800 border-red-200',
    'idle': 'bg-gray-100 text-gray-800 border-gray-200',
    'parked': 'bg-gray-100 text-gray-800 border-gray-200',
    
    // Driver statuses
    'on_duty': 'bg-green-100 text-green-800 border-green-200',
    'off_duty': 'bg-gray-100 text-gray-800 border-gray-200',
    'on_break': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'available': 'bg-green-100 text-green-800 border-green-200',
    
    // Route statuses
    'planned': 'bg-blue-100 text-blue-800 border-blue-200',
    
    // Maintenance statuses
    'scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
    'overdue': 'bg-red-100 text-red-800 border-red-200',
    
    // Work order statuses
    'open': 'bg-blue-100 text-blue-800 border-blue-200',
    'on_hold': 'bg-orange-100 text-orange-800 border-orange-200',
    'closed': 'bg-gray-100 text-gray-800 border-gray-200',
    'draft': 'bg-gray-100 text-gray-800 border-gray-200',
    
    // Project statuses
    'planning': 'bg-blue-100 text-blue-800 border-blue-200',
    
    // Priority levels
    'low': 'bg-gray-100 text-gray-800 border-gray-200',
    'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'high': 'bg-orange-100 text-orange-800 border-orange-200',
    'urgent': 'bg-red-100 text-red-800 border-red-200',
    'critical': 'bg-red-100 text-red-800 border-red-200',
    
    // Generic statuses
    'in_use': 'bg-blue-100 text-blue-800 border-blue-200',
    'submitted': 'bg-blue-100 text-blue-800 border-blue-200',
    'approved': 'bg-green-100 text-green-800 border-green-200',
    'rejected': 'bg-red-100 text-red-800 border-red-200',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  const styleClass = statusStyles[statusLower] || 'bg-gray-100 text-gray-800 border-gray-200'

  // Format display text (replace underscores with spaces, capitalize)
  const displayText = status
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${styleClass}
        ${sizeClasses[size]}
      `}
    >
      {displayText}
    </span>
  )
}
