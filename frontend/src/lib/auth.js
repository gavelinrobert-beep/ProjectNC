
// src/lib/auth.js
const KEY_TOKEN = 'aegis_id_token'
const KEY_ROLE  = 'aegis_role'

export function setIdToken(token){ token ? localStorage.setItem(KEY_TOKEN, token) : localStorage.removeItem(KEY_TOKEN) }
export function getIdToken(){ return localStorage.getItem(KEY_TOKEN) }
export function authHeader(){
  const t = getIdToken()
  // fallback till dev-token om ingen token (kan tas bort när ni vill hårdkräva login)
  const tok = t || 'dev-token'
  return tok ? { Authorization: `Bearer ${tok}` } : {}
}

export function setUserRole(role){ role ? localStorage.setItem(KEY_ROLE, role) : localStorage.removeItem(KEY_ROLE) }
export function getUserRole(){ return localStorage.getItem(KEY_ROLE) || (getIdToken() ? 'admin' : 'anonymous') }
export function isAdmin(){ return getUserRole() === 'admin' }
export function logout(){ setIdToken(null); setUserRole(null) }
