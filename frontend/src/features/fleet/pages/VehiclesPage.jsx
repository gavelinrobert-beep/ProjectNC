import { useState } from 'react'
import { fleetApi } from '../api/fleetApi'
import { useApi } from '../../../hooks/useApi'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { formatDate } from '../../../utils/dateUtils'
import { getStatusColor, getStatusLabel } from '../../../utils/statusHelpers'

export default function VehiclesPage() {
  const { data: vehicles, loading, error, refetch } = useApi(() => fleetApi.getVehicles())
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle)
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
            <h3 className="text-lg font-semibold text-red-900">Error Loading Vehicles</h3>
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
        <LoadingSpinner size="lg" text="Loading vehicles..." />
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

      {/* Vehicle Grid */}
      {!vehicles || vehicles.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Vehicles</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new vehicle.</p>
          <div className="mt-6">
            <Button icon="+">Add Vehicle</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} hover onClick={() => handleViewDetails(vehicle)}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{vehicle.registration_number || vehicle.id}</h3>
                    <p className="text-sm text-gray-500">{vehicle.type || 'Vehicle'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                    {getStatusLabel(vehicle.status)}
                  </span>
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
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedVehicle.status)}`}>
                  {getStatusLabel(selectedVehicle.status)}
                </span>
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
                <p className="text-gray-900">{formatDate(selectedVehicle.updated_at, true)}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}