import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SearchBar from '../SearchBar'

describe('SearchBar', () => {
  it('renders with placeholder', () => {
    const onSearch = vi.fn()
    render(<SearchBar placeholder="Search test..." onSearch={onSearch} />)
    
    const input = screen.getByPlaceholderText('Search test...')
    expect(input).toBeInTheDocument()
  })

  it('calls onSearch after debounce delay', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} debounceMs={100} />)
    
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test query' } })
    
    // Should not call immediately
    expect(onSearch).not.toHaveBeenCalled()
    
    // Should call after debounce delay
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test query')
    }, { timeout: 200 })
  })

  it('shows clear button when text is entered', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    
    const input = screen.getByPlaceholderText('Search...')
    
    // Clear button should not be visible initially
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    
    // Enter text
    fireEvent.change(input, { target: { value: 'test' } })
    
    // Clear button should now be visible
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('clears input when clear button is clicked', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} debounceMs={100} />)
    
    const input = screen.getByPlaceholderText('Search...')
    
    // Enter text
    fireEvent.change(input, { target: { value: 'test' } })
    expect(input.value).toBe('test')
    
    // Click clear button
    const clearButton = screen.getByRole('button')
    fireEvent.click(clearButton)
    
    // Input should be cleared
    expect(input.value).toBe('')
    
    // Should trigger search with empty string
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('')
    }, { timeout: 200 })
  })
})
