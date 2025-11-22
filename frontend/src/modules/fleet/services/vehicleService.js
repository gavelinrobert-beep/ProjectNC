import { apiClient } from '../../../shared/services/apiClient'

export const vehicleService = {
  getAll: () => apiClient.get('/api/fleet/vehicles'),
  getById: (id) => apiClient.get(`/api/fleet/vehicles/${id}`),
  create: (data) => apiClient.post('/api/fleet/vehicles', data),
  update: (id, data) => apiClient.put(`/api/fleet/vehicles/${id}`, data),
  delete: (id) => apiClient.delete(`/api/fleet/vehicles/${id}`),
  getTracking: () => apiClient.get('/api/fleet/vehicles')
}
