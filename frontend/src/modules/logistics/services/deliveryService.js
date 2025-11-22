import { apiClient } from '../../../shared/services/apiClient'

export const deliveryService = {
  getAll: () => apiClient.get('/api/logistics/deliveries'),
  getById: (id) => apiClient.get(`/api/logistics/deliveries/${id}`),
  create: (data) => apiClient.post('/api/logistics/deliveries', data),
  update: (id, data) => apiClient.put(`/api/logistics/deliveries/${id}`, data),
  delete: (id) => apiClient.delete(`/api/logistics/deliveries/${id}`)
}
