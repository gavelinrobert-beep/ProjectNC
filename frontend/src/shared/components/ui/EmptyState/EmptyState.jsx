export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
