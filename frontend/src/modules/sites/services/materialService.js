import { apiClient } from '../../../shared/services/apiClient'

export const materialService = {
  getAll: () => apiClient.get('/api/sites/materials'),
  getById: (id) => apiClient.get(`/api/sites/materials/${id}`),
  create: (data) => apiClient.post('/api/sites/materials', data),
  update: (id, data) => apiClient.put(`/api/sites/materials/${id}`, data),
  delete: (id) => apiClient.delete(`/api/sites/materials/${id}`)
}
