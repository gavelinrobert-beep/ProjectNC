import { useState } from 'react'
import { logisticsApi } from '../api/logisticsApi'
import { useApi } from '../../../hooks/useApi'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import Modal from '../../../components/ui/Modal'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { formatDate } from '../../../utils/dateUtils'
import { getStatusColor, getStatusLabel } from '../../../utils/statusHelpers'

export default function RoutesPage() {
  const { data: routes, loading, error, refetch } = useApi(() => logisticsApi.getRoutes())
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const columns = [
    {
      key: 'name',
      label: 'Route Name',
      render: (value, row) => value || `Route #${row.id}`
    },
    {
      key: 'driver',
      label: 'Driver',
      render: (value) => value || 'Unassigned'
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (value) => value || 'Unassigned'
    },
    {
      key: 'stops',
      label: 'Stops',
      render: (value) => value?.length || 0
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}>
          {getStatusLabel(value)}
        </span>
      )
    },
    {
      key: 'start_time',
      label: 'Start Time',
      render: (value) => formatDate(value, true)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            setSelectedRoute(row)
            setShowModal(true)
          }}
        >
          View
        </Button>
      )
    }
  ]

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-900">Error Loading Routes</h3>
          </div>
          <p className="text-red-800 mb-4">{error}</p>
          <Button variant="danger" onClick={refetch}>
            🔄 Retry
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading routes..." />
      </div>
    )
  }

  const totalRoutes = routes?.length || 0
  const activeToday = routes?.filter(r => r.status === 'active' || r.status === 'in_progress').length || 0
  const completedRoutes = routes?.filter(r => r.status === 'completed').length || 0
  const avgStops = routes?.length > 0
    ? Math.round(routes.reduce((sum, r) => sum + (r.stops?.length || 0), 0) / routes.length)
    : 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Routes</h1>
          <p className="text-gray-600 mt-2">Plan and optimize delivery routes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={refetch} disabled={loading}>
            🔄 Refresh
          </Button>
          <Button icon="+">
            Create Route
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Routes</div>
          <div className="text-2xl font-bold text-gray-900">{totalRoutes}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Active Today</div>
          <div className="text-2xl font-bold text-blue-600">{activeToday}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Completed</div>
          <div className="text-2xl font-bold text-green-600">{completedRoutes}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Average Stops</div>
          <div className="text-2xl font-bold text-purple-600">{avgStops}</div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={routes || []}
        loading={loading}
        onRowClick={(row) => {
          setSelectedRoute(row)
          setShowModal(true)
        }}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Route: ${selectedRoute?.name || `#${selectedRoute?.id}`}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button>Edit Route</Button>
          </>
        }
      >
        {selectedRoute && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Route Name</label>
              <p className="text-gray-900">{selectedRoute.name || `Route #${selectedRoute.id}`}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRoute.status)}`}>
                  {getStatusLabel(selectedRoute.status)}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Driver</label>
              <p className="text-gray-900">{selectedRoute.driver || 'Unassigned'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Vehicle</label>
              <p className="text-gray-900">{selectedRoute.vehicle || 'Unassigned'}</p>
            </div>
            {selectedRoute.start_time && (
              <div>
                <label className="text-sm font-medium text-gray-700">Start Time</label>
                <p className="text-gray-900">{formatDate(selectedRoute.start_time, true)}</p>
              </div>
            )}
            {selectedRoute.end_time && (
              <div>
                <label className="text-sm font-medium text-gray-700">End Time</label>
                <p className="text-gray-900">{formatDate(selectedRoute.end_time, true)}</p>
              </div>
            )}
            {selectedRoute.stops && selectedRoute.stops.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700">Stops ({selectedRoute.stops.length})</label>
                <div className="mt-2 space-y-2">
                  {selectedRoute.stops.map((stop, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">Stop {idx + 1}</div>
                      <div className="text-gray-600">{stop.address || stop.location || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedRoute.distance && (
              <div>
                <label className="text-sm font-medium text-gray-700">Total Distance</label>
                <p className="text-gray-900">{selectedRoute.distance} km</p>
              </div>
            )}
            {selectedRoute.notes && (
              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <p className="text-gray-900">{selectedRoute.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}