import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      background: 'linear-gradient(135deg, #4A90E2 0%, #5B9BD5 100%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 2px 8px rgba(74, 144, 226, 0.15)',
      height: '64px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            transition: 'opacity 0.2s'
          }}
        >
          ☰
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🚛</span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#FFFFFF' }}>SYLON Systems</span>
        </div>
      </div>

      <span style={{
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: 500
      }}>
        Logistics & Fleet Management Platform
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{
          padding: '0.4rem 0.8rem',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#FFFFFF',
          fontWeight: 500
        }}>
          👤 {user?.email || user?.name || 'admin'}
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.4rem 0.8rem',
            background: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            color: '#4A90E2',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
        >
          🚪 Logout
        </button>
      </div>
    </header>
  )
}
