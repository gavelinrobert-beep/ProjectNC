// frontend/src/lib/api.js
// Simple API helper for the frontend. Uses VITE_API_BASE or defaults to http://<host>:8000
import { authHeader } from './auth'

export const API_BASE = ''

console.log('[API] Using API_BASE:', API_BASE)

async function send(method, path, body) {
  const url = API_BASE + path
  console.log(`[API] ${method} ${url}`)

  const headers = { 'Content-Type': 'application/json', ...authHeader() }
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const txt = await res.text().catch(() => '')

  if (!res.ok) {
    console.error(`[API] Error ${res.status}:`, txt)
    try {
      const j = JSON.parse(txt)
      throw new Error(j.detail || j.message || txt || `${res.status} ${res.statusText}`)
    } catch {
      throw new Error(txt || `${res.status} ${res.statusText}`)
    }
  }

  try {
    return JSON.parse(txt)
  } catch {
    return txt
  }
}

export const api = {
  // Authentication
  login: (e, p) => send('POST', '/api/login', { email: e, password: p }),

  // Alerts
  alerts: () => send('GET', '/api/alerts'),
  alertsCsv: () => fetch(API_BASE + '/api/alerts.csv', { headers: authHeader() }).then(r => r.text()),
  alertsPdf: () => fetch(API_BASE + '/api/alerts.pdf', { headers: authHeader() }),
  ackAlert: (id) => send('PUT', `/api/alerts/${id}/ack`),

  // Assets
  assets: () => send('GET', '/api/assets'),
  createAsset: (a) => send('POST', '/api/assets', a),
  updateAsset: (id, a) => send('PUT', `/api/assets/${id}`, a),
  deleteAsset: (id) => send('DELETE', `/api/assets/${id}`),

  // Facilities (primary API)
  facilities: () => send('GET', '/api/facilities'),
  createFacility: (f) => send('POST', '/api/facilities', f),
  deleteFacility: (id) => send('DELETE', `/api/facilities/${id}`),

  // Bases (deprecated - use facilities instead)
  bases: () => send('GET', '/api/bases'),
  createBase: (b) => send('POST', '/api/bases', b),
  deleteBase: (id) => send('DELETE', `/api/bases/${id}`),

  // Geofences
  geofences: () => send('GET', '/api/geofences'),
  createGeofence: (g) => send('POST', '/api/geofences', g),
  updateGeofence: (id, g) => send('PUT', `/api/geofences/${id}`, g),
  deleteGeofence: (id) => send('DELETE', `/api/geofences/${id}`),

  // Weather
  weather: (lat, lon) => send('GET', `/api/weather?lat=${lat}&lon=${lon}`),
  weatherByBase: (baseId) => send('GET', `/api/weather/${baseId}`),

  // Missions
  missions: () => send('GET', '/api/missions'),
  mission: (id) => send('GET', `/api/missions/${id}`),
  createMission: (data) => send('POST', '/api/missions', data),
  updateMission: (id, data) => send('PUT', `/api/missions/${id}`, data),
  deleteMission: (id) => send('DELETE', `/api/missions/${id}`),
  startMission: (id) => send('POST', `/api/missions/${id}/start`),
  completeMission: (id) => send('POST', `/api/missions/${id}/complete`),

  // Incidents
  incidents: (params) => {
    const query = new URLSearchParams(params).toString()
    return send('GET', `/api/incidents${query ? '?' + query : ''}`)
  },
  incident: (id) => send('GET', `/api/incidents/${id}`),
  createIncident: (data) => send('POST', '/api/incidents', data),
  updateIncident: (id, data) => send('PUT', `/api/incidents/${id}`, data),
  deleteIncident: (id) => send('DELETE', `/api/incidents/${id}`),

  // Metrics
  resourceStatus: () => send('GET', '/api/metrics/resource-status'),
  performanceMetrics: (period) => send('GET', `/api/metrics/performance?period=${period || '7days'}`),
  metricsSummary: () => send('GET', '/api/metrics/summary'),
  liveOperations: () => send('GET', '/api/metrics/live-operations'),

  // Drivers
  drivers: () => send('GET', '/api/drivers'),
  createDriver: (d) => send('POST', '/api/drivers', d),
  updateDriver: (id, d) => send('PUT', `/api/drivers/${id}`, d),
  deleteDriver: (id) => send('DELETE', `/api/drivers/${id}`),
}
// ============================================
// INVENTORY API
// ============================================

export const fetchInventoryItems = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const url = `${API_BASE}/api/inventory/items?${params}`;
  console.log('[API] GET', url);
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch inventory items');
  return response.json();
};

