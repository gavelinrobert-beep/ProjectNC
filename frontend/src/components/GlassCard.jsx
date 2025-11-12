// Aegis/frontend/src/components/GlassCard.jsx
import React from 'react'
import { BRAND } from '../lib/constants'

export default function GlassCard({
  children,
  hover = true,
  glow = false,
  padding = 16,
  style = {},
  onClick,
  className = ''
}) {
  const [isHovered, setIsHovered] = React.useState(false)

  const cardStyle = {
    background: isHovered && hover ? BRAND.bgCardHover : BRAND.bgCard,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', // Safari support
    border: `1px solid ${isHovered && hover ? BRAND.borderHover : BRAND.border}`,
    borderRadius: 12,
    padding: padding,
    boxShadow: glow && isHovered ? BRAND.shadowGlow : BRAND.shadowMd,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: onClick ? 'pointer' : 'default',
    ...style
  }

  return (
    <div
      className={className}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  )
}