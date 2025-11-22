import axios from 'axios'
import { handleApiError } from '../utils/errorHandler'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // On 401 errors, force a hard redirect to login page to clear all state
    // Using window.location instead of React Router to ensure complete state reset
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else {
      // Handle other errors with user-friendly messages
      handleApiError(error)
    }
    return Promise.reject(error)
  }
)

export default apiClient
export { apiClient }
