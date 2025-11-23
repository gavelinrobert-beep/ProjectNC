import { api } from '../../../shared/services/api'

export const maintenanceService = {
  getAll: () => api.get('/api/fleet/maintenance').then(res => res.data || res),
  getById: (id) => api.get(`/api/fleet/maintenance/${id}`).then(res => res.data || res),
  create: (data) => api.post('/api/fleet/maintenance', data).then(res => res.data || res),
  update: (id, data) => api.put(`/api/fleet/maintenance/${id}`, data).then(res => res.data || res),
  delete: (id) => api.delete(`/api/fleet/maintenance/${id}`).then(res => res.data || res)
}
