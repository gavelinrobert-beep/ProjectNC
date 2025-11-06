// Aegis/frontend/src/components/CollapsibleSection.jsx
import React, { useState } from 'react'
import { BRAND } from '../lib/constants'

export default function CollapsibleSection({ title, children, defaultOpen = false, count }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 6, marginBottom: 8, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '10px 12px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: open ? 'rgba(0,191,255,0.05)' : 'transparent',
          transition: 'background 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 'bold', color: BRAND.primary }}>{title}</span>
          {count !== undefined && (
            <span style={{
              background: BRAND.primary,
              color: '#000',
              padding: '2px 6px',
              borderRadius: 10,
              fontSize: 9,
              fontWeight: 'bold'
            }}>
              {count}
            </span>
          )}
        </div>
        <span style={{
          color: BRAND.primary,
          fontSize: 12,
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.3s',
          display: 'inline-block'
        }}>
          ▼
        </span>
      </div>
      {open && (
        <div style={{ padding: '8px 12px', maxHeight: 280, overflowY: 'auto', fontSize: 11 }}>
          {children}
        </div>
      )}
    </div>
  )
}