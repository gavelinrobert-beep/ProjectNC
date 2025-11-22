import { useState } from 'react'
import { useVehicles } from '../hooks/useVehicles'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { StatusBadge, EmptyState, ErrorMessage, TableSkeleton } from '../../../shared/components/ui'
import { formatDateTime } from '../../../shared/utils'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'

export default function VehiclesPage() {
  const { data: vehicles, isLoading: loading, error, refetch } = useVehicles()
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const {
    filteredData,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    clearFilters
  } = useFilter(vehicles, {
    searchFields: ['name', 'plate', 'type']
  })

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle)
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="p-6">
        <TableSkeleton rows={6} columns={4} />
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

  const totalVehicles = vehicles?.length || 0
  const activeVehicles = vehicles?.filter(v => v.status === 'active').length || 0
  const maintenanceVehicles = vehicles?.filter(v => v.status === 'maintenance').length || 0
  const avgFuelLevel = vehicles?.length > 0 
    ? Math.round(vehicles.reduce((sum, v) => sum + (v.fuel_level || 0), 0) / vehicles.length)
    : 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vehicles</h1>
          <p className="text-gray-600 mt-2">Manage fleet vehicles and live tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={refetch} disabled={loading}>
            🔄 Refresh
          </Button>
          <Button icon="+">
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Vehicles</div>
          <div className="text-2xl font-bold text-gray-900">{totalVehicles}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">{activeVehicles}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">In Maintenance</div>
          <div className="text-2xl font-bold text-yellow-600">{maintenanceVehicles}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Average Fuel Level</div>
          <div className="text-2xl font-bold text-blue-600">{avgFuelLevel}%</div>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              placeholder="Search vehicles..."
              onSearch={setSearchQuery}
            />
          </div>
          
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'idle', label: 'Idle' }
            ]}
          />

          <FilterDropdown
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'truck', label: 'Truck' },
              { value: 'van', label: 'Van' },
              { value: 'car', label: 'Car' }
            ]}
          />

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={clearFilters} size="sm">
              Clear
            </Button>
            <Button variant="secondary" onClick={() => exportToCSV(filteredData, 'vehicles')} size="sm">
              📥 CSV
            </Button>
            <Button variant="secondary" onClick={() => exportToJSON(filteredData, 'vehicles')} size="sm">
              📥 JSON
            </Button>
          </div>
        </div>
        {filteredData.length !== vehicles?.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredData.length} of {vehicles?.length || 0} vehicles
          </div>
        )}
      </div>

      {/* Vehicle Grid */}
      {!filteredData || filteredData.length === 0 ? (
        <EmptyState
          icon="🚗"
          title="No Vehicles"
          description="Get started by adding a new vehicle."
          action={<Button icon="+">Add Vehicle</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((vehicle) => (
            <Card key={vehicle.id} hover onClick={() => handleViewDetails(vehicle)}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{vehicle.registration_number || vehicle.id}</h3>
                    <p className="text-sm text-gray-500">{vehicle.type || 'Vehicle'}</p>
                  </div>
                  <StatusBadge status={vehicle.status} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fuel Level:</span>
                    <span className="font-medium text-gray-900">{vehicle.fuel_level || 0}%</span>
                  </div>
                  {vehicle.odometer && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Odometer:</span>
                      <span className="font-medium text-gray-900">{vehicle.odometer} km</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation()
                      alert('Track feature coming soon')
                    }}
                  >
                    Track
                  </Button>
                  <Button 
                    size="sm" 
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewDetails(vehicle)
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
        title={`Vehicle: ${selectedVehicle?.registration_number || selectedVehicle?.id}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button>Edit Vehicle</Button>
          </>
        }
      >
        {selectedVehicle && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Registration Number</label>
              <p className="text-gray-900">{selectedVehicle.registration_number || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <p className="text-gray-900">{selectedVehicle.type || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <StatusBadge status={selectedVehicle.status} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fuel Level</label>
              <p className="text-gray-900">{selectedVehicle.fuel_level || 0}%</p>
            </div>
            {selectedVehicle.odometer && (
              <div>
                <label className="text-sm font-medium text-gray-700">Odometer</label>
                <p className="text-gray-900">{selectedVehicle.odometer} km</p>
              </div>
            )}
            {selectedVehicle.lat && selectedVehicle.lon && (
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <p className="text-gray-900">{selectedVehicle.lat.toFixed(6)}, {selectedVehicle.lon.toFixed(6)}</p>
              </div>
            )}
            {selectedVehicle.updated_at && (
              <div>
                <label className="text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-gray-900">{formatDateTime(selectedVehicle.updated_at)}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}