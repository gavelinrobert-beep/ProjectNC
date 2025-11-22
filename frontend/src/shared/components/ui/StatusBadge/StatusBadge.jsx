import { STATUS_COLORS } from '../../../constants/design'
import { getStatusConfig } from '../../../../utils/statusHelpers'

export default function StatusBadge({ status, children }) {
  const config = getStatusConfig(status)
  const statusText = children || config.label || status.replace('_', ' ')
  const colorClasses = STATUS_COLORS[status] || STATUS_COLORS.pending

  return (
    <span className={`${colorClasses} px-3 py-1 rounded-full text-xs font-medium capitalize inline-flex items-center gap-1`}>
      {config.icon && <span>{config.icon}</span>}
      <span>{statusText}</span>
    </span>
  )
}
