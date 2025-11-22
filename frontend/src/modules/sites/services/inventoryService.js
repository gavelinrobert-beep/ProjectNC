import { apiClient } from '../../../shared/services/apiClient'

export const inventoryService = {
  getAll: () => apiClient.get('/api/sites/inventory'),
  getByDepot: (depotId) => apiClient.get(`/api/sites/inventory/${depotId}`),
  update: (id, data) => apiClient.put(`/api/sites/inventory/${id}`, data)
}
