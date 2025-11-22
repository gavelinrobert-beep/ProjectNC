import React from 'react'
import { useVehicleTracking } from '../../fleet/hooks/useVehicles'
import MapView from '../../../components/map/MapView'
import ErrorMessage from '../../../shared/components/ui/ErrorMessage/ErrorMessage'

// Default map center: Stockholm, Sweden
const DEFAULT_MAP_CENTER = [59.3293, 18.0686]

export default function OperationsPage() {
  // Real-time vehicle tracking with 5-second polling
  const { data: vehicles, isLoading, error, refetch } = useVehicleTracking()
  
  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Live Vehicle Tracking</h1>
          <p className="text-gray-600 mt-2">Real-time fleet monitoring with 5-second updates</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin text-6xl mb-4">🔄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Vehicle Positions...</h3>
          <p className="text-gray-500">Connecting to fleet tracking system</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Live Vehicle Tracking</h1>
        </div>
        <ErrorMessage error={error} retry={refetch} />
      </div>
    )
  }
  
  // Transform API data to marker format for MapView
  const markers = vehicles?.map(vehicle => ({
    id: vehicle.id,
    name: vehicle.name || vehicle.registrationNumber || `Vehicle ${vehicle.id}`,
    lat: vehicle.currentLocation?.latitude || vehicle.latitude || DEFAULT_MAP_CENTER[0],
    lng: vehicle.currentLocation?.longitude || vehicle.longitude || DEFAULT_MAP_CENTER[1],
    status: vehicle.status || 'unknown',
    driver: vehicle.currentDriver?.name || 'Unassigned',
    speed: vehicle.currentSpeed || 0,
    lastUpdate: vehicle.lastUpdate || vehicle.updatedAt
  })) || []
  
  // Empty state
  if (markers.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Live Vehicle Tracking</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🚛</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Vehicles</h3>
          <p className="text-gray-500">No vehicles are currently active in the system</p>
        </div>
      </div>
    )
  }
  
  // Main view with live tracking
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Live Vehicle Tracking</h1>
          <p className="text-gray-600 mt-2">
            Monitoring {markers.length} vehicle{markers.length !== 1 ? 's' : ''} • Updates every 5 seconds
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-600">Live</span>
          </div>
          
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Refresh Now</span>
          </button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-sm mb-1">Total Vehicles</div>
          <div className="text-2xl font-bold text-gray-900">{markers.length}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-sm mb-1">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {markers.filter(v => v.status === 'active').length}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-sm mb-1">In Transit</div>
          <div className="text-2xl font-bold text-blue-600">
            {markers.filter(v => v.status === 'in_transit').length}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-sm mb-1">Idle</div>
          <div className="text-2xl font-bold text-gray-600">
            {markers.filter(v => v.status === 'idle').length}
          </div>
        </div>
      </div>
      
      {/* Map with live vehicle tracking */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <MapView
          markers={markers}
          center={DEFAULT_MAP_CENTER}
          zoom={12}
          height={600}
        />
      </div>
      
      {/* Vehicle details list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Vehicle Details</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {markers.map(vehicle => (
            <div key={vehicle.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="text-2xl">🚛</div>
                <div>
                  <div className="font-semibold text-gray-900">{vehicle.name}</div>
                  <div className="text-sm text-gray-600">{vehicle.driver}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Speed</div>
                  <div className="font-semibold">{vehicle.speed} km/h</div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-600">Position</div>
                  <div className="font-mono text-xs text-gray-600">
                    {typeof vehicle.lat === 'number' ? vehicle.lat.toFixed(4) : vehicle.lat}, {typeof vehicle.lng === 'number' ? vehicle.lng.toFixed(4) : vehicle.lng}
                  </div>
                </div>
                
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                    vehicle.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                    vehicle.status === 'idle' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}