const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiClient {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token')
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, config)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: response.statusText 
      }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }
    
    return response.json()
  }
  
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }
  
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
  
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
  
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
