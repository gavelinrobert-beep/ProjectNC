import { api } from '../../../shared/services/api'

export const vehicleService = {
  getAll: () => api.get('/api/fleet/vehicles').then(res => res.data || res),
  getById: (id) => api.get(`/api/fleet/vehicles/${id}`).then(res => res.data || res),
  create: (data) => api.post('/api/fleet/vehicles', data).then(res => res.data || res),
  update: (id, data) => api.put(`/api/fleet/vehicles/${id}`, data).then(res => res.data || res),
  delete: (id) => api.delete(`/api/fleet/vehicles/${id}`).then(res => res.data || res),
  // Note: Using same endpoint as getAll since backend doesn't have dedicated tracking endpoint
  // React Query's polling mechanism (5s interval) provides real-time behavior
  getTracking: () => api.get('/api/fleet/vehicles').then(res => res.data || res)
}
