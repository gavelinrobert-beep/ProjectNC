const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
import { authHeader } from './auth'
async function get(path){ const r = await fetch(API_BASE + path, { headers: { ...authHeader() } }); if(!r.ok) throw new Error(`GET ${path} -> ${r.status}`); return r.json() }
async function send(method, path, body){
  const r = await fetch(API_BASE + path, { method, headers: { 'Content-Type':'application/json', ...authHeader() }, body: body ? JSON.stringify(body) : undefined })
  if(!r.ok) throw new Error(`${method} ${path} -> ${r.status}`)
  return r.headers.get('content-type')?.includes('application/json') ? r.json() : await r.text()
}
export const api = {
  alerts: ()=>get('/alerts'),
  assets: ()=>get('/assets'),
  trail: (id,q='')=>get(`/assets/${id}/trail${q?`?${q}`:''}`),
  geofences: ()=>get('/geofences'),
  createGeofence: (g)=>send('POST','/geofences',g),
  updateGeofence: (id,g)=>send('PUT',`/geofences/${id}`,g),
  deleteGeofence: (id)=>send('DELETE',`/geofences/${id}`),
}
