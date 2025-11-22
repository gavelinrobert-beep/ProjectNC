import { apiClient } from '../../../shared/services/apiClient'

export const vehicleService = {
  getAll: () => apiClient.get('/api/fleet/vehicles'),
  getById: (id) => apiClient.get(`/api/fleet/vehicles/${id}`),
  create: (data) => apiClient.post('/api/fleet/vehicles', data),
  update: (id, data) => apiClient.put(`/api/fleet/vehicles/${id}`, data),
  delete: (id) => apiClient.delete(`/api/fleet/vehicles/${id}`),
  // Note: Using same endpoint as getAll since backend doesn't have dedicated tracking endpoint
  // React Query's polling mechanism (5s interval) provides real-time behavior
  getTracking: () => apiClient.get('/api/fleet/vehicles')
}
