import { apiClient } from '../../../shared/services/apiClient'

export const routeService = {
  getAll: () => apiClient.get('/api/logistics/routes'),
  getById: (id) => apiClient.get(`/api/logistics/routes/${id}`),
  create: (data) => apiClient.post('/api/logistics/routes', data),
  update: (id, data) => apiClient.put(`/api/logistics/routes/${id}`, data),
  delete: (id) => apiClient.delete(`/api/logistics/routes/${id}`)
}
