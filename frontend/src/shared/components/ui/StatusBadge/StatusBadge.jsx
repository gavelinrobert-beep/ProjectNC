import { getStatusConfig } from '../../../utils/statusHelpers'

export default function StatusBadge({ status }) {
  const config = getStatusConfig(status)
  
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800'
  }
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colorClasses[config.color]}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}
