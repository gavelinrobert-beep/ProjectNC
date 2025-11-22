import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function BarChart({ data, xKey, yKey, title, color = '#10B981', height = 300 }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBar data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey={xKey} stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar 
            dataKey={yKey} 
            fill={color}
            radius={[8, 8, 0, 0]}
          />
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  )
}
