import { apiClient } from '../../../shared/services/apiClient'

export const driverService = {
  getAll: () => apiClient.get('/api/fleet/drivers'),
  getById: (id) => apiClient.get(`/api/fleet/drivers/${id}`),
  create: (data) => apiClient.post('/api/fleet/drivers', data),
  update: (id, data) => apiClient.put(`/api/fleet/drivers/${id}`, data),
  delete: (id) => apiClient.delete(`/api/fleet/drivers/${id}`)
}
