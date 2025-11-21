// frontend/src/components/map/MapView.jsx
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'

// Fix for default marker icons in Leaflet with Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

export default function MapView({
  center = [59.3293, 18.0686], // Stockholm coordinates
  zoom = 12,
  markers = [],
  routes = [],
  depots = [],
  geofences = [],
  height = 500
}) {
  
  // Custom icon based on marker status
  const getMarkerColor = (status) => {
    switch(status) {
      case 'active': return '#10B981' // green
      case 'idle': return '#F59E0B' // yellow
      case 'maintenance': return '#EF4444' // red
      default: return '#4A90E2' // blue
    }
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: `${height}px`, width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Vehicle Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">{marker.name}</h3>
                <p className="text-sm text-gray-600">{marker.status}</p>
                {marker.driver && <p className="text-sm">Driver: {marker.driver}</p>}
                {marker.speed !== undefined && <p className="text-sm">Speed: {marker.speed} km/h</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Polylines */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.path}
            color={route.color || '#4A90E2'}
            weight={3}
            opacity={0.7}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{route.name}</h3>
                <p className="text-sm">{route.stops} stops</p>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Depot Markers */}
        {depots.map((depot) => (
          <Marker
            key={depot.id}
            position={[depot.lat, depot.lng]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">🏢 {depot.name}</h3>
                <p className="text-sm text-gray-600">{depot.address}</p>
                <p className="text-sm">Capacity: {depot.capacity}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Geofence Circles */}
        {geofences.map((geofence) => (
          <Circle
            key={geofence.id}
            center={[geofence.lat, geofence.lng]}
            radius={geofence.radius}
            pathOptions={{
              color: geofence.color || '#4A90E2',
              fillColor: geofence.color || '#4A90E2',
              fillOpacity: 0.1
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{geofence.name}</h3>
                <p className="text-sm">Radius: {geofence.radius}m</p>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  )
}
