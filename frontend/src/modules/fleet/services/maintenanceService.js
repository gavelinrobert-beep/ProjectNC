import { apiClient } from '../../../shared/services/apiClient'

export const maintenanceService = {
  getAll: () => apiClient.get('/api/fleet/maintenance'),
  getById: (id) => apiClient.get(`/api/fleet/maintenance/${id}`),
  create: (data) => apiClient.post('/api/fleet/maintenance', data),
  update: (id, data) => apiClient.put(`/api/fleet/maintenance/${id}`, data),
  delete: (id) => apiClient.delete(`/api/fleet/maintenance/${id}`)
}
