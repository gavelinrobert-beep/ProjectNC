import { api } from '../../../shared/services/api'

export const routeService = {
  getAll: () => api.get('/api/logistics/routes').then(res => res.data || res),
  getById: (id) => api.get(`/api/logistics/routes/${id}`).then(res => res.data || res),
  create: (data) => api.post('/api/logistics/routes', data).then(res => res.data || res),
  update: (id, data) => api.put(`/api/logistics/routes/${id}`, data).then(res => res.data || res),
  delete: (id) => api.delete(`/api/logistics/routes/${id}`).then(res => res.data || res)
}
