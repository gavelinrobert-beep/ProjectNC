import { api } from '../../../shared/services/api'

export const driverService = {
  getAll: () => api.get('/api/fleet/drivers').then(res => res.data || res),
  getById: (id) => api.get(`/api/fleet/drivers/${id}`).then(res => res.data || res),
  create: (data) => api.post('/api/fleet/drivers', data).then(res => res.data || res),
  update: (id, data) => api.put(`/api/fleet/drivers/${id}`, data).then(res => res.data || res),
  delete: (id) => api.delete(`/api/fleet/drivers/${id}`).then(res => res.data || res)
}
