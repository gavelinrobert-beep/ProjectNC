import { useState } from 'react'
import { sitesApi } from '../api/sitesApi'
import { useApi } from '../../../hooks/useApi'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { formatDate } from '../../../utils/dateUtils'
import { getStatusColor, getStatusLabel } from '../../../utils/statusHelpers'
import MapView from '../../../components/map/MapView'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'

export default function DepotsPage() {
  const { data: depots, loading, error, refetch } = useApi(() => sitesApi.getDepots())
  const [selectedDepot, setSelectedDepot] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Mock depot locations (Stockholm area)
  const depotLocations = [
    {
      id: 1,
      name: 'Stockholm Depot',
      lat: 59.3293,
      lng: 18.0686,
      address: 'Stockholm South Industrial Area',
      capacity: 1000
    },
    {
      id: 2,
      name: 'Göteborg Depot',
      lat: 57.7089,
      lng: 11.9746,
      address: 'Göteborg North Harbor',
      capacity: 800
    }
  ]

  const depotGeofences = [
    {
      id: 1,
      name: 'Stockholm Depot Zone',
      lat: 59.3293,
      lng: 18.0686,
      radius: 500,
      color: '#10B981'
    },
    {
      id: 2,
      name: 'Göteborg Depot Zone',
      lat: 57.7089,
      lng: 11.9746,
      radius: 500,
      color: '#4A90E2'
    }
  ]
  const {
    filteredData,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    clearFilters
  } = useFilter(depots, {
    searchFields: ['name', 'address', 'city']
  })

  const handleViewDetails = (depot) => {
    setSelectedDepot(depot)
    setShowModal(true)
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-900">Error Loading Depots</h3>
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
        <LoadingSpinner size="lg" text="Loading depots..." />
      </div>
    )
  }

  const totalDepots = depots?.length || 0
  const activeDepots = depots?.filter(d => d.is_active !== false).length || 0
  const totalCapacity = depots?.reduce((sum, d) => sum + (d.capacity || 0), 0) || 0
  const avgUtilization = totalCapacity > 0 && depots?.length > 0
    ? Math.round(depots.reduce((sum, d) => sum + ((d.current_usage || 0) / (d.capacity || 1) * 100), 0) / depots.length)
    : 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Depots</h1>
          <p className="text-gray-600 mt-2">Manage depot locations and facilities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={refetch} disabled={loading}>
            🔄 Refresh
          </Button>
          <Button icon="+">
            Add Depot
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Depots</div>
          <div className="text-2xl font-bold text-gray-900">{totalDepots}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">{activeDepots}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Avg Capacity Utilization</div>
          <div className="text-2xl font-bold text-blue-600">{avgUtilization}%</div>
        </div>
      </div>

      {/* Depot Locations Map */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Depot Locations</h2>
        <MapView
          center={[59.3293, 18.0686]}
          zoom={6}
          depots={depotLocations}
          geofences={depotGeofences}
          height={450}
        />
      </div>

      {/* Search and Filter Toolbar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              placeholder="Search depots..."
              onSearch={setSearchQuery}
            />
          </div>
          
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
            <Button variant="secondary" onClick={() => exportToCSV(filteredData, 'depots')} size="sm">
              📥 CSV
            </Button>
            <Button variant="secondary" onClick={() => exportToJSON(filteredData, 'depots')} size="sm">
              📥 JSON
            </Button>
          </div>
        </div>
        {filteredData.length !== depots?.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredData.length} of {depots?.length || 0} depots
          </div>
        )}
      </div>

      {/* Depot Grid */}
      {!filteredData || filteredData.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Depots</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new depot.</p>
          <div className="mt-6">
            <Button icon="+">Add Depot</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((depot) => (
            <Card key={depot.id} hover onClick={() => handleViewDetails(depot)}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{depot.name || depot.id}</h3>
                    <p className="text-sm text-gray-500">{depot.address || 'No address'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${depot.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {depot.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-2">
                  {depot.capacity && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Capacity:</span>
                      <span className="font-medium text-gray-900">{depot.capacity} units</span>
                    </div>
                  )}
                  {depot.current_usage !== undefined && depot.capacity && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Utilization:</span>
                      <span className="font-medium text-gray-900">
                        {Math.round((depot.current_usage / depot.capacity) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation()
                      alert('View on map feature coming soon')
                    }}
                  >
                    View on Map
                  </Button>
                  <Button 
                    size="sm" 
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewDetails(depot)
                    }}
                  >
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Depot: ${selectedDepot?.name || selectedDepot?.id}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button>Edit Depot</Button>
          </>
        }
      >
        {selectedDepot && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900">{selectedDepot.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Address</label>
              <p className="text-gray-900">{selectedDepot.address || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedDepot.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {selectedDepot.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            {selectedDepot.capacity && (
              <div>
                <label className="text-sm font-medium text-gray-700">Capacity</label>
                <p className="text-gray-900">{selectedDepot.capacity} units</p>
              </div>
            )}
            {selectedDepot.current_usage !== undefined && (
              <div>
                <label className="text-sm font-medium text-gray-700">Current Usage</label>
                <p className="text-gray-900">{selectedDepot.current_usage} units</p>
              </div>
            )}
            {selectedDepot.lat && selectedDepot.lon && (
              <div>
                <label className="text-sm font-medium text-gray-700">Coordinates</label>
                <p className="text-gray-900">{selectedDepot.lat.toFixed(6)}, {selectedDepot.lon.toFixed(6)}</p>
              </div>
            )}
            {selectedDepot.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedDepot.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}