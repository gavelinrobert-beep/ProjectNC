import { api } from '../../../shared/services/api'

export const inventoryService = {
  getAll: () => api.get('/api/sites/inventory').then(res => res.data || res),
  getByDepot: (depotId) => api.get(`/api/sites/inventory/${depotId}`).then(res => res.data || res),
  update: (id, data) => api.put(`/api/sites/inventory/${id}`, data).then(res => res.data || res)
}
