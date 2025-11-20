import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const worksApi = {
  // Projects
  getProjects: (params) => axios.get(`${BASE_URL}/api/works/projects`, { params }),
  getProject: (id) => axios.get(`${BASE_URL}/api/works/projects/${id}`),
  createProject: (data) => axios.post(`${BASE_URL}/api/works/projects`, data),
  updateProject: (id, data) => axios.put(`${BASE_URL}/api/works/projects/${id}`, data),
  deleteProject: (id) => axios.delete(`${BASE_URL}/api/works/projects/${id}`),

  // Work Orders
  getWorkOrders: (params) => axios.get(`${BASE_URL}/api/works/work-orders`, { params }),
  getWorkOrder: (id) => axios.get(`${BASE_URL}/api/works/work-orders/${id}`),
  createWorkOrder: (data) => axios.post(`${BASE_URL}/api/works/work-orders`, data),
  updateWorkOrder: (id, data) => axios.put(`${BASE_URL}/api/works/work-orders/${id}`, data),
  deleteWorkOrder: (id) => axios.delete(`${BASE_URL}/api/works/work-orders/${id}`),

  // Machine Hours
  getMachineHours: (params) => axios.get(`${BASE_URL}/api/works/machine-hours`, { params }),
  logMachineHours: (data) => axios.post(`${BASE_URL}/api/works/machine-hours`, data),
  updateMachineHours: (id, data) => axios.put(`${BASE_URL}/api/works/machine-hours/${id}`, data),

  // Machines
  getMachines: () => axios.get(`${BASE_URL}/api/works/machines`),
  getMachine: (id) => axios.get(`${BASE_URL}/api/works/machines/${id}`),
  createMachine: (data) => axios.post(`${BASE_URL}/api/works/machines`, data),

  // Change Orders (ÄTA)
  getChangeOrders: (projectId) => axios.get(`${BASE_URL}/api/works/change-orders`, { params: { project_id: projectId } }),
  createChangeOrder: (data) => axios.post(`${BASE_URL}/api/works/change-orders`, data),
  updateChangeOrder: (id, data) => axios.put(`${BASE_URL}/api/works/change-orders/${id}`, data),
  approveChangeOrder: (id) => axios.put(`${BASE_URL}/api/works/change-orders/${id}/approve`),

  // Winter Maintenance
  getWinterZones: () => axios.get(`${BASE_URL}/api/works/winter-zones`),
  getWinterEvents: (params) => axios.get(`${BASE_URL}/api/works/winter-events`, { params }),
  createWinterEvent: (data) => axios.post(`${BASE_URL}/api/works/winter-events`, data),
}