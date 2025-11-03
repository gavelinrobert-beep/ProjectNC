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
  login: (e, p) => send('POST', '/login', { email: e, password: p }),

  // Alerts
  alerts: () => send('GET', '/alerts'),
  alertsCsv: () => fetch(API_BASE + '/alerts.csv', { headers: authHeader() }).then(r => r.text()),
  alertsPdf: () => fetch(API_BASE + '/alerts.pdf', { headers: authHeader() }),
  ackAlert: (id) => send('PUT', `/alerts/${id}/ack`),

  // Assets
  assets: () => send('GET', '/assets'),
  createAsset: (a) => send('POST', '/assets', a),
  updateAsset: (id, a) => send('PUT', `/assets/${id}`, a),
  deleteAsset: (id) => send('DELETE', `/assets/${id}`),

  // Bases
  bases: () => send('GET', '/bases'),
  createBase: (b) => send('POST', '/bases', b),
  deleteBase: (id) => send('DELETE', `/bases/${id}`),

  // Geofences
  geofences: () => send('GET', '/geofences'),
  createGeofence: (g) => send('POST', '/geofences', g),
  updateGeofence: (id, g) => send('PUT', `/geofences/${id}`, g),
  deleteGeofence: (id) => send('DELETE', `/geofences/${id}`),

  // Weather
  weather: (lat, lon) => send('GET', `/weather?lat=${lat}&lon=${lon}`),
  weatherByBase: (baseId) => send('GET', `/weather/${baseId}`),

  // Missions (NEW)
  missions: () => send('GET', '/missions'),
  mission: (id) => send('GET', `/missions/${id}`),
  createMission: (data) => send('POST', '/missions', data),
  updateMission: (id, data) => send('PUT', `/missions/${id}`, data),
  deleteMission: (id) => send('DELETE', `/missions/${id}`),
  startMission: (id) => send('POST', `/missions/${id}/start`),
  completeMission: (id) => send('POST', `/missions/${id}/complete`),
}

export default api
