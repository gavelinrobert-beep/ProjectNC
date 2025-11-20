export default function VehiclesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Vehicles</h1>
        <p className="text-gray-600 mt-2">Manage fleet vehicles and live tracking</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Vehicle Fleet</h3>
          <p className="mt-1 text-sm text-gray-500">Coming in Phase C - Full implementation</p>
        </div>
      </div>
    </div>
  )
}