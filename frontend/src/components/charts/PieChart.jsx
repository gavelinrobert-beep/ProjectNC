import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const DEFAULT_COLORS = ['#4A90E2', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316']

export default function PieChart({ data, nameKey, valueKey, title, colors = DEFAULT_COLORS, height = 300 }) {
  const total = data.reduce((sum, item) => sum + item[valueKey], 0)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1)
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const renderLabel = (entry) => {
    const percentage = ((entry[valueKey] / total) * 100).toFixed(0)
    return `${percentage}%`
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey={valueKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  )
}
