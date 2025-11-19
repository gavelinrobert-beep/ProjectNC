/**
 * Reusable Quick Action Button component with icon, label, and loading state.
 * Used throughout the dashboard for common operations.
 */
import React from 'react';
import { motion } from 'framer-motion';

export default function QuickActionButton({ 
  icon, 
  label, 
  onClick, 
  loading = false, 
  disabled = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
}) {
  // Style variants
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      color: '#fff',
      hoverShadow: '0 8px 24px rgba(33, 150, 243, 0.4)',
    },
    secondary: {
      background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
      color: '#fff',
      hoverShadow: '0 8px 24px rgba(76, 175, 80, 0.4)',
    },
    warning: {
      background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      color: '#fff',
      hoverShadow: '0 8px 24px rgba(255, 152, 0, 0.4)',
    },
    danger: {
      background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
      color: '#fff',
      hoverShadow: '0 8px 24px rgba(244, 67, 54, 0.4)',
    },
    outline: {
      background: 'transparent',
      color: '#2196F3',
      border: '2px solid #2196F3',
      hoverShadow: '0 4px 16px rgba(33, 150, 243, 0.2)',
    },
  };

  // Size variants
  const sizes = {
    small: {
      padding: '8px 16px',
      fontSize: '0.85rem',
      iconSize: '1rem',
    },
    medium: {
      padding: '10px 20px',
      fontSize: '0.95rem',
      iconSize: '1.2rem',
    },
    large: {
      padding: '12px 24px',
      fontSize: '1rem',
      iconSize: '1.4rem',
    },
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.medium;

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: currentSize.padding,
    background: disabled ? '#333' : currentVariant.background,
    color: disabled ? '#666' : currentVariant.color,
    border: currentVariant.border || 'none',
    borderRadius: '8px',
    fontSize: currentSize.fontSize,
    fontWeight: '600',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    width: fullWidth ? '100%' : 'auto',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  };

  const iconStyle = {
    fontSize: currentSize.iconSize,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const spinnerStyle = {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <motion.button
        style={buttonStyle}
        onClick={handleClick}
        disabled={disabled || loading}
        whileHover={
          !disabled && !loading
            ? {
                scale: 1.02,
                y: -2,
                boxShadow: currentVariant.hoverShadow,
              }
            : {}
        }
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        transition={{ duration: 0.2 }}
      >
        {loading ? (
          <div style={spinnerStyle} />
        ) : (
          icon && <span style={iconStyle}>{icon}</span>
        )}
        <span>{label}</span>
      </motion.button>
    </>
  );
}
