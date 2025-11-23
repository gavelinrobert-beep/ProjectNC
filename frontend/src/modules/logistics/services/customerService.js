import { api } from '../../../shared/services/api'

export const customerService = {
  getAll: () => api.get('/api/logistics/customers').then(res => res.data || res),
  getById: (id) => api.get(`/api/logistics/customers/${id}`).then(res => res.data || res),
  create: (data) => api.post('/api/logistics/customers', data).then(res => res.data || res),
  update: (id, data) => api.put(`/api/logistics/customers/${id}`, data).then(res => res.data || res),
  delete: (id) => api.delete(`/api/logistics/customers/${id}`).then(res => res.data || res)
}
