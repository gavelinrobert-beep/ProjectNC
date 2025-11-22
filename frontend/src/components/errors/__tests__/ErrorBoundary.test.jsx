import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ErrorBoundary from '../ErrorBoundary'

// Component that throws an error
function ThrowError() {
  throw new Error('Test error')
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })
})