export const fetchInventoryItem = async (itemId) => {
  const url = `${API_BASE}/api/inventory/items/${itemId}`;
  console.log('[API] GET', url);
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch inventory item');
  return response.json();
};

export const createInventoryItem = async (item) => {
  const url = `${API_BASE}/api/inventory/items`;
  console.log('[API] POST', url);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error('Failed to create inventory item');
  return response.json();
};

export const updateInventoryItem = async (itemId, item) => {
  const url = `${API_BASE}/api/inventory/items/${itemId}`;
  console.log('[API] PUT', url);
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error('Failed to update inventory item');
  return response.json();
};

export const deleteInventoryItem = async (itemId) => {
  const url = `${API_BASE}/api/inventory/items/${itemId}`;
  console.log('[API] DELETE', url);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: authHeader(),
  });
  if (!response.ok) throw new Error('Failed to delete inventory item');
  return response.json();
};

export const createInventoryTransaction = async (transaction) => {
  const url = `${API_BASE}/api/inventory/transactions`;
  console.log('[API] POST', url);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error('Failed to create transaction');
  return response.json();
};

export const getInventoryTransactions = async (itemId = null, limit = 100) => {
  const params = new URLSearchParams({ limit });
  if (itemId) params.append('item_id', itemId);
  const url = `${API_BASE}/api/inventory/transactions?${params}`;
  console.log('[API] GET', url);
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
};

export const getInventoryAlerts = async () => {
  const url = `${API_BASE}/api/inventory/alerts`;
  console.log('[API] GET', url);
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch inventory alerts');
  return response.json();
};

// ============================================================================
// WORKS MODULE API - Construction/Contracting Operations
// ============================================================================

// Projects
export const getWorksProjects = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const url = `${API_BASE}/api/v1/works/projects?${params}`;
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

export const getWorksProject = async (projectId) => {
  const url = `${API_BASE}/api/v1/works/projects/${projectId}`;
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch project');
  return response.json();
};

export const createWorksProject = async (project) => {
  const url = `${API_BASE}/api/v1/works/projects`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(project),
  });
  if (!response.ok) throw new Error('Failed to create project');
  return response.json();
};

export const updateWorksProject = async (projectId, project) => {
  const url = `${API_BASE}/api/v1/works/projects/${projectId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(project),
  });
  if (!response.ok) throw new Error('Failed to update project');
  return response.json();
};

export const deleteWorksProject = async (projectId) => {
  const url = `${API_BASE}/api/v1/works/projects/${projectId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: authHeader(),
  });
  if (!response.ok) throw new Error('Failed to delete project');
};

export const getWorksProjectStatistics = async (projectId) => {
  const url = `${API_BASE}/api/v1/works/projects/${projectId}/statistics`;
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch project statistics');
  return response.json();
};

// Work Orders
export const getWorksWorkOrders = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const url = `${API_BASE}/api/v1/works/work-orders?${params}`;
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch work orders');
  return response.json();
};

export const getWorksWorkOrder = async (workOrderId) => {
  const url = `${API_BASE}/api/v1/works/work-orders/${workOrderId}`;
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch work order');
  return response.json();
};

export const createWorksWorkOrder = async (workOrder) => {
  const url = `${API_BASE}/api/v1/works/work-orders`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(workOrder),
  });
  if (!response.ok) throw new Error('Failed to create work order');
  return response.json();
};

export const updateWorksWorkOrder = async (workOrderId, workOrder) => {
  const url = `${API_BASE}/api/v1/works/work-orders/${workOrderId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(workOrder),
  });
  if (!response.ok) throw new Error('Failed to update work order');
  return response.json();
};

export const deleteWorksWorkOrder = async (workOrderId) => {
  const url = `${API_BASE}/api/v1/works/work-orders/${workOrderId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: authHeader(),
  });
  if (!response.ok) throw new Error('Failed to delete work order');
};

export const startWorksWorkOrder = async (workOrderId) => {
  const url = `${API_BASE}/api/v1/works/work-orders/${workOrderId}/start`;
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeader(),
  });
  if (!response.ok) throw new Error('Failed to start work order');
  return response.json();
};

export const completeWorksWorkOrder = async (workOrderId) => {
  const url = `${API_BASE}/api/v1/works/work-orders/${workOrderId}/complete`;
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeader(),
  });
  if (!response.ok) throw new Error('Failed to complete work order');
  return response.json();
};

// Machine Hours
export const getWorksMachineHours = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const url = `${API_BASE}/api/v1/works/machine-hours?${params}`;
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch machine hours');
  return response.json();
};

