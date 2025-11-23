import { api } from '../../../shared/services/api'

export const deliveryService = {
  getAll: () => api.get('/api/logistics/deliveries').then(res => res.data || res),
  getById: (id) => api.get(`/api/logistics/deliveries/${id}`).then(res => res.data || res),
  create: (data) => api.post('/api/logistics/deliveries', data).then(res => res.data || res),
  update: (id, data) => api.put(`/api/logistics/deliveries/${id}`, data).then(res => res.data || res),
  delete: (id) => api.delete(`/api/logistics/deliveries/${id}`).then(res => res.data || res)
}
