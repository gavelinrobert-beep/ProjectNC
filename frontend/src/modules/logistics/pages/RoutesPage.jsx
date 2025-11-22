import { useState } from 'react'
import { useRoutes } from '../hooks/useRoutes'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import Modal from '../../../components/ui/Modal'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { StatusBadge, ErrorMessage, TableSkeleton } from '../../../shared/components/ui'
import { formatDateTime } from '../../../shared/utils'
import MapView from '../../../components/map/MapView'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'

export default function RoutesPage() {
  const { data: routes, isLoading: loading, error, refetch } = useRoutes()
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Mock route paths
  const routePaths = [
    {
      id: 1,
      name: 'Stockholm City Route',
      path: [
        [59.3293, 18.0686],
        [59.3393, 18.0586],
        [59.3493, 18.0786],
        [59.3293, 18.0986]
      ],
      color: '#10B981',
      stops: 5
    },
    {
      id: 2,
      name: 'Stockholm North',
      path: [
        [59.3193, 18.0486],
        [59.3093, 18.0586],
        [59.2993, 18.0686]
      ],
      color: '#4A90E2',
      stops: 3
    }
  ]

  // Mock vehicle positions
  const vehicleMarkers = [
    {
      id: 1,
      name: 'Truck 01',
      lat: 59.3293,
      lng: 18.0686,
      status: 'active',
      driver: 'Erik Andersson',
      speed: 45
    },
    {
      id: 2,
      name: 'Van 02',
      lat: 59.3393,
      lng: 18.0586,
      status: 'active',
      driver: 'Anna Svensson',
      speed: 60
    }
  ]
  const {
    filteredData,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    clearFilters
  } = useFilter(routes, {
    searchFields: ['name', 'driver_name', 'vehicle_name'],
    dateField: 'start_time'
  })

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
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'start_time',
      label: 'Start Time',
      render: (value) => formatDateTime(value)
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

  if (loading) {
    return (
      <div className="p-6">
        <TableSkeleton rows={5} columns={7} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage error={error} retry={refetch} />
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

      {/* Route Map Visualization */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Route Visualization</h2>
        <MapView
          center={[59.3293, 18.0686]}
          zoom={12}
          routes={routePaths}
          markers={vehicleMarkers}
          height={400}
        />
      </div>

      {/* Search and Filter Toolbar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              placeholder="Search routes..."
              onSearch={setSearchQuery}
            />
          </div>
          
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
          />

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
            <Button variant="secondary" onClick={() => exportToCSV(filteredData, 'routes')} size="sm">
              📥 CSV
            </Button>
            <Button variant="secondary" onClick={() => exportToJSON(filteredData, 'routes')} size="sm">
              📥 JSON
            </Button>
          </div>
        </div>
        {filteredData.length !== routes?.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredData.length} of {routes?.length || 0} routes
          </div>
        )}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredData || []}
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
                <StatusBadge status={selectedRoute.status} />
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
                <p className="text-gray-900">{formatDateTime(selectedRoute.start_time)}</p>
              </div>
            )}
            {selectedRoute.end_time && (
              <div>
                <label className="text-sm font-medium text-gray-700">End Time</label>
                <p className="text-gray-900">{formatDateTime(selectedRoute.end_time)}</p>
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
