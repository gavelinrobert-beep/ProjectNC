import apiClient from './apiClient'

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth/login', { email, password })
    return response.data
  },

  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout')
    } catch (error) {
      console.warn('Logout API call failed:', error)
    }
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me')
    return response.data
  }
}
