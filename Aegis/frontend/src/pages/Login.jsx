import React, { useState } from 'react'
import { api } from '../lib/api'
import { setIdToken } from '../lib/auth'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@aegis.local')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    const result = await api.login(email, password)
    const token = result.token || result.access_token
    if (token) {
      setIdToken(token)
      onLogin()
    } else {
      setError('No token received')
    }
  } catch (err) {
    setError(err.message || 'Login failed')
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e14 0%, #1a1f2e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#e0e0e0'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
        border: '2px solid #2d3748',
        borderRadius: '16px',
        padding: '3rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>AEGIS LIGHT</h1>
          <p style={{ color: '#718096', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
            Civil Logistics & Situational Awareness
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#a0aec0' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#0a0e14',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                color: '#e0e0e0',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#a0aec0' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#0a0e14',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                color: '#e0e0e0',
                fontSize: '1rem'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              background: 'rgba(245, 101, 101, 0.15)',
              border: '1px solid #fc8181',
              borderRadius: '8px',
              color: '#fc8181',
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: loading ? '#2d3748' : '#63b3ed',
              color: loading ? '#718096' : '#0a0e14',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Logging in...' : '🔐 Login'}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(99, 179, 237, 0.1)',
          border: '1px solid #63b3ed',
          borderRadius: '8px',
          fontSize: '0.85rem'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#63b3ed' }}>Demo Credentials:</div>
          <div>Email: admin@aegis.local</div>
          <div>Password: admin123</div>
        </div>
      </div>
    </div>
  )
}