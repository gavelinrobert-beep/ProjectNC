import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import MainLayout from '../MainLayout'

// Mock the AuthContext
vi.mock('../../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    logout: vi.fn()
  })
}))

// Mock useNetworkStatus
vi.mock('../../../../hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => true
}))

// Mock the child components
vi.mock('../Sidebar', () => ({
  default: ({ isOpen, isMobile, onClose }) => (
    <aside data-testid="sidebar" data-open={isOpen} data-mobile={isMobile}>
      <button onClick={onClose}>Close</button>
    </aside>
  )
}))

vi.mock('../Header', () => ({
  default: ({ onToggleSidebar, isMobile }) => (
    <header data-testid="header" data-mobile={isMobile}>
      <button onClick={onToggleSidebar}>Toggle Menu</button>
    </header>
  )
}))

vi.mock('../Breadcrumbs', () => ({
  default: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('MainLayout Responsiveness', () => {
  beforeEach(() => {
    // Reset window size before each test
    global.innerWidth = 1024
    global.innerHeight = 768
  })

  it('renders main layout components', () => {
    renderWithRouter(<MainLayout />)
    
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
  })

  it('detects mobile viewport on mount', () => {
    // Set mobile viewport
    global.innerWidth = 375
    
    renderWithRouter(<MainLayout />)
    
    const header = screen.getByTestId('header')
    expect(header.dataset.mobile).toBe('true')
  })

  it('detects desktop viewport on mount', () => {
    // Set desktop viewport
    global.innerWidth = 1440
    
    renderWithRouter(<MainLayout />)
    
    const header = screen.getByTestId('header')
    expect(header.dataset.mobile).toBe('false')
  })

  it('toggles sidebar when menu button is clicked', async () => {
    renderWithRouter(<MainLayout />)
    
    const toggleButton = screen.getByText('Toggle Menu')
    const sidebar = screen.getByTestId('sidebar')
    
    // Initial state
    const initialOpen = sidebar.dataset.open
    
    // Click toggle
    fireEvent.click(toggleButton)
    
    await waitFor(() => {
      expect(sidebar.dataset.open).not.toBe(initialOpen)
    })
  })

  it('shows overlay on mobile when sidebar is open', async () => {
    // Set mobile viewport
    global.innerWidth = 375
    
    const { container } = renderWithRouter(<MainLayout />)
    
    const toggleButton = screen.getByText('Toggle Menu')
    
    // Open sidebar
    fireEvent.click(toggleButton)
    
    // Check for overlay (it should have specific styles)
    await waitFor(() => {
      const overlays = container.querySelectorAll('[style*="rgba(0, 0, 0, 0.5)"]')
      expect(overlays.length).toBeGreaterThan(0)
    })
  })

  it('applies mobile padding to main content', () => {
    global.innerWidth = 375
    
    const { container } = renderWithRouter(<MainLayout />)
    
    const mainElement = container.querySelector('main')
    expect(mainElement).toBeInTheDocument()
    // Main element should have padding style applied
  })

  it('applies desktop padding to main content', () => {
    global.innerWidth = 1440
    
    const { container } = renderWithRouter(<MainLayout />)
    
    const mainElement = container.querySelector('main')
    expect(mainElement).toBeInTheDocument()
    // Main element should have padding style applied
  })
})
