import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Breadcrumbs from './Breadcrumbs'
import { useNetworkStatus } from '../../../hooks/useNetworkStatus'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const isOnline = useNetworkStatus()

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      // On mobile, start with sidebar closed
      if (mobile && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleCloseSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateAreas: isMobile 
        ? '"topbar" "content"'
        : '"topbar topbar" "sidebar content"',
      gridTemplateColumns: isMobile 
        ? '1fr'
        : (sidebarOpen ? '250px 1fr' : '70px 1fr'),
      gridTemplateRows: '64px 1fr',
      height: '100vh',
      background: '#F5F7FA',
      color: '#2D3E50',
      transition: 'grid-template-columns 0.3s ease',
      position: 'relative'
    }}>
      {!isOnline && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#ff4444',
          color: 'white',
          padding: '0.5rem',
          textAlign: 'center',
          zIndex: 9999,
          fontWeight: 'bold'
        }}>
          ⚠️ No internet connection - Some features may not work
        </div>
      )}

      <div style={{ gridArea: 'topbar' }}>
        <Header onToggleSidebar={handleToggleSidebar} isMobile={isMobile} />
      </div>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30
          }}
          onClick={handleCloseSidebar}
        />
      )}

      <div style={{ gridArea: isMobile ? undefined : 'sidebar' }}>
        <Sidebar 
          isOpen={sidebarOpen} 
          toggle={handleToggleSidebar}
          onClose={handleCloseSidebar}
          isMobile={isMobile}
        />
      </div>

      <main style={{
        gridArea: 'content',
        padding: isMobile ? '1rem' : '2rem',
        overflowY: 'auto',
        background: '#F5F7FA'
      }}>
        <Breadcrumbs />
        <Outlet />
      </main>

      <style>{`
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #F5F7FA; }
        ::-webkit-scrollbar-thumb { background: #B8C5D0; border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: #4A90E2; }
      `}</style>
    </div>
  )
}
