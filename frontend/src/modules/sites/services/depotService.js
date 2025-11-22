import { apiClient } from '../../../shared/services/apiClient'

export const depotService = {
  getAll: () => apiClient.get('/api/sites/depots'),
  getById: (id) => apiClient.get(`/api/sites/depots/${id}`),
  create: (data) => apiClient.post('/api/sites/depots', data),
  update: (id, data) => apiClient.put(`/api/sites/depots/${id}`, data),
  delete: (id) => apiClient.delete(`/api/sites/depots/${id}`)
}
