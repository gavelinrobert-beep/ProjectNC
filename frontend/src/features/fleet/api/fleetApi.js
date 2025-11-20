import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const fleetApi = {
  // Vehicles
  getVehicles: () => axios.get(`${BASE_URL}/api/fleet/vehicles`),
  getVehicle: (id) => axios.get(`${BASE_URL}/api/fleet/vehicles/${id}`),
  createVehicle: (data) => axios.post(`${BASE_URL}/api/fleet/vehicles`, data),
  updateVehicle: (id, data) => axios.put(`${BASE_URL}/api/fleet/vehicles/${id}`, data),
  deleteVehicle: (id) => axios.delete(`${BASE_URL}/api/fleet/vehicles/${id}`),

  // Telemetry
  getTelemetry: (vehicleId, params) => axios.get(`${BASE_URL}/api/fleet/telemetry/${vehicleId}`, { params }),
  getLatestTelemetry: (vehicleId) => axios.get(`${BASE_URL}/api/fleet/telemetry/${vehicleId}/latest`),

  // Drivers
  getDrivers: () => axios.get(`${BASE_URL}/api/fleet/drivers`),
  getDriver: (id) => axios.get(`${BASE_URL}/api/fleet/drivers/${id}`),
  createDriver: (data) => axios.post(`${BASE_URL}/api/fleet/drivers`, data),
  updateDriver: (id, data) => axios.put(`${BASE_URL}/api/fleet/drivers/${id}`, data),

  // Driver Behavior
  getDriverBehavior: (driverId, params) => axios.get(`${BASE_URL}/api/fleet/driver-behavior/${driverId}`, { params }),

  // Maintenance
  getMaintenanceEvents: (vehicleId) => axios.get(`${BASE_URL}/api/fleet/maintenance/${vehicleId}`),
  createMaintenanceEvent: (data) => axios.post(`${BASE_URL}/api/fleet/maintenance`, data),
  updateMaintenanceEvent: (id, data) => axios.put(`${BASE_URL}/api/fleet/maintenance/${id}`, data),

  // Alarms/Alerts
  getAlerts: (params) => axios.get(`${BASE_URL}/api/fleet/alerts`, { params }),
  acknowledgeAlert: (id) => axios.put(`${BASE_URL}/api/fleet/alerts/${id}/acknowledge`),
}