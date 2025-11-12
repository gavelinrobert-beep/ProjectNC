
import React from 'react'
import InventoryManager from '../components/IntentoryManager'

export default function Inventory() {
  return (
    <div style={{ 
      padding: '2rem',
      background: 'linear-gradient(135deg, #0a0e14 0%, #1a1f2e 100%)',
      minHeight: '100vh'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          margin: 0,
          fontSize: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          📦 Inventory Management
        </h1>
      </div>

      <InventoryManager />
    </div>
  )
}
