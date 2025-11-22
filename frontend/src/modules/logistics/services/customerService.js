import { apiClient } from '../../../shared/services/apiClient'

export const customerService = {
  getAll: () => apiClient.get('/api/logistics/customers'),
  getById: (id) => apiClient.get(`/api/logistics/customers/${id}`),
  create: (data) => apiClient.post('/api/logistics/customers', data),
  update: (id, data) => apiClient.put(`/api/logistics/customers/${id}`, data),
  delete: (id) => apiClient.delete(`/api/logistics/customers/${id}`)
}
