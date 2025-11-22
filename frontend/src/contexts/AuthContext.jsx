import React, { createContext, useState, useEffect, useContext } from 'react'
import { authService } from '../shared/services/authService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          setToken(storedToken)
          const userData = await authService.getCurrentUser()
          if (userData && (userData.email || userData.id)) {
            setUser(userData)
          } else {
            localStorage.removeItem('token')
            setToken(null)
            setUser(null)
          }
        } catch (error) {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password)
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Invalid credentials' }
    }
  }

  const logout = async () => {
    await authService.logout()
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
