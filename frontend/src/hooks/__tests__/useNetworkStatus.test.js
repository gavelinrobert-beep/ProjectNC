import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useNetworkStatus } from '../useNetworkStatus'
import toast from 'react-hot-toast'

vi.mock('react-hot-toast')

describe('useNetworkStatus', () => {
  let onlineHandler
  let offlineHandler

  beforeEach(() => {
    vi.clearAllMocks()
    onlineHandler = null
    offlineHandler = null
    
    // Mock addEventListener to capture handlers
    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'online') onlineHandler = handler
      if (event === 'offline') offlineHandler = handler
    })
    
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns initial online status', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    })
    
    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current).toBe(true)
  })

  it('shows success toast when connection is restored', async () => {
    const { result } = renderHook(() => useNetworkStatus())
    
    // Simulate going online
    if (onlineHandler) {
      onlineHandler()
    }
    
    await waitFor(() => {
      expect(result.current).toBe(true)
      expect(toast.success).toHaveBeenCalledWith('Connection restored')
    })
  })

  it('shows error toast when connection is lost', async () => {
    const { result } = renderHook(() => useNetworkStatus())
    
    // Simulate going offline
    if (offlineHandler) {
      offlineHandler()
    }
    
    await waitFor(() => {
      expect(result.current).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('No internet connection', { duration: 10000 })
    })
  })
})
