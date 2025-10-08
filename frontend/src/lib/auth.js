
const KEY = 'aegis_id_token'
export function setIdToken(token) { if (token) localStorage.setItem(KEY, token); else localStorage.removeItem(KEY) }
export function getIdToken() { return localStorage.getItem(KEY) }
export function authHeader() { const t = getIdToken() || 'dev-token'; return t ? { Authorization: `Bearer ${t}` } : {} }
