// src/lib/api.js
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
import { authHeader, getIdToken, setIdToken, setUserRole, getUserRole } from './auth'

async function send(method, path, body){
  const res = await fetch(API_BASE + path, {
    method,
    headers: { 'Content-Type':'application/json', ...authHeader() },
    body: body ? JSON.stringify(body) : undefined
  })
  const text = await res.text().catch(()=> '')
  if (!res.ok) {
    try {
      const j = JSON.parse(text)
      throw new Error(j.detail || j.message || `${res.status} ${res.statusText}`)
    } catch {
      throw new Error(text || `${res.status} ${res.statusText}`)
    }
  }
  try { return JSON.parse(text) } catch { return text }
}

export const api = {
  login: async (email, password) => {
    const res = await send('POST','/auth/login', { email, password })
    setIdToken(res.access_token)
    setUserRole(res.role)
    return res
  },
  alerts: ()=>send('GET','/alerts'),
  assets: ()=>send('GET','/assets'),
  geofences: ()=>send('GET','/geofences'),
  createGeofence: (g)=>send('POST','/geofences',g),
  updateGeofence: (id,g)=>send('PUT',`/geofences/${id}`,g),
  deleteGeofence: (id)=>send('DELETE',`/geofences/${id}`),
}

