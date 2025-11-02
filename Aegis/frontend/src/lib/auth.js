const KEY_TOKEN = 'aegis_id_token';
const KEY_ROLE = 'aegis_role';

// helper: base64 decode for JWT segments (browser-friendly)
function _b64DecodeUnicode(str) {
  // Replace URL-safe characters and pad
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  try {
    // atob returns a binary string; decodeURIComponent converts percent escapes to UTF-8
    return decodeURIComponent(Array.prototype.map.call(atob(str), c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
  } catch (e) {
    return null;
  }
}

// Decode JWT payload without verification (useful for extracting claims client-side)
export function decodeToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const payload = _b64DecodeUnicode(parts[1]);
  if (!payload) return null;
  try {
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
}

export function setIdToken(t) {
  if (t) {
    localStorage.setItem(KEY_TOKEN, t);
    // Try to extract role from token and store it so UI can use it
    const payload = decodeToken(t);
    if (payload && payload.role) {
      setUserRole(payload.role);
    }
  } else {
    localStorage.removeItem(KEY_TOKEN);
  }
}

export function getIdToken() {
  return localStorage.getItem(KEY_TOKEN);
}

export function setUserRole(r) {
  r ? localStorage.setItem(KEY_ROLE, r) : localStorage.removeItem(KEY_ROLE);
}

export function getUserRole() {
  const role = localStorage.getItem(KEY_ROLE);
  if (!role && !getIdToken()) return 'anonymous';
  return role || 'user';
}

export function isAdmin() {
  return getUserRole() === 'admin';
}

export function logout() {
  setIdToken(null);
  setUserRole(null);
}

export function authHeader() {
  const t = getIdToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}