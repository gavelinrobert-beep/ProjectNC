import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'

export default function Header({ onToggleSidebar, isMobile }) {
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
      padding: isMobile ? '0 1rem' : '0 1.5rem',
      background: 'linear-gradient(135deg, #4A90E2 0%, #5B9BD5 100%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 2px 8px rgba(74, 144, 226, 0.15)',
      height: '64px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Hamburger menu - always visible on mobile, visible on desktop */}
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            transition: 'opacity 0.2s',
            minHeight: '44px',
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🚛</span>
          <span style={{ 
            fontWeight: 700, 
            fontSize: isMobile ? '0.95rem' : '1.1rem', 
            color: '#FFFFFF',
            display: isMobile ? 'none' : 'inline'
          }}>
            SYLON Systems
          </span>
        </div>
      </div>

      {/* Hide subtitle on mobile and tablet */}
      {!isMobile && (
        <span style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 500,
          display: window.innerWidth < 1280 ? 'none' : 'inline'
        }}>
          Logistics & Fleet Management Platform
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem' }}>
        {/* Hide user email on very small screens */}
        <span style={{
          padding: '0.4rem 0.8rem',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          fontSize: isMobile ? '0.8rem' : '0.9rem',
          color: '#FFFFFF',
          fontWeight: 500,
          display: window.innerWidth < 640 ? 'none' : 'inline'
        }}>
          👤 {user?.email || user?.name || 'admin'}
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: isMobile ? '0.5rem 0.6rem' : '0.4rem 0.8rem',
            background: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            color: '#4A90E2',
            cursor: 'pointer',
            fontSize: isMobile ? '0.8rem' : '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            minHeight: '44px',
            minWidth: isMobile ? '44px' : 'auto'
          }}
          aria-label="Logout"
        >
          {isMobile ? '🚪' : '🚪 Logout'}
        </button>
      </div>
    </header>
  )
}
