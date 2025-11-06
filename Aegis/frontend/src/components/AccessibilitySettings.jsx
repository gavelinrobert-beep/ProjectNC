// Create new file: Aegis/frontend/src/components/AccessibilitySettings.jsx
import React, { useState, useEffect } from 'react'

const COLORS = {
  primary: '#1976D2',
  success: '#388E3C',
  warning: '#F57C00',
  danger: '#D32F2F',
  card: '#1a1a1a',
  border: '#2a2a2a',
  text: '#e0e0e0',
  textMuted: '#999',
}

const AccessibilitySettings = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('aegis-accessibility')
    return saved ? JSON.parse(saved) : {
      highContrast: false,
      fontSize: 'normal', // small, normal, large
      reducedMotion: false,
      colorBlindMode: 'none' // none, protanopia, deuteranopia, tritanopia
    }
  })

  useEffect(() => {
    // Apply settings to document root
    const root = document.documentElement

    // High contrast
    if (settings.highContrast) {
      root.style.setProperty('--bg-card', '#000000')
      root.style.setProperty('--bg-border', '#ffffff')
      root.style.setProperty('--text-color', '#ffffff')
      root.style.setProperty('--contrast-mode', 'high')
    } else {
      root.style.setProperty('--bg-card', '#1a1a1a')
      root.style.setProperty('--bg-border', '#2a2a2a')
      root.style.setProperty('--text-color', '#e0e0e0')
      root.style.setProperty('--contrast-mode', 'normal')
    }

    // Font size
    const fontSizes = {
      small: '0.9',
      normal: '1',
      large: '1.15'
    }
    root.style.setProperty('--font-scale', fontSizes[settings.fontSize])

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-speed', '0s')
    } else {
      root.style.setProperty('--animation-speed', '0.3s')
    }

    // Color blind modes
    if (settings.colorBlindMode !== 'none') {
      root.setAttribute('data-colorblind', settings.colorBlindMode)
    } else {
      root.removeAttribute('data-colorblind')
    }

    // Save to localStorage
    localStorage.setItem('aegis-accessibility', JSON.stringify(settings))
  }, [settings])

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings({
      highContrast: false,
      fontSize: 'normal',
      reducedMotion: false,
      colorBlindMode: 'none'
    })
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: COLORS.primary,
          border: `2px solid ${COLORS.border}`,
          color: '#fff',
          fontSize: 20,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
        title="Accessibility Settings"
      >
        ⚙️
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            left: 20,
            width: 320,
            background: COLORS.card,
            border: `2px solid ${COLORS.primary}`,
            borderRadius: 8,
            padding: 16,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            zIndex: 10000,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: `1px solid ${COLORS.border}`
          }}>
            <h3 style={{
              margin: 0,
              color: COLORS.text,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}>
              ACCESSIBILITY SETTINGS
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: COLORS.textMuted,
                fontSize: 20,
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>

          {/* High Contrast */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              padding: '8px 0',
              color: COLORS.text,
              fontSize: 12
            }}>
              <span>
                <strong>High Contrast Mode</strong>
                <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>
                  Increases visibility in bright environments
                </div>
              </span>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSetting('highContrast', e.target.checked)}
                style={{
                  width: 18,
                  height: 18,
                  cursor: 'pointer'
                }}
              />
            </label>
          </div>

          {/* Font Size */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: COLORS.text, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
              Font Size
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['small', 'normal', 'large'].map(size => (
                <button
                  key={size}
                  onClick={() => updateSetting('fontSize', size)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: settings.fontSize === size ? COLORS.primary : 'transparent',
                    border: `1px solid ${settings.fontSize === size ? COLORS.primary : COLORS.border}`,
                    borderRadius: 4,
                    color: settings.fontSize === size ? '#fff' : COLORS.text,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              padding: '8px 0',
              color: COLORS.text,
              fontSize: 12
            }}>
              <span>
                <strong>Reduce Animations</strong>
                <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>
                  Minimizes motion for accessibility
                </div>
              </span>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                style={{
                  width: 18,
                  height: 18,
                  cursor: 'pointer'
                }}
              />
            </label>
          </div>

          {/* Color Blind Mode */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: COLORS.text, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
              Color Vision Mode
            </label>
            <select
              value={settings.colorBlindMode}
              onChange={(e) => updateSetting('colorBlindMode', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 4,
                color: COLORS.text,
                fontSize: 11,
                cursor: 'pointer'
              }}
            >
              <option value="none">Normal Vision</option>
              <option value="protanopia">Protanopia (Red-Blind)</option>
              <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
              <option value="tritanopia">Tritanopia (Blue-Blind)</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetSettings}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 4,
              color: COLORS.textMuted,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = COLORS.border
              e.currentTarget.style.color = COLORS.text
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = COLORS.textMuted
            }}
          >
            Reset to Defaults
          </button>
        </div>
      )}

      {/* Global CSS for accessibility features */}
      <style>{`
        :root {
          --bg-card: #1a1a1a;
          --bg-border: #2a2a2a;
          --text-color: #e0e0e0;
          --font-scale: 1;
          --animation-speed: 0.3s;
          --contrast-mode: normal;
        }

        * {
          font-size: calc(1rem * var(--font-scale)) !important;
          transition-duration: var(--animation-speed) !important;
        }

        /* High contrast overrides */
        [data-contrast="high"] {
          filter: contrast(1.2) brightness(1.1);
        }

        /* Color blind filters */
        [data-colorblind="protanopia"] {
          filter: url('#protanopia-filter');
        }
        [data-colorblind="deuteranopia"] {
          filter: url('#deuteranopia-filter');
        }
        [data-colorblind="tritanopia"] {
          filter: url('#tritanopia-filter');
        }

        /* Keyboard focus indicators */
        *:focus-visible {
          outline: 3px solid ${COLORS.primary} !important;
          outline-offset: 2px !important;
        }

        /* Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* SVG Filters for color blindness simulation */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          {/* Protanopia (Red-Blind) */}
          <filter id="protanopia-filter">
            <feColorMatrix type="matrix" values="
              0.567, 0.433, 0,     0, 0
              0.558, 0.442, 0,     0, 0
              0,     0.242, 0.758, 0, 0
              0,     0,     0,     1, 0
            "/>
          </filter>

          {/* Deuteranopia (Green-Blind) */}
          <filter id="deuteranopia-filter">
            <feColorMatrix type="matrix" values="
              0.625, 0.375, 0,   0, 0
              0.7,   0.3,   0,   0, 0
              0,     0.3,   0.7, 0, 0
              0,     0,     0,   1, 0
            "/>
          </filter>

          {/* Tritanopia (Blue-Blind) */}
          <filter id="tritanopia-filter">
            <feColorMatrix type="matrix" values="
              0.95, 0.05,  0,     0, 0
              0,    0.433, 0.567, 0, 0
              0,    0.475, 0.525, 0, 0
              0,    0,     0,     1, 0
            "/>
          </filter>
        </defs>
      </svg>
    </>
  )
}

export default AccessibilitySettings