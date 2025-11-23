import { api } from '../../../shared/services/api'

export const depotService = {
  getAll: () => api.get('/api/sites/depots').then(res => res.data || res),
  getById: (id) => api.get(`/api/sites/depots/${id}`).then(res => res.data || res),
  create: (data) => api.post('/api/sites/depots', data).then(res => res.data || res),
  update: (id, data) => api.put(`/api/sites/depots/${id}`, data).then(res => res.data || res),
  delete: (id) => api.delete(`/api/sites/depots/${id}`).then(res => res.data || res)
}