export const getWorksMachineHoursById = async (machineHoursId) => {
  const url = `${API_BASE}/api/v1/works/machine-hours/${machineHoursId}`;
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch machine hours');
  return response.json();
};

export const createWorksMachineHours = async (machineHours) => {
  const url = `${API_BASE}/api/v1/works/machine-hours`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(machineHours),
  });
  if (!response.ok) throw new Error('Failed to create machine hours entry');
  return response.json();
};

export const updateWorksMachineHours = async (machineHoursId, machineHours) => {
  const url = `${API_BASE}/api/v1/works/machine-hours/${machineHoursId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(machineHours),
  });
  if (!response.ok) throw new Error('Failed to update machine hours entry');
  return response.json();
};

export const getWorksProjectMachineHours = async (projectId) => {
  const url = `${API_BASE}/api/v1/works/projects/${projectId}/machine-hours`;
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch project machine hours');
  return response.json();
};

// Change Orders (ÄTA)
export const getWorksChangeOrders = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const url = `${API_BASE}/api/v1/works/change-orders?${params}`;
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch change orders');
  return response.json();
};

export const getWorksChangeOrder = async (changeOrderId) => {
  const url = `${API_BASE}/api/v1/works/change-orders/${changeOrderId}`;
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch change order');
  return response.json();
};

export const createWorksChangeOrder = async (changeOrder) => {
  const url = `${API_BASE}/api/v1/works/change-orders`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(changeOrder),
  });
  if (!response.ok) throw new Error('Failed to create change order');
  return response.json();
};

export const updateWorksChangeOrder = async (changeOrderId, changeOrder) => {
  const url = `${API_BASE}/api/v1/works/change-orders/${changeOrderId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(changeOrder),
  });
  if (!response.ok) throw new Error('Failed to update change order');
  return response.json();
};

export const submitWorksChangeOrder = async (changeOrderId) => {
  const url = `${API_BASE}/api/v1/works/change-orders/${changeOrderId}/submit`;
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeader(),
  });
  if (!response.ok) throw new Error('Failed to submit change order');
  return response.json();
};

export const approveWorksChangeOrder = async (changeOrderId) => {
  const url = `${API_BASE}/api/v1/works/change-orders/${changeOrderId}/approve`;
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeader(),
  });
  if (!response.ok) throw new Error('Failed to approve change order');
  return response.json();
};

export const rejectWorksChangeOrder = async (changeOrderId) => {
  const url = `${API_BASE}/api/v1/works/change-orders/${changeOrderId}/reject`;
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeader(),
  });
  if (!response.ok) throw new Error('Failed to reject change order');
  return response.json();
};

// Winter Maintenance
export const getWorksWinterMaintenance = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const url = `${API_BASE}/api/v1/works/winter-maintenance?${params}`;
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch winter maintenance entries');
  return response.json();
};

export const getWorksWinterMaintenanceById = async (winterMaintenanceId) => {
  const url = `${API_BASE}/api/v1/works/winter-maintenance/${winterMaintenanceId}`;
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch winter maintenance entry');
  return response.json();
};

export const createWorksWinterMaintenance = async (winterMaintenance) => {
  const url = `${API_BASE}/api/v1/works/winter-maintenance`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(winterMaintenance),
  });
  if (!response.ok) throw new Error('Failed to create winter maintenance entry');
  return response.json();
};

export const updateWorksWinterMaintenance = async (winterMaintenanceId, winterMaintenance) => {
  const url = `${API_BASE}/api/v1/works/winter-maintenance/${winterMaintenanceId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(winterMaintenance),
  });
  if (!response.ok) throw new Error('Failed to update winter maintenance entry');
  return response.json();
};

// Documentation
export const getWorksDocumentation = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const url = `${API_BASE}/api/v1/works/documentation?${params}`;
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch documentation');
  return response.json();
};

export const getWorksDocumentationById = async (documentationId) => {
  const url = `${API_BASE}/api/v1/works/documentation/${documentationId}`;
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) throw new Error('Failed to fetch document');
  return response.json();
};

export const uploadWorksDocumentation = async (documentation) => {
  const url = `${API_BASE}/api/v1/works/documentation`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(documentation),
  });
  if (!response.ok) throw new Error('Failed to upload document');
  return response.json();
};

export const deleteWorksDocumentation = async (documentationId) => {
  const url = `${API_BASE}/api/v1/works/documentation/${documentationId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: authHeader(),
  });
  if (!response.ok) throw new Error('Failed to delete document');
};

export default api;