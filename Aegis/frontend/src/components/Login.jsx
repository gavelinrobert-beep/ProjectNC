import React, { useState } from 'react'
import { api } from '../lib/api'
import { setIdToken, setUserRole } from '../lib/auth'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await api.login(email, password)
      console.log('Login response:', result)

      // Safe extraction of token from common shapes:
      // { token: '...', access_token: '...', id_token: '...', jwt: '...' }
      // or sometimes nested: { token: { access_token: '...' } }
      let token = null

      if (!result) {
        throw new Error('Empty login response')
      }

      if (typeof result === 'string') {
        // server might return raw token string
        token = result
      } else if (result.token && typeof result.token === 'string') {
        token = result.token
      } else if (result.access_token && typeof result.access_token === 'string') {
        token = result.access_token
      } else if (result.id_token && typeof result.id_token === 'string') {
        token = result.id_token
      } else if (result.jwt && typeof result.jwt === 'string') {
        token = result.jwt
      } else if (result.token && typeof result.token === 'object' && result.token.access_token) {
        token = result.token.access_token
      } else if (result.data && (result.data.token || result.data.access_token || result.data.id_token)) {
        token = result.data.token || result.data.access_token || result.data.id_token
      }

      // Last-ditch: try to stringify and detect JWT pattern (xxx.yyy.zzz)
      if (!token) {
        const maybe = JSON.stringify(result)
        const jwtMatch = maybe.match(/[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/)
        if (jwtMatch) token = jwtMatch[0]
      }

      if (!token) {
        console.error('Could not find token in login response:', result)
        setError('Login succeeded but no token returned. See console for details.')
        setLoading(false)
        return
      }

      // Store the raw token
      setIdToken(token)

      // Optionally set role if server returned it
      const role = result.role || result.user?.role || 'user'
      setUserRole(role)

      // Notify parent or navigate
      if (typeof onLogin === 'function') onLogin()
      else window.location.reload()
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '20px auto' }}>
      <h3>Logga in</h3>
      {error && <div style={{ color: '#f33', marginBottom: 8 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <input
            required
            placeholder="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            type="email"
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input
            required
            placeholder="Lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            type="password"
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" type="submit" disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </div>
      </form>
    </div>
  )
}