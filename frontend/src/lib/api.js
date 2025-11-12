// frontend/src/lib/api.js
// Simple API helper for the frontend. Uses VITE_API_BASE or defaults to http://<host>:8000
import { authHeader } from './auth'

export const API_BASE = (import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.replace(/\/$/, '')) || `${location.protocol}//${location.hostname}:8000`

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

  // Bases
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

export default api;