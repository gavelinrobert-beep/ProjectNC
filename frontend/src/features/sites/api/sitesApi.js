import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const sitesApi = {
  // Depots
  getDepots: () => axios.get(`${BASE_URL}/api/sites/depots`),
  getDepot: (id) => axios.get(`${BASE_URL}/api/sites/depots/${id}`),
  createDepot: (data) => axios.post(`${BASE_URL}/api/sites/depots`, data),
  updateDepot: (id, data) => axios.put(`${BASE_URL}/api/sites/depots/${id}`, data),
  deleteDepot: (id) => axios.delete(`${BASE_URL}/api/sites/depots/${id}`),

  // Materials
  getMaterials: () => axios.get(`${BASE_URL}/api/sites/materials`),
  getMaterial: (id) => axios.get(`${BASE_URL}/api/sites/materials/${id}`),
  createMaterial: (data) => axios.post(`${BASE_URL}/api/sites/materials`, data),
  updateMaterial: (id, data) => axios.put(`${BASE_URL}/api/sites/materials/${id}`, data),

  // Inventory
  getInventory: (depotId) => axios.get(`${BASE_URL}/api/sites/inventory/${depotId}`),
  getAllInventory: () => axios.get(`${BASE_URL}/api/sites/inventory`),
  updateInventoryItem: (id, data) => axios.put(`${BASE_URL}/api/sites/inventory/${id}`, data),

  // Pickup Events
  getPickupEvents: (params) => axios.get(`${BASE_URL}/api/sites/pickup-events`, { params }),
  registerPickup: (data) => axios.post(`${BASE_URL}/api/sites/pickup`, data),
  getPickupEvent: (id) => axios.get(`${BASE_URL}/api/sites/pickup-events/${id}`),
}