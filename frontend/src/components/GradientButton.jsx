// Aegis/frontend/src/components/GradientButton.jsx
import React from 'react'
import { BRAND } from '../lib/constants'

export default function GradientButton({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  icon,
  size = 'medium',
  style = {}
}) {
  const [isHovered, setIsHovered] = React.useState(false)

  const variants = {
    primary: BRAND.gradientPrimary,
    success: BRAND.gradientSuccess,
    danger: BRAND.gradientDanger,
  }

  const sizes = {
    small: { padding: '6px 12px', fontSize: 11 },
    medium: { padding: '10px 20px', fontSize: 13 },
    large: { padding: '14px 28px', fontSize: 15 }
  }

  const buttonStyle = {
    background: variants[variant],
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 600,
    letterSpacing: '0.5px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : isHovered ? 0.9 : 1,
    transform: isHovered && !disabled ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: isHovered && !disabled ? BRAND.shadowLg : BRAND.shadowMd,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    ...sizes[size],
    ...style
  }

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}