import { api } from '../../../shared/services/api'

export const materialService = {
  getAll: () => api.get('/api/sites/materials').then(res => res.data || res),
  getById: (id) => api.get(`/api/sites/materials/${id}`).then(res => res.data || res),
  create: (data) => api.post('/api/sites/materials', data).then(res => res.data || res),
  update: (id, data) => api.put(`/api/sites/materials/${id}`, data).then(res => res.data || res),
  delete: (id) => api.delete(`/api/sites/materials/${id}`).then(res => res.data || res)
}
