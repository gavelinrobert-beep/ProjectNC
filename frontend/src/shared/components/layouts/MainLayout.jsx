import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div style={{
      display: 'grid',
      gridTemplateAreas: '"topbar topbar" "sidebar content"',
      gridTemplateColumns: sidebarOpen ? '250px 1fr' : '70px 1fr',
      gridTemplateRows: '64px 1fr',
      height: '100vh',
      background: '#F5F7FA',
      color: '#2D3E50',
      transition: 'grid-template-columns 0.3s ease'
    }}>
      <div style={{ gridArea: 'topbar' }}>
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      <div style={{ gridArea: 'sidebar' }}>
        <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      <main style={{
        gridArea: 'content',
        padding: '2rem',
        overflowY: 'auto',
        background: '#F5F7FA'
      }}>
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
