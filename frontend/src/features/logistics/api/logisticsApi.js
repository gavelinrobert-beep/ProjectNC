import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const logisticsApi = {
  // Deliveries
  getDeliveries: () => axios.get(`${BASE_URL}/api/logistics/deliveries`),
  getDelivery: (id) => axios.get(`${BASE_URL}/api/logistics/deliveries/${id}`),
  createDelivery: (data) => axios.post(`${BASE_URL}/api/logistics/deliveries`, data),
  updateDelivery: (id, data) => axios.put(`${BASE_URL}/api/logistics/deliveries/${id}`, data),
  deleteDelivery: (id) => axios.delete(`${BASE_URL}/api/logistics/deliveries/${id}`),

  // Routes
  getRoutes: () => axios.get(`${BASE_URL}/api/logistics/routes`),
  getRoute: (id) => axios.get(`${BASE_URL}/api/logistics/routes/${id}`),
  createRoute: (data) => axios.post(`${BASE_URL}/api/logistics/routes`, data),
  updateRoute: (id, data) => axios.put(`${BASE_URL}/api/logistics/routes/${id}`, data),

  // Shipments
  getShipments: (params) => axios.get(`${BASE_URL}/api/logistics/shipments`, { params }),
  getShipment: (id) => axios.get(`${BASE_URL}/api/logistics/shipments/${id}`),
  createShipment: (data) => axios.post(`${BASE_URL}/api/logistics/shipments`, data),
  updateShipment: (id, data) => axios.put(`${BASE_URL}/api/logistics/shipments/${id}`, data),

  // Customers
  getCustomers: () => axios.get(`${BASE_URL}/api/logistics/customers`),
  getCustomer: (id) => axios.get(`${BASE_URL}/api/logistics/customers/${id}`),
  createCustomer: (data) => axios.post(`${BASE_URL}/api/logistics/customers`, data),
  updateCustomer: (id, data) => axios.put(`${BASE_URL}/api/logistics/customers/${id}`, data),
}